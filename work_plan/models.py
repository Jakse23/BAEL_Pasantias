from django.db import models
from inventory.models import Inventory

class Work_Plan(models.Model):
    plan_name = models.CharField(max_length=50, null=False, verbose_name='Nombre del plan de trabajo')
    status = models.BooleanField(default=False)
    fk_component = models.ForeignKey('component.Component', on_delete=models.CASCADE, verbose_name='Componente')

    class Meta:
        db_table = 'work_plan'

    def __str__(self):
        return self.plan_name

class Tasks(models.Model):
    task = models.CharField(max_length=50, null=False, verbose_name='Nombre de la tarea')
    requirements = models.ManyToManyField(Inventory, blank=True, related_name='tasks')
    start_date = models.DateTimeField(null=False, verbose_name='Fecha de inicio')
    end_date = models.DateTimeField(null=False, verbose_name='Fecha de finalizacion')
    finished = models.BooleanField(default=False, verbose_name='Terminada')
    labor_cost = models.IntegerField(null=False, verbose_name='Costo de mano de obra')
    fk_work_plan = models.ForeignKey(Work_Plan, on_delete=models.CASCADE, verbose_name='Plan de Trabajo')

    class Meta:
        db_table = 'tasks'

    def __str__(self):
        return self.task

class TasksRequirements(models.Model):
    fk_tasks = models.ForeignKey(Tasks, on_delete=models.CASCADE, verbose_name='Tareas')
    fk_inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, verbose_name='Inventario')
    total_material_cost = models.IntegerField(null=False, verbose_name='Costo total de todo el material de los requerimientos')

    class Meta:
        db_table = 'work_plan_tasks_requirements'
