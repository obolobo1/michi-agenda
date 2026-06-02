// ── ESTADO GLOBAL ─────────────────────────────────────
let fechaSeleccionada = new Date();
let mesActualMini = new Date();
let mesActualCal = new Date();
let agendaEditandoId = null;
let agendaViendoId = null;
let pantallaAnterior = 'pantalla-hoy';

// ── ICONOS ────────────────────────────────────────────
function obtenerIcono(nombre) {
    const n = nombre.toLowerCase();

    // EJERCICIO Y DEPORTE
    if (n.includes('gym') || n.includes('gimnasio') || n.includes('pesas') || n.includes('crossfit') || n.includes('entren')) return '💪';
    if (n.includes('correr') || n.includes('corr') || n.includes('jogging') || n.includes('trotar') || n.includes('trote') || n.includes('maratón')) return '🏃';
    if (n.includes('nadar') || n.includes('natación') || n.includes('alberca') || n.includes('piscina')) return '🏊';
    if (n.includes('bici') || n.includes('ciclismo') || n.includes('cycling')) return '🚴';
    if (n.includes('futbol') || n.includes('fútbol') || n.includes('soccer')) return '⚽';
    if (n.includes('basquet') || n.includes('básquet') || n.includes('basketball')) return '🏀';
    if (n.includes('tenis') || n.includes('pádel') || n.includes('padel')) return '🎾';
    if (n.includes('yoga') || n.includes('meditación') || n.includes('meditar') || n.includes('pilates')) return '🧘';
    if (n.includes('boxeo') || n.includes('box') || n.includes('artes marciales') || n.includes('karate')) return '🥊';
    if (n.includes('caminar') || n.includes('caminata') || n.includes('paseo') || n.includes('parque') || n.includes('bosque')) return '🚶';
    if (n.includes('ejercicio') || n.includes('deporte') || n.includes('entrenar')) return '🏋️';

    // COMIDA Y BEBIDA
    if (n.includes('desayuno') || n.includes('breakfast')) return '🍳';
    if (n.includes('almuerzo') || n.includes('lunch') || n.includes('comer') || n.includes('comida')) return '🍽️';
    if (n.includes('cena') || n.includes('cenar') || n.includes('dinner')) return '🌮';
    if (n.includes('café') || n.includes('cafe') || n.includes('coffee')) return '☕';
    if (n.includes('pizza') || n.includes('hamburguesa') || n.includes('tacos')) return '🍕';
    if (n.includes('sushi') || n.includes('japonés') || n.includes('ramen')) return '🍱';
    if (n.includes('postre') || n.includes('pastel') || n.includes('helado') || n.includes('dulce')) return '🍰';
    if (n.includes('bar') || n.includes('cerveza') || n.includes('bebida') || n.includes('trago') || n.includes('copa')) return '🍺';
    if (n.includes('agua') || n.includes('jugo') || n.includes('smoothie')) return '🥤';

    // SALUD Y MÉDICO
    if (n.includes('doctor') || n.includes('médico') || n.includes('medico') || n.includes('hospital') || n.includes('clínica') || n.includes('clinica')) return '🏥';
    if (n.includes('dentista') || n.includes('dental') || n.includes('dientes') || n.includes('ortodoncista')) return '🦷';
    if (n.includes('medicina') || n.includes('medicinas') || n.includes('pastilla') || n.includes('pastillas') || n.includes('farmacia') || n.includes('pildora')) return '💊';
    if (n.includes('terapia') || n.includes('psicólogo') || n.includes('psicologo') || n.includes('psiquiatra') || n.includes('terapeuta')) return '🧠';
    if (n.includes('cita') || n.includes('consulta') || n.includes('revisión') || n.includes('revision') || n.includes('chequeo')) return '📋';
    if (n.includes('vacuna') || n.includes('inyección') || n.includes('inyeccion')) return '💉';
    if (n.includes('optometrista') || n.includes('lentes') || n.includes('ojos') || n.includes('oftalmólogo')) return '👁️';

    // TRABAJO Y NEGOCIOS
    if (n.includes('trabajo') || n.includes('trabajar') || n.includes('oficina') || n.includes('chamba') || n.includes('laboral')) return '💼';
    if (n.includes('reunión') || n.includes('reunion') || n.includes('junta') || n.includes('meeting') || n.includes('call') || n.includes('zoom') || n.includes('teams')) return '👥';
    if (n.includes('presentación') || n.includes('presentacion') || n.includes('exposición') || n.includes('pitch')) return '📊';
    if (n.includes('entrevista') || n.includes('interview')) return '🤝';
    if (n.includes('cliente') || n.includes('clientes') || n.includes('ventas') || n.includes('vender')) return '💰';
    if (n.includes('correo') || n.includes('email') || n.includes('inbox')) return '📧';
    if (n.includes('proyecto') || n.includes('deadline') || n.includes('entrega')) return '📌';
    if (n.includes('contrato') || n.includes('firma') || n.includes('firmar') || n.includes('documento')) return '📝';

    // EDUCACIÓN
    if (n.includes('escuela') || n.includes('colegio') || n.includes('prepa') || n.includes('kinder')) return '🏫';
    if (n.includes('universidad') || n.includes('facultad') || n.includes('campus')) return '🎓';
    if (n.includes('clase') || n.includes('clases') || n.includes('curso') || n.includes('taller')) return '📚';
    if (n.includes('estudiar') || n.includes('estudio') || n.includes('repasar') || n.includes('tarea') || n.includes('examen')) return '✏️';
    if (n.includes('inglés') || n.includes('ingles') || n.includes('idioma') || n.includes('lenguaje')) return '🗣️';

    // COMPRAS Y TRÁMITES
    if (n.includes('super') || n.includes('supermercado') || n.includes('mercado') || n.includes('mandado') || n.includes('walmart') || n.includes('costco')) return '🛒';
    if (n.includes('compras') || n.includes('comprar') || n.includes('tienda') || n.includes('mall') || n.includes('plaza')) return '🛍️';
    if (n.includes('banco') || n.includes('cajero') || n.includes('transferencia') || n.includes('pago') || n.includes('pagar') || n.includes('factura')) return '🏦';
    if (n.includes('trámite') || n.includes('tramite') || n.includes('ine') || n.includes('sat') || n.includes('pasaporte') || n.includes('gobierno')) return '🏛️';
    if (n.includes('correos') || n.includes('paquete') || n.includes('envío') || n.includes('envio') || n.includes('fedex') || n.includes('dhl')) return '📦';
    if (n.includes('gasolina') || n.includes('gasolinera') || n.includes('gas')) return '⛽';

    // TRANSPORTE
    if (n.includes('manejar') || n.includes('carro') || n.includes('auto') || n.includes('coche') || n.includes('conducir')) return '🚗';
    if (n.includes('uber') || n.includes('taxi') || n.includes('didi') || n.includes('cabify')) return '🚕';
    if (n.includes('metro') || n.includes('metrobús') || n.includes('transporte') || n.includes('camión') || n.includes('bus')) return '🚌';
    if (n.includes('avión') || n.includes('avion') || n.includes('vuelo') || n.includes('aeropuerto') || n.includes('volar')) return '✈️';
    if (n.includes('tren') || n.includes('subte') || n.includes('subway')) return '🚆';
    if (n.includes('bici') || n.includes('moto') || n.includes('motocicleta')) return '🏍️';
    if (n.includes('salir') || n.includes('llegar') || n.includes('casa')) return '🏠';

    // HOGAR Y LIMPIEZA
    if (n.includes('barrer') || n.includes('trapear') || n.includes('limpiar') || n.includes('limpieza') || n.includes('aspirar')) return '🧹';
    if (n.includes('lavar') || n.includes('lavadora') || n.includes('ropa') || n.includes('planchar')) return '👕';
    if (n.includes('cocinar') || n.includes('cocina') || n.includes('hornear') || n.includes('receta')) return '👨‍🍳';
    if (n.includes('jardín') || n.includes('jardin') || n.includes('plantas') || n.includes('regar')) return '🌱';
    if (n.includes('plomero') || n.includes('electricista') || n.includes('reparar') || n.includes('arreglar') || n.includes('mantenimiento')) return '🔧';
    if (n.includes('mudanza') || n.includes('mudar') || n.includes('empacar')) return '📦';

    // MASCOTAS
    if (n.includes('veterinario') || n.includes('veterinaria') || n.includes('vet')) return '🏥';
    if (n.includes('perro') || n.includes('pasear perro') || n.includes('dog')) return '🐕';
    if (n.includes('gato') || n.includes('michi') || n.includes('cat') || n.includes('gatito')) return '🐈';
    if (n.includes('mascota') || n.includes('pet')) return '🐾';

    // SOCIAL Y FAMILIA
    if (n.includes('cumpleaños') || n.includes('cumple') || n.includes('birthday')) return '🎂';
    if (n.includes('fiesta') || n.includes('party') || n.includes('celebrar') || n.includes('celebración')) return '🎉';
    if (n.includes('boda') || n.includes('matrimonio') || n.includes('casamiento')) return '💍';
    if (n.includes('familia') || n.includes('papá') || n.includes('papa') || n.includes('mamá') || n.includes('mama') || n.includes('padres') || n.includes('hijos')) return '👨‍👩‍👧‍👦';
    if (n.includes('amigos') || n.includes('amigo') || n.includes('amiga') || n.includes('friends')) return '👫';
    if (n.includes('cita') || n.includes('date') || n.includes('novio') || n.includes('novia') || n.includes('pareja')) return '❤️';
    if (n.includes('iglesia') || n.includes('misa') || n.includes('templo') || n.includes('rezar') || n.includes('orar')) return '⛪';

    // ENTRETENIMIENTO
    if (n.includes('cine') || n.includes('película') || n.includes('pelicula') || n.includes('movie')) return '🎬';
    if (n.includes('teatro') || n.includes('obra') || n.includes('musical') || n.includes('concierto') || n.includes('show')) return '🎭';
    if (n.includes('museo') || n.includes('exposición') || n.includes('galería') || n.includes('arte')) return '🎨';
    if (n.includes('música') || n.includes('musica') || n.includes('guitarra') || n.includes('piano') || n.includes('ensayo') || n.includes('banda')) return '🎵';
    if (n.includes('videojuego') || n.includes('gaming') || n.includes('jugar') || n.includes('xbox') || n.includes('playstation')) return '🎮';
    if (n.includes('leer') || n.includes('libro') || n.includes('lectura') || n.includes('novela')) return '📖';
    if (n.includes('netflix') || n.includes('serie') || n.includes('episodio') || n.includes('ver') || n.includes('streaming')) return '📺';
    if (n.includes('viaje') || n.includes('viajar') || n.includes('vacaciones') || n.includes('turismo') || n.includes('hotel')) return '🧳';
    if (n.includes('playa') || n.includes('mar') || n.includes('alberca') || n.includes('nadar')) return '🏖️';
    if (n.includes('montaña') || n.includes('senderismo') || n.includes('hiking') || n.includes('bosque') || n.includes('naturaleza')) return '🏔️';

    // PERSONAL Y BIENESTAR
    if (n.includes('corte') || n.includes('cabello') || n.includes('pelo') || n.includes('peluquería') || n.includes('peluqueria') || n.includes('barber') || n.includes('barbería')) return '✂️';
    if (n.includes('manicure') || n.includes('manicura') || n.includes('pedicure') || n.includes('uñas') || n.includes('spa')) return '💅';
    if (n.includes('bañar') || n.includes('baño') || n.includes('ducha') || n.includes('asear')) return '🚿';
    if (n.includes('rasurar') || n.includes('rasurarse') || n.includes('depilación')) return '🪒';
    if (n.includes('dormir') || n.includes('siesta') || n.includes('descansar') || n.includes('nap')) return '😴';
    if (n.includes('despertar') || n.includes('levantarse') || n.includes('madrugar')) return '⏰';

    // COMUNICACIÓN
    if (n.includes('llamar') || n.includes('llamada') || n.includes('teléfono') || n.includes('telefono') || n.includes('llamar')) return '📞';
    if (n.includes('whatsapp') || n.includes('mensaje') || n.includes('chat') || n.includes('escribir')) return '💬';
    if (n.includes('videollamada') || n.includes('facetime') || n.includes('skype')) return '📹';

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

// ── STORAGE ───────────────────────────────────────────
function cargarAgendas() {
    return JSON.parse(localStorage.getItem('michi-agendas') || '[]');
}

function guardarAgendas(agendas) {
    localStorage.setItem('michi-agendas', JSON.stringify(agendas));
}

// ── PANTALLA HOY ──────────────────────────────────────
function mostrarHoy() {
    const hoy = new Date();
    const fechaKey = formatearFechaKey(hoy);
    const agendas = cargarAgendas();
    const agendaHoy = agendas.find(a => a.fechaKey === fechaKey);

    document.getElementById('titulo-hoy').textContent = formatearFechaDisplay(hoy);

    const accionesHoy = document.getElementById('acciones-hoy');

    if (agendaHoy) {
        agendaViendoId = agendaHoy.id;
        accionesHoy.style.display = 'flex';
        const { fijas } = parsearActividades(agendaHoy.texto);
        document.getElementById('contenido-hoy').innerHTML = renderTimelineHoy(fijas, hoy);
    } else {
        agendaViendoId = null;
        accionesHoy.style.display = 'none';
        document.getElementById('contenido-hoy').innerHTML = renderHorasVacias(hoy);
    }

    renderSemanaStrip();
}

function renderTimelineHoy(fijas, hoy) {
    const ahoraH = hoy.getHours();
    const ahoraM = hoy.getMinutes();

    let proximaIdx = -1;
    for (let i = 0; i < fijas.length; i++) {
        const [h, m] = parsearHora(fijas[i].hora);
        if (h > ahoraH || (h === ahoraH && m >= ahoraM)) {
            proximaIdx = i;
            break;
        }
    }

    let inicio = 0;
    if (proximaIdx > 1) inicio = proximaIdx - 1;
    if (inicio + 4 > fijas.length) inicio = Math.max(0, fijas.length - 4);
    const visibles = fijas.slice(inicio, inicio + 4);

    let items = visibles.map((act, idx) => {
        const realIdx = inicio + idx;
        const icono = obtenerIcono(act.actividad);
        const clase = obtenerClase(icono, realIdx);
        const esProxima = realIdx === proximaIdx;
        const esUltimo = idx === visibles.length - 1;
        return `
        <div class="timeline-item ${esProxima ? 'proxima' : ''}">
            <div class="timeline-left">
                <div class="tl-circle ${clase}">${icono}</div>
                ${!esUltimo ? '<div class="tl-line"></div>' : ''}
            </div>
            <div class="tl-content">
                <div class="tl-hora">${act.hora} ${esProxima ? '<span class="tag-proxima">próxima</span>' : ''}</div>
                <div class="tl-nombre">${act.actividad}</div>
            </div>
        </div>`;
    }).join('');

    return `<div class="timeline-hoy">${items}</div>`;
}

function renderHorasVacias(hoy) {
    const ahoraH = hoy.getHours();
    let items = '';
    for (let i = 0; i < 3; i++) {
        const h = ahoraH + i;
        if (h > 23) break;
        const hora = `${String(h).padStart(2,'0')}:00`;
        const esUltimo = i === 2;
        items += `
        <div class="timeline-item">
            <div class="timeline-left">
                <div class="tl-circle vacio"></div>
                ${!esUltimo ? '<div class="tl-line tl-line-vacia"></div>' : ''}
            </div>
            <div class="tl-content">
                <div class="tl-hora">${hora}</div>
                <div class="tl-nombre tl-vacio">Sin actividad</div>
            </div>
        </div>`;
    }
    return `
        <div class="timeline-hoy">${items}</div>
        <div style="text-align:center; margin-top: 16px;">
            <button class="btn-crear-hoy" onclick="mostrarEditor(null)">+ Crear agenda de hoy</button>
        </div>`;
}

// ── SEMANA STRIP ──────────────────────────────────────
function renderSemanaStrip() {
    const hoy = new Date();
    const agendas = cargarAgendas();
    const diasNombre = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

    let html = '';
    for (let i = 0; i < 7; i++) {
        const dia = new Date(hoy);
        dia.setDate(hoy.getDate() + i);
        const fechaKey = formatearFechaKey(dia);
        const agenda = agendas.find(a => a.fechaKey === fechaKey);

        let emoji = '';
        if (agenda) {
            const primeraLinea = agenda.texto.split('\n').find(l => l.trim()) || '';
            const match = primeraLinea.match(/(.*?)[-–—]?\s*(\d{1,2}:\d{2}|\d{1,2})\s*$/);
            const primeraAct = match ? match[1].trim().replace(/[-–—]\s*$/, '') : primeraLinea;
            emoji = obtenerIcono(primeraAct);
        }

        let clases = 'dia-strip';
        if (i === 0) clases += ' hoy';
        if (agenda) clases += ' tiene-agenda';

        html += `<div class="${clases}" onclick="seleccionarDiaStrip('${fechaKey}', ${!!agenda})">
            <div class="dia-strip-nombre">${diasNombre[dia.getDay()]}</div>
            <div class="dia-strip-num">${dia.getDate()}</div>
            <div class="dia-strip-emoji">${emoji}</div>
        </div>`;
    }

    document.getElementById('semana-strip').innerHTML = html;
}

function seleccionarDiaStrip(fechaKey, tieneAgenda) {
    if (tieneAgenda) {
        const agenda = cargarAgendas().find(a => a.fechaKey === fechaKey);
        if (!agenda) return;
        agendaViendoId = agenda.id;
        pantallaAnterior = 'pantalla-hoy';
        document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
        document.getElementById('pantalla-dashboard').classList.add('activa');
        document.getElementById('titulo-dashboard').textContent = agenda.nombre;
        document.getElementById('contenido-dashboard').innerHTML =
            renderDiario(parsearActividades(agenda.texto));
    } else {
        mostrarEditor(fechaKey);
    }
}

// ── CALENDARIO MENSUAL ────────────────────────────────
function abrirCalendario() {
    mesActualCal = new Date();
    renderCalendario();
    document.getElementById('modal-calendario').classList.remove('oculto');
}

function cerrarCalendario(event) {
    if (event.target.id === 'modal-calendario') {
        document.getElementById('modal-calendario').classList.add('oculto');
    }
}

function cambiarMes(delta) {
    mesActualCal.setMonth(mesActualCal.getMonth() + delta);
    renderCalendario();
}

function renderCalendario() {
    const hoy = new Date();
    const año = mesActualCal.getFullYear();
    const mes = mesActualCal.getMonth();
    const agendas = cargarAgendas();

    document.getElementById('titulo-mes').textContent =
        mesActualCal.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();

    let html = '';
    for (let i = 0; i < primerDia; i++) {
        html += '<div class="cal-dia vacio"></div>';
    }

    for (let d = 1; d <= diasEnMes; d++) {
        const fecha = new Date(año, mes, d);
        const fechaKey = formatearFechaKey(fecha);
        const agenda = agendas.find(a => a.fechaKey === fechaKey);

        let clases = 'cal-dia';
        if (esMismaFecha(fecha, hoy)) clases += ' hoy';
        if (agenda) clases += ' tiene-agenda';

        let emoji = '';
        if (agenda) {
            const primeraLinea = agenda.texto.split('\n').find(l => l.trim()) || '';
            const match = primeraLinea.match(/(.*?)[-–—]?\s*(\d{1,2}:\d{2}|\d{1,2})\s*$/);
            const primeraAct = match ? match[1].trim().replace(/[-–—]\s*$/, '') : primeraLinea;
            emoji = `<div class="cal-dia-emoji">${obtenerIcono(primeraAct)}</div>`;
        }

        html += `<div class="${clases}" onclick="seleccionarDiaCalendario('${fechaKey}', ${!!agenda})">
            <div class="cal-dia-num">${d}</div>
            ${emoji}
        </div>`;
    }

    document.getElementById('cal-grid').innerHTML = html;
}

function seleccionarDiaCalendario(fechaKey, tieneAgenda) {
    document.getElementById('modal-calendario').classList.add('oculto');

    if (tieneAgenda) {
        const agenda = cargarAgendas().find(a => a.fechaKey === fechaKey);
        if (!agenda) return;
        agendaViendoId = agenda.id;
        pantallaAnterior = 'pantalla-hoy';
        document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
        document.getElementById('pantalla-dashboard').classList.add('activa');
        document.getElementById('titulo-dashboard').textContent = agenda.nombre;
        document.getElementById('contenido-dashboard').innerHTML =
            renderDiario(parsearActividades(agenda.texto));
    } else {
        mostrarEditor(fechaKey);
    }
}

// ── SELECTOR FECHA MINI ───────────────────────────────
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

// ── NAVEGACIÓN ────────────────────────────────────────
function mostrarEditor(fechaParam) {
    agendaEditandoId = null;
    fechaSeleccionada = fechaParam ? new Date(fechaParam + 'T12:00:00') : new Date();
    mesActualMini = new Date(fechaSeleccionada);
    pantallaAnterior = 'pantalla-hoy';

    const fechaKey = formatearFechaKey(fechaSeleccionada);
    const agenda = cargarAgendas().find(a => a.fechaKey === fechaKey);
    if (agenda) {
        agendaEditandoId = agenda.id;
        agendaViendoId = agenda.id;
    }

    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-editor').classList.add('activa');
    document.getElementById('titulo-editor').textContent = agenda ? '✏️ Editar Agenda' : '📅 Nueva Agenda';
    document.getElementById('input-actividades').value = agenda ? agenda.texto : '';
    actualizarDisplayFecha();
}

function volverAtras() {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById(pantallaAnterior).classList.add('activa');
    if (pantallaAnterior === 'pantalla-hoy') mostrarHoy();
    agendaEditandoId = null;
}

function editarHoy() {
    if (!agendaViendoId) return;
    const agenda = cargarAgendas().find(a => a.id === agendaViendoId);
    if (!agenda) return;
    agendaEditandoId = agendaViendoId;
    fechaSeleccionada = new Date(agenda.fechaKey + 'T12:00:00');
    mesActualMini = new Date(fechaSeleccionada);
    pantallaAnterior = 'pantalla-hoy';
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-editor').classList.add('activa');
    document.getElementById('titulo-editor').textContent = '✏️ Editar Agenda';
    document.getElementById('input-actividades').value = agenda.texto;
    actualizarDisplayFecha();
}

function borrarHoy() {
    if (!agendaViendoId) return;
    if (!confirm('¿Borrar la agenda de hoy?')) return;
    let agendas = cargarAgendas();
    agendas = agendas.filter(a => a.id !== agendaViendoId);
    guardarAgendas(agendas);
    mostrarHoy();
}

function editarAgendaActual() {
    if (!agendaViendoId) return;
    const agenda = cargarAgendas().find(a => a.id === agendaViendoId);
    if (!agenda) return;
    agendaEditandoId = agendaViendoId;
    fechaSeleccionada = new Date(agenda.fechaKey + 'T12:00:00');
    mesActualMini = new Date(fechaSeleccionada);
    pantallaAnterior = 'pantalla-dashboard';
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-editor').classList.add('activa');
    document.getElementById('titulo-editor').textContent = '✏️ Editar Agenda';
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

// ── PROCESAR AGENDA ───────────────────────────────────
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
        const existente = agendas.findIndex(a => a.fechaKey === fechaKey);
        if (existente !== -1) {
            agendas[existente].texto = texto;
            agendas[existente].nombre = nombre;
            agendaViendoId = agendas[existente].id;
        } else {
            const nueva = { id: Date.now().toString(), nombre, texto, fechaKey };
            agendas.unshift(nueva);
            agendaViendoId = nueva.id;
        }
    }

    agendas.sort((a, b) => b.fechaKey.localeCompare(a.fechaKey));
    guardarAgendas(agendas);

    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-hoy').classList.add('activa');
    mostrarHoy();
}

// ── PARSEAR Y RENDER ──────────────────────────────────
function parsearActividades(texto) {
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

    return { fijas, limpieza };
}

function renderDiario({ fijas, limpieza }) {
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
mostrarHoy();