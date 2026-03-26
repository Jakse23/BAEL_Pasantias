from django.db import models
from django.core.exceptions import ValidationError

class Group(models.Model):
    group = models.IntegerField(null=False, verbose_name='Grupo')
    
    class Meta:
        db_table = 'group'
        
    def __str__(self):
        return f"Grupo {self.group}"

ACTIVE_CHOICES = [
    (0, 'Disponible'),
    (1, 'Indisponible'),
    (2, 'Descartada')
]

class System(models.Model):
    system = models.CharField(max_length=20, null=False, verbose_name='Sistema')
    acronym = models.CharField(max_length=20, null=False, verbose_name='Siglas')
    condition = models.IntegerField(default=0, null=False, choices=ACTIVE_CHOICES, verbose_name='Condición')
    status = models.FloatField(null=True, blank=True, verbose_name='Horas de vuelo')
    utility_life = models.FloatField(null=True, blank=True, verbose_name='Vida útil')
    
    fk_group = models.ForeignKey(Group, on_delete=models.CASCADE)
    
    
    class Meta:
        db_table = 'system'
        
    def clean(self):
        if not str(self.status).isdigit():
            raise ValidationError({'status': 'El campo "Horas de vuelo" debe contener solo números.'})
        if not str(self.utility_life).isdigit():
            raise ValidationError({'utility_life': 'El campo "Vida útil" debe contener solo números.'})
        if self.status < 0:
            raise ValidationError({'status': 'El campo "Horas de vuelo" no puede ser negativo.'})
        if self.utility_life < 0:
            raise ValidationError({'utility_life': 'El campo "Vida útil" no puede ser negativo.'})
    
    def __str__(self):
        return f"{self.system}"
    
    