function applyNumericOnly() {
    document.querySelectorAll('.numeric-only').forEach(function (input) {
        // Evita agregar múltiples listeners
        if (!input.dataset.numericOnly) {
            input.addEventListener('input', function () {
                this.value = this.value.replace(/[^0-9.]/g, '');
                if ((this.value.match(/\./g) || []).length > 1) {
                    this.value = this.value.substring(0, this.value.lastIndexOf('.'));
                }
            });
            input.dataset.numericOnly = "true";
        }
    });
}

document.addEventListener('DOMContentLoaded', applyNumericOnly);