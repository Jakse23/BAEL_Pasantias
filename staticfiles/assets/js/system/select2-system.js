// Inicializar Select2 en los filtros
function initializeSelect2() {
    $('#filter-group, #filter-condition, #filter-system, #filter-acronym').select2({
        placeholder: "Seleccionar",
        allowClear: true,
        width: '100%',
        dropdownParent: $('#generate-pdf-modal')
    });

    // Inicializar Select2 para grupo (múltiple) y sistema (múltiple)
    $('#filter-group').select2({
        placeholder: "Seleccionar grupo(s)",
        allowClear: true,
        width: '100%',
        dropdownParent: $('#generate-pdf-modal')
    });

    $('#filter-system').select2({
        placeholder: "Seleccionar sistema(s)",
        allowClear: true,
        width: '100%',
        dropdownParent: $('#generate-pdf-modal')
    });

}

// Manejar cambio en el filtro de grupos
$('#filter-group').on('change', function () {
    const selectedGroupIds = $(this).val();
    const systemSelect = $('#filter-system');
    const warningDiv = $('#system-multi-warning');

    systemSelect.prop('disabled', false);
    warningDiv.hide();

    if (!selectedGroupIds || selectedGroupIds.length === 0) {
        // Sin grupo seleccionado: mostrar todos los sistemas desde el backend
        systemSelect.empty();
        $.ajax({
            url: `/system/get_all_systems/`,
            method: 'GET',
            success: function (response) {
                if (response.status === 'success') {
                    response.systems.forEach(system => {
                        systemSelect.append(new Option(system.name, system.id));
                    });
                    systemSelect.val(null).trigger('change');
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function () {
                Swal.fire('Error', 'Ocurrió un error al cargar los sistemas.', 'error');
            }
        });
    } else {
        // Uno o varios grupos seleccionados: mostrar sistemas de todos los grupos seleccionados
        systemSelect.empty();
        let requests = [];
        selectedGroupIds.forEach(groupId => {
            requests.push(
                $.ajax({
                    url: `/system/get_systems_by_group/${groupId}/`,
                    method: 'GET'
                })
            );
        });
        $.when.apply($, requests).done(function () {
            let allSystems = [];
            if (requests.length === 1) {
                let response = arguments[0];
                if (response.status === 'success') {
                    allSystems = response.systems;
                }
            } else {
                for (let i = 0; i < arguments.length; i++) {
                    let response = arguments[i][0];
                    if (response.status === 'success') {
                        allSystems = allSystems.concat(response.systems);
                    }
                }
            }
            // Eliminar duplicados por id
            const uniqueSystems = [];
            const seenIds = new Set();
            allSystems.forEach(system => {
                if (!seenIds.has(system.id)) {
                    uniqueSystems.push(system);
                    seenIds.add(system.id);
                }
            });
            uniqueSystems.forEach(system => {
                systemSelect.append(new Option(system.name, system.id));
            });
            systemSelect.val(null).trigger('change');
        });
    }
});

// Eliminar opciones duplicadas en el select de sistemas
$(document).ready(function () {
    const systemSelect = $('#filter-system');
    const seenSystems = new Set();

    systemSelect.find('option').each(function () {
        const systemText = $(this).text().trim();
        if (seenSystems.has(systemText) && systemText !== "Todos") {
            $(this).remove();
        } else {
            seenSystems.add(systemText);
        }
    });

    systemSelect.select2({
        placeholder: "Seleccionar el sistema",
        allowClear: true,
        width: '100%',
        dropdownParent: $('#generate-pdf-modal')
    });
});

$(document).ready(function () {
    // Select2 para el select de grupo en la modal de añadir
    $('#fk_group').select2({
        dropdownParent: $('#register-modal'),
        width: '100%',
        placeholder: "Seleccionar grupo"
    });

    // Select2 para el select de grupo en la modal de editar
    $('#edit-fk-group').select2({
        dropdownParent: $('#edit-modal'),
        width: '100%',
        placeholder: "Seleccionar grupo"
    });
});