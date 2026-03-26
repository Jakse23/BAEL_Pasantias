//Mostrar los componentes elegibles
document.getElementById("system-select").addEventListener("change", function () {
  const systemId = this.value;
  fetch(`/work_plan/components_by_system/${systemId}/`)
    .then((r) => r.json())
    .then((data) => {
      const compSelect = document.getElementById("component-select");
      compSelect.innerHTML =
        '<option value="">Seleccione un componente</option>';
      data.components.forEach((c) => {
        compSelect.innerHTML += `<option value="${c.id}">${c.component}</option>`;
      });
    });
});

//Mostrar los datos iniciales en la modal de edición
$(document).on("click", ".btn-edit-workplan", function () {
  const id = $(this).data("id");
  const name = $(this).data("name");
  const systemId = $(this).data("system");
  const componentId = $(this).data("component");

  $("#edit-id").val(id);
  $("#edit-name").val(name);
  $("#edit-system").val(systemId);

  // Cargar componentes del sistema seleccionado
  fetch(`/work_plan/components_by_system/${systemId}/`)
    .then((r) => r.json())
    .then((data) => {
      const compSelect = $("#edit-component");
      compSelect.html('<option value="">Seleccione un componente</option>');
      data.components.forEach((c) => {
        compSelect.append(
          `<option value="${c.id}" ${c.id == componentId ? "selected" : ""}>${c.component
          }</option>`
        );
      });
    });

  // Mostrar modal
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();
});

// Cuando cambie el sistema en el modal de editar, actualiza los componentes
$("#edit-system").on("change", function () {
  const systemId = $(this).val();
  fetch(`/work_plan/components_by_system/${systemId}/`)
    .then((r) => r.json())
    .then((data) => {
      const compSelect = $("#edit-component");
      compSelect.html('<option value="">Seleccione un componente</option>');
      data.components.forEach((c) => {
        compSelect.append(`<option value="${c.id}">${c.component}</option>`);
      });
    });
});

//Llenar con los datos existentes
$(document).on("click", ".btn-edit-task", function () {
  const id = $(this).data("id");
  const task = $(this).data("task");
  const start = $(this).data("start");
  const end = $(this).data("end");
  const labor = $(this).data("labor");
  const planId = $(this).data("plan-id");
  let requirements = $(this).data("requirements");

  // Si viene como string, parsear a array de objetos
  if (typeof requirements === "string") {
    try {
      requirements = JSON.parse(requirements);
    } catch (e) {
      requirements = [];
    }
  }
  // Obtener solo los IDs seleccionados
  const selectedIds = requirements.map((r) => String(r.id));

  // Llenar los campos del modal
  $("#edit-task-id").val(id);
  $("#edit-task-name").val(task);
  $("#edit-task-start").val(start);
  $("#edit-task-end").val(end);
  $("#edit-task-plan-id").val(planId);

  // Llenar mano de obra
  if ($("#edit-task-form input[name='labor_cost']").length) {
    $("#edit-task-form input[name='labor_cost']").val(labor);
  } else {
    $("<input>")
      .attr({
        type: "text",
        name: "labor_cost",
        class: "form-control mb-2",
        placeholder: "Costo de Mano de Obra",
        required: true,
        id: "edit-task-labor",
      })
      .val(labor)
      .insertAfter("#edit-task-end");
  }

  // Llenar el select2 de requerimientos SOLO del componente correspondiente
  const $select = $("#edit-task-requirements");
  $select.empty();

  // Destruir select2 previo si existe
  if ($select.hasClass("select2-hidden-accessible")) {
    $select.select2("destroy");
  }

  // Obtener el id del componente del plan de trabajo de la tarea
  // Busca el tr con data-id=planId y toma el data-component del botón editar
  let componentId = null;
  const row = $(`tr[data-id="${planId}"]`);
  if (row.length) {
    componentId = row.find(".btn-edit-workplan").data("component");
  }

  if (componentId) {
    fetch(`/inventory/material_name_by_component/${componentId}/`)
      .then((r) => r.json())
      .then((data) => {
        $select.empty();
        data.material_names.forEach((req) => {
          // Si está en los seleccionados, marcar como seleccionado
          let selected = selectedIds.includes(String(req.id));
          $select.append(
            `<option value="${req.id}" ${selected ? "selected" : ""}>${
              req.material_name
            } - Disponible: ${req.available_quantity}</option>`
          );
        });
        $select.select2({
          width: "100%",
          placeholder: "Seleccione el/los requerimiento(s)",
          allowClear: true,
          multiple: true,
          dropdownParent: $("#editTaskModal"),
        });
        $select.val(selectedIds).trigger("change");
      });
  } else {
    $select.select2({
      width: "100%",
      placeholder: "Seleccione el/los requerimiento(s)",
      allowClear: true,
      multiple: true,
      dropdownParent: $("#editTaskModal"),
    });
  }

  // Mostrar modal
  new bootstrap.Modal(document.getElementById("editTaskModal")).show();
});