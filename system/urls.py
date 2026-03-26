from django.urls import path
from . import views

app_name = 'system'
urlpatterns = [
    path("", views.system, name="system"),
    path('system_create/', views.system_create, name='system_create'),
    path('system_delete/<int:system_id>/', views.system_delete, name='system_delete'),
    path('get_system/<int:system_id>/', views.get_system, name='get_system'),  
    path('list_system/', views.list_system, name='list_system'),  
    path('system_update/<int:system_id>/', views.system_update, name='system_update'),
    path('get_observations/<int:system_id>/', views.get_system_observations, name='get_system_observations'),
    path('get_systems_by_group/<int:group_id>/', views.get_systems_by_group, name='get_systems_by_group'),
    path('get_all_systems/', views.get_all_systems, name='get_all_systems'),
]