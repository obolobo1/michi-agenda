import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCFuV8l0coMro3iPh0S0JRmvuxwiRYB1vs",
    authDomain: "michi-agenda.firebaseapp.com",
    projectId: "michi-agenda",
    storageBucket: "michi-agenda.appspot.com",
    messagingSenderId: "456123290412",
    appId: "1:456123290412:web:3d662ba4f400d5bcc21289"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ── AUTH ──────────────────────────────────────────────
export async function registrarUsuario(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password);
}

export async function iniciarSesion(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function iniciarSesionGoogle() {
    return await signInWithPopup(auth, provider);
}

export async function cerrarSesion() {
    return await signOut(auth);
}

export function observarUsuario(callback) {
    onAuthStateChanged(auth, callback);
}

export async function recuperarContrasena(email) {
    return await sendPasswordResetEmail(auth, email);
}

// ── AGENDAS ───────────────────────────────────────────
export async function guardarAgendaNube(userId, agenda) {
    await setDoc(doc(db, 'usuarios', userId, 'agendas', agenda.fechaKey), agenda);
}

export async function cargarAgendasNube(userId) {
    const snap = await getDocs(collection(db, 'usuarios', userId, 'agendas'));
    return snap.docs.map(d => d.data());
}

export async function borrarAgendaNube(userId, fechaKey) {
    const { deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    await deleteDoc(doc(db, 'usuarios', userId, 'agendas', fechaKey));
}

// ── DATOS ─────────────────────────────────────────────
export async function guardarPendientesNube(userId, pendientes) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'pendientes'), { lista: pendientes });
}

export async function cargarPendientesNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'pendientes'));
    return snap.exists() ? snap.data().lista : [];
}

export async function guardarEmojisNube(userId, emojis) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'emojis'), { lista: emojis });
}

export async function cargarEmojisNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'emojis'));
    return snap.exists() ? snap.data().lista : [];
}

export async function guardarRecurrentesNube(userId, recurrentes) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'recurrentes'), { lista: recurrentes });
}

export async function cargarRecurrentesNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'recurrentes'));
    return snap.exists() ? snap.data().lista : [];
}

export async function guardarChecksNube(userId, checks) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'checks'), checks);
}

export async function cargarChecksNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'checks'));
    return snap.exists() ? snap.data() : {};
}

export async function guardarWalletNube(userId, wallet) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'wallet'), wallet);
}

export async function cargarWalletNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'wallet'));
    return snap.exists() ? snap.data() : null;
}

export async function guardarLogrosNube(userId, logros) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'logros'), { lista: logros });
}

export async function cargarLogrosNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'logros'));
    return snap.exists() ? snap.data().lista : [];
}

export async function guardarMichiNube(userId, michi) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'michi'), michi);
}

export async function cargarMichiNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'michi'));
    return snap.exists() ? snap.data() : null;
}

export async function guardarColeccionNube(userId, coleccion) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'coleccion'), { lista: coleccion });
}

export async function cargarColeccionNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'coleccion'));
    return snap.exists() ? snap.data().lista : [];
}

export async function guardarNivelesMichisNube(userId, niveles) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'nivelesMichis'), niveles);
}

export async function cargarNivelesMichisNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'nivelesMichis'));
    return snap.exists() ? snap.data() : null;
}

export async function guardarCartasNube(userId, cartas) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'cartas'), { lista: cartas });
}

export async function cargarCartasNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'cartas'));
    return snap.exists() ? snap.data().lista : [];
}

export async function guardarMarcosNube(userId, marcos) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'marcos'), marcos);
}

export async function cargarMarcosNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'marcos'));
    return snap.exists() ? snap.data() : null;
}

export async function guardarFrasesNube(userId, frases) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'frases'), { lista: frases });
}

export async function cargarFrasesNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'frases'));
    return snap.exists() ? snap.data().lista : [];
}

// ── CATÁLOGOS EN LA NUBE ──────────────────────────────
export async function cargarCatalogoMichis() {
    const snap = await getDoc(doc(db, 'catalogo', 'michis'));
    return snap.exists() ? snap.data().lista : [];
}

export async function cargarCatalogoMarcos() {
    const snap = await getDoc(doc(db, 'catalogo', 'marcos'));
    return snap.exists() ? snap.data().lista : [];
}

// ── INTENTOS BLACKJACK EN LA NUBE ────────────────────
export async function guardarIntentosBJNube(userId, data) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'intentosBJ'), data);
}

export async function cargarIntentosBJNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'intentosBJ'));
    return snap.exists() ? snap.data() : null;
}