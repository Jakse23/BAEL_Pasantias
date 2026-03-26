$(document).on("hidden.bs.modal", ".modal", function () {
  setTimeout(function () {
    if ($('.modal.show').length === 0) {
      $(".modal-backdrop").remove();
      $("body").removeClass("modal-open");
      $("body").css("padding-right", "");
    }
  }, 100);
});

$(document).on('click', '#btn-search-inventory', function() {
    let select = $('#requirements-select');
    let materialIds = select.val();
    if (!materialIds || materialIds.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin selección',
            text: 'Seleccione uno o más materiales para consultar.',
            confirmButtonText: 'Entendido',
        });
        return;
    }
    $.ajax({
        url: '/work_plan/search_inventory/',
        data: { material_id: materialIds },
        traditional: true,
        success: function(resp) {
    if (resp.status === 'success') {
        let html = `
        <table id="datatable-inventory-modal" class="table table-sm">
            <thead>
                <tr>
                    <th>Material</th>
                    <th>Locación</th>
                    <th>Sistema</th>
                    <th>Cantidad</th>
                </tr>
            </thead>
            <tbody>`;

        resp.available_quantitys.forEach(function(e) {
            html += `<tr>
                        <td>${e.material_name}</td>
                        <td>${e.location}</td>
                        <td>${e.system}</td>
                        <td>${e.available_quantity}</td>
                    </tr>`;
        });

        html += '</tbody></table>';

        $('#search-inventory-body').html(html);

        const inventoryModal = new bootstrap.Modal(document.getElementById("searchInventoryModal"), {
            backdrop: false,
            focus: true
        });
        inventoryModal.show();

        setTimeout(function() {
            $('#datatable-inventory-modal').DataTable({
                responsive: true,
                paging: true,
                searching: true,
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
        }, 300);
    } else {
        $('#search-inventory-body').html('<div class="alert alert-danger">' + resp.message + '</div>');
        const inventoryModal = new bootstrap.Modal(document.getElementById("searchInventoryModal"), {
            backdrop: false,
            focus: true
        });
        inventoryModal.show();
    }
},
        error: function() {
            $('#search-inventory-body').html('<div class="alert alert-danger">Error al consultar inventario.</div>');
            const inventoryModal = new bootstrap.Modal(document.getElementById("searchInventoryModal"), {
                backdrop: false,
                focus: true
            });
            inventoryModal.show();
        }
    });
});

$('#searchInventoryModal').on('hidden.bs.modal', function () {
    $('#search-inventory-body').html('');
});