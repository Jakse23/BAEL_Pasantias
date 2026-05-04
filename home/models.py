from django.db import models
from system.models import System  # Importa el modelo System existente

class AircraftTask(models.Model):
    TASK_STATUS = [
        ('pending', 'Pendiente'),
        ('in_progress', 'En progreso'),
        ('completed', 'Completada'),
    ]
    
    TASK_TYPE = [
        ('inspection', 'Inspección'),
        ('maintenance', 'Mantenimiento'),
        ('overhaul', 'Overhaul'),
        ('calibration', 'Calibración'),
    ]
    
    # Relación con el sistema existente
    aircraft = models.ForeignKey(System, on_delete=models.CASCADE, related_name='tasks')
    name = models.CharField(max_length=200, verbose_name="Nombre de la tarea")
    task_type = models.CharField(max_length=20, choices=TASK_TYPE, default='maintenance')
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField(verbose_name="Fecha límite")
    estimated_hours = models.FloatField(default=0, verbose_name="Horas estimadas")
    actual_hours = models.FloatField(default=0, verbose_name="Horas realizadas")
    completion_percentage = models.IntegerField(default=0, verbose_name="% Completado")
    status = models.CharField(max_length=20, choices=TASK_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'aircraft_task'
        ordering = ['due_date']
        verbose_name = "Tarea de aeronave"
        verbose_name_plural = "Tareas de aeronaves"
    
    def __str__(self):
        return f"{self.aircraft.acronym} - {self.name}"


class AircraftEvent(models.Model):
    EVENT_TYPE = [
        ('maintenance', 'Mantenimiento'),
        ('inspection', 'Inspección'),
        ('overhaul', 'Overhaul'),
    ]
    
    # Relación con el sistema existente
    aircraft = models.ForeignKey(System, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200, verbose_name="Título del evento")
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE, default='maintenance')
    date = models.DateField(verbose_name="Fecha del evento")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'aircraft_event'
        ordering = ['date']
        verbose_name = "Evento de aeronave"
        verbose_name_plural = "Eventos de aeronaves"
    
    def __str__(self):
        return f"{self.aircraft.acronym} - {self.title} ({self.get_event_type_display()})"


# ==================== MODELO PARA SUBSISTEMAS ====================
class Subsystem(models.Model):
    SUBSYSTEM_TYPES = [
        ('estructural', 'Estructural'),
        ('propulsion', 'Propulsión'),
        ('control_vuelo', 'Control de Vuelo'),
        ('avionica', 'Aviónica'),
    ]
    
    # Relación con la aeronave (System existente)
    aircraft = models.ForeignKey(System, on_delete=models.CASCADE, related_name='subsystems')
    name = models.CharField(max_length=50, choices=SUBSYSTEM_TYPES, verbose_name="Subsistema")
    percentage = models.IntegerField(default=85, verbose_name="Porcentaje de salud")
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'aircraft_subsystem'
        unique_together = ['aircraft', 'name']  # Un solo registro por subsistema por aeronave
        verbose_name = "Subsistema de aeronave"
        verbose_name_plural = "Subsistemas de aeronaves"
    
    def __str__(self):
        return f"{self.aircraft.acronym} - {self.get_name_display()} ({self.percentage}%)"