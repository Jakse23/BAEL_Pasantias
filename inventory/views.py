from django.shortcuts import render
from django.http import JsonResponse
from .forms import InventoryForm
from django.core import serializers
from .models import Inventory, Location, Component 
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET

def index(request):
    return render(request, 'inventory.html')

def add_inventory(request):
    if request.method == 'POST':
        data = request.POST.copy()
        location_name = data.get('location', '').strip()
        if location_name:
            location_obj, _ = Location.objects.get_or_create(location=location_name)
            data['fk_location'] = location_obj.id
        else:
            return JsonResponse({'success': False, 'errors': {'location': ['Este campo es obligatorio.']}}, status=400)
        data.pop('location', None)
        form = InventoryForm(data)
        if form.is_valid():
            form.save()
            return JsonResponse({'success': True})
        else:
            print(form.errors)  # <-- Agrega esto para depurar
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

def inventory_list(request):
    if request.method == 'GET':
        data = []
        for inv in Inventory.objects.select_related('fk_component').all():
            data.append({
                'id': inv.id,
                'part_number': inv.part_number,
                'stock': inv.stock,
                'nomenclature': inv.nomenclature,
                'cage': inv.cage,
                'errc': inv.errc,
                'ui': inv.ui,
                'ser': inv.ser,
                'material_name': inv.material_name,
                'unit_price': float(inv.unit_price),
                'total': float(inv.total),
                'location': inv.fk_location.location if inv.fk_location else '',
                'last_inv_date': inv.last_inv_date.strftime('%Y-%m-%d'),
                'fk_component': inv.fk_component.id if inv.fk_component else None,
                'component_name': inv.fk_component.component if inv.fk_component else '',
                'available_quantity': inv.available_quantity,  # Nuevo campo
            })
        return JsonResponse({'data': data})
    
@require_POST
def edit_inventory(request):
    inventory_id = request.POST.get('id')
    inventory = get_object_or_404(Inventory, id=inventory_id)
    form = InventoryForm(request.POST, instance=inventory)
    if form.is_valid():
        form.save()
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    
@require_POST
def delete_inventory(request):
    inventory_id = request.POST.get('id')
    inventory = get_object_or_404(Inventory, id=inventory_id)
    inventory.delete()
    return JsonResponse({'success': True})

def index(request):
    components = Component.objects.all()
    return render(request, 'inventory.html', {'components': components})

def material_name_list(request):
    material_names = Inventory.objects.exclude(material_name__isnull=True).exclude(material_name__exact='').values_list('material_name', flat=True).distinct()
    return JsonResponse({'material_names': list(material_names)})

@require_GET
def material_name_by_component(request, component_id):
    inventorys = Inventory.objects.filter(fk_component_id=component_id)\
        .exclude(material_name__isnull=True)\
        .exclude(material_name__exact='')

    material_names = []
    for inv in inventorys:
        material_names.append({
            'id': inv.id,
            'material_name': inv.material_name,
            'available_quantity': inv.available_quantity
        })

    return JsonResponse({'material_names': material_names})