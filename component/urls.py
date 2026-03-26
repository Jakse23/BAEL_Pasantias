from django.urls import path
from . import views

app_name = 'component'
urlpatterns = [
    path("", views.component, name="component"),
    path("component_create/", views.component_create, name="component_create"),
    path('get_components/<int:system_id>/', views.get_components_by_system, name='get_components_by_system'),
    path('component_delete/<int:component_id>/', views.component_delete, name='component_delete'),
    path('get_component/<int:component_id>/', views.get_component, name='get_component'),
    path('component_update/', views.component_update, name='component_update'),
    path('get_systems_and_levels/', views.get_systems_and_levels, name='get_systems_and_levels'),
    path('components-by-system/<int:system_id>/', views.get_components_by_system_detail, name='components_by_system'),
]

