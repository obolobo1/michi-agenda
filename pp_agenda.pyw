import tkinter as tk
from tkinter import messagebox, scrolledtext
import webbrowser
import os
import re

class GeneradorAgendaApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Diseñador de Agenda - Michi Centro de Control")
        self.root.geometry("600x420")
        self.root.configure(bg="#111827")
        
        self.modo_seleccionado = None

        # --- PANTALLA 1: SELECCIÓN DE MODO ---
        self.frame_seleccion = tk.Frame(root, bg="#111827")
        self.frame_seleccion.pack(fill="both", expand=True, pady=20)

        label_bienvenida = tk.Label(
            self.frame_seleccion, 
            text="🐱 Michi Agenda Centro de Control", 
            font=("Segoe UI", 16, "bold"), 
            bg="#111827", 
            fg="#f3f4f6"
        )
        label_bienvenida.pack(pady=10)

        label_sub = tk.Label(
            self.frame_seleccion, 
            text="¿Qué tipo de agenda vas a planificar hoy, pa?", 
            font=("Segoe UI", 10), 
            bg="#111827", 
            fg="#9ca3af"
        )
        label_sub.pack(pady=5)

        btn_diario = tk.Button(
            self.frame_seleccion,
            text="📆 Planificar Agenda Diaria",
            font=("Segoe UI", 11, "bold"),
            bg="#2563eb",
            fg="white",
            relief="flat",
            padx=20,
            pady=12,
            command=lambda: self.configurar_interfaz("diario")
        )
        btn_diario.pack(pady=15, fill="x", padx=100)

        btn_semanal = tk.Button(
            self.frame_seleccion,
            text="📚 Planificar Agenda Semanal",
            font=("Segoe UI", 11, "bold"),
            bg="#7c3aed",
            fg="white",
            relief="flat",
            padx=20,
            pady=12,
            command=lambda: self.configurar_interfaz("semanal")
        )
        btn_semanal.pack(pady=10, fill="x", padx=100)

        # --- PANTALLA 2: ENTRADA DE DATOS (OCULTA AL INICIO) ---
        self.frame_input = tk.Frame(root, bg="#111827")
        
        self.label_dinamico_titulo = tk.Label(self.frame_input, text="", font=("Segoe UI", 14, "bold"), bg="#111827", fg="#f3f4f6")
        self.label_dinamico_titulo.pack(pady=10)

        self.label_inst = tk.Label(self.frame_input, text="", font=("Segoe UI", 9), bg="#111827", fg="#9ca3af", justify="left")
        self.label_inst.pack(pady=5, padx=20, anchor="w")

        self.txt_input = scrolledtext.ScrolledText(
            self.frame_input, 
            width=65, 
            height=10, 
            font=("Consolas", 10),
            bg="#1f2937",
            fg="#f9fafb",
            insertbackground="white",
            relief="flat"
        )
        self.txt_input.pack(pady=5, padx=20)

        self.btn_generar = tk.Button(
            self.frame_input, 
            text="🚀 Generar Dashboard", 
            font=("Segoe UI", 11, "bold"), 
            bg="#10b981", 
            fg="white", 
            command=self.procesar_agenda,
            relief="flat",
            padx=15,
            pady=8
        )
        self.btn_generar.pack(pady=15)

    def configurar_interfaz(self, modo):
        self.modo_seleccionado = modo
        self.frame_seleccion.pack_forget() # Oculta botones iniciales
        self.frame_input.pack(fill="both", expand=True) # Muestra el editor de texto

        if modo == "diario":
            self.label_dinamico_titulo.config(text="📅 Modo: Agenda Diaria")
            inst = (
                "Formato: Actividad - Hora (Ej: GYM - 12:00 o Carlos Juan - 10).\n"
                "Las tareas de limpieza ('barrer', 'trapear') ponlas al final sin hora."
            )
            self.label_inst.config(text=inst)
        else:
            self.label_dinamico_titulo.config(text="🔮 Modo: Agenda Semanal")
            inst = (
                "Formato: Día: Actividad - Hora (Ej: Lunes: GYM - 12:00)\n"
                "Días válidos: Lunes, Martes, Miercoles, Jueves, Viernes, Sabado, Domingo."
            )
            self.label_inst.config(text=inst)
            # Inyectar un pequeño ejemplo para guiar al usuario
            ejemplo_semanal = "Lunes: GYM - 12:00\nLunes: Comer - 14:00\nMartes: Arwen - 11:00\nMiercoles: Carlos Juan - 10:00"
            self.txt_input.insert(tk.END, ejemplo_semanal)

    def procesar_agenda(self):
        texto = self.txt_input.get("1.0", tk.END).strip()
        if not texto:
            messagebox.showwarning("Entrada vacía", "Por favor, ingresa tus actividades.")
            return

        if self.modo_seleccionado == "diario":
            self.procesar_modo_diario(texto)
        else:
            self.procesar_modo_semanal(texto)

        self.root.quit()
        self.root.destroy()

    def procesar_modo_diario(self, texto):
        lineas = texto.split("\n")
        actividades_fijas = []
        tareas_limpieza = []
        palabras_limpieza = ["barrer", "trapear", "lavar", "ropa", "limpieza"]

        for linea in lineas:
            linea = linea.strip()
            if not linea: continue
            es_limpieza = any(p in linea.lower() for p in palabras_limpieza) and not re.search(r'\d+', linea)
            
            if es_limpieza:
                tareas_limpieza.append(linea)
            else:
                match = re.search(r'(.*?)[-–—]?\s*(\d{1,2}:\d{2}|\d{1,2})\s*$', linea)
                if match:
                    actividad = match.group(1).strip(" -")
                    hora = match.group(2).strip()
                    if ":" not in hora: hora = f"{hora}:00"
                    actividades_fijas.append({"actividad": actividad, "hora": hora})
                else:
                    actividades_fijas.append({"actividad": linea, "hora": "--:--"})

        try:
            actividades_fijas.sort(key=lambda x: [int(num) for num in x["hora"].split(":") if num.isdigit()])
        except Exception: pass

        self.generar_html_diario(actividades_fijas, tareas_limpieza)

    def procesar_modo_semanal(self, texto):
        lineas = texto.split("\n")
        # Diccionario estructurado por días de la semana
        semana_data = {d: [] for d in ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"]}

        for linea in lineas:
            linea = linea.strip()
            if not linea: continue
            
            # Buscar formato "Dia: Actividad - Hora"
            match_dia = re.match(r'^([^:]+):\s*(.*)$', linea)
            if match_dia:
                dia_raw = match_dia.group(1).strip().capitalize()
                # Limpiar acentos rápido para que coincida con el diccionario
                dia_limpio = dia_raw.replace("ércoles", "ercoles").replace("ábado", "abado")
                
                if dia_limpio in semana_data:
                    resto = match_dia.group(2).strip()
                    match_hora = re.search(r'(.*?)[-–—]?\s*(\d{1,2}:\d{2}|\d{1,2})\s*$', resto)
                    if match_hora:
                        act = match_hora.group(1).strip(" -")
                        hora = match_hora.group(2).strip()
                        if ":" not in hora: hora = f"{hora}:00"
                        semana_data[dia_limpio].append({"actividad": act, "hora": hora})
                    else:
                        semana_data[dia_limpio].append({"actividad": resto, "hora": "--:--"})

        # Ordenar cronológicamente las actividades dentro de cada día
        for dia in semana_data:
            try:
                semana_data[dia].sort(key=lambda x: [int(num) for num in x["hora"].split(":") if num.isdigit()])
            except Exception: pass

        self.generar_html_semanal(semana_data)

    def obtener_icono(self, nombre_actividad):
        nombre_lower = nombre_actividad.lower()
        if "gym" in nombre_lower or "gimnasio" in nombre_lower or "entrenar" in nombre_lower: return "💪"
        if "comer" in nombre_lower or "comida" in nombre_lower or "almuerzo" in nombre_lower: return "🍽️"
        if "corte" in nombre_lower or "cabello" in nombre_lower or "rasurar" in nombre_lower or "bañar" in nombre_lower: return "✂️"
        if "salir" in nombre_lower or "casa" in nombre_lower: return "🚗"
        return "📌"

    def generar_html_diario(self, fijas, limpieza):
        nodos_html = ""
        for idx, act in enumerate(fijas):
            icono = self.obtain_icon_context(act['actividad'])
            clases = ["nodo-azul", "nodo-morado", "nodo-rosa"]
            clase = clases[idx % len(clases)]
            if icono == "💪": clase = "nodo-verde"
            if icono == "🍽️": clase = "nodo-rojo"

            nodos_html += f"""
            <div class="node-wrapper">
                <div class="time-tag">{act['hora']}</div>
                <div class="circle-node {clase}">
                    <span class="node-icon">{icono}</span>
                    <span class="node-text">{act['actividad']}</span>
                </div>
            </div>"""

        filas_tabla = ""
        for act in fijas:
            icono = self.obtain_icon_context(act['actividad'])
            filas_tabla += f"<tr><td><span class='table-time'>{act['hora']}</span></td><td><span class='table-icon'>{icono}</span> {act['actividad']}</td></tr>"

        barras_html = ""
        if limpieza:
            for idx, t in enumerate(limpieza):
                color = "#a855f7" if idx % 2 == 0 else "#f97316"
                barras_html += f'<div class="floating-task" style="background: {color}; top: {idx*50}px;">✨ {t} (Intercalado)</div>'

        altura_overlay = max(60, len(limpieza) * 50)
        self.escribir_y_abrir_html(self.obtener_base_css() + f"""
<body>
    <header><h1>Mi Tablero de Control Diario</h1><p>Maqueta Temática de Productividad 🐱 Apoyando a los michis.</p></header>
    <div class="dashboard-layout">
        <div class="panel">
            <h2>Línea de Tiempo Dinámica</h2>
            <div class="timeline-scroll-container"><div class="timeline-track">{nodos_html}</div></div>
            <div class="tasks-overlay" style="height: {altura_overlay}px;">{barras_html}</div>
        </div>
        <div class="panel table-wrapper">
            <h2>Tabla de Referencia Rápida</h2>
            <table><thead><tr><th>Hora</th><th>Actividad Programada</th></tr></thead><tbody>{filas_tabla}</tbody></table>
        </div>
    </div>
</body></html>""")

    def generar_html_semanal(self, semana_data):
        columnas_html = ""
        for dia, actividades in semana_data.items():
            bloques_actividades = ""
            if not actividades:
                bloques_actividades = '<div class="no-tasks">¡Día libre, pa! 🐾</div>'
            else:
                for act in actividades:
                    icono = self.obtain_icon_context(act['actividad'])
                    border_color = "#10b981" if icono == "💪" else ("#ef4444" if icono == "🍽️" else "#3b82f6")
                    bloques_actividades += f"""
                    <div class="semana-card" style="border-left: 4px solid {border_color};">
                        <span class="semana-card-time">{act['hora']}</span>
                        <div class="semana-card-text"><span>{icono}</span> {act['actividad']}</div>
                    </div>"""

            columnas_html += f"""
            <div class="panel semana-columna">
                <h3 class="semana-dia-titulo">{dia}</h3>
                {bloques_actividades}
            </div>"""

        self.escribir_y_abrir_html(self.obtener_base_css() + f"""
<body>
    <header><h1>Mi Planeador de Control Semanal</h1><p>Vista Semanal Kanban 🐱 Todo lo recaudado va para comida de gatitos.</p></header>
    <div class="semana-layout">
        {columnas_html}
    </div>
</body></html>""")

    def obtain_icon_context(self, act):
        return self.obtener_icono(act)

    def escribir_y_abrir_html(self, contenido):
        file_path = os.path.abspath("mi_agenda_del_dia.html")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(contenido)
        webbrowser.open(f"file://{file_path}")

    def obtener_base_css(self):
        return """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Michi Agenda Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            color: #f9fafb; margin: 0; padding: 20px; min-height: 100vh;
            display: flex; flex-direction: column; align-items: center;
        }
        header { text-align: center; margin-bottom: 30px; }
        header h1 {
            margin: 0; font-size: 2.2rem;
            background: linear-gradient(to right, #38bdf8, #ec4899);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            letter-spacing: -0.5px;
        }
        header p { color: #9ca3af; margin-top: 5px; font-size: 1rem; }
        .dashboard-layout { width: 100%; max-width: 1300px; display: grid; grid-template-columns: 1fr; gap: 25px; }
        @media (min-width: 1024px) { .dashboard-layout { grid-template-columns: 2fr 1fr; } }
        
        /* DISEÑO VISTA SEMANAL */
        .semana-layout {
            width: 100%; max-width: 1400px; display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; width: 100%;
        }
        .semana-columna { padding: 15px !important; display: flex; flex-direction: column; gap: 10px; }
        .semana-dia-titulo { text-align: center; margin: 0 0 10px 0; color: #38bdf8; font-size: 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px;}
        .semana-card { background: rgba(255,255,255,0.03); padding: 10px; border-radius: 10px; display: flex; flex-direction: column; gap: 4px; }
        .semana-card-time { font-size: 0.75rem; font-weight: bold; color: #9ca3af; }
        .semana-card-text { font-size: 0.85rem; font-weight: 500; }
        .no-tasks { font-size: 0.8rem; color: #6b7280; text-align: center; margin: 20px 0; font-style: italic; }

        /* ESTILOS COMUNES */
        .panel {
            background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 30px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); box-sizing: border-box;
        }
        .panel h2 { margin-top: 0; font-size: 1.3rem; font-weight: 600; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 12px; color: #f3f4f6; }
        .timeline-scroll-container { width: 100%; overflow-x: auto; padding-bottom: 20px; margin-top: 20px; }
        .timeline-track { display: flex; justify-content: space-between; position: relative; padding: 20px 10px; min-width: max-content; }
        .timeline-track::before { content: ''; position: absolute; top: 82px; left: 0; right: 0; height: 4px; background: linear-gradient(to right, #3b82f6, #ec4899, #10b981); border-radius: 2px; z-index: 1; }
        .node-wrapper { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2; margin: 0 20px; width: 110px; }
        .time-tag { font-weight: 700; font-size: 0.85rem; color: #ffffff; background: rgba(59, 130, 246, 0.3); border: 1px solid #3b82f6; padding: 4px 12px; border-radius: 20px; margin-bottom: 15px; letter-spacing: 0.5px; }
        .circle-node { width: 90px; height: 90px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 20px rgba(0,0,0,0.2); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); padding: 8px; box-sizing: border-box; text-align: center; }
        .circle-node:hover { transform: translateY(-8px) scale(1.05); box-shadow: 0 15px 30px rgba(255,255,255,0.1); }
        .node-icon { font-size: 1.4rem; margin-bottom: 2px; }
        .node-text { font-size: 0.75rem; font-weight: 600; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .nodo-azul { background: linear-gradient(135deg, #2563eb, #1d4ed8); border: 2px solid #60a5fa; }
        .nodo-morado { background: linear-gradient(135deg, #7c3aed, #6d28d9); border: 2px solid #a78bfa; }
        .nodo-rosa { background: linear-gradient(135deg, #db2777, #be185d); border: 2px solid #f472b6; }
        .nodo-verde { background: linear-gradient(135deg, #059669, #047857); border: 2px solid #34d399; }
        .nodo-rojo { background: linear-gradient(135deg, #dc2626, #b91c1c); border: 2px solid #f87171; }
        .tasks-overlay { position: relative; margin-top: 25px; width: 100%; }
        .floating-task { position: absolute; left: 5%; width: 90%; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.85rem; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.2); letter-spacing: 0.3px; }
        .table-wrapper { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th, td { padding: 14px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.9rem; }
        th { background: rgba(255, 255, 255, 0.03); color: #9ca3af; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; }
        tr:last-child td { border-bottom: none; }
        tr:hover { background: rgba(255, 255, 255, 0.02); }
        .table-time { font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 3px 8px; border-radius: 6px; }
        .table-icon { margin-right: 6px; display: inline-block; }
    </style>
</head>
"""

if __name__ == "__main__":
    root = tk.Tk()
    app = GeneradorAgendaApp(root)
    root.mainloop()