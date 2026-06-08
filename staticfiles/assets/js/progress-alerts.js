function showWarningAlert(acronym) {
    Swal.fire({
        icon: 'warning',
        title: '¡Advertencia!',
        text: `El sistema "${acronym}" se acerca a cumplir las horas para inspección.`,
    });
}

function showInspectionAlert(acronym) {
    Swal.fire({
        icon: 'error',
        title: '¡Atención!',
        text: `El sistema "${acronym}" ya cumplió con las horas necesarias para inspección.`,
    });
}