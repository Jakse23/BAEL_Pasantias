document.addEventListener('DOMContentLoaded', function () {
    const materialsList = document.getElementById('materials-list');
    document.getElementById('add-detail').onclick = function () {
        const row = document.createElement('div');
        row.className = 'dynamic-detail row mb-2';
        row.innerHTML = `
            <div class="col-md-4">
                <label>Material</label>
                <select name="fk_inventory[]" class="form-control">
                    <option value="" selected disabled hidden>Seleccione</option>
                    ${materialsList.querySelector('select[name="fk_inventory[]"]').innerHTML}
                </select>
            </div>
            <div class="col-md-3">
                <label>Cantidad Mínima</label>
                <input type="text" name="minimum_quantity[]" class="form-control numeric-only" required>
            </div>
            <div class="col-md-1 d-flex align-items-end">
                <button type="button" class="btn btn-danger btn-sm remove-detail"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        materialsList.appendChild(row);
        if (typeof applyNumericOnly === "function") applyNumericOnly();
        row.querySelector('.remove-detail').onclick = function () {
            row.remove();
        };
    };
});