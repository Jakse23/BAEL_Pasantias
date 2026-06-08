# home/urls.py

from django.urls import path
from django.contrib.auth import views as auth_views  
from . import views
from component import views as component_views
from maintenances import views as maintenances_views
from system import views as system_views
from work_plan import views as work_plan_views
from purchase_order import views as purchase_order_views
from requisition_order import views as requisition_order_views
from dispatch_order import views as dispatch_order_views
from reception_order import views as reception_order_views

app_name = 'home'
urlpatterns = [
    # ========== VISTAS PRINCIPALES Y FLUJO DE FLOTAS ==========
    path("", views.home, name="home"),
    
    # Nivel 1: Panel de Control de Flota (Las 3 cartas: Transporte, Combate, Ala Rotatoria)
    path("dashboard/", views.dashboard, name="dashboard"),
    
    # Nivel 2: Flota de Transporte (Muestra las cartas de los aviones: Hércules, Y8F, Short)
    path("flota/transporte/", views.c130_list, name="c130_list"), 
    
    # Nivel 3: Dashboard Estadístico del C-130 (Al hacer clic en la carta del Hércules)
    path("flota/transporte/c130/dashboard/", views.c130_dashboard_general, name="c130_dashboard_general"),
    
    # ========== CRUD Y DETALLES PARA C-130 (GESTIÓN TÉCNICA) ==========
    path("c130/crear/", views.c130_create, name="c130_create"),
    path("c130/editar/<int:pk>/", views.c130_update, name="c130_update"),
    path("c130/eliminar/<int:pk>/", views.c130_delete, name="c130_delete"),
    path("c130/detalle/<int:pk>/", views.c130_detail, name="c130_detail"),  # ← Detalle técnico
    
    # ========== OTRAS APPS ==========
    path("component/", component_views.component, name="component"),
    path("maintenances/", maintenances_views.maintenances, name="maintenances"),
    path("system/", system_views.system, name="system"),
    path("work_plan/", work_plan_views.work_plan, name="work_plan"),
    path("list/", views.list_systemdas, name="list"),
    path("purchase_order/", purchase_order_views.purchase_order, name="purchase_order"),
    path("requisition_order/", requisition_order_views.requisition_order, name="requisition_order"),
    path("dispatch_order/", dispatch_order_views.dispatch_order, name="dispatch_order"),
    path("reception_order/", reception_order_views.reception_order, name="reception_order"),
    
    # ========== API ENDPOINTS ==========
    path('api/counters/<str:system_type>/', views.get_system_counters, name='get_system_counters'),
    path('api/fleet-percentage/<str:fleet_type>/', views.get_fleet_percentage, name='get_fleet_percentage'),
    
    # APIs para tareas
    path('api/c130/<int:c130_id>/tasks/', views.get_c130_tasks, name='get_c130_tasks'),
    path('api/c130/<int:c130_id>/tasks/create/', views.create_task, name='create_task'),
    path('api/task/<int:task_id>/detail/', views.get_task_detail, name='get_task_detail'),
    path('api/task/<int:task_id>/update/', views.update_task_status, name='update_task_status'),
    path('api/task/<int:task_id>/delete/', views.delete_task, name='delete_task'),
    
    # APIs para eventos
    path('api/c130/<int:c130_id>/events/', views.get_c130_events, name='get_c130_events'),
    path('api/c130/<int:c130_id>/events/create/', views.create_event, name='create_event'),
    path('api/event/<int:event_id>/delete/', views.delete_event, name='delete_event'),
    
    # APIs para subsistemas
    path('api/c130/<int:c130_id>/subsystems/', views.get_subsystems, name='get_subsystems'),
    path('api/c130/<int:c130_id>/subsystem/update/', views.update_subsystem, name='update_subsystem'),
    path('api/c130/<int:c130_id>/subsystems/update-all/', views.update_all_subsystems, name='update_all_subsystems'),
    path('aeronave/<int:pk>/detalle-completo/', views.aeronave_detalle_completo, name='aeronave_detalle_completo'),
    
    # ========== LOGOUT ==========
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path("apartado-tecnico/", views.apartado_tecnico, name="apartado_tecnico"),
]