$(document).on('click', '.show-details-order-btn', function () {
    var orderId = $(this).data('order-id');
    $.ajax({
        url: '/reception_order/reception_order_details/' + orderId + '/',
        method: 'GET',
        success: function (response) {
            var html = '';
            if (response.details.length > 0) {
                if (response.type === "purchase") {
                    html += '<ul>';
                    response.details.forEach(function (detail, idx) {
                        html += '<li><strong>Material:</strong> ' + detail.material + '</li>';
                        html += '<li><strong>Cantidad:</strong> ' + detail.quantity + '</li>';
                        html += '<li><strong>Precio Unitario:</strong> ' + detail.unit_price + '</li>';
                        html += '<li><strong>Origen:</strong> ' + detail.origin_location + '</li>';
                        html += '<li><strong>Destino:</strong> ' + detail.destination_location + '</li>';
                        html += '<li><strong>Observación:</strong> ' + (detail.observation || '-') + '</li>';
                        html += '</ul>';
                        if (idx < response.details.length - 1) {
                            html += '<hr>';
                        }
                    });
                } else if (response.type === "requisition") {
                    html += '<ul>';
                    response.details.forEach(function (detail, idx) {
                        html += '<li><strong>Material:</strong> ' + detail.material + '</li>';
                        html += '<li><strong>Cantidad:</strong> ' + detail.quantity + '</li>';
                        html += '<li><strong>Origen:</strong> ' + detail.origin_location + '</li>';
                        html += '<li><strong>Destino:</strong> ' + detail.destination_location + '</li>';
                        html += '<li><strong>Observación:</strong> ' + (detail.observation || '-') + '</li>';
                        html += '</ul>';
                        if (idx < response.details.length - 1) {
                            html += '<hr>';
                        }
                    });
                }
            } else {
                html = '<p>No hay detalles para esta orden de recepción.</p>';
            }
            $('#details-container').html(html);
            $('#detailsOrderModal').modal('show');
        }
    });
});

// Limpiar el contenido al cerrar el modal
$('#detailsOrderModal').on('hidden.bs.modal', function () {
    $('#details-container').html('');
});