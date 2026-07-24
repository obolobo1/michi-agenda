// ── IMPORTS FIREBASE ──────────────────────────────────
import {
    registrarUsuario, iniciarSesion, iniciarSesionGoogle,
    cerrarSesion, observarUsuario, recuperarContrasena,
    guardarAgendaNube, cargarAgendasNube, borrarAgendaNube,
    guardarPendientesNube, cargarPendientesNube,
    guardarEmojisNube, cargarEmojisNube,
    guardarRecurrentesNube, cargarRecurrentesNube,
    guardarChecksNube, cargarChecksNube,
    guardarWalletNube, cargarWalletNube,
    guardarLogrosNube, cargarLogrosNube,
    guardarMichiNube, cargarMichiNube,
    guardarColeccionNube, cargarColeccionNube,
    guardarNivelesMichisNube, cargarNivelesMichisNube,
    guardarCartasNube, cargarCartasNube,
    guardarMarcosNube, cargarMarcosNube,
    guardarFrasesNube, cargarFrasesNube,
    cargarCatalogoMichis, cargarCatalogoMarcos
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
let michiPendienteDeNombre = null;
let MICHIS_TIENDA_REMOTO = [];
let MARCOS_TIENDA_REMOTO = [];

// ── SONIDOS ───────────────────────────────────────────
function crearSonido(frecuencia, duracion, tipo = 'sine', volumen = 0.15) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = tipo;
        oscillator.frequency.setValueAtTime(frecuencia, ctx.currentTime);
        gainNode.gain.setValueAtTime(volumen, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracion);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duracion);
    } catch(e) {}
}

function sonidoPatitas() {
    crearSonido(880, 0.15, 'sine', 0.12);
    setTimeout(() => crearSonido(1100, 0.15, 'sine', 0.1), 100);
}
function sonidoCheck() { crearSonido(600, 0.1, 'sine', 0.1); }
function sonidoNivel() {
    crearSonido(523, 0.15, 'sine', 0.12);
    setTimeout(() => crearSonido(659, 0.15, 'sine', 0.12), 120);
    setTimeout(() => crearSonido(784, 0.25, 'sine', 0.15), 240);
}
function sonidoLogro() {
    crearSonido(784, 0.15, 'sine', 0.12);
    setTimeout(() => crearSonido(988, 0.3, 'sine', 0.15), 150);
}
function sonidoAdopcion() {
    crearSonido(400, 0.1, 'sine', 0.1);
    setTimeout(() => crearSonido(600, 0.1, 'sine', 0.12), 100);
    setTimeout(() => crearSonido(800, 0.2, 'sine', 0.15), 200);
}
function sonidoRonroneo() {
    crearSonido(120, 0.4, 'sine', 0.08);
    setTimeout(() => crearSonido(100, 0.4, 'sine', 0.06), 200);
    setTimeout(() => crearSonido(120, 0.4, 'sine', 0.08), 400);
}
function sonidoCarta() {
    crearSonido(523, 0.2, 'sine', 0.1);
    setTimeout(() => crearSonido(659, 0.2, 'sine', 0.12), 150);
    setTimeout(() => crearSonido(784, 0.2, 'sine', 0.12), 300);
    setTimeout(() => crearSonido(1047, 0.4, 'sine', 0.15), 450);
}

// ── CATÁLOGO DE MICHIS (fallback local) ───────────────
const MICHIS_DISPONIBLES = [
    { id: 'naranjoso', nombre: 'Naranjoso', img: 'michis/naranjoso.png', tipo: 'basico' },
    { id: 'negro',     nombre: 'Negro',     img: 'michis/negro.png',     tipo: 'basico' },
    { id: 'blanco',    nombre: 'Blanco',    img: 'michis/blanco.png',    tipo: 'basico' },
    { id: 'gris',      nombre: 'Gris',      img: 'michis/gris.png',      tipo: 'basico' },
    { id: 'calica',    nombre: 'Calica',    img: 'michis/calica.png',    tipo: 'basico' },
    { id: 'azul',      nombre: 'Azul',      img: 'michis/azul.png',      tipo: 'basico' },
];

const MICHIS_TIENDA = [
    { id: 'naranjoso', nombre: 'Naranjoso', img: 'michis/naranjoso.png', tipo: 'basico',   precioPatitas: 200, nivelRequerido: 2  },
    { id: 'negro',     nombre: 'Negro',     img: 'michis/negro.png',     tipo: 'basico',   precioPatitas: 200, nivelRequerido: 2  },
    { id: 'blanco',    nombre: 'Blanco',    img: 'michis/blanco.png',    tipo: 'basico',   precioPatitas: 200, nivelRequerido: 2  },
    { id: 'gris',      nombre: 'Gris',      img: 'michis/gris.png',      tipo: 'basico',   precioPatitas: 200, nivelRequerido: 2  },
    { id: 'calica',    nombre: 'Calica',    img: 'michis/calica.png',    tipo: 'basico',   precioPatitas: 200, nivelRequerido: 2  },
    { id: 'azul',      nombre: 'Azul',      img: 'michis/azul.png',      tipo: 'basico',   precioPatitas: 200, nivelRequerido: 2  },
    { id: 'tony',      nombre: 'Tony',      img: 'michis/tony.png',      tipo: 'nivel10',  precioPatitas: 500, nivelRequerido: 10 },
    { id: 'sombra',    nombre: 'Sombra',    img: 'michis/sombra.png',    tipo: 'nivel10',  precioPatitas: 500, nivelRequerido: 10 },
    { id: 'pachon',    nombre: 'Pachón',    img: 'michis/pachon.png',    tipo: 'nivel10',  precioPatitas: 500, nivelRequerido: 10 },
    { id: 'especial1', nombre: 'Michi Especial', img: 'michis/especial1.png', tipo: 'especial', precioBolas: 2, nivelRequerido: 0 },
    { id: 'vikingo',   nombre: 'Vikingo',   img: 'michis/vikingo.png',   tipo: 'especial', precioBolas: 2, nivelRequerido: 0 },
];

const MARCOS_TIENDA = [
    { id: 'marcofuego',   nombre: 'Marco Fuego',   img: 'michis/marcofuego.png',   precioBolas: 1 },
    { id: 'marcoflores',  nombre: 'Marco Flores',  img: 'michis/marcoflores.png',  precioBolas: 1 },
    { id: 'marcocyber',   nombre: 'Marco Cyber',   img: 'michis/marcocyber.png',   precioBolas: 1 },
    { id: 'marcovikingo', nombre: 'Marco Vikingo', img: 'michis/marcovikingo.png', precioBolas: 1 },
    { id: 'marcorosas',   nombre: 'Marco Rosas',   img: 'michis/marcorosas.png',   precioBolas: 1 },
];

// ── FRASES POR GATO ───────────────────────────────────
const FRASES_MICHIS = {
    naranjoso: {
        nivel1: [
            "¡Hola humano! Hoy es un gran día 🧡",
            "¡Miau! ¿Ya desayunaste? 🍳",
            "¡Estoy aquí contigo, vamos! 🧡",
            "¡Me alegra verte hoy! 😸",
            "¡Tú puedes, humano! 💪",
        ],
        nivel2: [
            "¡Hola humano! Hoy es un gran día 🧡",
            "¡Miau! ¿Ya desayunaste? 🍳",
            "¡Estoy aquí contigo, vamos! 🧡",
            "¡Me alegra verte hoy! 😸",
            "¡Tú puedes, humano! 💪",
            "¡Eres mi humano favorito del mundo! 🧡",
            "¡Qué día tan bonito para ser productivo! ☀️",
            "¡Sigue así, lo estás haciendo genial! 🎉",
            "¿Ya completaste todas tus actividades? 📋",
            "¡Juntos podemos con todo, humano! 🐾",
        ],
    },
    negro: {
        nivel1: [
            "...Hola. 🖤",
            "Supongo que hoy también toca trabajar. 😏",
            "No te diré que eres increíble. Pero tampoco que no lo eres. 🖤",
            "Aquí estoy. En las sombras. Vigilando. 👀",
            "Miau. Eso es todo lo que tengo. 🖤",
        ],
        nivel2: [
            "...Hola. 🖤",
            "Supongo que hoy también toca trabajar. 😏",
            "No te diré que eres increíble. Pero tampoco que no lo eres. 🖤",
            "Aquí estoy. En las sombras. Vigilando. 👀",
            "Miau. Eso es todo lo que tengo. 🖤",
            "Sabes que te observo, ¿verdad? Completa tus actividades. 😐",
            "No está mal lo que has hecho hoy. Para ser humano. 🖤",
            "Las sombras me susurran que eres más capaz de lo que crees. 🌑",
            "Podría ignorarte. Pero elegiré no hacerlo. Hoy. 😏",
            "Tu constancia me impresiona. No se lo digas a nadie. 🖤",
        ],
    },
    blanco: {
        nivel1: [
            "¡Buenos días, humano hermoso! 🤍",
            "Hoy va a ser un día maravilloso 🌸",
            "¡Estoy muy feliz de estar contigo! 🤍",
            "Cada pequeño paso cuenta 🌼",
            "Respira, sonríe y sigue adelante 🤍",
        ],
        nivel2: [
            "¡Buenos días, humano hermoso! 🤍",
            "Hoy va a ser un día maravilloso 🌸",
            "¡Estoy muy feliz de estar contigo! 🤍",
            "Cada pequeño paso cuenta 🌼",
            "Respira, sonríe y sigue adelante 🤍",
            "Tu esfuerzo de hoy es el éxito de mañana 🌟",
            "Me haces sentir el gato más afortunado 🤍",
            "¡Eres pura luz, humano! ✨",
            "Cuando completas tus metas, el mundo brilla más 🌸",
            "¡Cada logro tuyo me llena de orgullo! 🤍",
        ],
    },
    gris: {
        nivel1: [
            "Todo fluye, humano. Todo pasa. 🩶",
            "El silencio también es productivo. 🌫️",
            "Estoy aquí. Sin prisa. 🩶",
            "Un paso a la vez es suficiente. 🐾",
            "La constancia es más poderosa que la velocidad. 🩶",
        ],
        nivel2: [
            "Todo fluye, humano. Todo pasa. 🩶",
            "El silencio también es productivo. 🌫️",
            "Estoy aquí. Sin prisa. 🩶",
            "Un paso a la vez es suficiente. 🐾",
            "La constancia es más poderosa que la velocidad. 🩶",
            "El que persevera, alcanza. Tú perseveras. 🩶",
            "No necesitas ser perfecto, solo consistente. 🌫️",
            "Cada día que apareces es una victoria. 🩶",
            "La disciplina es libertad disfrazada. Piénsalo. 🐾",
            "Eres más tranquilo de lo que crees. Y eso es poderoso. 🩶",
        ],
    },
    calica: {
        nivel1: [
            "¡Miau miau miau! ¡Hola hola hola! 🤍🧡🖤",
            "¡Estoy de mil colores hoy! ¿Y tú? 🌈",
            "¡Vamos, que hay mucho por hacer! 🐾",
            "¡Me encanta cuando estás aquí! 🤍🧡",
            "¡Cada día es una nueva aventura! ✨",
        ],
        nivel2: [
            "¡Miau miau miau! ¡Hola hola hola! 🤍🧡🖤",
            "¡Estoy de mil colores hoy! ¿Y tú? 🌈",
            "¡Vamos, que hay mucho por hacer! 🐾",
            "¡Me encanta cuando estás aquí! 🤍🧡",
            "¡Cada día es una nueva aventura! ✨",
            "¡Tú y yo somos el mejor equipo del universo! 🤍🧡🖤",
            "¡No pares, humano, que yo tampoco paro! 🌈",
            "¡Tus colores brillan más cuando cumples tus metas! ✨",
            "¡Soy tres colores y los tres te apoyan! 🤍🧡🖤",
            "¡Eres tan único como yo! ¡Y eso es increíble! 🌈",
        ],
    },
    azul: {
        nivel1: [
            "¡Hola humano! El cielo es el límite 💙",
            "Fluyo contigo como el agua 💙",
            "¡Hoy es un día azul de los buenos! 🌊",
            "Tranquilo y contigo, siempre 💙",
            "¡Miau! ¿Listo para conquistar el día? 🌊",
        ],
        nivel2: [
            "¡Hola humano! El cielo es el límite 💙",
            "Fluyo contigo como el agua 💙",
            "¡Hoy es un día azul de los buenos! 🌊",
            "Tranquilo y contigo, siempre 💙",
            "¡Miau! ¿Listo para conquistar el día? 🌊",
            "Como el océano, tu potencial no tiene fondo 💙",
            "Sigue fluyendo, humano. Nada te detiene 🌊",
            "El azul del cielo te recuerda que todo es posible 💙",
            "Cada actividad completada es una ola que avanza 🌊",
            "¡Juntos somos profundos e imparables! 💙",
        ],
    },
    tony: {
        nivel1: [
            "Estoy aquí, todo está bajo control. ⭐",
            "Los grandes no se rinden. Tú tampoco. ⭐",
            "Hoy toca demostrar de qué estás hecho. 💪",
            "El esfuerzo tiene recompensa. Siempre. ⭐",
            "Estoy en tu esquina, campeón. 🐾",
        ],
        nivel2: [
            "Estoy aquí, todo está bajo control. ⭐",
            "Los grandes no se rinden. Tú tampoco. ⭐",
            "Hoy toca demostrar de qué estás hecho. 💪",
            "El esfuerzo tiene recompensa. Siempre. ⭐",
            "Estoy en tu esquina, campeón. 🐾",
            "Los que llegan lejos empezaron exactamente donde estás tú. ⭐",
            "No busques motivación. Busca disciplina. 💪",
            "Cada actividad completada es un round ganado. ⭐",
            "Te tardaste en llegar hasta aquí. Eso habla bien de ti. 🐾",
            "Los campeones también tienen días difíciles. Tú sigues aquí. ⭐",
        ],
    },
    sombra: {
        nivel1: [
            "...te veo. 🌑",
            "Desde las sombras, te cuido. 🖤",
            "No todos ven lo que haces. Yo sí. 🌑",
            "El silencio es mi idioma. El tuyo también, cuando te concentras. 🖤",
            "Aquí, en la oscuridad, también se crece. 🌑",
        ],
        nivel2: [
            "...te veo. 🌑",
            "Desde las sombras, te cuido. 🖤",
            "No todos ven lo que haces. Yo sí. 🌑",
            "El silencio es mi idioma. El tuyo también, cuando te concentras. 🖤",
            "Aquí, en la oscuridad, también se crece. 🌑",
            "Lo que haces en silencio es lo que más importa. 🌑",
            "Nadie necesita aplaudirte para que seas real. 🖤",
            "Las sombras no son el final. Son el comienzo. 🌑",
            "Tu consistencia habla más que cualquier discurso. 🖤",
            "He visto tus días difíciles. Y sigues aquí. Eso es todo. 🌑",
        ],
    },
    pachon: {
        nivel1: [
            "¡Hola! ¡Hola! ¡Hola! ¿Me das comida? 💛",
            "Mis patas son gorditas pero mi corazón es enorme 💛",
            "¿Podemos descansar un momento? Solo pregunto. 😴",
            "¡Estoy muy feliz de verte, humano! 💛",
            "La vida es mejor con snacks y metas cumplidas 🐾",
        ],
        nivel2: [
            "¡Hola! ¡Hola! ¡Hola! ¿Me das comida? 💛",
            "Mis patas son gorditas pero mi corazón es enorme 💛",
            "¿Podemos descansar un momento? Solo pregunto. 😴",
            "¡Estoy muy feliz de verte, humano! 💛",
            "La vida es mejor con snacks y metas cumplidas 🐾",
            "Soy redondito pero mis sueños son enormes. Como los tuyos. 💛",
            "¡Tú y yo, comiendo éxito juntos! 🎉",
            "No importa el tamaño del paso, lo que importa es darlo 💛",
            "Mis rollitos son de felicidad. Y la tuya también se nota. 🐾",
            "¡Eres mi héroe, humano! ¡Y yo soy tu gato gordo favorito! 💛",
        ],
    },
    especial1: {
        nivel1: [
            "¡Soy único, como tú! ✨",
            "¡Este es mi día especial! 🌟",
            "¡Juntos somos imparables! ✨",
            "¡Hola, humano extraordinario! 🌟",
            "¡Me alegra ser tu compañero especial! ✨",
        ],
        nivel2: [
            "¡Soy único, como tú! ✨",
            "¡Este es mi día especial! 🌟",
            "¡Juntos somos imparables! ✨",
            "¡Hola, humano extraordinario! 🌟",
            "¡Me alegra ser tu compañero especial! ✨",
            "¡Tus logros me llenan de orgullo! 🌟",
            "¡Cada día contigo es una aventura! ✨",
            "¡Eres tan especial como yo! 💫",
            "¡No te rindas, humano! ¡Yo tampoco! 🌟",
            "¡Somos el dúo más increíble! ✨",
        ],
    },
    vikingo: {
        nivel1: [
            "¡SKÅL, humano! ⚔️",
            "Los vikingos no se rinden. Tú tampoco. 🪖",
            "¡Hoy conquistamos el día! ⚔️",
            "El valiente no teme al lunes. 🪖",
            "¡Adelante, guerrero! ⚔️",
        ],
        nivel2: [
            "¡SKÅL, humano! ⚔️",
            "Los vikingos no se rinden. Tú tampoco. 🪖",
            "¡Hoy conquistamos el día! ⚔️",
            "El valiente no teme al lunes. 🪖",
            "¡Adelante, guerrero! ⚔️",
            "Cada actividad completada es una batalla ganada. ⚔️",
            "Los héroes también tienen su agenda. 🪖",
            "¡Tu disciplina es tu espada más poderosa! ⚔️",
            "Odin observa a los constantes. Sigue adelante. 🪖",
            "¡Eres digno de la gloria, humano! ⚔️",
        ],
    },
};

const FRASES_GENERICAS_N1 = [
    "¡Hola humano! 🐾",
    "¿Ya hiciste tus actividades? 😸",
    "Estoy aquí contigo 🐱",
    "¡Miau! 💙",
    "Me alegra verte hoy 🐾",
];

const FRASES_GENERICAS_N2 = [
    ...FRASES_GENERICAS_N1,
    "¡Eres increíble, humano! ✨",
    "Sigue así, lo estás haciendo genial 💪",
    "Hoy es un buen día para ser productivo 📅",
    "¡Ya casi terminas el día! 🌙",
    "Tu esfuerzo me hace muy feliz 😻",
];

// ── CARTAS DE MICHIS ──────────────────────────────────
const CARTAS_MICHIS = {
    naranjoso: { nombre: "Carta de Naranjoso", texto: "Humano, gracias por cuidarme. Tu energía y constancia me inspiran cada día. Cuando completas tus actividades, siento que juntos somos imparables. Sigue brillando así, y recuerda que con este esfuerzo también estás ayudando a los gatitos del mundo real. 🧡", firma: "Con amor felino, tu michi naranjoso 🐱" },
    negro:     { nombre: "Carta de Negro",     texto: "Humano, he observado tu dedicación desde las sombras y me llena de orgullo. Cada día que apareces y cumples tus metas, el mundo se vuelve un lugar un poco mejor. Tu disciplina es un ejemplo, no solo para mí, sino para todos los gatitos que necesitan un hogar. 🖤", firma: "Con misterio y cariño, tu michi negro 🐱" },
    blanco:    { nombre: "Carta de Blanco",    texto: "Humano, tu pureza de intención y constancia me hacen sentir el gato más afortunado. Gracias por estar aquí cada día. Tu esfuerzo tiene eco en el mundo real, donde muchos gatitos esperan un ángel como tú. ¡Sigue adelante! 🤍", firma: "Con ternura infinita, tu michi blanco 🐱" },
    gris:      { nombre: "Carta de Gris",      texto: "Humano, entre el ruido del día a día, tú encuentras siempre un momento para tus metas. Eso es raro y valioso. Me siento honrado de ser tu compañero. Recuerda que cada acto de disciplina tuyo resuena en el mundo, ayudando a los gatitos que más lo necesitan. 🩶", firma: "Con calma y afecto, tu michi gris 🐱" },
    calica:    { nombre: "Carta de Calica",    texto: "Humano, soy de muchos colores y tú también tienes muchas facetas increíbles. Gracias por mostrarme tu mejor versión cada día. Tu esfuerzo no solo te hace crecer a ti, sino que contribuye a un mundo mejor para todos los gatitos. ¡Eres especial! 🤍🧡🖤", firma: "Con colores y amor, tu michi calica 🐱" },
    azul:      { nombre: "Carta de Azul",      texto: "Humano, como el océano, tu constancia no tiene fin. Cada día que apareces y completas tus metas, me demuestras que eres imparable. Tu fluir tranquilo pero firme es lo que más admiro de ti. Gracias por dejarme acompañarte en esta aventura. 💙", firma: "Con profundidad y cariño, tu michi azul 🐱" },
    tony:      { nombre: "Carta de Tony",      texto: "Humano, llegar hasta aquí no fue fácil, pero lo lograste. Tu perseverancia me demuestra que eres alguien extraordinario. Me comprometo a estar siempre a tu lado. Y juntos, con tu esfuerzo, podemos hacer del mundo un lugar más amable para los gatitos que aún esperan su hogar. ⭐", firma: "Con admiración, Tony 🐱" },
    sombra:    { nombre: "Carta de Sombra",    texto: "Humano, desde las sombras he visto crecer tu disciplina y tu corazón. Alcanzar este nivel no es para cualquiera. Gracias por confiar en mí y por cada día que dedicas a ser mejor. Tu luz ilumina no solo tu vida, sino también la de los gatitos que necesitan un hogar. 🌑", firma: "Desde las sombras con amor, Sombra 🐱" },
    pachon:    { nombre: "Carta de Pachón",    texto: "Humano, con mis patas gorditas y mi corazón enorme te digo: eres lo máximo. Llegar al nivel 4 conmigo significa que eres constante, dedicado y maravilloso. Tu esfuerzo diario tiene un impacto real en el mundo, ayudando a los gatitos que más lo necesitan. ¡Eres mi héroe! 💛", firma: "Con panzota y amor, Pachón 🐱" },
    especial1: { nombre: "Carta Especial",     texto: "Humano, ser un michi especial significa que te esforzaste más que la mayoría. Me siento honrado de ser tu compañero. Tu dedicación es extraordinaria y me inspira cada día. Gracias por cuidarme y por demostrar que el esfuerzo siempre vale la pena. ✨", firma: "Con brillo especial, tu michi especial 🌟" },
    vikingo:   { nombre: "Carta de Vikingo",   texto: "¡Humano guerrero! Conquistar el Nivel 4 conmigo no es tarea de cualquiera. Tu disciplina y constancia son dignas de los grandes. Sigue adelante con tu hacha en alto y recuerda: cada hábito que construyes es una victoria para ti y para los gatitos que esperan un hogar. ⚔️", firma: "Con honor vikingo, tu michi Vikingo 🪖" },
};

// ── NIVELES DEL MICHI ─────────────────────────────────
const NIVELES_MICHI = [
    { nivel: 1, costo: 100,  nivelUsuario: 5,  desc: "Frases en globo",          emoji: "💬" },
    { nivel: 2, costo: 200,  nivelUsuario: 8,  desc: "Más frases en globo",      emoji: "💬💬" },
    { nivel: 3, costo: 300,  nivelUsuario: 12, desc: "Ronroneo al tocar",         emoji: "🎵" },
    { nivel: 4, costo: 450,  nivelUsuario: 15, desc: "Carta especial de cariño", emoji: "💌" },
];

function cargarNivelesMichis() {
    return JSON.parse(localStorage.getItem('michi-niveles') || '{}');
}

function guardarNivelesMichis(niveles) {
    localStorage.setItem('michi-niveles', JSON.stringify(niveles));
    if (usuarioActual) guardarNivelesMichisNube(usuarioActual.uid, niveles).catch(() => {});
}

function getNivelMichi(michiId) {
    return cargarNivelesMichis()[michiId] || 0;
}

function cargarCartas() {
    return JSON.parse(localStorage.getItem('michi-cartas') || '[]');
}

function guardarCartas(cartas) {
    localStorage.setItem('michi-cartas', JSON.stringify(cartas));
    if (usuarioActual) guardarCartasNube(usuarioActual.uid, cartas).catch(() => {});
}

// ── FRASES PERSONALIZADAS ─────────────────────────────
function cargarFrasesPersonalizadas() {
    return JSON.parse(localStorage.getItem('michi-frases-custom') || '[]');
}

function guardarFrasesPersonalizadas(frases) {
    localStorage.setItem('michi-frases-custom', JSON.stringify(frases));
    if (usuarioActual) guardarFrasesNube(usuarioActual.uid, frases).catch(() => {});
}

function agregarFrasePersonalizada() {
    const input = document.getElementById('input-frase-custom');
    const texto = input.value.trim();
    if (!texto) return;

    const frases = cargarFrasesPersonalizadas();
    const costo = frases.length + 1;

    if (frases.length >= 20) {
        mostrarToastPatitas(0, '💬 Ya tienes el máximo de 20 frases personalizadas');
        return;
    }

    const wallet = cargarWallet();
    if (wallet.bolasDePelo < costo) {
        mostrarToastPatitas(0, `🧶 Necesitas ${costo} bola${costo > 1 ? 's' : ''} de pelo para agregar esta frase`);
        return;
    }

    wallet.bolasDePelo -= costo;
    guardarWallet(wallet);
    frases.push({ id: Date.now().toString(), texto });
    guardarFrasesPersonalizadas(frases);
    input.value = '';
    renderBadgeWallet();
    renderFrasesCustom();
    mostrarToastPatitas(0, `💬 ¡Frase agregada! Tu michi la dirá pronto`);
}

function borrarFraseCustom(id) {
    const frases = cargarFrasesPersonalizadas().filter(f => f.id !== id);
    guardarFrasesPersonalizadas(frases);
    renderFrasesCustom();
}

function renderFrasesCustom() {
    const frases = cargarFrasesPersonalizadas();
    const lista = document.getElementById('lista-frases-custom');
    const infoEl = document.getElementById('frases-costo-info');
    if (!lista) return;

    const costo = frases.length + 1;
    if (frases.length < 20) {
        infoEl.textContent = `La siguiente frase costará ${costo} 🧶 · Tienes ${frases.length}/20 frases`;
    } else {
        infoEl.textContent = '✅ Máximo alcanzado (20/20 frases)';
    }

    lista.innerHTML = frases.length === 0
        ? '<li style="color:#4b5563;font-style:italic;font-size:0.82rem;padding:6px 0">Sin frases personalizadas todavía 💬</li>'
        : frases.map(f => `
            <li class="emoji-custom-item">
                <span class="emoji-custom-icono">💬</span>
                <span class="emoji-custom-palabra" style="flex:1;font-size:0.82rem">${f.texto}</span>
                <button class="btn-borrar-emoji" onclick="borrarFraseCustom('${f.id}')">✕</button>
            </li>`).join('');
}

function obtenerFraseAleatoria(michiId, nivelMichi) {
    const frasesCustom = cargarFrasesPersonalizadas();
    const frasesGato = FRASES_MICHIS[michiId];
    let pool = [];

    if (frasesGato) {
        pool = nivelMichi >= 2 ? frasesGato.nivel2 : frasesGato.nivel1;
    } else {
        pool = nivelMichi >= 2 ? FRASES_GENERICAS_N2 : FRASES_GENERICAS_N1;
    }

    if (frasesCustom.length > 0) {
        const todasLasFrases = [...pool, ...frasesCustom.map(f => f.texto)];
        return todasLasFrases[Math.floor(Math.random() * todasLasFrases.length)];
    }

    return pool[Math.floor(Math.random() * pool.length)];
}

// ── MARCOS ────────────────────────────────────────────
function cargarDatosMarcos() {
    const guardado = localStorage.getItem('michi-marcos');
    return guardado ? JSON.parse(guardado) : { coleccion: [], activo: null };
}

function guardarDatosMarcos(datos) {
    localStorage.setItem('michi-marcos', JSON.stringify(datos));
    if (usuarioActual) guardarMarcosNube(usuarioActual.uid, datos).catch(() => {});
}

function aplicarMarcoActivo() {
    const datos = cargarDatosMarcos();
    const marcoImg = document.getElementById('michi-marco-img');
    if (!marcoImg) return;
    const marcosActivos = MARCOS_TIENDA_REMOTO.length > 0 ? MARCOS_TIENDA_REMOTO : MARCOS_TIENDA;
    if (datos.activo) {
        const marco = marcosActivos.find(m => m.id === datos.activo);
        if (marco) {
            marcoImg.src = marco.img;
            marcoImg.classList.remove('oculto');
        }
    } else {
        marcoImg.classList.add('oculto');
    }
}

function usarMarco(marcoId) {
    const datos = cargarDatosMarcos();
    if (datos.activo === marcoId) {
        datos.activo = null;
        mostrarToastPatitas(0, '🖼️ Marco removido');
    } else {
        datos.activo = marcoId;
        const marcosActivos = MARCOS_TIENDA_REMOTO.length > 0 ? MARCOS_TIENDA_REMOTO : MARCOS_TIENDA;
        const marco = marcosActivos.find(m => m.id === marcoId);
        mostrarToastPatitas(0, `🖼️ ¡${marco?.nombre || 'Marco'} activado!`);
    }
    guardarDatosMarcos(datos);
    aplicarMarcoActivo();
    renderInventarioMarcos();
}

function comprarMarco(marcoId) {
    const wallet = cargarWallet();
    const marcosActivos = MARCOS_TIENDA_REMOTO.length > 0 ? MARCOS_TIENDA_REMOTO : MARCOS_TIENDA;
    const marco = marcosActivos.find(m => m.id === marcoId);
    const datos = cargarDatosMarcos();
    if (!marco || datos.coleccion.includes(marcoId)) return;
    if (wallet.bolasDePelo < marco.precioBolas) {
        mostrarToastPatitas(0, '🧶 No tienes suficientes bolas de pelo');
        return;
    }
    wallet.bolasDePelo -= marco.precioBolas;
    guardarWallet(wallet);
    datos.coleccion.push(marcoId);
    datos.activo = marcoId;
    guardarDatosMarcos(datos);
    aplicarMarcoActivo();
    sonidoAdopcion();
    mostrarToastPatitas(0, `🖼️ ¡${marco.nombre} desbloqueado y activado!`);
    renderBadgeWallet();
    renderTienda();
    renderInventarioMarcos();
}

// ── NIVELES DEL MICHI — funciones ─────────────────────
function subirNivelMichi(michiId) {
    const wallet = cargarWallet();
    const { nivel: nivelUsuario } = calcularNivelDesdeXP(wallet.xp || 0);
    const niveles = cargarNivelesMichis();
    const nivelActual = niveles[michiId] || 0;
    const siguienteNivel = NIVELES_MICHI[nivelActual];

    if (!siguienteNivel) return;

    if (nivelUsuario < siguienteNivel.nivelUsuario) {
        mostrarToastPatitas(0, `🐱 Aún no me conoces lo suficiente... sigue creciendo y confiaré más en ti`);
        return;
    }

    if (wallet.patitas < siguienteNivel.costo) {
        mostrarToastPatitas(0, `🐾 ¡Ya confío en ti! Pero necesito ${siguienteNivel.costo - wallet.patitas} patitas más`);
        return;
    }

    wallet.patitas -= siguienteNivel.costo;
    guardarWallet(wallet);
    niveles[michiId] = nivelActual + 1;
    guardarNivelesMichis(niveles);
    sonidoNivel();
    mostrarToastPatitas(0, `⭐ ¡${obtenerNombreMichi(michiId)} subió al Nivel ${nivelActual + 1}!`);

    if (nivelActual + 1 === 4) desbloquearCarta(michiId);

    renderBadgeWallet();
    renderInventario();
    revisarLogrosNuevos();
}

function obtenerNombreMichi(michiId) {
    const coleccion = cargarColeccionMichis();
    const michi = coleccion.find(m => m.id === michiId);
    return michi ? (michi.nombrePersonalizado || michi.nombre) : michiId;
}

function desbloquearCarta(michiId) {
    const cartas = cargarCartas();
    if (cartas.includes(michiId)) return;
    cartas.push(michiId);
    guardarCartas(cartas);
    sonidoCarta();
    const cartaDef = CARTAS_MICHIS[michiId];
    const nombre = obtenerNombreMichi(michiId);
    setTimeout(() => {
        document.getElementById('modal-carta-sobre').textContent = '💌';
        document.getElementById('modal-carta-titulo').textContent = `¡Carta de ${nombre}!`;
        document.getElementById('modal-carta-texto').textContent = cartaDef?.texto || `Gracias por cuidarme, humano. 🐱`;
        document.getElementById('modal-carta-firma').textContent = cartaDef?.firma || `Con cariño, ${nombre}`;
        document.getElementById('modal-carta').classList.remove('oculto');
    }, 800);
    revisarLogrosNuevos();
}

function cerrarModalCarta(event) {
    if (!event || event.target.id === 'modal-carta') {
        document.getElementById('modal-carta').classList.add('oculto');
    }
}

function abrirCarta(michiId) {
    const cartas = cargarCartas();
    if (!cartas.includes(michiId)) return;
    const cartaDef = CARTAS_MICHIS[michiId];
    const nombre = obtenerNombreMichi(michiId);
    document.getElementById('modal-carta-sobre').textContent = '💌';
    document.getElementById('modal-carta-titulo').textContent = `Carta de ${nombre}`;
    document.getElementById('modal-carta-texto').textContent = cartaDef?.texto || `Gracias por cuidarme, humano. 🐱`;
    document.getElementById('modal-carta-firma').textContent = cartaDef?.firma || `Con cariño, ${nombre}`;
    document.getElementById('modal-carta').classList.remove('oculto');
}

// ── MICHI COMPAÑERO ───────────────────────────────────
const IMG_TRANSPORTADORA = 'michis/transportadora.png';
const COSTO_ADOPCION = 100;
const NIVEL_ADOPCION = 2;

function cargarMichi() {
    const guardado = localStorage.getItem('michi-companero');
    return guardado ? JSON.parse(guardado) : null;
}

function guardarMichi(michi) {
    localStorage.setItem('michi-companero', JSON.stringify(michi));
    if (usuarioActual) guardarMichiNube(usuarioActual.uid, michi).catch(() => {});
}

function cargarMichisDesbloqueados() {
    return JSON.parse(localStorage.getItem('michi-desbloqueados') || '[]');
}

function guardarMichisDesbloqueados(lista) {
    localStorage.setItem('michi-desbloqueados', JSON.stringify(lista));
}

function cargarColeccionMichis() {
    return JSON.parse(localStorage.getItem('michi-coleccion') || '[]');
}

function guardarColeccionMichis(coleccion) {
    localStorage.setItem('michi-coleccion', JSON.stringify(coleccion));
    if (usuarioActual) guardarColeccionNube(usuarioActual.uid, coleccion).catch(() => {});
}

function mostrarGloboAlEntrar() {
    const michi = cargarMichi();
    if (!michi) return;
    const nivelMichi = getNivelMichi(michi.id);
    if (nivelMichi < 1) return;

    setTimeout(() => {
        const frase = obtenerFraseAleatoria(michi.id, nivelMichi);
        const globo = document.getElementById('michi-globo');
        if (!globo) return;
        globo.textContent = frase;
        globo.classList.remove('oculto');
        setTimeout(() => globo.classList.add('oculto'), 3000);
    }, 800);
}

function renderMichiHome() {
    const michi = cargarMichi();
    const wallet = cargarWallet();
    const { nivel } = calcularNivelDesdeXP(wallet.xp || 0);
    const img = document.getElementById('michi-img');
    const mensaje = document.getElementById('michi-mensaje');
    const btnAdoptar = document.getElementById('btn-adoptar');
    const btnTienda = document.getElementById('btn-tienda-header');
    const btnIrTienda = document.getElementById('btn-ir-tienda');
    const btnInventario = document.getElementById('btn-inventario-header');

    if (michi) {
        img.src = michi.img;
        img.style.display = 'block';
        mensaje.textContent = `${michi.nombrePersonalizado || michi.nombre} te acompaña 🐾`;
        btnAdoptar.classList.add('oculto');
        if (btnTienda) btnTienda.classList.remove('oculto');
        if (btnIrTienda) btnIrTienda.classList.remove('oculto');
        if (btnInventario) {
            const coleccion = cargarColeccionMichis();
            const datosMarcos = cargarDatosMarcos();
            const tieneAlgo = coleccion.length > 1 || datosMarcos.coleccion.length > 0;
            tieneAlgo ? btnInventario.classList.remove('oculto') : btnInventario.classList.add('oculto');
        }
    } else {
        img.src = IMG_TRANSPORTADORA;
        img.style.display = 'block';
        if (btnTienda) btnTienda.classList.add('oculto');
        if (btnIrTienda) btnIrTienda.classList.add('oculto');
        if (btnInventario) btnInventario.classList.add('oculto');

        if (nivel >= NIVEL_ADOPCION && wallet.patitas >= COSTO_ADOPCION) {
            mensaje.textContent = '¡Ya puedes abrir la caja! 🐾';
            btnAdoptar.classList.remove('oculto');
        } else if (nivel >= NIVEL_ADOPCION) {
            mensaje.textContent = `Necesitas ${COSTO_ADOPCION} 🐾 para abrir la caja`;
            btnAdoptar.classList.add('oculto');
        } else {
            mensaje.textContent = 'Aún no te tiene confianza... sigue usando la app 🐾';
            btnAdoptar.classList.add('oculto');
        }
    }
    aplicarMarcoActivo();
}

function tocarMichi() {
    const michi = cargarMichi();
    const img = document.getElementById('michi-img');
    const caja = document.getElementById('michi-caja');

    if (!michi) {
        const ojos = document.getElementById('michi-ojos');
        const patita = document.getElementById('michi-patita');
        const random = Math.floor(Math.random() * 3);
        if (random === 0) {
            ojos.classList.remove('oculto');
            setTimeout(() => ojos.classList.add('oculto'), 900);
        } else if (random === 1) {
            patita.classList.remove('oculto');
            setTimeout(() => patita.classList.add('oculto'), 900);
        } else {
            caja.classList.add('sacudiendo');
            setTimeout(() => caja.classList.remove('sacudiendo'), 600);
        }
        return;
    }

    const nivelMichi = getNivelMichi(michi.id);

    if (nivelMichi === 0) {
        img.classList.remove('michi-cola');
        void img.offsetWidth;
        img.classList.add('michi-cola');
        setTimeout(() => img.classList.remove('michi-cola'), 800);
        return;
    }

    const random = Math.random();

    if (nivelMichi >= 3 && random < 0.10) {
        sonidoRonroneo();
        img.classList.remove('michi-cola');
        void img.offsetWidth;
        img.classList.add('michi-cola');
        setTimeout(() => img.classList.remove('michi-cola'), 800);
    } else if (nivelMichi >= 1 && random < 0.55) {
        mostrarGloboFrase(michi.id, nivelMichi);
    } else {
        img.classList.remove('michi-cola');
        void img.offsetWidth;
        img.classList.add('michi-cola');
        setTimeout(() => img.classList.remove('michi-cola'), 800);
    }
}

function mostrarGloboFrase(michiId, nivelMichi) {
    const frase = obtenerFraseAleatoria(michiId, nivelMichi);
    const globo = document.getElementById('michi-globo');
    globo.textContent = frase;
    globo.classList.remove('oculto');
    setTimeout(() => globo.classList.add('oculto'), 2500);
}

function mostrarModalNombre() {
    const wallet = cargarWallet();
    const { nivel } = calcularNivelDesdeXP(wallet.xp || 0);
    if (nivel < NIVEL_ADOPCION || wallet.patitas < COSTO_ADOPCION) return;

    wallet.patitas -= COSTO_ADOPCION;
    guardarWallet(wallet);

    const coleccion = cargarColeccionMichis();
    const disponibles = MICHIS_DISPONIBLES.filter(m => !coleccion.find(c => c.id === m.id));
    const pool = disponibles.length > 0 ? disponibles : MICHIS_DISPONIBLES;
    const idx = Math.floor(Math.random() * pool.length);
    michiPendienteDeNombre = { ...pool[idx] };

    document.getElementById('modal-michi-preview').textContent = '🐱';
    document.getElementById('input-nombre-michi').value = '';
    document.getElementById('modal-nombre-michi').classList.remove('oculto');

    const img = document.getElementById('michi-img');
    img.src = michiPendienteDeNombre.img;
    img.classList.add('michi-aparece');
}

function cerrarModalNombre(event) {
    if (event.target.id === 'modal-nombre-michi') { }
}

function confirmarNombreMichi() {
    const input = document.getElementById('input-nombre-michi');
    const nombre = input.value.trim();
    if (!nombre) { input.focus(); return; }

    michiPendienteDeNombre.nombrePersonalizado = nombre;
    sonidoAdopcion();
    guardarMichi(michiPendienteDeNombre);

    const coleccion = cargarColeccionMichis();
    const yaEnColeccion = coleccion.find(m => m.id === michiPendienteDeNombre.id);
    if (!yaEnColeccion) coleccion.push({ ...michiPendienteDeNombre });
    guardarColeccionMichis(coleccion);

    const desbloqueados = cargarMichisDesbloqueados();
    if (!desbloqueados.includes(michiPendienteDeNombre.id)) {
        desbloqueados.push(michiPendienteDeNombre.id);
        guardarMichisDesbloqueados(desbloqueados);
    }

    document.getElementById('modal-nombre-michi').classList.add('oculto');
    mostrarToastPatitas(0, `🎉 ¡${nombre} es tu nuevo compañero!`);
    renderBadgeWallet();
    mostrarHoy();
    michiPendienteDeNombre = null;
    revisarLogrosNuevos();
}

// ── INVENTARIO ────────────────────────────────────────
function mostrarInventario() {
    pantallaAnterior = 'pantalla-hoy';
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-inventario').classList.add('activa');
    cambiarTabInventario('michis');
}

function cambiarTabInventario(tab) {
    document.querySelectorAll('.inventario-tab').forEach(t => t.classList.remove('activo'));
    document.querySelectorAll('.inventario-tab')[tab === 'michis' ? 0 : 1].classList.add('activo');
    document.getElementById('inventario-michis-panel').classList.toggle('oculto', tab !== 'michis');
    document.getElementById('inventario-marcos-panel').classList.toggle('oculto', tab !== 'marcos');
    if (tab === 'michis') renderInventario();
    else renderInventarioMarcos();
}

function renderInventario() {
    const coleccion = cargarColeccionMichis();
    const michiActivo = cargarMichi();
    const niveles = cargarNivelesMichis();
    const wallet = cargarWallet();
    const { nivel: nivelUsuario } = calcularNivelDesdeXP(wallet.xp || 0);
    const grid = document.getElementById('inventario-michis');

    if (coleccion.length === 0) {
        grid.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px;font-style:italic">Aún no tienes michis en tu colección 🐾</p>';
        return;
    }

    grid.innerHTML = coleccion.map(michi => {
        const esActivo = michiActivo && michiActivo.id === michi.id;
        const nombre = michi.nombrePersonalizado || michi.nombre;
        const nivelActual = niveles[michi.id] || 0;

        let nivelesHTML = `<div class="inventario-niveles oculto" id="niveles-${michi.id}">`;
        NIVELES_MICHI.forEach(n => {
            const desbloqueado = nivelActual >= n.nivel;
            const esSiguiente = n.nivel === nivelActual + 1;
            const puedeUsuario = nivelUsuario >= n.nivelUsuario;
            const puedePagar = wallet.patitas >= n.costo;
            let textoNivel = '';
            let textoBtn = '';
            let btnDisabled = '';

            if (desbloqueado) {
                textoNivel = `<span class="nivel-texto desbloqueado">${n.emoji} ${n.desc} ✅</span>`;
            } else if (esSiguiente) {
                if (!puedeUsuario) {
                    textoNivel = `<span class="nivel-texto bloqueado-nivel-usuario">${n.emoji} ${n.desc} — Nv.${n.nivelUsuario} usuario</span>`;
                    textoBtn = `${n.costo}🐾`;
                    btnDisabled = 'disabled';
                } else {
                    textoNivel = `<span class="nivel-texto">${n.emoji} ${n.desc} — ${n.costo}🐾</span>`;
                    textoBtn = `Subir`;
                    btnDisabled = !puedePagar ? 'disabled' : '';
                }
            } else {
                textoNivel = `<span class="nivel-texto" style="opacity:0.4">🔒 ${n.desc}</span>`;
            }

            nivelesHTML += `<div class="nivel-fila">
                <div class="nivel-info">${textoNivel}</div>
                ${esSiguiente ? `<button class="btn-subir-nivel" ${btnDisabled} onclick="subirNivelMichi('${michi.id}')">${textoBtn}</button>` : ''}
            </div>`;
        });
        nivelesHTML += '</div>';

        const mostrarToggle = nivelActual < 4;

        return `<div class="inventario-card ${esActivo ? 'activo' : ''}">
            <img src="${michi.img}" alt="${nombre}" class="inventario-card-img"/>
            <div class="inventario-card-nombre">${nombre}</div>
            ${esActivo ? '<div class="inventario-card-badge">✨ Acompañante activo</div>' : ''}
            ${nivelActual > 0 ? `<div style="font-size:0.7rem;color:#a78bfa">Nivel ${nivelActual} ⭐</div>` : ''}
            ${mostrarToggle ? `<button class="niveles-toggle" onclick="toggleNiveles('${michi.id}')">Ver niveles ▾</button>` : ''}
            ${nivelesHTML}
            <button class="btn-elegir" ${esActivo ? 'disabled' : ''} onclick="elegirAcompanante('${michi.id}')">
                ${esActivo ? 'Activo' : 'Elegir como compañero'}
            </button>
        </div>`;
    }).join('');
}

function toggleNiveles(michiId) {
    const div = document.getElementById(`niveles-${michiId}`);
    if (!div) return;
    div.classList.toggle('oculto');
    const btn = div.previousElementSibling;
    if (btn && btn.classList.contains('niveles-toggle')) {
        btn.textContent = div.classList.contains('oculto') ? 'Ver niveles ▾' : 'Ocultar niveles ▴';
    }
}

function renderInventarioMarcos() {
    const datos = cargarDatosMarcos();
    const grid = document.getElementById('inventario-marcos');
    const marcosActivos = MARCOS_TIENDA_REMOTO.length > 0 ? MARCOS_TIENDA_REMOTO : MARCOS_TIENDA;

    if (datos.coleccion.length === 0) {
        grid.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px;font-style:italic;grid-column:span 2">Aún no tienes marcos 🖼️<br><br>Consíguelos en la tienda con 🧶 bolas de pelo</p>';
        return;
    }

    grid.innerHTML = datos.coleccion.map(marcoId => {
        const marco = marcosActivos.find(m => m.id === marcoId);
        if (!marco) return '';
        const esActivo = datos.activo === marcoId;
        return `<div class="inventario-card ${esActivo ? 'activo' : ''}">
            <img src="${marco.img}" alt="${marco.nombre}" class="marco-preview"/>
            <div class="inventario-card-nombre">${marco.nombre}</div>
            ${esActivo ? '<div class="inventario-card-badge">✨ Marco activo</div>' : ''}
            <button class="${esActivo ? 'btn-quitar-marco' : 'btn-usar-marco'}"
                onclick="usarMarco('${marco.id}')">
                ${esActivo ? 'Quitar marco' : 'Usar este marco'}
            </button>
        </div>`;
    }).join('');
}

function elegirAcompanante(michiId) {
    const coleccion = cargarColeccionMichis();
    const michi = coleccion.find(m => m.id === michiId);
    if (!michi) return;
    guardarMichi(michi);
    sonidoAdopcion();
    mostrarToastPatitas(0, `🐱 ¡${michi.nombrePersonalizado || michi.nombre} es tu nuevo acompañante!`);
    renderInventario();
    renderMichiHome();
}

// ── TIENDA ────────────────────────────────────────────
function mostrarTienda() {
    pantallaAnterior = document.querySelector('.pantalla.activa')?.id || 'pantalla-hoy';
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-tienda').classList.add('activa');
    renderTienda();
}

function renderTienda() {
    const wallet = cargarWallet();
    const { nivel: nivelUsuario } = calcularNivelDesdeXP(wallet.xp || 0);
    const coleccion = cargarColeccionMichis();
    const datosMarcos = cargarDatosMarcos();

    const michisEspeciales = MICHIS_TIENDA_REMOTO.length > 0
        ? MICHIS_TIENDA_REMOTO.filter(m => m.tipo === 'especial')
        : MICHIS_TIENDA.filter(m => m.tipo === 'especial');

    const marcosRender = MARCOS_TIENDA_REMOTO.length > 0
        ? MARCOS_TIENDA_REMOTO
        : MARCOS_TIENDA;

    document.getElementById('tienda-saldo-patitas').textContent = wallet.patitas;
    document.getElementById('tienda-saldo-bolas').textContent = wallet.bolasDePelo;

    const renderCardMichi = (m) => {
        const yaDesbloqueado = coleccion.some(c => c.id === m.id);
        const nivelOk = nivelUsuario >= m.nivelRequerido;
        const bloqueadoPorNivel = !nivelOk && !yaDesbloqueado && m.nivelRequerido > 0;
        const usaBolas = m.precioBolas > 0;
        const puedePagar = usaBolas ? wallet.bolasDePelo >= m.precioBolas : wallet.patitas >= m.precioPatitas;
        const precioTexto = usaBolas ? `🧶 ${m.precioBolas}` : `🐾 ${m.precioPatitas}`;

        let btnTexto, btnDisabled, btnClass;
        if (yaDesbloqueado) {
            btnTexto = 'Adoptado'; btnDisabled = 'disabled'; btnClass = 'ya-tiene';
        } else if (bloqueadoPorNivel) {
            btnTexto = `Nivel ${m.nivelRequerido} requerido`; btnDisabled = 'disabled'; btnClass = '';
        } else if (!puedePagar) {
            btnTexto = usaBolas ? 'Sin bolas de pelo' : 'Sin patitas'; btnDisabled = 'disabled'; btnClass = '';
        } else {
            btnTexto = `Adoptar ${precioTexto}`; btnDisabled = ''; btnClass = usaBolas ? 'bola' : '';
        }

        return `<div class="tienda-card ${yaDesbloqueado ? 'ya-tiene' : ''} ${bloqueadoPorNivel ? 'bloqueado-nivel' : ''}">
            ${bloqueadoPorNivel ? '<div class="tienda-candado">🔒</div>' : ''}
            <img src="${m.img}" alt="${m.nombre}" class="tienda-card-img" style="${bloqueadoPorNivel ? 'filter:grayscale(0.6)' : ''}"/>
            <div class="tienda-card-nombre">${m.nombre}</div>
            ${bloqueadoPorNivel ? `<div class="tienda-card-nivel">⭐ Nivel ${m.nivelRequerido} requerido</div>` : ''}
            <div class="tienda-card-precio">${yaDesbloqueado ? '✅ Ya lo tienes' : precioTexto}</div>
            <button class="btn-comprar ${btnClass}" ${btnDisabled} onclick="comprarMichi('${m.id}')">
                ${btnTexto}
            </button>
        </div>`;
    };

    document.getElementById('tienda-michis-especiales').innerHTML =
        michisEspeciales.map(renderCardMichi).join('');

    document.getElementById('tienda-marcos').innerHTML = marcosRender.map(marco => {
        const yaComprado = datosMarcos.coleccion.includes(marco.id);
        const puedePagar = wallet.bolasDePelo >= marco.precioBolas;
        return `<div class="tienda-card ${yaComprado ? 'ya-tiene' : ''}">
            <img src="${marco.img}" alt="${marco.nombre}" class="tienda-card-img"/>
            <div class="tienda-card-nombre">${marco.nombre}</div>
            <div class="tienda-card-precio">${yaComprado ? '✅ Ya lo tienes' : `🧶 ${marco.precioBolas}`}</div>
            <button class="btn-comprar ${yaComprado ? 'ya-tiene' : ''}"
                ${yaComprado || !puedePagar ? 'disabled' : ''}
                onclick="comprarMarco('${marco.id}')">
                ${yaComprado ? 'En colección' : (puedePagar ? `Comprar 🧶${marco.precioBolas}` : 'Sin bolas')}
            </button>
        </div>`;
    }).join('');

    document.getElementById('tienda-michis-basicos').innerHTML =
        MICHIS_TIENDA.filter(m => m.tipo === 'basico').map(renderCardMichi).join('');

    document.getElementById('tienda-michis-nivel10').innerHTML =
        MICHIS_TIENDA.filter(m => m.tipo === 'nivel10').map(renderCardMichi).join('');

    document.getElementById('tienda-items').innerHTML = `
        <div class="tienda-card">
            <div class="tienda-card-emoji">🧊</div>
            <div class="tienda-card-nombre">Michi Freeze</div>
            <div class="tienda-card-precio">🐾 300 patitas</div>
            <button class="btn-comprar" ${wallet.patitas < 300 ? 'disabled' : ''} onclick="comprarFreeze('patitas')">
                ${wallet.patitas >= 300 ? 'Comprar' : 'Sin patitas'}
            </button>
        </div>
        <div class="tienda-card">
            <div class="tienda-card-emoji">🧊</div>
            <div class="tienda-card-nombre">Michi Freeze</div>
            <div class="tienda-card-precio">🧶 1 bola de pelo</div>
            <button class="btn-comprar" ${wallet.bolasDePelo < 1 ? 'disabled' : ''} onclick="comprarFreeze('bolas')">
                ${wallet.bolasDePelo >= 1 ? 'Comprar' : 'Sin bolas'}
            </button>
        </div>`;
}

function comprarMichi(michiId) {
    const wallet = cargarWallet();
    const { nivel: nivelUsuario } = calcularNivelDesdeXP(wallet.xp || 0);
    const todosLosMichis = MICHIS_TIENDA_REMOTO.length > 0
        ? [...MICHIS_TIENDA, ...MICHIS_TIENDA_REMOTO]
        : MICHIS_TIENDA;
    const michi = todosLosMichis.find(m => m.id === michiId);
    const coleccion = cargarColeccionMichis();

    if (!michi || coleccion.some(c => c.id === michiId)) return;

    if (michi.nivelRequerido > 0 && nivelUsuario < michi.nivelRequerido) {
        mostrarToastPatitas(0, `🔒 Necesitas Nivel ${michi.nivelRequerido} para adoptar este michi`);
        return;
    }

    const usaBolas = michi.precioBolas > 0;
    if (usaBolas) {
        if (wallet.bolasDePelo < michi.precioBolas) return;
        wallet.bolasDePelo -= michi.precioBolas;
    } else {
        if (wallet.patitas < michi.precioPatitas) return;
        wallet.patitas -= michi.precioPatitas;
    }

    guardarWallet(wallet);
    const desbloqueados = cargarMichisDesbloqueados();
    if (!desbloqueados.includes(michiId)) {
        desbloqueados.push(michiId);
        guardarMichisDesbloqueados(desbloqueados);
    }

    michiPendienteDeNombre = { ...michi };
    document.getElementById('input-nombre-michi').value = '';
    document.getElementById('modal-nombre-michi').classList.remove('oculto');

    renderTienda();
    renderBadgeWallet();
}

function comprarFreeze(tipo) {
    const wallet = cargarWallet();
    if (tipo === 'patitas') {
        if (wallet.patitas < 300) return;
        wallet.patitas -= 300;
    } else {
        if (wallet.bolasDePelo < 1) return;
        wallet.bolasDePelo -= 1;
    }
    wallet.michiFreezes = (wallet.michiFreezes || 0) + 1;
    guardarWallet(wallet);
    mostrarToastPatitas(0, '🧊 ¡Michi Freeze agregado!');
    renderTienda();
    renderBadgeWallet();
}

// ── ONBOARDING ────────────────────────────────────────
const SLIDES = [
    {
        emoji: '🐱',
        titulo: '¡Bienvenido a Michi Agenda!',
        desc: 'Tu agenda inteligente con un compañero que te motiva. Planea tu día, completa tus actividades y gana recompensas.',
        ejemplo: null
    },
    {
        emoji: '📅',
        titulo: 'Escribe tus actividades',
        desc: 'El formato es siempre: Actividad primero, hora después. Una actividad por línea.',
        ejemplo: '✅ GYM 07:00\n✅ Desayuno 09:00\n✅ Trabajo 10:00\n❌ 07:00 GYM  ← incorrecto'
    },
    {
        emoji: '🕐',
        titulo: 'Formato de 24 horas',
        desc: 'Usamos formato de 24 horas. Las 7 de la mañana son 07:00. Las 7 de la noche son 19:00.',
        ejemplo: '☀️ 07:00 = 7am\n🌙 19:00 = 7pm\n🌙 21:30 = 9:30pm\n🌅 13:00 = 1pm'
    },
    {
        emoji: '↻',
        titulo: 'Actividades recurrentes',
        desc: 'Agrega [días] al final para que la actividad aparezca automáticamente esos días de la semana.',
        ejemplo: 'GYM 07:00 [lunes, miércoles, viernes]\nMedicinas 08:00 [todos los días]\nTrabajo 09:00 [entre semana]'
    },
    {
        emoji: '🐾',
        titulo: 'Gana patitas y sube de nivel',
        desc: 'Entra cada día y completa tus actividades para ganar patitas 🐾 y experiencia ⭐. Con patitas puedes adoptar y mejorar a tu michi compañero.',
        ejemplo: null
    },
    {
        emoji: '🧶',
        titulo: 'Bolas de pelo — divisa premium',
        desc: 'Las bolas de pelo 🧶 se ganan por constancia o se compran. Con ellas desbloqueas michis especiales, marcos y frases personalizadas.',
        ejemplo: null
    },
    {
        emoji: '📦',
        titulo: 'Tu michi compañero',
        desc: 'Cuando llegues a Nivel 2 con 100 patitas, podrás abrir la caja y adoptar a tu primer michi. ¡Él te acompañará cada día!',
        ejemplo: null
    },
    {
        emoji: '✅',
        titulo: '¡Listo para empezar!',
        desc: 'Toca el botón + para crear tu primera agenda. Recuerda: primero la actividad, luego la hora en formato 24hrs. ¡Tu michi te espera!',
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
    document.getElementById('onboarding-dots').innerHTML = SLIDES.map((_, i) =>
        `<div class="onboarding-dot ${i === slideActual ? 'activo' : ''}"></div>`
    ).join('');
    document.getElementById('btn-onboarding-next').textContent =
        slideActual === SLIDES.length - 1 ? '¡Comenzar! 🐱' : 'Siguiente →';
}

function siguienteSlide() {
    if (slideActual < SLIDES.length - 1) { slideActual++; renderOnboarding(); }
    else terminarOnboarding();
}

function terminarOnboarding() {
    localStorage.setItem('michi-onboarding-visto', 'true');
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-login').classList.add('activa');
}

function verificarOnboarding() {
    if (!localStorage.getItem('michi-onboarding-visto')) {
        slideActual = 0; renderOnboarding();
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
        procesarLoginDiario();
        mostrarHoy();
        mostrarGloboAlEntrar();
    } else {
        document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
        if (!localStorage.getItem('michi-onboarding-visto')) {
            slideActual = 0; renderOnboarding();
            document.getElementById('pantalla-onboarding').classList.add('activa');
        } else {
            document.getElementById('pantalla-login').classList.add('activa');
        }
    }
});

async function sincronizarDesdNube() {
    if (!usuarioActual) return;
    try {
        const [agendas, pendientes, emojis, recurrentes, checks, wallet, logros, michi, coleccion, nivelesMichis, cartas, marcos, frases, catalogoMichis, catalogoMarcos] = await Promise.all([
            cargarAgendasNube(usuarioActual.uid),
            cargarPendientesNube(usuarioActual.uid),
            cargarEmojisNube(usuarioActual.uid),
            cargarRecurrentesNube(usuarioActual.uid),
            cargarChecksNube(usuarioActual.uid),
            cargarWalletNube(usuarioActual.uid),
            cargarLogrosNube(usuarioActual.uid),
            cargarMichiNube(usuarioActual.uid),
            cargarColeccionNube(usuarioActual.uid),
            cargarNivelesMichisNube(usuarioActual.uid),
            cargarCartasNube(usuarioActual.uid),
            cargarMarcosNube(usuarioActual.uid),
            cargarFrasesNube(usuarioActual.uid),
            cargarCatalogoMichis(),
            cargarCatalogoMarcos(),
        ]);
        localStorage.setItem('michi-agendas', JSON.stringify(agendas));
        localStorage.setItem('michi-pendientes', JSON.stringify(pendientes));
        localStorage.setItem('michi-emojis-custom', JSON.stringify(emojis));
        localStorage.setItem('michi-recurrentes', JSON.stringify(recurrentes));
        localStorage.setItem('michi-checks', JSON.stringify(checks));
        if (wallet) localStorage.setItem('michi-wallet', JSON.stringify(wallet));
        localStorage.setItem('michi-logros', JSON.stringify(logros || []));
        if (michi) localStorage.setItem('michi-companero', JSON.stringify(michi));
        if (coleccion && coleccion.length > 0) {
            localStorage.setItem('michi-coleccion', JSON.stringify(coleccion));
        } else if (michi) {
            const coleccionLocal = cargarColeccionMichis();
            const yaEnColeccion = coleccionLocal.find(m => m.id === michi.id);
            if (!yaEnColeccion) { coleccionLocal.push({ ...michi }); guardarColeccionMichis(coleccionLocal); }
        }
        if (nivelesMichis) localStorage.setItem('michi-niveles', JSON.stringify(nivelesMichis));
        if (cartas && cartas.length > 0) localStorage.setItem('michi-cartas', JSON.stringify(cartas));
        if (marcos) localStorage.setItem('michi-marcos', JSON.stringify(marcos));
        if (frases && frases.length > 0) localStorage.setItem('michi-frases-custom', JSON.stringify(frases));
        if (catalogoMichis && catalogoMichis.length > 0) MICHIS_TIENDA_REMOTO = catalogoMichis;
        if (catalogoMarcos && catalogoMarcos.length > 0) MARCOS_TIENDA_REMOTO = catalogoMarcos;
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
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? '👁️' : '🙈';
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
    try { await iniciarSesion(email, password); }
    catch (e) { errorEl.textContent = 'Correo o contraseña incorrectos.'; }
}

async function handleRegistro() {
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const errorEl = document.getElementById('login-error');
    if (!email || !password) { errorEl.textContent = 'Ingresa tu correo y contraseña.'; return; }
    if (password.length < 6) { errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres.'; return; }
    try { await registrarUsuario(email, password); }
    catch (e) { errorEl.textContent = 'Error al crear cuenta. ¿Ya tienes una?'; }
}

async function handleGoogle() {
    try { await iniciarSesionGoogle(); }
    catch (e) { document.getElementById('login-error').textContent = 'Error al iniciar con Google.'; }
}

async function handleCerrarSesion() {
    await cerrarSesion();
    ['michi-agendas','michi-pendientes','michi-emojis-custom','michi-recurrentes',
     'michi-checks','michi-wallet','michi-logros','michi-companero',
     'michi-desbloqueados','michi-coleccion','michi-niveles','michi-cartas',
     'michi-marcos','michi-frases-custom'].forEach(k => localStorage.removeItem(k));
}

function toggleAyuda() { document.getElementById('panel-ayuda').classList.toggle('oculto'); }

// ── SISTEMA DE NIVELES ────────────────────────────────
function xpParaNivel(nivel) { return Math.round(100 * Math.pow(1.4, nivel - 1)); }

function calcularNivelDesdeXP(xpTotal) {
    let nivel = 1, xpAcumulada = 0;
    while (true) {
        const xpNecesaria = xpParaNivel(nivel);
        if (xpAcumulada + xpNecesaria > xpTotal) break;
        xpAcumulada += xpNecesaria;
        nivel++;
    }
    const xpEnNivelActual = xpTotal - xpAcumulada;
    const xpNecesariaNivelActual = xpParaNivel(nivel);
    return { nivel, xpEnNivelActual, xpNecesariaNivelActual };
}

// ── LOGROS ────────────────────────────────────────────
const LOGROS_DEFINICION = [
    { id: 'primera_agenda',     nombre: 'Primera agenda creada',          emoji: '🎉', condicion: (s) => s.agendasCreadas >= 1,           patitas: 0,   xp: 0,   bolas: 0 },
    { id: 'primera_actividad',  nombre: 'Primera actividad completada',   emoji: '✅', condicion: (s) => s.actividadesCompletadas >= 1,    patitas: 5,   xp: 10,  bolas: 0 },
    { id: 'primer_dia_completo',nombre: 'Primer día 100% completado',     emoji: '💯', condicion: (s) => s.diasCompletados >= 1,           patitas: 10,  xp: 20,  bolas: 0 },
    { id: 'primer_emoji',       nombre: 'Primer emoji personalizado',     emoji: '🎨', condicion: (s) => s.emojisCreados >= 1,             patitas: 5,   xp: 10,  bolas: 0 },
    { id: 'primer_michi',       nombre: 'El primer paso',                 emoji: '🐾', condicion: (s) => s.michisColeccion >= 1,           patitas: 20,  xp: 30,  bolas: 0 },
    { id: 'coleccionista',      nombre: 'Coleccionista',                  emoji: '🎒', condicion: (s) => s.michisColeccion >= 2,           patitas: 30,  xp: 50,  bolas: 0 },
    { id: 'tres_michis',        nombre: 'Tribu de michis',                emoji: '🐱', condicion: (s) => s.michisColeccion >= 3,           patitas: 50,  xp: 80,  bolas: 0 },
    { id: 'cinco_michis',       nombre: 'Casa llena',                     emoji: '🏠', condicion: (s) => s.michisColeccion >= 5,           patitas: 100, xp: 150, bolas: 0 },
    { id: 'basicos_completos',  nombre: 'Básicos completos',              emoji: '⭐', condicion: (s) => s.michisBasicos >= 5,             patitas: 100, xp: 200, bolas: 1 },
    { id: 'primer_nivel10',     nombre: 'Michi avanzado',                 emoji: '💫', condicion: (s) => s.michisNivel10 >= 1,             patitas: 50,  xp: 300, bolas: 1 },
    { id: 'carta_naranjoso',    nombre: '💌 Carta de Naranjoso',         emoji: '📩', condicion: (s) => s.cartas.includes('naranjoso'),   patitas: 0,   xp: 50,  bolas: 0, esCarta: true, michiId: 'naranjoso' },
    { id: 'carta_negro',        nombre: '💌 Carta de Negro',             emoji: '📩', condicion: (s) => s.cartas.includes('negro'),       patitas: 0,   xp: 50,  bolas: 0, esCarta: true, michiId: 'negro'     },
    { id: 'carta_blanco',       nombre: '💌 Carta de Blanco',            emoji: '📩', condicion: (s) => s.cartas.includes('blanco'),      patitas: 0,   xp: 50,  bolas: 0, esCarta: true, michiId: 'blanco'    },
    { id: 'carta_gris',         nombre: '💌 Carta de Gris',              emoji: '📩', condicion: (s) => s.cartas.includes('gris'),        patitas: 0,   xp: 50,  bolas: 0, esCarta: true, michiId: 'gris'      },
    { id: 'carta_calica',       nombre: '💌 Carta de Calica',            emoji: '📩', condicion: (s) => s.cartas.includes('calica'),      patitas: 0,   xp: 50,  bolas: 0, esCarta: true, michiId: 'calica'    },
    { id: 'carta_azul',         nombre: '💌 Carta de Azul',              emoji: '📩', condicion: (s) => s.cartas.includes('azul'),        patitas: 0,   xp: 50,  bolas: 0, esCarta: true, michiId: 'azul'      },
    { id: 'carta_tony',         nombre: '💌 Carta de Tony',              emoji: '📩', condicion: (s) => s.cartas.includes('tony'),        patitas: 0,   xp: 100, bolas: 0, esCarta: true, michiId: 'tony'      },
    { id: 'carta_sombra',       nombre: '💌 Carta de Sombra',            emoji: '📩', condicion: (s) => s.cartas.includes('sombra'),      patitas: 0,   xp: 100, bolas: 0, esCarta: true, michiId: 'sombra'    },
    { id: 'carta_pachon',       nombre: '💌 Carta de Pachón',            emoji: '📩', condicion: (s) => s.cartas.includes('pachon'),      patitas: 0,   xp: 100, bolas: 0, esCarta: true, michiId: 'pachon'    },
    { id: 'carta_vikingo',      nombre: '💌 Carta de Vikingo',           emoji: '📩', condicion: (s) => s.cartas.includes('vikingo'),     patitas: 0,   xp: 100, bolas: 0, esCarta: true, michiId: 'vikingo'   },
    { id: 'racha_3',            nombre: 'Racha de 3 días',                emoji: '🔥', condicion: (s) => s.rachaMaxima >= 3,              patitas: 15,  xp: 30,  bolas: 0 },
    { id: 'racha_7',            nombre: 'Racha de 7 días',                emoji: '🔥', condicion: (s) => s.rachaMaxima >= 7,              patitas: 30,  xp: 60,  bolas: 0 },
    { id: 'racha_30',           nombre: 'Racha de 30 días',               emoji: '🔥', condicion: (s) => s.rachaMaxima >= 30,             patitas: 80,  xp: 150, bolas: 1 },
    { id: 'racha_90',           nombre: 'Racha de 90 días',               emoji: '🔥', condicion: (s) => s.rachaMaxima >= 90,             patitas: 150, xp: 300, bolas: 1 },
    { id: 'racha_365',          nombre: 'Racha de 365 días',              emoji: '🏆', condicion: (s) => s.rachaMaxima >= 365,            patitas: 500, xp: 1000,bolas: 2 },
    { id: 'act_50',             nombre: '50 actividades completadas',     emoji: '✅', condicion: (s) => s.actividadesCompletadas >= 50,  patitas: 30,  xp: 60,  bolas: 0 },
    { id: 'act_200',            nombre: '200 actividades completadas',    emoji: '✅', condicion: (s) => s.actividadesCompletadas >= 200, patitas: 80,  xp: 150, bolas: 0 },
    { id: 'act_500',            nombre: '500 actividades completadas',    emoji: '✅', condicion: (s) => s.actividadesCompletadas >= 500, patitas: 150, xp: 300, bolas: 0 },
    { id: 'dias_10',            nombre: '10 días 100% completados',       emoji: '💯', condicion: (s) => s.diasCompletados >= 10,         patitas: 40,  xp: 80,  bolas: 0 },
    { id: 'dias_30',            nombre: '30 días 100% completados',       emoji: '💯', condicion: (s) => s.diasCompletados >= 30,         patitas: 100, xp: 200, bolas: 0 },
    { id: 'agenda_recurrente',  nombre: 'Crear una agenda recurrente',    emoji: '↻', condicion: (s) => s.recurrentesCreadas >= 1,       patitas: 10,  xp: 20,  bolas: 0 },
    { id: 'emojis_5',           nombre: 'Personalizar 5 emojis',          emoji: '🎨', condicion: (s) => s.emojisCreados >= 5,            patitas: 15,  xp: 30,  bolas: 0 },
    { id: 'mes_1',              nombre: '1 mes usando la app',            emoji: '🗓️', condicion: (s) => s.diasAntiguedad >= 30,          patitas: 50,  xp: 100, bolas: 0 },
    { id: 'mes_6',              nombre: '6 meses usando la app',          emoji: '🗓️', condicion: (s) => s.diasAntiguedad >= 180,         patitas: 150, xp: 300, bolas: 0 },
    { id: 'anio_1',             nombre: '1 año usando la app',            emoji: '🗓️', condicion: (s) => s.diasAntiguedad >= 365,         patitas: 400, xp: 800, bolas: 1 },
];

function cargarLogrosDesbloqueados() { return JSON.parse(localStorage.getItem('michi-logros') || '[]'); }

function guardarLogrosDesbloqueados(logros) {
    localStorage.setItem('michi-logros', JSON.stringify(logros));
    if (usuarioActual) guardarLogrosNube(usuarioActual.uid, logros).catch(() => {});
}

function obtenerEstadisticas() {
    const wallet = cargarWallet();
    const agendas = cargarAgendas();
    const emojis = cargarEmojisCustom();
    const recurrentes = cargarRecurrentes();
    const coleccion = cargarColeccionMichis();
    const cartas = cargarCartas();
    const todosChecks = JSON.parse(localStorage.getItem('michi-checks') || '{}');
    let actividadesCompletadas = 0, diasCompletados = 0;
    Object.keys(todosChecks).forEach(fechaKey => {
        const checks = todosChecks[fechaKey];
        const completadasEnDia = Object.values(checks).filter(v => v === true).length;
        actividadesCompletadas += completadasEnDia;
        const agenda = agendas.find(a => a.fechaKey === fechaKey);
        if (agenda) {
            const { fijas } = parsearActividades(agenda.texto);
            if (fijas.length > 0 && completadasEnDia >= fijas.length) diasCompletados++;
        }
    });
    return {
        agendasCreadas: agendas.length,
        actividadesCompletadas,
        diasCompletados,
        emojisCreados: emojis.length,
        recurrentesCreadas: recurrentes.length,
        rachaMaxima: wallet.rachaMaxima || 0,
        diasAntiguedad: diasDesdeRegistro(wallet),
        michisColeccion: coleccion.length,
        michisBasicos: coleccion.filter(m => !m.tipo || m.tipo === 'basico').length,
        michisNivel10: coleccion.filter(m => m.tipo === 'nivel10').length,
        cartas,
    };
}

function revisarLogrosNuevos() {
    const stats = obtenerEstadisticas();
    const desbloqueados = cargarLogrosDesbloqueados();
    let wallet = cargarWallet();
    let huboNuevos = false;
    LOGROS_DEFINICION.forEach(logro => {
        if (desbloqueados.includes(logro.id)) return;
        if (logro.condicion(stats)) {
            desbloqueados.push(logro.id);
            huboNuevos = true;
            if (logro.patitas > 0) wallet.patitas += logro.patitas;
            if (logro.xp > 0) wallet.xp = (wallet.xp || 0) + logro.xp;
            if (logro.bolas > 0) wallet.bolasDePelo = (wallet.bolasDePelo || 0) + logro.bolas;
            if (!logro.esCarta) { sonidoLogro(); mostrarToastPatitas(logro.patitas, `🏆 Logro: ${logro.nombre}`); }
        }
    });
    if (huboNuevos) { guardarLogrosDesbloqueados(desbloqueados); guardarWallet(wallet); renderBadgeWallet(); }
}

function renderListaLogros() {
    const desbloqueados = cargarLogrosDesbloqueados();
    const cartas = cargarCartas();
    const cont = document.getElementById('lista-logros');
    if (!cont) return;
    const ordenados = [...LOGROS_DEFINICION].sort((a, b) => {
        const aD = desbloqueados.includes(a.id), bD = desbloqueados.includes(b.id);
        return aD === bD ? 0 : aD ? -1 : 1;
    });
    cont.innerHTML = ordenados.map(logro => {
        const desb = desbloqueados.includes(logro.id);
        if (logro.esCarta) {
            const cartaAbierta = cartas.includes(logro.michiId);
            return `<div class="logro-item carta-logro ${desb ? 'desbloqueado' : 'bloqueado'}"
                ${desb ? `onclick="abrirCarta('${logro.michiId}')" style="cursor:pointer"` : ''}>
                <span class="logro-emoji">${desb ? (cartaAbierta ? '💌' : '📩') : '📩'}</span>
                <div class="logro-info">
                    <div class="logro-nombre">${desb ? logro.nombre : '📩 Carta secreta — sube tu michi al Nivel 4'}</div>
                    <div class="logro-recompensa">${desb ? (cartaAbierta ? 'Toca para releer 💌' : 'Sobre cerrado...') : '🔒 Bloqueado'}</div>
                </div>
                ${desb ? '<span class="logro-check">✅</span>' : ''}
            </div>`;
        }
        return `<div class="logro-item ${desb ? 'desbloqueado' : 'bloqueado'}">
            <span class="logro-emoji">${desb ? logro.emoji : '🔒'}</span>
            <div class="logro-info">
                <div class="logro-nombre">${logro.nombre}</div>
                <div class="logro-recompensa">
                    ${logro.patitas > 0 ? `🐾 +${logro.patitas} ` : ''}
                    ${logro.xp > 0 ? `⭐ +${logro.xp} XP ` : ''}
                    ${logro.bolas > 0 ? `🧶 +${logro.bolas}` : ''}
                </div>
            </div>
            ${desb ? '<span class="logro-check">✅</span>' : ''}
        </div>`;
    }).join('');
}

// ── WALLET ────────────────────────────────────────────
function cargarWallet() {
    const guardado = localStorage.getItem('michi-wallet');
    if (guardado) return JSON.parse(guardado);
    return {
        patitas: 0, bolasDePelo: 0, xp: 0,
        ultimoLogin: null, rachaActual: 0, rachaMaxima: 0,
        fechaRegistro: formatearFechaKey(new Date()),
        diaCompletadoHoy: false, michiFreezes: 0,
        ultimoFreezeOtorgado: 0, primeraAgendaCreada: false
    };
}

function guardarWallet(wallet) {
    localStorage.setItem('michi-wallet', JSON.stringify(wallet));
    if (usuarioActual) guardarWalletNube(usuarioActual.uid, wallet).catch(() => {});
}

function diasDesdeRegistro(wallet) {
    if (!wallet.fechaRegistro) return 999;
    const inicio = new Date(wallet.fechaRegistro + 'T00:00:00');
    const hoy = new Date(formatearFechaKey(new Date()) + 'T00:00:00');
    return Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
}

function enLunaDeMiel(wallet) { return diasDesdeRegistro(wallet) < 7; }

function otorgarPatitas(wallet, cantidad, motivo, xpExtra) {
    wallet.patitas += cantidad;
    if (xpExtra) wallet.xp = (wallet.xp || 0) + xpExtra;
    mostrarToastPatitas(cantidad, motivo);
}

function mostrarToastPatitas(cantidad, motivo) {
    if (cantidad > 0) sonidoPatitas();
    const toast = document.createElement('div');
    toast.className = 'toast-patitas';
    toast.innerHTML = `${cantidad > 0 ? `🐾 +${cantidad} patitas<br>` : ''}<span class="toast-motivo">${motivo}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('mostrar'), 50);
    setTimeout(() => { toast.classList.remove('mostrar'); setTimeout(() => toast.remove(), 400); }, 2800);
}

function revisarBolasQuincenales(wallet) {
    const bloquesDe15 = Math.floor(diasDesdeRegistro(wallet) / 15);
    const bolasYaOtorgadas = wallet.ultimaBolaPorQuincena || 0;
    if (bloquesDe15 > bolasYaOtorgadas) {
        const nuevas = bloquesDe15 - bolasYaOtorgadas;
        wallet.bolasDePelo = (wallet.bolasDePelo || 0) + nuevas;
        wallet.ultimaBolaPorQuincena = bloquesDe15;
        mostrarToastPatitas(0, `🧶 ¡Ganaste ${nuevas} Bola${nuevas > 1 ? 's' : ''} de Pelo por tu constancia!`);
    }
}

function revisarBolasRacha(wallet) {
    const bloquesDe30 = Math.floor((wallet.rachaActual || 0) / 30);
    const bolasYaOtorgadas = wallet.ultimaBolaPorRacha || 0;
    if (bloquesDe30 > bolasYaOtorgadas) {
        const nuevas = bloquesDe30 - bolasYaOtorgadas;
        wallet.bolasDePelo = (wallet.bolasDePelo || 0) + nuevas;
        wallet.ultimaBolaPorRacha = bloquesDe30;
        mostrarToastPatitas(0, `🧶 ¡Ganaste ${nuevas} Bola${nuevas > 1 ? 's' : ''} de Pelo por tu racha!`);
    }
}

function procesarLoginDiario() {
    let wallet = cargarWallet();
    const hoyKey = formatearFechaKey(new Date());
    if (!wallet.fechaRegistro) wallet.fechaRegistro = hoyKey;
    if (wallet.xp === undefined) wallet.xp = 0;
    if (wallet.michiFreezes === undefined) wallet.michiFreezes = 0;
    if (wallet.ultimoFreezeOtorgado === undefined) wallet.ultimoFreezeOtorgado = 0;
    if (wallet.bolasDePelo === undefined) wallet.bolasDePelo = 0;

    if (wallet.ultimoLogin === hoyKey) { guardarWallet(wallet); renderBadgeWallet(); return; }

    const lunaDeMiel = enLunaDeMiel(wallet);
    const ayer = formatearFechaKey(sumarDias(new Date(), -1));
    const seRompioRacha = wallet.ultimoLogin !== null && wallet.ultimoLogin !== ayer;

    if (seRompioRacha && wallet.michiFreezes > 0) {
        wallet.michiFreezes -= 1;
        mostrarToastPatitas(0, '🧊 Tu michi protegió tu racha con un Michi Freeze');
    } else if (wallet.ultimoLogin === ayer) {
        wallet.rachaActual += 1;
    } else if (wallet.ultimoLogin === null) {
        wallet.rachaActual = 1;
    } else {
        wallet.rachaActual = 1;
        wallet.ultimaBolaPorRacha = 0;
    }

    if (wallet.rachaActual > wallet.rachaMaxima) wallet.rachaMaxima = wallet.rachaActual;

    const xpAntes = wallet.xp || 0;
    const nivelAntes = calcularNivelDesdeXP(xpAntes).nivel;

    if (wallet.ultimoLogin === null) {
        otorgarPatitas(wallet, 50, '¡Bienvenida de tu michi! 🐱', 50);
    } else {
        otorgarPatitas(wallet, lunaDeMiel ? 20 : 10, 'Por entrar hoy', 15);
    }

    if (wallet.rachaActual === 7) otorgarPatitas(wallet, 50, '¡7 días seguidos!', 100);
    else if (wallet.rachaActual === 30) otorgarPatitas(wallet, 100, '¡30 días seguidos!', 250);
    else if (wallet.rachaActual > 30 && wallet.rachaActual % 30 === 0) otorgarPatitas(wallet, 80, `¡${wallet.rachaActual} días seguidos!`, 200);

    revisarBolasRacha(wallet);
    revisarBolasQuincenales(wallet);

    const nivelDespues = calcularNivelDesdeXP(wallet.xp || 0).nivel;
    if (nivelDespues > nivelAntes) {
        sonidoNivel();
        mostrarToastPatitas(0, `🎉 ¡Subiste al Nivel ${nivelDespues}!`);
    }

    wallet.ultimoLogin = hoyKey;
    wallet.diaCompletadoHoy = false;
    guardarWallet(wallet);
    renderBadgeWallet();
    revisarLogrosNuevos();
}

function otorgarBonusDiaCompleto(fechaKey) {
    if (!esDiaActivo(fechaKey)) return;
    let wallet = cargarWallet();
    if (wallet.diaCompletadoHoy) return;
    const xpAntes = wallet.xp || 0;
    const nivelAntes = calcularNivelDesdeXP(xpAntes).nivel;
    wallet.diaCompletadoHoy = true;
    otorgarPatitas(wallet, enLunaDeMiel(wallet) ? 20 : 10, '¡Día 100% completado!', 25);

    if (!wallet.ultimaBolaPor7 || diasDesdeRegistro(wallet) - wallet.ultimaBolaPor7 >= 60) {
        if ((wallet.rachaActual || 0) >= 7) {
            wallet.bolasDePelo = (wallet.bolasDePelo || 0) + 1;
            wallet.ultimaBolaPor7 = diasDesdeRegistro(wallet);
            mostrarToastPatitas(0, '🧶 ¡Racha de 7 días con 100%! Bola de pelo ganada');
        }
    }

    const nivelDespues = calcularNivelDesdeXP(wallet.xp || 0).nivel;
    if (nivelDespues > nivelAntes) {
        sonidoNivel();
        mostrarToastPatitas(0, `🎉 ¡Subiste al Nivel ${nivelDespues}!`);
    }
    guardarWallet(wallet);
    renderBadgeWallet();
    revisarLogrosNuevos();
}

function renderBadgeWallet() {
    const wallet = cargarWallet();
    const badge = document.getElementById('badge-wallet');
    if (!badge) return;
    badge.innerHTML = `<span class="badge-item">🐾 ${wallet.patitas}</span><span class="badge-item">🧶 ${wallet.bolasDePelo}</span>`;
}

function mostrarWallet() {
    pantallaAnterior = 'pantalla-hoy';
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-wallet').classList.add('activa');
    renderPantallaWallet();
}

function renderPantallaWallet() {
    const wallet = cargarWallet();
    document.getElementById('wallet-saldo-patitas').textContent = wallet.patitas;
    document.getElementById('wallet-saldo-bolas').textContent = wallet.bolasDePelo;
    const { nivel, xpEnNivelActual, xpNecesariaNivelActual } = calcularNivelDesdeXP(wallet.xp || 0);
    document.getElementById('wallet-nivel-num').textContent = nivel;
    document.getElementById('wallet-nivel-xp').textContent = `${xpEnNivelActual} / ${xpNecesariaNivelActual} XP`;
    document.getElementById('wallet-nivel-fill').style.width = Math.min(100, Math.round((xpEnNivelActual / xpNecesariaNivelActual) * 100)) + '%';
    document.getElementById('wallet-racha-actual').textContent = wallet.rachaActual;
    document.getElementById('wallet-racha-maxima').textContent = wallet.rachaMaxima;
    document.getElementById('wallet-freezes').textContent = wallet.michiFreezes || 0;
    const michi = cargarMichi();
    const btnIrTienda = document.getElementById('btn-ir-tienda');
    if (btnIrTienda) michi ? btnIrTienda.classList.remove('oculto') : btnIrTienda.classList.add('oculto');
    renderListaLogros();
}

// ── NOTIFICACIONES ────────────────────────────────────
async function pedirPermisoNotificaciones() {
    if (!('Notification' in window) || Notification.permission !== 'default') return;
    await Notification.requestPermission();
}

function programarNotificaciones(fijas, fechaKey) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (fechaKey !== formatearFechaKey(new Date())) return;
    if (window._notifTimers) window._notifTimers.forEach(t => clearTimeout(t));
    window._notifTimers = [];
    const ahora = new Date();
    fijas.forEach(act => {
        const [h, m] = parsearHora(act.hora);
        if (h === 99) return;
        const horaAct = new Date(); horaAct.setHours(h, m, 0, 0);
        const msAviso = horaAct.getTime() - 15 * 60 * 1000 - ahora.getTime();
        const msHora = horaAct.getTime() - ahora.getTime();
        if (msAviso > 0) window._notifTimers.push(setTimeout(() => new Notification('🐱 Michi Agenda', { body: `En 15 min: ${act.actividad}` }), msAviso));
        if (msHora > 0) window._notifTimers.push(setTimeout(() => new Notification('🐱 Michi Agenda', { body: `¡Ahora! ${act.actividad}` }), msHora));
    });
}

// ── RECURRENTES ───────────────────────────────────────
const DIAS_MAP = { 'lunes':1,'martes':2,'miércoles':3,'miercoles':3,'jueves':4,'viernes':5,'sábado':6,'sabado':6,'domingo':0 };
const DIAS_NOMBRES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

function cargarRecurrentes() { return JSON.parse(localStorage.getItem('michi-recurrentes') || '[]'); }

function guardarRecurrentes(recurrentes) {
    localStorage.setItem('michi-recurrentes', JSON.stringify(recurrentes));
    if (usuarioActual) guardarRecurrentesNube(usuarioActual.uid, recurrentes).catch(() => {});
}

function parsearRecurrente(linea) {
    const match = linea.match(/^(.*?)\[(.+?)\]\s*$/);
    if (!match) return null;
    const diasStr = match[2].toLowerCase();
    let diasAplica = [];
    if (diasStr.includes('todos los días') || diasStr.includes('todos los dias') || diasStr.includes('diario')) diasAplica = [0,1,2,3,4,5,6];
    else if (diasStr.includes('entre semana') || diasStr.includes('dias habiles')) diasAplica = [1,2,3,4,5];
    else if (diasStr.includes('fines de semana') || diasStr.includes('fin de semana')) diasAplica = [0,6];
    else diasStr.split(',').forEach(d => { const dia = d.trim(); if (DIAS_MAP[dia] !== undefined) diasAplica.push(DIAS_MAP[dia]); });
    return { actividad: match[1].trim(), diasAplica };
}

function obtenerActividadesRecurrentesParaDia(fecha) {
    return cargarRecurrentes().filter(r => r.diasAplica.includes(fecha.getDay())).map(r => r.actividad);
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
        return nuevas.length === 0 ? agendaExistente.texto : agendaExistente.texto + '\n' + nuevas.join('\n');
    }
    return recurrentes.join('\n');
}

function renderRecurrentesConfig() {
    const recurrentes = cargarRecurrentes();
    const lista = document.getElementById('lista-recurrentes-config');
    if (!lista) return;
    lista.innerHTML = recurrentes.length === 0
        ? '<li style="color:#4b5563;font-style:italic;font-size:0.82rem;padding:6px 0">Sin actividades recurrentes todavía 🐾</li>'
        : recurrentes.map((r, idx) => `<li class="recurrente-item">
            <div class="recurrente-info">
                <div class="recurrente-actividad">${obtenerIcono(r.actividad)} ${r.actividad}</div>
                <div class="recurrente-dias">↻ ${r.diasAplica.sort((a,b)=>a-b).map(d => DIAS_NOMBRES[d]).join(', ')}</div>
            </div>
            <button class="btn-borrar-recurrente" onclick="borrarRecurrente(${idx})">✕</button>
        </li>`).join('');
}

function borrarRecurrente(idx) {
    const recurrentes = cargarRecurrentes();
    recurrentes.splice(idx, 1);
    guardarRecurrentes(recurrentes);
    renderRecurrentesConfig();
}

// ── CHECKS ────────────────────────────────────────────
function cargarChecks(fechaKey) {
    return JSON.parse(localStorage.getItem('michi-checks') || '{}')[fechaKey] || {};
}

function guardarChecks(fechaKey, checks) {
    const todos = JSON.parse(localStorage.getItem('michi-checks') || '{}');
    todos[fechaKey] = checks;
    localStorage.setItem('michi-checks', JSON.stringify(todos));
    if (usuarioActual) guardarChecksNube(usuarioActual.uid, todos).catch(() => {});
}

function esDiaActivo(fechaKey) { return fechaKey === formatearFechaKey(new Date()); }

function toggleCheck(fechaKey, checkKey) {
    if (!esDiaActivo(fechaKey)) return;
    const checks = cargarChecks(fechaKey);
    checks[checkKey] = !checks[checkKey];
    if (checks[checkKey]) sonidoCheck();
    guardarChecks(fechaKey, checks);
    const agenda = cargarAgendas().find(a => a.fechaKey === fechaKey);
    const textoConRec = obtenerTextoConRecurrentes(new Date(fechaKey + 'T12:00:00'));
    const texto = textoConRec || (agenda ? agenda.texto : '');
    if (texto) {
        const { fijas } = parsearActividades(texto);
        if (calcularPorcentaje(fijas, fechaKey) === 100) otorgarBonusDiaCompleto(fechaKey);
    }
    revisarLogrosNuevos();
    mostrarHoy();
    if (document.getElementById('pantalla-dashboard').classList.contains('activa') && fechaDashboard && texto)
        document.getElementById('contenido-dashboard').innerHTML = renderDiario(parsearActividades(texto), fechaKey);
}

function calcularPorcentaje(fijas, fechaKey) {
    if (!fijas || fijas.length === 0) return 0;
    const checks = cargarChecks(fechaKey);
    return Math.round(fijas.filter(act => checks[act.actividad + act.hora]).length / fijas.length * 100);
}

function mensajeMichi(porcentaje) {
    if (porcentaje === 0) return null;
    if (porcentaje <= 20) return '¡Cada día es una nueva oportunidad, humano! 🐾';
    if (porcentaje <= 50) return '¡Sigue así humano, estás cada vez más cerca! 💪';
    if (porcentaje <= 80) return '¡Casi lo logras humano! Estoy muy orgulloso 😸';
    return '¡Eres increíble humano! Mereces un premio 🎉';
}

// ── PENDIENTES ────────────────────────────────────────
function cargarPendientes() { return JSON.parse(localStorage.getItem('michi-pendientes') || '[]'); }

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
    guardarPendientes(cargarPendientes().filter(p => p.id !== id));
    renderPendientes();
}

function renderPendientes() {
    const pendientes = cargarPendientes();
    const lista = document.getElementById('lista-pendientes');
    if (!lista) return;
    lista.innerHTML = pendientes.length === 0
        ? '<li style="color:#4b5563;font-style:italic;font-size:0.78rem;padding:6px 0">Sin pendientes 🐾</li>'
        : pendientes.map(p => `
            <li class="pendiente-item ${p.completado ? 'completado' : ''}">
                <span class="pendiente-texto" onclick="togglePendiente('${p.id}')">${p.completado ? '✅' : '⬜'} ${p.texto}</span>
                <button class="btn-borrar-pendiente" onclick="borrarPendiente('${p.id}')">✕</button>
            </li>`).join('');
}

// ── EMOJIS ────────────────────────────────────────────
function cargarEmojisCustom() { return JSON.parse(localStorage.getItem('michi-emojis-custom') || '[]'); }

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
    if (existente !== -1) emojis[existente].emoji = emoji;
    else emojis.unshift({ id: Date.now().toString(), palabra, emoji });
    guardarEmojisCustom(emojis);
    document.getElementById('input-palabra').value = '';
    document.getElementById('input-emoji').value = '';
    renderEmojisCustom();
    revisarLogrosNuevos();
}

function borrarEmojiCustom(id) { guardarEmojisCustom(cargarEmojisCustom().filter(e => e.id !== id)); renderEmojisCustom(); }

function renderEmojisCustom() {
    const emojis = cargarEmojisCustom();
    const lista = document.getElementById('lista-emojis-custom');
    if (!lista) return;
    lista.innerHTML = emojis.length === 0
        ? '<li style="color:#4b5563;font-style:italic;font-size:0.82rem;padding:6px 0">Sin emojis personalizados todavía 🐾</li>'
        : emojis.map(e => `
            <li class="emoji-custom-item">
                <span class="emoji-custom-icono">${e.emoji}</span>
                <span class="emoji-custom-flecha">←</span>
                <span class="emoji-custom-palabra">${e.palabra}</span>
                <button class="btn-borrar-emoji" onclick="borrarEmojiCustom('${e.id}')">✕</button>
            </li>`).join('');
}

// ── ICONOS ────────────────────────────────────────────
function obtenerIcono(nombre) {
    const n = nombre.toLowerCase();
    const emojisCustom = cargarEmojisCustom();
    for (const ec of emojisCustom) { if (n.includes(ec.palabra)) return ec.emoji; }
    if (n.includes('gym') || n.includes('gimnasio') || n.includes('pesas') || n.includes('entren')) return '💪';
    if (n.includes('correr') || n.includes('jogging') || n.includes('trotar')) return '🏃';
    if (n.includes('nadar') || n.includes('natación') || n.includes('alberca')) return '🏊';
    if (n.includes('bici') || n.includes('ciclismo')) return '🚴';
    if (n.includes('futbol') || n.includes('fútbol') || n.includes('soccer')) return '⚽';
    if (n.includes('basquet') || n.includes('basketball')) return '🏀';
    if (n.includes('tenis') || n.includes('pádel') || n.includes('padel')) return '🎾';
    if (n.includes('yoga') || n.includes('meditación') || n.includes('meditar') || n.includes('pilates')) return '🧘';
    if (n.includes('boxeo') || n.includes('box') || n.includes('karate')) return '🥊';
    if (n.includes('caminar') || n.includes('caminata') || n.includes('paseo')) return '🚶';
    if (n.includes('ejercicio') || n.includes('deporte') || n.includes('entrenar')) return '🏋️';
    if (n.includes('desayuno') || n.includes('breakfast')) return '🍳';
    if (n.includes('almuerzo') || n.includes('lunch') || n.includes('comer') || n.includes('comida')) return '🍽️';
    if (n.includes('cena') || n.includes('cenar') || n.includes('dinner')) return '🌮';
    if (n.includes('café') || n.includes('cafe') || n.includes('coffee')) return '☕';
    if (n.includes('pizza') || n.includes('hamburguesa') || n.includes('tacos')) return '🍕';
    if (n.includes('sushi') || n.includes('ramen')) return '🍱';
    if (n.includes('postre') || n.includes('pastel') || n.includes('helado')) return '🍰';
    if (n.includes('bar') || n.includes('cerveza') || n.includes('bebida') || n.includes('copa')) return '🍺';
    if (n.includes('agua') || n.includes('jugo') || n.includes('smoothie')) return '🥤';
    if (n.includes('doctor') || n.includes('médico') || n.includes('medico') || n.includes('hospital')) return '🏥';
    if (n.includes('dentista') || n.includes('dental')) return '🦷';
    if (n.includes('medicina') || n.includes('medicinas') || n.includes('pastilla') || n.includes('farmacia')) return '💊';
    if (n.includes('terapia') || n.includes('psicólogo') || n.includes('psicologo')) return '🧠';
    if (n.includes('vacuna') || n.includes('inyección')) return '💉';
    if (n.includes('trabajo') || n.includes('trabajar') || n.includes('oficina') || n.includes('chamba')) return '💼';
    if (n.includes('reunión') || n.includes('reunion') || n.includes('junta') || n.includes('meeting') || n.includes('zoom')) return '👥';
    if (n.includes('presentación') || n.includes('presentacion') || n.includes('pitch')) return '📊';
    if (n.includes('entrevista')) return '🤝';
    if (n.includes('cliente') || n.includes('ventas')) return '💰';
    if (n.includes('correo') || n.includes('email')) return '📧';
    if (n.includes('escuela') || n.includes('colegio') || n.includes('prepa')) return '🏫';
    if (n.includes('universidad') || n.includes('facultad')) return '🎓';
    if (n.includes('clase') || n.includes('clases') || n.includes('curso') || n.includes('taller')) return '📚';
    if (n.includes('estudiar') || n.includes('tarea') || n.includes('examen')) return '✏️';
    if (n.includes('super') || n.includes('supermercado') || n.includes('mercado') || n.includes('mandado')) return '🛒';
    if (n.includes('compras') || n.includes('comprar') || n.includes('tienda') || n.includes('mall')) return '🛍️';
    if (n.includes('banco') || n.includes('cajero') || n.includes('pago') || n.includes('pagar')) return '🏦';
    if (n.includes('trámite') || n.includes('tramite') || n.includes('ine') || n.includes('sat')) return '🏛️';
    if (n.includes('gasolina') || n.includes('gasolinera') || n.includes('gas')) return '⛽';
    if (n.includes('manejar') || n.includes('carro') || n.includes('auto') || n.includes('coche')) return '🚗';
    if (n.includes('uber') || n.includes('taxi') || n.includes('didi')) return '🚕';
    if (n.includes('metro') || n.includes('metrobús') || n.includes('camión') || n.includes('bus')) return '🚌';
    if (n.includes('avión') || n.includes('avion') || n.includes('vuelo') || n.includes('aeropuerto')) return '✈️';
    if (n.includes('salir') || n.includes('llegar') || n.includes('casa')) return '🏠';
    if (n.includes('barrer') || n.includes('trapear') || n.includes('limpiar') || n.includes('limpieza')) return '🧹';
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
    if (n.includes('música') || n.includes('musica') || n.includes('guitarra') || n.includes('piano')) return '🎵';
    if (n.includes('videojuego') || n.includes('gaming') || n.includes('xbox') || n.includes('playstation')) return '🎮';
    if (n.includes('leer') || n.includes('libro') || n.includes('lectura')) return '📖';
    if (n.includes('netflix') || n.includes('serie') || n.includes('streaming')) return '📺';
    if (n.includes('viaje') || n.includes('viajar') || n.includes('vacaciones') || n.includes('hotel')) return '🧳';
    if (n.includes('playa') || n.includes('mar')) return '🏖️';
    if (n.includes('montaña') || n.includes('senderismo') || n.includes('hiking')) return '🏔️';
    if (n.includes('corte') || n.includes('cabello') || n.includes('pelo') || n.includes('peluquería')) return '✂️';
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
    return ['azul', 'morado', 'rosa'][idx % 3];
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
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function sumarDias(date, dias) {
    const d = new Date(date); d.setDate(d.getDate() + dias); return d;
}

// ── STORAGE ───────────────────────────────────────────
function cargarAgendas() { return JSON.parse(localStorage.getItem('michi-agendas') || '[]'); }
function guardarAgendas(agendas) { localStorage.setItem('michi-agendas', JSON.stringify(agendas)); }

// ── PANTALLA HOY ──────────────────────────────────────
function mostrarHoy() {
    const hoy = new Date();
    const fechaKey = formatearFechaKey(hoy);
    const agendas = cargarAgendas();
    const agendaHoy = agendas.find(a => a.fechaKey === fechaKey);
    document.getElementById('titulo-hoy').textContent = formatearFechaDisplay(hoy);
    const textoConRec = obtenerTextoConRecurrentes(hoy);

    if (agendaHoy || textoConRec) {
        agendaViendoId = agendaHoy ? agendaHoy.id : null;
        const texto = textoConRec || agendaHoy.texto;
        const { fijas } = parsearActividades(texto);
        document.getElementById('contenido-hoy').innerHTML = renderTimelineHoy(fijas, hoy, fechaKey);
        const porcentaje = calcularPorcentaje(fijas, fechaKey);
        const mensaje = mensajeMichi(porcentaje);
        document.getElementById('contenido-progreso').innerHTML = fijas.length > 0 ? `
            <div class="progreso-box">
                <div class="progreso-header">
                    <span class="progreso-label">Progreso del día</span>
                    <span class="progreso-pct">${porcentaje}%</span>
                </div>
                <div class="progreso-barra"><div class="progreso-fill" style="width:${porcentaje}%"></div></div>
                ${mensaje ? `<div class="progreso-mensaje">🐱 ${mensaje}</div>` : ''}
            </div>` : '';
        programarNotificaciones(fijas, fechaKey);
    } else {
        agendaViendoId = null;
        document.getElementById('contenido-hoy').innerHTML = renderHorasVacias(hoy);
        document.getElementById('contenido-progreso').innerHTML = '';
    }

    renderMichiHome();
    renderSemanaStrip();
    renderPendientes();
    renderBadgeWallet();
    if (usuarioActual) {
        const configUsuario = document.getElementById('config-usuario');
        if (configUsuario) configUsuario.textContent = usuarioActual.email || usuarioActual.displayName || '—';
    }
}

function renderTimelineHoy(fijas, hoy, fechaKey) {
    const ahoraH = hoy.getHours(), ahoraM = hoy.getMinutes();
    let proximaIdx = -1;
    for (let i = 0; i < fijas.length; i++) {
        const [h, m] = parsearHora(fijas[i].hora);
        if (h > ahoraH || (h === ahoraH && m >= ahoraM)) { proximaIdx = i; break; }
    }
    let inicio = 0;
    if (proximaIdx > 1) inicio = proximaIdx - 1;
    if (inicio + 4 > fijas.length) inicio = Math.max(0, fijas.length - 4);
    const visibles = fijas.slice(inicio, inicio + 4);
    const checks = cargarChecks(fechaKey);
    const activo = esDiaActivo(fechaKey);
    return `<div class="timeline-hoy">${visibles.map((act, idx) => {
        const realIdx = inicio + idx;
        const icono = obtenerIcono(act.actividad);
        const clase = obtenerClase(icono, realIdx);
        const esProxima = realIdx === proximaIdx;
        const esUltimo = idx === visibles.length - 1;
        const checkKey = act.actividad + act.hora;
        const completada = checks[checkKey];
        return `<div class="timeline-item ${esProxima && !completada ? 'proxima' : ''} ${completada ? 'completada' : ''}">
            <div class="timeline-left">
                <div class="tl-circle ${clase} ${completada ? 'tl-circle-done' : ''}">${completada ? '✅' : icono}</div>
                ${!esUltimo ? '<div class="tl-line"></div>' : ''}
            </div>
            <div class="tl-content">
                <div class="tl-hora">${act.hora} ${esProxima && !completada ? '<span class="tag-proxima">próxima</span>' : ''}</div>
                <div class="tl-nombre ${completada ? 'tl-nombre-done' : ''}">${act.actividad}</div>
            </div>
            ${activo ? `<button class="btn-check ${completada ? 'checked' : ''}" onclick="toggleCheck('${fechaKey}', '${checkKey}')">${completada ? '✓' : '○'}</button>` : ''}
        </div>`;
    }).join('')}</div>`;
}

function renderHorasVacias(hoy) {
    const ahoraH = hoy.getHours();
    let items = '';
    for (let i = 0; i < 3; i++) {
        const h = ahoraH + i;
        if (h > 23) break;
        const hora = `${String(h).padStart(2,'0')}:00`;
        items += `<div class="timeline-item">
            <div class="timeline-left">
                <div class="tl-circle vacio"></div>
                ${i < 2 ? '<div class="tl-line tl-line-vacia"></div>' : ''}
            </div>
            <div class="tl-content">
                <div class="tl-hora">${hora}</div>
                <div class="tl-nombre tl-vacio">Sin actividad</div>
            </div>
        </div>`;
    }
    return `<div class="timeline-hoy">${items}</div>
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
        if (agenda) emoji = obtenerIcono(extraerActividad(agenda.texto.split('\n').find(l => l.trim()) || ''));
        else if (tieneRec) emoji = obtenerIcono(extraerActividad(obtenerActividadesRecurrentesParaDia(dia)[0]));
        html += `<div class="dia-strip${i === 0 ? ' hoy' : ''}${agenda || tieneRec ? ' tiene-agenda' : ''}" onclick="seleccionarDiaStrip('${fechaKey}', ${!!(agenda || tieneRec)})">
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
        document.getElementById('contenido-dashboard').innerHTML = renderDiario(parsearActividades(textoConRec || agenda.texto), fechaKey);
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
        document.getElementById('contenido-dashboard').innerHTML = renderDiario(parsearActividades(textoConRec || agenda.texto), fechaKey);
    } else {
        document.getElementById('contenido-dashboard').innerHTML = `
            <div style="text-align:center; padding: 40px 20px; color: #6b7280;">
                <p style="font-size:2rem; margin-bottom:12px">📭</p>
                <p>Sin agenda para este día</p>
                <button class="btn-crear-hoy" style="margin-top:16px" onclick="mostrarEditor('${fechaKey}')">+ Crear agenda</button>
            </div>`;
    }
}

// ── CALENDARIO ────────────────────────────────────────
function abrirCalendario() { mesActualCal = new Date(); renderCalendario(); document.getElementById('modal-calendario').classList.remove('oculto'); }
function cerrarCalendario(event) { if (event.target.id === 'modal-calendario') document.getElementById('modal-calendario').classList.add('oculto'); }
function cambiarMes(delta) { mesActualCal.setMonth(mesActualCal.getMonth() + delta); renderCalendario(); }

function renderCalendario() {
    const hoy = new Date();
    const año = mesActualCal.getFullYear(), mes = mesActualCal.getMonth();
    const agendas = cargarAgendas();
    document.getElementById('titulo-mes').textContent = mesActualCal.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();
    let html = '';
    for (let i = 0; i < primerDia; i++) html += '<div class="cal-dia vacio"></div>';
    for (let d = 1; d <= diasEnMes; d++) {
        const fecha = new Date(año, mes, d);
        const fechaKey = formatearFechaKey(fecha);
        const agenda = agendas.find(a => a.fechaKey === fechaKey);
        const tieneRec = obtenerActividadesRecurrentesParaDia(fecha).length > 0;
        let emoji = '';
        if (agenda) emoji = `<div class="cal-dia-emoji">${obtenerIcono(extraerActividad(agenda.texto.split('\n').find(l => l.trim()) || ''))}</div>`;
        else if (tieneRec) emoji = `<div class="cal-dia-emoji">${obtenerIcono(extraerActividad(obtenerActividadesRecurrentesParaDia(fecha)[0]))}</div>`;
        html += `<div class="cal-dia${esMismaFecha(fecha,hoy)?' hoy':''}${agenda||tieneRec?' tiene-agenda':''}" onclick="seleccionarDiaCalendario('${fechaKey}',${!!(agenda||tieneRec)})"><div class="cal-dia-num">${d}</div>${emoji}</div>`;
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
        document.getElementById('contenido-dashboard').innerHTML = renderDiario(parsearActividades(textoConRec || agenda.texto), fechaKey);
    } else {
        mostrarEditor(fechaKey);
    }
}

// ── MINI CALENDARIO ───────────────────────────────────
function toggleCalendario() {
    const cal = document.getElementById('mini-calendario');
    cal.classList.toggle('oculto');
    if (!cal.classList.contains('oculto')) { mesActualMini = new Date(fechaSeleccionada); renderMiniCalendario(); }
}

function cambiarMesMini(delta) { mesActualMini.setMonth(mesActualMini.getMonth() + delta); renderMiniCalendario(); }

function renderMiniCalendario() {
    const hoy = new Date();
    const año = mesActualMini.getFullYear(), mes = mesActualMini.getMonth();
    document.getElementById('mini-mes-titulo').textContent = mesActualMini.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();
    let html = '';
    for (let i = 0; i < primerDia; i++) html += '<div class="mini-dia vacio"></div>';
    for (let d = 1; d <= diasEnMes; d++) {
        const fecha = new Date(año, mes, d);
        html += `<div class="mini-dia${esMismaFecha(fecha,hoy)?' hoy':''}${esMismaFecha(fecha,fechaSeleccionada)?' seleccionado':''}" onclick="seleccionarFecha(${año},${mes},${d})">${d}</div>`;
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
    display.textContent = esMismaFecha(fechaSeleccionada, hoy)
        ? 'Hoy — ' + formatearFechaDisplay(fechaSeleccionada)
        : formatearFechaDisplay(fechaSeleccionada);
}

// ── NAVEGACIÓN ────────────────────────────────────────
function mostrarConfig() {
    pantallaAnterior = 'pantalla-hoy';
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-config').classList.add('activa');
    renderEmojisCustom();
    renderFrasesCustom();
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
    const recurrentesNuevas = [], lineasNormales = [];
    lineas.forEach(linea => {
        linea = linea.trim();
        if (!linea) return;
        const rec = parsearRecurrente(linea);
        if (rec && rec.diasAplica.length > 0) { recurrentesNuevas.push(rec); lineasNormales.push(linea.replace(/\[.+?\]/, '').trim()); }
        else lineasNormales.push(linea);
    });
    if (recurrentesNuevas.length > 0) {
        const recActuales = cargarRecurrentes();
        recurrentesNuevas.forEach(nueva => {
            const existente = recActuales.findIndex(r => r.actividad === nueva.actividad);
            if (existente !== -1) recActuales[existente] = nueva; else recActuales.push(nueva);
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
        if (idx !== -1) { agendas[idx].texto = textoFinal; agendas[idx].nombre = nombre; agendas[idx].fechaKey = fechaKey; agendaGuardada = agendas[idx]; }
        agendaViendoId = agendaEditandoId; agendaEditandoId = null;
    } else {
        const existente = agendas.findIndex(a => a.fechaKey === fechaKey);
        if (existente !== -1) { agendas[existente].texto = textoFinal; agendas[existente].nombre = nombre; agendaViendoId = agendas[existente].id; agendaGuardada = agendas[existente]; }
        else { const nueva = { id: Date.now().toString(), nombre, texto: textoFinal, fechaKey }; agendas.unshift(nueva); agendaViendoId = nueva.id; agendaGuardada = nueva; }
    }
    agendas.sort((a, b) => b.fechaKey.localeCompare(a.fechaKey));
    guardarAgendas(agendas);
    if (usuarioActual && agendaGuardada) guardarAgendaNube(usuarioActual.uid, agendaGuardada).catch(() => {});
    let wallet = cargarWallet();
    if (!wallet.primeraAgendaCreada) {
        wallet.primeraAgendaCreada = true;
        otorgarPatitas(wallet, enLunaDeMiel(wallet) ? 30 : 15, '¡Primera agenda creada!', 30);
        guardarWallet(wallet);
    }
    revisarLogrosNuevos();
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-hoy').classList.add('activa');
    mostrarHoy();
}

// ── PARSEAR Y RENDER ──────────────────────────────────
function extraerActividad(linea) {
    linea = linea.replace(/\[.+?\]/, '').trim();
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
        if (esLimpieza) { limpieza.push(linea); }
        else {
            const match = linea.match(/^(.*?)\s*[-–—]?\s*(\d{1,2}:\d{2}|\d{1,2})\s*$/);
            if (match) {
                let hora = match[2].trim();
                if (!hora.includes(':')) hora = hora + ':00';
                fijas.push({ actividad: match[1].trim().replace(/[-–—]\s*$/, ''), hora });
            } else { fijas.push({ actividad: linea, hora: '--:--' }); }
        }
    });
    fijas.sort((a, b) => { const [ah,am]=parsearHora(a.hora),[bh,bm]=parsearHora(b.hora); return ah!==bh?ah-bh:am-bm; });
    return { fijas, limpieza };
}

function renderDiario({ fijas, limpieza }, fechaKey) {
    const checks = cargarChecks(fechaKey);
    const activo = esDiaActivo(fechaKey);
    const porcentaje = calcularPorcentaje(fijas, fechaKey);
    const mensaje = mensajeMichi(porcentaje);
    const timelineItems = fijas.map((act, idx) => {
        const icono = obtenerIcono(act.actividad);
        const clase = obtenerClase(icono, idx);
        const esUltimo = idx === fijas.length - 1;
        const checkKey = act.actividad + act.hora;
        const completada = checks[checkKey];
        return `<div class="timeline-item ${completada ? 'completada' : ''}">
            <div class="timeline-left">
                <div class="tl-circle ${clase} ${completada ? 'tl-circle-done' : ''}">${completada ? '✅' : icono}</div>
                ${!esUltimo ? '<div class="tl-line"></div>' : ''}
            </div>
            <div class="tl-content">
                <div class="tl-hora">${act.hora}</div>
                <div class="tl-nombre ${completada ? 'tl-nombre-done' : ''}">${act.actividad}</div>
            </div>
            ${activo ? `<button class="btn-check ${completada ? 'checked' : ''}" onclick="toggleCheck('${fechaKey}', '${checkKey}')">${completada ? '✓' : '○'}</button>` : ''}
        </div>`;
    }).join('');
    const filas = fijas.map(act => {
        const checkKey = act.actividad + act.hora;
        const completada = checks[checkKey];
        return `<tr class="${completada ? 'fila-done' : ''}">
            <td class="time-cell">${act.hora}</td>
            <td>${completada ? '✅' : obtenerIcono(act.actividad)} <span class="${completada ? 'tl-nombre-done' : ''}">${act.actividad}</span></td>
        </tr>`;
    }).join('');
    const barraHTML = fijas.length > 0 ? `
        <div class="progreso-box">
            <div class="progreso-header"><span class="progreso-label">Progreso del día</span><span class="progreso-pct">${porcentaje}%</span></div>
            <div class="progreso-barra"><div class="progreso-fill" style="width:${porcentaje}%"></div></div>
            ${mensaje ? `<div class="progreso-mensaje">🐱 ${mensaje}</div>` : ''}
        </div>` : '';
    return `${barraHTML}
        <div class="dashboard-diario">
            <div class="panel"><h3>Línea de Tiempo</h3><div class="timeline-vertical">${timelineItems}</div></div>
            <div class="panel"><h3>Actividades</h3><table><thead><tr><th>Hora</th><th>Actividad</th></tr></thead><tbody>${filas}</tbody></table></div>
        </div>
        ${limpieza.length ? `<div class="panel" style="margin-top:15px"><h3>Tareas del Hogar</h3><ul style="padding-left:20px;line-height:2">${limpieza.map(t=>`<li>✨ ${t}</li>`).join('')}</ul></div>` : ''}`;
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
window.mostrarWallet = mostrarWallet;
window.mostrarTienda = mostrarTienda;
window.mostrarInventario = mostrarInventario;
window.cambiarTabInventario = cambiarTabInventario;
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
window.agregarFrasePersonalizada = agregarFrasePersonalizada;
window.borrarFraseCustom = borrarFraseCustom;
window.navegarDia = navegarDia;
window.borrarRecurrente = borrarRecurrente;
window.toggleCheck = toggleCheck;
window.tocarMichi = tocarMichi;
window.mostrarModalNombre = mostrarModalNombre;
window.confirmarNombreMichi = confirmarNombreMichi;
window.cerrarModalNombre = cerrarModalNombre;
window.comprarMichi = comprarMichi;
window.comprarMarco = comprarMarco;
window.comprarFreeze = comprarFreeze;
window.elegirAcompanante = elegirAcompanante;
window.subirNivelMichi = subirNivelMichi;
window.toggleNiveles = toggleNiveles;
window.abrirCarta = abrirCarta;
window.cerrarModalCarta = cerrarModalCarta;
window.usarMarco = usarMarco;