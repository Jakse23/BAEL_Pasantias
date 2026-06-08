// Alerta Registro (Confirmación, Fallo, Éxito)
$('#add-order-form').on('submit', function (e) {
    e.preventDefault();
    // Validación de materials repetidos
    let materials = [];
    let repeated = false;
    $('select[name="fk_inventory[]"]').each(function () {
        let val = $(this).val();
        if (val && materials.includes(val)) {
            repeated = true;
            return false; // rompe el each
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

    if (!validarFechasOrdenCompra(this)) {
        return;
    }
    // Aquí va el SweetAlert de confirmación y el AJAX
    const form = this;
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas guardar esta orden de requisición?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            const formData = $(form).serialize();
            // Enviar
            $.ajax({
                url: '/requisition_order/add_requisition_order/',
                method: 'POST',
                data: formData,
                success: function (response) {
                    if (response.success) {
                        $('#addModal').modal('hide');
                        Swal.fire({
                            icon: 'success',
                            title: '¡Orden registrada!',
                            text: 'La orden de requisición se guardó correctamente.',
                            confirmButtonText: 'Aceptar'
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire('Error', 'Error al guardar la orden', 'error');
                    }
                }
            });
        }
    });
});

// Alerta Eliminación (Confirmación, Fallo, Éxito)
$(document).on('click', '.btn-delete-order', function () {
    const orderId = $(this).data('id');
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará la orden de requisición de forma permanente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/requisition_order/delete_requisition_order/' + orderId + '/',
                method: 'POST',
                headers: { 'X-CSRFToken': $('[name=csrfmiddlewaretoken]').val() },
                success: function (response) {
                    if (response.success) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Eliminada!',
                            text: 'La orden de requisición fue eliminada correctamente.',
                            confirmButtonText: 'Aceptar'
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire('Error', response.error || 'No se pudo eliminar la orden.', 'error');
                    }
                },
                error: function () {
                    Swal.fire('Error', 'No se pudo eliminar la orden.', 'error');
                }
            });
        }
    });
});