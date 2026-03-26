document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("inventory-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas registrar este inventario?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, registrar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          const formData = new FormData(form);

          fetch("/inventory/add/", {
            method: "POST",
            headers: {
              "X-CSRFToken": getCookie("csrftoken"),
            },
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                form.reset();
                const modal = bootstrap.Modal.getInstance(
                  document.getElementById("register-modal")
                );
                modal.hide();
                Swal.fire(
                  "¡Registrado!",
                  "El inventario fue registrado correctamente.",
                  "success"
                );
                // Recargar DataTable si lo usas
                if (window.$ && $.fn.DataTable) {
                  $("#datatable-inventory").DataTable().ajax.reload();
                } else {
                  // Si no usas DataTable, puedes recargar la página o actualizar la tabla manualmente
                  location.reload();
                }
              } else {
                Swal.fire(
                  "Error",
                  "Error al registrar: " + JSON.stringify(data.errors),
                  "error"
                );
              }
            })
            .catch((error) => {
              Swal.fire("Error", "Error en la petición", "error");
            });
        }
      });
    });
  }

  $("#datatable-inventory").DataTable({
    ajax: {
      url: "/inventory/list/",
      dataSrc: "data",
    },
    columns: [
      { data: null, render: (data, type, row, meta) => meta.row + 1 }, // #
      { data: "material_name" },
      { data: "part_number" },
      { data: "stock" },
      { data: "nomenclature" },
      { data: "cage" },
      { data: "errc" },
      { data: "ui" },
      { data: "ser" },
      {
        data: "unit_price",
        render: function (data, type, row) {
          return "$" + parseFloat(data).toFixed(2);
        },
      },
      {
        data: "total",
        render: function (data, type, row) {
          return "$" + parseFloat(data).toFixed(2);
        },
      },
      { data: "location" },
      { data: "last_inv_date" },
      { data: "component_name" },
      { data: "available_quantity" }, // <-- Existencia ANTES de opciones
      {
        data: null,
        orderable: false,
        render: function (data, type, row) {
          return `
        <button class="btn btn-sm btn-primary btn-edit-inventory" data-id="${row.id}" title="Editar">
          <i class="fas fa-pencil-alt"></i>
        </button>
        <button class="btn btn-sm btn-danger btn-delete-inventory" data-id="${row.id}" title="Eliminar">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
        },
      },
    ],
    destroy: true,
    responsive: true,
    language: {
      url: "//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json",
    },
  });
});

// Función para obtener el CSRF token de las cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

$(document).on("click", ".btn-edit-inventory", function () {
  const id = $(this).data("id");
  // Busca el registro en la tabla actual
  const table = $("#datatable-inventory").DataTable();
  const rowData = table
    .rows()
    .data()
    .toArray()
    .find((row) => row.id === id);

  if (rowData) {
    $("#edit_id").val(rowData.id);
    $("#edit_part_number").val(rowData.part_number);
    $("#edit_stock").val(rowData.stock);
    $("#edit_nomenclature").val(rowData.nomenclature);
    $("#edit_cage").val(rowData.cage);
    $("#edit_errc").val(rowData.errc);
    $("#edit_ui").val(rowData.ui);
    $("#edit_ser").val(rowData.ser);
    $("#edit_material_name").val(rowData.material_name); // <-- Nuevo campo
    $("#edit_unit_price").val(rowData.unit_price);
    $("#edit_total").val(rowData.total);
    $("#edit_location").val(rowData.location);
    $("#edit_last_inv_date").val(rowData.last_inv_date);
    $("#edit_fk_component").val(rowData.fk_component);
    $("#edit_available_quantity").val(rowData.available_quantity); // <-- Nuevo campo

    const editModal = new bootstrap.Modal(
      document.getElementById("edit-modal")
    );
    editModal.show();
  }
});

$(document).on("submit", "#edit-inventory-form", function (e) {
  e.preventDefault();
  const form = this;

  Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas guardar los cambios de este inventario?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, guardar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      const formData = new FormData(form);

      fetch("/inventory/edit/", {
        method: "POST",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            Swal.fire(
              "¡Editado!",
              "El inventario fue actualizado correctamente.",
              "success"
            );
            const modal = bootstrap.Modal.getInstance(
              document.getElementById("edit-modal")
            );
            modal.hide();
            $("#datatable-inventory").DataTable().ajax.reload();
          } else {
            Swal.fire(
              "Error",
              "Error al editar: " + JSON.stringify(data.errors),
              "error"
            );
          }
        })
        .catch((error) => {
          Swal.fire("Error", "Error en la petición", "error");
        });
    }
  });
});

$(document).on("click", ".btn-delete-inventory", function () {
  const id = $(this).data("id");

  Swal.fire({
    title: "¿Eliminar inventario?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch("/inventory/delete/", {
        method: "POST",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: new URLSearchParams({ id }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            Swal.fire(
              "¡Eliminado!",
              "El inventario ha sido eliminado.",
              "success"
            );
            $("#datatable-inventory").DataTable().ajax.reload();
          } else {
            Swal.fire("Error", "No se pudo eliminar el inventario.", "error");
          }
        })
        .catch(() => {
          Swal.fire("Error", "Error en la petición.", "error");
        });
    }
  });
});
