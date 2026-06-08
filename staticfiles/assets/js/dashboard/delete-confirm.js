// Archivo: static/assets/js/c130/delete-confirm.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ C-130 Delete JS cargado');
    
    // Inicializar SweetAlert2 si está disponible
    function initDeleteConfirmation() {
        const deleteButtons = document.querySelectorAll('.btn-delete-c130');
        
        if (deleteButtons.length === 0) return;
        
        console.log(`🔍 Encontrados ${deleteButtons.length} botones de eliminar`);
        
        deleteButtons.forEach(function(button) {
            // Eliminar event listener previo si existe
            button.removeEventListener('click', handleDeleteClick);
            // Agregar nuevo event listener
            button.addEventListener('click', handleDeleteClick);
        });
    }
    
    // Manejador del click de eliminación
    function handleDeleteClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const button = this;
        const matricula = button.getAttribute('data-matricula');
        const id = button.getAttribute('data-id');
        const form = document.getElementById(`delete-form-${id}`);
        
        if (!form) {
            console.error('Formulario no encontrado:', `delete-form-${id}`);
            return;
        }
        
        // SweetAlert2 confirmación
        Swal.fire({
            title: '¿Eliminar aeronave?',
            html: `Estás a punto de eliminar la aeronave <strong style="color: #d33;">${matricula}</strong>.<br><br>Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
            cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
            reverseButtons: true,
            background: '#1e2936',
            color: '#e2e8f0',
            backdrop: true,
            allowOutsideClick: false,
            allowEscapeKey: true,
            customClass: {
                popup: 'sweet-popup-c130',
                title: 'sweet-title-c130',
                htmlContainer: 'sweet-html-c130',
                confirmButton: 'sweet-confirm-c130',
                cancelButton: 'sweet-cancel-c130'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Mostrar loading mientras se elimina
                Swal.fire({
                    title: 'Eliminando...',
                    text: 'Por favor espera',
                    icon: 'info',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                        // Enviar el formulario
                        form.submit();
                    }
                });
            }
        });
    }
    
    // Función para mostrar mensajes con SweetAlert
    function showMessage(message, tags) {
        let icon = 'info';
        let title = 'Aviso';
        
        if (tags === 'success') {
            icon = 'success';
            title = '¡Éxito!';
        } else if (tags === 'error') {
            icon = 'error';
            title = 'Error';
        } else if (tags === 'warning') {
            icon = 'warning';
            title = 'Advertencia';
        }
        
        Swal.fire({
            title: title,
            text: message,
            icon: icon,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar',
            timer: 3000,
            timerProgressBar: true,
            background: '#1e2936',
            color: '#e2e8f0'
        });
    }
    
    // Inicializar cuando el DOM esté listo
    initDeleteConfirmation();
    
    // Re-inicializar si hay cambios dinámicos en la tabla
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                initDeleteConfirmation();
            }
        });
    });
    
    // Observar cambios en el body para detectar nuevos botones
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Exponer funciones globalmente si es necesario
    window.C130Delete = {
        initDeleteConfirmation: initDeleteConfirmation,
        showMessage: showMessage
    };
});