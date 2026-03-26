from django.db import models
from system.models import System

class Maintenance_Level(models.Model):
    level = models.IntegerField(null=False, verbose_name='Nivel de mantenimiento')
    hours = models.IntegerField(null=False, verbose_name='Horas que corresponde el nivel')

    class Meta:
        db_table = 'maintenance_level'
    
    def __str__(self):
        return f"Nivel {self.level}"

class Maintenances(models.Model):
    datetime = models.DateTimeField(null=False, verbose_name='Fecha')
    prog_percent = models.CharField(max_length=5,null=False, verbose_name='Porcentaje de progreso')
    
    fk_system = models.ForeignKey(System, on_delete=models.CASCADE)

    fk_maintenance_level = models.ForeignKey(Maintenance_Level, on_delete=models.CASCADE)
    class Meta:
        db_table = 'maintenances'
    
    def __str__(self):
        return self.maintenances

class Maintenance_Info(models.Model):
    fk_maintenances = models.ForeignKey(Maintenances, on_delete=models.CASCADE)

    fk_component = models.ForeignKey('component.Component', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'maintenance_info'
    
    def __str__(self):
        return self.maintenance_info