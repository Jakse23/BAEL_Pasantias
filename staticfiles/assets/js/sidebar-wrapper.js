document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.querySelector('[data-lte-toggle="sidebar"]');
    const sidebarWrapper = document.querySelector('.sidebar-wrapper');

    toggleButton.addEventListener('click', function (e) {
        e.preventDefault(); // Evitar comportamiento por defecto
        sidebarWrapper.classList.toggle('collapsed');
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const dropdownLinks = document.querySelectorAll('.nav-item > .nav-link'); // Links principales del menú
    const currentUrl = window.location.href; // URL actual

    dropdownLinks.forEach(link => {
        const parentItem = link.closest('.nav-item'); // Elemento padre del link
        const subMenu = parentItem.querySelector('.nav-treeview'); // Submenú asociado

        // Resaltar el elemento activo
        const subLinks = subMenu ? subMenu.querySelectorAll('.nav-link') : [];
        subLinks.forEach(subLink => {
            if (currentUrl.includes(subLink.getAttribute('href'))) {
                subLink.classList.add('active');
                parentItem.classList.add('menu-open'); // Asegurar que el menú esté abierto
            }
        });

        // Alternar el menú desplegable al hacer clic
        link.addEventListener('click', function (e) {
            if (subMenu) {
                e.preventDefault(); // Evitar el comportamiento por defecto
                parentItem.classList.toggle('menu-open');
                subMenu.style.display = parentItem.classList.contains('menu-open') ? 'block' : 'none';
            }
        });
    });
});

