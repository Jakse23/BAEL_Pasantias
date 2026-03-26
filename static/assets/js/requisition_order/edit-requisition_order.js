$(document).on('click', '.btn-edit-order', function () {
    const orderId = $(this).data('id');
    $('#edit-modal-body').html('<div class="text-center"><span class="spinner-border"></span></div>');
    $('#editModal').modal('show');
    $.get('/requisition_order/edit_requisition_order/' + orderId + '/', function (data) {
        let order = data.order;
        let details = data.details;
        let locationOptions = $('select[name="fk_destination_location"]').html();
        let inventoryOptions = $('select[name="fk_inventory[]"]').html();

        let html = `
        <div class="row">
            <div class="col-md-6 mb-3">
                <label>Fecha de Inicio</label>
                <input type="datetime-local" name="start_date" class="form-control" required>
            </div>
            <div class="col-md-6 mb-3">
                <label>Fecha Estimada de Llegada</label>
                <input type="datetime-local" name="estimated_arrival" class="form-control" required>
            </div>
            <div class="col-md-6 mb-3">
                <label>Fecha de Fin</label>
                <input type="datetime-local" name="end_date" class="form-control" required>
            </div>
            <div class="col-md-6 mb-3">
                <label>Ubicación de Destino</label>
                <select name="fk_destination_location" class="form-control">${locationOptions}</select>
            </div>
            <div class="col-md-12 mb-3">
                <label>Observación</label>
                <input type="text" name="observation" class="form-control">
            </div>
        </div>
        <hr>
        <div id="edit-materials-list"></div>
        <button type="button" class="btn btn-secondary" id="edit-add-detail">Agregar otro material</button>
        `;

        $('#edit-modal-body').html(html);

        // Setea los valores
        let f = $('#edit-order-form');
        f.find('[name="start_date"]').val(order.start_date);
        f.find('[name="estimated_arrival"]').val(order.estimated_arrival);
        f.find('[name="end_date"]').val(order.end_date);
        f.find('[name="observation"]').val(order.observation);
        f.find('[name="fk_destination_location"]').val(order.fk_destination_location);

        // Renderiza los detalles
        let $list = $('#edit-materials-list');
        $list.html('');
        details.forEach(function (d, idx) {
            $list.append(`
                <div class="dynamic-detail row mb-2">
                    <div class="col-md-4">
                        <label>Material</label>
                        <select name="fk_inventory[]" class="form-control">${inventoryOptions}</select>
                    </div>
                    <div class="col-md-4">
                        <label>Cantidad Mínima</label>
                        <input type="text" name="minimum_quantity[]" class="form-control numeric-only" required value="${d.minimum_quantity}">
                    </div>
                    <div class="col-md-4 d-flex align-items-end">
                        <button type="button" class="btn btn-danger btn-sm remove-detail"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `);
            $list.find('select[name="fk_inventory[]"]').eq(idx).val(d.fk_inventory);
        });

        // Agregar nuevo material
        $('#edit-add-detail').off('click').on('click', function () {
            $list.append(`
                <div class="dynamic-detail row mb-2">
                    <div class="col-md-4">
                        <label>Material</label>
                        <select name="fk_inventory[]" class="form-control">${inventoryOptions}</select>
                    </div>
                    <div class="col-md-4">
                        <label>Cantidad Mínima</label>
                        <input type="text" name="minimum_quantity[]" class="form-control numeric-only" required>
                    </div>
                    <div class="col-md-4 d-flex align-items-end">
                        <button type="button" class="btn btn-danger btn-sm remove-detail"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `);
        });

        // Eliminar material
        $list.on('click', '.remove-detail', function () {
            $(this).closest('.dynamic-detail').remove();
        });
    });

    // Guardar cambios
    $('#edit-order-form').off('submit').on('submit', function (e) {
        e.preventDefault();
        // Validación de materiales repetidos
        let materials = [];
        let repeated = false;
        $('#edit-order-form select[name="fk_inventory[]"]').each(function () {
            let val = $(this).val();
            if (val && materials.includes(val)) {
                repeated = true;
                return false;
            }
            materials.push(val);
        });
        if (repeated) {
            Swal.fire({
                icon: 'warning',
                title: 'Material repetido',
                text: 'No puedes seleccionar el mismo material más de una vez en la orden.',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        // Validación de fechas
        if (!validarFechasOrdenCompra(this)) {
            return;
        }
    
        const form = this;
        // Alerta de confirmación antes de enviar
        Swal.fire({
            title: "¿Estás seguro?",
            text: "¿Deseas guardar los cambios en esta orden de requisición?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, guardar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                const formData = $(form).serialize();
                $.ajax({
                    url: '/requisition_order/edit_requisition_order/' + orderId + '/',
                    method: 'POST',
                    data: formData,
                    success: function (response) {
                        if (response.success) {
                            $('#editModal').modal('hide');
                            Swal.fire({
                                icon: 'success',
                                title: '¡Orden actualizada!',
                                text: 'La orden de requisición se actualizó correctamente.',
                                confirmButtonText: 'Aceptar'
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire('Error', 'Error al actualizar la orden', 'error');
                        }
                    }
                });
            }
        });
    });
});