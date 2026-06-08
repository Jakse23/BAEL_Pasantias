// Alerta Registro (Confirmación, Fallo, Éxito)
document.getElementById("component-form").addEventListener("submit", function (e) {
    e.preventDefault(); // Evita el envío normal del formulario

    const form = this;

    Swal.fire({
        title: "¿Registrar especialidad?",
        text: "¿Estás seguro de que deseas registrar esta especialidad?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, registrar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Registrando especialidad...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    Swal.close();
                    if (data.status === "success") {
                        Swal.fire({
                            title: "¡Éxito!",
                            text: data.message,
                            icon: "success",
                            confirmButtonText: "Aceptar",
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: "Error",
                            text: data.message,
                            icon: "error",
                            confirmButtonText: "Aceptar",
                        });
                    }
                })
                .catch((error) => {
                    Swal.close();
                    Swal.fire({
                        title: "Error",
                        text: "Ocurrió un error inesperado.",
                        icon: "error",
                        confirmButtonText: "Aceptar",
                    });
                });
        }
        // Si cancela, no hace nada y deja la modal abierta
    });
});

// Alerta Eliminación (Confirmación, Fallo, Éxito)
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("#datatable-component tbody").addEventListener("click", function (event) {
        // Buscar el botón más cercano aunque se haga clic en el ícono
        const button = event.target.closest(".delete-component-button");
        if (button) {
            const componentId = button.getAttribute("data-id"); // Obtener ID del componente

            Swal.fire({
                title: "¿Estás seguro?",
                text: "Esta acción no se puede deshacer.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, borrar",
                cancelButtonText: "Cancelar",
            }).then((result) => {
                if (result.isConfirmed) {
                    // Solicitud AJAX para eliminar
                    fetch(`/component/component_delete/${componentId}/`, {
                        method: "POST",
                        headers: {
                            "X-CSRFToken": csrftoken, // Usar el token CSRF obtenido de la cookie
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            if (data.status === "success") {
                                Swal.fire("¡Eliminado!", data.message, "success").then(() => {
                                    window.location.reload();
                                });
                            } else {
                                Swal.fire("Error", data.message, "error");
                            }
                        })
                        .catch((error) => {
                            Swal.fire("Error", "Ocurrió un error inesperado.", "error");
                        });
                }
            });
        }
    });
});

// Alerta Edición (Sin Cambios, Confirmación, Fallo, Éxito)
document.getElementById("edit-component-form").addEventListener("submit", function (e) {
    e.preventDefault(); // Evita el envío normal del formulario

    const form = this;
    const componentId = document.getElementById("edit-component-id").value;

    // Obtener los valores actuales del formulario
    const currentValues = {
        fk_system: document.getElementById("edit-fk-system").value,
        component: document.getElementById("edit-component").value,
        category: document.getElementById("edit-category").value,
        status: document.getElementById("edit-status").value,
        utility_life: document.getElementById("edit-utility-life").value,
    };

    // Comparar los valores actuales con los originales
    const hasChanges = Object.keys(originalValues).some(
        (key) => originalValues[key] != currentValues[key]
    );

    if (!hasChanges) {
        Swal.fire({
            title: "Sin cambios",
            text: "No se detectaron cambios en los datos.",
            icon: "info",
            confirmButtonText: "Aceptar",
        });
        return; // Detener el envío del formulario
    }

    Swal.fire({
        title: "¿Guardar cambios?",
        text: "¿Estás seguro de que deseas actualizar esta especialidad?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Guardando cambios...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // Enviar formulario
            fetch(`/component/component_update/`, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    "X-CSRFToken": csrftoken,
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    Swal.close();
                    if (data.status === "success") {
                        Swal.fire({
                            title: "¡Éxito!",
                            text: data.message,
                            icon: "success",
                            confirmButtonText: "Aceptar",
                        }).then(() => {
                            const editModal = bootstrap.Modal.getInstance(
                                document.getElementById("edit-modal")
                            );
                            editModal.hide();
                            window.location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: "Error",
                            text: data.message,
                            icon: "error",
                            confirmButtonText: "Aceptar",
                        });
                    }
                })
                .catch((error) => {
                    Swal.close();
                    Swal.fire({
                        title: "Error",
                        text: "Ocurrió un error inesperado.",
                        icon: "error",
                        confirmButtonText: "Aceptar",
                    });
                });
        }
        // Si cancela, no hace nada y deja la modal abierta
    });
});