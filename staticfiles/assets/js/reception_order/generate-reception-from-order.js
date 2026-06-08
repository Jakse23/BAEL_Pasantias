$(document).on('click', '.btn-generate-reception-order', function () {
    const orderId = $(this).data('order-id');
    const csrfToken = $('[name=csrfmiddlewaretoken]').val();

    $.ajax({
        url: '/reception_order/create_reception_order/',
        method: 'POST',
        data: {
            dispatch_order_id: orderId,
            csrfmiddlewaretoken: csrfToken
        },
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Orden de recepción generada exitosamente.',
                confirmButtonText: 'Aceptar'
            });
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al generar la orden de recepción.',
                confirmButtonText: 'Aceptar'
            });
        }
    });
});