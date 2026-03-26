// Mostrar/ocultar tareas
document.querySelectorAll(".show-tasks-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const planId = this.dataset.planId;
    const row = document.getElementById("tasks-row-" + planId);
    if (row.style.display === "none") {
      fetch(`/work_plan/tasks_by_work_plan/${planId}/`)
        .then((r) => r.json())
        .then((data) => {
          const tbody = document.getElementById("tasks-body-" + planId);
          tbody.innerHTML = "";
          data.tasks.forEach((task) => {
            tbody.innerHTML += `
                            <tr>
                                <td>${task.task}</td>
                                <td>${task.requirements || ""}</td>
                                <td>${task.start_date}</td>
                                <td>${task.end_date}</td>
                                <td>${task.labor_cost}</td>
                            </tr>
                        `;
          });
          row.style.display = "";
        });
    } else {
      row.style.display = "none";
    }
  });
});

$(document).ready(function () {
  var table = $("#datatable-workplan").DataTable();

  $("#datatable-workplan").on("click", ".show-tasks-btn", function () {
    var tr = $(this).closest("tr");
    var row = table.row(tr);
    var $btn = $(this);
    var planId = $btn.data("plan-id");
    var searchInputId = "search-tasks-" + planId;

    // Cerrar cualquier otra fila expandida antes de abrir la nueva
    $("#datatable-workplan tbody tr.shown").each(function () {
      var otherTr = $(this);
      if (!otherTr.is(tr)) {
        var otherRow = table.row(otherTr);
        otherRow
          .child()
          .find(".slide-task-content")
          .slideUp(300, function () {
            otherRow.child.hide();
            otherTr.removeClass("shown");
            otherTr
              .find(".show-tasks-btn")
              .html('<i class="fas fa-list"></i> Ver Tareas');
          });
      }
    });
    // Eliminar todos los inputs de búsqueda de tareas antes de mostrar uno nuevo
    $("input[id^='search-tasks-']").remove();

    if (row.child.isShown()) {
      // Animación de cierre
      row
        .child()
        .find(".slide-task-content")
        .slideUp(300, function () {
          row.child.hide();
          tr.removeClass("shown");
          $btn.html('<i class="fas fa-list"></i> Ver Tareas');
          // Eliminar input de búsqueda si existe
          $("#" + searchInputId).remove();
        });
    } else {
      // Obtener tareas por AJAX
      fetch(`/work_plan/tasks_by_work_plan/${planId}/`)
        .then((r) => r.json())
        .then((data) => {
          let html = `
<div class="slide-task-content" style="display:none;">
  <table class="table table-sm mb-0 task-table">
    <thead>
      <tr>
        <th>Tarea</th>
        <th>Requisitos</th>
        <th>Inicio</th>
        <th>Fin</th>
        <th>Mano de Obra</th>
        <th>Terminar</th>
        <th>Opciones</th>
      </tr>
    </thead>
    <tbody>
`;

          // Mostrar mensaje si no hay tareas
          if (!data.tasks || data.tasks.length === 0) {
            html += `
<tr>
  <td colspan="7" class="text-center text-muted">No hay tareas registradas</td>
</tr>
`;
          } else {
            data.tasks.forEach((task) => {
              let reqList = "";
              if (
                Array.isArray(task.requirements) &&
                task.requirements.length > 0
              ) {
                reqList = "<ul>";
                task.requirements.forEach((req) => {
                  reqList += `<li>${req.material_name} - Disponible: ${
                    req.available_quantity
                  }${
                    req.msg
                      ? ' <span class="text-danger">' + req.msg + "</span>"
                      : ""
                  }</li>`;
                });
                reqList += "</ul>";
              }
              let finishBtn = "";
              if (task.finished) {
                finishBtn = `<button class="btn btn-secondary btn-finish-task" data-id="${task.id}" disabled style="text-decoration: line-through; color: #888; background-color: #e9ecef; border-color: #e9ecef; cursor: not-allowed;">
            <s>Terminar</s>
        </button>`;
              } else {
                finishBtn = `<button class="btn btn-success btn-finish-task" data-id="${task.id}">
            Terminar
        </button>`;
              }
              let options = "";
              if (!data.plan_status) {
                options += `
<button class="btn btn-sm btn-primary btn-edit-task"
  data-id="${task.id}"
  data-task="${task.task}"
  data-requirements='${JSON.stringify(task.requirements)}'
  data-start="${task.start_date}"
  data-end="${task.end_date}"
  data-labor="${task.labor_cost}"
  data-plan-id="${planId}">
  <i class="fas fa-edit"></i>
</button>
<button class="btn btn-sm btn-warning btn-edit-observation" data-id="${
                  task.id
                }" title="Editar observación">
  <i class="fas fa-eye"></i><i class="fas fa-pen ms-1"></i>
</button>
<button class="btn btn-sm btn-danger btn-delete-task" data-id="${task.id}">
  <i class="fas fa-trash-alt"></i>
</button>
`;
              } else {
                options += `
<button class="btn btn-sm btn-warning btn-view-observation" data-id="${task.id}" title="Ver observaciones">
  <i class="fas fa-eye"></i>
</button>
`;
              }
              html += `
<tr data-task-id="${task.id}">
  <td>${task.task}</td>
  <td>${reqList}</td>
  <td>${task.start_date}</td>
  <td>${task.end_date}</td>
  <td>${task.labor_cost}</td>
  <td>
    ${finishBtn}
  </td>
  <td>
    ${options}
  </td>
</tr>
`;
            });
          }
          // ...después de generar las filas de tareas, antes de cerrar el tbody...
          html += `
<tr class="no-results-row" style="display:none;">
  <td colspan="7" class="text-center text-muted">No se encontraron coincidencias en su búsqueda</td>
</tr>
`;
          html += "</tbody></table></div>";
          row.child(html).show();
          row.child().find(".slide-task-content").slideDown(300);
          tr.addClass("shown");
          $btn.html('<i class="fas fa-list"></i> Ocultar Tareas');

          // --- Agregar input de búsqueda al lado del botón ---
          // Elimina si ya existe (por seguridad)
          $("#" + searchInputId).remove();
          $btn.after(
            `<input type="text" id="${searchInputId}" class="form-control form-control-sm ms-2" style="width:220px;display:inline-block;" placeholder="Buscar tarea, requisito, fecha o mano de obra...">`
          );

          // Filtro de búsqueda
          // ...dentro del bloque donde agregas el input de búsqueda...
          function normalize(str) {
            return str
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, ""); // Elimina acentos
          }

          $("#" + searchInputId).on("keyup", function () {
            var value = normalize($(this).val());
            var $rows = row.child().find("tbody tr").not(".no-results-row");
            var matches = 0;
            $rows.each(function () {
              var tds = $(this).find("td");
              var tarea = normalize($(tds[0]).text());
              var requisitos = normalize($(tds[1]).text());
              var inicio = normalize($(tds[2]).text());
              var fin = normalize($(tds[3]).text());
              var manoObra = normalize($(tds[4]).text());
              var text =
                tarea +
                " " +
                requisitos +
                " " +
                inicio +
                " " +
                fin +
                " " +
                manoObra;
              var found = text.indexOf(value) > -1;
              $(this).toggle(found);
              if (found) matches++;
            });
            // Mostrar/ocultar mensaje de "no resultados"
            var $noResults = row.child().find(".no-results-row");
            if (matches === 0) {
              $noResults.show();
            } else {
              $noResults.hide();
            }
          });
        });
    }
  });
});

//Mostrar Observaciones de las Tareas cuando el Plan de Trabajo está Cerrado
$(document).on("click", ".btn-view-observation", function () {
  const taskId = $(this).data("id");
  fetch(`/work_plan/get_observation/${taskId}/`)
    .then((r) => r.json())
    .then((data) => {
      let html = "";
      html += `<div class="mb-3"><strong>Observación (Programado):</strong><br>${
        data.observation_programada
          ? data.observation_programada
          : '<span class="text-muted">Sin observación</span>'
      }</div>`;
      html += `<div class="mb-3"><strong>Observación (No Programado):</strong><br>${
        data.observation_no_programada
          ? data.observation_no_programada
          : '<span class="text-muted">Sin observación</span>'
      }</div>`;
      $("#view-observation-content").html(html);
      const modal = new bootstrap.Modal(
        document.getElementById("viewObservationModal")
      );
      modal.show();
    });
});
