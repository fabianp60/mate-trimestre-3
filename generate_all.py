#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador del Simulacro de Examen de Matemáticas y Guía Pedagógica
Colegio Bilingüe Lerner & Klein · Grado 4.° · 3.er Trimestre
Temas oficiales de la circular:
  1. Fracción de un número.
  2. Cálculo de volumen.
  3. Clasificación de cuerpos geométricos e identificación de sus caras, aristas y vértices.
  4. Cálculo de la moda, media, mediana y rango de un conjunto de datos.
  5. Porcentajes: representación en cuadrículas y expresión como fracción y número decimal.
"""

import os
import subprocess

def get_svg_grid_100(shaded_count=35, width=130, height=130):
    """Genera una cuadrícula vectorial limpia de 10x10 con un número exacto de casillas sombreadas."""
    size = 11.5
    gap = 1.2
    cells_svg = []
    count = 0
    for r in range(10):
        for c in range(10):
            x = c * (size + gap) + 4
            y = r * (size + gap) + 4
            is_shaded = count < shaded_count
            fill = "#3b82f6" if is_shaded else "#ffffff"
            stroke = "#2563eb" if is_shaded else "#cbd5e1"
            cells_svg.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{size:.1f}" height="{size:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="0.8" rx="1.5"/>')
            count += 1
    
    total_w = 10 * (size + gap) + 8
    total_h = 10 * (size + gap) + 8
    return f'''<svg width="{width}" height="{height}" viewBox="0 0 {total_w} {total_h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="{total_w}" height="{total_h}" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" rx="4"/>
      {''.join(cells_svg)}
    </svg>'''

def get_svg_cube_blocks_volume(width=150, height=115):
    """Figura 3D escalonada de cubitos para contar volumen."""
    return f'''<svg width="{width}" height="{height}" viewBox="0 0 140 125" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="topG" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#bfdbfe"/>
          <stop offset="100%" stop-color="#dbeafe"/>
        </linearGradient>
        <linearGradient id="frontG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#93c5fd"/>
          <stop offset="100%" stop-color="#60a5fa"/>
        </linearGradient>
        <linearGradient id="sideG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#60a5fa"/>
          <stop offset="100%" stop-color="#3b82f6"/>
        </linearGradient>
      </defs>
      <!-- Capa inferior: 3 de ancho, 2 de fondo -->
      <g stroke="#1e3a8a" stroke-width="1.2" stroke-linejoin="round">
        <!-- Cubo (0,0,0) -->
        <polygon points="30,70 50,60 70,70 50,80" fill="url(#topG)"/>
        <polygon points="30,70 50,80 50,105 30,95" fill="url(#frontG)"/>
        <polygon points="50,80 70,70 70,95 50,105" fill="url(#sideG)"/>
        
        <!-- Cubo (1,0,0) -->
        <polygon points="50,60 70,50 90,60 70,70" fill="url(#topG)"/>
        <polygon points="70,70 90,60 90,85 70,95" fill="url(#sideG)"/>

        <!-- Cubo (2,0,0) -->
        <polygon points="70,50 90,40 110,50 90,60" fill="url(#topG)"/>
        <polygon points="90,60 110,50 110,75 90,85" fill="url(#sideG)"/>

        <!-- Fila frontal -->
        <!-- Cubo (0,0,1) -->
        <polygon points="10,85 30,75 50,85 30,95" fill="url(#topG)"/>
        <polygon points="10,85 30,95 30,120 10,110" fill="url(#frontG)"/>
        <polygon points="30,95 50,85 50,110 30,120" fill="url(#sideG)"/>

        <!-- Cubo (1,0,1) -->
        <polygon points="30,75 50,65 70,75 50,85" fill="url(#topG)"/>
        <polygon points="50,85 70,75 70,100 50,110" fill="url(#sideG)"/>

        <!-- Cubo (2,0,1) -->
        <polygon points="50,65 70,55 90,65 70,75" fill="url(#topG)"/>
        <polygon points="70,75 90,65 90,90 70,100" fill="url(#sideG)"/>

        <!-- Capa superior (piso 2): 2 cubos sobre la fila trasera -->
        <polygon points="30,45 50,35 70,45 50,55" fill="url(#topG)"/>
        <polygon points="30,45 50,55 50,80 30,70" fill="url(#frontG)"/>
        <polygon points="50,55 70,45 70,70 50,80" fill="url(#sideG)"/>

        <polygon points="50,35 70,25 90,35 70,45" fill="url(#topG)"/>
        <polygon points="70,45 90,35 90,60 70,70" fill="url(#sideG)"/>
      </g>
    </svg>'''

def get_svg_rectangular_prism(width=160, height=115):
    """Prisma rectangular / ortoedro con cotas: Largo 6 cm, Ancho 4 cm, Alto 3 cm."""
    return f'''<svg width="{width}" height="{height}" viewBox="0 0 170 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#bae6fd"/>
          <stop offset="100%" stop-color="#7dd3fc"/>
        </linearGradient>
        <linearGradient id="pTop" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#e0f2fe"/>
          <stop offset="100%" stop-color="#f0f9ff"/>
        </linearGradient>
        <linearGradient id="pSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#7dd3fc"/>
          <stop offset="100%" stop-color="#38bdf8"/>
        </linearGradient>
      </defs>
      <!-- Aristas ocultas punteadas -->
      <line x1="20" y1="50" x2="55" y2="25" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="55" y1="25" x2="145" y2="25" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="55" y1="25" x2="55" y2="75" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="20" y1="100" x2="55" y2="75" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="55" y1="75" x2="145" y2="75" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3,3"/>

      <!-- Caras visibles -->
      <polygon points="20,50 110,50 145,25 55,25" fill="url(#pTop)" stroke="#0369a1" stroke-width="1.6" fill-opacity="0.75"/>
      <polygon points="110,50 145,25 145,75 110,100" fill="url(#pSide)" stroke="#0369a1" stroke-width="1.6" fill-opacity="0.75"/>
      <polygon points="20,50 110,50 110,100 20,100" fill="url(#pFront)" stroke="#0369a1" stroke-width="1.6" fill-opacity="0.8"/>

      <!-- Cotas y medidas -->
      <!-- Largo: 6 cm -->
      <line x1="20" y1="107" x2="110" y2="107" stroke="#0f172a" stroke-width="1.2"/>
      <polygon points="20,107 24,105 24,109" fill="#0f172a"/>
      <polygon points="110,107 106,105 106,109" fill="#0f172a"/>
      <text x="50" y="117" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#0f172a">Largo = 6 cm</text>

      <!-- Alto: 3 cm -->
      <line x1="12" y1="50" x2="12" y2="100" stroke="#0f172a" stroke-width="1.2"/>
      <polygon points="12,50 10,54 14,54" fill="#0f172a"/>
      <polygon points="12,100 10,96 14,96" fill="#0f172a"/>
      <text x="0" y="78" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#0f172a" transform="rotate(-90 8,78)">3 cm</text>

      <!-- Ancho / Profundidad: 4 cm -->
      <line x1="114" y1="104" x2="149" y2="79" stroke="#0f172a" stroke-width="1.2"/>
      <text x="135" y="100" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0f172a">4 cm</text>
    </svg>'''

def get_svg_square_pyramid(width=110, height=95):
    """Pirámide cuadrangular con semitransparencia y aristas visibles."""
    return f'''<svg width="{width}" height="{height}" viewBox="0 0 110 95" xmlns="http://www.w3.org/2000/svg">
      <!-- Base cuadrilátera en perspectiva: A(15,75), B(55,87), C(95,75), D(55,62) -->
      <!-- Aristas ocultas punteadas de la base -->
      <line x1="15" y1="75" x2="55" y2="62" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="95" y1="75" x2="55" y2="62" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="55" y1="12" x2="55" y2="62" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="3,3"/>

      <!-- Base sombreada -->
      <polygon points="15,75 55,87 95,75 55,62" fill="#ffedd5" fill-opacity="0.4"/>

      <!-- Caras frontales -->
      <polygon points="55,12 15,75 55,87" fill="#fed7aa" fill-opacity="0.6" stroke="#c2410c" stroke-width="1.6"/>
      <polygon points="55,12 55,87 95,75" fill="#fdba74" fill-opacity="0.65" stroke="#c2410c" stroke-width="1.6"/>

      <!-- Vértices -->
      <circle cx="55" cy="12" r="3" fill="#9a3412"/> <!-- Cúspide -->
      <circle cx="15" cy="75" r="2.5" fill="#9a3412"/>
      <circle cx="55" cy="87" r="2.5" fill="#9a3412"/>
      <circle cx="95" cy="75" r="2.5" fill="#9a3412"/>
      <circle cx="55" cy="62" r="2.2" fill="#9a3412" fill-opacity="0.6"/>
    </svg>'''

def get_svg_triangular_prism(width=110, height=95):
    """Prisma triangular con aristas continuas y discontinuas."""
    return f'''<svg width="{width}" height="{height}" viewBox="0 0 110 95" xmlns="http://www.w3.org/2000/svg">
      <!-- Arista trasera punteada -->
      <line x1="55" y1="28" x2="55" y2="78" stroke="#4f46e5" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="18" y1="78" x2="55" y2="78" stroke="#4f46e5" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="92" y1="78" x2="55" y2="78" stroke="#4f46e5" stroke-width="1.5" stroke-dasharray="3,3"/>

      <!-- Caras semitransparentes -->
      <polygon points="18,28 92,28 55,12" fill="#c7d2fe" fill-opacity="0.7" stroke="#4338ca" stroke-width="1.6"/>
      <polygon points="18,28 92,28 92,78 18,78" fill="#e0e7ff" fill-opacity="0.4" stroke="#4338ca" stroke-width="1.6"/>
      <polygon points="18,28 55,12 55,62 18,78" fill="#a5b4fc" fill-opacity="0.45" stroke="#4338ca" stroke-width="1.6"/>
      <polygon points="92,28 55,12 55,62 92,78" fill="#818cf8" fill-opacity="0.45" stroke="#4338ca" stroke-width="1.6"/>

      <!-- Aristas frontales -->
      <line x1="18" y1="28" x2="18" y2="78" stroke="#312e81" stroke-width="1.6"/>
      <line x1="92" y1="28" x2="92" y2="78" stroke="#312e81" stroke-width="1.6"/>
      <line x1="18" y1="78" x2="92" y2="78" stroke="#312e81" stroke-width="1.6"/>

      <!-- Vértices -->
      <circle cx="18" cy="28" r="2.5" fill="#312e81"/>
      <circle cx="92" cy="28" r="2.5" fill="#312e81"/>
      <circle cx="55" cy="12" r="2.5" fill="#312e81"/>
      <circle cx="18" cy="78" r="2.5" fill="#312e81"/>
      <circle cx="92" cy="78" r="2.5" fill="#312e81"/>
      <circle cx="55" cy="78" r="2.2" fill="#312e81" fill-opacity="0.6"/>
    </svg>'''

def build_exam_html():
    return f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Simulacro de Examen - Matemáticas Primaria Grado 4.°</title>
<style>
  @page {{
    size: letter portrait;
    margin: 9mm 11mm 9mm 11mm;
  }}
  * {{
    box-sizing: border-box;
  }}
  body {{
    font-family: 'Lato', 'DejaVu Sans', 'Helvetica Neue', Arial, sans-serif;
    color: #1e293b;
    margin: 0;
    padding: 0;
    font-size: 9.5pt;
    line-height: 1.35;
    background: #ffffff;
  }}
  .page {{
    page-break-after: always;
    height: 258mm;
    max-height: 258mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }}
  .page:last-child {{
    page-break-after: avoid;
  }}
  
  /* Encabezado Escolar */
  .header-card {{
    border: 2px solid #2563eb;
    border-radius: 8px;
    padding: 7px 12px;
    background: #f8fafc;
    margin-bottom: 6px;
  }}
  .header-title-row {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #cbd5e1;
    padding-bottom: 4px;
    margin-bottom: 4px;
  }}
  .school-title {{
    font-size: 12pt;
    font-weight: 800;
    color: #1e40af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}
  .badge-exam {{
    background: #1e40af;
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 8pt;
    font-weight: 700;
  }}
  .header-info-grid {{
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 8px;
    font-size: 8.5pt;
  }}
  .field-box {{
    border-bottom: 1px dotted #64748b;
    padding-bottom: 1px;
  }}
  .field-label {{
    font-weight: 700;
    color: #475569;
  }}
  
  /* Cajas de Preguntas */
  .question-card {{
    border: 1.5px solid #cbd5e1;
    border-radius: 6px;
    padding: 7px 10px;
    margin-bottom: 6px;
    background: #ffffff;
  }}
  .question-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }}
  .q-badge {{
    background: #eff6ff;
    color: #1e40af;
    border: 1px solid #bfdbfe;
    border-radius: 4px;
    padding: 1px 6px;
    font-weight: 800;
    font-size: 8pt;
  }}
  .q-points {{
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
    border-radius: 4px;
    padding: 1px 6px;
    font-weight: 800;
    font-size: 8pt;
  }}
  .q-text {{
    font-weight: 600;
    font-size: 9.3pt;
    color: #0f172a;
    margin-bottom: 5px;
  }}
  
  /* Espacios de Trabajo / Procedimiento */
  .work-grid {{
    border: 1px dashed #94a3b8;
    background-color: #fafafa;
    background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
    background-size: 10px 10px;
    border-radius: 5px;
    min-height: 48px;
    padding: 4px 8px;
    font-size: 8pt;
    color: #64748b;
  }}
  .work-grid-title {{
    font-weight: 700;
    color: #475569;
    font-size: 7.5pt;
    text-transform: uppercase;
    margin-bottom: 2px;
  }}
  
  .answer-box {{
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    font-weight: 700;
    font-size: 9pt;
  }}
  .answer-line {{
    flex: 1;
    border-bottom: 1.5px solid #1e293b;
    min-height: 16px;
  }}
  
  .footer-row {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #cbd5e1;
    padding-top: 3px;
    font-size: 8pt;
    color: #64748b;
  }}

  /* Tablas de Examen */
  .exam-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 4px 0;
    font-size: 8.5pt;
  }}
  .exam-table th, .exam-table td {{
    border: 1px solid #94a3b8;
    padding: 4px 6px;
    text-align: center;
  }}
  .exam-table th {{
    background: #f1f5f9;
    font-weight: 700;
    color: #1e293b;
  }}
</style>
</head>
<body>

<!-- PÁGINA 1: FRACCIONES DE UN NÚMERO Y VOLUMEN -->
<div class="page">
  <div>
    <div class="header-card">
      <div class="header-title-row">
        <div class="school-title">Colegio Bilingüe Lerner & Klein · División de Formación</div>
        <div class="badge-exam">EVALUACIÓN DE MATEMÁTICAS · TRIMESTRE 3 (C-P-A)</div>
      </div>
      <div class="header-info-grid">
        <div class="field-box"><span class="field-label">Estudiante:</span> Luciana Peña Lozano</div>
        <div class="field-box"><span class="field-label">Curso:</span> 4.° A (Prof.ª Andrea Guerrero)</div>
        <div class="field-box"><span class="field-label">Fecha:</span> Noviembre 2026</div>
        <div class="field-box"><span class="field-label">Puntaje:</span> ____ / 100 pts</div>
      </div>
    </div>

    <!-- PREGUNTA 1: Fracción de un número con AMBOS métodos del Colegio (Cajón y Poner un 1 abajo) -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 1: Fracción de un Número (Formato Taller DP12-FR-02)</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>1. La Maqueta de Geometría:</b> En el estante de materiales hay un paquete con <b>20 barras de plastilina</b>.
        Si el grupo de 4.° A gasta las <b>3/4</b> partes de ese paquete en su maqueta, ¿cuántas barras completas usaron?
      </div>
      <div style="display: flex; gap: 10px; margin-bottom: 4px;">
        <div style="flex: 1;">
          <div style="font-size: 8.3pt; margin-bottom: 2px;">
            <b>a) Método 1 (Cajón del cuaderno):</b> Divide el total entre el denominador y multiplica al lado por el numerador:
          </div>
          <div class="work-grid" style="height: 52px;">
            División en cajón: <b>20 ÷ 4 = _____</b><br>
            Multiplicación al lado: <b>_____ × 3 = _____ barras</b>
          </div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 8.3pt; margin-bottom: 2px;">
            <b>b) Método 2 (Pista del taller: Ponle un 1 abajo al 20):</b><br>
            Multiplica de frente <code>(20/1) × (3/4)</code> y divide:
          </div>
          <div class="work-grid" style="height: 52px;">
            Fracción: <b>(20 × 3) / (1 × 4) = _____ / 4</b><br>
            numerador ÷ denominador = <b>_____ ÷ _____ = _____</b>
          </div>
        </div>
      </div>
      <div class="answer-box">
        <span>R: El grupo de 4.° A usó en total</span>
        <div class="answer-line" style="max-width: 70px;"></div>
        <span>barras completas de plastilina (y quedaron _____ sin usar).</span>
      </div>
    </div>

    <!-- PREGUNTA 2: Problema contextual del cuaderno (Dulces que quedan y Fracción Impropia a Mixto) -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 1: Fracción de una Cantidad y Número Mixto</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>2. El Compartir del Salón:</b> En una caja hay <b>30 dulces</b>. Primero se reparten las <b>2/5</b> partes entre los amigos.
        Además, en otra mesa abrieron paquetes de galletas de <b>6 partes iguales</b> y se comieron <b>7/6</b> en total.
      </div>
      <div class="work-grid" style="min-height: 64px; padding: 5px 10px; margin-bottom: 4px; line-height: 1.42;">
        <div class="work-grid-title">Procedimiento Paso a Paso:</div>
        • <b>a) Dulces repartidos (2/5 de 30):</b> 30 ÷ 5 = _____ &rarr; _____ × 2 = <b>_____ dulces repartidos</b>.<br>
        • <b>b) Dulces que QUEDARON en la caja:</b> 30 − _____ = <b>_____ dulces quedaron</b>.<br>
        • <b>c) Convierte la fracción impropia 7/6 de galletas a Número Mixto:</b> 7 ÷ 6 = <b>___ entero y ___ / 6</b>.
      </div>
      <div class="answer-box">
        <span>R: Se repartieron _____ dulces, quedaron _____ en la caja, y 7/6 equivale al número mixto _________.</span>
      </div>
    </div>

    <!-- PREGUNTA 3: Cálculo de volumen por conteo de cubitos -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 2: Cálculo de Volumen</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>3. Conteo de Cubos Unidad:</b> El volumen es el <i>espacio que ocupa un cuerpo</i> y se mide en unidades cúbicas (<b>cm³, m³</b>).
        Observa la figura formada por cubitos de <b>1 cm³</b> (recuerda contar los cubos ocultos que sostienen el piso 2):
      </div>
      <div style="display: flex; gap: 14px; align-items: center;">
        <div style="text-align: center;">
          {get_svg_cube_blocks_volume(145, 108)}
          <div style="font-size: 8.5pt; font-weight: bold; color: #1e3a8a; margin-top: 2px;">🧊 1 cubito = 1 cm³</div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 8.5pt; margin-bottom: 4px;">
            <b>a)</b> Cubitos en el piso 1 (base inferior de 3 × 2): _____ cubitos.<br>
            <b>b)</b> Cubitos en el piso 2 (capa superior): _____ cubitos.<br>
            <b>c)</b> Suma total de ambos pisos:
          </div>
          <div class="work-grid" style="height: 36px;">
            Operación: _____ + _____ = _____ cm³
          </div>
          <div class="answer-box">
            <span>R: Volumen Total =</span>
            <div class="answer-line" style="max-width: 90px;"></div>
            <span>cm³</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Grado 4.° A</span>
    <span>Página 1 de 4</span>
  </div>
</div>

<!-- PÁGINA 2: VOLUMEN DE ORTOEDROS Y CLASIFICACIÓN DE CUERPOS SÓLIDOS -->
<div class="page">
  <div>
    <div class="header-card" style="padding: 4px 10px; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #1e40af;">
        <span>COLEGIO BILINGÜE LERNER & KLEIN · 4.° A</span>
        <span>MATEMÁTICAS · EVALUACIÓN TRIMESTRE 3</span>
      </div>
    </div>

    <!-- PREGUNTA 4: Volumen de prisma rectangular (fórmula del cuaderno) -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 2: Cálculo de Volumen (Fórmula del Cuaderno)</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>4. Prisma Rectangular (Largo × Ancho × Alto):</b> Calcula el volumen de la caja de la figura (<b>6 cm × 4 cm × 3 cm</b>) y también el volumen del ejercicio de tu cuaderno (<b>largo = 5 cm, ancho = 2 cm, alto = 6 cm</b>):
      </div>
      <div style="display: flex; gap: 14px; align-items: center;">
        <div style="text-align: center;">
          {get_svg_rectangular_prism(155, 102)}
        </div>
        <div style="flex: 1;">
          <div class="work-grid" style="height: 62px; line-height: 1.45;">
            <div class="work-grid-title">Aplica V = largo × ancho × alto:</div>
            <b>a) Caja de la figura:</b> V = 6 cm × 4 cm × 3 cm = <b>________ cm³</b><br>
            <b>b) Prisma del cuaderno:</b> V = 5 cm × 2 cm × 6 cm = <b>________ cm³</b>
          </div>
          <div class="answer-box">
            <span>R: Caja = _______ cm³ | Prisma cuaderno = _______ cm³.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PREGUNTA 5: Tabla comparativa de Cuerpos Sólidos -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 3: Cuerpos Sólidos (Caras, Aristas y Vértices)</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>5. Clasificación y Conteo de Elementos:</b> Completa la tabla identificando si es Poliedro o Redondo, el número de caras, vértices, aristas y la forma de sus caras laterales:
      </div>
      <table class="exam-table">
        <thead>
          <tr>
            <th>Cuerpo Sólido</th>
            <th>Tipo</th>
            <th>Caras (F)</th>
            <th>Vértices (V)</th>
            <th>Aristas (E)</th>
            <th>Caras Laterales</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight:700;">Cubo (Prisma cuadrangular)</td>
            <td>Poliedro</td>
            <td>_____</td>
            <td>_____</td>
            <td>_____</td>
            <td>Cuadradas / Rectangulares</td>
          </tr>
          <tr>
            <td style="font-weight:700;">Prisma Triangular (2 bases)</td>
            <td>Poliedro</td>
            <td>_____</td>
            <td>_____</td>
            <td>_____</td>
            <td>_________________ (¡Ojo!)</td>
          </tr>
          <tr>
            <td style="font-weight:700;">Pirámide Cuadrangular (1 base)</td>
            <td>Poliedro</td>
            <td>_____</td>
            <td>_____</td>
            <td>_____</td>
            <td>_________________ (unen en vértice)</td>
          </tr>
          <tr>
            <td style="font-weight:700;">Cono / Cilindro</td>
            <td>Redondos</td>
            <td>Cono: 1 plana</td>
            <td>Cono: ___ / Cil: ___</td>
            <td>Curvas</td>
            <td>Superficie curva</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PREGUNTA 6: Diferenciación visual y conceptual de Pirámide vs Prisma (Mapa del Cuaderno) -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 3: Mapa Conceptual de Cuerpos Sólidos</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>6. Prisma vs. Pirámide (¡Cazadora de Errores!):</b> Observa los dos cuerpos sólidos y completa con precisión:
      </div>
      <div style="display: flex; justify-content: space-around; align-items: center; margin: 4px 0;">
        <div style="text-align: center; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 10px;">
          <b>Cuerpo A</b><br>
          {get_svg_square_pyramid(95, 76)}<br>
          <span style="font-size: 8pt; color: #475569;">1 sola base y termina en vértice</span>
        </div>
        <div style="text-align: center; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 10px;">
          <b>Cuerpo B</b><br>
          {get_svg_triangular_prism(95, 76)}<br>
          <span style="font-size: 8pt; color: #475569;">2 bases iguales y paralelas</span>
        </div>
      </div>
      <div style="font-size: 8.4pt; line-height: 1.45;">
        <b>a)</b> El <b>Cuerpo A</b> es una _____________________________ porque tiene <b>___ sola base</b>, sus caras laterales son <b>____________________</b> y terminan arriba en un <b>________________</b>.<br>
        <b>b)</b> El <b>Cuerpo B</b> es un _____________________________ porque tiene <b>___ bases iguales</b> y sus caras laterales son <b>____________________</b> (¡nunca triangulares!).
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Grado 4.° A</span>
    <span>Página 2 de 4</span>
  </div>
</div>

<!-- PÁGINA 3: MEDIDAS ESTADÍSTICAS CON 9 DATOS (CUADERNO CLASE 52) -->
<div class="page">
  <div>
    <div class="header-card" style="padding: 4px 10px; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #1e40af;">
        <span>COLEGIO BILINGÜE LERNER & KLEIN · 4.° A</span>
        <span>MATEMÁTICAS · EVALUACIÓN TRIMESTRE 3</span>
      </div>
    </div>

    <!-- PREGUNTA 7: Ejercicio 1 del Cuaderno (Tienda Escolar - 9 días) -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 4: Estadística (Ejercicio 1 del Cuaderno · 9 Datos)</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>7. Ventas en la Tienda Escolar (9 días):</b> En la tienda del colegio se registraron las siguientes ventas durante 9 días:
        <div style="text-align: center; font-size: 10.5pt; font-weight: 800; color: #1e40af; margin: 3px 0;">
          20 - 25 - 18 - 22 - 25 - 30 - 25 - 20 - 15
        </div>
      </div>
      <div style="font-size: 8.4pt; margin-bottom: 4px;">
        <b>Paso 1 (¡Obligatorio!):</b> Ordena los <b>9 datos</b> de MENOR a MAYOR y encierra el <b>5.° dato</b> (el centro exacto):<br>
        <div style="display: flex; gap: 5px; justify-content: center; margin: 4px 0;">
          <span style="border: 1px solid #94a3b8; padding: 2px 6px; border-radius: 4px;">____</span>
          <span style="border: 1px solid #94a3b8; padding: 2px 6px; border-radius: 4px;">____</span>
          <span style="border: 1px solid #94a3b8; padding: 2px 6px; border-radius: 4px;">____</span>
          <span style="border: 1px solid #94a3b8; padding: 2px 6px; border-radius: 4px;">____</span>
          <span style="border: 2px solid #2563eb; background:#eff6ff; padding: 2px 6px; border-radius: 4px; font-weight:700;">5.°: ____</span>
          <span style="border: 1px solid #94a3b8; padding: 2px 6px; border-radius: 4px;">____</span>
          <span style="border: 1px solid #94a3b8; padding: 2px 6px; border-radius: 4px;">____</span>
          <span style="border: 1px solid #94a3b8; padding: 2px 6px; border-radius: 4px;">____</span>
          <span style="border: 1px solid #94a3b8; padding: 2px 6px; border-radius: 4px;">____</span>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; margin-bottom: 2px;">
        <div class="work-grid" style="height: 54px;">
          <div class="work-grid-title">a) MODA:</div>
          Dato que más se repite:<br>
          <b>Moda = _____</b>
        </div>
        <div class="work-grid" style="height: 54px;">
          <div class="work-grid-title">b) MEDIANA:</div>
          Dato central (5.°):<br>
          <b>Mediana = _____</b>
        </div>
        <div class="work-grid" style="height: 54px;">
          <div class="work-grid-title">c) RANGO:</div>
          Mayor − Menor:<br>
          ___ − ___ = <b>___</b>
        </div>
        <div class="work-grid" style="height: 54px;">
          <div class="work-grid-title">d) MEDIA:</div>
          Suma = _____<br>
          ___ ÷ 9 = <b>_____</b>
        </div>
      </div>
    </div>

    <!-- PREGUNTA 8: Ejercicio 5 del Cuaderno (Edades de 9 niños y división 95 ÷ 9) -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 4: Media o Promedio y División en Cajón (Ejercicio 5 del Cuaderno)</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>8. Edades en el Taller de Arte:</b> Las edades de <b>9 niños</b> son: <b>[ 9, 10, 12, 11, 10, 13, 12, 10, 8 ]</b>.
      </div>
      <div style="display: flex; gap: 10px;">
        <div class="work-grid" style="flex: 1; height: 64px; line-height: 1.4;">
          <div class="work-grid-title">a) Ordena, halla Moda, Mediana y Rango:</div>
          Ordenados: 8 - 9 - 10 - 10 - <b>[___]</b> - 11 - 12 - 12 - 13<br>
          • <b>Moda = _____</b> | <b>Mediana = _____</b> | <b>Rango =</b> 13 − 8 = <b>_____</b>
        </div>
        <div class="work-grid" style="flex: 1; height: 64px; line-height: 1.4;">
          <div class="work-grid-title">b) Media (Suma ÷ 9) ¡Cuidado con el 0 en el cociente!:</div>
          Suma total = <b>95</b>. Divide en cajón <b>95 ÷ 9</b>:<br>
          Cociente entero = <b>_____</b> | Con decimal = <b>10,_____</b>
        </div>
      </div>
    </div>

    <!-- PREGUNTA 9: Porcentajes C-P-A en las 2 cuadrículas del cuaderno (60% y 22%) -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 5: Porcentajes C-P-A (Cuadrículas Reales de tu Cuaderno)</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>9. Representación Pictórica y Abstracta:</b> Observa las dos cuadrículas de 10×10 (100 cuadritos) que pegaste en tu cuaderno en la Clase 49 y completa sus equivalencias:
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <div style="display: flex; gap: 8px; align-items: center; border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 8px; flex: 1;">
          {get_svg_grid_100(60, 95, 95)}
          <div style="font-size: 8.2pt; line-height: 1.4;">
            <b>Cuadrícula A (6 filas):</b><br>
            • Cuadritos: <b>_____</b> de 100<br>
            • Porcentaje: <b>_____%</b><br>
            • Fracción: <b>___/100</b> (o <b>3/5</b>)<br>
            • Decimal (coma): <b>0,_____</b>
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 8px; flex: 1;">
          {get_svg_grid_100(22, 95, 95)}
          <div style="font-size: 8.2pt; line-height: 1.4;">
            <b>Cuadrícula B (2 filas + 2):</b><br>
            • Cuadritos: <b>_____</b> de 100<br>
            • Porcentaje: <b>_____%</b><br>
            • Fracción: <b>___/100</b><br>
            • Decimal (coma): <b>0,_____</b>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Grado 4.° A</span>
    <span>Página 3 de 4</span>
  </div>
</div>

<!-- PÁGINA 4: PROBLEMA DEL JUEGO DE MESA ($60.000) Y TABLA DE CONTROL -->
<div class="page">
  <div>
    <div class="header-card" style="padding: 4px 10px; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #1e40af;">
        <span>COLEGIO BILINGÜE LERNER & KLEIN · 4.° A</span>
        <span>MATEMÁTICAS · EVALUACIÓN TRIMESTRE 3</span>
      </div>
    </div>

    <!-- PREGUNTA 10: Descuento del Juego de Mesa de $60.000 (Cuaderno + Porcentaje 25% = 1/4 = 0,25) -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 5 y Tema 1: Porcentajes, Decimales y Descuento ($60.000)</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>10. El Juego de Mesa de $60.000 (Ejercicio de tu Cuaderno):</b> En una tienda escolar, un juego de mesa cuesta <b>$60.000</b> y tiene un descuento del <b>25%</b> (que equivale a <b>1/4</b> de su valor).
      </div>
      <div style="display: flex; gap: 12px; margin-bottom: 4px;">
        <div style="text-align: center;">
          <div style="font-size: 7.5pt; font-weight: 700; margin-bottom: 2px;">Colorea el 25% (25 cuadritos):</div>
          {get_svg_grid_100(0, 105, 105)}
        </div>
        <div style="flex: 1; font-size: 8.4pt;">
          <b>a)</b> Completa la equivalencia del <b>25%</b> y su valor posicional:<br>
          <code>25% = _____ / 100 = 1 / 4 = <b>0,_____</b></code> (___ parte entera, ___ décimas y ___ centésimas).<br>
          <b>b)</b> Calcula el descuento (<b>1/4 de $60.000</b>) usando el cajón de tu cuaderno:
          <div class="work-grid" style="height: 34px; margin: 3px 0;">
            $60.000 ÷ 4 = <b>$________________</b> pesos de descuento.
          </div>
          <b>c)</b> ¿Cuánto dinero se debe pagar finalmente por el juego de mesa?
          <div class="work-grid" style="height: 34px; margin: 3px 0;">
            $60.000 − $________________ = <b>$________________</b> pesos.
          </div>
        </div>
      </div>
      <div class="answer-box">
        <span>R: El descuento es de $_____________ y finalmente se debe pagar $_____________ por el juego.</span>
      </div>
    </div>

    <!-- CUADRO DE REPASO PEDAGÓGICO / SEMÁFORO DEL ESTUDIANTE -->
    <div style="border: 2px solid #3b82f6; border-radius: 8px; padding: 8px 12px; background: #eff6ff; margin-top: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-weight: 800; font-size: 9.5pt; color: #1e40af;">🎯 Resumen y Control del Evaluador:</span>
        <span style="font-size: 8pt; font-weight: 700; color: #64748b;">Colegio Bilingüe Lerner & Klein · 4.° A</span>
      </div>
      <table class="exam-table" style="margin-bottom: 6px; background: white;">
        <thead>
          <tr>
            <th>Tema Evaluado</th>
            <th>Preguntas</th>
            <th>Puntos Posibles</th>
            <th>Puntaje Obtenido</th>
            <th>Semáforo Pedagógico</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1. Fracción de un número (2 métodos + mixtos)</td>
            <td>1 y 2</td>
            <td>20 pts</td>
            <td>_____ / 20</td>
            <td>🟢 Verde (≥18) | 🟡 Amarillo (14-17) | 🔴 Rojo (&lt;14)</td>
          </tr>
          <tr>
            <td>2. Cálculo de volumen (cubos y V = l × a × h)</td>
            <td>3 y 4</td>
            <td>20 pts</td>
            <td>_____ / 20</td>
            <td>🟢 Verde (≥18) | 🟡 Amarillo (14-17) | 🔴 Rojo (&lt;14)</td>
          </tr>
          <tr>
            <td>3. Cuerpos sólidos (prismas, pirámides, redondos)</td>
            <td>5 y 6</td>
            <td>20 pts</td>
            <td>_____ / 20</td>
            <td>🟢 Verde (≥18) | 🟡 Amarillo (14-17) | 🔴 Rojo (&lt;14)</td>
          </tr>
          <tr>
            <td>4. Moda, media, mediana y rango (9 datos)</td>
            <td>7 y 8</td>
            <td>20 pts</td>
            <td>_____ / 20</td>
            <td>🟢 Verde (≥18) | 🟡 Amarillo (14-17) | 🔴 Rojo (&lt;14)</td>
          </tr>
          <tr>
            <td>5. Porcentajes C-P-A (cuadrícula, fracción, decimal)</td>
            <td>9 y 10</td>
            <td>20 pts</td>
            <td>_____ / 20</td>
            <td>🟢 Verde (≥18) | 🟡 Amarillo (14-17) | 🔴 Rojo (&lt;14)</td>
          </tr>
          <tr style="font-weight: 800; background: #f8fafc;">
            <td colspan="2" style="text-align: right;">TOTAL EVALUACIÓN:</td>
            <td>100 pts</td>
            <td>_____ / 100</td>
            <td>Desempeño: ____________________</td>
          </tr>
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10px; font-size: 8.5pt;">
        <div style="border-top: 1px solid #1e293b; width: 220px; text-align: center; padding-top: 2px;">
          Firma del Evaluador / Docente
        </div>
        <div style="text-align: center; font-size: 1.6rem;">
          🦊 🌟 📐 💯
        </div>
        <div style="border-top: 1px solid #1e293b; width: 220px; text-align: center; padding-top: 2px;">
          Firma de Luciana Peña Lozano (4.° A)
        </div>
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Grado 4.° A</span>
    <span>Página 4 de 4</span>
  </div>
</div>

</body>
</html>'''

def build_solution_guide_html():
    return f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Solucionario y Guía Pedagógica de Evaluación - Grado 4.° A</title>
<style>
  @page {{
    size: letter portrait;
    margin: 9mm 11mm 9mm 11mm;
  }}
  * {{
    box-sizing: border-box;
  }}
  body {{
    font-family: 'Lato', 'DejaVu Sans', 'Helvetica Neue', Arial, sans-serif;
    color: #1e293b;
    margin: 0;
    padding: 0;
    font-size: 9.5pt;
    line-height: 1.35;
    background: #ffffff;
  }}
  .page {{
    page-break-after: always;
    height: 258mm;
    max-height: 258mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }}
  .page:last-child {{
    page-break-after: avoid;
  }}
  .header-card {{
    border: 2px solid #059669;
    border-radius: 8px;
    padding: 7px 12px;
    background: #f0fdf4;
    margin-bottom: 6px;
  }}
  .header-title-row {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #a7f3d0;
    padding-bottom: 4px;
    margin-bottom: 4px;
  }}
  .school-title {{
    font-size: 12pt;
    font-weight: 800;
    color: #065f46;
    text-transform: uppercase;
  }}
  .badge-guide {{
    background: #059669;
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 8pt;
    font-weight: 700;
  }}
  .sol-card {{
    border: 1.5px solid #cbd5e1;
    border-left: 4px solid #059669;
    border-radius: 6px;
    padding: 6px 10px;
    margin-bottom: 6px;
    background: #ffffff;
  }}
  .sol-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3px;
    font-weight: 800;
    font-size: 9pt;
  }}
  .sol-content {{
    font-size: 9pt;
    color: #334155;
  }}
  .rubric-box {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 4px 8px;
    margin-top: 3px;
    font-size: 8.5pt;
  }}
  .footer-row {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #cbd5e1;
    padding-top: 3px;
    font-size: 8pt;
    color: #64748b;
  }}
  code {{
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    font-family: monospace;
    color: #0f172a;
    font-weight: bold;
  }}
</style>
</head>
<body>

<!-- PÁGINA 1: SOLUCIONES PREGUNTAS 1, 2 Y 3 -->
<div class="page">
  <div>
    <div class="header-card">
      <div class="header-title-row">
        <div class="school-title">Colegio Bilingüe Lerner & Klein · 4.° A</div>
        <div class="badge-guide">GUÍA PEDAGÓGICA Y SOLUCIONARIO OFICIAL · TRIMESTRE 3</div>
      </div>
      <div style="font-size: 8.5pt; color: #047857; font-weight: 600;">
        Alineado con el cuaderno y talleres de la Prof.ª Andrea Guerrero (Enfoque C-P-A). Evaluación Nov 9-13.
      </div>
    </div>

    <!-- SOLUCIÓN 1 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 1: Fracción de un número — Los 2 Métodos (3/4 de 20 plastilinas)</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso (¡Punto clave donde Luciana tuvo dificultades en su taller escrito!):</b><br>
        • <b>a) Método 1 (Cajón del cuaderno):</b> Divide <code>20 ÷ 4 = 5</code> y al lado multiplica <code>5 × 3 = 15 barras</code>.<br>
        • <b>b) Método 2 (Plantilla del taller poniendo un 1 abajo):</b> <code>(20/1) × (3/4) = 60/4</code>.<br>
        &nbsp;&nbsp;En las rayitas <code>numerador ÷ denominador = ___ ÷ ___ = ___</code> se debe escribir: <code><b>60 ÷ 4 = 15</b></code>.<br>
        • <b>Respuesta completa (R:):</b> Usaron <b>15 barras completas</b> (y quedaron <code>20 − 15 = 5</code> barras sin usar).<br>
        <div class="rubric-box">
          <b>⚠️ Alerta Real del Taller de Luciana:</b> En el taller del 28 de sept, Luciana sabía hacer <code>20 ÷ 4 = 5</code> arriba, pero al llenar la plantilla final <code>numerador ÷ denominador = ___ ÷ ___ = ___</code> escribió <code>20 ÷ 4 = 5</code> olvidando multiplicar primero <code>20 × 3 = 60</code>. Verificar que escriba <b>60 ÷ 4 = 15</b>.
        </div>
      </div>
    </div>

    <!-- SOLUCIÓN 2 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 2: Dulces que quedan (2/5 de 30) y Fracción Impropia a Mixto (7/6)</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso:</b><br>
        • <b>a) Dulces repartidos (2/5 de 30):</b> <code>30 ÷ 5 = 6</code> &rarr; <code>6 × 2 = 12 dulces repartidos</code>.<br>
        • <b>b) Dulces que QUEDARON en la caja:</b> <code>30 − 12 = 18 dulces quedaron</code>.<br>
        • <b>c) De Fracción Impropia (7/6) a Número Mixto:</b> Dividimos <code>7 ÷ 6 = 1 entero</code> y sobra <code>1 sexto</code> &rarr; <code><b>1 1/6</b></code>.<br>
        <div class="rubric-box">
          <b>⚠️ Alerta Real del Taller de Luciana:</b> Al convertir <code>7/6</code> de galletas a número mixto, Luciana primero sumó los denominadores (escribió <code>6/12</code>) antes de corregirlo a <code>1 1/6</code>. Recordarle que el denominador (6 partes por paquete) NUNCA cambia.
        </div>
      </div>
    </div>

    <!-- SOLUCIÓN 3 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 3: Cálculo de volumen por conteo de cubitos (1 cm³)</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso:</b><br>
        • <b>Piso 1 (Base inferior):</b> Tiene 3 cubos de largo por 2 de ancho = <code>3 × 2 = 6 cubitos</code> (incluyendo los ocultos).<br>
        • <b>Piso 2 (Capa superior):</b> Tiene <code>2 cubitos</code> visibles en la fila trasera.<br>
        • <b>Volumen Total:</b> <code>6 + 2 = 8 cm³</code>.<br>
        <div class="rubric-box">
          <b>Rúbrica (10 pts):</b> 4 pts por contar los 6 del piso 1, 3 pts por los 2 del piso 2, y 3 pts por sumar <code>8 cm³</code> con su unidad cúbica.
        </div>
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Guía Pedagógica 4.° A</span>
    <span>Página 1 de 4</span>
  </div>
</div>

<!-- PÁGINA 2: SOLUCIONES PREGUNTAS 4, 5 Y 6 -->
<div class="page">
  <div>
    <div class="header-card" style="padding: 4px 10px; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #065f46;">
        <span>COLEGIO BILINGÜE LERNER & KLEIN · GUÍA DEL EVALUADOR</span>
        <span>MATEMÁTICAS · 4.° A</span>
      </div>
    </div>

    <!-- SOLUCIÓN 4 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 4: Volumen de prismas rectangulares (V = largo × ancho × alto)</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso:</b><br>
        • <b>a) Caja de la figura:</b> <code>V = 6 cm × 4 cm × 3 cm = 24 × 3 = 72 cm³</code>.<br>
        • <b>b) Ejercicio exacto del cuaderno de Luciana:</b> <code>V = 5 cm × 2 cm × 6 cm = 10 × 6 = 60 cm³</code>.<br>
        <div class="rubric-box">
          <b>Rúbrica (10 pts):</b> 5 pts por el inciso a (<code>72 cm³</code>) y 5 pts por el inciso b (<code>60 cm³</code>). Verificar que siempre escriba el exponente 3 (unidades cúbicas: <code>cm³</code>, <code>m³</code>).
        </div>
      </div>
    </div>

    <!-- SOLUCIÓN 5 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 5: Tabla comparativa de Cuerpos Sólidos</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución de la Tabla:</b><br>
        1. <b>Cubo:</b> Poliedro | Caras: <b>6</b> | Vértices: <b>8</b> | Aristas: <b>12</b> | Caras laterales: Cuadradas.<br>
        2. <b>Prisma Triangular:</b> Poliedro | Caras: <b>5</b> | Vértices: <b>6</b> | Aristas: <b>9</b> | Caras laterales: <b>Rectangulares</b>.<br>
        3. <b>Pirámide Cuadrangular:</b> Poliedro | Caras: <b>5</b> | Vértices: <b>5</b> | Aristas: <b>8</b> | Caras laterales: <b>Triangulares</b>.<br>
        4. <b>Cono / Cilindro:</b> Redondos | Vértices: <b>Cono = 1 (cúspide) / Cilindro = 0</b>.<br>
        <div class="rubric-box">
          <b>Rúbrica (10 pts):</b> 2.5 pts por cada fila correcta.
        </div>
      </div>
    </div>

    <!-- SOLUCIÓN 6 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 6: Distinción de Pirámide vs. Prisma (Mapa Conceptual del Cuaderno)</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso:</b><br>
        • <b>a) Cuerpo A:</b> Es una <b>Pirámide cuadrangular</b> porque tiene <b>1 sola base</b>, sus caras laterales son <b>triangulares</b> y terminan arriba en un <b>vértice (o cúspide)</b>.<br>
        • <b>b) Cuerpo B:</b> Es un <b>Prisma triangular</b> porque tiene <b>2 bases iguales</b> y sus caras laterales son <b>rectangulares</b>.<br>
        <div class="rubric-box">
          <b>⚠️ Alerta Real del Cuaderno de Luciana:</b> En su mapa conceptual de <i>"Cuerpos sólidos"</i>, debajo de <b>Prisma</b> Luciana escribió por error <i>"Tiene dos bases, caras triangulares"</i>. Asegurarse de que tenga 100% claro que los <b>Prismas tienen caras laterales RECTANGULARES</b> y solo las <b>Pirámides tienen caras laterales TRIANGULARES</b>.
        </div>
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Guía Pedagógica 4.° A</span>
    <span>Página 2 de 4</span>
  </div>
</div>

<!-- PÁGINA 3: SOLUCIONES PREGUNTAS 7, 8 Y 9 -->
<div class="page">
  <div>
    <div class="header-card" style="padding: 4px 10px; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #065f46;">
        <span>COLEGIO BILINGÜE LERNER & KLEIN · GUÍA DEL EVALUADOR</span>
        <span>MATEMÁTICAS · 4.° A</span>
      </div>
    </div>

    <!-- SOLUCIÓN 7 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 7: Tienda Escolar — 9 días [20, 25, 18, 22, 25, 30, 25, 20, 15]</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso (Ejercicio 1 del cuaderno de Luciana):</b><br>
        • <b>Paso 1 (Ordenar los 9 datos de menor a mayor):</b> <code>15 - 18 - 20 - 20 - <b>[22]</b> - 25 - 25 - 25 - 30</code>.<br>
        • <b>a) Moda:</b> <code>25</code> (es el dato que más se repite, aparece 3 veces).<br>
        • <b>b) Mediana:</b> <code>22</code> (el 5.° dato que queda en el centro exacto de los 9 datos ordenados).<br>
        • <b>c) Rango:</b> <code>30 − 15 = 15</code> (distancia entre el dato mayor y el dato menor).<br>
        • <b>d) Media o promedio:</b> Suma = <code>200</code>. División: <code>200 ÷ 9 = 22</code> (o con decimal <code>22,22</code>).<br>
        <div class="rubric-box">
          <b>Rúbrica (10 pts):</b> 2 pts por ordenar, 2 pts por Moda, 2 pts por Mediana, 2 pts por Rango y 2 pts por Media.
        </div>
      </div>
    </div>

    <!-- SOLUCIÓN 8 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 8: Edades de 9 niños [9, 10, 12, 11, 10, 13, 12, 10, 8] y División 95 ÷ 9</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso (Ejercicio 5 del cuaderno de Luciana):</b><br>
        • <b>a) Ordenados:</b> <code>8 - 9 - 10 - 10 - <b>[10]</b> - 11 - 12 - 12 - 13</code> &rarr; <b>Moda = <code>10</code></b> | <b>Mediana = <code>10</code></b> | <b>Rango = <code>13 − 8 = 5</code></b>.<br>
        • <b>b) Media (95 ÷ 9):</b> Suma = <code>95</code>. Cociente entero = <code>10</code> (sobran 5). Con decimal = <code><b>10,55</b></code>.<br>
        <div class="rubric-box">
          <b>⚠️ Alerta Real del Cuaderno de Luciana:</b> En su cuaderno, al dividir <code>95 ÷ 9</code> con decimales, Luciana escribió <code>10,05</code> porque al colocar el <code>0</code> del <code>10</code> puso otro cero después de la coma. Explicarle: <code>9 × 10 = 90</code> (sobran 5); al poner la coma agregas un cero al 5 formando <code>50</code>, y <code>50 ÷ 9 = 5</code> &rarr; <b><code>10,55</code></b>.
        </div>
      </div>
    </div>

    <!-- SOLUCIÓN 9 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 9: Porcentajes C-P-A en las 2 cuadrículas del cuaderno (60% y 22%)</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso (Clase 49 del cuaderno):</b><br>
        • <b>Cuadrícula A (6 filas azules):</b> <code>60</code> cuadritos de 100 | Porcentaje: <code>60%</code> | Fracción: <code>60/100</code> (simplificada: <code>6/10 = 3/5</code>) | Decimal: <code>0,60</code> (o <code>0,6</code>).<br>
        • <b>Cuadrícula B (2 filas + 2 cuadritos):</b> <code>22</code> cuadritos de 100 | Porcentaje: <code>22%</code> | Fracción: <code>22/100</code> (o <code>11/50</code>) | Decimal: <code>0,22</code>.<br>
        <div class="rubric-box">
          <b>Rúbrica (10 pts):</b> 5 pts por completar correctamente la Cuadrícula A y 5 pts por la Cuadrícula B.
        </div>
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Guía Pedagógica 4.° A</span>
    <span>Página 3 de 4</span>
  </div>
</div>

<!-- PÁGINA 4: SOLUCIÓN PREGUNTA 10 Y SEMÁFORO DIAGNÓSTICO -->
<div class="page">
  <div>
    <div class="header-card" style="padding: 4px 10px; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #065f46;">
        <span>COLEGIO BILINGÜE LERNER & KLEIN · GUÍA DEL EVALUADOR</span>
        <span>MATEMÁTICAS · 4.° A</span>
      </div>
    </div>

    <!-- SOLUCIÓN 10 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 10: El Juego de Mesa de $60.000 (25% = 1/4 = 0,25)</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso:</b><br>
        • <b>Cuadrícula:</b> Colorea exactamente 25 cuadritos (2 filas completas de 10 + 5 cuadritos).<br>
        • <b>a) Equivalencia y valor posicional:</b> <code>25% = 25/100 = 1/4 = 0,25</code> (<b>0</b> parte entera, <b>2</b> décimas y <b>5</b> centésimas).<br>
        • <b>b) Descuento (1/4 de $60.000):</b> <code>$60.000 ÷ 4 = $15.000</code> pesos de descuento.<br>
        • <b>c) Valor final a pagar:</b> <code>$60.000 − $15.000 = $45.000</code> pesos.<br>
        <div class="rubric-box">
          <b>Rúbrica (10 pts):</b> 2 pts por pintar 25 cuadritos, 3 pts por equivalencia y descomposición posicional, 3 pts por hallar $15.000 y 2 pts por restar $45.000 y escribir la respuesta completa (R:).
        </div>
      </div>
    </div>

    <!-- SEMÁFORO PEDAGÓGICO Y PLAN DE ACCIÓN PARA LA FAMILIA -->
    <div style="border: 2px solid #059669; border-radius: 8px; padding: 10px 14px; background: #f0fdf4; margin-top: 8px;">
      <h3 style="font-size: 11pt; font-weight: 800; color: #065f46; margin: 0 0 6px 0;">
        🚦 Semáforo Diagnóstico y Plan de Acción Previo a la Evaluación (Nov 9 al 13)
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt;">
        <thead>
          <tr style="background: #e2e8f0; text-align: left;">
            <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">Nivel de Desempeño</th>
            <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">Puntaje</th>
            <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">Diagnóstico Pedagógico</th>
            <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">Plan de Acción Recomendado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 800; color: #15803d;">🟢 SUPERIOR</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 700;">90 - 100 pts</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Dominio conceptual y procedimental sobresaliente en los 5 temas.</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Felicitar a Luciana, mantener la calma y repasar 10 minutos al día jugando en la app web.</td>
          </tr>
          <tr>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 800; color: #1d4ed8;">🟢 ALTO</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 700;">80 - 89 pts</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Comprensión sólida; detalles menores en división decimal o unidades.</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Practicar las misiones interactivas de cada tema en el modo Aprender Jugando de la aplicación.</td>
          </tr>
          <tr>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 800; color: #b45309;">🟡 BÁSICO</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 700;">70 - 79 pts</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Alcanza los objetivos mínimos, pero confunde caras de prismas o método 2 de fracciones.</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Jugar el Minijuego de Fracciones, la Pastelería de Números Mixtos y el Detective 3D de Cuerpos Sólidos.</td>
          </tr>
          <tr>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 800; color: #b91c1c;">🔴 BAJO</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 700;">&lt; 70 pts</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Dificultades en la mecánica de cálculo de fracciones, media o volumen.</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Acompañar paso a paso con el enfoque C-P-A de la aplicación antes de repetir el simulacro.</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 8px; font-size: 8.5pt; color: #334155; line-height: 1.4;">
        <b>Consejo de Oro para Padres (Enfoque C-P-A de la Prof.ª Andrea Guerrero):</b> Verificar siempre que Luciana escriba la respuesta completa con sentido (<b>R: ...</b>) respondiendo exactamente a la pregunta formulada, tal como se exige en los formatos de evaluación del colegio.
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Guía Pedagógica 4.° A</span>
    <span>Página 4 de 4</span>
  </div>
</div>

</body>
</html>'''

def main():
    print("Iniciando generación de documentos y simulacros para 4.° grado...")

    # 1. Generar HTML Examen
    exam_html = build_exam_html()
    with open("simulacro_examen_matematicas.html", "w", encoding="utf-8") as f:
        f.write(exam_html)
    print("-> simulacro_examen_matematicas.html generado.")

    # 2. Generar HTML Solucionario
    sol_html = build_solution_guide_html()
    with open("solucionario_y_guia_evaluacion.html", "w", encoding="utf-8") as f:
        f.write(sol_html)
    print("-> solucionario_y_guia_evaluacion.html generado.")

    # 3. Compilación a PDF con Chrome Headless
    print("Compilando simulacro_examen_matematicas.pdf con Google Chrome...")
    subprocess.run([
        "google-chrome",
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--print-to-pdf=simulacro_examen_matematicas.pdf",
        "simulacro_examen_matematicas.html"
    ], check=True)
    print("-> simulacro_examen_matematicas.pdf listo.")

    print("Compilando solucionario_y_guia_evaluacion.pdf con Google Chrome...")
    subprocess.run([
        "google-chrome",
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--print-to-pdf=solucionario_y_guia_evaluacion.pdf",
        "solucionario_y_guia_evaluacion.html"
    ], check=True)
    print("-> solucionario_y_guia_evaluacion.pdf listo.")

    # 4. Generar previsualizaciones de imagen con pdftoppm
    os.makedirs("preview_pages", exist_ok=True)
    subprocess.run(["pdftoppm", "-png", "-r", "150", "simulacro_examen_matematicas.pdf", "preview_pages/examen_pag"], check=True)
    subprocess.run(["pdftoppm", "-png", "-r", "150", "solucionario_y_guia_evaluacion.pdf", "preview_pages/solucionario_pag"], check=True)
    print("-> Previsualizaciones PNG generadas exitosamente en ./preview_pages/")

if __name__ == "__main__":
    main()
