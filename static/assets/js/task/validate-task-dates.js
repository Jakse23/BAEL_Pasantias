$(document).ready(function () {
  // Validación al añadir tarea
  $("#add-task-form").on("submit", function (e) {
    const start = new Date($("input[name='start_date']", this).val());
    const end = new Date($("input[name='end_date']", this).val());
    if (start > end) {
      e.preventDefault();
      Swal.fire({
        icon: "error",
        title: "Fechas incorrectas",
        text: "La fecha de inicio no puede ser mayor a la fecha de finalización.",
        confirmButtonText: "Aceptar",
      });
      return false;
    }
    if (start.getTime() === end.getTime()) {
      e.preventDefault();
      Swal.fire({
        icon: "error",
        title: "Fechas inválidas",
        text: "La fecha de inicio y la fecha de finalización no pueden ser la misma.",
        confirmButtonText: "Aceptar",
      });
      return false;
    }
  });

  // Validación al editar tarea
  $("#edit-task-form").on("submit", function (e) {
    const start = new Date($("#edit-task-start").val());
    const end = new Date($("#edit-task-end").val());
    if (start > end) {
      e.preventDefault();
      Swal.fire({
        icon: "error",
        title: "Fechas incorrectas",
        text: "La fecha de inicio no puede ser mayor a la fecha de finalización.",
        confirmButtonText: "Aceptar",
      });
      return false;
    }
    if (start.getTime() === end.getTime()) {
      e.preventDefault();
      Swal.fire({
        icon: "error",
        title: "Fechas inválidas",
        text: "La fecha de inicio y la fecha de finalización no pueden ser la misma.",
        confirmButtonText: "Aceptar",
      });
      return false;
    }
  });
});
