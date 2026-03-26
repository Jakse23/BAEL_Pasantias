from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import RequisitionOrder, RequisitionOrderDetails, Location, Inventory
from dispatch_order.models import ReceptionDispatchOrder, ReceptionDispatchOrderDetails
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import datetime
from decimal import Decimal
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404

@login_required
def requisition_order(request):
    requisition_order = RequisitionOrder.objects.all()
    locations = Location.objects.all()
    inventories = Inventory.objects.all()
    # Verifica si cada orden de requisición ya tiene despacho
    for order in requisition_order:
        has_dispatch = ReceptionDispatchOrderDetails.objects.filter(
            fk_requisition_order_details__fk_requisition_order=order,
            fk_reception_dispatch_order__type=True
        ).exists()
        order.has_dispatch = has_dispatch

    return render(request, 'requisition_order.html', {
        'requisition_order': requisition_order,
        'locations': locations,
        'inventories': inventories,
    })

@login_required
def requisition_order_details(request, order_id):
    details = RequisitionOrderDetails.objects.filter(fk_requisition_order_id=order_id)
    data = []
    for d in details:
        data.append({
            'start_date': d.start_date.strftime('%Y-%m-%d %H:%M'),
            'end_date': d.end_date.strftime('%Y-%m-%d %H:%M'),
            'minimum_quantity': d.minimum_quantity,
            'estimated_arrival': d.estimated_arrival.strftime('%Y-%m-%d %H:%M'),
            'observation': d.observation,
            'inventory': str(d.fk_inventory),
            'destination_location': str(d.fk_destination_location),
        })
    return JsonResponse({'details': data})

@login_required
@csrf_exempt
def add_requisition_order(request):
    if request.method == 'POST':
        # Crear la orden de requisición sin fk_supplier ni type
        order = RequisitionOrder.objects.create(
            application_date=timezone.now(),
        )
        def parse_datetime_with_tz(dt_str):
            if not dt_str:
                return None
            dt = datetime.strptime(dt_str, "%Y-%m-%dT%H:%M")
            return timezone.make_aware(dt)
        start_date = parse_datetime_with_tz(request.POST.get('start_date'))
        end_date = parse_datetime_with_tz(request.POST.get('end_date'))
        estimated_arrival = parse_datetime_with_tz(request.POST.get('estimated_arrival'))
        observation = request.POST.get('observation')
        fk_destination_location = request.POST.get('fk_destination_location')
        fk_inventory = request.POST.getlist('fk_inventory[]')
        minimum_quantity = request.POST.getlist('minimum_quantity[]')
        for i in range(len(fk_inventory)):
            RequisitionOrderDetails.objects.create(
                fk_requisition_order=order,
                fk_inventory_id=fk_inventory[i],
                minimum_quantity=minimum_quantity[i],
                start_date=start_date,
                end_date=end_date,
                estimated_arrival=estimated_arrival,
                observation=observation,
                fk_destination_location_id=fk_destination_location,
            )
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

@login_required
@csrf_exempt
def edit_requisition_order(request, order_id):
    order = get_object_or_404(RequisitionOrder, pk=order_id)
    if request.method == 'GET':
        details = RequisitionOrderDetails.objects.filter(fk_requisition_order=order)
        details_data = []
        for d in details:
            details_data.append({
                'id': d.id,
                'fk_inventory': d.fk_inventory_id,
                'minimum_quantity': d.minimum_quantity,
            })
        if details:
            first_detail = details[0]
            start_date = first_detail.start_date.strftime('%Y-%m-%dT%H:%M')
            end_date = first_detail.end_date.strftime('%Y-%m-%dT%H:%M')
            estimated_arrival = first_detail.estimated_arrival.strftime('%Y-%m-%dT%H:%M')
            observation = first_detail.observation
            fk_destination_location = first_detail.fk_destination_location_id
        else:
            start_date = ''
            end_date = ''
            estimated_arrival = ''
            observation = ''
            fk_destination_location = ''
        data = {
            'order': {
                'start_date': start_date,
                'end_date': end_date,
                'estimated_arrival': estimated_arrival,
                'observation': observation,
                'fk_destination_location': fk_destination_location,
            },
            'details': details_data,
        }
        return JsonResponse(data)
    elif request.method == 'POST':
        # Actualiza la orden y sus detalles (sin fk_supplier ni type)
        order.save()
        RequisitionOrderDetails.objects.filter(fk_requisition_order=order).delete()
        fk_inventory = request.POST.getlist('fk_inventory[]')
        minimum_quantity = request.POST.getlist('minimum_quantity[]')
        start_date = datetime.strptime(request.POST.get('start_date'), "%Y-%m-%dT%H:%M")
        end_date = datetime.strptime(request.POST.get('end_date'), "%Y-%m-%dT%H:%M")
        estimated_arrival = datetime.strptime(request.POST.get('estimated_arrival'), "%Y-%m-%dT%H:%M")
        observation = request.POST.get('observation')
        fk_destination_location = request.POST.get('fk_destination_location')
        for i in range(len(fk_inventory)):
            RequisitionOrderDetails.objects.create(
                fk_requisition_order=order,
                fk_inventory_id=fk_inventory[i],
                minimum_quantity=minimum_quantity[i],
                start_date=start_date,
                end_date=end_date,
                estimated_arrival=estimated_arrival,
                observation=observation,
                fk_destination_location_id=fk_destination_location,
            )
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

@login_required
@require_POST
@csrf_exempt
def delete_requisition_order(request, order_id):
    order = get_object_or_404(RequisitionOrder, pk=order_id)
    order.delete()
    return JsonResponse({'success': True})

@login_required
@require_POST
@csrf_exempt
def change_order_status(request, order_id):
    order = get_object_or_404(RequisitionOrder, pk=order_id)
    if order.status == 2:
        return JsonResponse({'success': False, 'error': 'La orden ya está cerrada.'}, status=400)
    order.status += 1
    order.save()
    return JsonResponse({'success': True, 'new_status': order.get_status_display()})