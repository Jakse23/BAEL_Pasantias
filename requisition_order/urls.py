from django.urls import path
from . import views

app_name = 'requisition_order'
urlpatterns = [
    path("", views.requisition_order, name="requisition_order"),
    path("requisition_order_details/<int:order_id>/", views.requisition_order_details, name="requisition_order_details"),
    path("add_requisition_order/", views.add_requisition_order, name="add_requisition_order"),
    path("delete_requisition_order/<int:order_id>/", views.delete_requisition_order, name="delete_requisition_order"),
    path("edit_requisition_order/<int:order_id>/", views.edit_requisition_order, name="edit_requisition_order"),
    path("change_order_status/<int:order_id>/", views.change_order_status, name="change_order_status"),
]