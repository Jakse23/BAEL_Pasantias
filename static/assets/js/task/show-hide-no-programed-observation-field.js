// Toggle mostrar/ocultar campo de observación no programada en editar
$("#btn-edit-no-programed").on("click", function () {
  const $btn = $(this);
  const $container = $("#edit-no-programed-container");
  if ($container.is(":visible")) {
    $container.slideUp();
    $btn.removeClass("btn-secondary").addClass("btn-success");
    $btn.text("Registrar Mantenimiento No Programado");
    $("#edit-observation-no-programed").val("");
  } else {
    $container.slideDown();
    $btn.removeClass("btn-success").addClass("btn-secondary");
    $btn.text("Eliminar Mantenimiento No Programado");
  }
});

// Al abrir el modal de editar observación, carga los datos y muestra los campos correctos
$(document).on("click", ".btn-edit-observation", function () {
  const taskId = $(this).data("id");
  // Obtener ambas observaciones de la tarea
  $.get(`/work_plan/get_observation/${taskId}/`, function (data) {
    if (data.status === "success") {
      $("#edit-observation-task-id").val(taskId);
      // Rellenar campos según existan
      $("#edit-observation-programed").val(data.observation_programada || "");
      $("#edit-observation-no-programed").val(
        data.observation_no_programada || ""
      );
      if (data.observation_no_programada) {
        $("#edit-no-programed-container").show();
        $("#btn-edit-no-programed")
          .removeClass("btn-success")
          .addClass("btn-secondary")
          .text("Eliminar Mantenimiento No Programado");
      } else {
        $("#edit-no-programed-container").hide();
        $("#btn-edit-no-programed")
          .removeClass("btn-secondary")
          .addClass("btn-success")
          .text("Registrar Mantenimiento No Programado");
      }
      new bootstrap.Modal(
        document.getElementById("editObservationModal")
      ).show();
    } else {
      Swal.fire("Error", data.message, "error");
    }
  });
});