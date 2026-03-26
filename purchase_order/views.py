from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import PurchaseOrder, PurchaseOrderDetails, Supplier, Location, Inventory, STATUS_CHOICES, CURRENCY_CHOICES, PAYMENT_CHOICES, SHIPPING_CHOICES
from dispatch_order.models import ReceptionDispatchOrder, ReceptionDispatchOrderDetails
from .forms import PurchaseOrderForm
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import datetime
from decimal import Decimal
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404

@login_required
def purchase_order(request):
    purchase_order = PurchaseOrder.objects.all()
    order_form = PurchaseOrderForm()
    suppliers = Supplier.objects.all()
    locations = Location.objects.all()
    inventories = Inventory.objects.all()
    # Verifica si cada orden de compra ya tiene despacho
    for order in purchase_order:
        # Busca si existe algún detalle de despacho con esta orden de compra
        has_dispatch = ReceptionDispatchOrderDetails.objects.filter(
            fk_purchase_order_details__fk_purchase_order=order,
            fk_reception_dispatch_order__type=True
        ).exists()
        order.has_dispatch = has_dispatch
    return render(request, 'purchase_order.html', {
        'purchase_order': purchase_order,
        'order_form': order_form,
        'suppliers': suppliers,
        'locations': locations,
        'inventories': inventories,
        'STATUS_CHOICES': STATUS_CHOICES,
        'CURRENCY_CHOICES': CURRENCY_CHOICES,
        'PAYMENT_CHOICES': PAYMENT_CHOICES,
        'SHIPPING_CHOICES': SHIPPING_CHOICES,
    })

@login_required
def purchase_order_details(request, order_id):
    details = PurchaseOrderDetails.objects.filter(fk_purchase_order_id=order_id)
    data = []
    for d in details:
        data.append({
            'unit_price': str(d.unit_price),
            'start_date': d.start_date.strftime('%Y-%m-%d %H:%M'),
            'end_date': d.end_date.strftime('%Y-%m-%d %H:%M'),
            'minimum_quantity': d.minimum_quantity,
            'currency': d.get_currency_display(),
            'estimated_arrival': d.estimated_arrival.strftime('%Y-%m-%d %H:%M'),
            'payment_type': d.get_payment_type_display(),
            'shipping_type': d.get_shipping_type_display(),
            'observation': d.observation,
            'inventory': str(d.fk_inventory),
            'destination_location': str(d.fk_destination_location),
        })
    return JsonResponse({'details': data})

@login_required
@csrf_exempt
def add_purchase_order(request):
    if request.method == 'POST':
        order_form = PurchaseOrderForm(request.POST)
        if order_form.is_valid():
            order = order_form.save(commit=False)
            order.application_date = timezone.now()
            order.total_price = Decimal(request.POST.get('total_price', 0) or 0)
            order.save()
            def parse_datetime_with_tz(dt_str):
                if not dt_str:
                    return None
                dt = datetime.strptime(dt_str, "%Y-%m-%dT%H:%M")
                return timezone.make_aware(dt)
            # Campos fijos
            start_date = parse_datetime_with_tz(request.POST.get('start_date'))
            end_date = parse_datetime_with_tz(request.POST.get('end_date'))
            currency = request.POST.get('currency')
            estimated_arrival = parse_datetime_with_tz(request.POST.get('estimated_arrival'))
            payment_type = request.POST.get('payment_type')
            shipping_type = request.POST.get('shipping_type')
            observation = request.POST.get('observation')
            fk_destination_location = request.POST.get('fk_destination_location')
            # Arrays de materiales
            fk_inventory = request.POST.getlist('fk_inventory[]')
            unit_price = request.POST.getlist('unit_price[]')
            minimum_quantity = request.POST.getlist('minimum_quantity[]')
            # Guardar cada detalle
            for i in range(len(fk_inventory)):
                PurchaseOrderDetails.objects.create(
                    fk_purchase_order=order,
                    fk_inventory_id=fk_inventory[i],
                    unit_price=unit_price[i],
                    minimum_quantity=minimum_quantity[i],
                    start_date=start_date,
                    end_date=end_date,
                    currency=currency,
                    estimated_arrival=estimated_arrival,
                    payment_type=payment_type,
                    shipping_type=shipping_type,
                    observation=observation,
                    fk_destination_location_id=fk_destination_location,
                )
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': order_form.errors}, status=400)
    else:
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

@login_required
@csrf_exempt
def edit_purchase_order(request, order_id):
    order = get_object_or_404(PurchaseOrder, pk=order_id)
    if request.method == 'GET':
        details = PurchaseOrderDetails.objects.filter(fk_purchase_order=order)
        details_data = []
        for d in details:
            details_data.append({
                'id': d.id,
                'fk_inventory': d.fk_inventory_id,
                'unit_price': str(d.unit_price),
                'minimum_quantity': d.minimum_quantity,
            })
        if details:
            first_detail = details[0]
            currency = first_detail.currency
            payment_type = first_detail.payment_type
            shipping_type = first_detail.shipping_type
            start_date = first_detail.start_date.strftime('%Y-%m-%dT%H:%M')
            end_date = first_detail.end_date.strftime('%Y-%m-%dT%H:%M')
            estimated_arrival = first_detail.estimated_arrival.strftime('%Y-%m-%dT%H:%M')
            observation = first_detail.observation
            fk_destination_location = first_detail.fk_destination_location_id
        else:
            currency = ''
            payment_type = ''
            shipping_type = ''
            start_date = ''
            end_date = ''
            estimated_arrival = ''
            observation = ''
            fk_destination_location = ''
        data = {
            'order': {
                'fk_supplier': order.fk_supplier_id,
                'currency': currency,
                'payment_type': payment_type,
                'shipping_type': shipping_type,
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
        # Actualiza la orden y sus detalles
        order_form = PurchaseOrderForm(request.POST, instance=order)
        if order_form.is_valid():
            order = order_form.save(commit=False)
            order.total_price = request.POST.get('total_price', order.total_price)
            order.save()
            # Elimina detalles previos y crea los nuevos
            PurchaseOrderDetails.objects.filter(fk_purchase_order=order).delete()
            fk_inventory = request.POST.getlist('fk_inventory[]')
            unit_price = request.POST.getlist('unit_price[]')
            minimum_quantity = request.POST.getlist('minimum_quantity[]')
            # Campos fijos
            start_date = datetime.strptime(request.POST.get('start_date'), "%Y-%m-%dT%H:%M")
            end_date = datetime.strptime(request.POST.get('end_date'), "%Y-%m-%dT%H:%M")
            currency = request.POST.get('currency')
            estimated_arrival = datetime.strptime(request.POST.get('estimated_arrival'), "%Y-%m-%dT%H:%M")
            payment_type = request.POST.get('payment_type')
            shipping_type = request.POST.get('shipping_type')
            observation = request.POST.get('observation')
            fk_destination_location = request.POST.get('fk_destination_location')
            for i in range(len(fk_inventory)):
                PurchaseOrderDetails.objects.create(
                    fk_purchase_order=order,
                    fk_inventory_id=fk_inventory[i],
                    unit_price=unit_price[i],
                    minimum_quantity=minimum_quantity[i],
                    start_date=start_date,
                    end_date=end_date,
                    currency=currency,
                    estimated_arrival=estimated_arrival,
                    payment_type=payment_type,
                    shipping_type=shipping_type,
                    observation=observation,
                    fk_destination_location_id=fk_destination_location,
                )
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': order_form.errors}, status=400)
    else:
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

@login_required
@require_POST
@csrf_exempt
def delete_purchase_order(request, order_id):
    order = get_object_or_404(PurchaseOrder, pk=order_id)
    order.delete()
    return JsonResponse({'success': True})

@login_required
@require_POST
@csrf_exempt
def change_order_status(request, order_id):
    order = get_object_or_404(PurchaseOrder, pk=order_id)
    if order.status == 2:
        return JsonResponse({'success': False, 'error': 'La orden ya está cerrada.'}, status=400)
    order.status += 1
    order.save()
    return JsonResponse({'success': True, 'new_status': order.get_status_display()})