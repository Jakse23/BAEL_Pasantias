//Alerta Registro (Confirmación, Fallo, Éxito)
document.getElementById("add-task-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const form = this;
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas añadir esta tarea?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            // Obtener múltiples requerimientos seleccionados
            const select = $("#requirements-select");
            const selected = select.val(); // Array de valores seleccionados

            const fd = new FormData(form);
            // Elimina el campo anterior (si existe)
            fd.delete("requirements");
            // Agrega cada requerimiento seleccionado
            if (selected && selected.length > 0) {
                selected.forEach((req) => {
                    fd.append("requirements", req);
                });
            }

            fetch("/work_plan/task_create/", {
                method: "POST",
                body: fd,
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
            })
                .then((r) => r.json())
                .then((data) => {
                    if (data.status === "success") {
                        Swal.fire(
                            "¡Guardado!",
                            "La tarea fue añadida correctamente.",
                            "success"
                        ).then(() => {
                            bootstrap.Modal.getInstance(
                                document.getElementById("addTaskModal")
                            ).hide();
                            location.reload();
                        });
                    } else {
                        Swal.fire("Error", data.message, "error");
                    }
                })
                .catch(() => {
                    Swal.fire("Error", "Error en la petición", "error");
                });
        }
    });
});

//Alerta Eliminación (Confirmación, Fallo, Éxito)
$(document).on("click", ".btn-delete-task", function () {
  const id = $(this).data("id");
  Swal.fire({
    title: "¿Eliminar tarea?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, borrar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/work_plan/task_delete/${id}/`, {
        method: "POST",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRFToken": getCookie("csrftoken"),
        },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.status === "success") {
            Swal.fire(
              "¡Eliminado!",
              "La tarea ha sido eliminada.",
              "success"
            ).then(() => {
              location.reload();
            });
          } else {
            Swal.fire("Error", data.message, "error");
          }
        })
        .catch(() => {
          Swal.fire("Error", "Error en la petición.", "error");
        });
    }
  });
});

//Alerta Edición (Sin Cambios, Confirmación, Fallo, Éxito)
$("#edit-task-form").on("submit", function (e) {
  e.preventDefault();
  const id = $("#edit-task-id").val();
  Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas guardar los cambios de esta tarea?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, guardar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/work_plan/task_update/${id}/`, {
        method: "POST",
        body: new FormData(this),
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRFToken": getCookie("csrftoken"),
        },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.status === "success") {
            Swal.fire(
              "¡Editado!",
              "La tarea fue actualizada correctamente.",
              "success"
            ).then(() => {
              bootstrap.Modal.getInstance(
                document.getElementById("editTaskModal")
              ).hide();
              location.reload();
            });
          } else {
            Swal.fire("Error", data.message, "error");
          }
        })
        .catch(() => {
          Swal.fire("Error", "Error en la petición", "error");
        });
    }
  });
});

// Abrir modal de editar observación
$(document).on("click", ".btn-edit-observation", function () {
  const taskId = $(this).data("id");
  // Obtener la observación actual de la tarea
  $.get(`/work_plan/get_observation/${taskId}/`, function (data) {
    if (data.status === "success") {
      $("#edit-observation-task-id").val(taskId);
      $("#edit-observation-text").val(data.observation);
      $("#edit-observation-type").val(
        data.type === 0 ? "Programado" : "No Programado"
      );
      const modalEl = document.getElementById("editObservationModal");
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
      new bootstrap.Modal(modalEl).show();
    } else {
      Swal.fire("Error", data.message, "error");
    }
  });
});

// Guardar cambios de observación (ambas)
$("#edit-observation-form").on("submit", function (e) {
  e.preventDefault();
  const taskId = $("#edit-observation-task-id").val();
  const obsProgramada = $("#edit-observation-programed").val();
  const obsNoProgramada = $("#edit-observation-no-programed").val();

  if (!obsProgramada.trim()) {
    Swal.fire("Error", "La observación programada es obligatoria.", "error");
    return;
  }

  Swal.fire({
    title: "¿Guardar cambios?",
    text: "¿Deseas actualizar la(s) observación(es)?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, guardar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: `/work_plan/update_observation/${taskId}/`,
        method: "POST",
        data: {
          observation_programada: obsProgramada,
          observation_no_programada: obsNoProgramada,
          csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val(),
        },
        success: function (data) {
          if (data.status === "success") {
            Swal.fire(
              "¡Actualizado!",
              "La observación fue actualizada.",
              "success"
            ).then(() => {
              location.reload();
            });
          } else {
            Swal.fire("Error", data.message, "error");
          }
        },
      });
    }
  });
});