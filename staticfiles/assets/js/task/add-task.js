document.querySelectorAll(".add-task-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const planId = this.dataset.planId;
    document.getElementById("task-plan-id").value = planId;
    document.getElementById("add-task-form").reset();

    // Obtener el id del componente asociado al plan de trabajo
    const row = document.querySelector(`tr[data-id="${planId}"]`);
    const componentId = row
      ? row.querySelector(".btn-edit-workplan").dataset.component
      : null;

    const select = $("#requirements-select");
    select.empty(); // Limpiar opciones

    // Destruir instancia previa de Select2 si existe
    if (select.hasClass("select2-hidden-accessible")) {
      select.select2("destroy");
    }

    if (componentId) {
      fetch(`/inventory/material_name_by_component/${componentId}/`)
        .then((r) => r.json())
        .then((data) => {
          data.material_names.forEach((req) => {
            console.log(data.material_names);
            select.append(
              `<option value="${req.id}">${req.material_name} - Disponible: ${req.available_quantity}</option>`
            );
          });
          // Inicializa select2
          select.select2({
            width: "90%",
            placeholder: "Seleccione el/los requerimiento(s)",
            allowClear: true,
            dropdownParent: $("#addTaskModal"),
          });
        });
    } else {
      select.html("");
      select.select2({
        width: "90%",
        placeholder: "Seleccione el/los requerimiento(s)",
        allowClear: true,
      });
    }

    new bootstrap.Modal(document.getElementById("addTaskModal")).show();
  });
});