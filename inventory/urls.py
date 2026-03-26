from django.urls import path
from . import views

app_name = 'inventory'

urlpatterns = [
    path('', views.index, name='index'),
    path('add/', views.add_inventory, name='add_inventory'),
    path('list/', views.inventory_list, name='inventory_list'),  # Nueva ruta para DataTable
    path('edit/', views.edit_inventory, name='edit_inventory'),  # Nueva ruta para editar
    path('delete/', views.delete_inventory, name='delete_inventory'),  # Nueva ruta para borrar
    path('material_name_list/', views.material_name_list, name='material_name_list'),
    path('material_name_by_component/<int:component_id>/', views.material_name_by_component, name='material_name_by_component'),
]