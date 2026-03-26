$(document).ready(function () {
    $("#datatable-requisition_order").DataTable({
        responsive: true,
        paging: true,
        info: true,
        ordering: false,
        language: {
            lengthMenu: "Mostrar _MENU_ registros",
            zeroRecords: "No se encontraron resultados",
            info: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
            infoFiltered: "(filtrado de un total de _MAX_ registros)",
            sSearch: "Buscar:",
            sProcessing: "Procesando...",
            emptyTable: "No hay datos disponibles en la tabla",
            oPaginate: {
                sFirst: "Primero",
                sLast: "Último",
                sNext: "Siguiente",
                sPrevious: "Anterior",
            },
        },
        columnDefs: [{ className: "centered", targets: "_all" }],
    });
});