from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from system.models import System
from django.http.response import JsonResponse
from django.db.models import Q, Prefetch
from component.models import Component
from maintenances.models import Maintenances
import re
from django.db.models import Q, Prefetch, Exists, OuterRef

@login_required
def home(request):
    return render(request, 'home.html', {
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })

@login_required
def dashboard(request):
    
    # Mostrar datos reales en las cards de los sistemas según su nivel de mantenimiento
    systems = System.objects.filter(maintenances__isnull=False).distinct()
    level_counts = {
        'level_1': 0,
        'level_2': 0,
        'level_3': 0,
        'level_4': 0,
    }
    for system in systems:
        highest_maintenance = system.maintenances_set.order_by('-fk_maintenance_level__level').first()
        
        if highest_maintenance:
            if system.status is not None and highest_maintenance.fk_maintenance_level.hours:
                system.progress = (system.status / highest_maintenance.fk_maintenance_level.hours) * 100
            else:
                system.progress = 0
            system.maintenance_hours = highest_maintenance.fk_maintenance_level.hours
            maintenance_level = highest_maintenance.fk_maintenance_level.level
            if maintenance_level == 1:
                level_counts['level_1'] += 1
            elif maintenance_level == 2:
                level_counts['level_2'] += 1
            elif maintenance_level == 3:
                level_counts['level_3'] += 1
            elif maintenance_level == 4:
                level_counts['level_4'] += 1
        else:
            system.progress = 0
            system.maintenance_hours = "N/A"

    return render(request, 'dashboard.html', {
        'systems': systems,
        'level_counts': level_counts,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })

#Lista de sistemas registrados
def list_systemdas(request):
    try:
        #Obtener parámetros de DataTables
        draw = request.GET.get('draw', 1)
        start = request.GET.get('start', 0)
        length = request.GET.get('length', 10)
        
        try:
            draw = int(draw)
            start = int(start)
            length = min(int(length), 100)
        except (ValueError, TypeError):
            return JsonResponse({'error': 'Parámetros de paginación inválidos'}, status=400)

        #Obtener parámetros de filtrado
        condition_filter = request.GET.get('condition', 'all')
        groups = request.GET.getlist('groups[]', [])
        systems = request.GET.getlist('systems[]', [])
        search_value = request.GET.get('search[value]', '').strip()

        #Construir el queryset base SOLO para sistemas con mantenimiento
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

        #Aplicar filtros básicos
        if condition_filter != 'all':
            queryset = queryset.filter(condition=condition_filter)

        if groups and 'all' not in groups:
            queryset = queryset.filter(fk_group_id__in=groups)

        if systems and 'all' not in systems:
            queryset = queryset.filter(id__in=systems)

        #Búsqueda avanzada
        if search_value:
            search_lower = search_value.lower().strip()
            
            #Mapeos para búsqueda flexible
            condition_map = {
                'disponible': 0, 'disp': 0, 'd': 0,
                'indisponible': 1, 'indisp': 1, 'i': 1, 'in': 1,
                'descartada': 2, 'desc': 2, 'de': 2,
                'desconocido': 3, 'desco': 3, 'des': 3
            }
            
            maintenance_map = {
                'nivel 1': 1, 'nivel1': 1, '1': 1, 'n1': 1,
                'nivel 2': 2, 'nivel2': 2, '2': 2, 'n2': 2,
                'nivel 3': 3, 'nivel3': 3, '3': 3, 'n3': 3,
                'mantenimiento 1': 1, 'mant1': 1,
                'mantenimiento 2': 2, 'mant2': 2,
                'mantenimiento 3': 3, 'mant3': 3
            }

            # Construir filtros dinámicos
            filters = Q()
            
            # Filtro por condición
            for term, value in condition_map.items():
                if search_lower.startswith(term):
                    filters |= Q(condition=value)
                    break
            
            # Filtro por grupo
            if 'grupo' in search_lower:
                group_num = re.search(r'grupo\s*(\d+)', search_lower)
                if group_num:
                    filters |= Q(fk_group__group=group_num.group(1))
                else:
                    filters |= Q(fk_group__isnull=False)
            elif search_lower.isdigit():
                filters |= Q(fk_group__group=search_lower)
            
            # Filtro por nivel de mantenimiento
            for term, level in maintenance_map.items():
                if term in search_lower:
                    filters |= Q(maintenances__fk_maintenance_level__level=level)
                    break
            
            # Filtros estándar para otros campos
            standard_filters = Q(
                Q(system__icontains=search_value) |
                Q(acronym__icontains=search_value) |
                Q(status__icontains=search_value) |
                Q(utility_life__icontains=search_value) |
                Q(fk_group__group__icontains=search_value)
            )
            
            queryset = queryset.filter(filters | standard_filters).distinct()

        #Configuración de ordenamiento
        column_map = {
            '0': 'fk_group__group',
            '1': 'system',
            '2': 'acronym',
            '3': 'condition',
            '4': 'maintenances__fk_maintenance_level__level',
            '5': 'status',
            '6': 'status',  # Para ordenar por progress
        }

        order_column_index = request.GET.get('order[0][column]', '0')
        order_direction = request.GET.get('order[0][dir]', 'asc')
        order_field = column_map.get(order_column_index, 'id')
        
        if order_direction == 'desc':
            order_field = f'-{order_field}'

        queryset = queryset.order_by(order_field)

        #Paginación y preparación de datos
        total_records = System.objects.filter(
            Exists(Maintenances.objects.filter(fk_system=OuterRef('pk')))
        ).count()
        
        filtered_records = queryset.count()
        systems_page = queryset[start:start + length]

        data = []
        for system in systems_page:
            # Todos estos sistemas tienen mantenimiento por el filtro inicial
            highest_maintenance = system.ordered_maintenances[0]
            maintenance_level = highest_maintenance.fk_maintenance_level.level
            maintenance_hours = highest_maintenance.fk_maintenance_level.hours

            # Cálculo del progreso
            progress = min(100, (system.status / maintenance_hours) * 100) if system.status else 0

            # Contar observaciones
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
                'maintenance_info': f"Nivel {maintenance_level} ({maintenance_hours} HV)",
                'status': system.status,
                'utility_life': system.utility_life,
                'progress': progress,
                'observation_count': observation_count,
                'raw_maintenance_level': maintenance_level,
                'raw_maintenance_hours': maintenance_hours
            })

        return JsonResponse({
            'draw': draw,
            'recordsTotal': total_records,
            'recordsFiltered': filtered_records,
            'data': data,
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'error': 'Error interno del servidor',
            'details': str(e)
        }, status=500)