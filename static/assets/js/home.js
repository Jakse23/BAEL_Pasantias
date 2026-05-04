document.addEventListener('DOMContentLoaded', () => {
    // Función para animar las cartas en cascada
    const animateCards = () => {
        const cards = document.querySelectorAll('.dashboard-card.card-efx');
        cards.forEach((card, idx) => {
            setTimeout(() => {
                card.classList.add('reveal');
            }, 150 + (idx * 100));
        });
    };

    // Ejecutar animación inicial
    animateCards();

    // ========== LOGOUT CON SWEETALERT ==========
    const logoutForm = document.getElementById('logoutForm');
    
    if (logoutForm) {
        logoutForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevenir envío normal
            
            Swal.fire({
                title: '¿Cerrar sesión?',
                text: "Se finalizará tu sesión en DIMADEA",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#00d2ff',
                cancelButtonColor: '#1a1d21',
                confirmButtonText: 'Sí, salir',
                cancelButtonText: 'Cancelar',
                background: '#0b1118',
                color: '#ffffff',
                backdrop: `rgba(0, 210, 255, 0.1)`
            }).then((result) => {
                if (result.isConfirmed) {
                    // Enviar el formulario
                    this.submit();
                }
            });
        });
    } else {
        console.error('Formulario de logout no encontrado');
    }

    // ========== BOTÓN DE INICIO ==========
    const btnInicio = document.getElementById('btnInicio');
    if (btnInicio) {
        btnInicio.addEventListener('click', function() {
            window.location.href = '/home/dashboard/';
        });
    }

    // ========== DETECTAR CATEGORÍA AL CARGAR DASHBOARD ==========
    // Esto permite que al volver de una lista (C-130, etc.) se muestre la categoría correcta
    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get('categoria');
    
    // Verificar si estamos en el dashboard (por la URL o porque existe fleetContent)
    const isDashboard = window.location.pathname.includes('/home/dashboard/') || 
                        document.getElementById('fleetContent');
    
    if (isDashboard && categoria) {
        // Pequeño delay para asegurar que fleetContent existe y las funciones están cargadas
        setTimeout(() => {
            if (categoria === 'transporte' && typeof showTransporte === 'function') {
                console.log('🔄 Abriendo categoría: Transporte');
                showTransporte();
            } else if (categoria === 'combate' && typeof showCombate === 'function') {
                console.log('🔄 Abriendo categoría: Combate');
                showCombate();
            } else if (categoria === 'ala-rotativa' && typeof showAlaRotativa === 'function') {
                console.log('🔄 Abriendo categoría: Ala Rotativa');
                showAlaRotativa();
            }
        }, 100);
    }
});