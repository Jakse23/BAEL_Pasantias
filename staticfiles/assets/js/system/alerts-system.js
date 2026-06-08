// Alerta Registro (Confirmación, Fallo, Éxito)
$('#system-form').on('submit', function (e) {
    e.preventDefault();
    const form = $(this);

    Swal.fire({
        title: '¿Registrar sistema?',
        text: "¿Estás seguro de que deseas registrar este sistema?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, registrar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Registrando sistema...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            fetch(form.attr('action'), {
                method: 'POST',
                body: new FormData(form[0]),
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then(response => response.json())
                .then(data => {
                    Swal.close();
                    if (data.status === 'success') {
                        Swal.fire({
                            title: '¡Éxito!',
                            text: data.message,
                            icon: 'success',
                            confirmButtonText: 'Aceptar'
                        }).then(() => {
                            table.ajax.reload();
                            form.trigger('reset');
                            $('#register-modal').modal('hide');
                        });
                        $(this).find('.select2').val(null).trigger('change');
                    } else {
                        Swal.fire({
                            title: 'Error',
                            text: data.message,
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        });
                    }
                })
                .catch(error => {
                    Swal.close();
                    Swal.fire({
                        title: 'Error',
                        text: 'Ocurrió un error inesperado.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                });
        }
        // Si cancela, no hace nada y deja la modal abierta
    });
});

// Alerta Eliminación (Confirmación, Fallo, Éxito)
$(document).on('click', '.delete-system-button', function () {
    const systemId = $(this).data('id');

    Swal.fire({
        title: '¿Eliminar sistema?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Eliminando...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            fetch(`/system/system_delete/${systemId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                }
            })
                .then(async response => {
                    const data = await response.json();
                    Swal.close();
                    if (data.success) {
                        table.ajax.reload(null, false);
                        Swal.fire('¡Eliminado!', 'El sistema ha sido eliminado correctamente.', 'success');
                    } else {
                        Swal.fire('Error', data.message || 'Error al eliminar', 'error');
                    }
                })
                .catch(error => {
                    Swal.close();
                    console.error('Error:', error);
                    Swal.fire('Error', 'No se pudo completar la eliminación', 'error');
                });
        }
    });
});

// Alerta Edición (Sin Cambios, Confirmación, Fallo, Éxito)
$('#edit-system-form').on('submit', function (e) {
    e.preventDefault();

    const form = $(this);
    const systemId = $('#edit-system-id').val();
    const formData = new FormData(this);

    // Verificar cambios
    const currentValues = {
        system: $('#edit-system').val(),
        acronym: $('#edit-acronym').val(),
        condition: $('#edit-condition').val(),
        status: $('#edit-status').val(),
        utility_life: $('#edit-utility-life').val(),
        fk_group: $('#edit-fk-group').val()
    };

    let hasChanges = false;
    for (const key in originalValues) {
        if (originalValues[key] != currentValues[key]) {
            hasChanges = true;
            break;
        }
    }

    if (!hasChanges) {
        Swal.fire({
            icon: 'info',
            title: 'Sin cambios',
            text: 'No se han realizado cambios en el formulario.',
            confirmButtonText: 'Aceptar'
        });
        return; // No envía el formulario ni hace la petición
    }

    Swal.fire({
        title: '¿Guardar cambios?',
        text: "¿Estás seguro de que deseas actualizar este sistema?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Guardando cambios...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            fetch(`/system/system_update/${systemId}/`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Error en la respuesta del servidor');
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'success') {
                        Swal.fire({
                            title: '¡Éxito!',
                            text: data.message,
                            icon: 'success',
                            confirmButtonText: 'Aceptar'
                        }).then(() => {
                            table.ajax.reload(null, false);
                            $('#edit-modal').modal('hide');
                        });
                    } else {
                        Swal.fire('Error', data.message || 'Error al actualizar', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire('Error', 'No se pudo completar la actualización', 'error');
                });
        }
    });
});