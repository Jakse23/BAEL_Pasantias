//Mostrar/Ocultar campo de Mantenimiento No Programado
$("#btn-add-no-programed").on("click", function () {
  const $btn = $(this);
  const $container = $("#no-programed-container");
  if ($container.is(":visible")) {
    $container.slideUp();
    $btn.removeClass("btn-secondary").addClass("btn-success");
    $btn.text("Registrar Mantenimiento No Programado");
  } else {
    $container.slideDown();
    $btn.removeClass("btn-success").addClass("btn-secondary");
    $btn.text("Eliminar Mantenimiento No Programado");
  }
});

// Al abrir el modal, limpia los campos y oculta el extra
$(document).on("click", ".btn-finish-task", function () {
  $("#finish-task-id").val($(this).data("id"));
  $("#finish-observation-programed").val("");
  $("#finish-observation-no-programed").val("");
  $("#no-programed-container").hide();
  $("#btn-add-no-programed")
    .removeClass("btn-secondary")
    .addClass("btn-success")
    .text("Registrar Mantenimiento No Programado")
    .show();
  const modal = new bootstrap.Modal(document.getElementById("finishTaskModal"));
  modal.show();
});