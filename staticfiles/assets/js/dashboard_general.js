// dashboard_general.js - Versión CORREGIDA

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ DOM cargado - Iniciando dashboard");
    
    // ========== VERIFICAR QUE CHART.JS ESTÉ CARGADO ==========
    if (typeof Chart === 'undefined') {
        console.error("❌ Chart.js NO está cargado");
        return;
    }
    console.log("✅ Chart.js está disponible");
    
    // ========== DATOS DE PRUEBA (si no vienen de Django) ==========
    const flotaDatos = typeof window.flotaDatos !== 'undefined' ? window.flotaDatos : [
        { matricula: "C130J-01", sistema: "C-130J Super Hércules", condicion: 0, horas: 3450, vidaUtil: 12000, id: 1 },
        { matricula: "C130J-02", sistema: "C-130J Super Hércules", condicion: 0, horas: 5200, vidaUtil: 12000, id: 2 },
        { matricula: "C130H-01", sistema: "C-130H Hércules", condicion: 1, horas: 11800, vidaUtil: 12000, id: 3 },
        { matricula: "KC130H-01", sistema: "KC-130H Cisterna", condicion: 0, horas: 6800, vidaUtil: 12000, id: 4 },
        { matricula: "C130J-04", sistema: "C-130J-30", condicion: 1, horas: 2100, vidaUtil: 12000, id: 5 },
        { matricula: "C130H-03", sistema: "C-130H Hércules", condicion: 2, horas: 11200, vidaUtil: 12000, id: 6 }
    ];
    
    // ========== FUNCIONES ==========
    
    function actualizarFechaHora() {
        const ahora = new Date();
        const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
        const fechaElem = document.getElementById('fechaActual');
        const horaElem = document.getElementById('horaActual');
        const updateElem = document.getElementById('ultimaActualizacion');
        
        if (fechaElem) fechaElem.innerText = ahora.toLocaleDateString('es-ES', opcionesFecha);
        if (horaElem) horaElem.innerText = ahora.toLocaleTimeString('es-ES');
        if (updateElem) updateElem.innerText = ahora.toLocaleTimeString('es-ES');
    }
    
    function calcularEstadisticas() {
        const operativos = flotaDatos.filter(a => a.condicion === 0).length;
        const mantenimiento = flotaDatos.filter(a => a.condicion === 1).length;
        const enTierra = flotaDatos.filter(a => a.condicion === 2).length;
        const total = flotaDatos.length;
        const operatividad = total > 0 ? Math.round((operativos / total) * 100) : 0;
        return { operativos, mantenimiento, enTierra, total, operatividad };
    }
    
    function renderizarTabla() {
        const tbody = document.getElementById('tablaAeronaves');
        if (!tbody) {
            console.error("❌ Tabla no encontrada");
            return;
        }
        
        const stats = calcularEstadisticas();
        const totalSpan = document.querySelector('.total-badge');
        if (totalSpan) totalSpan.innerText = `Total: ${stats.total} unidades`;
        
        tbody.innerHTML = '';
        
        flotaDatos.forEach(avion => {
            const row = tbody.insertRow();
            const horasRestantes = avion.vidaUtil - avion.horas;
            
            let condicionBadge = '';
            if (avion.condicion === 0) condicionBadge = '<span class="estado-insignia estado-operativo">OPERATIVO</span>';
            else if (avion.condicion === 1) condicionBadge = '<span class="estado-insignia estado-mantenimiento">MANTENIMIENTO</span>';
            else condicionBadge = '<span class="estado-insignia estado-inoperativo">INOPERATIVO</span>';
            
            let horasClase = '';
            if (horasRestantes < 500) horasClase = 'peligro';
            else if (horasRestantes < 1000) horasClase = 'alerta';
            
            row.innerHTML = `
                <td><strong>${avion.matricula}</strong></td>
                <td>${avion.sistema}</span></td>
                <td>${condicionBadge}</span></td>
                <td>${avion.horas.toLocaleString()} horas</span></td>
                <td>${avion.vidaUtil.toLocaleString()} horas</span></td>
                <td><span class="horas-restantes ${horasClase}">${horasRestantes.toLocaleString()} horas</span></span></td>
            `;
            
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => {
                window.location.href = `/c130/detalle/${avion.id}/`;
            });
        });
        console.log("✅ Tabla renderizada");
    }
    
    function renderizarOTs() {
        const container = document.getElementById('otsLista');
        if (!container) return;
        
        const ordenesTrabajo = [
            { id: "OT #1034", descripcion: "Cambio de Neumáticos", progreso: 80, prioridad: "alta" },
            { id: "OT #1035", descripcion: "Inspección Aviónica", progreso: 45, prioridad: "media" },
            { id: "OT #1036", descripcion: "Inspección Estructural", progreso: 15, prioridad: "critica" }
        ];
        
        container.innerHTML = '';
        ordenesTrabajo.forEach(ot => {
            container.innerHTML += `
                <div class="ot-item">
                    <div class="ot-cabecera">
                        <span><strong>${ot.id}</strong> - ${ot.descripcion}</span>
                        <span class="ot-prioridad ${ot.prioridad}">Prioridad ${ot.prioridad.charAt(0).toUpperCase() + ot.prioridad.slice(1)}</span>
                    </div>
                    <div class="barra-progreso">
                        <div class="barra-lleno" style="width: ${ot.progreso}%"></div>
                    </div>
                    <div class="ot-progreso">Progreso: ${ot.progreso}%</div>
                </div>
            `;
        });
    }
    
    function renderizarVencimientos() {
        const container = document.getElementById('vencimientosLista');
        if (!container) return;
        
        const vencimientos = [
            { descripcion: "Pesaje de Aeronave", dias: 30 },
            { descripcion: "Inspección de Corrosión", dias: 45 },
            { descripcion: "Control Meteorológico", dias: 60 },
            { descripcion: "Inspección Fase A", dias: 15 },
            { descripcion: "Overhaul Motor", dias: 90 }
        ];
        
        vencimientos.sort((a, b) => a.dias - b.dias);
        
        container.innerHTML = '';
        vencimientos.forEach(v => {
            let clase = v.dias < 15 ? 'urgente' : (v.dias < 45 ? 'warning' : '');
            container.innerHTML += `
                <div class="vencimiento-item ${clase}">
                    <span class="vencimiento-dias">${v.dias} DÍAS</span>
                    <span>${v.descripcion}</span>
                </div>
            `;
        });
    }
    
    function renderizarCalendarioMantenimiento() {
        const container = document.getElementById('calendarioMantenimiento');
        if (!container) return;
        
        const mantenimientos = [
            { descripcion: "Inspección Fase C - Unidad C130J-01", dias: 14 },
            { descripcion: "Revisión Tren de Aterrizaje - Unidad C130H-01", dias: 29 },
            { descripcion: "Prueba Hidrostática - Unidad C130J-03", dias: 45 },
            { descripcion: "Cambio de Filtros - Unidad C130H-03", dias: 7 }
        ];
        
        mantenimientos.sort((a, b) => a.dias - b.dias);
        
        container.innerHTML = '';
        mantenimientos.forEach(item => {
            let clase = item.dias < 10 ? 'urgente' : (item.dias < 30 ? 'warning' : '');
            container.innerHTML += `
                <div class="evento-mantenimiento ${clase}">
                    <span class="evento-dias">${item.dias} DÍAS</span>
                    <span>${item.descripcion}</span>
                </div>
            `;
        });
    }
    
    function renderizarCiclosMantenimiento() {
        const container = document.getElementById('ciclosMantenimiento');
        if (!container) return;
        
        const ciclos = [
            { nombre: "Inspección Cada 25 Horas", estado: "verde", descripcion: "Completado" },
            { nombre: "Inspección Cada 100 Horas", estado: "amarillo", descripcion: "Próximo en 12h" },
            { nombre: "Inspección Cada 300 Horas", estado: "verde", descripcion: "Completado" },
            { nombre: "Inspección Cada 600 Horas", estado: "rojo", descripcion: "Vence en 45h" },
            { nombre: "Inspección Cada 1200 Horas", estado: "amarillo", descripcion: "Próximo en 120h" }
        ];
        
        container.innerHTML = '';
        ciclos.forEach(ciclo => {
            let estadoTexto = ciclo.estado === 'verde' ? 'AL DÍA' : (ciclo.estado === 'amarillo' ? 'PRÓXIMO' : 'VENCE PRONTO');
            container.innerHTML += `
                <div class="ciclo-item">
                    <span class="ciclo-nombre">${ciclo.nombre}</span>
                    <div>
                        <span class="ciclo-estado ${ciclo.estado}">${estadoTexto}</span>
                        <span style="font-size: 0.65rem; margin-left: 8px; color: var(--texto-gris);">${ciclo.descripcion}</span>
                    </div>
                </div>
            `;
        });
    }
    
    function renderizarComponentes() {
        const container = document.getElementById('componentesLista');
        if (!container) return;
        
        const componentes = [
            { nombre: "Motor T56-A-15 (Posición #1)", horas: 450, critico: true },
            { nombre: "Motor T56-A-15 (Posición #2)", horas: 820, critico: false },
            { nombre: "Motor T56-A-15 (Posición #3)", horas: 820, critico: false },
            { nombre: "Motor T56-A-15 (Posición #4)", horas: 612, critico: false },
            { nombre: "Hélice NP2000", horas: 974, critico: false }
        ];
        
        container.innerHTML = '';
        componentes.forEach(comp => {
            container.innerHTML += `
                <div class="componente-item">
                    <span>${comp.nombre}</span>
                    <span class="horas ${comp.critico ? 'criticas' : ''}">${comp.horas} HORAS</span>
                </div>
            `;
        });
    }
    
    function actualizarMetricas() {
        const stats = calcularEstadisticas();
        
        const statsContainer = document.getElementById('estadisticasRapidas');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="estadistica-rapida">
                    <div class="valor" style="color: #00e676">${stats.operativos}</div>
                    <div class="etiqueta">OPERATIVOS</div>
                </div>
                <div class="estadistica-rapida">
                    <div class="valor" style="color: #ffc107">${stats.mantenimiento}</div>
                    <div class="etiqueta">MANTENIMIENTO</div>
                </div>
                <div class="estadistica-rapida">
                    <div class="valor" style="color: #ff5252">${stats.enTierra}</div>
                    <div class="etiqueta">AOG</div>
                </div>
            `;
        }
    }
    
    function inicializarGraficas() {
        const stats = calcularEstadisticas();
        const historicoOperatividad = [78, 82, 79, 85, 83, stats.operatividad];
        
        // Gráfica 1: Línea
        const ctx1 = document.getElementById('graficaOperatividad');
        if (ctx1) {
            new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                    datasets: [{
                        label: 'Operatividad (%)',
                        data: historicoOperatividad,
                        borderColor: '#42A5F5',
                        backgroundColor: 'rgba(66, 165, 245, 0.08)',
                        borderWidth: 3,
                        pointBackgroundColor: '#1E88E5',
                        pointBorderColor: '#ffffff',
                        pointRadius: 5,
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { labels: { color: '#9ca3af', font: { size: 10 } } } },
                    scales: { y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2a40' }, min: 70, max: 90 } }
                }
            });
            console.log("✅ Gráfica de líneas creada");
        }
        
        // Gráfica 2: Barras
        const ctx2 = document.getElementById('graficaHoras');
        if (ctx2) {
            new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: flotaDatos.map(a => a.matricula),
                    datasets: [{
                        label: 'Horas Acumuladas',
                        data: flotaDatos.map(a => a.horas),
                        backgroundColor: '#1E88E5',
                        borderRadius: 8,
                        barPercentage: 0.65
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { labels: { color: '#9ca3af', font: { size: 10 } } } },
                    scales: { y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2a40' } } }
                }
            });
            console.log("✅ Gráfica de barras creada");
        }
        
        // Gráfica 3: Pastel
        const ctx3 = document.getElementById('graficaEstado');
        if (ctx3) {
            new Chart(ctx3, {
                type: 'doughnut',
                data: {
                    labels: ['Operativos', 'Mantenimiento', 'En Tierra'],
                    datasets: [{
                        data: [stats.operativos, stats.mantenimiento, stats.enTierra],
                        backgroundColor: ['#00e676', '#ffc107', '#ff5252'],
                        borderWidth: 0,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 10 } } } }
                }
            });
            console.log("✅ Gráfica de pastel creada");
        }
        
        // Anillo de capacitación
        const ctxAnillo = document.getElementById('anilloCapacitacion');
        if (ctxAnillo) {
            const porcentaje = parseInt(document.getElementById('porcentajeCapacitacion')?.innerText || 96);
            new Chart(ctxAnillo, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [porcentaje, 100 - porcentaje],
                        backgroundColor: ['#00e676', '#ff5252'],
                        borderWidth: 0,
                        cutout: '70%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { display: false }, tooltip: { enabled: false } }
                }
            });
            console.log("✅ Anillo de capacitación creado");
        }
    }
    
    // ========== FUNCIÓN PARA DESPLEGAR/OCULTAR INVENTARIO ==========
    window.toggleInventario = function() {
        const contenido = document.getElementById('inventarioContenido');
        const icono = document.getElementById('toggleIcon');
        
        if (contenido.classList.contains('oculto')) {
            contenido.classList.remove('oculto');
            icono.classList.remove('cerrado');
        } else {
            contenido.classList.add('oculto');
            icono.classList.add('cerrado');
        }
    }
    
    // ========== INICIALIZACIÓN ==========
    renderizarTabla();
    renderizarOTs();
    renderizarVencimientos();
    renderizarCalendarioMantenimiento();
    renderizarCiclosMantenimiento();
    renderizarComponentes();
    actualizarMetricas();
    actualizarFechaHora();
    inicializarGraficas();
    
    // Actualizar fecha/hora cada segundo
    setInterval(actualizarFechaHora, 1000);
    
    console.log("✅ Dashboard inicializado correctamente");
});