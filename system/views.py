from django.shortcuts import render
from . models import System
from . forms import SystemCreate
from django.http.response import JsonResponse
from django.contrib.auth.decorators import login_required
from system.models import Group
from django.db.models import Q, Count, Prefetch, Min
from component.models import Component
import re

def get_system_observations(request, system_id):
    try:
        system = System.objects.get(id=system_id)
        components = system.component_set.all()
        observations = []

        for component in components:
            # Traer todas las observaciones de este componente
            component_observations = component.observations.select_related('fk_task').order_by('id')
            for obs in component_observations:
                # Obtener datos de la tarea asociada
                if obs.fk_task:
                    # Obtener los nombres de los requerimientos
                    requirements_qs = obs.fk_task.requirements.all()
                    requirements = ", ".join([req.material_name for req in requirements_qs])
                else:
                    requirements = ""
                end_date = obs.fk_task.end_date.strftime('%Y-%m-%d %H:%M') if obs.fk_task else 'Sin fecha'
                tipo = "Programada" if obs.type == 0 else "No Programada"
                obs_text = f"Observación - Requisito ({requirements}) - {tipo}: {obs.observation or ''}"
                observations.append({
                    'component': component.component,
                    'observation': obs_text,
                    'end_date': end_date
                })

        return JsonResponse({'status': 'success', 'observations': observations})
    except System.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Sistema no encontrado.'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f'Ocurrió un error: {str(e)}'})

@login_required
def system(request):
    systems = System.objects.annotate(observation_count=Count('component__observations'))
    system_create_form = SystemCreate()
    groups = Group.objects.all()
    return render(request, 'system.html', {
        'systems': systems,
        'system_create_form': system_create_form,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'groups': groups,
        })

@login_required
def system_create(request):
    if request.method == "POST":
        system_create_form = SystemCreate(request.POST)
        if system_create_form.is_valid():
            try:

                acronym = system_create_form.cleaned_data['acronym']
                if System.objects.filter(acronym=acronym).exists():
                    return JsonResponse({'status': 'error', 'message': 'Las siglas que ha ingresado ya existen en otro sistema.'})
                
                status = system_create_form.cleaned_data['status']
                utility_life = system_create_form.cleaned_data['utility_life']

                status = float(status) if status else None
                utility_life = float(utility_life) if utility_life else None

                system = System(
                    system=system_create_form.cleaned_data['system'],
                    acronym=system_create_form.cleaned_data['acronym'],
                    condition=system_create_form.cleaned_data['condition'],
                    status=status,
                    utility_life=utility_life,
                    fk_group=system_create_form.cleaned_data['fk_group'],
                )
                system.save()
                return JsonResponse({'status': 'success', 'message': 'El sistema se ha guardado correctamente.'})
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
    
    else:
        system_create_form = SystemCreate()
    
    return render(request, 'system.html', {
        'system_create_form': system_create_form,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        })

@login_required
def system_delete(request, system_id):
    if request.method == 'POST':
        try:
            system = System.objects.get(id=system_id)
            component_system_fk = system.component_set.exists()
            maintenances_system_fk = hasattr(system, 'maintenances_set') and system.maintenances_set.exists()

            if component_system_fk or maintenances_system_fk:
                return JsonResponse({
                    'success': False,
                    'message': 'No se puede eliminar el sistema porque tiene componentes o mantenimientos asociados.'
                }, status=400)
            system.delete()
            return JsonResponse({'success': True, 'message': 'Sistema eliminado correctamente'})
        except System.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'El sistema no existe'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)


@login_required
def list_system(request):
    try:
        draw = request.GET.get('draw', 1)
        start = request.GET.get('start', 0)
        length = request.GET.get('length', 10)
        
        try:
            draw = int(draw)
            start = int(start)
            length = min(int(length), 100) 
        except (ValueError, TypeError):
            return JsonResponse({'error': 'Parámetros de paginación inválidos'}, status=400)

        condition_filter = request.GET.get('condition', 'all')
        groups = request.GET.getlist('groups[]', [])
        systems = request.GET.getlist('systems[]', [])
        all_data = request.GET.get('all', 'false').lower() == 'true'
        search_value = request.GET.get('search[value]', '').strip()

        queryset = System.objects.select_related('fk_group').prefetch_related(
            Prefetch(
                'component_set',
                queryset=Component.objects.prefetch_related('observations'),
                to_attr='prefetched_components'
            )
        ).order_by('id')

        if condition_filter != 'all':
            queryset = queryset.filter(condition=condition_filter)

        if groups and 'all' not in groups:
            queryset = queryset.filter(fk_group_id__in=groups)

        if systems and 'all' not in systems:
            queryset = queryset.filter(id__in=systems)

        if search_value:
            search_lower = search_value.lower().strip()
            
            #Mapeo de condiciones con palabras completas y variaciones
            condition_mapping = {
                'disponible': 0,
                'disp': 0,       
                'd': 0,          
                'indisponible': 1,
                'indisp': 1,     
                'i': 1,         
                'descartada': 2,
                'desc': 2,       
                'desconocido': 3,
                'desco': 3       
            }
            
            condition_filter = None
            for term, value in condition_mapping.items():
                if search_lower == term or search_lower in term:
                    condition_filter = value
                    break
            
            #Búsqueda inteligente para grupos
            group_filter = Q()
            if search_lower == 'grupo':
                group_filter = Q(fk_group__isnull=False)
            elif 'grupo' in search_lower:
                group_num = re.search(r'grupo\s*(\d+)', search_lower)
                if group_num:
                    group_filter = Q(fk_group__group=group_num.group(1))
            elif search_lower.isdigit():
                group_filter = Q(fk_group__group=search_lower)
            
            #Búsqueda estándar en otros campos
            standard_filter = Q(
                Q(system__icontains=search_value) |
                Q(acronym__icontains=search_value) |
                Q(status__icontains=search_value) |
                Q(utility_life__icontains=search_value) |
                Q(fk_group__group__icontains=search_value)
            )
            
            #Combinación de filtros
            final_filter = standard_filter
            
            if condition_filter is not None:
                final_filter |= Q(condition=condition_filter)
            
            if group_filter:
                final_filter |= group_filter
            
            queryset = queryset.filter(final_filter)

        if all_data:
            systems_data = []
            for system in queryset:
                observations = []
                for component in system.prefetched_components:
                    for obs in component.observations.all():
                        end_date = ""
                        requirements = ""
                        type = "Programada" if obs.type == 0 else "No Programada"
                        if obs.fk_task:
                            if obs.fk_task.end_date:
                                end_date = obs.fk_task.end_date.strftime('%Y-%m-%d %H:%M')
                            requirements = ", ".join([req.material_name for req in obs.fk_task.requirements.all()])
                        observations.append({
                            'component': component.component,
                            'observation': obs.observation,
                            'requirements': requirements,
                            'type': type,
                            'status': f"{component.status} HV",
                            'utility_life': f"{component.utility_life} HV",
                            'end_date': end_date,
                        })
                systems_data.append({
                    'id': system.id,
                    'group': system.fk_group.group if system.fk_group else 'Sin grupo',
                    'system': system.system,
                    'acronym': system.acronym,
                    'condition': system.get_condition_display(),
                    'status': system.status,
                    'utility_life': system.utility_life,
                    'observations': observations,
                    'observation_count': len(observations)
                })
            return JsonResponse({'systems': systems_data}, safe=False)

        total_records = System.objects.count()
        filtered_records = queryset.count()

        column_map = {
            '0': 'id',  
            '1': 'fk_group_id__group',  
            '2': 'system', 
            '3': 'acronym',  
            '4': 'condition', 
            '5': 'status',  
        }

        # Obtener configuración de ordenamiento de DataTables
        order_column_index = request.GET.get('order[0][column]', '0')  
        order_direction = request.GET.get('order[0][dir]', 'asc')  

        # Obtener el nombre real del campo para ordenar
        order_field = column_map.get(order_column_index, 'id')
        if order_direction == 'desc':
            order_field = f'-{order_field}' 

        # Aplicar el ordenamiento al queryset
        queryset = queryset.order_by(order_field)

        # Paginación
        systems_page = queryset[start:start + length]

        data = []
        for system in systems_page:
            observation_count = sum(
                component.observations.count() 
                for component in system.prefetched_components
            )
            
            data.append({
                'id': system.id,
                'group': system.fk_group.group if system.fk_group else 'Sin grupo',
                'system': system.system,
                'acronym': system.acronym,
                'condition': system.condition,
                'status': system.status if system.status is not None else '',
                'utility_life': system.utility_life if system.utility_life is not None else '',
                'observation_count': observation_count
            })

        return JsonResponse({
            'draw': draw,
            'recordsTotal': total_records,
            'recordsFiltered': filtered_records,
            'data': data,
        })

    except Exception as e:
        import traceback
        return JsonResponse({
            'error': 'Error interno del servidor',
            'details': str(e),
            'traceback': traceback.format_exc()
        }, status=500)

@login_required
def get_system(request, system_id):
    try:
        system = System.objects.get(id=system_id)
        data = {
            'status': 'success',
            'data': {
                'id': system.id,
                'system': system.system,
                'acronym': system.acronym,
                'condition': system.condition,
                'status': system.status,
                'utility_life': system.utility_life,
                'fk_group': system.fk_group.id if system.fk_group else None,
            }
        }
        return JsonResponse(data)
    except System.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Sistema no encontrado.'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@login_required
def system_update(request, system_id):
    if request.method == "POST":
        try:
            system = System.objects.get(id=system_id)
            acronym = request.POST.get('acronym')
            if System.objects.filter(acronym=acronym).exclude(id=system_id).exists():
                return JsonResponse({'status': 'error', 'message': 'Las siglas que ha ingresado ya existen en otro sistema.'})

            system.system = request.POST.get('system')
            system.acronym = request.POST.get('acronym')
            system.condition = int(request.POST.get('condition'))

            status = request.POST.get('status')
            utility_life = request.POST.get('utility_life')
            system.status = float(status) if status else None
            system.utility_life = float(utility_life) if utility_life else None

            system.fk_group_id = int(request.POST.get('fk_group'))
            system.save()
            return JsonResponse({'status': 'success', 'message': 'El sistema se ha actualizado correctamente.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'})

@login_required
def get_all_systems(request):
    try:
        systems = (
            System.objects.values('system')
            .annotate(id=Min('id'))
            .order_by('system')
        )
        systems_list = [{'id': system['id'], 'name': system['system']} for system in systems]

        return JsonResponse({'status': 'success', 'systems': systems_list})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f'Ocurrió un error: {str(e)}'})
    
@login_required
def get_systems_by_group(request, group_id):
    try:
        systems = (
            System.objects.filter(fk_group_id=group_id)
            .values('system')
            .annotate(id=Min('id'))
            .order_by('system')
        )
        systems_list = [{'id': system['id'], 'name': system['system']} for system in systems]

        return JsonResponse({'status': 'success', 'systems': systems_list})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f'Ocurrió un error: {str(e)}'})