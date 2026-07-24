// ── FIREBASE CONFIG ───────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCFuV8l0coMro3iPh0S0JRmvuxwiRYB1vs",
    authDomain: "michi-agenda.firebaseapp.com",
    projectId: "michi-agenda",
    storageBucket: "michi-agenda.firebasestorage.app",
    messagingSenderId: "456123290412",
    appId: "1:456123290412:web:3d662ba4f400d5bcc21289",
    measurementId: "G-601206WR97"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ── AUTENTICACIÓN ─────────────────────────────────────
export async function registrarUsuario(email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
}

export async function iniciarSesion(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
}

export async function iniciarSesionGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
}

export async function cerrarSesion() {
    await signOut(auth);
}

export function observarUsuario(callback) {
    return onAuthStateChanged(auth, callback);
}

export async function recuperarContrasena(email) {
    await sendPasswordResetEmail(auth, email);
}

// ── AGENDAS EN LA NUBE ────────────────────────────────
export async function guardarAgendaNube(userId, agenda) {
    await setDoc(doc(db, 'usuarios', userId, 'agendas', agenda.fechaKey), agenda);
}

export async function cargarAgendasNube(userId) {
    const snap = await getDocs(collection(db, 'usuarios', userId, 'agendas'));
    return snap.docs.map(d => d.data());
}

export async function borrarAgendaNube(userId, fechaKey) {
    await deleteDoc(doc(db, 'usuarios', userId, 'agendas', fechaKey));
}

// ── PENDIENTES EN LA NUBE ─────────────────────────────
export async function guardarPendientesNube(userId, pendientes) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'pendientes'), { lista: pendientes });
}

export async function cargarPendientesNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'pendientes'));
    return snap.exists() ? snap.data().lista : [];
}

// ── EMOJIS CUSTOM EN LA NUBE ──────────────────────────
export async function guardarEmojisNube(userId, emojis) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'emojis'), { lista: emojis });
}

export async function cargarEmojisNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'emojis'));
    return snap.exists() ? snap.data().lista : [];
}

// ── RECURRENTES EN LA NUBE ────────────────────────────
export async function guardarRecurrentesNube(userId, recurrentes) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'recurrentes'), { lista: recurrentes });
}

export async function cargarRecurrentesNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'recurrentes'));
    return snap.exists() ? snap.data().lista : [];
}

// ── CHECKS EN LA NUBE ─────────────────────────────────
export async function guardarChecksNube(userId, checks) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'checks'), { data: checks });
}

export async function cargarChecksNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'checks'));
    return snap.exists() ? snap.data().data : {};
}

// ── WALLET EN LA NUBE ─────────────────────────────────
export async function guardarWalletNube(userId, wallet) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'wallet'), wallet);
}

export async function cargarWalletNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'wallet'));
    return snap.exists() ? snap.data() : null;
}

// ── LOGROS EN LA NUBE ─────────────────────────────────
export async function guardarLogrosNube(userId, logros) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'logros'), { lista: logros });
}

export async function cargarLogrosNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'logros'));
    return snap.exists() ? snap.data().lista : [];
}

// ── MICHI COMPAÑERO EN LA NUBE ────────────────────────
export async function guardarMichiNube(userId, michi) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'michi'), michi);
}

export async function cargarMichiNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'michi'));
    return snap.exists() ? snap.data() : null;
}

// ── COLECCIÓN DE MICHIS EN LA NUBE ────────────────────
export async function guardarColeccionNube(userId, coleccion) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'coleccion'), { lista: coleccion });
}

export async function cargarColeccionNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'coleccion'));
    return snap.exists() ? snap.data().lista : [];
}

// ── NIVELES DE MICHIS EN LA NUBE ──────────────────────
export async function guardarNivelesMichisNube(userId, niveles) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'nivelesMichis'), { data: niveles });
}

export async function cargarNivelesMichisNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'nivelesMichis'));
    return snap.exists() ? snap.data().data : {};
}

// ── CARTAS DESBLOQUEADAS EN LA NUBE ───────────────────
export async function guardarCartasNube(userId, cartas) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'cartas'), { lista: cartas });
}

export async function cargarCartasNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'cartas'));
    return snap.exists() ? snap.data().lista : [];
}

// ── MARCOS EN LA NUBE ─────────────────────────────────
export async function guardarMarcosNube(userId, datos) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'marcos'), { data: datos });
}

export async function cargarMarcosNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'marcos'));
    return snap.exists() ? snap.data().data : { coleccion: [], activo: null };
}

// ── FRASES CUSTOM EN LA NUBE ──────────────────────────
export async function guardarFrasesNube(userId, frases) {
    await setDoc(doc(db, 'usuarios', userId, 'datos', 'frases'), { lista: frases });
}

export async function cargarFrasesNube(userId) {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'datos', 'frases'));
    return snap.exists() ? snap.data().lista : [];
}

// ── CATÁLOGOS EN LA NUBE v2 ──────────────────────────────
export async function cargarCatalogoMichis() {
    const snap = await getDoc(doc(db, 'catalogo', 'michis'));
    return snap.exists() ? snap.data().lista : [];
}

export async function cargarCatalogoMarcos() {
    const snap = await getDoc(doc(db, 'catalogo', 'marcos'));
    return snap.exists() ? snap.data().lista : [];
}