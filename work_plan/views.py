from django.db import models
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Work_Plan, Tasks
from .forms import WorkPlanForm, TaskForm
from system.models import System
from django.views.decorators.csrf import csrf_exempt
from component.models import Component, ComponentObservation
from inventory.models import Inventory
from .models import TasksRequirements


@login_required
def work_plan(request):
    work_plans = Work_Plan.objects.select_related('fk_component', 'fk_component__fk_system').all()
    systems = System.objects.all()
    form = WorkPlanForm()
    # Calcular suma de mano de obra por plan
    for plan in work_plans:
        plan.total_labor_cost = plan.tasks_set.aggregate(total=models.Sum('labor_cost'))['total'] or 0
    return render(request, 'work_plan.html', {
        'work_plans': work_plans,
        'systems': systems,
        'form': form,
    })

@login_required
def work_plan_list(request):
    work_plans = Work_Plan.objects.select_related('fk_system').all()
    systems = System.objects.all()
    form = WorkPlanForm()
    return render(request, 'work_plan.html', {
        'work_plans': work_plans,
        'systems': systems,
        'form': form,
    })

@csrf_exempt
@login_required
def work_plan_create(request):
    if request.method == 'POST':
        form = WorkPlanForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success', 'message': 'Plan de trabajo creado correctamente.'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Datos inválidos.'})
    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'})

@login_required
def work_plan_update(request, pk):
    plan = get_object_or_404(Work_Plan, pk=pk)
    if plan.status:
        return JsonResponse({'status': 'error', 'message': 'El plan está cerrado y no puede editarse.'})
    if request.method == 'POST':
        form = WorkPlanForm(request.POST, instance=plan)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success', 'message': 'Plan de trabajo actualizado.'})
        return JsonResponse({'status': 'error', 'message': 'Datos inválidos.'})
    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'})

@login_required
def work_plan_delete(request, pk):
    plan = get_object_or_404(Work_Plan, pk=pk)
    if plan.status:
        return JsonResponse({'status': 'error', 'message': 'El plan está cerrado y no puede eliminarse.'})
    if request.method == 'POST':
        plan.delete()
        return JsonResponse({'status': 'success', 'message': 'Plan de trabajo eliminado.'})
    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'})

@csrf_exempt
@login_required
def task_create(request):
    if request.method == 'POST':
        fk_work_plan_id = request.POST.get('fk_work_plan')
        plan = Work_Plan.objects.get(pk=fk_work_plan_id)
        if plan.status:
            return JsonResponse({'status': 'error', 'message': 'El plan está cerrado y no se pueden añadir tareas.'})
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.save()
            form.save_m2m()
            # Guardar total_material_cost en TasksRequirements
            for req in task.requirements.all():
                total_cost = task.labor_cost
                TasksRequirements.objects.create(
                    fk_tasks=task,
                    fk_inventory=req,
                    total_material_cost=total_cost
                )
            return JsonResponse({'status': 'success', 'message': 'Tarea creada correctamente.'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Datos inválidos.', 'errors': form.errors})
    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'})

@login_required
def tasks_by_work_plan(request, plan_id):
    tasks = Tasks.objects.filter(fk_work_plan_id=plan_id)
    plan = Work_Plan.objects.get(pk=plan_id)
    data = []
    for task in tasks:
        reqs = []
        for req in task.requirements.all():
            # Verifica existencia en el componente actual
            inv = Inventory.objects.filter(id=req.id, fk_component=task.fk_work_plan.fk_component).first()
            msg = ""
            if inv and inv.available_quantity == 0:
                # Verificar si existe en otra locación
                others = Inventory.objects.filter(material_name=req.material_name, available_quantity__gt=0).exclude(fk_component=task.fk_work_plan.fk_component)
                if others.exists():
                    msg = " (se necesita orden de requisición a otra locación)"
                else:
                    msg = " (se necesita orden de compra)"
            reqs.append({
                'id': req.id,
                'material_name': req.material_name,
                'available_quantity': inv.available_quantity if inv else 0,
                'msg': msg
            })
        data.append({
            'id': task.id,
            'task': task.task,
            'requirements': [
                {
                    'id': req.id,
                    'material_name': req.material_name,
                    'available_quantity': req.available_quantity
                } for req in task.requirements.all()
            ],
            'start_date': task.start_date.strftime("%Y-%m-%d %H:%M") if task.start_date else "",
            'end_date': task.end_date.strftime("%Y-%m-%d %H:%M") if task.end_date else "",
            'labor_cost': task.labor_cost,
            'finished': task.finished,
        })
    return JsonResponse({'tasks': data, 'plan_status': plan.status})

def components_by_system(request, system_id):
    components = Component.objects.filter(fk_system_id=system_id).values('id', 'component')
    return JsonResponse({'components': list(components)})

@csrf_exempt
@login_required
def task_update(request, pk):
    task = get_object_or_404(Tasks, pk=pk)
    if request.method == 'POST':
        form = TaskForm(request.POST, instance=task)
        if form.is_valid():
            form.save(commit=False)
            form.save()
            form.save_m2m()
            return JsonResponse({'status': 'success', 'message': 'Tarea actualizada correctamente.'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Datos inválidos.', 'errors': form.errors})
    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'})

@csrf_exempt
@login_required
def task_delete(request, pk):
    task = get_object_or_404(Tasks, pk=pk)
    if request.method == 'POST':
        # Sumar existencia si la tarea estaba terminada y tenía requerimiento
        if task.finished and task.requirements:
            from inventory.models import Inventory
            inventario = Inventory.objects.filter(
                material_name=task.requirements,
                fk_component=task.fk_work_plan.fk_component
            ).first()
            if inventario:
                inventario.available_quantity += 1
                inventario.save()
        # Elimina la observación asociada a esta tarea (si existe)
        from component.models import ComponentObservation
        ComponentObservation.objects.filter(fk_task=task).delete()
        task.delete()
        return JsonResponse({'status': 'success', 'message': 'Tarea eliminada.'})
    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'})

def check_and_close_plan(plan):
    if plan.tasks_set.exists() and plan.tasks_set.filter(finished=False).count() == 0:
        plan.status = True
        plan.save()

@csrf_exempt
@login_required
def task_finish(request, pk):
    if request.method == "POST":
        try:
            task = Tasks.objects.get(pk=pk)
            obs_programada = request.POST.get("observation_programada", "").strip()
            obs_no_programada = request.POST.get("observation_no_programada", "").strip()

            # Validación: la programada es obligatoria
            if not obs_programada:
                return JsonResponse({"status": "error", "message": "La observación programada es obligatoria."})

            # Descontar inventario como antes
            for req in task.requirements.all():
                inventario = Inventory.objects.filter(
                    id=req.id,
                    fk_component=task.fk_work_plan.fk_component
                ).first()
                if inventario:
                    if inventario.available_quantity > 0:
                        inventario.available_quantity -= 1
                        inventario.save()
                    else:
                        return JsonResponse({
                            "status": "error",
                            "message": f"No hay existencia de {inventario.material_name} en el inventario, por favor reabastézcalo."
                        })
                else:
                    return JsonResponse({
                        "status": "error",
                        "message": f"No se encontró el requerimiento {req.material_name} en el inventario."
                    })

            # Guardar observaciones
            if task.fk_work_plan and task.fk_work_plan.fk_component:
                from component.models import ComponentObservation
                # Programada (type=0)
                ComponentObservation.objects.create(
                    observation=obs_programada,
                    type=0,
                    fk_component=task.fk_work_plan.fk_component,
                    fk_task=task
                )
                # No programada (type=1), solo si se escribió
                if obs_no_programada:
                    ComponentObservation.objects.create(
                        observation=obs_no_programada,
                        type=1,
                        fk_component=task.fk_work_plan.fk_component,
                        fk_task=task
                    )
            task.finished = True
            task.save()
            check_and_close_plan(task.fk_work_plan)
            return JsonResponse({"status": "success"})
        except Tasks.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Tarea no encontrada."})
    return JsonResponse({"status": "error", "message": "Método no permitido."})

@login_required
def get_observation(request, task_id):
    # Devuelve ambas observaciones (programada y no programada) para la tarea
    obs_programada = ComponentObservation.objects.filter(fk_task_id=task_id, type=0).first()
    obs_no_programada = ComponentObservation.objects.filter(fk_task_id=task_id, type=1).first()
    return JsonResponse({
        "status": "success",
        "observation_programada": obs_programada.observation if obs_programada else "",
        "observation_no_programada": obs_no_programada.observation if obs_no_programada else "",
    })

@csrf_exempt
@login_required
def update_observation(request, task_id):
    if request.method == "POST":
        obs_programada = request.POST.get("observation_programada", "").strip()
        obs_no_programada = request.POST.get("observation_no_programada", "").strip()

        if not obs_programada:
            return JsonResponse({"status": "error", "message": "La observación programada es obligatoria."})

        # Actualizar o crear observación programada
        obs_prog, _ = ComponentObservation.objects.get_or_create(
            fk_task_id=task_id, type=0,
            defaults={
                "fk_component": Tasks.objects.get(pk=task_id).fk_work_plan.fk_component,
                "observation": obs_programada,
            }
        )
        obs_prog.observation = obs_programada
        obs_prog.save()

        # Actualizar o crear observación no programada si hay texto, si no, eliminar si existe
        if obs_no_programada:
            obs_no_prog, _ = ComponentObservation.objects.get_or_create(
                fk_task_id=task_id, type=1,
                defaults={
                    "fk_component": Tasks.objects.get(pk=task_id).fk_work_plan.fk_component,
                    "observation": obs_no_programada,
                }
            )
            obs_no_prog.observation = obs_no_programada
            obs_no_prog.save()
        else:
            ComponentObservation.objects.filter(fk_task_id=task_id, type=1).delete()

        return JsonResponse({"status": "success"})
    return JsonResponse({"status": "error", "message": "Método no permitido."})

@login_required
def search_inventory(request):
    material_ids = request.GET.getlist("material_id")
    if not material_ids:
        return JsonResponse({"status": "error", "message": "Material no especificado."})

    inventories = Inventory.objects.filter(id__in=material_ids)
    if not inventories.exists():
        return JsonResponse({"status": "error", "message": "Material no encontrado."})

    data = []

    for inventory in inventories:
        material_name = inventory.material_name
        available_quantitys = Inventory.objects.filter(material_name=material_name)

        for inv in available_quantitys:
            data.append({
                "material_name": material_name,
                "location": inv.fk_component.component if inv.fk_component else "Sin componente",
                "system": inv.fk_component.fk_system.acronym if inv.fk_component and inv.fk_component.fk_system else "",
                "available_quantity": inv.available_quantity,
            })

    return JsonResponse({"status": "success", "available_quantitys": data})