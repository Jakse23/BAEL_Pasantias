$(document).on('click', '.btn-change-status', function () {
    const orderId = $(this).data('id');
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas cambiar el estado de esta orden de recepción?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/reception_order/change_reception_order_status/' + orderId + '/',
                method: 'POST',
                headers: { 'X-CSRFToken': $('[name=csrfmiddlewaretoken]').val() },
                success: function (response) {
                    if (response.success) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado actualizado!',
                            text: 'El estado de la orden se cambió correctamente a "' + response.new_status + '".',
                            confirmButtonText: 'Aceptar'
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire('Error', response.error || 'No se pudo cambiar el estado.', 'error');
                    }
                },
                error: function () {
                    Swal.fire('Error', 'No se pudo cambiar el estado.', 'error');
                }
            });
        }
    });
});