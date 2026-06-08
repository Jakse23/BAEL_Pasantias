from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http.response import JsonResponse
from django.db.models import Q, Prefetch, Exists, OuterRef
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from datetime import date
from django.urls import reverse

# Importación de modelos
from system.models import System
from component.models import Component
from maintenances.models import Maintenances

# Importar modelos de tareas, eventos y subsistemas
from .models import AircraftTask, AircraftEvent, Subsystem


@login_required
def home(request):
    """Vista de bienvenida."""
    return render(request, 'home.html', {
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })


@login_required
def dashboard(request):
    """
    Vista principal del Dashboard. 
    Calcula estadísticas globales y procesa el progreso de cada sistema.
    """
    sistemas = System.objects.filter(maintenances__isnull=False).distinct()
    
    level_counts = {
        'level_1': 0,
        'level_2': 0,
        'level_3': 0,
        'level_4': 0,
    }

    for system in sistemas:
        highest_maintenance = system.maintenances_set.order_by('-fk_maintenance_level__level').first()
        
        if highest_maintenance:
            if system.status is not None and highest_maintenance.fk_maintenance_level.hours:
                system.progress = (system.status / highest_maintenance.fk_maintenance_level.hours) * 100
            else:
                system.progress = 0
            
            system.maintenance_hours = highest_maintenance.fk_maintenance_level.hours
            maintenance_level = highest_maintenance.fk_maintenance_level.level
            
            level_key = f'level_{maintenance_level}'
            if level_key in level_counts:
                level_counts[level_key] += 1
        else:
            system.progress = 0
            system.maintenance_hours = "N/A"

    return render(request, 'dashboard.html', {
        'systems': sistemas,
        'level_counts': level_counts,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })


@login_required
def dashboard_c130(request):
    """
    Vista detallada exclusiva para el C-130 Hércules.
    """
    try:
        c130 = System.objects.get(acronym='C-130')
        highest_maintenance = c130.maintenances_set.order_by('-fk_maintenance_level__level').first()
        
        if highest_maintenance and highest_maintenance.fk_maintenance_level.hours:
            progreso = (c130.status / highest_maintenance.fk_maintenance_level.hours) * 100
            horas_limite = highest_maintenance.fk_maintenance_level.hours
        else:
            progreso = 0
            horas_limite = 0

        context = {
            'system': c130,
            'aeronavegabilidad': round(progreso, 1),
            'horas_totales': f"{c130.status}h",
            'limite_horas': horas_limite,
            'listos': 5,
            'mantenimiento': 2,
            'aog': 1,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        }
    except System.DoesNotExist:
        context = {
            'aeronavegabilidad': 0, 
            'horas_totales': '0h',
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'error_message': "Sistema C-130 no encontrado."
        }

    return render(request, 'dashboard_c130.html', context)


# ==================== APARTADO TÉCNICO (CON SELECTOR DE FLOTA) ====================
# ==================== APARTADO TÉCNICO (CON TABLAS DESPLEGABLES) ====================

@login_required
def apartado_tecnico(request):
    """
    Vista del Apartado Técnico para técnicos de mantenimiento.
    Muestra todas las flotas agrupadas en tarjetas desplegables con buscador.
    """
    # Obtener todas las aeronaves
    todas_aeronaves = System.objects.all().order_by('system', 'acronym')
    
    # Agrupar por tipo de flota
    flotas_agrupadas = {}
    for avion in todas_aeronaves:
        flota = avion.system
        if flota not in flotas_agrupadas:
            flotas_agrupadas[flota] = []
        flotas_agrupadas[flota].append(avion)
    
    # Calcular horas restantes para cada avión
    VIDA_UTIL_TOTAL = 12000
    for flota, aeronaves in flotas_agrupadas.items():
        for avion in aeronaves:
            horas_vuelo = avion.utility_life or 0
            avion.horas_restantes = VIDA_UTIL_TOTAL - horas_vuelo
            avion.horas_excedidas = horas_vuelo - VIDA_UTIL_TOTAL if horas_vuelo > VIDA_UTIL_TOTAL else 0
    
    context = {
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'flotas_agrupadas': flotas_agrupadas,
    }
    
    return render(request, 'home/apartado_tecnico.html', context)
    return render(request, 'home/apartado_tecnico.html', context)

# ==================== DASHBOARD GENERAL DE FLOTA C-130 ====================

@login_required
def c130_dashboard_general(request):
    """
    Vista general de la flota C-130 Hércules.
    Muestra gráficas, inventario desplegable, mantenimientos y estadísticas.
    Este es el dashboard que los supervisores/comandantes verán.
    """
    # Obtener todas las aeronaves C-130HV
    flota_completa = System.objects.filter(system='C-130HV').order_by('acronym')
    
    # Estadísticas por condición
    flota_operativos = flota_completa.filter(condition=0)
    flota_mantenimiento = flota_completa.filter(condition=1)
    flota_inoperativos = flota_completa.filter(condition=2)
    
    total = flota_completa.count()
    operatividad = round((flota_operativos.count() / total) * 100) if total > 0 else 0
    
    # Datos para gráficas (convertir a listas para JavaScript)
    aeronaves_labels = [avion.acronym for avion in flota_completa]
    horas_data = [avion.utility_life or 0 for avion in flota_completa]
    estados_data = [
        flota_operativos.count(),
        flota_mantenimiento.count(),
        flota_inoperativos.count()
    ]
    
    # Datos históricos de operatividad (simulados - puedes crear un modelo para almacenarlos)
    historico_operatividad = [78, 82, 79, 85, 83, operatividad]
    
    # Vencimientos isocronales (ejemplo - ajusta según tus necesidades)
    vencimientos = [
        {'descripcion': 'Pesaje de Aeronave', 'dias': 30},
        {'descripcion': 'Inspección de Corrosión', 'dias': 45},
        {'descripcion': 'Control Meteorológico', 'dias': 60},
        {'descripcion': 'Inspección Fase A', 'dias': 15},
        {'descripcion': 'Overhaul Motor', 'dias': 90},
    ]
    
    # Mantenimientos programados (ejemplo)
    mantenimientos = [
        {'descripcion': 'Inspección Fase C', 'dias': 14, 'matricula': 'C130J-01'},
        {'descripcion': 'Revisión Tren Aterrizaje', 'dias': 29, 'matricula': 'C130H-02'},
        {'descripcion': 'Prueba Hidrostática', 'dias': 45, 'matricula': 'C130J-03'},
        {'descripcion': 'Cambio de Filtros', 'dias': 7, 'matricula': 'C130B-01'},
    ]
    
    # Componentes críticos (ejemplo)
    componentes = [
        {'nombre': 'Motor T56-A-15 (#1)', 'horas': 450},
        {'nombre': 'Motor T56-A-15 (#2)', 'horas': 820},
        {'nombre': 'Motor T56-A-15 (#3)', 'horas': 820},
        {'nombre': 'Motor T56-A-15 (#4)', 'horas': 612},
        {'nombre': 'Hélice NP2000', 'horas': 974},
    ]
    
    # Ciclos de mantenimiento
    ciclos = [
        {'nombre': 'Inspección Cada 25 Horas', 'estado': 'verde', 'descripcion': 'Completado'},
        {'nombre': 'Inspección Cada 100 Horas', 'estado': 'amarillo', 'descripcion': 'Próximo en 12h'},
        {'nombre': 'Inspección Cada 300 Horas', 'estado': 'verde', 'descripcion': 'Completado'},
        {'nombre': 'Inspección Cada 600 Horas', 'estado': 'rojo', 'descripcion': 'Vence en 45h'},
        {'nombre': 'Inspección Cada 1200 Horas', 'estado': 'amarillo', 'descripcion': 'Próximo en 120h'},
        {'nombre': 'Overhaul General', 'estado': 'verde', 'descripcion': 'Programado para 2025'},
    ]
    
    # Datos de calidad y personal
    capacitacion_porcentaje = 96
    capacitacion_vencido = 4
    tecnicos_certificados = 18
    total_tecnicos = 24
    en_capacitacion = 3
    por_vencer = 2
    proximos_vencimientos = "Técnico A (5 días), Técnico C (18 días)"
    
    # Calcular total de tareas activas (opcional - si tienes el modelo AircraftTask)
    total_tareas_activas = AircraftTask.objects.filter(
        aircraft__in=flota_completa,
        status__in=['pending', 'in_progress']
    ).count()
    
    context = {
        # Datos de flota
        'flota_completa': flota_completa,
        'flota_operativos': flota_operativos,
        'flota_mantenimiento': flota_mantenimiento,
        'flota_inoperativos': flota_inoperativos,
        'operatividad': operatividad,
        'total_aeronaves': total,
        
        # Datos para gráficas (JSON serializados)
        'aeronaves_labels': json.dumps(aeronaves_labels),
        'horas_data': json.dumps(horas_data),
        'estados_data': json.dumps(estados_data),
        'historico_operatividad': json.dumps(historico_operatividad),
        
        # Datos para secciones
        'vencimientos': vencimientos,
        'mantenimientos': mantenimientos,
        'componentes': componentes,
        'ciclos': ciclos,
        'total_tareas_activas': total_tareas_activas,
        
        # Datos de calidad
        'capacitacion_porcentaje': capacitacion_porcentaje,
        'capacitacion_vencido': capacitacion_vencido,
        'tecnicos_certificados': tecnicos_certificados,
        'total_tecnicos': total_tecnicos,
        'en_capacitacion': en_capacitacion,
        'por_vencer': por_vencer,
        'proximos_vencimientos': proximos_vencimientos,
        
        # Datos de usuario
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    }
    
    return render(request, 'home/dashboard_general.html', context)


# ==================== CRUD PARA C-130 ====================

@login_required
def c130_list(request):
    """Lista todos los C-130 Hércules"""
    c130_list = System.objects.filter(system='C-130HV').order_by('acronym')
    
    context = {
        'c130_list': c130_list,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    }
    return render(request, 'home/c130_list.html', context)


@login_required
@login_required
def c130_create(request):
    """
    Crear una nueva aeronave para cualquier flota.
    Permite seleccionar el tipo de flota libremente.
    """
    # Obtener todas las flotas disponibles desde la base de datos
    flotas_disponibles = System.objects.values_list('system', flat=True).distinct().order_by('system')
    
    # Si no hay flotas, definir algunas por defecto
    if not flotas_disponibles:
        flotas_disponibles = [
            'C-130HV', 'Y8F200W', 'SD-360', 'F-16', 'SU 30 MK2', 
            'K8W', 'AS-532', 'AS-332B1', 'MI-17', 'MI-17V5', 'EN-480B', 'EN-280FX'
        ]
    
    # Obtener flota del parámetro GET (para precargar desde botones)
    flota_precargada = request.GET.get('flota', '')
    
    if request.method == 'POST':
        # Obtener datos del formulario
        flota = request.POST.get('system', '').strip()
        acronym = request.POST.get('acronym', '').strip().upper()
        condition = request.POST.get('condition', 1)
        status = request.POST.get('status', 0)
        horas_vuelo = request.POST.get('utility_life', 0)
        fk_group_id = request.POST.get('fk_group_id', 3)
        
        # ========== VALIDACIONES ==========
        if not flota:
            messages.error(request, '❌ El tipo de flota es requerido')
            context = {
                'title': 'Crear Nueva Aeronave',
                'flotas_disponibles': flotas_disponibles,
                'flota_seleccionada': flota_precargada,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            }
            return render(request, 'home/c130_form.html', context)
        
        if not acronym:
            messages.error(request, '❌ La matrícula es requerida')
            context = {
                'title': 'Crear Nueva Aeronave',
                'flotas_disponibles': flotas_disponibles,
                'flota_seleccionada': flota,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            }
            return render(request, 'home/c130_form.html', context)
        
        # Validar que la matrícula no exista ya (sin importar la flota)
        if System.objects.filter(acronym=acronym).exists():
            messages.error(request, f'❌ Ya existe una aeronave con la matrícula {acronym}')
            context = {
                'title': 'Crear Nueva Aeronave',
                'flotas_disponibles': flotas_disponibles,
                'flota_seleccionada': flota,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            }
            return render(request, 'home/c130_form.html', context)
        
        # Validar horas de vuelo (no pueden ser negativas)
        try:
            horas_vuelo_int = int(horas_vuelo) if horas_vuelo else 0
            if horas_vuelo_int < 0:
                messages.error(request, '❌ Las horas de vuelo no pueden ser negativas')
                context = {
                    'title': 'Crear Nueva Aeronave',
                    'flotas_disponibles': flotas_disponibles,
                    'flota_seleccionada': flota,
                    'first_name': request.user.first_name,
                    'last_name': request.user.last_name,
                }
                return render(request, 'home/c130_form.html', context)
        except ValueError:
            messages.error(request, '❌ Las horas de vuelo deben ser un número válido')
            context = {
                'title': 'Crear Nueva Aeronave',
                'flotas_disponibles': flotas_disponibles,
                'flota_seleccionada': flota,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            }
            return render(request, 'home/c130_form.html', context)
        
        # ========== CREAR LA AERONAVE ==========
        try:
            new_aircraft = System(
                system=flota,
                acronym=acronym,
                condition=int(condition),
                status=int(status) if status else 0,
                utility_life=horas_vuelo_int,
                fk_group_id=int(fk_group_id)
            )
            new_aircraft.save()
            
            messages.success(request, f'✅ Aeronave {acronym} creada exitosamente en la flota {flota}')
            return redirect('home:apartado_tecnico')
            
        except Exception as e:
            messages.error(request, f'❌ Error al crear la aeronave: {str(e)}')
            context = {
                'title': 'Crear Nueva Aeronave',
                'flotas_disponibles': flotas_disponibles,
                'flota_seleccionada': flota,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            }
            return render(request, 'home/c130_form.html', context)
    
    # ========== GET REQUEST - Mostrar formulario ==========
    context = {
        'title': '✈️ Crear Nueva Aeronave',
        'flotas_disponibles': flotas_disponibles,
        'flota_seleccionada': flota_precargada,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    }
    return render(request, 'home/c130_form.html', context)


@login_required
def c130_update(request, pk):
    """Actualizar un C-130 existente"""
    c130 = get_object_or_404(System, pk=pk)
    
    # Obtener la flota desde el GET o usar el sistema de la aeronave
    flota = request.GET.get('flota', c130.system)
    
    if request.method == 'POST':
        acronym = request.POST.get('acronym')
        condition = request.POST.get('condition', 1)
        status = request.POST.get('status', 0)
        horas_vuelo = request.POST.get('horas_vuelo', 0)
        
        # Validar que no haya duplicado (excepto el mismo)
        if System.objects.filter(acronym=acronym).exclude(pk=pk).exists():
            messages.error(request, f'Ya existe otra aeronave con la matrícula {acronym}')
            return render(request, 'home/c130_form.html', {'title': 'Editar C-130', 'c130': c130, 'flota': flota})
        
        c130.acronym = acronym.upper()
        c130.condition = int(condition)
        c130.status = int(status) if status else 0
        c130.utility_life = int(horas_vuelo) if horas_vuelo else 0
        c130.save()
        
        messages.success(request, f'Aeronave {c130.acronym} actualizada exitosamente')
        return redirect(f'{reverse("home:apartado_tecnico")}?flota={flota}')
    
    context = {
        'c130': c130,
        'title': 'Editar C-130',
        'flota': flota,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    }
    return render(request, 'home/c130_form.html', context)


@login_required
def c130_delete(request, pk):
    """Eliminar un C-130"""
    c130 = get_object_or_404(System, pk=pk)
    flota = request.GET.get('flota', c130.system)
    
    if request.method == 'POST':
        acronym = c130.acronym
        c130.delete()
        messages.success(request, f'Aeronave {acronym} eliminada exitosamente')
        return redirect(f'{reverse("home:apartado_tecnico")}?flota={flota}')
    
    context = {
        'c130': c130,
        'flota': flota,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    }
    return render(request, 'home/c130_confirm_delete.html', context)


# ==================== VISTA DE DETALLE PARA C-130 ====================

@login_required
def c130_detail(request, pk):
    """
    Vista de detalle para una aeronave C-130 específica.
    Muestra los paneles con aeronavegabilidad, tareas y eventos.
    """
    c130 = get_object_or_404(System, pk=pk, system='C-130HV')
    
    # Obtener tareas
    tasks = AircraftTask.objects.filter(aircraft=c130).order_by('due_date')
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(status='completed').count()
    in_progress_tasks = tasks.filter(status='in_progress').count()
    pending_tasks = tasks.filter(status='pending').count()
    global_completion = int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0
    
    # Obtener subsistemas
    subsistemas = Subsystem.objects.filter(aircraft=c130)
    subsistemas_dict = {sub.name: sub.percentage for sub in subsistemas}
    
    # Valores por defecto
    default_subsystems = {
        'estructural': subsistemas_dict.get('estructural', 88),
        'propulsion': subsistemas_dict.get('propulsion', 94),
        'control_vuelo': subsistemas_dict.get('control_vuelo', 91),
        'avionica': subsistemas_dict.get('avionica', 85),
    }
    
    # Calcular aeronavegabilidad
    aeronavegabilidad = sum(default_subsystems.values()) / 4
    
    context = {
        'c130': c130,
        'tasks': tasks,
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'in_progress_tasks': in_progress_tasks,
        'pending_tasks': pending_tasks,
        'global_completion': global_completion,
        'aeronavegabilidad': round(aeronavegabilidad, 1),
        'subsystems': default_subsystems,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    }
    return render(request, 'home/c130_detail.html', context)


# ==================== VISTA DETALLE COMPLETO DE AERONAVE ====================

@login_required
def aeronave_detalle_completo(request, pk):
    """
    Vista completa de una aeronave específica (SOLO LECTURA).
    """
    aeronave = get_object_or_404(System, pk=pk)
    
    # Datos básicos
    context = {
        'aeronave': aeronave,
        'total_componentes': 0,
        'horas_vuelo': aeronave.utility_life or 0,
        'horas_restantes': 12000 - (aeronave.utility_life or 0),
        'porcentaje_cumplimiento': 0,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    }
    
    return render(request, 'home/aeronave_detalle_completo.html', context)


# ==================== API PARA TAREAS ====================

@require_http_methods(["GET"])
def get_c130_tasks(request, c130_id):
    """Obtener todas las tareas de una aeronave"""
    try:
        c130 = get_object_or_404(System, pk=c130_id, system='C-130HV')
        tasks = AircraftTask.objects.filter(aircraft=c130).order_by('due_date')
        
        tasks_data = []
        completed = 0
        in_progress = 0
        pending = 0
        
        for task in tasks:
            status = task.status
            if status == 'completed':
                completed += 1
            elif status == 'in_progress':
                in_progress += 1
            else:
                pending += 1
                
            tasks_data.append({
                'id': task.id,
                'name': task.name,
                'task_type': task.task_type,
                'task_type_display': task.get_task_type_display(),
                'status': task.status,
                'status_display': task.get_status_display(),
                'completion_percentage': task.completion_percentage,
                'due_date': task.due_date.strftime('%d/%m/%Y') if task.due_date else '',
                'estimated_hours': float(task.estimated_hours),
                'actual_hours': float(task.actual_hours),
                'description': task.description or '',
            })
        
        total = len(tasks_data)
        global_completion = int((completed / total) * 100) if total > 0 else 0
        
        return JsonResponse({
            'tasks': tasks_data,
            'total': total,
            'completed': completed,
            'in_progress': in_progress,
            'pending': pending,
            'global_completion': global_completion
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_task_detail(request, task_id):
    """Obtener detalles de una tarea específica"""
    try:
        task = get_object_or_404(AircraftTask, id=task_id)
        return JsonResponse({
            'id': task.id,
            'name': task.name,
            'task_type': task.task_type,
            'task_type_display': task.get_task_type_display(),
            'description': task.description or '',
            'due_date': task.due_date.strftime('%d/%m/%Y') if task.due_date else '',
            'estimated_hours': float(task.estimated_hours),
            'actual_hours': float(task.actual_hours),
            'completion_percentage': task.completion_percentage,
            'status': task.status,
            'status_display': task.get_status_display(),
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def update_task_status(request, task_id):
    """Actualizar el progreso y estado de una tarea"""
    try:
        task = get_object_or_404(AircraftTask, id=task_id)
        data = json.loads(request.body)
        
        if 'actual_hours' in data:
            task.actual_hours = data['actual_hours']
        if 'completion_percentage' in data:
            task.completion_percentage = data['completion_percentage']
        if 'status' in data:
            task.status = data['status']
        
        if task.status == 'completed' and task.completion_percentage < 100:
            task.completion_percentage = 100
        
        task.save()
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def create_task(request, c130_id):
    """Crear una nueva tarea para una aeronave"""
    try:
        c130 = get_object_or_404(System, pk=c130_id, system='C-130HV')
        data = json.loads(request.body)
        
        if not data.get('name'):
            return JsonResponse({'success': False, 'error': 'El nombre es requerido'}, status=400)
        
        if not data.get('due_date'):
            return JsonResponse({'success': False, 'error': 'La fecha es requerida'}, status=400)
        
        if not data.get('estimated_hours'):
            return JsonResponse({'success': False, 'error': 'Las horas estimadas son requeridas'}, status=400)
        
        task = AircraftTask.objects.create(
            aircraft=c130,
            name=data.get('name'),
            task_type=data.get('task_type', 'maintenance'),
            description=data.get('description', ''),
            due_date=data.get('due_date'),
            estimated_hours=float(data.get('estimated_hours', 0)),
            completion_percentage=0,
            status='pending',
            actual_hours=0
        )
        
        return JsonResponse({'success': True, 'task_id': task.id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_task(request, task_id):
    """Eliminar una tarea"""
    try:
        task = get_object_or_404(AircraftTask, id=task_id)
        task.delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# ==================== API PARA EVENTOS ====================

@require_http_methods(["GET"])
def get_c130_events(request, c130_id):
    """Obtener todos los eventos de una aeronave"""
    try:
        c130 = get_object_or_404(System, pk=c130_id, system='C-130HV')
        events = AircraftEvent.objects.filter(aircraft=c130).order_by('date')
        
        events_data = []
        for event in events:
            events_data.append({
                'id': event.id,
                'title': event.title,
                'event_type': event.event_type,
                'date': event.date.strftime('%Y-%m-%d') if event.date else '',
                'description': event.description or '',
            })
        
        return JsonResponse(events_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def create_event(request, c130_id):
    """Crear un nuevo evento para una aeronave"""
    try:
        c130 = get_object_or_404(System, pk=c130_id, system='C-130HV')
        data = json.loads(request.body)
        
        if not data.get('title'):
            return JsonResponse({'success': False, 'message': 'El título es requerido'}, status=400)
        
        if not data.get('date'):
            return JsonResponse({'success': False, 'message': 'La fecha es requerida'}, status=400)
        
        event = AircraftEvent.objects.create(
            aircraft=c130,
            title=data.get('title'),
            event_type=data.get('event_type', 'maintenance'),
            date=data.get('date'),
            description=data.get('description', '')
        )
        
        return JsonResponse({'success': True, 'event_id': event.id})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_event(request, event_id):
    """Eliminar un evento"""
    try:
        event = get_object_or_404(AircraftEvent, id=event_id)
        event.delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# ==================== API PARA SUBSISTEMAS ====================

@require_http_methods(["GET"])
def get_subsystems(request, c130_id):
    """Obtener todos los subsistemas de una aeronave y la aeronavegabilidad"""
    try:
        c130 = get_object_or_404(System, pk=c130_id, system='C-130HV')
        subsystems = Subsystem.objects.filter(aircraft=c130)
        
        default_values = {
            'estructural': 88,
            'propulsion': 94,
            'control_vuelo': 91,
            'avionica': 85
        }
        
        subsystems_data = {}
        for sub in subsystems:
            subsystems_data[sub.name] = sub.percentage
        
        for key in default_values:
            if key not in subsystems_data:
                subsystems_data[key] = default_values[key]
        
        percentages = list(subsystems_data.values())
        aeronavegabilidad = sum(percentages) / len(percentages)
        
        return JsonResponse({
            'success': True,
            'aeronavegabilidad': round(aeronavegabilidad, 1),
            'subsystems': subsystems_data
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def update_subsystem(request, c130_id):
    """Actualizar un subsistema específico"""
    try:
        c130 = get_object_or_404(System, pk=c130_id, system='C-130HV')
        data = json.loads(request.body)
        
        subsystem_name = data.get('subsystem')
        new_percentage = data.get('percentage')
        
        if not subsystem_name or new_percentage is None:
            return JsonResponse({'success': False, 'error': 'Faltan datos: subsystem y percentage son requeridos'}, status=400)
        
        try:
            new_percentage = int(new_percentage)
        except (ValueError, TypeError):
            return JsonResponse({'success': False, 'error': 'El porcentaje debe ser un número válido'}, status=400)
        
        new_percentage = max(0, min(100, new_percentage))
        
        subsystem, created = Subsystem.objects.update_or_create(
            aircraft=c130,
            name=subsystem_name,
            defaults={'percentage': new_percentage}
        )
        
        all_subsystems = Subsystem.objects.filter(aircraft=c130)
        default_values = {
            'estructural': 88,
            'propulsion': 94,
            'control_vuelo': 91,
            'avionica': 85
        }
        
        subsystems_data = {}
        for sub in all_subsystems:
            subsystems_data[sub.name] = sub.percentage
        
        for key in default_values:
            if key not in subsystems_data:
                subsystems_data[key] = default_values[key]
        
        percentages = list(subsystems_data.values())
        aeronavegabilidad = sum(percentages) / len(percentages)
        
        return JsonResponse({
            'success': True,
            'aeronavegabilidad': round(aeronavegabilidad, 1),
            'subsystems': subsystems_data
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def update_all_subsystems(request, c130_id):
    """Actualizar todos los subsistemas desde la aeronavegabilidad general"""
    try:
        c130 = get_object_or_404(System, pk=c130_id, system='C-130HV')
        data = json.loads(request.body)
        
        new_aeronavegabilidad = data.get('aeronavegabilidad')
        
        if new_aeronavegabilidad is None:
            return JsonResponse({'success': False, 'error': 'El porcentaje de aeronavegabilidad es requerido'}, status=400)
        
        try:
            new_aeronavegabilidad = int(new_aeronavegabilidad)
        except (ValueError, TypeError):
            return JsonResponse({'success': False, 'error': 'El porcentaje debe ser un número válido'}, status=400)
        
        new_aeronavegabilidad = max(0, min(100, new_aeronavegabilidad))
        
        subsystem_names = ['estructural', 'propulsion', 'control_vuelo', 'avionica']
        
        for name in subsystem_names:
            Subsystem.objects.update_or_create(
                aircraft=c130,
                name=name,
                defaults={'percentage': new_aeronavegabilidad}
            )
        
        subsystems_data = {
            'estructural': new_aeronavegabilidad,
            'propulsion': new_aeronavegabilidad,
            'control_vuelo': new_aeronavegabilidad,
            'avionica': new_aeronavegabilidad
        }
        
        return JsonResponse({
            'success': True,
            'aeronavegabilidad': float(new_aeronavegabilidad),
            'subsystems': subsystems_data
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# ==================== API PARA CONTADORES DE AERONAVES ====================

def get_system_counters(request, system_type):
    """
    API para obtener contadores de aeronaves por tipo
    """
    try:
        disponible = System.objects.filter(
            system=system_type,
            condition=0
        ).count()
        
        mantenimiento = System.objects.filter(
            system=system_type,
            condition=1
        ).count()
        
        inoperativo = System.objects.filter(
            system=system_type,
            condition=2
        ).count()
        
        return JsonResponse({
            'disponible': disponible,
            'mantenimiento': mantenimiento,
            'inoperativo': inoperativo,
            'total': disponible + mantenimiento + inoperativo
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ==================== DATATABLE DE SISTEMAS ====================

def list_systemdas(request):
    """
    Endpoint para el Datatable de sistemas (AJAX)
    """
    try:
        draw = int(request.GET.get('draw', 1))
        start = int(request.GET.get('start', 0))
        length = min(int(request.GET.get('length', 10)), 100)

        search_value = request.GET.get('search[value]', '').strip()

        queryset = System.objects.filter(
            Exists(Maintenances.objects.filter(fk_system=OuterRef('pk')))
        ).select_related('fk_group').prefetch_related(
            Prefetch(
                'component_set',
                queryset=Component.objects.prefetch_related('observations'),
                to_attr='prefetched_components'
            ),
            Prefetch(
                'maintenances_set',
                queryset=Maintenances.objects.select_related('fk_maintenance_level')
                                        .order_by('-fk_maintenance_level__level'),
                to_attr='ordered_maintenances'
            )
        ).order_by('id')

        if search_value:
            queryset = queryset.filter(
                Q(system__icontains=search_value) | 
                Q(acronym__icontains=search_value)
            ).distinct()

        total_records = System.objects.filter(Exists(Maintenances.objects.filter(fk_system=OuterRef('pk')))).count()
        filtered_records = queryset.count()
        systems_page = queryset[start:start + length]

        data = []
        for system in systems_page:
            highest_m = system.ordered_maintenances[0]
            m_level = highest_m.fk_maintenance_level.level
            m_hours = highest_m.fk_maintenance_level.hours
            
            progress = min(100, (system.status / m_hours) * 100) if system.status else 0
            
            data.append({
                'id': system.id,
                'group': system.fk_group.group if system.fk_group else 'N/A',
                'system': system.system,
                'acronym': system.acronym,
                'condition': system.condition,
                'maintenance_info': f"Nivel {m_level} ({m_hours} HV)",
                'status': system.status,
                'progress': progress,
            })

        return JsonResponse({
            'draw': draw,
            'recordsTotal': total_records,
            'recordsFiltered': filtered_records,
            'data': data,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ==================== API PARA PORCENTAJE DE FLOTA ====================

def get_fleet_percentage(request, fleet_type):
    """
    API para obtener el porcentaje de aeronaves operativas por tipo de flota
    """
    try:
        sistemas_map = {
            'transporte': ['C-130HV', 'Y8F200W', 'SD-360'],
            'combate': ['F-16', 'SU 30 MK2', 'K8W', 'K-8W'],
            'ala-rotativa': ['AS-532', 'AS-332B1', 'MI-17', 'MI-17V5', 'EN-480B', 'EN-280FX']
        }
        
        sistemas = sistemas_map.get(fleet_type, [])
        
        total = System.objects.filter(system__in=sistemas).count()
        operativas = System.objects.filter(system__in=sistemas, condition=0).count()
        
        porcentaje = (operativas / total * 100) if total > 0 else 0
        
        return JsonResponse({
            'porcentaje': round(porcentaje, 1),
            'operativas': operativas,
            'total': total
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)