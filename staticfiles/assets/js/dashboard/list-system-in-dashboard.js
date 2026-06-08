
// Obtener la URL para listar sistemas
const listSystemUrl = document.getElementById('datatable-system-dash').getAttribute('data-list-system-dash-url');

// Helper para obtener el valor de condición desde el texto (Verificar cuando haya datos cargados)
function getConditionValue(text) {
    switch (text) {
        case "Disponible": return "0";
        case "Indisponible": return "1";
        case "Descartada": return "2";
        default: return "";
    }
}