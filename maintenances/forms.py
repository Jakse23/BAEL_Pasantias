from django import forms
from maintenances.models import Maintenance_Level
from system.models import System

class MaintenanceCreateForm(forms.Form):
    datetime = forms.DateTimeField(
        label='Fecha y hora',
        widget=forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local', 'id':'datetime'})
    )
    prog_percent = forms.CharField(
        max_length=5,
        label='Progreso',
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    fk_system = forms.ModelChoiceField(
        queryset=System.objects.all(),
        label="",
        empty_label="Seleccione el sistema",
        widget=forms.Select(attrs={'class': 'form-select', 'id': 'fk_system'})
    )
    fk_maintenance_level = forms.ModelChoiceField(
        queryset=Maintenance_Level.objects.all(),
        label="",
        empty_label="Seleccione el nivel",
        widget=forms.Select(attrs={'class': 'form-select', 'id': 'fk_maintenance_level'})
    )
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Personalizar las etiquetas para mostrar las siglas (acronym)
        self.fields['fk_system'].label_from_instance = lambda obj: obj.acronym
    
    def clean_prog_percent(self):
        prog_percent = self.cleaned_data['prog_percent']

        # Validar que sea un número entre 0 y 100 con hasta dos decimales
        try:
            value = float(prog_percent)
            if value < 0 or value > 100:
                raise forms.ValidationError('El valor debe estar entre 0 y 100.')
            if '.' in prog_percent and len(prog_percent.split('.')[-1]) > 2:  # Verificar decimales
                raise forms.ValidationError('El valor solo puede tener hasta dos decimales (Ej.: 20.20).')
        except ValueError:
            raise forms.ValidationError('El valor debe ser un número válido.')

        return prog_percent