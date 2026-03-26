from django.urls import path
from . import views

app_name = 'reception_order'
urlpatterns = [
    path("", views.reception_order, name="reception_order"),
    path("reception_order_details/<int:order_id>/", views.reception_order_details, name="reception_order_details"),
    path("create_reception_order/", views.create_reception_order, name="create_reception_order"),
    path("delete_reception_order/<int:order_id>/", views.delete_reception_order, name="delete_reception_order"),
    path('change_reception_order_status/<int:order_id>/', views.change_reception_order_status, name='change_reception_order_status'),
]