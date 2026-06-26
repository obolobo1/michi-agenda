// ── IMPORTS FIREBASE ──────────────────────────────────
import {
    registrarUsuario, iniciarSesion, iniciarSesionGoogle,
    cerrarSesion, observarUsuario, recuperarContrasena,
    guardarAgendaNube, cargarAgendasNube, borrarAgendaNube,
    guardarPendientesNube, cargarPendientesNube,
    guardarEmojisNube, cargarEmojisNube,
    guardarRecurrentesNube, cargarRecurrentesNube
} from './firebase.js';

// ── ESTADO GLOBAL ─────────────────────────────────────
let fechaSeleccionada = new Date();
let mesActualMini = new Date();
let mesActualCal = new Date();
let agendaEditandoId = null;
let agendaViendoId = null;
let pantallaAnterior = 'pantalla-hoy';
let usuarioActual = null;
let fechaDashboard = null;

// ── ONBOARDING ────────────────────────────────────────
const SLIDES = [
    {
        emoji: '🐱',
        titulo: '¡Bienvenido a Michi Agenda!',
        desc: 'Tu agenda inteligente que se adapta a tu rutina. Planea tu día, semana y mes en un solo lugar.',
        ejemplo: null
    },
    {
        emoji: '📅',
        titulo: 'Escribe tus actividades',
        desc: 'Cada actividad va en una línea. Escribe la actividad y la hora separadas por un espacio.',
        ejemplo: 'GYM 07:00\nDesayuno 09:00\nTrabajo 10:00\nComer con mamá 14:00'
    },
    {
        emoji: '↻',
        titulo: 'Actividades recurrentes',
        desc: 'Agrega [días] al final para que la actividad aparezca automáticamente esos días.',
        ejemplo: 'GYM 07:00 [lunes, miércoles, viernes]\nMedicinas 08:00 [todos los días]\nTrabajo 09:00 [entre semana]'
    },
    {
        emoji: '✅',
        titulo: '¡Listo para empezar!',
        desc: 'Toca el botón + para crear tu primera agenda. Tus datos se guardan en la nube y están disponibles en todos tus dispositivos.',
        ejemplo: null
    }
];

let slideActual = 0;

function renderOnboarding() {
    const slide = SLIDES[slideActual];
    document.getElementById('onboarding-slide').innerHTML = `
        <div class="onboarding-emoji">${slide.emoji}</div>
        <div class="onboarding-titulo">${slide.titulo}</div>
        <div class="onboarding-desc">${slide.desc}</div>
        ${slide.ejemplo ? `<div class="onboarding-ejemplo">${slide.ejemplo}</div>` : ''}
    `;
    const dots = document.getElementById('onboarding-dots');
    dots.innerHTML = SLIDES.map((_, i) =>
        `<div class="onboarding-dot ${i === slideActual ? 'activo' : ''}"></div>`
    ).join('');
    const btnNext = document.getElementById('btn-onboarding-next');
    btnNext.textContent = slideActual === SLIDES.length - 1 ? '¡Comenzar! 🐱' : 'Siguiente →';
}

function siguienteSlide() {
    if (slideActual < SLIDES.length - 1) {
        slideActual++;
        renderOnboarding();
    } else {
        terminarOnboarding();
    }
}

function terminarOnboarding() {
    localStorage.setItem('michi-onboarding-visto', 'true');
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-login').classList.add('activa');
}

function verificarOnboarding() {
    const visto = localStorage.getItem('michi-onboarding-visto');
    if (!visto) {
        slideActual = 0;
        renderOnboarding();
        document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
        document.getElementById('pantalla-onboarding').classList.add('activa');
    }
}

// ── AUTH ──────────────────────────────────────────────
observarUsuario(async (user) => {
    usuarioActual = user;
    if (user) {
        document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
        document.getElementById('pantalla-hoy').classList.add('activa');
        await sincronizarDesdNube();
        mostrarHoy();
    } else {
        const onboardingVisto = localStorage.getItem('michi-onboarding-visto');
        document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
        if (!onboardingVisto) {
            slideActual = 0;
            renderOnboarding();
            document.getElementById('pantalla-onboarding').classList.add('activa');
        } else {
            document.getElementById('pantalla-login').classList.add('activa');
        }
    }
});

async function sincronizarDesdNube() {
    if (!usuarioActual) return;
    try {
        const [agendas, pendientes, emojis, recurrentes] = await Promise.all([
            cargarAgendasNube(usuarioActual.uid),
            cargarPendientesNube(usuarioActual.uid),
            cargarEmojisNube(usuarioActual.uid),
            cargarRecurrentesNube(usuarioActual.uid)
        ]);
        localStorage.setItem('michi-agendas', JSON.stringify(agendas));
        localStorage.setItem('michi-pendientes', JSON.stringify(pendientes));
        localStorage.setItem('michi-emojis-custom', JSON.stringify(emojis));
        localStorage.setItem('michi-recurrentes', JSON.stringify(recurrentes));
    } catch (e) {
        console.log('Sin conexión, usando datos locales');
    }
}

// ── LOGIN HANDLERS ────────────────────────────────────
function mostrarTab(tab) {
    document.getElementById('tab-iniciar').classList.toggle('oculto', tab !== 'iniciar');
    document.getElementById('tab-registrar').classList.toggle('oculto', tab !== 'registrar');
    document.getElementById('tab-recuperar').classList.add('oculto');
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        btn.classList.toggle('activo', (i === 0 && tab === 'iniciar') || (i === 1 && tab === 'registrar'));
    });
    document.getElementById('login-error').textContent = '';
    document.getElementById('login-exito').textContent = '';
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

function mostrarRecuperar() {
    document.getElementById('tab-iniciar').classList.add('oculto');
    document.getElementById('tab-registrar').classList.add('oculto');
    document.getElementById('tab-recuperar').classList.remove('oculto');
    document.getElementById('login-error').textContent = '';
    document.getElementById('login-exito').textContent = '';
}

async function handleRecuperar() {
    const email = document.getElementById('recuperar-email').value.trim();
    const errorEl = document.getElementById('login-error');
    const exitoEl = document.getElementById('login-exito');
    if (!email) { errorEl.textContent = 'Ingresa tu correo.'; return; }
    try {
        await recuperarContrasena(email);
        errorEl.textContent = '';
        exitoEl.textContent = '✅ Correo enviado. Revisa tu bandeja de entrada.';
    } catch (e) {
        exitoEl.textContent = '';
        errorEl.textContent = 'No encontramos ese correo.';
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');
    if (!email || !password) { errorEl.textContent = 'Ingresa tu correo y contraseña.'; return; }
    try {
        await iniciarSesion(email, password);
    } catch (e) {
        errorEl.textContent = 'Correo o contraseña incorrectos.';
    }
}

async function handleRegistro() {
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const errorEl = document.getElementById('login-error');
    if (!email || !password) { errorEl.textContent = 'Ingresa tu correo y contraseña.'; return; }
    if (password.length < 6) { errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres.'; return; }
    try {
        await registrarUsuario(email, password);
    } catch (e) {
        errorEl.textContent = 'Error al crear cuenta. ¿Ya tienes una?';
    }
}

async function handleGoogle() {
    try {
        await iniciarSesionGoogle();
    } catch (e) {
        document.getElementById('login-error').textContent = 'Error al iniciar con Google.';
    }
}

async function handleCerrarSesion() {
    await cerrarSesion();
    localStorage.removeItem('michi-agendas');
    localStorage.removeItem('michi-pendientes');
    localStorage.removeItem('michi-emojis-custom');
    localStorage.removeItem('michi-recurrentes');
}

// ── AYUDA EN EDITOR ───────────────────────────────────
function toggleAyuda() {
    document.getElementById('panel-ayuda').classList.toggle('oculto');
}

// ── NOTIFICACIONES ────────────────────────────────────
async function pedirPermisoNotificaciones() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const permiso = await Notification.requestPermission();
    return permiso === 'granted';
}

function programarNotificaciones(fijas, fechaKey) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const hoyKey = formatearFechaKey(new Date());
    if (fechaKey !== hoyKey) return;
    if (window._notifTimers) window._notifTimers.forEach(t => clearTimeout(t));
    window._notifTimers = [];
    const ahora = new Date();
    fijas.forEach(act => {
        const [h, m] = parsearHora(act.hora);
        if (h === 99) return;
        const horaActividad = new Date();
        horaActividad.setHours(h, m, 0, 0);
        const horaAviso = new Date(horaActividad.getTime() - 15 * 60 * 1000);
        const msHastaAviso = horaAviso.getTime() - ahora.getTime();
        if (msHastaAviso > 0) {
            const timer = setTimeout(() => {
                new Notification('🐱 Michi Agenda', {
                    body: `En 15 min: ${obtenerIcono(act.actividad)} ${act.actividad} a las ${act.hora}`,
                    icon: '/michi-agenda/Icono agenda.png'
                });
            }, msHastaAviso);
            window._notifTimers.push(timer);
        }
        const msHastaHora = horaActividad.getTime() - ahora.getTime();
        if (msHastaHora > 0) {
            const timer = setTimeout(() => {
                new Notification('🐱 Michi Agenda', {
                    body: `¡Ahora! ${obtenerIcono(act.actividad)} ${act.actividad}`,
                    icon: '/michi-agenda/Icono agenda.png'
                });
            }, msHastaHora);
            window._notifTimers.push(timer);
        }
    });
}

// ── RECURRENTES ───────────────────────────────────────
const DIAS_MAP = {
    'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3,
    'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6, 'domingo': 0
};

const DIAS_NOMBRES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

function cargarRecurrentes() {
    return JSON.parse(localStorage.getItem('michi-recurrentes') || '[]');
}

function guardarRecurrentes(recurrentes) {
    localStorage.setItem('michi-recurrentes', JSON.stringify(recurrentes));
    if (usuarioActual) guardarRecurrentesNube(usuarioActual.uid, recurrentes).catch(() => {});
}

function parsearRecurrente(linea) {
    const match = linea.match(/^(.*?)\[(.+?)\]\s*$/);
    if (!match) return null;
    const actividad = match[1].trim();
    const diasStr = match[2].toLowerCase();
    let diasAplica = [];
    if (diasStr.includes('todos los días') || diasStr.includes('todos los dias') || diasStr.includes('diario')) {
        diasAplica = [0, 1, 2, 3, 4, 5, 6];
    } else if (diasStr.includes('entre semana') || diasStr.includes('días hábiles') || diasStr.includes('dias habiles')) {
        diasAplica = [1, 2, 3, 4, 5];
    } else if (diasStr.includes('fines de semana') || diasStr.includes('fin de semana')) {
        diasAplica = [0, 6];
    } else {
        diasStr.split(',').forEach(d => {
            const dia = d.trim();
            if (DIAS_MAP[dia] !== undefined) diasAplica.push(DIAS_MAP[dia]);
        });
    }
    return { actividad, diasAplica };
}

function obtenerActividadesRecurrentesParaDia(fecha) {
    const recurrentes = cargarRecurrentes();
    const diaSemana = fecha.getDay();
    return recurrentes.filter(rec => rec.diasAplica.includes(diaSemana)).map(rec => rec.actividad);
}

function obtenerTextoConRecurrentes(fecha) {
    const fechaKey = formatearFechaKey(fecha);
    const agendas = cargarAgendas();
    const agendaExistente = agendas.find(a => a.fechaKey === fechaKey);
    const recurrentes = obtenerActividadesRecurrentesParaDia(fecha);
    if (recurrentes.length === 0) return agendaExistente ? agendaExistente.texto : null;
    if (agendaExistente) {
        const lineasExistentes = agendaExistente.texto.split('\n').map(l => l.trim().toLowerCase());
        const nuevas = recurrentes.filter(r => {
            const actBase = r.replace(/\s*\d{1,2}(:\d{2})?\s*$/, '').trim().toLowerCase();
            return !lineasExistentes.some(l => l.includes(actBase));
        });
        if (nuevas.length === 0) return agendaExistente.texto;
        return agendaExistente.texto + '\n' + nuevas.join('\n');
    }
    return recurrentes.join('\n');
}

function renderRecurrentesConfig() {
    const recurrentes = cargarRecurrentes();
    const lista = document.getElementById('lista-recurrentes-config');
    if (!lista) return;
    if (recurrentes.length === 0) {
        lista.innerHTML = '<li style="color:#4b5563;font-style:italic;font-size:0.82rem;padding:6px 0">Sin actividades recurrentes todavía 🐾</li>';
        return;
    }
    lista.innerHTML = recurrentes.map((r, idx) => {
        const diasNombres = r.diasAplica.sort((a,b)=>a-b).map(d => DIAS_NOMBRES[d]).join(', ');
        const icono = obtenerIcono(r.actividad);
        return `<li class="recurrente-item">
            <div class="recurrente-info">
                <div class="recurrente-actividad">${icono} ${r.actividad}</div>
                <div class="recurrente-dias">↻ ${diasNombres}</div>
            </div>
            <button class="btn-borrar-recurrente" onclick="borrarRecurrente(${idx})">✕</button>
        </li>`;
    }).join('');
}

function borrarRecurrente(idx) {
    const recurrentes = cargarRecurrentes();
    recurrentes.splice(idx, 1);
    guardarRecurrentes(recurrentes);
    renderRecurrentesConfig();
}

// ── PENDIENTES ────────────────────────────────────────
function cargarPendientes() {
    return JSON.parse(localStorage.getItem('michi-pendientes') || '[]');
}

function guardarPendientes(pendientes) {
    localStorage.setItem('michi-pendientes', JSON.stringify(pendientes));
    if (usuarioActual) guardarPendientesNube(usuarioActual.uid, pendientes).catch(() => {});
}

function agregarPendiente() {
    const input = document.getElementById('input-pendiente');
    const texto = input.value.trim();
    if (!texto) return;
    const pendientes = cargarPendientes();
    pendientes.unshift({ id: Date.now().toString(), texto, completado: false });
    guardarPendientes(pendientes);
    input.value = '';
    renderPendientes();
}

function togglePendiente(id) {
    const pendientes = cargarPendientes();
    const idx = pendientes.findIndex(p => p.id === id);
    if (idx !== -1) pendientes[idx].completado = !pendientes[idx].completado;
    guardarPendientes(pendientes);
    renderPendientes();
}

function borrarPendiente(id) {
    const pendientes = cargarPendientes().filter(p => p.id !== id);
    guardarPendientes(pendientes);
    renderPendientes();
}

function renderPendientes() {
    const pendientes = cargarPendientes();
    const lista = document.getElementById('lista-pendientes');
    if (!lista) return;
    if (pendientes.length === 0) {
        lista.innerHTML = '<li style="color:#4b5563;font-style:italic;font-size:0.78rem;padding:6px 0">Sin pendientes 🐾</li>';
        return;
    }
    lista.innerHTML = pendientes.map(p => `
        <li class="pendiente-item ${p.completado ? 'completado' : ''}">
            <span class="pendiente-texto" onclick="togglePendiente('${p.id}')">${p.completado ? '✅' : '⬜'} ${p.texto}</span>
            <button class="btn-borrar-pendiente" onclick="borrarPendiente('${p.id}')">✕</button>
        </li>
    `).join('');
}

// ── EMOJIS PERSONALIZADOS ─────────────────────────────
function cargarEmojisCustom() {
    return JSON.parse(localStorage.getItem('michi-emojis-custom') || '[]');
}

function guardarEmojisCustom(emojis) {
    localStorage.setItem('michi-emojis-custom', JSON.stringify(emojis));
    if (usuarioActual) guardarEmojisNube(usuarioActual.uid, emojis).catch(() => {});
}

function agregarEmojiPersonalizado() {
    const palabra = document.getElementById('input-palabra').value.trim().toLowerCase();
    const emoji = document.getElementById('input-emoji').value.trim();
    if (!palabra || !emoji) { alert('Escribe una palabra clave y un emoji.'); return; }
    const emojis = cargarEmojisCustom();
    const existente = emojis.findIndex(e => e.palabra === palabra);
    if (existente !== -1) { emojis[existente].emoji = emoji; }
    else { emojis.unshift({ id: Date.now().toString(), palabra, emoji }); }
    guardarEmojisCustom(emojis);
    document.getElementById('input-palabra').value = '';
    document.getElementById('input-emoji').value = '';
    renderEmojisCustom();
}

function borrarEmojiCustom(id) {
    guardarEmojisCustom(cargarEmojisCustom().filter(e => e.id !== id));
    renderEmojisCustom();
}

function renderEmojisCustom() {
    const emojis = cargarEmojisCustom();
    const lista = document.getElementById('lista-emojis-custom');
    if (!lista) return;
    if (emojis.length === 0) {
        lista.innerHTML = '<li style="color:#4b5563;font-style:italic;font-size:0.82rem;padding:6px 0">Sin emojis personalizados todavía 🐾</li>';
        return;
    }
    lista.innerHTML = emojis.map(e => `
        <li class="emoji-custom-item">
            <span class="emoji-custom-icono">${e.emoji}</span>
            <span class="emoji-custom-flecha">←</span>
            <span class="emoji-custom-palabra">${e.palabra}</span>
            <button class="btn-borrar-emoji" onclick="borrarEmojiCustom('${e.id}')">✕</button>
        </li>
    `).join('');
}

// ── ICONOS ────────────────────────────────────────────
function obtenerIcono(nombre) {
    const n = nombre.toLowerCase();
    const emojisCustom = cargarEmojisCustom();
    for (const ec of emojisCustom) { if (n.includes(ec.palabra)) return ec.emoji; }
    if (n.includes('gym') || n.includes('gimnasio') || n.includes('pesas') || n.includes('crossfit') || n.includes('entren')) return '💪';
    if (n.includes('correr') || n.includes('jogging') || n.includes('trotar') || n.includes('maratón')) return '🏃';
    if (n.includes('nadar') || n.includes('natación') || n.includes('alberca') || n.includes('piscina')) return '🏊';
    if (n.includes('bici') || n.includes('ciclismo')) return '🚴';
    if (n.includes('futbol') || n.includes('fútbol') || n.includes('soccer')) return '⚽';
    if (n.includes('basquet') || n.includes('basketball')) return '🏀';
    if (n.includes('tenis') || n.includes('pádel') || n.includes('padel')) return '🎾';
    if (n.includes('yoga') || n.includes('meditación') || n.includes('meditar') || n.includes('pilates')) return '🧘';
    if (n.includes('boxeo') || n.includes('box') || n.includes('karate')) return '🥊';
    if (n.includes('caminar') || n.includes('caminata') || n.includes('paseo') || n.includes('parque') || n.includes('bosque')) return '🚶';
    if (n.includes('ejercicio') || n.includes('deporte') || n.includes('entrenar')) return '🏋️';
    if (n.includes('desayuno') || n.includes('breakfast')) return '🍳';
    if (n.includes('almuerzo') || n.includes('lunch') || n.includes('comer') || n.includes('comida')) return '🍽️';
    if (n.includes('cena') || n.includes('cenar') || n.includes('dinner')) return '🌮';
    if (n.includes('café') || n.includes('cafe') || n.includes('coffee')) return '☕';
    if (n.includes('pizza') || n.includes('hamburguesa') || n.includes('tacos')) return '🍕';
    if (n.includes('sushi') || n.includes('japonés') || n.includes('ramen')) return '🍱';
    if (n.includes('postre') || n.includes('pastel') || n.includes('helado') || n.includes('dulce')) return '🍰';
    if (n.includes('bar') || n.includes('cerveza') || n.includes('bebida') || n.includes('copa')) return '🍺';
    if (n.includes('agua') || n.includes('jugo') || n.includes('smoothie')) return '🥤';
    if (n.includes('doctor') || n.includes('médico') || n.includes('medico') || n.includes('hospital') || n.includes('clínica')) return '🏥';
    if (n.includes('dentista') || n.includes('dental') || n.includes('dientes')) return '🦷';
    if (n.includes('medicina') || n.includes('medicinas') || n.includes('pastilla') || n.includes('farmacia')) return '💊';
    if (n.includes('terapia') || n.includes('psicólogo') || n.includes('psicologo') || n.includes('terapeuta')) return '🧠';
    if (n.includes('vacuna') || n.includes('inyección') || n.includes('inyeccion')) return '💉';
    if (n.includes('trabajo') || n.includes('trabajar') || n.includes('oficina') || n.includes('chamba')) return '💼';
    if (n.includes('reunión') || n.includes('reunion') || n.includes('junta') || n.includes('meeting') || n.includes('zoom') || n.includes('teams')) return '👥';
    if (n.includes('presentación') || n.includes('presentacion') || n.includes('pitch')) return '📊';
    if (n.includes('entrevista')) return '🤝';
    if (n.includes('cliente') || n.includes('ventas') || n.includes('vender')) return '💰';
    if (n.includes('correo') || n.includes('email')) return '📧';
    if (n.includes('escuela') || n.includes('colegio') || n.includes('prepa') || n.includes('kinder')) return '🏫';
    if (n.includes('universidad') || n.includes('facultad')) return '🎓';
    if (n.includes('clase') || n.includes('clases') || n.includes('curso') || n.includes('taller')) return '📚';
    if (n.includes('estudiar') || n.includes('tarea') || n.includes('examen')) return '✏️';
    if (n.includes('super') || n.includes('supermercado') || n.includes('mercado') || n.includes('mandado') || n.includes('walmart') || n.includes('costco')) return '🛒';
    if (n.includes('compras') || n.includes('comprar') || n.includes('tienda') || n.includes('mall')) return '🛍️';
    if (n.includes('banco') || n.includes('cajero') || n.includes('pago') || n.includes('pagar') || n.includes('factura')) return '🏦';
    if (n.includes('trámite') || n.includes('tramite') || n.includes('ine') || n.includes('sat') || n.includes('pasaporte')) return '🏛️';
    if (n.includes('gasolina') || n.includes('gasolinera') || n.includes('gas')) return '⛽';
    if (n.includes('manejar') || n.includes('carro') || n.includes('auto') || n.includes('coche') || n.includes('conducir')) return '🚗';
    if (n.includes('uber') || n.includes('taxi') || n.includes('didi')) return '🚕';
    if (n.includes('metro') || n.includes('metrobús') || n.includes('camión') || n.includes('bus')) return '🚌';
    if (n.includes('avión') || n.includes('avion') || n.includes('vuelo') || n.includes('aeropuerto')) return '✈️';
    if (n.includes('salir') || n.includes('llegar') || n.includes('casa')) return '🏠';
    if (n.includes('barrer') || n.includes('trapear') || n.includes('limpiar') || n.includes('limpieza') || n.includes('aspirar')) return '🧹';
    if (n.includes('lavar') || n.includes('lavadora') || n.includes('ropa') || n.includes('planchar')) return '👕';
    if (n.includes('cocinar') || n.includes('cocina') || n.includes('hornear')) return '👨‍🍳';
    if (n.includes('jardín') || n.includes('jardin') || n.includes('plantas') || n.includes('regar')) return '🌱';
    if (n.includes('plomero') || n.includes('electricista') || n.includes('reparar') || n.includes('arreglar')) return '🔧';
    if (n.includes('veterinario') || n.includes('veterinaria') || n.includes('vet')) return '🏥';
    if (n.includes('perro') || n.includes('dog')) return '🐕';
    if (n.includes('gato') || n.includes('michi') || n.includes('gatito')) return '🐈';
    if (n.includes('mascota') || n.includes('pet')) return '🐾';
    if (n.includes('cumpleaños') || n.includes('cumple') || n.includes('birthday')) return '🎂';
    if (n.includes('fiesta') || n.includes('party') || n.includes('celebrar')) return '🎉';
    if (n.includes('boda') || n.includes('matrimonio')) return '💍';
    if (n.includes('familia') || n.includes('papá') || n.includes('papa') || n.includes('mamá') || n.includes('mama')) return '👨‍👩‍👧‍👦';
    if (n.includes('amigos') || n.includes('amigo') || n.includes('amiga')) return '👫';
    if (n.includes('novio') || n.includes('novia') || n.includes('pareja')) return '❤️';
    if (n.includes('iglesia') || n.includes('misa') || n.includes('templo') || n.includes('rezar')) return '⛪';
    if (n.includes('cine') || n.includes('película') || n.includes('pelicula') || n.includes('movie')) return '🎬';
    if (n.includes('teatro') || n.includes('concierto') || n.includes('show')) return '🎭';
    if (n.includes('museo') || n.includes('arte')) return '🎨';
    if (n.includes('música') || n.includes('musica') || n.includes('guitarra') || n.includes('piano') || n.includes('ensayo')) return '🎵';
    if (n.includes('videojuego') || n.includes('gaming') || n.includes('xbox') || n.includes('playstation')) return '🎮';
    if (n.includes('leer') || n.includes('libro') || n.includes('lectura')) return '📖';
    if (n.includes('netflix') || n.includes('serie') || n.includes('streaming')) return '📺';
    if (n.includes('viaje') || n.includes('viajar') || n.includes('vacaciones') || n.includes('hotel')) return '🧳';
    if (n.includes('playa') || n.includes('mar')) return '🏖️';
    if (n.includes('montaña') || n.includes('senderismo') || n.includes('hiking') || n.includes('naturaleza')) return '🏔️';
    if (n.includes('corte') || n.includes('cabello') || n.includes('pelo') || n.includes('peluquería') || n.includes('barber')) return '✂️';
    if (n.includes('manicure') || n.includes('uñas') || n.includes('spa')) return '💅';
    if (n.includes('bañar') || n.includes('baño') || n.includes('ducha')) return '🚿';
    if (n.includes('rasurar') || n.includes('rasurarse')) return '🪒';
    if (n.includes('dormir') || n.includes('siesta') || n.includes('descansar')) return '😴';
    if (n.includes('despertar') || n.includes('levantarse')) return '⏰';
    if (n.includes('llamar') || n.includes('llamada') || n.includes('teléfono') || n.includes('telefono')) return '📞';
    if (n.includes('whatsapp') || n.includes('mensaje') || n.includes('chat')) return '💬';
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

function sumarDias(date, dias) {
    const d = new Date(date);
    d.setDate(d.getDate() + dias);
    return d;
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
    const textoConRec = obtenerTextoConRecurrentes(hoy);
    if (agendaHoy || textoConRec) {
        agendaViendoId = agendaHoy ? agendaHoy.id : null;
        accionesHoy.style.display = agendaHoy ? 'flex' : 'none';
        const texto = textoConRec || agendaHoy.texto;
        const { fijas } = parsearActividades(texto);
        document.getElementById('contenido-hoy').innerHTML = renderTimelineHoy(fijas, hoy);
        programarNotificaciones(fijas, fechaKey);
    } else {
        agendaViendoId = null;
        accionesHoy.style.display = 'none';
        document.getElementById('contenido-hoy').innerHTML = renderHorasVacias(hoy);
    }
    renderSemanaStrip();
    renderPendientes();
    if (usuarioActual) {
        const configUsuario = document.getElementById('config-usuario');
        if (configUsuario) configUsuario.textContent = usuarioActual.email || usuarioActual.displayName || '—';
    }
}

function renderTimelineHoy(fijas, hoy) {
    const ahoraH = hoy.getHours();
    const ahoraM = hoy.getMinutes();
    let proximaIdx = -1;
    for (let i = 0; i < fijas.length; i++) {
        const [h, m] = parsearHora(fijas[i].hora);
        if (h > ahoraH || (h === ahoraH && m >= ahoraM)) { proximaIdx = i; break; }
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
    for (let i = 0; i < 14; i++) {
        const dia = new Date(hoy);
        dia.setDate(hoy.getDate() + i);
        const fechaKey = formatearFechaKey(dia);
        const agenda = agendas.find(a => a.fechaKey === fechaKey);
        const tieneRec = obtenerActividadesRecurrentesParaDia(dia).length > 0;
        let emoji = '';
        if (agenda) {
            const primeraLinea = agenda.texto.split('\n').find(l => l.trim()) || '';
            const primeraAct = extraerActividad(primeraLinea);
            emoji = obtenerIcono(primeraAct);
        } else if (tieneRec) {
            const recs = obtenerActividadesRecurrentesParaDia(dia);
            emoji = obtenerIcono(extraerActividad(recs[0]));
        }
        let clases = 'dia-strip';
        if (i === 0) clases += ' hoy';
        if (agenda || tieneRec) clases += ' tiene-agenda';
        html += `<div class="${clases}" onclick="seleccionarDiaStrip('${fechaKey}', ${!!(agenda || tieneRec)})">
            <div class="dia-strip-nombre">${diasNombre[dia.getDay()]}</div>
            <div class="dia-strip-num">${dia.getDate()}</div>
            <div class="dia-strip-emoji">${emoji}</div>
        </div>`;
    }
    document.getElementById('semana-strip').innerHTML = html;
}

function seleccionarDiaStrip(fechaKey, tieneAgenda) {
    const fecha = new Date(fechaKey + 'T12:00:00');
    const textoConRec = obtenerTextoConRecurrentes(fecha);
    const agenda = cargarAgendas().find(a => a.fechaKey === fechaKey);
    if (agenda || textoConRec) {
        agendaViendoId = agenda ? agenda.id : null;
        fechaDashboard = fecha;
        pantallaAnterior = 'pantalla-hoy';
        document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
        document.getElementById('pantalla-dashboard').classList.add('activa');
        document.getElementById('titulo-dashboard').textContent = formatearFechaDisplay(fecha);
        const texto = textoConRec || agenda.texto;
        document.getElementById('contenido-dashboard').innerHTML = renderDiario(parsearActividades(texto));
    } else {
        mostrarEditor(fechaKey);
    }
}

// ── NAVEGACIÓN DÍAS ───────────────────────────────────
function navegarDia(delta) {
    if (!fechaDashboard) return;
    const nuevaFecha = sumarDias(fechaDashboard, delta);
    const fechaKey = formatearFechaKey(nuevaFecha);
    const agenda = cargarAgendas().find(a => a.fechaKey === fechaKey);
    const textoConRec = obtenerTextoConRecurrentes(nuevaFecha);
    fechaDashboard = nuevaFecha;
    agendaViendoId = agenda ? agenda.id : null;
    document.getElementById('titulo-dashboard').textContent = formatearFechaDisplay(nuevaFecha);
    if (agenda || textoConRec) {
        const texto = textoConRec || agenda.texto;
        document.getElementById('contenido-dashboard').innerHTML = renderDiario(parsearActividades(texto));
    } else {
        document.getElementById('contenido-dashboard').innerHTML = `
            <div style="text-align:center; padding: 40px 20px; color: #6b7280;">
                <p style="font-size:2rem; margin-bottom:12px">📭</p>
                <p>Sin agenda para este día</p>
                <button class="btn-crear-hoy" style="margin-top:16px" onclick="mostrarEditor('${fechaKey}')">+ Crear agenda</button>
            </div>`;
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
    for (let i = 0; i < primerDia; i++) html += '<div class="cal-dia vacio"></div>';
    for (let d = 1; d <= diasEnMes; d++) {
        const fecha = new Date(año, mes, d);
        const fechaKey = formatearFechaKey(fecha);
        const agenda = agendas.find(a => a.fechaKey === fechaKey);
        const tieneRec = obtenerActividadesRecurrentesParaDia(fecha).length > 0;
        let clases = 'cal-dia';
        if (esMismaFecha(fecha, hoy)) clases += ' hoy';
        if (agenda || tieneRec) clases += ' tiene-agenda';
        let emoji = '';
        if (agenda) {
            const primeraLinea = agenda.texto.split('\n').find(l => l.trim()) || '';
            emoji = `<div class="cal-dia-emoji">${obtenerIcono(extraerActividad(primeraLinea))}</div>`;
        } else if (tieneRec) {
            const recs = obtenerActividadesRecurrentesParaDia(fecha);
            emoji = `<div class="cal-dia-emoji">${obtenerIcono(extraerActividad(recs[0]))}</div>`;
        }
        html += `<div class="${clases}" onclick="seleccionarDiaCalendario('${fechaKey}', ${!!(agenda || tieneRec)})">
            <div class="cal-dia-num">${d}</div>${emoji}</div>`;
    }
    document.getElementById('cal-grid').innerHTML = html;
}

function seleccionarDiaCalendario(fechaKey, tieneAgenda) {
    document.getElementById('modal-calendario').classList.add('oculto');
    const fecha = new Date(fechaKey + 'T12:00:00');
    const textoConRec = obtenerTextoConRecurrentes(fecha);
    const agenda = cargarAgendas().find(a => a.fechaKey === fechaKey);
    if (agenda || textoConRec) {
        agendaViendoId = agenda ? agenda.id : null;
        fechaDashboard = fecha;
        pantallaAnterior = 'pantalla-hoy';
        document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
        document.getElementById('pantalla-dashboard').classList.add('activa');
        document.getElementById('titulo-dashboard').textContent = formatearFechaDisplay(fecha);
        const texto = textoConRec || agenda.texto;
        document.getElementById('contenido-dashboard').innerHTML = renderDiario(parsearActividades(texto));
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
    for (let i = 0; i < primerDia; i++) html += '<div class="mini-dia vacio"></div>';
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
function mostrarConfig() {
    pantallaAnterior = 'pantalla-hoy';
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-config').classList.add('activa');
    renderEmojisCustom();
    renderRecurrentesConfig();
}

function mostrarEditor(fechaParam) {
    agendaEditandoId = null;
    fechaSeleccionada = fechaParam ? new Date(fechaParam + 'T12:00:00') : new Date();
    mesActualMini = new Date(fechaSeleccionada);
    pantallaAnterior = 'pantalla-hoy';
    const fechaKey = formatearFechaKey(fechaSeleccionada);
    const agenda = cargarAgendas().find(a => a.fechaKey === fechaKey);
    if (agenda) { agendaEditandoId = agenda.id; agendaViendoId = agenda.id; }
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-editor').classList.add('activa');
    document.getElementById('titulo-editor').textContent = agenda ? '✏️ Editar Agenda' : '📅 Nueva Agenda';
    document.getElementById('input-actividades').value = agenda ? agenda.texto : '';
    document.getElementById('panel-ayuda').classList.add('oculto');
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
    document.getElementById('panel-ayuda').classList.add('oculto');
    actualizarDisplayFecha();
}

function borrarHoy() {
    if (!agendaViendoId) return;
    if (!confirm('¿Borrar la agenda de hoy?')) return;
    const agendas = cargarAgendas();
    const agenda = agendas.find(a => a.id === agendaViendoId);
    guardarAgendas(agendas.filter(a => a.id !== agendaViendoId));
    if (usuarioActual && agenda) borrarAgendaNube(usuarioActual.uid, agenda.fechaKey).catch(() => {});
    mostrarHoy();
}

function editarAgendaActual() {
    if (!fechaDashboard) return;
    const fechaKey = formatearFechaKey(fechaDashboard);
    const agenda = cargarAgendas().find(a => a.fechaKey === fechaKey);
    agendaEditandoId = agenda ? agenda.id : null;
    agendaViendoId = agendaEditandoId;
    fechaSeleccionada = new Date(fechaDashboard);
    mesActualMini = new Date(fechaSeleccionada);
    pantallaAnterior = 'pantalla-dashboard';
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-editor').classList.add('activa');
    document.getElementById('titulo-editor').textContent = '✏️ Editar Agenda';
    const textoConRec = obtenerTextoConRecurrentes(fechaDashboard);
    document.getElementById('input-actividades').value = agenda ? agenda.texto : (textoConRec || '');
    document.getElementById('panel-ayuda').classList.add('oculto');
    actualizarDisplayFecha();
}

function borrarAgendaActual() {
    if (!agendaViendoId) return;
    if (!confirm('¿Borrar esta agenda?')) return;
    const agendas = cargarAgendas();
    const agenda = agendas.find(a => a.id === agendaViendoId);
    guardarAgendas(agendas.filter(a => a.id !== agendaViendoId));
    if (usuarioActual && agenda) borrarAgendaNube(usuarioActual.uid, agenda.fechaKey).catch(() => {});
    volverAtras();
}

// ── PROCESAR AGENDA ───────────────────────────────────
function procesarAgenda() {
    const texto = document.getElementById('input-actividades').value.trim();
    if (!texto) { alert('Por favor ingresa tus actividades.'); return; }
    const lineas = texto.split('\n');
    const recurrentesNuevas = [];
    const lineasNormales = [];
    lineas.forEach(linea => {
        linea = linea.trim();
        if (!linea) return;
        const rec = parsearRecurrente(linea);
        if (rec && rec.diasAplica.length > 0) {
            recurrentesNuevas.push(rec);
            lineasNormales.push(linea.replace(/\[.+?\]/, '').trim());
        } else {
            lineasNormales.push(linea);
        }
    });
    if (recurrentesNuevas.length > 0) {
        const recActuales = cargarRecurrentes();
        recurrentesNuevas.forEach(nueva => {
            const existente = recActuales.findIndex(r => r.actividad === nueva.actividad);
            if (existente !== -1) { recActuales[existente] = nueva; }
            else { recActuales.push(nueva); }
        });
        guardarRecurrentes(recActuales);
    }
    const textoFinal = lineasNormales.join('\n');
    const fechaKey = formatearFechaKey(fechaSeleccionada);
    const nombre = formatearFechaDisplay(fechaSeleccionada);
    let agendas = cargarAgendas();
    let agendaGuardada;
    if (agendaEditandoId) {
        const idx = agendas.findIndex(a => a.id === agendaEditandoId);
        if (idx !== -1) {
            agendas[idx].texto = textoFinal; agendas[idx].nombre = nombre; agendas[idx].fechaKey = fechaKey;
            agendaGuardada = agendas[idx];
        }
        agendaViendoId = agendaEditandoId;
        agendaEditandoId = null;
    } else {
        const existente = agendas.findIndex(a => a.fechaKey === fechaKey);
        if (existente !== -1) {
            agendas[existente].texto = textoFinal; agendas[existente].nombre = nombre;
            agendaViendoId = agendas[existente].id; agendaGuardada = agendas[existente];
        } else {
            const nueva = { id: Date.now().toString(), nombre, texto: textoFinal, fechaKey };
            agendas.unshift(nueva); agendaViendoId = nueva.id; agendaGuardada = nueva;
        }
    }
    agendas.sort((a, b) => b.fechaKey.localeCompare(a.fechaKey));
    guardarAgendas(agendas);
    if (usuarioActual && agendaGuardada) guardarAgendaNube(usuarioActual.uid, agendaGuardada).catch(() => {});
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-hoy').classList.add('activa');
    mostrarHoy();
}

// ── PARSEAR Y RENDER ──────────────────────────────────
function extraerActividad(linea) {
    // Quitar [...] si existe
    linea = linea.replace(/\[.+?\]/, '').trim();
    // Intentar extraer solo el nombre sin la hora
    const match = linea.match(/^(.*?)\s+\d{1,2}(:\d{2})?\s*$/);
    return match ? match[1].trim() : linea;
}

function parsearActividades(texto) {
    const lineas = texto.split('\n');
    const palabrasLimpieza = ['barrer', 'trapear', 'lavar', 'ropa', 'limpieza'];
    let fijas = [], limpieza = [];
    lineas.forEach(linea => {
        linea = linea.trim().replace(/\[.+?\]/, '').trim();
        if (!linea) return;
        const esLimpieza = palabrasLimpieza.some(p => linea.toLowerCase().includes(p)) && !/\d/.test(linea);
        if (esLimpieza) {
            limpieza.push(linea);
        } else {
            // Acepta: "GYM 12:00", "GYM - 12:00", "GYM 12", "GYM - 12"
            const match = linea.match(/^(.*?)\s*[-–—]?\s*(\d{1,2}:\d{2}|\d{1,2})\s*$/);
            if (match) {
                let hora = match[2].trim();
                if (!hora.includes(':')) hora = hora + ':00';
                const actividad = match[1].trim().replace(/[-–—]\s*$/, '');
                fijas.push({ actividad, hora });
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
            <div class="panel"><h3>Línea de Tiempo</h3><div class="timeline-vertical">${timelineItems}</div></div>
            <div class="panel"><h3>Actividades</h3>
                <table><thead><tr><th>Hora</th><th>Actividad</th></tr></thead><tbody>${filas}</tbody></table>
            </div>
        </div>
        ${limpieza.length ? `<div class="panel" style="margin-top:15px"><h3>Tareas del Hogar</h3><ul style="padding-left:20px;line-height:2">${limpiezaHTML}</ul></div>` : ''}
    `;
}

// ── INIT ──────────────────────────────────────────────
pedirPermisoNotificaciones();
verificarOnboarding();

window.siguienteSlide = siguienteSlide;
window.terminarOnboarding = terminarOnboarding;
window.mostrarTab = mostrarTab;
window.togglePassword = togglePassword;
window.mostrarRecuperar = mostrarRecuperar;
window.handleRecuperar = handleRecuperar;
window.handleLogin = handleLogin;
window.handleRegistro = handleRegistro;
window.handleGoogle = handleGoogle;
window.handleCerrarSesion = handleCerrarSesion;
window.toggleAyuda = toggleAyuda;
window.mostrarHoy = mostrarHoy;
window.mostrarEditor = mostrarEditor;
window.mostrarConfig = mostrarConfig;
window.volverAtras = volverAtras;
window.editarHoy = editarHoy;
window.borrarHoy = borrarHoy;
window.editarAgendaActual = editarAgendaActual;
window.borrarAgendaActual = borrarAgendaActual;
window.procesarAgenda = procesarAgenda;
window.toggleCalendario = toggleCalendario;
window.cambiarMesMini = cambiarMesMini;
window.seleccionarFecha = seleccionarFecha;
window.abrirCalendario = abrirCalendario;
window.cerrarCalendario = cerrarCalendario;
window.cambiarMes = cambiarMes;
window.seleccionarDiaCalendario = seleccionarDiaCalendario;
window.seleccionarDiaStrip = seleccionarDiaStrip;
window.agregarPendiente = agregarPendiente;
window.togglePendiente = togglePendiente;
window.borrarPendiente = borrarPendiente;
window.agregarEmojiPersonalizado = agregarEmojiPersonalizado;
window.borrarEmojiCustom = borrarEmojiCustom;
window.navegarDia = navegarDia;
window.borrarRecurrente = borrarRecurrente;