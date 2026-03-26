from django.urls import path
from . import views

app_name = 'purchase_order'
urlpatterns = [
    path("", views.purchase_order, name="purchase_order"),
    path("purchase_order_details/<int:order_id>/", views.purchase_order_details, name="purchase_order_details"),
    path("add_purchase_order/", views.add_purchase_order, name="add_purchase_order"),
    path("delete_purchase_order/<int:order_id>/", views.delete_purchase_order, name="delete_purchase_order"),
    path("edit_purchase_order/<int:order_id>/", views.edit_purchase_order, name="edit_purchase_order"),
    path("change_order_status/<int:order_id>/", views.change_order_status, name="change_order_status"),
]