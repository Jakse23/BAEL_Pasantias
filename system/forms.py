from django import forms
from . models import Group
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator

ACTIVE_CHOICES = [
    (0, 'Disponible'),
    (1, 'Indisponible'),
    (2, 'Descartada')
]

def validate_numeric(value):
    if not value.isdigit():
        raise ValidationError('Este campo solo acepta números.')

class SystemCreate(forms.Form):
    system = forms.CharField(max_length=20, label='Sistema')
    acronym = forms.CharField(max_length=20, label='Siglas')
    condition = forms.ChoiceField(
        choices=[('', 'Seleccione la condición')] + ACTIVE_CHOICES, 
        required=True, 
        label='Condición')
    status = forms.CharField(
        max_length=10,
        required=False,
        label='Horas de vuelo',
        widget=forms.TextInput(attrs={'class': 'form-control numeric-only'}),
        validators=[RegexValidator(r'^\d*\.?\d+$', 'Ingrese un número válido (puede incluir decimales).')]
    )
    utility_life = forms.CharField(
        max_length=10,
        required=False,
        label='Vida útil',
        widget=forms.TextInput(attrs={'class': 'form-control numeric-only'}),
        validators=[RegexValidator(r'^\d*\.?\d+$', 'Ingrese un número válido (puede incluir decimales).')]
    )
    fk_group = forms.ModelChoiceField(
        queryset=Group.objects.all(),
        label="",
        empty_label="Seleccione el grupo",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    