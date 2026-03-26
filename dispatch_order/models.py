from django.db import models
from inventory.models import Inventory, Location
from purchase_order.models import PurchaseOrderDetails
from requisition_order.models import RequisitionOrderDetails

RECEPTION = True
DISPATCH = False

TYPE_CHOICES = [
    (RECEPTION, 'Recepción'),
    (DISPATCH, 'Despacho'),
]

STATUS_CHOICES = [
    (0, 'Pendiente'),
    (1, 'En Tránsito'),
    (2, 'Cerrada')
]

class ReceptionDispatchOrder(models.Model):
    application_date = models.DateTimeField(null=False, verbose_name='Fecha en la que se registra la orden')
    status =  models.IntegerField(default=0, null=False, choices= STATUS_CHOICES, verbose_name='Estado de la orden')
    type = models.BooleanField(default=True, choices= TYPE_CHOICES, verbose_name='Tipo de Orden: Recepción o Despacho')
    
    class Meta:
            db_table = 'reception_dispatch_order'

class ReceptionDispatchOrderDetails(models.Model):
    observation = models.CharField(max_length=255, null=True, verbose_name='Observación')
    fk_origin_location = models.ForeignKey(Location, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    fk_destination_location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='destination_receptions', verbose_name='Locación de Destino')
    fk_inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, verbose_name='Inventario')
    fk_reception_dispatch_order = models.ForeignKey(ReceptionDispatchOrder, on_delete=models.CASCADE, verbose_name='Orden de Recepción/Despacho')
    fk_purchase_order_details = models.ForeignKey(PurchaseOrderDetails, on_delete=models.CASCADE, null=True, blank=True, verbose_name='Detalles de Orden de Compra')
    fk_requisition_order_details = models.ForeignKey(RequisitionOrderDetails, on_delete=models.CASCADE, null=True, blank=True, verbose_name='Detalles de Orden de Requisición')
    
    class Meta:
            db_table = 'reception_dispatch_order_details'