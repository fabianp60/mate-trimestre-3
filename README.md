# Aventura Matemática de Luciana · Trimestre 3 🌟📐

> 🎮 **Jugar en línea en GitHub Pages:** **[https://fabianp60.github.io/mate-trimestre-3/](https://fabianp60.github.io/mate-trimestre-3/)**  
> 📄 **Examen Imprimible (PDF):** **[Descargar Cuadernillo](https://fabianp60.github.io/mate-trimestre-3/simulacro_examen_matematicas.pdf)** | 📘 **[Guía y Solucionario](https://fabianp60.github.io/mate-trimestre-3/solucionario_y_guia_evaluacion.pdf)**

Aplicación web interactiva, gamificada y material de evaluación oficial para **4.° Grado de Primaria** del **Colegio Bilingüe Lerner & Klein**, diseñada específicamente para preparar con éxito las evaluaciones del **Tercer Trimestre (semana del 9 al 13 de noviembre)**.

---

## 🎯 Temas Evaluados (100% Alineados a la Circular Oficial)

1. **🍰 Fracción de un número:**
   - Algoritmo de dos pasos: `(Total ÷ Denominador) × Numerador`.
   - Laboratorio interactivo de repartición con cajas y elementos visuales.
   - Resolución de problemas verbales y cotidianos contextualizados.

2. **📦 Cálculo de volumen:**
   - Concepto de unidad cúbica ($u^3$ o $\text{cm}^3$).
   - Conteo visual e interactivo de cubitos unidad en construcciones 3D (incluyendo cubos de base y ocultos).
   - Fórmula del ortoedro / prisma rectangular: $\text{Volumen} = \text{Largo} \times \text{Ancho} \times \text{Alto}$ ($V = l \times a \times h$).
   - Visor 3D en tiempo real con modo Rayos X (semitransparencia) y separación de capas.

3. **🔷 Clasificación de cuerpos geométricos (Caras, Aristas y Vértices):**
   - **Poliedros:** Prismas (triangular, cuadrangular, pentagonal, hexagonal, cubo) vs. Pirámides (triangular, cuadrangular, pentagonal, hexagonal).
   - **Cuerpos redondos (de revolución):** Cilindro, Cono y Esfera.
   - Identificación de bases, caras laterales, aristas (basales y laterales), vértices y cúspide/ápice.
   - Relación mágica de Euler para poliedros: $\text{Caras} + \text{Vértices} = \text{Aristas} + 2$.
   - Visor 3D rotatorio con resaltado selectivo de caras, aristas y vértices brillantes.

4. **📊 Medidas estadísticas (Moda, Media, Mediana y Rango):**
   - **Media (Promedio):** Suma de todos los datos dividida entre el total de datos.
   - **Mediana:** Regla de oro de primaria: ¡Ordenar obligatoriamente de menor a mayor antes de ubicar el centro exacto!
   - **Moda:** El dato o valor que tiene la mayor frecuencia (más repetido).
   - **Rango:** Amplitud o dispersión ($\text{Dato Mayor} - \text{Dato Menor}$).
   - Tarjetas interactivas animadas con botón de ordenamiento automático.

5. **💯 Porcentajes (Cuadrícula 100, Fracción y Decimal):**
   - Concepto de porcentaje: partes tomadas de cada 100.
   - **Cuadrícula interactiva de $10 \times 10$ (100 casillas)** para colorear con un clic o arrastre.
   - **El Trío Matemático:** Conversión instantánea entre Porcentaje (%), Fracción decimal/simplificada y Número decimal ($0.XX$).
   - Problemas prácticos de descuentos comerciales (ej. $25\%$ como la cuarta parte, $50\%$ como la mitad).

---

## 🎮 Aplicación Web Gamificada (Sin dependencias inseguras de NPM)

La aplicación fue desarrollada con **HTML5, CSS3, JavaScript puro y Three.js local**, sin utilizar `npm` ni paquetes externos que puedan comprometer la seguridad:

- **Efectos de sonido sintetizados:** Creados en tiempo real mediante la **Web Audio API** del navegador (cero archivos `.mp3` externos o enlaces rotos).
- **Celebraciones visuales:** Sistema de confeti en HTML5 Canvas nativo.
- **HUD y Gamificación:** Barra de experiencia (XP), niveles progresivos con títulos motivadores, estrellas doradas ⭐, contador de racha 🔥 y 12 insignias coleccionables 🏆.
- **Personalización de perfil:** Selector de avatar (🦊 Zorrito, 🦉 Lechuza, 🐱 Gatito espacial, 🐼 Panda, etc.) y guardado del nombre en `localStorage`.
- **Modos de juego:**
  1. **📖 Modo Aprender:** Lecciones guiadas con laboratorios manipulables interactivos.
  2. **🎯 Modo Practicar:** Minijuegos y desafíos con pistas pedagógicas y explicaciones inmediatas.
  3. **📝 Modo Evaluar:** Simulacro de examen oficial de 15 preguntas con semáforo pedagógico (Verde > 90, Amarillo 70-89, Rojo < 70) y diploma de honor imprimible.

---

## 🚀 Cómo Usar y Ejecutar

### Opción 1: Servidor Web Local (Docker Compose) - Puerto 3103
La aplicación ya está configurada para servirse de manera instantánea en tu red local:
```bash
docker compose up -d
```
Abre en cualquier navegador en tu PC, tablet o teléfono:
👉 **`http://localhost:3103/`**

### Opción 2: Abrir directamente sin servidor
Al ser 100% autónoma y contar con Three.js en la carpeta local `lib/`, puedes abrir directamente el archivo `index.html` en Google Chrome, Edge o Firefox.

---

## 🖨️ Documentos Oficiales Imprimibles (PDF / HTML)

Para apoyar el estudio con lápiz y papel, se diseñaron dos documentos de alta calidad tipográfica en formato **Carta (Letter, 8.5" × 11")**:

1. **[simulacro_examen_matematicas.pdf](file:///home/fabian/projects/estudiar-mate-3/simulacro_examen_matematicas.pdf)**  
   *Cuadernillo de Examen para la Estudiante (4 páginas)*
   - Membrete oficial del Colegio Bilingüe Lerner & Klein.
   - 10 preguntas desafiantes con diagramas vectoriales SVG nítidos y cajas espaciosas con cuadrícula de puntos guía.
   - Puntuación total: **100 puntos** (10 puntos por pregunta).

2. **[solucionario_y_guia_evaluacion.pdf](file:///home/fabian/projects/estudiar-mate-3/solucionario_y_guia_evaluacion.pdf)**  
   *Guía Pedagógica y Solucionario para Padres / Evaluadores (4 páginas)*
   - Procedimientos matemáticos explicados paso a paso.
   - Rúbricas analíticas para calificar procedimientos y resultados.
   - Explicación de los errores típicos de primaria y cómo guiar a Luciana con empatía.
   - Semáforo diagnóstico y plan de acción de estudio previo al 9-13 de noviembre.

3. **[generate_all.py](file:///home/fabian/projects/estudiar-mate-3/generate_all.py)**  
   Script automatizado en Python para recompilar los PDFs y regenerar las previsualizaciones en `./preview_pages/`.

---

## 📁 Estructura del Proyecto

```
estudiar-mate-3/
├── index.html                           # Aplicación web interactiva principal
├── style.css                            # Sistema de diseño moderno, responsivo y gamificado
├── app.js                              # Lógica de juego, Three.js, Web Audio y simulacros
├── lib/
│   ├── three.min.js                     # Librería Three.js (local y segura, sin npm)
│   └── OrbitControls.js                 # Controles de órbita para manipulación 3D
├── simulacro_examen_matematicas.html    # Examen imprimible en HTML
├── simulacro_examen_matematicas.pdf     # Examen compilado en PDF listo para imprimir
├── solucionario_y_guia_evaluacion.html  # Guía pedagógica y respuestas en HTML
├── solucionario_y_guia_evaluacion.pdf   # Guía compilada en PDF listo para imprimir
├── generate_all.py                     # Compilador con Google Chrome Headless
├── preview_pages/                       # Previsualizaciones PNG en alta resolución (150 DPI)
├── Dockerfile                           # Contenedor Nginx ligero
├── docker-compose.yml                   # Orquestación Docker (puerto 3103)
└── README.md                            # Guía completa del proyecto
```
