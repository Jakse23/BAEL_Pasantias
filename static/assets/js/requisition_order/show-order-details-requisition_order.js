//Mostrar Detalles de la Orden
$(document).on('click', '.show-details-order-btn', function () {
    var orderId = $(this).data('order-id');
    $.ajax({
        url: '/requisition_order/requisition_order_details/' + orderId + '/',
        method: 'GET',
        success: function (response) {
            var html = '';
            if (response.details.length > 0) {
                // Tomar los datos comunes del primer detalle
                var common = response.details[0];
                // Verificar si todos los detalles tienen los mismos datos (excepto material, precio unitario y cantidad mínima)
                var allSame = response.details.every(function (d) {
                    return d.start_date === common.start_date &&
                        d.end_date === common.end_date &&
                        d.estimated_arrival === common.estimated_arrival &&
                        d.observation === common.observation &&
                        d.destination_location === common.destination_location;
                });
                if (allSame) {
                    html += '<ul>';
                    html += '<li><strong>Fecha Esperada de Inicio:</strong> ' + common.start_date + '</li>';
                    html += '<li><strong>Fecha Esperada de Fin:</strong> ' + common.end_date + '</li>';
                    html += '<li><strong>Fecha Estimada de Arribo:</strong> ' + common.estimated_arrival + '</li>';
                    html += '<li><strong>Observación:</strong> ' + (common.observation || '-') + '</li>';
                    html += '<li><strong>Locación de Destino:</strong> ' + common.destination_location + '</li>';
                    html += '<li><strong>Materiales:</strong><ul>';
                    response.details.forEach(function (detail) {
                        html += '<li>' + detail.inventory + ' | Cantidad Mínima: ' + detail.minimum_quantity + '</li>';
                    });
                    html += '</ul></li>';
                    html += '</ul>';
                } else {
                    // Si no son iguales, muestra todos los detalles como antes
                    response.details.forEach(function (detail, idx) {
                        html += '<ul>';
                        html += '<li><strong>Material:</strong> ' + detail.inventory + '</li>';
                        html += '<li><strong>Cantidad Mínima:</strong> ' + detail.minimum_quantity + '</li>';
                        html += '<li><strong>Fecha Esperada de Inicio:</strong> ' + detail.start_date + '</li>';
                        html += '<li><strong>Fecha Esperada de Fin:</strong> ' + detail.end_date + '</li>';
                        html += '<li><strong>Fecha Estimada de Arribo:</strong> ' + detail.estimated_arrival + '</li>';
                        html += '<li><strong>Observación:</strong> ' + (detail.observation || '-') + '</li>';
                        html += '<li><strong>Locación de Destino:</strong> ' + detail.destination_location + '</li>';
                        html += '</ul>';
                        if (idx < response.details.length - 1) {
                            html += '<hr>';
                        }
                    });
                }
            } else {
                html = '<p>No hay detalles para esta orden.</p>';
            }
            $('#details-container').html(html);
            $('#details-modal').modal('show');
        }
    });
});

//Limpiar el contenido al cerrar el modal
$('#details-modal').on('hidden.bs.modal', function () {
    $('#details-container').html('');
});