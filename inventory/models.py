from django.db import models
from component.models import Component

SUPPLIER_CHOICES = [
        (0, 'Otra_Locación'), #Para los casos donde la orden se recibe de otra locación en vez de comprarse
        (1, 'Proveedor2'),
        (2, 'Proveedor3')
]

class Location(models.Model):
        location = models.CharField(max_length=100)
        
        class Meta:
            db_table = 'location'
            
        def __str__(self):
                return f"{self.location}"

class Inventory(models.Model):
        material_name = models.CharField(max_length=255, null=False, verbose_name='Nombre del material')
        available_quantity = models.PositiveIntegerField(default=0, verbose_name='Cantidad disponible en inventario')
        part_number = models.CharField(max_length=100)
        stock = models.CharField(max_length=100)
        nomenclature = models.CharField(max_length=100)
        cage = models.CharField(max_length=50, blank=True, null=True)
        errc = models.CharField(max_length=50, blank=True, null=True)
        ui = models.CharField(max_length=50, blank=True, null=True)
        ser = models.CharField(max_length=50, blank=True, null=True)
        unit_price = models.DecimalField(max_digits=10, decimal_places=2)
        total = models.DecimalField(max_digits=12, decimal_places=2)
        last_inv_date = models.DateField()
        fk_component = models.ForeignKey(Component, on_delete=models.CASCADE, verbose_name='Componente')
        fk_location = models.ForeignKey(Location, on_delete=models.CASCADE, verbose_name='Locación')

        class Meta:
                db_table = 'inventory'

        def __str__(self):
                return f"{self.material_name}"

class Supplier(models.Model):
    supplier = models.IntegerField(default=0, null=False, choices=SUPPLIER_CHOICES, verbose_name='Proveedor')
    
    class Meta:
            db_table = 'supplier'
            
    def __str__(self):
            return self.get_supplier_display()