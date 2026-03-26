from django.urls import path
from . import views

app_name = 'dispatch_order'
urlpatterns = [
    path("", views.dispatch_order, name="dispatch_order"),
    path("dispatch_order_details/<int:order_id>/", views.dispatch_order_details, name="dispatch_order_details"),
    path("create_dispatch_order/", views.create_dispatch_order, name="create_dispatch_order"),
    path("delete_dispatch_order/<int:order_id>/", views.delete_dispatch_order, name="delete_dispatch_order"),
    path('change_dispatch_order_status/<int:order_id>/', views.change_dispatch_order_status, name='change_dispatch_order_status'),
]