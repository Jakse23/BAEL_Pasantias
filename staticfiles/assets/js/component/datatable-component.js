// Inicializar DataTable, Generar tabla desplegable y Manejar despliegue de la tabla al presionar el botón
var table = $("#datatable-component").DataTable({
  responsive: true,
  paging: true,
  info: true,
  ordering: false,
  language: {
    lengthMenu: "Mostrar _MENU_ registros",
    zeroRecords: "No se encontraron resultados",
    info: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
    infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
    infoFiltered: "(filtrado de un total de _MAX_ registros)",
    sSearch: "Buscar:",
    sProcessing: "Procesando...",
    emptyTable: "No hay datos disponibles en la tabla",
    oPaginate: {
      sFirst: "Primero",
      sLast: "Último",
      sNext: "Siguiente",
      sPrevious: "Anterior",
    },
  },
  columnDefs: [{ className: "centered", targets: "_all" }],
});

// Manejar clic en botón de detalles
$("#datatable-component tbody").on("click", ".details-btn", function () {
  var btn = $(this);
  var systemId = btn.data("system-id");
  var row = btn.closest("tr");
  var nextRow = row.next("tr.details-row");

  // Buscar si ya existe el input de búsqueda y eliminarlo si se va a ocultar
  var searchInputId = "search-specialties-" + systemId;

  // Cerrar cualquier otra especialidad abierta antes de abrir la nueva
  $("#datatable-component tbody tr.details-row.show-details").each(function () {
    var openDetailsRow = $(this);
    var openBtn = openDetailsRow.prev("tr").find(".details-btn");
    openDetailsRow.find("table").slideUp(300, function () {
      openDetailsRow.removeClass("show-details").hide();
    });
    openBtn.html('<i class="fas fa-chevron-down"></i> Ver Especialidades');
    openBtn.removeClass("collapsed");
    // Eliminar input de búsqueda si existe
    var openSystemId = openBtn.data("system-id");
    $("#search-specialties-" + openSystemId).remove();
  });

  if (nextRow.length && nextRow.hasClass("show-details")) {
    // Ocultar detalles con animación
    nextRow.find("table").slideUp(300, function () {
      nextRow.removeClass("show-details").hide();
    });
    btn.html('<i class="fas fa-chevron-down"></i> Ver Especialidades');
    btn.removeClass("collapsed");
    // Eliminar input de búsqueda si existe
    $("#" + searchInputId).remove();
  } else {
    // Mostrar detalles
    if (nextRow.length) {
      nextRow.addClass("show-details").show();
      nextRow.find("table").hide().slideDown(300);
      // Mostrar input de búsqueda si no existe
      if ($("#" + searchInputId).length === 0) {
        btn.after(
          `<input type="text" id="${searchInputId}" class="form-control form-control-sm ms-2" style="width:220px;display:inline-block;" placeholder="Buscar especialidad...">`
        );
        attachSearchHandler(searchInputId, nextRow.find("table"));
      }
    } else {
      // Hacer petición AJAX para obtener los componentes del sistema
      $.get(
        "/component/components-by-system/" + systemId + "/",
        function (data) {
          var detailsRow = $(
            '<tr class="details-row show-details" style="display:none;"><td colspan="3"></td></tr>'
          );

          // Construir la tabla de detalles
          var detailsTable = $(
            '<table class="table table-sm" style="display:none;"><thead><tr>' +
              "<th>Especialidad</th><th>Prioridad</th>" +
              "<th>H.T.V.L</th><th>Vida Útil</th><th>Opciones</th></tr></thead><tbody></tbody></table>"
          );

          $.each(data.components, function (index, component) {
            let obsButtons = "";
            if (component.obs_programadas > 0) {
              obsButtons += `<button class="btn btn-sm btn-success view-observations-button me-1" data-id="${component.id}" data-type="0" title="Observaciones Programadas">
          <i class="fas fa-eye"></i>
      </button>`;
            }
            if (component.obs_no_programadas > 0) {
              obsButtons += `<button class="btn btn-sm btn-warning view-observations-button" data-id="${component.id}" data-type="1" title="Observaciones No Programadas">
          <i class="fas fa-eye"></i>
      </button>`;
            }
            detailsTable
              .find("tbody")
              .append(
                "<tr>" +
                  "<td>" +
                  component.component +
                  "</td>" +
                  "<td>" +
                  component.category_display +
                  "</td>" +
                  "<td>" +
                  component.status +
                  " HV</td>" +
                  "<td>" +
                  component.utility_life +
                  " HV</td>" +
                  "<td>" +
                  '<button class="btn btn-sm btn-primary edit-component-button" ' +
                  'data-id="' +
                  component.id +
                  '"><i class="fas fa-pencil-alt"></i></button> ' +
                  '<button class="btn btn-sm btn-danger delete-component-button" ' +
                  'data-id="' +
                  component.id +
                  '"><i class="fas fa-trash-alt"></i></button> ' +
                  obsButtons +
                  "</td></tr>"
              );
          });

          // Agrega la fila de "no resultados" al final del tbody
          detailsTable.find("tbody").append(
            `<tr class="no-results-row" style="display:none;">
    <td colspan="5" class="text-center text-muted">No se encontraron coincidencias con tu búsqueda</td>
  </tr>`
          );

          detailsRow.find("td").append(detailsTable);
          row.after(detailsRow);
          detailsRow.show();
          detailsTable.slideDown(300);

          // Agregar input de búsqueda al lado del botón
          if ($("#" + searchInputId).length === 0) {
            btn.after(
              `<input type="text" id="${searchInputId}" class="form-control form-control-sm ms-2" style="width:220px;display:inline-block;" placeholder="Buscar especialidad...">`
            );
            attachSearchHandler(searchInputId, detailsTable);
          }
        }
      ).fail(function () {
        alert("Error al cargar los componentes");
      });
    }

    btn.html('<i class="fas fa-chevron-up"></i> Ocultar Especialidades');
    btn.addClass("collapsed");
  }
});

// Función para filtrar la tabla de especialidades
function attachSearchHandler(inputId, table) {
  $("#" + inputId)
    .off("keyup")
    .on("keyup", function () {
      var value = $(this).val().toLowerCase();
      var $rows = table.find("tbody tr").not(".no-results-row");
      var matches = 0;
      $rows.each(function () {
        var row = $(this);
        var text = row
          .find("td")
          .slice(0, 4)
          .map(function () {
            return $(this).text().toLowerCase();
          })
          .get()
          .join(" ");
        var found = text.indexOf(value) > -1;
        row.toggle(found);
        if (found) matches++;
      });
      // Mostrar/ocultar mensaje de "no resultados"
      var $noResults = table.find(".no-results-row");
      if (matches === 0) {
        $noResults.show();
      } else {
        $noResults.hide();
      }
    });
}
