from django.shortcuts import render
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404
from . models import Maintenances, Maintenance_Info
from component.models import ComponentObservation
from .forms import MaintenanceCreateForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from system.models import System
from .models import Maintenance_Level

@login_required
def maintenances(request):
    maintenances = Maintenances.objects.all()
    maintenance_create_form = MaintenanceCreateForm()
    systems = System.objects.filter(component__isnull=False).distinct()
    maintenance_levels = Maintenance_Level.objects.all()
    return render(request, 'maintenances.html', {
        'maintenances': maintenances,
        'maintenance_create_form': maintenance_create_form,
        'systems': systems,
        'maintenance_levels': maintenance_levels,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })

@login_required
def maintenance_create(request):
    if request.method == "POST":
        print(request.POST)
        maintenance_create_form = MaintenanceCreateForm(request.POST)
        if maintenance_create_form.is_valid():
            try:
                maintenance = Maintenances(
                    datetime=maintenance_create_form.cleaned_data['datetime'],
                    prog_percent=maintenance_create_form.cleaned_data['prog_percent'],
                    fk_system=maintenance_create_form.cleaned_data['fk_system'],
                    fk_maintenance_level=maintenance_create_form.cleaned_data['fk_maintenance_level'],
                )
                maintenance.save()
                
                # Procesar los componentes seleccionados y sus observaciones
                components = request.POST.getlist('components')  # IDs de los componentes seleccionados
                for component_id in components:
                    observation_key = f"observation-{component_id}"
                    observation_text = request.POST.get(observation_key, "")  # Obtener la observación para el componente

                    # Crear la observación en la tabla Observation
                    observation = ComponentObservation.objects.create(
                        fk_component_id=component_id,
                        observation=observation_text
                    )

                    # Crear la relación en Maintenance_Info
                    Maintenance_Info.objects.create(
                        fk_maintenances=maintenance,
                        fk_component_id=component_id
                    )
                
                return JsonResponse({'status': 'success', 'message': 'El mantenimiento se ha guardado correctamente.'})
            except Exception as e:
                print(f"Error: {e}")
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
    else:
        maintenance_create_form = MaintenanceCreateForm()
    
    return render(request, 'maintenances.html', {
        'maintenance_create_form': maintenance_create_form,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        })
    
# Borrar
@login_required
def maintenance_delete(request, maintenance_id):
    
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            maintenance = get_object_or_404(Maintenances, id=maintenance_id)
            
            # Eliminar las relaciones en Maintenance_Info
            maintenance_info_entries = Maintenance_Info.objects.filter(fk_maintenances=maintenance)
            for entry in maintenance_info_entries:
                # Eliminar las observaciones relacionadas con los componentes
                ComponentObservation.objects.filter(fk_component=entry.fk_component_id).delete()
                entry.delete()

            maintenance.delete()
            return JsonResponse({'status': 'success', 'message': 'El mantenimiento ha sido eliminado correctamente.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Error al eliminar el mantenimiento: {str(e)}'})
    return JsonResponse({'status': 'error', 'message': 'Solicitud inválida.'})

@login_required
def get_maintenance(request, maintenance_id):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            maintenance = Maintenances.objects.get(id=maintenance_id)
            components = Maintenance_Info.objects.filter(fk_maintenances=maintenance).select_related('fk_component')

            components_data = []

            for component in components:
                comp = component.fk_component

                # Buscar observación específica para este mantenimiento y componente
                obs = ComponentObservation.objects.filter(
                    fk_component=comp,
                ).first()

                components_data.append({
                    'id': comp.id,
                    'name': comp.component,
                    'observation': obs.observation if obs else ''
                })

            return JsonResponse({
                'status': 'success',
                'maintenance': {
                    'id': maintenance.id,
                    'datetime': maintenance.datetime.strftime('%Y-%m-%dT%H:%M'),
                    'prog_percent': maintenance.prog_percent,
                    'fk_maintenance_level': maintenance.fk_maintenance_level.id,
                    'fk_system': maintenance.fk_system.id,
                },
                'components': components_data
            })
        except Maintenances.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Mantenimiento no encontrado.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
    return JsonResponse({'status': 'error', 'message': 'Solicitud inválida.'})

@login_required
def maintenance_update(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            maintenance_id = request.POST.get('maintenance_id')
            maintenance = Maintenances.objects.get(id=maintenance_id)

            # Actualizar datos del mantenimiento
            maintenance.datetime = request.POST.get('edit_datetime')
            maintenance.prog_percent = request.POST.get('edit_prog_percent')
            maintenance.fk_maintenance_level_id = request.POST.get('fk_maintenance_level')
            maintenance.save()

            # Componentes seleccionados actualmente
            component_ids = request.POST.getlist('components[]')  # IDs actuales (como strings)
            component_ids_set = set(component_ids)

            # Componentes previamente asociados
            prev_infos = Maintenance_Info.objects.filter(fk_maintenances=maintenance)
            prev_component_ids = set(str(info.fk_component_id) for info in prev_infos)

            # Eliminar relaciones anteriores
            prev_infos.delete()

            # Eliminar observaciones de componentes que ya no están seleccionados
            removed_component_ids = prev_component_ids - component_ids_set
            if removed_component_ids:
                ComponentObservation.objects.filter(fk_component_id__in=removed_component_ids).delete()

            # Crear nuevas relaciones y actualizar/crear observaciones
            for comp_id in component_ids:
                Maintenance_Info.objects.create(
                    fk_maintenances=maintenance,
                    fk_component_id=comp_id
                )
                obs_key = f'observation-{comp_id}'
                obs_value = request.POST.get(obs_key, '')

                observation = ComponentObservation.objects.filter(fk_component_id=comp_id).first()
                if observation:
                    observation.observation = obs_value
                    observation.save()
                else:
                    ComponentObservation.objects.create(
                        fk_component_id=comp_id,
                        observation=obs_value
                    )

            return JsonResponse({'status': 'success', 'message': 'El mantenimiento se ha actualizado correctamente.'})

        except Maintenances.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Mantenimiento no encontrado.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})

    return JsonResponse({'status': 'error', 'message': 'Solicitud inválida.'})