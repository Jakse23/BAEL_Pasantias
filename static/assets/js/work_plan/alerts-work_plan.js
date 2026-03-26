$("#add-form").on("submit", function (e) {
  e.preventDefault();
  const form = this;
  Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas añadir este plan de trabajo?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, añadir",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch("/work_plan/work_plan_create/", {
        method: "POST",
        body: new FormData(form),
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRFToken": getCookie("csrftoken"),
        },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.status === "success") {
            Swal.fire(
              "¡Añadido!",
              "El plan de trabajo fue creado correctamente.",
              "success"
            ).then(() => {
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


$(document).on("click", ".btn-delete-workplan", function () {
  const id = $(this).data("id");
  Swal.fire({
    title: "¿Eliminar plan de trabajo?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, borrar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/work_plan/delete/${id}/`, {
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
              "El plan de trabajo ha sido eliminado.",
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

$("#edit-form").on("submit", function (e) {
  e.preventDefault();
  const id = $("#edit-id").val();
  Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas guardar los cambios de este plan de trabajo?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, guardar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/work_plan/update/${id}/`, {
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
              "El plan de trabajo fue actualizado correctamente.",
              "success"
            ).then(() => {
              const modal = bootstrap.Modal.getInstance(
                document.getElementById("editModal")
              );
              modal.hide();
              location.reload();
            });
          } else {
            Swal.fire(
              "Error",
              "Error al editar: " + JSON.stringify(data.message),
              "error"
            );
          }
        })
        .catch(() => {
          Swal.fire("Error", "Error en la petición", "error");
        });
    }
  });
});
