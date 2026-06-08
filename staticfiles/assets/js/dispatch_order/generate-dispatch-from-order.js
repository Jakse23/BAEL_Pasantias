$(document).on('click', '.btn-generate-dispatch-order', function () {
    const orderId = $(this).data('order-id');
    const type = $(this).data('type');
    const csrfToken = $('[name=csrfmiddlewaretoken]').val();

    $.ajax({
        url: '/dispatch_order/create_dispatch_order/',
        method: 'POST',
        data: {
            order_id: orderId,
            type: type,
            csrfmiddlewaretoken: csrfToken
        },
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Orden de despacho generada exitosamente.',
                confirmButtonText: 'Aceptar'
            });
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al generar la orden de despacho.',
                confirmButtonText: 'Aceptar'
            });
        }
    });
});