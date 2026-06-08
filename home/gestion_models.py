# home/gestion_models.py - NUEVOS MODELOS PARA GESTIÓN DE MANTENIMIENTO

from django.db import models
from system.models import System


class EstructuraAvion(models.Model):
    """Estructura jerárquica de partes y subsistemas del avión"""
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    padre = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    nivel = models.IntegerField(default=1)
    orden = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['nivel', 'orden']
        db_table = 'estructura_avion'
    
    def __str__(self):
        return self.nombre


class ComponenteAvion(models.Model):
    """Partes específicas de una aeronave individual"""
    CONDICION_CHOICES = [
        ('verde', '🟢 Bueno'),
        ('amarillo', '🟡 Revisar'),
        ('rojo', '🔴 Crítico'),
    ]
    
    aeronave = models.ForeignKey(System, on_delete=models.CASCADE, related_name='componentes_avion')
    estructura = models.ForeignKey(EstructuraAvion, on_delete=models.SET_NULL, null=True, blank=True)
    codigo = models.CharField(max_length=50)
    nombre = models.CharField(max_length=200)
    numero_serie = models.CharField(max_length=100, blank=True)
    numero_parte = models.CharField(max_length=100)
    horas_acumuladas = models.IntegerField(default=0)
    vida_util_horas = models.IntegerField(default=0)
    ultimo_cambio = models.DateField(null=True, blank=True)
    observaciones = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['aeronave', 'codigo']
        db_table = 'componente_avion'
    
    def __str__(self):
        return f"{self.aeronave.acronym} - {self.codigo} - {self.nombre}"
    
    @property
    def horas_restantes(self):
        return self.vida_util_horas - self.horas_acumuladas
    
    @property
    def estado(self):
        restante = self.horas_restantes
        if restante > 1000:
            return 'verde'
        elif restante > 500:
            return 'amarillo'
        else:
            return 'rojo'


class ProgramaMantto(models.Model):
    """Programas de mantenimiento definidos por el fabricante"""
    TIPO_CHOICES = [
        ('horas', 'Por Horas de Vuelo'),
        ('calendario', 'Por Calendario'),
        ('ciclos', 'Por Ciclos'),
    ]
    
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=50, unique=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    intervalo_horas = models.IntegerField(default=0)
    intervalo_dias = models.IntegerField(default=0)
    descripcion = models.TextField(blank=True)
    horas_estimadas = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'programa_mantto'
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class ProgramaManttoAeronave(models.Model):
    """Programas de mantenimiento asignados a una aeronave específica"""
    aeronave = models.ForeignKey(System, on_delete=models.CASCADE, related_name='programas_mantto')
    programa = models.ForeignKey(ProgramaMantto, on_delete=models.CASCADE)
    ultima_realizacion = models.DateField(null=True, blank=True)
    ultimas_horas = models.IntegerField(default=0)
    proxima_realizacion = models.DateField(null=True, blank=True)
    activo = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['aeronave', 'programa']
        db_table = 'programa_mantto_aeronave'
    
    def __str__(self):
        return f"{self.aeronave.acronym} - {self.programa.nombre}"


class InspeccionRegistro(models.Model):
    """Registro de inspecciones realizadas en una aeronave"""
    aeronave = models.ForeignKey(System, on_delete=models.CASCADE, related_name='inspecciones_registro')
    programa = models.ForeignKey(ProgramaManttoAeronave, on_delete=models.CASCADE)
    fecha_realizacion = models.DateField()
    horas_acumuladas = models.IntegerField()
    horas_productivas = models.IntegerField(default=0)
    cumplimiento_porcentaje = models.IntegerField(default=100)
    observaciones = models.TextField(blank=True)
    tecnico_responsable = models.CharField(max_length=100, blank=True)
    
    class Meta:
        ordering = ['-fecha_realizacion']
        db_table = 'inspeccion_registro'
    
    def __str__(self):
        return f"{self.aeronave.acronym} - {self.fecha_realizacion}"


class CatalogoMaterial(models.Model):
    """Catálogo de consumibles, reparables, herramientas"""
    TIPO_CHOICES = [
        ('consumible', 'Consumible'),
        ('reparable', 'Reparable'),
        ('herramienta', 'Herramienta'),
        ('equipo', 'Equipo'),
    ]
    
    codigo = models.CharField(max_length=50, unique=True)
    descripcion = models.CharField(max_length=200)
    numero_parte = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    unidad_medida = models.CharField(max_length=20, default='unidad')
    stock_actual = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'catalogo_material'
    
    def __str__(self):
        return f"{self.codigo} - {self.descripcion}"
    
    @property
    def necesita_reabastecimiento(self):
        return self.stock_actual <= self.stock_minimo


class MaterialRequeridoMantto(models.Model):
    """Materiales que requiere cada programa de mantenimiento"""
    programa = models.ForeignKey(ProgramaMantto, on_delete=models.CASCADE, related_name='materiales')
    material = models.ForeignKey(CatalogoMaterial, on_delete=models.CASCADE)
    cantidad = models.IntegerField(default=1)
    
    class Meta:
        unique_together = ['programa', 'material']
        db_table = 'material_requerido_mantto'
    
    def __str__(self):
        return f"{self.programa.nombre} → {self.material.descripcion} x{self.cantidad}"