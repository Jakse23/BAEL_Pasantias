// Variable para almacenar los valores originales al editar
let originalValues = {};

$(document).on('click', '.edit-system-button', function () {
    const systemId = $(this).data('id');

    Swal.fire({
        title: 'Cargando datos...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch(`/system/get_system/${systemId}/`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(data => {
            Swal.close();
            if (data.status === 'success') {
                $('#edit-system-id').val(data.data.id);
                $('#edit-system').val(data.data.system);
                $('#edit-acronym').val(data.data.acronym);
                $('#edit-condition').val(data.data.condition).trigger('change');
                $('#edit-status').val(data.data.status);
                $('#edit-utility-life').val(data.data.utility_life);
                $('#edit-fk-group').val(data.data.fk_group).trigger('change');

                originalValues = {
                    system: data.data.system,
                    acronym: data.data.acronym,
                    condition: data.data.condition,
                    status: data.data.status,
                    utility_life: data.data.utility_life,
                    fk_group: data.data.fk_group
                };

                $('#edit-modal').modal('show');
            } else {
                Swal.fire('Error', data.message || 'Error al cargar los datos', 'error');
            }
        })
        .catch(error => {
            Swal.close();
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos del sistema', 'error');
        });
});