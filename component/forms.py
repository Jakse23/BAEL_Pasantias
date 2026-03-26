from django import forms
from .models import LEVEL_CHOICES
from system.models import System

class ComponentCreateForm(forms.Form):
    component = forms.CharField(max_length=50, label='Componente')
    category = forms.ChoiceField(choices=[('', 'Seleccione')] + LEVEL_CHOICES, label='Nivel')
    status = forms.CharField(
        max_length=10,
        label='Horas de vuelo',
        widget=forms.TextInput(attrs={'class': 'form-control numeric-only'})
     )
    utility_life = forms.CharField(
        max_length=10,
        label='Vida útil',
        widget=forms.TextInput(attrs={'class': 'form-control numeric-only'})
    )
    fk_system = forms.ModelChoiceField(
        queryset=System.objects.all(),
        label="Sistema",
        empty_label="Seleccione un sistema",
        widget=forms.Select(attrs={'class': 'form-select'})
    )