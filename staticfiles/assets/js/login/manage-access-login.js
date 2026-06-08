// Manejar el inicio de sesión con AJAX
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evitar el envío normal del formulario

    const formData = new FormData(loginForm);
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
        const response = await fetch('', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            body: formData,
        });

        const data = await response.json();

        if (data.status === 'success') {
            // Guardar indicador de éxito en sessionStorage
            localStorage.setItem('loginSuccess', data.message);
            window.location.href = data.redirect_url; // Redirigir al dashboard
        } else {
            // Mostrar alerta de error
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message,
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
        });
    }
});