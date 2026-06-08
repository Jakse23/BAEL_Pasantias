//Mostrar Observaciones
$(document).on("click", ".view-observations-button", function () {
  const componentId = $(this).data("id");
  const obsType = $(this).data("type"); // 0 o 1
  const container = $("#observations-container");
  container.html('<p class="text-muted">Cargando observaciones...</p>');

  // Cambiar el título de la modal según el tipo
  if (obsType == 0) {
    $("#observationsModalLabel").text(
      "Observaciones (Mantenimiento Programado)"
    );
  } else {
    $("#observationsModalLabel").text(
      "Observaciones (Mantenimiento No Programado)"
    );
  }

  $.ajax({
    url: `/component/get_component/${componentId}/`,
    method: "GET",
    headers: { "X-Requested-With": "XMLHttpRequest" },
    success: function (data) {
      if (
        data.status === "success" &&
        data.component.observations &&
        data.component.observations.length > 0
      ) {
        let html = "";
        data.component.observations.forEach((obs) => {
          // Solo mostrar las del tipo seleccionado
          if (
            (obsType == 0 && obs.type == 0) ||
            (obsType == 1 && obs.type == 1)
          ) {
            html += `<div class="mb-3 fs-10">
            <strong>Requisito (${obs.requirements || "Sin requisito"}):</strong> ${obs.observation || "Sin descripción"}<br>
            <small class="text-muted"><b><i>Fecha de fin: ${obs.end_date || ""}</i></b></small>
          </div>`;
          }
        });
        container.html(
          html || "<p>No hay observaciones registradas de este tipo.</p>"
        );
      } else {
        container.html("<p>No hay observaciones registradas.</p>");
      }
    },
    error: function () {
      container.html(
        '<p class="text-danger">Ocurrió un error al obtener las observaciones.</p>'
      );
    },
  });

  const modal = new bootstrap.Modal(
    document.getElementById("observations-modal")
  );
  modal.show();
});
