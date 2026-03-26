from django import forms
from .models import Work_Plan, Tasks

class WorkPlanForm(forms.ModelForm):
    class Meta:
        model = Work_Plan
        fields = ['plan_name', 'fk_component']

class TaskForm(forms.ModelForm):
    class Meta:
        model = Tasks
        fields = ['task', 'requirements', 'start_date', 'end_date', 'labor_cost', 'fk_work_plan']
        widgets = {
            'requirements': forms.SelectMultiple(attrs={'class': 'form-control', 'id': 'requirements-select'}),
            'start_date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'end_date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }