from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import ReceptionDispatchOrder, ReceptionDispatchOrderDetails
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_datetime
from inventory.models import Inventory, Location
from purchase_order.models import PurchaseOrderDetails
from requisition_order.models import RequisitionOrderDetails
from datetime import datetime

@login_required
def dispatch_order(request):
    orders = ReceptionDispatchOrder.objects.filter(type=True)
    origin_locations = Location.objects.all()
    destination_locations = Location.objects.all()
    inventories = Inventory.objects.all()
    purchase_order_details = PurchaseOrderDetails.objects.all()
    requisition_order_details = RequisitionOrderDetails.objects.all()

    # Verifica si cada despacho ya tiene recepción
    for order in orders:
        has_reception = ReceptionDispatchOrder.objects.filter(
            type=False,
            application_date__gte=order.application_date,  # Opcional: si quieres filtrar por fecha
            status__in=[0, 1, 2],  # Cualquier estado
            receptiondispatchorderdetails__fk_inventory__in=ReceptionDispatchOrderDetails.objects.filter(
                fk_reception_dispatch_order=order
            ).values_list('fk_inventory', flat=True)
        ).exists()
        order.has_reception = has_reception

    return render(request, 'dispatch_order.html', {
        'dispatch_order': orders,
        'origin_locations': origin_locations,
        'destination_locations': destination_locations,
        'inventories': inventories,
        'purchase_order_details': purchase_order_details,
        'requisition_order_details': requisition_order_details,
    })

@login_required
def dispatch_order_details(request, order_id):
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
def create_dispatch_order(request):
    if request.method == "POST":
        order_id = request.POST.get("order_id")
        type = request.POST.get("type")
        application_date = datetime.now()
        status = 0

        if type == "purchase":
            from purchase_order.models import PurchaseOrderDetails, PurchaseOrder
            try:
                order = PurchaseOrder.objects.get(id=order_id)
                details = PurchaseOrderDetails.objects.filter(fk_purchase_order=order)
            except PurchaseOrder.DoesNotExist:
                return JsonResponse({"error": "Orden de compra no encontrada"}, status=404)
        elif type == "requisition":
            from requisition_order.models import RequisitionOrderDetails, RequisitionOrder
            try:
                order = RequisitionOrder.objects.get(id=order_id)
                details = RequisitionOrderDetails.objects.filter(fk_requisition_order=order)
            except RequisitionOrder.DoesNotExist:
                return JsonResponse({"error": "Orden de requisición no encontrada"}, status=404)
        else:
            return JsonResponse({"error": "type de orden no válido"}, status=400)

        # Crear la orden de recepción principal
        dispatch_order = ReceptionDispatchOrder.objects.create(
            application_date=application_date,
            status=status,
            type=True  # True para recepción
        )

        # Crear los detalles
        for d in details:
            ReceptionDispatchOrderDetails.objects.create(
                observation=getattr(d, 'observation', 'Sin observación'),
                fk_origin_location_id=getattr(d.fk_inventory.fk_location, 'id', None),
                fk_destination_location_id=getattr(d.fk_destination_location, 'id', None),
                fk_inventory_id=getattr(d.fk_inventory, 'id', None),
                fk_reception_dispatch_order=dispatch_order,
                fk_purchase_order_details_id=d.id if type == "purchase" else None,
                fk_requisition_order_details_id=d.id if type == "requisition" else None,
            )
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Método no permitido"}, status=405)

@login_required
@csrf_exempt
def delete_dispatch_order(request, order_id):
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
@login_required
@csrf_exempt
def change_dispatch_order_status(request, order_id):
    if request.method == "POST":
        try:
            dispatch = ReceptionDispatchOrder.objects.get(id=order_id, type=True)
            # Solo permitir cerrar si todas las recepciones asociadas están cerradas
            if dispatch.status == 1:  # En Tránsito
                dispatch_details = ReceptionDispatchOrderDetails.objects.filter(fk_reception_dispatch_order=dispatch)
                all_received = True
                for d in dispatch_details:
                    # Busca una recepción con estado cerrada y detalles que coincidan exactamente
                    reception_detail = ReceptionDispatchOrderDetails.objects.filter(
                        fk_inventory=d.fk_inventory,
                        fk_origin_location=d.fk_origin_location,
                        fk_destination_location=d.fk_destination_location,
                        fk_reception_dispatch_order__type=False,
                        fk_reception_dispatch_order__status=2
                    ).first()
                    if not reception_detail:
                        all_received = False
                        break
                if not all_received:
                    return JsonResponse({"error": "No se puede cerrar el despacho hasta que la recepción esté cerrada para todos los materiales"}, status=400)
            dispatch.status += 1
            dispatch.save()
            return JsonResponse({"success": True, "new_status": dispatch.get_status_display()})
        except ReceptionDispatchOrder.DoesNotExist:
            return JsonResponse({"error": "Orden no encontrada"}, status=404)
    return JsonResponse({"error": "Método no permitido"}, status=405)