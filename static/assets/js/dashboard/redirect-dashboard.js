// Archivo: static/assets/js/dashboard/redirect-dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Dashboard JS cargado');
    
    // Función para obtener contadores desde el backend
    async function getCounters(systemType) {
        try {
            const response = await fetch(`/home/api/counters/${systemType}/`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error obteniendo contadores:', error);
            return { disponible: 0, mantenimiento: 0, inoperativo: 0 };
        }
    }
    
    // Función para calcular porcentaje de operatividad
    function getOperatividadPercentage(disponible, total) {
        if (total === 0) return 0;
        return Math.round((disponible / total) * 100);
    }
    
    // Función para mostrar Transporte con medidores por modelo
    async function showTransporte() {
        var fleetContent = document.getElementById('fleetContent');
        
        fleetContent.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 40px; color: #00BCD4;"></i>
                <p style="color: #8A9BB0; margin-top: 15px;">Cargando flota de transporte...</p>
            </div>
        `;
        
        const c130Counters = await getCounters('C-130HV');
        const y8fCounters = await getCounters('Y8F200W');
        const shortCounters = await getCounters('SD-360');
        
        // Calcular porcentajes
        const c130Total = c130Counters.disponible + c130Counters.mantenimiento + c130Counters.inoperativo;
        const y8fTotal = y8fCounters.disponible + y8fCounters.mantenimiento + y8fCounters.inoperativo;
        const shortTotal = shortCounters.disponible + shortCounters.mantenimiento + shortCounters.inoperativo;
        
        const c130Porcentaje = getOperatividadPercentage(c130Counters.disponible, c130Total);
        const y8fPorcentaje = getOperatividadPercentage(y8fCounters.disponible, y8fTotal);
        const shortPorcentaje = getOperatividadPercentage(shortCounters.disponible, shortTotal);
        
        var html = `
            <div>
                <button class="btn-back" onclick="location.reload()">
                    <i class="fas fa-arrow-left"></i> Volver a Flotas
                </button>
                
                <div class="category-title">
                    <i class="fas fa-plane" style="color: #00BCD4;"></i>
                    <h2 style="color: #00BCD4;">Flota de Transporte</h2>
                </div>
                
                <div class="aircraft-cards-container">
                    <!-- CARTA C-130 HÉRCULES CON IMAGEN -->
                    <div class="aircraft-card" onclick="window.location.href='/home/c130/?categoria=transporte'" style="cursor: pointer;">
                        <div class="aircraft-image-box" style="border-color: #00BCD4;">
                            <img src="/static/assets/img/c-130.jpg" alt="C-130 Hércules" class="aircraft-image" onerror="this.src='https://via.placeholder.com/300x120/0a0f16/00BCD4?text=C-130+HERCULES'">
                        </div>
                        <h3 style="color: #00BCD4;">C-130 HÉRCULES</h3>
                        
                        <div class="fleet-meter">
                            <div class="meter-label">Operatividad</div>
                            <div class="meter-bar-container">
                                <div class="meter-bar" style="width: ${c130Porcentaje}%; background: linear-gradient(90deg, #00BCD4, #1E88E5);"></div>
                            </div>
                            <div class="meter-stats">
                                <span class="meter-percentage" style="color: #00BCD4;">${c130Porcentaje}%</span>
                                <span class="meter-count">(${c130Counters.disponible}/${c130Total})</span>
                            </div>
                        </div>
                        
                        <div class="status-badges">
                            <div class="status-badge">
                                <span class="status-led green"></span>
                                <span class="status-count">${c130Counters.disponible}</span>
                                <span class="status-label">Disponible</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led yellow"></span>
                                <span class="status-count">${c130Counters.mantenimiento}</span>
                                <span class="status-label">Mantenimiento</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led red"></span>
                                <span class="status-count">${c130Counters.inoperativo}</span>
                                <span class="status-label">Canibalización</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- CARTA Y8F-200W CON IMAGEN -->
                    <div class="aircraft-card" onclick="window.location.href='/home/y8f/?categoria=transporte'" style="cursor: pointer;">
                        <div class="aircraft-image-box" style="border-color: #00BCD4;">
                            <img src="/static/assets/img/Y8F-200W.png" alt="Y8F-200W" class="aircraft-image" onerror="this.src='https://via.placeholder.com/300x120/0a0f16/00BCD4?text=Y8F-200W'">
                        </div>
                        <h3 style="color: #00BCD4;">Y8F-200W</h3>
                        
                        <div class="fleet-meter">
                            <div class="meter-label">Operatividad</div>
                            <div class="meter-bar-container">
                                <div class="meter-bar" style="width: ${y8fPorcentaje}%; background: linear-gradient(90deg, #00BCD4, #1E88E5);"></div>
                            </div>
                            <div class="meter-stats">
                                <span class="meter-percentage" style="color: #00BCD4;">${y8fPorcentaje}%</span>
                                <span class="meter-count">(${y8fCounters.disponible}/${y8fTotal})</span>
                            </div>
                        </div>
                        
                        <div class="status-badges">
                            <div class="status-badge">
                                <span class="status-led green"></span>
                                <span class="status-count">${y8fCounters.disponible}</span>
                                <span class="status-label">Disponible</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led yellow"></span>
                                <span class="status-count">${y8fCounters.mantenimiento}</span>
                                <span class="status-label">Mantenimiento</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led red"></span>
                                <span class="status-count">${y8fCounters.inoperativo}</span>
                                <span class="status-label">Canibalización</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- CARTA SHORT360 CON IMAGEN -->
                    <div class="aircraft-card" onclick="window.location.href='/home/short360/?categoria=transporte'" style="cursor: pointer;">
                        <div class="aircraft-image-box" style="border-color: #00BCD4;">
                            <img src="/static/assets/img/SHORT360.webp" alt="SHORT360" class="aircraft-image" onerror="this.src='https://via.placeholder.com/300x120/0a0f16/00BCD4?text=SHORT360'">
                        </div>
                        <h3 style="color: #00BCD4;">SHORT360</h3>
                        
                        <div class="fleet-meter">
                            <div class="meter-label">Operatividad</div>
                            <div class="meter-bar-container">
                                <div class="meter-bar" style="width: ${shortPorcentaje}%; background: linear-gradient(90deg, #00BCD4, #1E88E5);"></div>
                            </div>
                            <div class="meter-stats">
                                <span class="meter-percentage" style="color: #00BCD4;">${shortPorcentaje}%</span>
                                <span class="meter-count">(${shortCounters.disponible}/${shortTotal})</span>
                            </div>
                        </div>
                        
                        <div class="status-badges">
                            <div class="status-badge">
                                <span class="status-led green"></span>
                                <span class="status-count">${shortCounters.disponible}</span>
                                <span class="status-label">Disponible</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led yellow"></span>
                                <span class="status-count">${shortCounters.mantenimiento}</span>
                                <span class="status-label">Mantenimiento</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led red"></span>
                                <span class="status-count">${shortCounters.inoperativo}</span>
                                <span class="status-label">Canibalización</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        fleetContent.innerHTML = html;
    }
    
    // Función para mostrar Combate con datos reales
    async function showCombate() {
        var fleetContent = document.getElementById('fleetContent');
        
        fleetContent.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 40px; color: #00BCD4;"></i>
                <p style="color: #8A9BB0; margin-top: 15px;">Cargando flota de combate...</p>
            </div>
        `;
        
        // Obtener contadores para cada modelo de combate
        const f16Counters = await getCounters('F-16');
        const mirageCounters = await getCounters('Mirage-2000');
        const su30Counters = await getCounters('Su-30');
        
        // Calcular porcentajes
        const f16Total = f16Counters.disponible + f16Counters.mantenimiento + f16Counters.inoperativo;
        const mirageTotal = mirageCounters.disponible + mirageCounters.mantenimiento + mirageCounters.inoperativo;
        const su30Total = su30Counters.disponible + su30Counters.mantenimiento + su30Counters.inoperativo;
        
        const f16Porcentaje = getOperatividadPercentage(f16Counters.disponible, f16Total);
        const miragePorcentaje = getOperatividadPercentage(mirageCounters.disponible, mirageTotal);
        const su30Porcentaje = getOperatividadPercentage(su30Counters.disponible, su30Total);
        
        var html = `
            <div>
                <button class="btn-back" onclick="location.reload()">
                    <i class="fas fa-arrow-left"></i> Volver a Flotas
                </button>
                
                <div class="category-title">
                    <i class="fas fa-fighter-jet" style="color: #00BCD4;"></i>
                    <h2 style="color: #00BCD4;">Flota de Combate</h2>
                </div>
                
                <div class="aircraft-cards-container">
                    <!-- CARTA F-16 -->
                    <div class="aircraft-card" onclick="window.location.href='/home/f16/?categoria=combate'" style="cursor: pointer;">
                        <div class="aircraft-image-box" style="border-color: #00BCD4;">
                            <img src="/static/assets/img/f-16.jpg" alt="F-16 Fighting Falcon" class="aircraft-image" onerror="this.src='https://via.placeholder.com/300x120/0a0f16/00BCD4?text=F-16'">
                        </div>
                        <h3 style="color: #00BCD4;">F-16 FIGHTING FALCON</h3>
                        
                        <div class="fleet-meter">
                            <div class="meter-label">Operatividad</div>
                            <div class="meter-bar-container">
                                <div class="meter-bar" style="width: ${f16Porcentaje}%; background: linear-gradient(90deg, #00BCD4, #1E88E5);"></div>
                            </div>
                            <div class="meter-stats">
                                <span class="meter-percentage" style="color: #00BCD4;">${f16Porcentaje}%</span>
                                <span class="meter-count">(${f16Counters.disponible}/${f16Total})</span>
                            </div>
                        </div>
                        
                        <div class="status-badges">
                            <div class="status-badge">
                                <span class="status-led green"></span>
                                <span class="status-count">${f16Counters.disponible}</span>
                                <span class="status-label">Disponible</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led yellow"></span>
                                <span class="status-count">${f16Counters.mantenimiento}</span>
                                <span class="status-label">Mantenimiento</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led red"></span>
                                <span class="status-count">${f16Counters.inoperativo}</span>
                                <span class="status-label">Canibalización</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- CARTA MIRAGE 2000 -->
                    <div class="aircraft-card" onclick="window.location.href='/home/mirage/?categoria=combate'" style="cursor: pointer;">
                        <div class="aircraft-image-box" style="border-color: #00BCD4;">
                            <img src="/static/assets/img/mirage-2000.jpg" alt="Mirage 2000" class="aircraft-image" onerror="this.src='https://via.placeholder.com/300x120/0a0f16/00BCD4?text=MIRAGE+2000'">
                        </div>
                        <h3 style="color: #00BCD4;">MIRAGE 2000</h3>
                        
                        <div class="fleet-meter">
                            <div class="meter-label">Operatividad</div>
                            <div class="meter-bar-container">
                                <div class="meter-bar" style="width: ${miragePorcentaje}%; background: linear-gradient(90deg, #00BCD4, #1E88E5);"></div>
                            </div>
                            <div class="meter-stats">
                                <span class="meter-percentage" style="color: #00BCD4;">${miragePorcentaje}%</span>
                                <span class="meter-count">(${mirageCounters.disponible}/${mirageTotal})</span>
                            </div>
                        </div>
                        
                        <div class="status-badges">
                            <div class="status-badge">
                                <span class="status-led green"></span>
                                <span class="status-count">${mirageCounters.disponible}</span>
                                <span class="status-label">Disponible</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led yellow"></span>
                                <span class="status-count">${mirageCounters.mantenimiento}</span>
                                <span class="status-label">Mantenimiento</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led red"></span>
                                <span class="status-count">${mirageCounters.inoperativo}</span>
                                <span class="status-label">Canibalización</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- CARTA SU-30 -->
                    <div class="aircraft-card" onclick="window.location.href='/home/su30/?categoria=combate'" style="cursor: pointer;">
                        <div class="aircraft-image-box" style="border-color: #00BCD4;">
                            <img src="/static/assets/img/su-30.jpg" alt="Su-30" class="aircraft-image" onerror="this.src='https://via.placeholder.com/300x120/0a0f16/00BCD4?text=SU-30'">
                        </div>
                        <h3 style="color: #00BCD4;">SU-30</h3>
                        
                        <div class="fleet-meter">
                            <div class="meter-label">Operatividad</div>
                            <div class="meter-bar-container">
                                <div class="meter-bar" style="width: ${su30Porcentaje}%; background: linear-gradient(90deg, #00BCD4, #1E88E5);"></div>
                            </div>
                            <div class="meter-stats">
                                <span class="meter-percentage" style="color: #00BCD4;">${su30Porcentaje}%</span>
                                <span class="meter-count">(${su30Counters.disponible}/${su30Total})</span>
                            </div>
                        </div>
                        
                        <div class="status-badges">
                            <div class="status-badge">
                                <span class="status-led green"></span>
                                <span class="status-count">${su30Counters.disponible}</span>
                                <span class="status-label">Disponible</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led yellow"></span>
                                <span class="status-count">${su30Counters.mantenimiento}</span>
                                <span class="status-label">Mantenimiento</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led red"></span>
                                <span class="status-count">${su30Counters.inoperativo}</span>
                                <span class="status-label">Canibalización</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        fleetContent.innerHTML = html;
    }
    
    // Función para mostrar Ala Rotativa con datos reales
    async function showAlaRotativa() {
        var fleetContent = document.getElementById('fleetContent');
        
        fleetContent.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 40px; color: #00BCD4;"></i>
                <p style="color: #8A9BB0; margin-top: 15px;">Cargando flota de ala rotatoria...</p>
            </div>
        `;
        
        // Obtener contadores para cada modelo de helicóptero
        const cougarCounters = await getCounters('AS-532');
        const mi17Counters = await getCounters('Mi-17');
        const h125Counters = await getCounters('H-125');
        
        // Calcular porcentajes
        const cougarTotal = cougarCounters.disponible + cougarCounters.mantenimiento + cougarCounters.inoperativo;
        const mi17Total = mi17Counters.disponible + mi17Counters.mantenimiento + mi17Counters.inoperativo;
        const h125Total = h125Counters.disponible + h125Counters.mantenimiento + h125Counters.inoperativo;
        
        const cougarPorcentaje = getOperatividadPercentage(cougarCounters.disponible, cougarTotal);
        const mi17Porcentaje = getOperatividadPercentage(mi17Counters.disponible, mi17Total);
        const h125Porcentaje = getOperatividadPercentage(h125Counters.disponible, h125Total);
        
        var html = `
            <div>
                <button class="btn-back" onclick="location.reload()">
                    <i class="fas fa-arrow-left"></i> Volver a Flotas
                </button>
                
                <div class="category-title">
                    <i class="fas fa-helicopter" style="color: #00BCD4;"></i>
                    <h2 style="color: #00BCD4;">Flota de Ala Rotatoria</h2>
                </div>
                
                <div class="aircraft-cards-container">
                    <!-- CARTA AS-532 COUGAR -->
                    <div class="aircraft-card" onclick="window.location.href='/home/cougar/?categoria=ala-rotativa'" style="cursor: pointer;">
                        <div class="aircraft-image-box" style="border-color: #00BCD4;">
                            <img src="/static/assets/img/cougar.jpg" alt="AS-532 Cougar" class="aircraft-image" onerror="this.src='https://via.placeholder.com/300x120/0a0f16/00BCD4?text=AS-532+COUGAR'">
                        </div>
                        <h3 style="color: #00BCD4;">AS-532 COUGAR</h3>
                        
                        <div class="fleet-meter">
                            <div class="meter-label">Operatividad</div>
                            <div class="meter-bar-container">
                                <div class="meter-bar" style="width: ${cougarPorcentaje}%; background: linear-gradient(90deg, #00BCD4, #1E88E5);"></div>
                            </div>
                            <div class="meter-stats">
                                <span class="meter-percentage" style="color: #00BCD4;">${cougarPorcentaje}%</span>
                                <span class="meter-count">(${cougarCounters.disponible}/${cougarTotal})</span>
                            </div>
                        </div>
                        
                        <div class="status-badges">
                            <div class="status-badge">
                                <span class="status-led green"></span>
                                <span class="status-count">${cougarCounters.disponible}</span>
                                <span class="status-label">Disponible</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led yellow"></span>
                                <span class="status-count">${cougarCounters.mantenimiento}</span>
                                <span class="status-label">Mantenimiento</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led red"></span>
                                <span class="status-count">${cougarCounters.inoperativo}</span>
                                <span class="status-label">Canibalización</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- CARTA MI-17 -->
                    <div class="aircraft-card" onclick="window.location.href='/home/mi17/?categoria=ala-rotativa'" style="cursor: pointer;">
                        <div class="aircraft-image-box" style="border-color: #00BCD4;">
                            <img src="/static/assets/img/mi-17.jpg" alt="Mi-17" class="aircraft-image" onerror="this.src='https://via.placeholder.com/300x120/0a0f16/00BCD4?text=MI-17'">
                        </div>
                        <h3 style="color: #00BCD4;">MI-17</h3>
                        
                        <div class="fleet-meter">
                            <div class="meter-label">Operatividad</div>
                            <div class="meter-bar-container">
                                <div class="meter-bar" style="width: ${mi17Porcentaje}%; background: linear-gradient(90deg, #00BCD4, #1E88E5);"></div>
                            </div>
                            <div class="meter-stats">
                                <span class="meter-percentage" style="color: #00BCD4;">${mi17Porcentaje}%</span>
                                <span class="meter-count">(${mi17Counters.disponible}/${mi17Total})</span>
                            </div>
                        </div>
                        
                        <div class="status-badges">
                            <div class="status-badge">
                                <span class="status-led green"></span>
                                <span class="status-count">${mi17Counters.disponible}</span>
                                <span class="status-label">Disponible</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led yellow"></span>
                                <span class="status-count">${mi17Counters.mantenimiento}</span>
                                <span class="status-label">Mantenimiento</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led red"></span>
                                <span class="status-count">${mi17Counters.inoperativo}</span>
                                <span class="status-label">Canibalización</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- CARTA H-125 -->
                    <div class="aircraft-card" onclick="window.location.href='/home/h125/?categoria=ala-rotativa'" style="cursor: pointer;">
                        <div class="aircraft-image-box" style="border-color: #00BCD4;">
                            <img src="/static/assets/img/h-125.jpg" alt="H-125" class="aircraft-image" onerror="this.src='https://via.placeholder.com/300x120/0a0f16/00BCD4?text=H-125'">
                        </div>
                        <h3 style="color: #00BCD4;">H-125</h3>
                        
                        <div class="fleet-meter">
                            <div class="meter-label">Operatividad</div>
                            <div class="meter-bar-container">
                                <div class="meter-bar" style="width: ${h125Porcentaje}%; background: linear-gradient(90deg, #00BCD4, #1E88E5);"></div>
                            </div>
                            <div class="meter-stats">
                                <span class="meter-percentage" style="color: #00BCD4;">${h125Porcentaje}%</span>
                                <span class="meter-count">(${h125Counters.disponible}/${h125Total})</span>
                            </div>
                        </div>
                        
                        <div class="status-badges">
                            <div class="status-badge">
                                <span class="status-led green"></span>
                                <span class="status-count">${h125Counters.disponible}</span>
                                <span class="status-label">Disponible</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led yellow"></span>
                                <span class="status-count">${h125Counters.mantenimiento}</span>
                                <span class="status-label">Mantenimiento</span>
                            </div>
                            <div class="status-badge">
                                <span class="status-led red"></span>
                                <span class="status-count">${h125Counters.inoperativo}</span>
                                <span class="status-label">Canibalización</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        fleetContent.innerHTML = html;
    }
    
    // Detectar categoría desde sessionStorage
    const categoriaGuardada = sessionStorage.getItem('categoria_abierta');
    console.log('Categoría guardada:', categoriaGuardada);
    
    if (categoriaGuardada) {
        sessionStorage.removeItem('categoria_abierta');
        
        setTimeout(() => {
            console.log('Abriendo categoría:', categoriaGuardada);
            if (categoriaGuardada === 'transporte') {
                showTransporte();
            } else if (categoriaGuardada === 'combate') {
                showCombate();
            } else if (categoriaGuardada === 'ala-rotativa') {
                showAlaRotativa();
            }
        }, 200);
    }
    
    // Eventos de las cartas principales
    var cards = document.querySelectorAll('[data-fleet-category]');
    console.log('Cartas encontradas:', cards.length);
    
    cards.forEach(function(card) {
        card.addEventListener('click', function() {
            var category = this.getAttribute('data-fleet-category');
            console.log('Click en:', category);
            
            if (category === 'transporte') {
                showTransporte();
            } else if (category === 'combate') {
                showCombate();
            } else if (category === 'ala-rotativa') {
                showAlaRotativa();
            }
        });
    });
});