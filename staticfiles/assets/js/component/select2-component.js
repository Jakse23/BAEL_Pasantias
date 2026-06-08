//Select2 de Sistemas (Crear)
$(document).ready(function () {
  $("#fk_system").select2({
    placeholder: "Seleccione la sigla", // Texto de ayuda
    allowClear: true, // Permite limpiar la selección
    width: "100%", // Ajusta el ancho al contenedor
    minimumResultsForSearch: 0, // Habilita la búsqueda incluso si hay pocas opciones
    dropdownParent: $("#register-modal"), // Asegura que el dropdown se muestre dentro del modal
  });
});

//Select2 de Sistemas (Editar)
$(document).ready(function () {
  $("#edit-fk-system").select2({
    placeholder: "Seleccione la sigla", // Texto de ayuda
    allowClear: true, // Permite limpiar la selección
    width: "100%", // Ajusta el ancho al contenedor
    minimumResultsForSearch: 0, // Habilita la búsqueda incluso si hay pocas opciones
    dropdownParent: $("#edit-modal"),
  });
});