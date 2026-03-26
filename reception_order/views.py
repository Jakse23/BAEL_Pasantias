from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from dispatch_order.models import ReceptionDispatchOrder, ReceptionDispatchOrderDetails
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_datetime
from inventory.models import Inventory, Location
from purchase_order.models import PurchaseOrderDetails
from requisition_order.models import RequisitionOrderDetails
from datetime import datetime

@login_required
def reception_order(request):
    orders = ReceptionDispatchOrder.objects.filter(type=False)
    origin_locations = Location.objects.all()
    destination_locations = Location.objects.all()
    inventories = Inventory.objects.all()
    purchase_order_details = PurchaseOrderDetails.objects.all()
    requisition_order_details = RequisitionOrderDetails.objects.all()
    return render(request, 'reception_order.html', {
        'reception_order': orders,
        'origin_locations': origin_locations,
        'destination_locations': destination_locations,
        'inventories': inventories,
        'purchase_order_details': purchase_order_details,
        'requisition_order_details': requisition_order_details,
    })

@login_required
def reception_order_details(request, order_id):
    details = ReceptionDispatchOrderDetails.objects.filter(fk_reception_dispatch_order_id=order_id)
    data = []
    type = None
    for d in details:
        # Detecta el type de origin_location
        if d.fk_purchase_order_details_id:
            type = "purchase"
            data.append({
                "material": str(d.fk_inventory),
                "quantity": d.fk_purchase_order_details.minimum_quantity,
                "unit_price": d.fk_purchase_order_details.unit_price,
                "observation": d.observation,
                "origin_location": str(d.fk_origin_location),
                "destination_location": str(d.fk_destination_location),
            })
        elif d.fk_requisition_order_details_id:
            type = "requisition"
            data.append({
                "material": str(d.fk_inventory),
                "quantity": d.fk_requisition_order_details.minimum_quantity,
                "observation": d.observation,
                "origin_location": str(d.fk_origin_location),
                "destination_location": str(d.fk_destination_location),
            })
    return JsonResponse({"details": data, "type": type})

@login_required
@csrf_exempt
def create_reception_order(request):
    if request.method == "POST":
        dispatch_order_id = request.POST.get("dispatch_order_id")
        dispatch = ReceptionDispatchOrder.objects.filter(id=dispatch_order_id, type=True).first()
        if not dispatch or dispatch.status != 1:
            return JsonResponse({"error": "Solo se puede crear recepción si el despacho está en tránsito"}, status=400)

        # Obtén los detalles desde el despacho
        details = ReceptionDispatchOrderDetails.objects.filter(fk_reception_dispatch_order=dispatch)
        application_date = datetime.now()
        status = 0

        # Crear la orden de recepción principal
        reception_order = ReceptionDispatchOrder.objects.create(
            application_date=application_date,
            status=status,
            type=False
        )

        # Crear los detalles
        for d in details:
            ReceptionDispatchOrderDetails.objects.create(
                observation=d.observation,
                fk_origin_location=d.fk_origin_location,
                fk_destination_location=d.fk_destination_location,
                fk_inventory=d.fk_inventory,
                fk_reception_dispatch_order=reception_order,
                fk_purchase_order_details=d.fk_purchase_order_details,
                fk_requisition_order_details=d.fk_requisition_order_details,
            )
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Método no permitido"}, status=405)

@login_required
@csrf_exempt
def delete_reception_order(request, order_id):
    if request.method == "POST":
        try:
            order = ReceptionDispatchOrder.objects.get(id=order_id)
            order.delete()
            return JsonResponse({"success": True})
        except ReceptionDispatchOrder.DoesNotExist:
            return JsonResponse({"error": "Orden no encontrada"}, status=404)
    return JsonResponse({"error": "Método no permitido"}, status=405)

@login_required
@csrf_exempt
def change_reception_order_status(request, order_id):
    if request.method == "POST":
        try:
            order = ReceptionDispatchOrder.objects.get(id=order_id)
            if order.status == 2:
                return JsonResponse({"error": "La orden ya está cerrada."}, status=400)
            order.status += 1
            order.save()

            return JsonResponse({"success": True, "new_status": order.get_status_display()})
        except ReceptionDispatchOrder.DoesNotExist:
            return JsonResponse({"error": "Orden no encontrada"}, status=404)
    return JsonResponse({"error": "Método no permitido"}, status=405)