from django.db import models
from system.models import System

LEVEL_CHOICES = [
    (0, 'Mayor nivel'),
    (1, 'Menor nivel')
]

OBS_CHOICES = [
    (0, 'Programado'),
    (1, 'No Programado')
]

class Component(models.Model):
    component = models.CharField(max_length=50, null=False, verbose_name='Componente')
    category = models.IntegerField(choices=LEVEL_CHOICES, default=0, verbose_name='Nivel')
    status = models.FloatField(null=False, verbose_name='Horas de vuelo')
    utility_life = models.FloatField(null=False, verbose_name='Vida útil')
    fk_system = models.ForeignKey(System, on_delete=models.CASCADE, verbose_name='Sistema')

    class Meta:
        db_table = 'component'

    def __str__(self):
        return self.component

class ComponentObservation(models.Model):
    observation = models.CharField(max_length=255, null=True, blank=True, verbose_name='Observaciones')
    type = models.IntegerField(choices=OBS_CHOICES, default=0, verbose_name='Nivel')
    fk_component = models.ForeignKey(Component, on_delete=models.CASCADE, related_name='observations', verbose_name='Componente')
    fk_task = models.ForeignKey('work_plan.Tasks', on_delete=models.CASCADE, null=True, blank=True, verbose_name='Tareas')

    class Meta:
        db_table = 'component_observation'

    def __str__(self):
        return self.observation or "Sin observaciones"
