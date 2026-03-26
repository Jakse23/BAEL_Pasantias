// Inicializar DataTable
const table = $('#datatable-system-dash').DataTable({
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
        },
        {
            data: 'maintenance_info', // Columna 4: Nivel de Mantenimiento (Nivel X (Y HV))
            render: function (data) {
                return data || "N/A";
            }
        },
        {
            data: null,
            render: (row) => `<p>${row.status} HV</p>`
        },
        {
            data: null,
            render: function (data) {
                let alertButton = '';
                if (data.progress >= 100) {
                    alertButton = `
                        <button class="btn btn-danger btn-sm"
                            onclick="showInspectionAlert('${data.acronym}')">
                            <i class="fa-solid fa-check"></i>
                        </button>`;
                } else if (data.progress > 90) {
                    alertButton = `
                        <button class="btn btn-warning btn-sm"
                            onclick="showWarningAlert('${data.acronym}')">
                            <i class="fa-solid fa-exclamation"></i>
                        </button>`;
                }

                return `
                    <div class="d-flex align-items-center">
                    <p>${data.progress}%  </p>
                        <div class="progress progress-sm flex-grow-1 me-2">
                            <div class="progress-bar text-bg-primary"
                                style="width: ${data.progress}%">
                            </div>
                        </div>
                        ${alertButton}
                    </div>`;
            }
        }
    ],
    initComplete: function () {
        initializeSelect2();
    }
});