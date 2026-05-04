// ==================== VARIABLES GLOBALES ====================
let currentDate = new Date();
let events = [];
let C130_ID = null; // Se seteará desde el HTML

// ==================== UTILIDADES ====================
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getColorByPercent(percent) {
    if (percent >= 70) return '#00ccff';
    if (percent >= 40) return '#ffc107';
    return '#dc3545';
}

// ==================== FUNCIONES PARA SUBSISTEMAS ====================
async function updateSubsystemPercentage(subsystem, newPercentage) {
    try {
        const response = await fetch(`/home/api/c130/${C130_ID}/subsystem/update/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                subsystem: subsystem,
                percentage: newPercentage
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Actualizar UI
            document.getElementById(`${subsystem}-percent`).innerText = data.subsystems[subsystem] + '%';
            document.getElementById('globalPercent').innerHTML = data.aeronavegabilidad + '% <i class="fas fa-edit" style="font-size: 14px; margin-left: 10px; color: #00ccff;"></i>';
            
            // Actualizar los otros subsistemas si es necesario
            for (const [key, value] of Object.entries(data.subsystems)) {
                if (key !== subsystem) {
                    document.getElementById(`${key}-percent`).innerText = value + '%';
                }
            }
            
            return true;
        } else {
            Swal.fire('Error', data.error || 'No se pudo actualizar', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error updating subsystem:', error);
        Swal.fire('Error', 'Ocurrió un error al actualizar', 'error');
        return false;
    }
}

async function updateAllSubsystems(newAeronavegabilidad) {
    try {
        const response = await fetch(`/home/api/c130/${C130_ID}/subsystems/update-all/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                aeronavegabilidad: newAeronavegabilidad
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Actualizar UI
            document.getElementById('globalPercent').innerHTML = data.aeronavegabilidad + '% <i class="fas fa-edit" style="font-size: 14px; margin-left: 10px; color: #00ccff;"></i>';
            
            for (const [key, value] of Object.entries(data.subsystems)) {
                document.getElementById(`${key}-percent`).innerText = value + '%';
            }
            
            return true;
        } else {
            Swal.fire('Error', data.error || 'No se pudo actualizar', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error updating all subsystems:', error);
        Swal.fire('Error', 'Ocurrió un error al actualizar', 'error');
        return false;
    }
}

// ==================== GRÁFICAS DONUT ====================
function drawDonut(canvasId, value, color) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    var container = canvas.parentElement;
    var size = Math.min(container.clientWidth, 100);
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    var ctx = canvas.getContext('2d');
    var centerX = size / 2;
    var centerY = size / 2;
    var radius = (size / 2) - 8;
    var startAngle = -Math.PI / 2;
    var endAngle = startAngle + (value / 100) * (Math.PI * 2);
    
    ctx.clearRect(0, 0, size, size);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(radius / 3.5, 4);
    ctx.strokeStyle = 'rgba(50, 50, 70, 0.5)';
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = Math.max(radius / 3.5, 4);
    ctx.strokeStyle = color;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - (radius / 2.8), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fill();
}

function updateDonuts(utilityLife) {
    var usedHours = parseFloat(utilityLife) || 0;
    var totalHours = 12000;
    var remainingHours = totalHours - usedHours;
    
    var usefulPercent = (usedHours / totalHours) * 100;
    var engineHealthPercent = Math.max(0, Math.min(100, 100 - (usedHours / 120)));
    var efficiencyPercent = (92 * 0.4 + engineHealthPercent * 0.6);
    var nextService = 500 - (usedHours % 500);
    if (nextService <= 0) nextService = 500;
    
    drawDonut('donutUseful', usefulPercent, getColorByPercent(100 - usefulPercent));
    drawDonut('donutEngine', engineHealthPercent, getColorByPercent(engineHealthPercent));
    drawDonut('donutEfficiency', efficiencyPercent, getColorByPercent(efficiencyPercent));
    
    document.getElementById('usefulPercentLabel').innerText = usefulPercent.toFixed(0) + '%';
    document.getElementById('enginePercentLabel').innerText = engineHealthPercent.toFixed(0) + '%';
    document.getElementById('efficiencyPercentLabel').innerText = efficiencyPercent.toFixed(0) + '%';
    
    document.getElementById('usedHoursDonut').innerText = Math.floor(usedHours).toLocaleString();
    document.getElementById('remainingDonut').innerText = Math.floor(remainingHours).toLocaleString();
    document.getElementById('engineHealthDonut').innerText = engineHealthPercent.toFixed(0);
    document.getElementById('nextServiceDonut').innerText = Math.floor(nextService);
    document.getElementById('availabilityDonut').innerText = Math.floor(engineHealthPercent * 0.95);
    document.getElementById('reliabilityDonut').innerText = Math.floor(engineHealthPercent * 0.92);
}

// ==================== FUNCIONES DE TAREAS ====================
async function reloadTasks() {
    if (!C130_ID) {
        console.error('C130_ID no está definido');
        return;
    }
    
    try {
        const response = await fetch(`/home/api/c130/${C130_ID}/tasks/`);
        const data = await response.json();
        
        document.getElementById('stat-total').innerText = data.total;
        document.getElementById('stat-completed').innerText = data.completed;
        document.getElementById('stat-progress').innerText = data.in_progress;
        document.getElementById('stat-pending').innerText = data.pending;
        document.getElementById('global-completion-text').innerText = data.global_completion;
        document.getElementById('global-progress-fill').style.width = data.global_completion + '%';
        
        const tasksList = document.getElementById('tasks-list');
        if (data.tasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-tasks">
                    <i class="fas fa-check-circle" style="font-size: 48px;"></i>
                    <p>No hay tareas programadas</p>
                    <p style="font-size: 12px;">Haz clic en "Agregar Tarea" para crear una nueva</p>
                </div>
            `;
        } else {
            tasksList.innerHTML = data.tasks.map(task => `
                <div class="task-item" data-task-id="${task.id}">
                    <div class="task-header">
                        <div class="task-name">
                            ${escapeHtml(task.name)}
                            <span class="task-type ${task.task_type}">${task.task_type_display}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="task-status ${task.status}">${task.status_display}</span>
                            <button class="btn-delete-task" data-task-id="${task.id}" data-task-name="${escapeHtml(task.name)}" title="Eliminar">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="progress-small">
                        <div class="progress-small-fill" style="width: ${task.completion_percentage}%; background: 
                            ${task.completion_percentage >= 70 ? '#00ccff' : (task.completion_percentage >= 30 ? '#ffc107' : '#dc3545')};">
                        </div>
                    </div>
                    <div class="task-footer">
                        <span><i class="fas fa-calendar"></i> ${task.due_date}</span>
                        <span><i class="fas fa-clock"></i> ${task.estimated_hours} hrs</span>
                        <span>${task.completion_percentage}%</span>
                    </div>
                </div>
            `).join('');
            
            document.querySelectorAll('.btn-delete-task').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const taskId = btn.dataset.taskId;
                    const taskName = btn.dataset.taskName;
                    if (taskId && taskName) {
                        deleteTask(taskId, taskName);
                    }
                });
            });
            
            document.querySelectorAll('.task-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (!e.target.closest('.btn-delete-task')) {
                        openTaskModal(item.dataset.taskId);
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error reloading tasks:', error);
    }
}

async function openTaskModal(taskId) {
    try {
        const response = await fetch(`/home/api/task/${taskId}/detail/`);
        const task = await response.json();
        
        const result = await Swal.fire({
            title: task.name,
            html: `
                <div style="text-align: left; padding: 10px;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Tipo:</label>
                        <p style="margin: 0; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 5px;">${task.task_type_display}</p>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Descripción:</label>
                        <p style="margin: 0; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 5px;">${task.description || 'Sin descripción'}</p>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Fecha límite:</label>
                        <p style="margin: 0; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 5px;">${task.due_date}</p>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Horas estimadas:</label>
                        <p style="margin: 0; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 5px;">${task.estimated_hours} hrs</p>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Horas realizadas:</label>
                        <input type="number" id="actual-hours" value="${task.actual_hours}" step="0.5" style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid #00ccff; border-radius: 8px; color: #fff;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Progreso: <span id="progress-val">${task.completion_percentage}</span>%</label>
                        <input type="range" id="task-progress" min="0" max="100" value="${task.completion_percentage}" style="width: 100%;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Estado:</label>
                        <select id="task-status" style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid #00ccff; border-radius: 8px; color: #fff;">
                            <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                            <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>En Progreso</option>
                            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completada</option>
                        </select>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            background: '#0a0f16',
            width: '550px',
            didOpen: () => {
                const progressSlider = document.getElementById('task-progress');
                const progressVal = document.getElementById('progress-val');
                if (progressSlider && progressVal) {
                    progressSlider.addEventListener('input', (e) => {
                        progressVal.innerText = e.target.value;
                    });
                }
            }
        });
        
        if (result.isConfirmed) {
            const actualHours = document.getElementById('actual-hours').value;
            const completionPercentage = document.getElementById('task-progress').value;
            const status = document.getElementById('task-status').value;
            
            const updateResponse = await fetch(`/home/api/task/${taskId}/update/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    actual_hours: parseFloat(actualHours),
                    completion_percentage: parseInt(completionPercentage),
                    status: status
                })
            });
            
            if (updateResponse.ok) {
                Swal.fire('Actualizado', 'La tarea ha sido actualizada', 'success');
                reloadTasks();
            } else {
                const errorData = await updateResponse.json();
                Swal.fire('Error', errorData.message || 'No se pudo actualizar la tarea', 'error');
            }
        }
    } catch (error) {
        console.error('Error opening task modal:', error);
        Swal.fire('Error', 'No se pudo cargar la tarea', 'error');
    }
}

async function deleteTask(taskId, taskName) {
    const result = await Swal.fire({
        title: '¿Eliminar tarea?',
        text: `Estás a punto de eliminar "${taskName}"`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#0a0f16'
    });
    
    if (result.isConfirmed) {
        try {
            const response = await fetch(`/home/api/task/${taskId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                Swal.fire('Eliminada', 'Tarea eliminada correctamente', 'success');
                reloadTasks();
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.message || 'No se pudo eliminar la tarea', 'error');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            Swal.fire('Error', 'Ocurrió un error al eliminar la tarea', 'error');
        }
    }
}

async function createTask() {
    const { value: formValues } = await Swal.fire({
        title: 'Nueva Tarea',
        html: `
            <div style="text-align: left; padding: 10px; min-width: 350px;">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Nombre:</label>
                    <input type="text" id="task-name" class="swal2-input" placeholder="Nombre de la tarea" style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid #00ccff; border-radius: 8px; color: #fff;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Tipo:</label>
                    <select id="task-type" style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid #00ccff; border-radius: 8px; color: #fff;">
                        <option value="maintenance">Mantenimiento</option>
                        <option value="inspection">Inspección</option>
                        <option value="overhaul">Overhaul</option>
                        <option value="calibration">Calibración</option>
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Descripción:</label>
                    <textarea id="task-description" rows="3" style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid #00ccff; border-radius: 8px; color: #fff; resize: vertical;"></textarea>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Fecha límite:</label>
                    <input type="date" id="task-due-date" style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid #00ccff; border-radius: 8px; color: #fff;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Horas estimadas:</label>
                    <input type="number" id="task-estimated-hours" step="0.5" style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid #00ccff; border-radius: 8px; color: #fff;">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Crear',
        cancelButtonText: 'Cancelar',
        background: '#0a0f16',
        width: '600px',
        preConfirm: () => {
            const name = document.getElementById('task-name').value;
            const task_type = document.getElementById('task-type').value;
            const description = document.getElementById('task-description').value;
            const due_date = document.getElementById('task-due-date').value;
            const estimated_hours = document.getElementById('task-estimated-hours').value;
            
            if (!name) {
                Swal.showValidationMessage('El nombre de la tarea es requerido');
                return false;
            }
            if (!due_date) {
                Swal.showValidationMessage('La fecha límite es requerida');
                return false;
            }
            if (!estimated_hours || estimated_hours <= 0) {
                Swal.showValidationMessage('Las horas estimadas son requeridas y deben ser mayores a 0');
                return false;
            }
            
            return {
                name: name,
                task_type: task_type,
                description: description,
                due_date: due_date,
                estimated_hours: parseFloat(estimated_hours)
            };
        }
    });
    
    if (formValues) {
        try {
            Swal.fire({
                title: 'Creando tarea...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            const response = await fetch(`/home/api/c130/${C130_ID}/tasks/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify(formValues)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                Swal.fire('Creada', 'Tarea creada correctamente', 'success');
                reloadTasks();
            } else {
                console.error('Error del servidor:', data);
                Swal.fire('Error', data.error || data.message || 'No se pudo crear la tarea', 'error');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            Swal.fire('Error', 'Ocurrió un error al crear la tarea: ' + error.message, 'error');
        }
    }
}

// ==================== FUNCIONES DE CALENDARIO ====================
async function loadEvents() {
    if (!C130_ID) {
        console.error('C130_ID no está definido');
        renderCalendar();
        return;
    }
    
    try {
        const response = await fetch(`/home/api/c130/${C130_ID}/events/`);
        events = await response.json();
        renderCalendar();
    } catch (error) {
        console.error('Error loading events:', error);
        renderCalendar();
    }
}

function getEventTypeDisplay(type) {
    const types = {
        'maintenance': 'Mantenimiento',
        'inspection': 'Inspección',
        'overhaul': 'Overhaul'
    };
    return types[type] || type;
}

function renderCalendar() {
    if (!currentDate || isNaN(currentDate.getTime())) {
        currentDate = new Date();
    }
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const monthDays = lastDay.getDate();
    
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthYearElement = document.getElementById('monthYear');
    if (monthYearElement) {
        monthYearElement.innerHTML = `${monthNames[month]} ${year}`;
    }
    
    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;
    
    calendarDays.innerHTML = '';
    
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day', 'empty');
        calendarDays.appendChild(emptyDay);
    }
    
    const today = new Date();
    for (let day = 1; day <= monthDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.innerText = day;
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const dayEvents = events.filter(e => e.date === dateStr);
        if (dayEvents.length > 0) {
            dayEvents.forEach(event => {
                dayElement.classList.add(event.event_type);
            });
        }
        
        if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === day) {
            dayElement.classList.add('calendar-today');
        }
        
        dayElement.addEventListener('click', async () => {
            if (dayEvents.length > 0) {
                const eventList = dayEvents.map(e => `${e.title} (${getEventTypeDisplay(e.event_type)})`).join('\n');
                const result = await Swal.fire({
                    title: `Eventos del ${dateStr}`,
                    text: eventList + '\n\n¿Desea eliminar todos los eventos de este día?',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar',
                    background: '#0a0f16'
                });
                
                if (result.isConfirmed) {
                    for (const event of dayEvents) {
                        await fetch(`/home/api/event/${event.id}/delete/`, {
                            method: 'DELETE',
                            headers: {
                                'X-CSRFToken': csrftoken
                            }
                        });
                    }
                    await loadEvents();
                    Swal.fire('Eliminados', 'Eventos eliminados correctamente', 'success');
                }
            } else {
                Swal.fire('Sin eventos', 'No hay eventos programados para este día', 'info');
            }
        });
        
        calendarDays.appendChild(dayElement);
    }
}

async function addEvent() {
    const { value: formValues } = await Swal.fire({
        title: 'Agregar Evento',
        html: `
            <div style="text-align: left; padding: 10px;">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Título del evento</label>
                    <input type="text" id="event-title" class="swal2-input" placeholder="Ej: Inspección de motores" style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid #00ccff; border-radius: 8px; color: #fff;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Tipo de evento</label>
                    <select id="event-type" style="width:100%; padding: 10px; background:#0a0f16; color:#fff; border:1px solid #00ccff; border-radius:8px;">
                        <option value="maintenance">Mantenimiento</option>
                        <option value="inspection">Inspección</option>
                        <option value="overhaul">Overhaul</option>
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Fecha</label>
                    <input type="date" id="event-date" style="width:100%; padding: 10px; background:#0a0f16; color:#fff; border:1px solid #00ccff; border-radius:8px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #00ccff; font-size: 13px; font-weight: bold; margin-bottom: 8px;">Descripción (opcional)</label>
                    <textarea id="event-description" rows="3" placeholder="Detalles del evento..." style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.5); border: 1px solid #00ccff; border-radius: 8px; color: #fff; resize: vertical;"></textarea>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar',
        background: '#0a0f16',
        width: '550px',
        preConfirm: () => {
            const title = document.getElementById('event-title').value;
            const event_type = document.getElementById('event-type').value;
            const date = document.getElementById('event-date').value;
            const description = document.getElementById('event-description').value;
            
            if (!title || !date) {
                Swal.showValidationMessage('Título y fecha son requeridos');
                return false;
            }
            
            return {
                title: title,
                event_type: event_type,
                date: date,
                description: description
            };
        }
    });
    
    if (formValues) {
        try {
            const response = await fetch(`/home/api/c130/${C130_ID}/events/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify(formValues)
            });
            
            if (response.ok) {
                Swal.fire('Agregado', 'Evento agregado correctamente', 'success');
                await loadEvents();
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.message || 'No se pudo agregar el evento', 'error');
            }
        } catch (error) {
            console.error('Error adding event:', error);
            Swal.fire('Error', 'Ocurrió un error al agregar el evento', 'error');
        }
    }
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar C130_ID desde el HTML
    if (window.C130_ID) {
        C130_ID = window.C130_ID;
    } else {
        const c130IdElement = document.getElementById('c130-id');
        if (c130IdElement) {
            C130_ID = parseInt(c130IdElement.value);
        }
    }
    
    console.log('C130_ID inicializado:', C130_ID);
    
    // Inicializar variables
    currentDate = new Date();
    events = [];
    
    // Actualizar donuts
    const utilityLifeElement = document.getElementById('utility-life-data');
    const utilityLife = utilityLifeElement?.dataset?.value || '0';
    updateDonuts(utilityLife);
    
    // Cargar eventos y tareas
    loadEvents();
    reloadTasks();
    
    // ========== EVENTOS PARA SUBSISTEMAS ==========
    // Editar aeronavegabilidad general (click en el porcentaje)
    const globalPercent = document.getElementById('globalPercent');
    if (globalPercent) {
        globalPercent.addEventListener('click', async () => {
            const currentPercentText = document.getElementById('globalPercent').innerText;
            const currentPercent = parseFloat(currentPercentText);
            
            const { value: newPercent } = await Swal.fire({
                title: 'Editar Aeronavegabilidad General',
                input: 'range',
                inputLabel: 'Porcentaje general de la aeronave',
                inputValue: currentPercent,
                inputAttributes: {
                    min: 0,
                    max: 100,
                    step: 1
                },
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar',
                background: '#0a0f16'
            });
            
            if (newPercent !== undefined && newPercent !== currentPercent) {
                await updateAllSubsystems(newPercent);
            }
        });
    }
    
    // Editar subsistemas individuales
    document.querySelectorAll('.edit-subsystem').forEach(icon => {
        icon.addEventListener('click', async (e) => {
            e.stopPropagation();
            const row = icon.closest('.subsystem-row');
            const subsystem = row.dataset.subsystem;
            const currentPercentSpan = document.getElementById(`${subsystem}-percent`);
            const currentPercent = parseInt(currentPercentSpan.innerText);
            
            const subsystemNames = {
                'estructural': 'Estructural',
                'propulsion': 'Propulsión',
                'control_vuelo': 'Control de Vuelo',
                'avionica': 'Aviónica'
            };
            
            const { value: newPercent } = await Swal.fire({
                title: `Editar ${subsystemNames[subsystem]}`,
                input: 'range',
                inputLabel: 'Porcentaje del subsistema',
                inputValue: currentPercent,
                inputAttributes: {
                    min: 0,
                    max: 100,
                    step: 1
                },
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar',
                background: '#0a0f16'
            });
            
            if (newPercent !== undefined && newPercent !== currentPercent) {
                await updateSubsystemPercentage(subsystem, newPercent);
            }
        });
    });
    
    // ========== EVENTOS DE TAREAS Y CALENDARIO ==========
    const addTaskBtn = document.getElementById('btn-add-task');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', createTask);
    }
    
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            if (currentDate) {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar();
            }
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            if (currentDate) {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar();
            }
        });
    }
    
    const addEventBtn = document.getElementById('addEventBtn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', addEvent);
    }
});