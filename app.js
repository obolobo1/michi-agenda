let modoActual = '';

function mostrarEditor(modo) {
    modoActual = modo;
    document.getElementById('pantalla-seleccion').classList.remove('activa');
    document.getElementById('pantalla-editor').classList.add('activa');

    if (modo === 'diario') {
        document.getElementById('titulo-modo').textContent = '📅 Agenda Diaria';
        document.getElementById('instrucciones').textContent =
            'Formato: Actividad - Hora (Ej: GYM - 12:00 o Desayuno - 9). Las tareas de limpieza ponlas sin hora al final.';
        document.getElementById('input-actividades').value = '';
    } else {
        document.getElementById('titulo-modo').textContent = '🔮 Agenda Semanal';
        document.getElementById('instrucciones').textContent =
            'Formato: Día: Actividad - Hora (Ej: Lunes: GYM - 12:00). Días válidos: Lunes, Martes, Miercoles, Jueves, Viernes, Sabado, Domingo.';
        document.getElementById('input-actividades').value =
            'Lunes: GYM - 12:00\nLunes: Comer - 14:00\nMartes: Arwen - 11:00\nMiercoles: Carlos Juan - 10:00';
    }
}

function volverAtras() {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById('pantalla-seleccion').classList.add('activa');
    document.getElementById('input-actividades').value = '';
    document.getElementById('contenido-dashboard').innerHTML = '';
}

function obtenerIcono(nombre) {
    const n = nombre.toLowerCase();
    if (n.includes('gym') || n.includes('gimnasio') || n.includes('entrenar')) return '💪';
    if (n.includes('comer') || n.includes('comida') || n.includes('almuerzo') || n.includes('desayuno')) return '🍽️';
    if (n.includes('corte') || n.includes('cabello') || n.includes('rasurar') || n.includes('bañar')) return '✂️';
    if (n.includes('salir') || n.includes('casa')) return '🚗';
    if (n.includes('trabajo') || n.includes('trabajar') || n.includes('oficina')) return '💼';
    if (n.includes('doctor') || n.includes('médico') || n.includes('cita')) return '🏥';
    if (n.includes('escuela') || n.includes('clase') || n.includes('estudiar')) return '📚';
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

function procesarAgenda() {
    const texto = document.getElementById('input-actividades').value.trim();
    if (!texto) { alert('Por favor ingresa tus actividades.'); return; }

    if (modoActual === 'diario') {
        procesarDiario(texto);
    } else {
        procesarSemanal(texto);
    }

    document.getElementById('pantalla-editor').classList.remove('activa');
    document.getElementById('pantalla-dashboard').classList.add('activa');
}

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

    document.getElementById('titulo-dashboard').textContent = '📅 Mi Agenda del Día';
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
            <div class="panel panel-timeline">
                <h3>Línea de Tiempo</h3>
                <div class="timeline-vertical">${timelineItems}</div>
            </div>
            <div class="panel panel-tabla">
                <h3>Actividades</h3>
                <table><thead><tr><th>Hora</th><th>Actividad</th></tr></thead>
                <tbody>${filas}</tbody></table>
            </div>
        </div>
        ${limpieza.length ? `<div class="panel" style="margin-top:15px"><h3>Tareas del Hogar</h3><ul style="padding-left:20px;line-height:2">${limpiezaHTML}</ul></div>` : ''}
    `;
}

function procesarSemanal(texto) {
    const dias = ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'];
    const semana = {};
    dias.forEach(d => semana[d] = []);

    texto.split('\n').forEach(linea => {
        linea = linea.trim();
        if (!linea) return;
        const matchDia = linea.match(/^([^:]+):\s*(.*)$/);
        if (matchDia) {
            let dia = matchDia[1].trim();
            dia = dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
            dia = dia.replace('ércoles','ercoles').replace('ábado','abado');
            if (semana[dia] !== undefined) {
                const resto = matchDia[2].trim();
                const matchHora = resto.match(/(.*?)[-–—]?\s*(\d{1,2}:\d{2}|\d{1,2})\s*$/);
                if (matchHora) {
                    let hora = matchHora[2].trim();
                    if (!hora.includes(':')) hora = hora + ':00';
                    semana[dia].push({ actividad: matchHora[1].trim().replace(/[-–—]\s*$/, ''), hora });
                } else {
                    semana[dia].push({ actividad: resto, hora: '--:--' });
                }
            }
        }
    });

    dias.forEach(dia => {
        semana[dia].sort((a, b) => {
            const [ah, am] = parsearHora(a.hora);
            const [bh, bm] = parsearHora(b.hora);
            return ah !== bh ? ah - bh : am - bm;
        });
    });

    document.getElementById('titulo-dashboard').textContent = '🔮 Mi Semana';
    document.getElementById('contenido-dashboard').innerHTML = renderSemanal(semana, dias);
}

function renderSemanal(semana, dias) {
    const cols = dias.map(dia => {
        const actividades = semana[dia];
        const contenido = actividades.length === 0
            ? '<div class="libre">¡Día libre! 🐾</div>'
            : actividades.map(act => {
                const icono = obtenerIcono(act.actividad);
                const color = icono === '💪' ? '#10b981' : icono === '🍽️' ? '#ef4444' : '#3b82f6';
                return `<div class="act-card" style="border-left-color:${color}">
                    <div class="act-time">${act.hora}</div>
                    <div class="act-nombre">${icono} ${act.actividad}</div>
                </div>`;
            }).join('');
        return `<div class="dia-col"><div class="dia-titulo">${dia}</div>${contenido}</div>`;
    }).join('');

    return `<div class="semana-grid">${cols}</div>`;
}