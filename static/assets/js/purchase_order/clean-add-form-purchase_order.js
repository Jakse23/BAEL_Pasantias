// Limpiar el formulario y materiales al abrir la modal de añadir
$('#addModal').on('show.bs.modal', function (e) {
    // Limpiar todos los campos del formulario
    $('#add-order-form')[0].reset();

    // Restaurar la lista de materiales a solo uno vacío
    const materialsList = $('#materials-list');
    // Obtén las opciones originales del primer select
    let inventoryOptions = materialsList.find('select[name="fk_inventory[]"]').first().html();

    materialsList.html(`
        <div class="dynamic-detail row mb-2">
            <div class="col-md-4">
                <label>Material</label>
                <select name="fk_inventory[]" class="form-control">
                    ${inventoryOptions}
                </select>
            </div>
            <div class="col-md-4">
                <label>Precio Unitario</label>
                <input type="text" step="0.01" name="unit_price[]" class="form-control numeric-only" required>
            </div>
            <div class="col-md-3">
                <label>Cantidad Mínima</label>
                <input type="text" name="minimum_quantity[]" class="form-control numeric-only" required>
            </div>
        </div>
    `);
    if (typeof applyNumericOnly === "function") applyNumericOnly();
});