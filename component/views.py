from django.shortcuts import render
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Component, LEVEL_CHOICES
from .forms import ComponentCreateForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from system.models import System
from work_plan.models import Work_Plan
from maintenances.models import Maintenance_Info

@login_required
def component(request):
    components = Component.objects.prefetch_related('observations').all()
    component_create_form = ComponentCreateForm()
    systems = System.objects.filter(component__isnull=False).distinct()
    all_systems = System.objects.all()
    grouped_components = []
    for system in systems:
        components = system.component_set.all().prefetch_related('observations')
        grouped_components.append({
            'system': system,
            'components': components,
            'count': components.count()
        })
    return render(request, 'component.html', {
        'components': components,
        'grouped_components': grouped_components,
        'component_create_form': component_create_form,
        'systems': systems,
        'all_systems': all_systems,
        'LEVEL_CHOICES': LEVEL_CHOICES,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })

@login_required
def get_components_by_system(request, system_id):
    components = Component.objects.filter(fk_system_id=system_id).values('id', 'component')
    return JsonResponse({'components': list(components)})

@login_required
def component_create(request):
    if request.method == "POST":
        component_create_form = ComponentCreateForm(request.POST)
        component_name = request.POST.get('component')
        fk_system_id = request.POST.get('fk_system')

        if Component.objects.filter(component__iexact=component_name, fk_system_id=fk_system_id).exists():
            return JsonResponse({'status': 'error', 'message': 'Ya existe un componente con este nombre en el sistema seleccionado.'})
        
        if component_create_form.is_valid():
            try:
                component = Component(
                    component=component_create_form.cleaned_data['component'],
                    category=component_create_form.cleaned_data['category'],
                    status=component_create_form.cleaned_data['status'],
                    utility_life=component_create_form.cleaned_data['utility_life'],
                    fk_system=component_create_form.cleaned_data['fk_system'],
                )
                component.save()
               
                return JsonResponse({'status': 'success', 'message': 'El componente se ha guardado correctamente.'})
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
    return JsonResponse({'status': 'error', 'message': 'Datos inválidos.'})

@login_required
def component_delete(request, component_id):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            component = get_object_or_404(Component, id=component_id)
            
            if Work_Plan.objects.filter(fk_component_id=component.id).exists():
                return JsonResponse({
                    'status': 'error',
                    'message': 'No se puede eliminar el componente porque está asociado a un plan de trabajo.'
                }, status=400)
            
            #REVISAR
            maintenances_component_fk = Maintenance_Info.objects.filter(fk_component=component).exists()
            if maintenances_component_fk:
                return JsonResponse({
                    'status': 'error',
                    'message': 'No se puede eliminar la especialidad porque está asociada a uno o varios mantenimientos.'
                }, status=400)
            
            component.delete()
            return JsonResponse({'status': 'success', 'message': 'El componente ha sido eliminado correctamente.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Error al eliminar el componente: {str(e)}'})
    return JsonResponse({'status': 'error', 'message': 'Solicitud inválida.'})

@login_required
def get_component(request, component_id):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            component = Component.objects.get(id=component_id)
            observations_qs = component.observations.order_by('id').select_related('fk_task')
            observations = []
            for obs in observations_qs:
                if obs.fk_task:
                    requirements = [req.material_name for req in obs.fk_task.requirements.all()]
                    end_date = obs.fk_task.end_date.strftime('%d-%m-%Y %H:%M')
                else:
                    requirements = []
                    end_date = ""
                observations.append({
                    'observation': obs.observation,
                    'requirements': requirements,
                    'end_date': end_date,
                    'type': obs.type,
                })
            return JsonResponse({
                'status': 'success',
                'component': {
                    'id': component.id,
                    'fk_system': component.fk_system.id,
                    'component': component.component,
                    'category': component.category,
                    'status': component.status,
                    'utility_life': component.utility_life,
                    'observations': observations
                }
            })
        except Component.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Componente no encontrado.'})
    return JsonResponse({'status': 'error', 'message': 'Solicitud inválida.'})


@csrf_exempt
@login_required
def component_update(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            component_id = request.POST.get('component_id')
            component = Component.objects.get(id=component_id)

            component.fk_system_id = request.POST.get('fk_system')
            component.component = request.POST.get('component')
            component.category = request.POST.get('category')
            component.status = request.POST.get('status')
            component.utility_life = request.POST.get('utility_life')

            component_name = component.component
            fk_system_id = component.fk_system_id

            if Component.objects.filter(component__iexact=component_name, fk_system_id=fk_system_id).exclude(id=component_id).exists():
                return JsonResponse({'status': 'error', 'message': 'Ya existe un componente con este nombre en el sistema seleccionado.'})

            component.save()

            return JsonResponse({'status': 'success', 'message': 'El componente se ha actualizado correctamente.'})
        except Component.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Componente no encontrado.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
    return JsonResponse({'status': 'error', 'message': 'Solicitud inválida.'})

@login_required
def get_systems_and_levels(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        systems = list(System.objects.values('id', 'acronym'))
        levels = [{'value': value, 'label': label} for value, label in LEVEL_CHOICES]
        return JsonResponse({'systems': systems, 'levels': levels})
    return JsonResponse({'status': 'error', 'message': 'Solicitud inválida.'})

@login_required
def get_components_by_system_detail(request, system_id):
    components = Component.objects.filter(fk_system_id=system_id).select_related('fk_system').prefetch_related('observations')
    
    components_data = []
    for component in components:
        obs_programadas = component.observations.filter(type=0).count()
        obs_no_programadas = component.observations.filter(type=1).count()
        components_data.append({
            'id': component.id,
            'component': component.component,
            'category_display': component.get_category_display(),
            'status': component.status,
            'utility_life': component.utility_life,
            'obs_programadas': obs_programadas,
            'obs_no_programadas': obs_no_programadas,
        })
    
    return JsonResponse({
        'system': {
            'id': components[0].fk_system.id if components else None,
            'acronym': components[0].fk_system.acronym if components else None
        },
        'components': components_data
    })