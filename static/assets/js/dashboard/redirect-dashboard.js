document.addEventListener('DOMContentLoaded', () => {
    const loginSuccess = localStorage.getItem('loginSuccess');
    console.log('Valor recuperado de sessionStorage:', loginSuccess); // Verificar recuperación
    if (loginSuccess) {
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: loginSuccess,
            showConfirmButton: true,
        });
        localStorage.removeItem('loginSuccess'); // Limpiar el indicador después de mostrar la alerta
    }
});
