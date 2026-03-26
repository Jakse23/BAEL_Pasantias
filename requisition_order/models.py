from django.db import models
from inventory.models import Inventory, Location

STATUS_CHOICES = [
    (0, 'Pendiente'),
    (1, 'En Tránsito'),
    (2, 'Cerrada')
]

class RequisitionOrder(models.Model):
    application_date = models.DateTimeField(null=False, verbose_name='Fecha en la que se registra la orden')
    status =  models.IntegerField(default=0, null=False, choices=STATUS_CHOICES, verbose_name='Estado de la orden')
    
    class Meta:
            db_table = 'requisition_order'
    

class RequisitionOrderDetails(models.Model):
    start_date = models.DateTimeField(null=False, verbose_name='Fecha a partir de la que se espera recibir')
    end_date = models.DateTimeField(null=False, verbose_name='Fecha hasta la que se espera recibir')
    minimum_quantity = models.IntegerField(null=False, verbose_name='Cantidad mínima de material a recibir')
    estimated_arrival = models.DateTimeField(null=False, verbose_name='Fecha en la que se estima recibir')
    observation = models.CharField(max_length=255, default="Sin observación", verbose_name='Observación sólo si la orden se cierra sin recibir la cantidad mínima o cumplir la vigencia')
    fk_inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, verbose_name='Inventario')
    fk_destination_location = models.ForeignKey(Location, on_delete=models.CASCADE, verbose_name='Locación de Destino')
    fk_requisition_order = models.ForeignKey(RequisitionOrder, on_delete=models.CASCADE, verbose_name='Orden de Requisición')
    
    class Meta:
            db_table = 'requisition_order_details'

