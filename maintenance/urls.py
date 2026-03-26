"""
URL configuration for maintenance project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.shortcuts import redirect
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path("component/", include("component.urls")),
    path("home/", include("home.urls")),
    path("login/", include("login.urls")),
    path('', lambda request: redirect('login:login')),
    path("maintenances/", include("maintenances.urls")),
    path("system/", include("system.urls")),
    path("inventory/", include("inventory.urls")),
    path("work_plan/", include("work_plan.urls")),
    path("purchase_order/", include("purchase_order.urls")),
    path("requisition_order/", include("requisition_order.urls")),
    path("dispatch_order/", include("dispatch_order.urls")),
    path("reception_order/", include("reception_order.urls")),

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)