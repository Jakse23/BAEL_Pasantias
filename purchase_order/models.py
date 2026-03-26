from django.db import models
from inventory.models import Inventory, Supplier, Location

STATUS_CHOICES = [
    (0, 'Pendiente'),
    (1, 'En Tránsito'),
    (2, 'Cerrada')
]
CURRENCY_CHOICES = [
    (0, 'Dólar'),
    (1, 'Yen')
]
PAYMENT_CHOICES = [
    (0, 'Efectivo'),
    (1, 'Transferencia')
]
SHIPPING_CHOICES = [
    (0, 'Aéreo'),
    (1, 'Marítimo')
]

TYPE_CHOICES = [
    (True, 'Compra'),
    (False, 'Requisición')
]

class PurchaseOrder(models.Model):
    total_price = models.DecimalField(null=True, max_digits=10, decimal_places=2)
    application_date = models.DateTimeField(null=False, verbose_name='Fecha en la que se registra la orden')
    status =  models.IntegerField(default=0, null=False, choices=STATUS_CHOICES, verbose_name='Estado de la orden')
    fk_supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, verbose_name='Proveedor')
    
    class Meta:
            db_table = 'purchase_order'
    

class PurchaseOrderDetails(models.Model):
    unit_price = models.DecimalField(null=True, max_digits=10, decimal_places=2)
    start_date = models.DateTimeField(null=False, verbose_name='Fecha a partir de la que se espera recibir')
    end_date = models.DateTimeField(null=False, verbose_name='Fecha hasta la que se espera recibir')
    minimum_quantity = models.IntegerField(null=False, verbose_name='Cantidad mínima de material a recibir')
    currency = models.IntegerField(default=0, null=True, choices=CURRENCY_CHOICES, verbose_name='Moneda con la que se hará el pago') #(hacer tabla de monedas si tienen unos)
    estimated_arrival = models.DateTimeField(null=False, verbose_name='Fecha en la que se estima recibir')
    payment_type =  models.IntegerField(default=0, null=True, choices=PAYMENT_CHOICES, verbose_name='Método de pago') #(hacer tabla de tipos de pago si tienen unos)
    shipping_type =  models.IntegerField(default=0, null=True, choices=SHIPPING_CHOICES, verbose_name='Método de envío') #(hacer tabla de tipos de envio si tienen unos)
    observation = models.CharField(max_length=255, default="Sin observación", verbose_name='Observación sólo si la orden se cierra sin recibir la cantidad mínima o cumplir la vigencia')
    fk_inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, verbose_name='Inventario')
    fk_destination_location = models.ForeignKey(Location, on_delete=models.CASCADE, verbose_name='Locación de Destino')
    fk_purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, verbose_name='Orden de Compra')
    
    class Meta:
            db_table = 'purchase_order_details'

