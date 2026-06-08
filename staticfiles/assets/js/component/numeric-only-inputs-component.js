document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.numeric-only').forEach(function (input) {
        input.addEventListener('input', function () {
            // Permitir solo números, un punto decimal y evitar múltiples puntos
            this.value = this.value.replace(/[^0-9.]/g, ''); // Eliminar caracteres no numéricos excepto el punto
            if ((this.value.match(/\./g) || []).length > 1) {
                this.value = this.value.substring(0, this.value.lastIndexOf('.')); // Eliminar puntos adicionales
            }
        });
    });
});
