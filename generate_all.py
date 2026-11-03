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
        <div class="school-title">Colegio Bilingüe Lerner & Klein</div>
        <div class="badge-exam">EVALUACIÓN DE MATEMÁTICAS · TRIMESTRE 3</div>
      </div>
      <div class="header-info-grid">
        <div class="field-box"><span class="field-label">Estudiante:</span> Luciana</div>
        <div class="field-box"><span class="field-label">Grado:</span> 4.° Primaria</div>
        <div class="field-box"><span class="field-label">Fecha:</span> Noviembre 2026</div>
        <div class="field-box"><span class="field-label">Puntaje:</span> ____ / 100 pts</div>
      </div>
    </div>

    <!-- PREGUNTA 1: Fracción de un número con reparto gráfico -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 1: Fracción de un Número</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>1. Repartición de Materiales Escolares:</b> En el salón de 4.° grado hay un estuche con <b>28 marcadores de colores</b>.
        La profesora indica que <b>3/4</b> de los marcadores son de punta fina y el resto son gruesos.
      </div>
      <div style="display: flex; gap: 10px; margin-bottom: 4px;">
        <div style="flex: 1;">
          <div style="font-size: 8.5pt; margin-bottom: 3px;">
            <b>a)</b> Dibuja las 4 cajas iguales para repartir los 28 marcadores y encierra con una línea las 3 cajas tomadas:
          </div>
          <div class="work-grid" style="height: 52px;"></div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 8.5pt; margin-bottom: 3px;">
            <b>b)</b> Escribe el procedimiento numérico en 2 pasos:
          </div>
          <div class="work-grid" style="height: 52px;">
            Paso 1 (División): 28 ÷ _____ = _____<br>
            Paso 2 (Multiplicación): _____ × 3 = _____
          </div>
        </div>
      </div>
      <div class="answer-box">
        <span>Respuesta final: Hay</span>
        <div class="answer-line" style="max-width: 80px;"></div>
        <span>marcadores de punta fina en el estuche.</span>
      </div>
    </div>

    <!-- PREGUNTA 2: Problema contextual de fracciones -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 1: Fracción de un Número</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>2. La Pastelería de Luciana:</b> Para la fiesta de fin de año, se hornearon <b>30 galletas mágicas</b>.
        Los <b>2/5</b> de las galletas se decoraron con chispas de chocolate, los <b>1/3</b> con caramelo y el resto con vainilla.
      </div>
      <div class="work-grid" style="min-height: 66px; padding: 6px 10px; margin-bottom: 4px; line-height: 1.45;">
        <div class="work-grid-title">Espacio de Operaciones y Procedimiento:</div>
        • Galletas de chocolate (2/5 de 30): (30 ÷ 5) × 2 = _____ × 2 = _____ galletas.<br>
        • Galletas de caramelo (1/3 de 30): (30 ÷ 3) × 1 = _____ × 1 = _____ galletas.<br>
        • Galletas de vainilla (el resto): 30 - ( _____ + _____ ) = 30 - _____ = _____ galletas.
      </div>
      <div class="answer-box">
        <span>Respuesta: Chocolate = _____ galletas | Caramelo = _____ galletas | Vainilla = _____ galletas.</span>
      </div>
    </div>

    <!-- PREGUNTA 3: Cálculo de volumen por conteo de cubitos -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 2: Cálculo de Volumen</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>3. Conteo de Cubos Unidad:</b> Observa con atención la siguiente construcción tridimensional formada por cubitos de <b>1 cm³</b>.
        Ten en cuenta los cubos que sirven de base y que quedan ocultos en el piso inferior.
      </div>
      <div style="display: flex; gap: 14px; align-items: center;">
        <div style="text-align: center;">
          {get_svg_cube_blocks_volume(145, 110)}
          <div style="font-size: 8.5pt; font-weight: bold; color: #1e3a8a; margin-top: 2px;">🧊 1 cubito = 1 cm³</div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 8.5pt; margin-bottom: 4px;">
            <b>a)</b> ¿Cuántos cubitos hay en el piso 1 (capa base inferior)? _____ cubitos.<br>
            <b>b)</b> ¿Cuántos cubitos hay en el piso 2 (capa superior)? _____ cubitos.<br>
            <b>c)</b> ¿Cuál es el volumen total de la construcción?
          </div>
          <div class="work-grid" style="height: 38px;">
            Operación de suma: _____ + _____ = _____ cm³
          </div>
          <div class="answer-box">
            <span>Volumen Total =</span>
            <div class="answer-line" style="max-width: 90px;"></div>
            <span>cm³</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Grado 4.°</span>
    <span>Página 1 de 4</span>
  </div>
</div>

<!-- PÁGINA 2: VOLUMEN DE ORTOEDROS Y CLASIFICACIÓN DE CUERPOS 3D -->
<div class="page">
  <div>
    <div class="header-card" style="padding: 4px 10px; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #1e40af;">
        <span>COLEGIO BILINGÜE LERNER & KLEIN</span>
        <span>MATEMÁTICAS · 4.° PRIMARIA · EXAMEN TRIMESTRE 3</span>
      </div>
    </div>

    <!-- PREGUNTA 4: Volumen de prisma rectangular (fórmula) -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 2: Cálculo de Volumen</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>4. Caja de Regalo (Prisma Rectangular):</b> Luciana tiene una caja para guardar sus bloques cuyas dimensiones se muestran en la figura:
        <b>Largo = 6 cm</b>, <b>Ancho = 4 cm</b> y <b>Alto = 3 cm</b>.
      </div>
      <div style="display: flex; gap: 14px; align-items: center;">
        <div style="text-align: center;">
          {get_svg_rectangular_prism(160, 105)}
        </div>
        <div style="flex: 1;">
          <div style="font-size: 8.5pt; margin-bottom: 3px;">
            <b>a) Escribe la fórmula del volumen:</b><br>
            <code>Volumen = Largo × Ancho × Alto</code>
          </div>
          <div class="work-grid" style="height: 48px;">
            <div class="work-grid-title">Operación:</div>
            Volumen = _____ cm × _____ cm × _____ cm = __________ cm³
          </div>
          <div class="answer-box">
            <span>Respuesta: El volumen de la caja es de</span>
            <div class="answer-line" style="max-width: 80px;"></div>
            <span>cm³.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PREGUNTA 5: Tabla comparativa de Cuerpos 3D -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 3: Cuerpos Geométricos</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>5. Clasificación y Elementos:</b> Completa la siguiente tabla indicando el tipo de cuerpo (Poliedro o Redondo),
        el número de caras, aristas, vértices y la forma de su(s) base(s):
      </div>
      <table class="exam-table">
        <thead>
          <tr>
            <th>Cuerpo Geométrico</th>
            <th>Tipo (Poliedro / Redondo)</th>
            <th>Caras (F)</th>
            <th>Vértices (V)</th>
            <th>Aristas (E)</th>
            <th>Forma de la Base</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight:700;">Cubo (Hexaedro regular)</td>
            <td>Poliedro</td>
            <td>_____</td>
            <td>_____</td>
            <td>_____</td>
            <td>Cuadrado</td>
          </tr>
          <tr>
            <td style="font-weight:700;">Prisma Pentagonal</td>
            <td>_____</td>
            <td>_____</td>
            <td>_____</td>
            <td>_____</td>
            <td>Pentágono (5 lados)</td>
          </tr>
          <tr>
            <td style="font-weight:700;">Pirámide Cuadrangular</td>
            <td>_____</td>
            <td>_____</td>
            <td>_____</td>
            <td>_____</td>
            <td>Cuadrado (1 base)</td>
          </tr>
          <tr>
            <td style="font-weight:700;">Cilindro</td>
            <td>Redondo</td>
            <td>2 planas</td>
            <td>_____</td>
            <td>2 curvas</td>
            <td>Círculo</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PREGUNTA 6: Diferenciación visual de Pirámide vs Prisma -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 3: Cuerpos Geométricos</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>6. Detective de Figuras 3D:</b> Observa los dos cuerpos geométricos que dibujó Luciana en su cuaderno:
      </div>
      <div style="display: flex; justify-content: space-around; align-items: center; margin: 4px 0;">
        <div style="text-align: center; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 10px;">
          <b>Cuerpo A</b><br>
          {get_svg_square_pyramid(100, 80)}<br>
          <span style="font-size: 8pt; color: #475569;">1 base y caras triangulares</span>
        </div>
        <div style="text-align: center; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 10px;">
          <b>Cuerpo B</b><br>
          {get_svg_triangular_prism(100, 80)}<br>
          <span style="font-size: 8pt; color: #475569;">2 bases paralelas iguales</span>
        </div>
      </div>
      <div style="font-size: 8.5pt;">
        <b>a)</b> Nombre exacto del Cuerpo A: _____________________________ (¿Prisma o Pirámide?).<br>
        <b>b)</b> Nombre exacto del Cuerpo B: _____________________________ (¿Prisma o Pirámide?).<br>
        <b>c)</b> ¿Cuál es la diferencia principal entre cómo terminan arriba un prisma y una pirámide?
      </div>
      <div class="work-grid" style="height: 28px; margin-top: 3px;"></div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Grado 4.°</span>
    <span>Página 2 de 4</span>
  </div>
</div>

<!-- PÁGINA 3: MEDIDAS ESTADÍSTICAS (MODA, MEDIA, MEDIANA Y RANGO) -->
<div class="page">
  <div>
    <div class="header-card" style="padding: 4px 10px; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #1e40af;">
        <span>COLEGIO BILINGÜE LERNER & KLEIN</span>
        <span>MATEMÁTICAS · 4.° PRIMARIA · EXAMEN TRIMESTRE 3</span>
      </div>
    </div>

    <!-- PREGUNTA 7: Moda, Mediana y Rango -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 4: Medidas Estadísticas</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>7. Registro de Goles en el Recreo:</b> Durante 7 partidos de fútbol en el colegio, el equipo de 4.° grado anotó los siguientes goles:
        <div style="text-align: center; font-size: 11pt; font-weight: 800; color: #1e40af; margin: 4px 0;">
          [ 4, 7, 3, 9, 7, 5, 7 ]
        </div>
      </div>
      <div style="font-size: 8.5pt; margin-bottom: 4px;">
        <b>Paso 1:</b> Ordena obligatoriamente los 7 datos de MENOR a MAYOR:<br>
        <div style="display: flex; gap: 8px; justify-content: center; margin: 4px 0;">
          <span style="border: 1px solid #94a3b8; padding: 3px 8px; border-radius: 4px;">_____</span>
          <span style="border: 1px solid #94a3b8; padding: 3px 8px; border-radius: 4px;">_____</span>
          <span style="border: 1px solid #94a3b8; padding: 3px 8px; border-radius: 4px;">_____</span>
          <span style="border: 1px solid #94a3b8; padding: 3px 8px; border-radius: 4px;">_____</span>
          <span style="border: 1px solid #94a3b8; padding: 3px 8px; border-radius: 4px;">_____</span>
          <span style="border: 1px solid #94a3b8; padding: 3px 8px; border-radius: 4px;">_____</span>
          <span style="border: 1px solid #94a3b8; padding: 3px 8px; border-radius: 4px;">_____</span>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 4px;">
        <div class="work-grid" style="height: 58px;">
          <div class="work-grid-title">a) Hallar la MODA:</div>
          ¿Qué dato se repite más veces?<br>
          Moda = <b>_____</b> (aparece ___ veces)
        </div>
        <div class="work-grid" style="height: 58px;">
          <div class="work-grid-title">b) Hallar la MEDIANA:</div>
          ¿Qué dato queda en el centro exacto?<br>
          Mediana = <b>_____</b>
        </div>
        <div class="work-grid" style="height: 58px;">
          <div class="work-grid-title">c) Hallar el RANGO:</div>
          Mayor - Menor =<br>
          _____ - _____ = <b>_____</b>
        </div>
      </div>
    </div>

    <!-- PREGUNTA 8: Cálculo de la Media (Promedio) -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 4: Medidas Estadísticas</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>8. Promedio de Calificaciones:</b> En 5 talleres de ciencias naturales, Luciana obtuvo las siguientes notas sobre 100 puntos:
        <div style="text-align: center; font-size: 11pt; font-weight: 800; color: #1e40af; margin: 4px 0;">
          [ 85, 90, 75, 100, 90 ]
        </div>
      </div>
      <div style="font-size: 8.5pt; margin-bottom: 4px;">
        Calcula la <b>Media aritmética (Promedio)</b> realizando la suma total y la división correspondiente:
      </div>
      <div style="display: flex; gap: 10px;">
        <div class="work-grid" style="flex: 1; height: 60px;">
          <div class="work-grid-title">Paso 1: Suma de las 5 notas:</div>
          85 + 90 + 75 + 100 + 90 = __________
        </div>
        <div class="work-grid" style="flex: 1; height: 60px;">
          <div class="work-grid-title">Paso 2: División entre N = 5:</div>
          __________ ÷ 5 = __________
        </div>
      </div>
      <div class="answer-box">
        <span>Respuesta: La Media (Promedio) de Luciana es de</span>
        <div class="answer-line" style="max-width: 70px;"></div>
        <span>puntos.</span>
      </div>
    </div>

    <!-- PREGUNTA 9: Porcentajes en cuadrícula de 100 -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 5: Porcentajes</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>9. El Trío Matemático en la Cuadrícula:</b> Observa la cuadrícula de 10×10 (100 casillas en total) que tiene una parte sombreada:
      </div>
      <div style="display: flex; gap: 14px; align-items: center;">
        <div style="text-align: center;">
          {get_svg_grid_100(35, 115, 115)}
        </div>
        <div style="flex: 1; font-size: 8.5pt;">
          <b>a)</b> Cuenta las casillas sombreadas: Hay <b>_____</b> casillas azules.<br>
          <b>b)</b> Expresa como <b>Porcentaje</b>: <b>_____%</b>.<br>
          <b>c)</b> Expresa como <b>Fracción Decimal</b>: <span style="font-size:10pt;">_____ / 100</span>.<br>
          <b>d)</b> Expresa como <b>Número Decimal</b>: <b>0._____</b>.<br>
          <b>e)</b> ¿Qué significa en palabras? Significa _____ de cada _____ partes.
        </div>
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Grado 4.°</span>
    <span>Página 3 de 4</span>
  </div>
</div>

<!-- PÁGINA 4: PROBLEMAS DE APLICACIÓN DE PORCENTAJES Y AUTOEVALUACIÓN -->
<div class="page">
  <div>
    <div class="header-card" style="padding: 4px 10px; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #1e40af;">
        <span>COLEGIO BILINGÜE LERNER & KLEIN</span>
        <span>MATEMÁTICAS · 4.° PRIMARIA · EXAMEN TRIMESTRE 3</span>
      </div>
    </div>

    <!-- PREGUNTA 10: Aplicación de Porcentajes en Compras -->
    <div class="question-card">
      <div class="question-header">
        <span class="q-badge">Tema 5: Porcentajes</span>
        <span class="q-points">10 Puntos</span>
      </div>
      <div class="q-text">
        <b>10. Descuento en la Tienda de Juegos:</b> En una librería infantil, un juego de mesa de estrategia cuesta <b>$60.000 pesos</b>.
        Por ser la semana del estudiante, tiene un <b>25% de descuento</b>.
      </div>
      <div style="display: flex; gap: 12px; margin-bottom: 4px;">
        <div style="text-align: center;">
          <div style="font-size: 7.5pt; font-weight: 700; margin-bottom: 2px;">Sombrea el 25% (25 casillas):</div>
          {get_svg_grid_100(0, 110, 110)}
        </div>
        <div style="flex: 1; font-size: 8.5pt;">
          <b>a)</b> Sabemos que 25% equivale a la fracción simplificada <b>1/4</b> (la cuarta parte).<br>
          <b>b)</b> Calcula el valor en dinero del descuento (1/4 de $60.000):
          <div class="work-grid" style="height: 38px; margin: 3px 0;">
            $60.000 ÷ 4 = $________________ pesos de descuento.
          </div>
          <b>c)</b> ¿Cuánto pagará finalmente Luciana por el juego con el descuento aplicado?
          <div class="work-grid" style="height: 38px; margin: 3px 0;">
            $60.000 - $________________ = $________________ pesos.
          </div>
        </div>
      </div>
      <div class="answer-box">
        <span>Respuesta final: El precio con descuento es de $</span>
        <div class="answer-line" style="max-width: 110px;"></div>
        <span>pesos.</span>
      </div>
    </div>

    <!-- CUADRO DE REPASO PEDAGÓGICO / SEMÁFORO DEL ESTUDIANTE -->
    <div style="border: 2px solid #3b82f6; border-radius: 8px; padding: 8px 12px; background: #eff6ff; margin-top: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-weight: 800; font-size: 9.5pt; color: #1e40af;">🎯 Resumen y Control del Evaluador:</span>
        <span style="font-size: 8pt; font-weight: 700; color: #64748b;">Colegio Bilingüe Lerner & Klein</span>
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
            <td>1. Fracción de un número</td>
            <td>1 y 2</td>
            <td>20 pts</td>
            <td>_____ / 20</td>
            <td>🟢 Verde (≥18) | 🟡 Amarillo (14-17) | 🔴 Rojo (&lt;14)</td>
          </tr>
          <tr>
            <td>2. Cálculo de volumen</td>
            <td>3 y 4</td>
            <td>20 pts</td>
            <td>_____ / 20</td>
            <td>🟢 Verde (≥18) | 🟡 Amarillo (14-17) | 🔴 Rojo (&lt;14)</td>
          </tr>
          <tr>
            <td>3. Cuerpos geométricos (caras/aristas/vértices)</td>
            <td>5 y 6</td>
            <td>20 pts</td>
            <td>_____ / 20</td>
            <td>🟢 Verde (≥18) | 🟡 Amarillo (14-17) | 🔴 Rojo (&lt;14)</td>
          </tr>
          <tr>
            <td>4. Moda, media, mediana y rango</td>
            <td>7 y 8</td>
            <td>20 pts</td>
            <td>_____ / 20</td>
            <td>🟢 Verde (≥18) | 🟡 Amarillo (14-17) | 🔴 Rojo (&lt;14)</td>
          </tr>
          <tr>
            <td>5. Porcentajes (cuadrícula, fracción y decimal)</td>
            <td>9 y 10</td>
            <td>20 pts</td>
            <td>_____ / 20</td>
            <td>🟢 Verde (≥18) | 🟡 Amarillo (14-17) | 🔴 Rojo (&lt;14)</td>
          </tr>
          <tr style="font-weight: 800; background: #f8fafc;">
            <td colspan="2" style="text-align: right;">TOTAL EVALUACIÓN:</td>
            <td>100 pts</td>
            <td>_____ / 100</td>
            <td>Nota Escolar: ____________________</td>
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
          Firma de Luciana (Estudiante)
        </div>
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Grado 4.°</span>
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
<title>Solucionario y Guía Pedagógica de Evaluación - Grado 4.°</title>
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
        <div class="school-title">Colegio Bilingüe Lerner & Klein</div>
        <div class="badge-guide">GUÍA PEDAGÓGICA Y SOLUCIONARIO OFICIAL · TRIMESTRE 3</div>
      </div>
      <div style="font-size: 8.5pt; color: #047857; font-weight: 600;">
        Herramienta de acompañamiento para padres y evaluadores. Criterios de evaluación para 4.° Grado (Evaluación Nov 9-13).
      </div>
    </div>

    <!-- SOLUCIÓN 1 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 1: Fracción de un número (28 marcadores, 3/4)</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso:</b><br>
        • <b>Paso 1 (División):</b> 28 marcadores ÷ 4 cajas = <code>7 marcadores en cada caja</code>.<br>
        • <b>Paso 2 (Multiplicación):</b> 7 marcadores × 3 cajas = <code>21 marcadores</code>.<br>
        • <b>Respuesta final correcta:</b> 21 marcadores de punta fina.<br>
        <div class="rubric-box">
          <b>Rúbrica de Calificación (10 pts):</b><br>
          - <b>10 pts:</b> Dibuja las 4 cajas con 7 elementos cada una, encierra 3 cajas y escribe 21.<br>
          - <b>6 pts:</b> Realiza las operaciones numéricas correctamente (28 ÷ 4 = 7; 7 × 3 = 21) pero omite el gráfico.<br>
          - <b>3 pts:</b> Divide entre 4 pero olvida multiplicar por 3 (responde 7).<br>
          <b>💡 Error típico de 4.°:</b> Multiplicar primero por 4 y dividir entre 3, o responder solo el resultado de la división.
        </div>
      </div>
    </div>

    <!-- SOLUCIÓN 2 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 2: Problema contextual de galletas (30 en total)</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso:</b><br>
        • <b>Chocolate (2/5 de 30):</b> (30 ÷ 5) × 2 = 6 × 2 = <code>12 galletas</code>.<br>
        • <b>Caramelo (1/3 de 30):</b> (30 ÷ 3) × 1 = <code>10 galletas</code>.<br>
        • <b>Vainilla (el resto):</b> 30 - (12 + 10) = 30 - 22 = <code>8 galletas</code>.<br>
        <div class="rubric-box">
          <b>Rúbrica de Calificación (10 pts):</b><br>
          - <b>10 pts:</b> Los 3 valores son exactos con procedimiento claro (Chocolate: 12, Caramelo: 10, Vainilla: 8).<br>
          - <b>7 pts:</b> Calcula bien chocolate (12) y caramelo (10), pero falla en la resta final del resto.<br>
          - <b>4 pts:</b> Calcula correctamente al menos una de las dos fracciones.
        </div>
      </div>
    </div>

    <!-- SOLUCIÓN 3 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 3: Cálculo de volumen por conteo de cubitos</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso:</b><br>
        • <b>Piso 1 (Base inferior):</b> Tiene 3 cubos de largo por 2 de fondo = <code>3 × 2 = 6 cubitos</code> (incluye los cubos ocultos debajo de la capa superior).<br>
        • <b>Piso 2 (Capa superior):</b> Tiene <code>2 cubitos</code> visibles en la fila trasera.<br>
        • <b>Volumen Total:</b> 6 + 2 = <code>8 cm³</code>.<br>
        <div class="rubric-box">
          <b>Rúbrica de Calificación (10 pts):</b><br>
          - <b>10 pts:</b> Identifica los 6 cubitos de la base, los 2 de la parte superior y suma 8 cm³.<br>
          - <b>6 pts:</b> Olvida los cubitos ocultos y cuenta solo las caras que ve superficialmente (responde 6 o 7).<br>
          <b>💡 Cómo guiar a la niña:</b> "Imagínate que estás construyendo una torre de Lego. Para que el segundo piso no se caiga, ¡debajo tiene que haber cubitos que sostengan el piso!".
        </div>
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Guía Pedagógica</span>
    <span>Página 1 de 4</span>
  </div>
</div>

<!-- PÁGINA 2: SOLUCIONES PREGUNTAS 4, 5 Y 6 -->
<div class="page">
  <div>
    <div class="header-card" style="padding: 4px 10px; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #065f46;">
        <span>COLEGIO BILINGÜE LERNER & KLEIN · GUÍA DEL EVALUADOR</span>
        <span>MATEMÁTICAS · 4.° PRIMARIA</span>
      </div>
    </div>

    <!-- SOLUCIÓN 4 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 4: Volumen de prisma rectangular (6 × 4 × 3 cm)</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso:</b><br>
        • <b>Fórmula:</b> Volumen = Largo × Ancho × Alto.<br>
        • <b>Sustitución y cálculo:</b> 6 cm × 4 cm × 3 cm = 24 × 3 = <code>72 cm³</code>.<br>
        <div class="rubric-box">
          <b>Rúbrica de Calificación (10 pts):</b><br>
          - <b>10 pts:</b> Aplica la multiplicación de las 3 dimensiones, obtiene 72 y coloca la unidad cúbica (cm³).<br>
          - <b>8 pts:</b> Obtiene 72 pero olvida o coloca mal la unidad (ej: cm o cm²).<br>
          - <b>5 pts:</b> Multiplica solo dos dimensiones (6 × 4 = 24, área de la base) y olvida multiplicar por la altura.
        </div>
      </div>
    </div>

    <!-- SOLUCIÓN 5 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 5: Tabla comparativa de Cuerpos 3D</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución de la Tabla:</b><br>
        1. <b>Cubo:</b> Poliedro | Caras: <b>6</b> | Vértices: <b>8</b> | Aristas: <b>12</b> | Base: Cuadrado.<br>
        2. <b>Prisma Pentagonal:</b> Poliedro | Caras: <b>7</b> (5+2) | Vértices: <b>10</b> (2×5) | Aristas: <b>15</b> (3×5) | Base: Pentágono.<br>
        3. <b>Pirámide Cuadrangular:</b> Poliedro | Caras: <b>5</b> (4+1) | Vértices: <b>5</b> (4+1) | Aristas: <b>8</b> (2×4) | Base: Cuadrado.<br>
        4. <b>Cilindro:</b> Redondo | Caras: 2 planas | Vértices: <b>0</b> | Aristas: 2 curvas | Base: Círculo.<br>
        <div class="rubric-box">
          <b>Rúbrica de Calificación (10 pts):</b> 2.5 pts por cada fila completada con exactitud.<br>
          <b>💡 Reglas mnemotécnicas para repasar con Luciana:</b><br>
          - En <b>prismas</b>: Vértices = el doble de lados de la base (2n); Aristas = el triple (3n).<br>
          - En <b>pirámides</b>: Caras y Vértices son siempre iguales entre sí (n + 1). ¡Tienen la misma cantidad!
        </div>
      </div>
    </div>

    <!-- SOLUCIÓN 6 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 6: Distinción de Pirámide vs Prisma</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso:</b><br>
        • <b>a) Cuerpo A:</b> Pirámide cuadrangular (tiene 1 base cuadrada y 4 caras triangulares).<br>
        • <b>b) Cuerpo B:</b> Prisma triangular (tiene 2 bases triangulares paralelas e iguales y 3 caras laterales rectangulares).<br>
        • <b>c) Diferencia conceptual:</b> Las pirámides terminan en un solo punto llamado <b>cúspide o ápice</b>, mientras que los prismas tienen <b>dos bases planas iguales</b> arriba y abajo.<br>
        <div class="rubric-box">
          <b>Rúbrica (10 pts):</b> 3 pts por nombre exacto de A, 3 pts por nombre exacto de B, 4 pts por la explicación clara de bases vs cúspide.
        </div>
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Guía Pedagógica</span>
    <span>Página 2 de 4</span>
  </div>
</div>

<!-- PÁGINA 3: SOLUCIONES PREGUNTAS 7, 8 Y 9 -->
<div class="page">
  <div>
    <div class="header-card" style="padding: 4px 10px; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #065f46;">
        <span>COLEGIO BILINGÜE LERNER & KLEIN · GUÍA DEL EVALUADOR</span>
        <span>MATEMÁTICAS · 4.° PRIMARIA</span>
      </div>
    </div>

    <!-- SOLUCIÓN 7 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 7: Moda, Mediana y Rango de [4, 7, 3, 9, 7, 5, 7]</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso:</b><br>
        • <b>Paso 1 (Ordenar de menor a mayor):</b> <code>[ 3, 4, 5, 7, 7, 7, 9 ]</code>.<br>
        • <b>a) Moda:</b> El dato con mayor frecuencia es <code>7</code> (aparece 3 veces).<br>
        • <b>b) Mediana:</b> Como hay 7 datos (impar), la mediana es el 4.° dato que queda en el centro exacto: <code>7</code>.<br>
        • <b>c) Rango:</b> Dato mayor (9) menos dato menor (3) = <code>9 - 3 = 6</code>.<br>
        <div class="rubric-box">
          <b>Rúbrica de Calificación (10 pts):</b><br>
          - 2.5 pts por ordenar correctamente la serie.<br>
          - 2.5 pts por Moda = 7 con justificación.<br>
          - 2.5 pts por Mediana = 7 señalando la posición central.<br>
          - 2.5 pts por Rango = 6 con la resta 9 - 3.<br>
          <b>💡 Error crítico de primaria:</b> Buscar la mediana sin ordenar primero los datos originales (daría 9 en vez de 7).
        </div>
      </div>
    </div>

    <!-- SOLUCIÓN 8 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 8: Media (Promedio) de notas [85, 90, 75, 100, 90]</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso:</b><br>
        • <b>Paso 1 (Suma de notas):</b> 85 + 90 + 75 + 100 + 90 = <code>440 puntos</code>.<br>
        • <b>Paso 2 (División entre N = 5):</b> 440 ÷ 5 = <code>88 puntos</code>.<br>
        • <b>Respuesta final:</b> La Media (Promedio) es de 88 puntos.<br>
        <div class="rubric-box">
          <b>Rúbrica de Calificación (10 pts):</b><br>
          - <b>10 pts:</b> Suma correctamente 440, divide entre 5 y obtiene 88.<br>
          - <b>6 pts:</b> Plantea la suma y la división correctamente pero comete un error de cálculo aritmético menor.<br>
          - <b>3 pts:</b> Suma las notas pero no realiza la división entre 5.
        </div>
      </div>
    </div>

    <!-- SOLUCIÓN 9 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 9: Porcentajes en cuadrícula (35 casillas)</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso (El Trío Matemático):</b><br>
        • <b>a) Conteo:</b> 35 casillas sombreadas.<br>
        • <b>b) Porcentaje:</b> <code>35%</code>.<br>
        • <b>c) Fracción Decimal:</b> <code>35/100</code> (simplificada: 7/20).<br>
        • <b>d) Número Decimal:</b> <code>0.35</code>.<br>
        • <b>e) Significado:</b> Significa 35 de cada 100 partes.<br>
        <div class="rubric-box">
          <b>Rúbrica de Calificación (10 pts):</b> 2 pts por cada inciso correcto.
        </div>
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Guía Pedagógica</span>
    <span>Página 3 de 4</span>
  </div>
</div>

<!-- PÁGINA 4: SOLUCIÓN PREGUNTA 10 Y SEMÁFORO DIAGNÓSTICO -->
<div class="page">
  <div>
    <div class="header-card" style="padding: 4px 10px; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #065f46;">
        <span>COLEGIO BILINGÜE LERNER & KLEIN · GUÍA DEL EVALUADOR</span>
        <span>MATEMÁTICAS · 4.° PRIMARIA</span>
      </div>
    </div>

    <!-- SOLUCIÓN 10 -->
    <div class="sol-card">
      <div class="sol-header">
        <span style="color:#059669;">Pregunta 10: Descuento comercial del 25% sobre $60.000</span>
        <span style="color:#92400e;">Valor: 10 Puntos</span>
      </div>
      <div class="sol-content">
        <b>Solución Paso a Paso:</b><br>
        • <b>Dibujo:</b> Sombrea exactamente 25 casillas (2 filas y media o un bloque de 5×5).<br>
        • <b>b) Valor del descuento (1/4 de $60.000):</b> $60.000 ÷ 4 = <code>$15.000 pesos</code>.<br>
        • <b>c) Precio final a pagar:</b> $60.000 - $15.000 = <code>$45.000 pesos</code>.<br>
        <div class="rubric-box">
          <b>Rúbrica de Calificación (10 pts):</b><br>
          - 3 pts por sombrear 25 casillas.<br>
          - 4 pts por calcular el descuento de $15.000.<br>
          - 3 pts por restar correctamente y responder $45.000.
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
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Comprensión sólida; errores menores en conteo o unidades de volumen.</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Revisar con calma la pregunta fallada e insistir en leer con atención los enunciados.</td>
          </tr>
          <tr>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 800; color: #b45309;">🟡 BÁSICO</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 700;">70 - 79 pts</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Alcanza los objetivos mínimos, pero confunde mediana sin ordenar o fórmulas de prismas.</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Realizar 1 sesión guiada en el modo "Aprender" con el visor 3D y la cuadrícula interactiva de 100.</td>
          </tr>
          <tr>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 800; color: #b91c1c;">🔴 BAJO</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 700;">&lt; 70 pts</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Dificultades en la mecánica de cálculo de fracciones o concepto de volumen.</td>
            <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">Acompañar paso a paso con material concreto (bloques Lego o granos de fríjol para repartir).</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 8px; font-size: 8.5pt; color: #334155; line-height: 1.4;">
        <b>Consejo de Oro para Padres:</b> Las matemáticas en 4.° grado se consolidan cuando la niña visualiza el concepto antes de memorizar la fórmula.
        Usen el laboratorio 3D en pantalla y la cuadrícula de colores para que el aprendizaje sea un juego emocionante y no una carga de estrés.
      </div>
    </div>
  </div>

  <div class="footer-row">
    <span>Colegio Bilingüe Lerner & Klein · Guía Pedagógica</span>
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
