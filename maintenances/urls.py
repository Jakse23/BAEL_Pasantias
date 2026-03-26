from django.urls import path
from . import views

app_name = 'maintenances'
urlpatterns = [
    path("", views.maintenances, name="maintenances"),
    path('maintenance_create/', views.maintenance_create, name='maintenance_create'),
    path('maintenance_delete/<int:maintenance_id>/', views.maintenance_delete, name='maintenance_delete'),  # Nueva rutaborrar
    path('get_maintenance/<int:maintenance_id>/', views.get_maintenance, name='get_maintenance'),
    path('maintenance_update/', views.maintenance_update, name='maintenance_update'),
    
]

