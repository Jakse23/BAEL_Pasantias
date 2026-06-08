// Obtener la URL para listar sistemas
const listSystemUrl = document.getElementById('datatable-system').getAttribute('data-list-system-url');

const table = $('#datatable-system').DataTable({
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
    ajax: {
        url: listSystemUrl,
        error: (jqXHR, textStatus, errorThrown) => {
            console.error("Error fetching data:", textStatus, errorThrown);
            Swal.fire('Error!', 'Error al cargar los datos. Por favor, inténtelo de nuevo.', 'error');
        },
    },
    serverSide: true,
    paging: true,
    searching: true,
    responsive: true,
    lengthChange: true,
    columns: [
        {
            data: null,
            render: (data, type, row, meta) => meta.row + meta.settings._iDisplayStart + 1,
        },
        {
            data: null,
            render: (row) => `<p>Grupo ${row.group}</p>`
        },
        { data: "system" },
        { data: "acronym" },
        {
            data: "condition",
            render: function (data, type, row) {
                if (type === 'display') {
                    switch (data) {
                        case 0: return "Disponible";
                        case 1: return "Indisponible";
                        case 2: return "Descartada";
                        default: return "Desconocido";
                    }
                }
                return data;
            }
        }, {
            data: null,
            render: (row) => `<p>${row.status} HV</p>`
        },
        {
            data: null,
            render: (row) => `<p>${row.utility_life} HV</p>`
        },
        {
            data: null,
            render: (row) => {
                const hasObservations = row.observation_count > 0;
                return `
                <button class="btn btn-sm btn-primary edit-system-button" data-id='${row.id}' title="Editar">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-system-button" data-id='${row.id}' title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
                ${hasObservations ? `
                <button class="btn btn-sm btn-warning view-observations-button" 
                    data-id='${row.id}' 
                    title="Ver Observaciones"
                    data-observations='${JSON.stringify(row.observations || []).replace(/'/g, "\\'")}'>
                    <i class="fas fa-eye"></i>
                </button>` : ''}
            `;
            }
        }
    ],
    initComplete: function () {
        initializeSelect2();
    }
});