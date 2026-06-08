//Llenar modal de edición con los datos registrados
document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#datatable-component tbody").addEventListener("click", function (event) {
    // Buscar el botón más cercano aunque se haga clic en el ícono
    const button = event.target.closest(".edit-component-button");
    if (button) {
      const componentId = button.getAttribute("data-id");
      // Obtener sistemas y niveles
      fetch("/component/get_systems_and_levels/", {
        method: "GET",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.systems && data.levels) {
            const systemSelect = $("#edit-fk-system");
            const levelSelect = document.getElementById("edit-category");

            // Limpiar opciones existentes
            systemSelect.empty();
            levelSelect.innerHTML = "";

            // Agregar sistemas
            data.systems.forEach((system) => {
              const option = new Option(system.acronym, system.id);
              systemSelect.append(option);
            });

            // Agregar niveles
            data.levels.forEach((level) => {
              const option = document.createElement("option");
              option.value = level.value;
              option.textContent = level.label;
              levelSelect.appendChild(option);
            });

            // Cargar datos del componente
            fetch(`/component/get_component/${componentId}/`, {
              method: "GET",
              headers: {
                "X-Requested-With": "XMLHttpRequest",
              },
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.status === "success") {
                  document.getElementById("edit-component-id").value =
                    data.component.id;
                  document.getElementById("edit-component").value =
                    data.component.component;
                  document.getElementById("edit-category").value =
                    data.component.category;
                  document.getElementById("edit-status").value =
                    data.component.status;
                  document.getElementById("edit-utility-life").value =
                    data.component.utility_life;

                  // Establecer el sistema seleccionado en el select2
                  systemSelect
                    .val(data.component.fk_system)
                    .trigger("change");

                  // Guardar los valores originales
                  originalValues = {
                    fk_system: data.component.fk_system,
                    component: data.component.component,
                    category: data.component.category,
                    status: data.component.status,
                    utility_life: data.component.utility_life,
                  };

                  // Mostrar el modal
                  const editModal = new bootstrap.Modal(
                    document.getElementById("edit-modal")
                  );
                  editModal.show();
                } else {
                  Swal.fire("Error", data.message, "error");
                }
              });
          }
        });
    }
  });
});