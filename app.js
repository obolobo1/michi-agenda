// ── ESTADO GLOBAL ─────────────────────────────────────
let fechaSeleccionada = new Date();
let mesActualMini = new Date();
let agendaEditandoId = null;
let agendaViendoId = null;

// ── ICONOS ────────────────────────────────────────────
function obtenerIcono(nombre) {
    const n = nombre.toLowerCase();
    if (n.includes('gym') || n.includes('gimnasio') || n.includes('entrenar') || n.includes('ejercicio')) return '💪';
    if (n.includes('comer') || n.includes('comida') || n.includes('almuerzo') || n.includes('desayuno') || n.includes('cenar') || n.includes('cena')) return '🍽️';
    if (n.includes('corte') || n.includes('cabello') || n.includes('rasurar') || n.includes('bañar') || n.includes('peluqueria')) return '✂️';
    if (n.includes('salir') || n.includes('casa') || n.includes('manejar') || n.includes('carro')) return '🚗';
    if (n.includes('trabajo') || n.includes('trabajar') || n.includes('oficina') || n.includes('reunión') || n.includes('junta')) return '💼';
    if (n.includes('doctor') || n.includes('médico') || n.includes('cita') || n.includes('hospital') || n.includes('medicina') || n.includes('medicinas')) return '🏥';
    if (n.includes('escuela') || n.includes('clase') || n.includes('estudiar') || n.includes('tarea') || n.includes('universidad')) return '📚';
    if (n.includes('dormir') || n.includes('siesta') || n.includes('descansar')) return '😴';
    if (n.includes('compras') || n.includes('super') || n.includes('mercado') || n.includes('tienda')) return '🛒';
    if (n.includes('pago') || n.includes('banco') || n.includes('dinero') || n.includes('cajero')) return '💰';
    if (n.includes('llamar') || n.includes('llamada') || n.includes('teléfono')) return '📞';
    if (n.includes('cumpleaños') || n.includes('fiesta') || n.includes('celebrar')) return '🎉';
    if (n.includes('perro') || n.includes('gato') || n.includes('mascota') || n.includes('michi') || n.includes('veterinario')) return '🐾';
    if (n.includes('música') || n.includes('guitarra') || n.includes('piano') || n.includes('ensayo')) return '🎵';
    if (n.includes('leer') || n.includes('libro') || n.includes('lectura')) return '📖';
    return '📌';
}

function obtenerClase(icono, idx) {
    if (icono === '💪') return 'verde';
    if (icono === '🍽️') return 'rojo';
    const clases = ['azul', 'morado', 'rosa'];
    return clases[idx % clases.length];
}

function parsearHora(horaStr) {
    if (!horaStr || horaStr === '--:--') return [99, 0];
    const partes = horaStr.split(':');
    return [parseInt(partes[0]), parseInt(partes[1] || 0)];
}

// ── FECHAS ────────────────────────────────────────────
function formatearFechaKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function formatearFechaDisplay(date) {
    return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function esMismaFecha(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
}

// ── SELECTOR DE FECHA ─────────────────────────────────
function toggleCalendario() {
    const cal = document.getElementById('mini-calendario');
    cal.classList.toggle('oculto');
    if (!cal.classList.contains('oculto')) {
        mesActualMini = new Date(fechaSeleccionada);
        renderMiniCalendario();
    }
}

function cambiarMesMini(delta) {
    mesActualMini.setMonth(mesActualMini.getMonth() + delta);
    renderMiniCalendario();
}

function renderMiniCalendario() {
    const hoy = new Date();
    const año = mesActualMini.getFullYear();
    const mes = mesActualMini.getMonth();

    document.getElementById('mini-mes-titulo').textContent =
        mesActualMini.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();

    let html = '';
    for (let i = 0; i < primerDia; i++) {
        html += '<div class="mini-dia vacio"></div>';
    }
    for (let d = 1; d <= diasEnMes; d++) {
        const fecha = new Date(año, mes, d);
        let clases = 'mini-dia';
        if (esMismaFecha(fecha, hoy)) clases += ' hoy';
        if (esMismaFecha(fecha, fechaSeleccionada)) clases += ' seleccionado';
        html += `<div class="${clases}" onclick="seleccionarFecha(${año}, ${mes}, ${d})">${d}</div>`;
    }

    document.getElementById('mini-cal-grid').innerHTML = html;
}

function seleccionarFecha(año, mes, dia) {
    fechaSeleccionada = new Date(año, mes, dia);
    actualizarDisplayFecha();
    document.getElementById('mini-calendario').classList.add('oculto');
}

function actualizarDisplayFecha() {
    const hoy = new Date();
    const display = document.getElementById('fecha-display');
    if (esMismaFecha(fechaSeleccionada, hoy)) {
        display.textContent = 'Hoy — ' + formatearFechaDisplay(fechaSeleccionada);
    } else {
        display.textContent = formatearFechaDisplay(fechaSeleccionada);
    }
}

// ── STORAGE ───────────────────────────────────────────
function cargarAgendas() {
    return JSON.parse(localStorage.getItem('michi-agendas') || '[]');
}

function guardarAgendas(agendas) {
    localStorage.setItem('michi-agendas', JSON.stringify(agendas));
}

function buscarAgendaPorFecha(fechaKey) {
    return cargarAgendas().find(a => a.fechaKey === fechaKey) || null;
}

// ── NAVEGACIÓN ────────────────────────────────────────
function mostrarEditor(fechaParam = null) {
    agendaEditandoId = null;
    fechaSeleccionada = fechaParam ? new Date(fechaParam + 'T12:00:00') : new Date();
    mesActualMini = new Date(fechaSeleccionada);

    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-editor').classList.add('activa');
    document.getElementById('input-actividades').value = '';
    actualizarDisplayFecha();
}

function volverAtras() {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-seleccion').classList.add('activa');
    document.getElementById('contenido-dashboard').innerHTML = '';
    agendaViendoId = null;
    mostrarAgendas();
}

function editarAgendaActual() {
    if (!agendaViendoId) return;
    const agenda = cargarAgendas().find(a => a.id === agendaViendoId);
    if (!agenda) return;

    agendaEditandoId = agendaViendoId;
    fechaSeleccionada = new Date(agenda.fechaKey + 'T12:00:00');
    mesActualMini = new Date(fechaSeleccionada);

    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-editor').classList.add('activa');
    document.getElementById('input-actividades').value = agenda.texto;
    actualizarDisplayFecha();
}

function borrarAgendaActual() {
    if (!agendaViendoId) return;
    if (!confirm('¿Borrar esta agenda?')) return;
    let agendas = cargarAgendas();
    agendas = agendas.filter(a => a.id !== agendaViendoId);
    guardarAgendas(agendas);
    volverAtras();
}

// ── PROCESAR ──────────────────────────────────────────
function procesarAgenda() {
    const texto = document.getElementById('input-actividades').value.trim();
    if (!texto) { alert('Por favor ingresa tus actividades.'); return; }

    const fechaKey = formatearFechaKey(fechaSeleccionada);
    const nombre = formatearFechaDisplay(fechaSeleccionada);
    let agendas = cargarAgendas();

    if (agendaEditandoId) {
        const idx = agendas.findIndex(a => a.id === agendaEditandoId);
        if (idx !== -1) {
            agendas[idx].texto = texto;
            agendas[idx].nombre = nombre;
            agendas[idx].fechaKey = fechaKey;
        }
        agendaViendoId = agendaEditandoId;
        agendaEditandoId = null;
    } else {
        // Si ya existe agenda para esa fecha, reemplazar
        const existente = agendas.findIndex(a => a.fechaKey === fechaKey);
        if (existente !== -1) {
            agendas[existente].texto = texto;
            agendaViendoId = agendas[existente].id;
        } else {
            const nueva = { id: Date.now().toString(), nombre, texto, fechaKey };
            agendas.unshift(nueva);
            agendaViendoId = nueva.id;
        }
    }

    // Ordenar por fecha más reciente
    agendas.sort((a, b) => b.fechaKey.localeCompare(a.fechaKey));
    guardarAgendas(agendas);

    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-dashboard').classList.add('activa');
    document.getElementById('titulo-dashboard').textContent = nombre;
    procesarDiario(texto);
}

// ── MOSTRAR AGENDAS ───────────────────────────────────
function mostrarAgendas() {
    const agendas = cargarAgendas();
    const seccion = document.getElementById('seccion-guardadas');
    const lista = document.getElementById('lista-guardadas');

    if (agendas.length === 0) {
        seccion.style.display = 'none';
        return;
    }

    seccion.style.display = 'block';
    lista.innerHTML = agendas.map(a => {
        const primeraLinea = a.texto.split('\n').find(l => l.trim()) || '';
        const match = primeraLinea.match(/(.*?)[-–—]?\s*(\d{1,2}:\d{2}|\d{1,2})\s*$/);
        const primeraAct = match ? match[1].trim().replace(/[-–—]\s*$/, '') : primeraLinea;
        const emoji = obtenerIcono(primeraAct);
        return `
        <div class="agenda-guardada" onclick="abrirAgenda('${a.id}')">
            <div class="agenda-info">
                <span class="agenda-nombre">${a.nombre}</span>
                <span class="agenda-meta">${a.fechaKey}</span>
            </div>
            <span class="agenda-emoji">${emoji}</span>
        </div>`;
    }).join('');
}

function abrirAgenda(id) {
    const agenda = cargarAgendas().find(a => a.id === id);
    if (!agenda) return;

    agendaViendoId = id;
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-dashboard').classList.add('activa');
    document.getElementById('titulo-dashboard').textContent = agenda.nombre;
    procesarDiario(agenda.texto);
}

// ── DIARIO ────────────────────────────────────────────
function procesarDiario(texto) {
    const lineas = texto.split('\n');
    const palabrasLimpieza = ['barrer', 'trapear', 'lavar', 'ropa', 'limpieza'];
    let fijas = [], limpieza = [];

    lineas.forEach(linea => {
        linea = linea.trim();
        if (!linea) return;
        const esLimpieza = palabrasLimpieza.some(p => linea.toLowerCase().includes(p)) && !/\d/.test(linea);
        if (esLimpieza) {
            limpieza.push(linea);
        } else {
            const match = linea.match(/(.*?)[-–—]?\s*(\d{1,2}:\d{2}|\d{1,2})\s*$/);
            if (match) {
                let hora = match[2].trim();
                if (!hora.includes(':')) hora = hora + ':00';
                fijas.push({ actividad: match[1].trim().replace(/[-–—]\s*$/, ''), hora });
            } else {
                fijas.push({ actividad: linea, hora: '--:--' });
            }
        }
    });

    fijas.sort((a, b) => {
        const [ah, am] = parsearHora(a.hora);
        const [bh, bm] = parsearHora(b.hora);
        return ah !== bh ? ah - bh : am - bm;
    });

    document.getElementById('contenido-dashboard').innerHTML = renderDiario(fijas, limpieza);
}

function renderDiario(fijas, limpieza) {
    let timelineItems = fijas.map((act, idx) => {
        const icono = obtenerIcono(act.actividad);
        const clase = obtenerClase(icono, idx);
        const esUltimo = idx === fijas.length - 1;
        return `
        <div class="timeline-item">
            <div class="timeline-left">
                <div class="tl-circle ${clase}">${icono}</div>
                ${!esUltimo ? '<div class="tl-line"></div>' : ''}
            </div>
            <div class="tl-content">
                <div class="tl-hora">${act.hora}</div>
                <div class="tl-nombre">${act.actividad}</div>
            </div>
        </div>`;
    }).join('');

    let filas = fijas.map(act => {
        const icono = obtenerIcono(act.actividad);
        return `<tr><td class="time-cell">${act.hora}</td><td>${icono} ${act.actividad}</td></tr>`;
    }).join('');

    let limpiezaHTML = limpieza.map(t => `<li>✨ ${t}</li>`).join('');

    return `
        <div class="dashboard-diario">
            <div class="panel">
                <h3>Línea de Tiempo</h3>
                <div class="timeline-vertical">${timelineItems}</div>
            </div>
            <div class="panel">
                <h3>Actividades</h3>
                <table><thead><tr><th>Hora</th><th>Actividad</th></tr></thead>
                <tbody>${filas}</tbody></table>
            </div>
        </div>
        ${limpieza.length ? `<div class="panel" style="margin-top:15px"><h3>Tareas del Hogar</h3><ul style="padding-left:20px;line-height:2">${limpiezaHTML}</ul></div>` : ''}
    `;
}

// ── INIT ──────────────────────────────────────────────
actualizarDisplayFecha();
mostrarAgendas();