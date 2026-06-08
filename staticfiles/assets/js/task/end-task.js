// Mostrar modal al hacer clic en "Terminar"
$(document).on("click", ".btn-finish-task", function () {
  const taskId = $(this).data("id");
  $("#finish-task-id").val(taskId);
  $("#finish-observation").val("");
  $("#finish-type").val("Programado");
  const modal = new bootstrap.Modal(document.getElementById("finishTaskModal"));
  modal.show();
});

// Enviar formulario de terminar tarea
$("#finish-task-form").on("submit", function (e) {
  e.preventDefault();
  const taskId = $("#finish-task-id").val();
  const obsProgramada = $("#finish-observation-programed").val();
  const obsNoProgramada = $("#finish-observation-no-programed").val();

  if (!obsProgramada.trim()) {
    Swal.fire("Error", "La observación programada es obligatoria.", "error");
    return;
  }

  Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas guardar la(s) observación(es) y terminar la tarea?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, guardar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: `/work_plan/task_finish/${taskId}/`,
        method: "POST",
        data: {
          observation_programada: obsProgramada,
          observation_no_programada: obsNoProgramada,
          csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val(),
        },
        success: function (data) {
          if (data.status === "success") {
            Swal.fire("¡Guardado!", "La tarea fue terminada.", "success").then(
              () => {
                location.reload();
              }
            );
          } else {
            Swal.fire("Error", data.message, "error");
          }
        },
      });
    }
  });
});