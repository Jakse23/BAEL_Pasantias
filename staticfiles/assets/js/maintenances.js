$(document).ready(function () {
    $('#datatable-maintenances').DataTable({
        language: {
            "lengthMenu": "Mostrar _MENU_ registros",
            "zeroRecords": "No se encontraron resultados",
            "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "infoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sSearch": "Buscar:",
            "sProcessing": "Procesando...",
            "emptyTable": "No hay datos disponibles en la tabla",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Último",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            },
        },
        paging: true,
        searching: true,
        responsive: true,
        lengthChange: true,
    });
});

document.getElementById('datetime').addEventListener('input', function () {
    const inputDate = new Date(this.value); // Convertir el valor del campo a un objeto Date
    const year = inputDate.getFullYear(); // Obtener el año de la fecha

    if (year > 2100) { // Verificar si el año excede el límite razonable
        Swal.fire({
            title: 'Fecha inválida',
            text: 'El año ingresado es demasiado alto. Por favor, ingrese una fecha válida.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
        });

        // Limpiar el campo de fecha para evitar valores inválidos
        this.value = '';
    }
});

document.getElementById('edit-datetime').addEventListener('input', function () {
    const inputDate = new Date(this.value); // Convertir el valor del campo a un objeto Date
    const year = inputDate.getFullYear(); // Obtener el año de la fecha

    if (year > 2100) { // Verificar si el año excede el límite razonable
        Swal.fire({
            title: 'Fecha inválida',
            text: 'El año ingresado es demasiado alto. Por favor, ingrese una fecha válida.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
        });

        // Limpiar el campo de fecha para evitar valores inválidos
        this.value = '';
    }
});


$(document).ready(function () {
    $('#fk_component').select2({
        placeholder: "Seleccione los componentes", // Texto de ayuda
        allowClear: true, // Permite limpiar la selección
        width: '100%', // Ajusta el ancho al contenedor
        minimumResultsForSearch: 0, // Habilita la búsqueda incluso si hay pocas opciones
        dropdownParent: $('#register-modal')
    });
});

$('#fk_component').on('change', function () {
    const selectedOptions = $(this).val(); // Obtiene los valores seleccionados
    const observationContainer = document.getElementById('observation-container');

    // Mantén un registro de los campos de observación existentes
    const existingObservations = {};
    observationContainer.querySelectorAll('textarea').forEach(textarea => {
        existingObservations[textarea.id] = textarea.value; // Guarda el contenido actual
    });

    // Limpia el contenedor de observación
    observationContainer.innerHTML = '';

    if (!selectedOptions || selectedOptions.length === 0) {
        console.log('No se seleccionaron componentes.');
        return;
    }

    // Genera dinámicamente un campo de observación para cada componente seleccionado
    selectedOptions.forEach(componentId => {
        const componentName = $(`#fk_component option[value="${componentId}"]`).text();

        // Contenedor para el campo de observación
        const observationDiv = document.createElement('div');
        observationDiv.classList.add('mb-3');

        const observationLabel = document.createElement('label');
        observationLabel.textContent = `Observación para ${componentName}:`;
        observationLabel.setAttribute('for', `observation-${componentId}`);

        const observationInput = document.createElement('textarea');
        observationInput.name = `observation-${componentId}`;
        observationInput.id = `observation-${componentId}`;
        observationInput.classList.add('form-control');
        observationInput.rows = 3;

        // Restaura el valor si ya existía
        if (existingObservations[observationInput.id]) {
            observationInput.value = existingObservations[observationInput.id];
        }

        observationDiv.appendChild(observationLabel);
        observationDiv.appendChild(observationInput);

        observationContainer.appendChild(observationDiv);
    });
});

// Añadir mantenimiento con confirmación
document.getElementById('maintenance-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const progPercentInput = document.querySelector('#maintenance-form input[name="prog_percent"]');
    const progPercentValue = progPercentInput.value.trim();

    // Validar que el valor sea un número entre 1 y 100 con hasta dos decimales
    const progPercentRegex = /^(100(\.00?)?|0(\.0{1,2})?|[1-9]?\d(\.\d{1,2})?)$/;
    if (!progPercentRegex.test(progPercentValue)) {
        Swal.fire({
            title: 'Error',
            text: 'El campo "Progreso" debe ser un número entre 1 y 100 con hasta dos decimales (Ej.: 20.20).',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const form = this;

    Swal.fire({
        title: '¿Registrar mantenimiento?',
        text: "¿Está seguro de registrar este mantenimiento? Tenga en cuenta que, una vez registrado, no podrá cambiar el sistema seleccionado.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, registrar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        Swal.fire({
                            title: '¡Éxito!',
                            text: data.message,
                            icon: 'success',
                            confirmButtonText: 'Aceptar'
                        }).then(() => {
                            form.reset();
                            window.location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: 'Error',
                            text: data.message,
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        });
                    }
                })
                .catch(error => {
                    Swal.fire({
                        title: 'Error',
                        text: 'Ocurrió un error inesperado.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                });
        }
        // Si cancela, no hace nada
    });
});




$(document).ready(function () {
    // Inicializar Select2 para el select de sistemas
    $('#fk_system').select2({
        placeholder: "Seleccionar un sistema", // Texto de ayuda
        allowClear: true, // Permite limpiar la selección
        width: '100%', // Ajusta el ancho al contenedor
        minimumResultsForSearch: 0, // Habilita la búsqueda incluso si hay pocas opciones
        dropdownParent: $('#register-modal') // Asegura que el dropdown se muestre dentro del modal
    });

    // Manejar el evento 'change' para cargar los componentes asociados
    $('#fk_system').on('change', function () {
        const systemId = $(this).val(); // Obtener el ID del sistema seleccionado
        const componentsSelect = $('#fk_component');

        // Limpia las opciones del select de componentes y el contenedor de observaciones
        componentsSelect.empty().trigger('change');
        $('#observation-container').empty();

        if (!systemId) {
            console.error('No se seleccionó un sistema.');
            return;
        }

        // Realiza la solicitud para obtener los componentes asociados al sistema seleccionado
        fetch(`/component/get_components/${systemId}/`)
            .then(response => response.json())
            .then(data => {
                console.log('Datos recibidos:', data); // Depuración
                data.components.forEach(component => {
                    const option = new Option(component.component, component.id, false, false);
                    componentsSelect.append(option);
                });
                componentsSelect.trigger('change'); // Actualiza Select2
            })
            .catch(error => {
                console.error('Error al cargar los componentes:', error);
            });
    });
});

//editar

$(document).ready(function () {
    const componentsSelect = $('#fk_component-edit');
    const observationContainer = document.getElementById('edit-observation-container');

    // Inicializar Select2 para el select múltiple de edición
    componentsSelect.select2({
        placeholder: "Seleccione los componentes",
        allowClear: true,
        width: '100%',
        minimumResultsForSearch: 0,
        dropdownParent: $('#edit-maintenance-modal')
    });

    // Función para crear campos de observación para un componente
    function createObservationField(componentId, componentName, initialValue = '') {
        if (observationContainer.querySelector(`[data-component-id="${componentId}"]`)) return;

        const observationDiv = document.createElement('div');
        observationDiv.classList.add('mb-3', 'observation-group');
        observationDiv.dataset.componentId = componentId;

        const componentNameP = document.createElement('p');
        componentNameP.textContent = `Componente: ${componentName}`;
        componentNameP.classList.add('fw-bold');

        const observationLabel = document.createElement('label');
        observationLabel.textContent = 'Observación:';
        observationLabel.setAttribute('for', `edit-observation-${componentId}`);

        const observationTextarea = document.createElement('textarea');
        observationTextarea.name = `observation-${componentId}`;
        observationTextarea.id = `edit-observation-${componentId}`;
        observationTextarea.classList.add('form-control');
        observationTextarea.rows = 3;
        observationTextarea.value = initialValue;

        const deleteBtn = document.createElement('button');
        deleteBtn.type = "button";
        deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'mt-2');
        deleteBtn.textContent = 'Eliminar componente';
        deleteBtn.addEventListener('click', () => {
            const optionToRemove = componentsSelect.find(`option[value="${componentId}"]`);
            optionToRemove.prop('selected', false);
            componentsSelect.trigger('change');
            observationDiv.remove();
        });

        observationDiv.appendChild(componentNameP);
        observationDiv.appendChild(observationLabel);
        observationDiv.appendChild(observationTextarea);
        observationDiv.appendChild(deleteBtn);

        observationContainer.appendChild(observationDiv);
    }





    $('#fk_component-edit').on('change', function () {
        const selectedOptions = $(this).val(); // array de ids
        const observationContainer = document.getElementById('edit-observation-container');

        // Guarda los valores actuales
        const existingObservations = {};
        observationContainer.querySelectorAll('textarea').forEach(textarea => {
            existingObservations[textarea.id] = textarea.value;
        });

        // Limpia el contenedor
        observationContainer.innerHTML = '';

        if (!selectedOptions || selectedOptions.length === 0) return;

        selectedOptions.forEach(componentId => {
            const componentName = $(`#fk_component-edit option[value="${componentId}"]`).text();

            // Crea el campo y restaura el valor si existe
            const observationDiv = document.createElement('div');
            observationDiv.classList.add('mb-3', 'observation-group');
            observationDiv.dataset.componentId = componentId;

            const componentNameP = document.createElement('p');
            componentNameP.textContent = `Componente: ${componentName}`;
            componentNameP.classList.add('fw-bold');

            const observationLabel = document.createElement('label');
            observationLabel.textContent = 'Observación:';
            observationLabel.setAttribute('for', `edit-observation-${componentId}`);

            const observationTextarea = document.createElement('textarea');
            observationTextarea.name = `observation-${componentId}`;
            observationTextarea.id = `edit-observation-${componentId}`;
            observationTextarea.classList.add('form-control');
            observationTextarea.rows = 3;
            // Restaura el valor si ya existía
            observationTextarea.value = existingObservations[`edit-observation-${componentId}`] || '';

            // Botón para eliminar este componente
            const deleteBtn = document.createElement('button');
            deleteBtn.type = "button";
            deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'mt-2');
            deleteBtn.textContent = 'Eliminar componente';
            deleteBtn.addEventListener('click', () => {
                const optionToRemove = $('#fk_component-edit').find(`option[value="${componentId}"]`);
                optionToRemove.prop('selected', false);
                $('#fk_component-edit').trigger('change');
                observationDiv.remove();
            });

            observationDiv.appendChild(componentNameP);
            observationDiv.appendChild(observationLabel);
            observationDiv.appendChild(observationTextarea);
            observationDiv.appendChild(deleteBtn);

            observationContainer.appendChild(observationDiv);
        });
    });

    function removeComponent(id) {
        const select = $('#fk_component-edit');
        const selected = select.val().filter(value => value !== String(id));
        select.val(selected).trigger('change');
    }
    window.removeComponent = removeComponent;

    // Función para cargar componentes en el select y mostrar observaciones
    function loadComponentsForEdit(systemId, preselectedIds = [], observationsMap = {}) {
        fetch(`/component/get_components/${systemId}/`)
            .then(response => response.json())
            .then(data => {
                const componentSelect = $('#fk_component-edit');
                componentSelect.empty();

                const components = data.components || [];

                // Agregar opciones al select2
                components.forEach(c => {
                    const option = new Option(c.component, c.id, false, preselectedIds.includes(String(c.id)));
                    componentSelect.append(option);
                });

                componentSelect.trigger('change');

                // Guardar todos los componentes en el elemento para uso posterior
                $('#fk_component-edit').data('components', components);

                // Inicializar campos de observación
                const observationContainer = document.getElementById('edit-observation-container');
                observationContainer.innerHTML = '';

                preselectedIds.forEach(id => {
                    let name = '';
                    const match = components.find(c => String(c.id) === String(id));
                    if (match) {
                        name = match.component;
                    } else {
                        name = `Componente ID ${id}`;
                    }
                    const observation = observationsMap[id] || '';
                    createObservationField(id, name, observation);
                });
            });
    }


    // Cambiar sistema en modal de edición
    $('#edit-fk-system').on('change', function () {
        const systemId = $(this).val();
        loadComponentsForEdit(systemId);
    });

    // Cambiar selección de componentes
    componentsSelect.on('change', function () {
        const selectedIds = $(this).val() || [];
        const existingDivs = Array.from(observationContainer.querySelectorAll('.observation-group'))
            .map(div => div.dataset.componentId);

        selectedIds.forEach(id => {
            if (!existingDivs.includes(id)) {
                const option = componentsSelect.find(`option[value="${id}"]`);
                const name = option.text();
                createObservationField(id, name);
            }
        });

        existingDivs.forEach(id => {
            if (!selectedIds.includes(id)) {
                const toRemove = observationContainer.querySelector(`[data-component-id="${id}"]`);
                if (toRemove) toRemove.remove();
            }
        });
    });

    // Botón para abrir modal con datos precargados
    document.querySelectorAll('.edit-maintenance-button').forEach(button => {
        button.addEventListener('click', function () {
            const maintenanceId = this.getAttribute('data-id');

            fetch(`/maintenances/get_maintenance/${maintenanceId}/`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        document.getElementById('edit-maintenance-id').value = data.maintenance.id;
                        document.getElementById('edit-datetime').value = data.maintenance.datetime;
                        document.getElementById('edit-prog-percent').value = data.maintenance.prog_percent;
                        document.getElementById('edit-fk-maintenance-level').value = data.maintenance.fk_maintenance_level;
                        document.getElementById('edit-fk-system').value = data.maintenance.fk_system;

                        const observationsMap = {};
                        const preselectedIds = [];

                        data.components.forEach(c => {
                            preselectedIds.push(String(c.id));
                            observationsMap[c.id] = c.observation || '';
                        });

                        loadComponentsForEdit(data.maintenance.fk_system, preselectedIds, observationsMap);

                        const editModal = new bootstrap.Modal(document.getElementById('edit-maintenance-modal'));
                        editModal.show();
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                })
                .catch(error => {
                    Swal.fire('Error', 'Ocurrió un error inesperado.', 'error');
                });
        });
    });
});

// Editar mantenimiento con confirmación
document.getElementById('edit-maintenance-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const progPercentInput = document.querySelector('#edit-maintenance-form input[name="edit_prog_percent"]');
    const progPercentValue = progPercentInput.value.trim();

    // Validar que el valor sea un número entre 1 y 100 con hasta dos decimales
    const progPercentRegex = /^(100(\.00?)?|[1-9]?\d(\.\d{1,2})?)$/;
    if (!progPercentRegex.test(progPercentValue)) {
        Swal.fire({
            title: 'Error',
            text: 'El campo "Progreso" debe ser un número entre 1 y 100 con hasta dos decimales (Ej.: 20.20).',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const form = this;
    const formData = new FormData(form);

    // Capturar los componentes seleccionados del Select2
    const selectedComponents = $('#fk_component-edit').val();
    if (selectedComponents && selectedComponents.length > 0) {
        selectedComponents.forEach(id => {
            formData.append('components[]', id);
            const obsInput = document.getElementById(`edit-observation-${id}`);
            const observation = obsInput ? obsInput.value : '';
            formData.append(`observation-${id}`, observation);
        });
    }

    Swal.fire({
        title: '¿Guardar cambios?',
        text: "¿Estás seguro de que deseas actualizar este mantenimiento?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/maintenances/maintenance_update/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        Swal.fire('Éxito', data.message, 'success').then(() => {
                            const editModal = bootstrap.Modal.getInstance(document.getElementById('edit-maintenance-modal'));
                            editModal.hide();
                            location.reload();
                        });
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                })
                .catch(error => {
                    Swal.fire('Error', 'Ocurrió un error inesperado.', 'error');
                });
        }
        // Si cancela, no hace nada
    });
});



$(document).ready(function () {
    $('#fk_component-edit').select2({
        placeholder: "Seleccione los componentes", // Texto de ayuda
        allowClear: true, // Permite limpiar la selección
        width: '100%', // Ajusta el ancho al contenedor
        minimumResultsForSearch: 0, // Habilita la búsqueda incluso si hay pocas opciones
        dropdownParent: $('#edit-maintenance-modal')
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const componentsSelect = $('#fk_component-edit');
    const observationContainer = document.getElementById('edit-observation-container');

    // Inicializar Select2 para el select múltiple de edición
    componentsSelect.select2({
        placeholder: "Seleccione los componentes",
        allowClear: true,
        width: '100%',
        minimumResultsForSearch: 0,
        dropdownParent: $('#edit-maintenance-modal')
    });

    // Función para crear campo observación para componente
    function createObservationField(componentId, componentName, initialValue = '') {
        // Verificar si ya existe campo para este componente
        if (observationContainer.querySelector(`[data-component-id="${componentId}"]`)) {
            return; // ya existe campo, no creamos otro
        }

        const observationDiv = document.createElement('div');
        observationDiv.classList.add('mb-3', 'observation-group');
        observationDiv.dataset.componentId = componentId;

        const componentNameP = document.createElement('p');
        componentNameP.textContent = `Componente: ${componentName}`;
        componentNameP.classList.add('fw-bold');

        const observationLabel = document.createElement('label');
        observationLabel.textContent = 'Observación:';
        observationLabel.setAttribute('for', `edit-observation-${componentId}`);

        const observationTextarea = document.createElement('textarea');
        observationTextarea.name = `observation-${componentId}`;
        observationTextarea.id = `edit-observation-${componentId}`;
        observationTextarea.classList.add('form-control');
        observationTextarea.rows = 3;
        observationTextarea.value = initialValue;

        // Botón para eliminar este componente y su campo de observación
        const deleteBtn = document.createElement('button');
        deleteBtn.type = "button";
        deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'mt-2');
        deleteBtn.textContent = 'Eliminar componente';
        deleteBtn.addEventListener('click', () => {
            // Remover la opción de select2
            const optionToRemove = componentsSelect.find(`option[value="${componentId}"]`);
            optionToRemove.prop('selected', false);
            componentsSelect.trigger('change');

            // Remover el campo de observación
            observationDiv.remove();
        });

        observationDiv.appendChild(componentNameP);
        observationDiv.appendChild(observationLabel);
        observationDiv.appendChild(observationTextarea);
        observationDiv.appendChild(deleteBtn);

        observationContainer.appendChild(observationDiv);
    }

    // Evento cambio en select múltiple componentes en edición
    componentsSelect.on('change', function () {
        const selectedComponentIds = $(this).val() || [];

        // Obtener todos los campos de observaciones actuales
        const currentObservationFields = Array.from(observationContainer.querySelectorAll('.observation-group'))
            .map(div => div.dataset.componentId);

        // Añadir campos para los nuevos componentes seleccionados
        selectedComponentIds.forEach(componentId => {
            if (!currentObservationFields.includes(componentId)) {
                // Obtener nombre del componente de la opción select
                const componentName = componentsSelect.find(`option[value="${componentId}"]`).text();
                createObservationField(componentId, componentName);
            }
        });

        // Eliminar campos para componentes que ya no están seleccionados
        currentObservationFields.forEach(componentId => {
            if (!selectedComponentIds.includes(componentId)) {
                const fieldToRemove = observationContainer.querySelector(`[data-component-id="${componentId}"]`);
                if (fieldToRemove) {
                    fieldToRemove.remove();
                }
            }
        });
    });

    // Opcional: Cuando cargas datos existentes al abrir modal, por ejemplo,
    // llama a createObservationField para cada componente con su respectiva observación.
});


