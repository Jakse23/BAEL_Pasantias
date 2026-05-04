from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.shortcuts import redirect
from django.conf import settings
from django.contrib.auth import views as auth_views  # ← ESTA LÍNEA ES LA QUE FALTA

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
    
    # AÑADE ESTA LÍNEA PARA LOGOUT
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)