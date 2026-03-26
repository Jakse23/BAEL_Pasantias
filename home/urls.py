from django.urls import path
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
    path("", views.home, name="home"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("component/", component_views.component, name="component"),
    path("maintenances/", maintenances_views.maintenances, name="maintenances"),
    path("system/", system_views.system, name="system"),
    path("work_plan/", work_plan_views.work_plan, name="work_plan"),
    path("list/", views.list_systemdas, name="list"),
    path("list/", views.list_systemdas, name="list"),
    path("purchase_order/", purchase_order_views.purchase_order, name="purchase_order"),
    path("requisition_order/", requisition_order_views.requisition_order, name="requisition_order"),
    path("dispatch_order/", dispatch_order_views.dispatch_order, name="dispatch_order"),
    path("reception_order/", reception_order_views.reception_order, name="reception_order"),
]