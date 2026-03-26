// Alerta Eliminación (Sin Cambios, Confirmación, Fallo, Éxito)
$(document).ready(function () {
    $(document).on("click", ".btn-delete-order", function () {
        var row = $(this).closest("tr");
        var orderId = row.data("id");
        Swal.fire({
            title: '¿Está seguro?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "/dispatch_order/delete_dispatch_order/" + orderId + "/",
                    method: "POST",
                    headers: { "X-CSRFToken": $("input[name=csrfmiddlewaretoken]").val() },
                    success: function (data) {
                        var table = $("#datatable-purchase_order").DataTable();
                        table.row(row).remove().draw();
                        Swal.fire('¡Eliminado!', 'La orden ha sido eliminada.', 'success').then(() => {
                            location.reload();
                        });
                    },
                    error: function () {
                        Swal.fire('Error', 'No se pudo eliminar la orden.', 'error');
                    }
                });
            }
        });
    });
});