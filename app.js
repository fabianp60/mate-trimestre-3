/* =========================================================
   Aventura Matemática de Luciana · Trimestre 3
   Colegio Bilingüe Lerner & Klein · Grado 4.°
   Código JavaScript Modular, Seguro y Gamificado (Sin NPM)
   ========================================================= */

'use strict';

/* ---------- Utilidades Generales ---------- */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickRandom = arr => arr[randInt(0, arr.length - 1)];
const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ---------- Estado y Persistencia Local ---------- */
const STORAGE_KEY = 'aventura_mate3_luciana_v1';

const defaultState = () => ({
  name: 'Luciana',
  avatar: '🦊',
  xp: 0,
  stars: 0,
  streak: 0,
  maxStreak: 0,
  sound: true,
  examBest: null,
  examHistory: [],
  completedLessons: {},
  badges: {},
  mastery: {
    fraction: [],
    volume: [],
    shapes: [],
    stats: [],
    percent: []
  }
});

let S = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Object.assign(defaultState(), JSON.parse(saved)) : defaultState();
  } catch (e) {
    console.warn('No se pudo acceder a localStorage, usando estado en memoria.', e);
    return defaultState();
  }
})();

const saveState = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
  } catch (e) {}
};

/* ---------- Configuración de Temas ---------- */
const TOPICS = {
  fraction: {
    id: 'fraction',
    name: 'Fracción de un número',
    badge: 'Tema 1',
    icon: '🍰',
    desc: 'Aprende a calcular partes de una cantidad dividiendo entre el denominador y multiplicando por el numerador.',
    color: '#ec4899',
    tip: 'Recuerda la regla de oro: (Total ÷ Denominador) × Numerador.'
  },
  volume: {
    id: 'volume',
    name: 'Cálculo de volumen',
    badge: 'Tema 2',
    icon: '📦',
    desc: 'Descubre el espacio 3D que ocupa un cuerpo contando cubitos unidad o multiplicando Largo × Ancho × Alto.',
    color: '#3b82f6',
    tip: 'El volumen mide el espacio en 3D en cubitos (u³ o cm³).'
  },
  shapes: {
    id: 'shapes',
    name: 'Cuerpos geométricos (Caras, Aristas y Vértices)',
    badge: 'Tema 3',
    icon: '🔷',
    desc: 'Clasifica poliedros (prismas y pirámides) y cuerpos redondos explorando sus caras, vértices y aristas en 3D.',
    color: '#8b5cf6',
    tip: 'Prismas tienen 2 bases iguales; pirámides tienen 1 base y 1 cúspide; los redondos ruedan.'
  },
  stats: {
    id: 'stats',
    name: 'Moda, Media, Mediana y Rango',
    badge: 'Tema 4',
    icon: '📊',
    desc: 'Domina las medidas estadísticas: ordena datos, encuentra el centro, el valor más repetido y la amplitud.',
    color: '#10b981',
    tip: '¡Para la mediana siempre ordena primero los datos de menor a mayor!'
  },
  percent: {
    id: 'percent',
    name: 'Porcentajes (Cuadrícula 100, Fracción y Decimal)',
    badge: 'Tema 5',
    icon: '💯',
    desc: 'Conecta el Trío Matemático: partes de 100 en cuadrícula, fracciones decimales y números decimales.',
    color: '#f59e0b',
    tip: '25% = 1/4 = 0.25 | 50% = 1/2 = 0.50 | 75% = 3/4 = 0.75.'
  }
};

/* ---------- Sistema de Niveles y Gamificación ---------- */
const TITLES = [
  'Exploradora Curiosa',
  'Aprendiz de Formas',
  'Detective de Números',
  'Arquitecta de Cubos',
  'Maestra de Porcentajes',
  'Científica de Datos',
  'Genio Matemática',
  'Gran Campeona Lerner & Klein'
];

const getLevel = () => Math.floor(S.xp / 100) + 1;
const getLevelTitle = () => TITLES[Math.min(getLevel() - 1, TITLES.length - 1)];

function addXP(amount) {
  const currentLvl = getLevel();
  S.xp += amount;
  saveState();
  updateHUD();
  const nextLvl = getLevel();
  if (nextLvl > currentLvl) {
    showToast(`🎉 ¡Felicidades! Subiste al Nivel ${nextLvl}: ${getLevelTitle()}`);
    Sound.win();
    launchConfetti();
    checkBadges();
  }
}

function addStar() {
  S.stars += 1;
  saveState();
  updateHUD();
  checkBadges();
}

function recordAnswer(topicId, isCorrect) {
  if (!S.mastery[topicId]) S.mastery[topicId] = [];
  S.mastery[topicId].push(isCorrect);
  if (S.mastery[topicId].length > 15) S.mastery[topicId].shift();

  if (isCorrect) {
    S.streak += 1;
    if (S.streak > S.maxStreak) S.maxStreak = S.streak;
    addXP(15 + Math.min(S.streak * 2, 20));
    addStar();
    Sound.ok();
  } else {
    S.streak = 0;
    Sound.error();
  }
  saveState();
  updateHUD();
  checkBadges();
}

function getTopicMasteryPercent(topicId) {
  const h = S.mastery[topicId];
  if (!h || h.length < 3) return null;
  const rights = h.filter(Boolean).length;
  return Math.round((rights / h.length) * 100);
}

/* ---------- Insignias y Logros ---------- */
const BADGES_DEF = [
  { id: 'first_play', icon: '🚀', name: 'Primer Paso', desc: 'Completar tu primera actividad práctica', check: () => S.xp > 0 },
  { id: 'streak_3', icon: '🔥', name: 'En Racha', desc: 'Conseguir 3 respuestas correctas seguidas', check: () => S.maxStreak >= 3 },
  { id: 'streak_7', icon: '⚡', name: 'Mente Brillante', desc: 'Conseguir 7 respuestas correctas seguidas', check: () => S.maxStreak >= 7 },
  { id: 'all_lessons', icon: '📚', name: 'Cerebro Sabio', desc: 'Explorar las 5 lecciones interactivas', check: () => Object.keys(S.completedLessons).length >= 5 },
  { id: 'master_fraction', icon: '🍰', name: 'Chef Fraccionario', desc: 'Lograr > 85% de dominio en Fracción de un número', check: () => (getTopicMasteryPercent('fraction') || 0) >= 85 },
  { id: 'master_volume', icon: '📦', name: 'Arquitecta 3D', desc: 'Lograr > 85% de dominio en Cálculo de volumen', check: () => (getTopicMasteryPercent('volume') || 0) >= 85 },
  { id: 'master_shapes', icon: '🔷', name: 'Geómetra Experta', desc: 'Lograr > 85% de dominio en Cuerpos geométricos', check: () => (getTopicMasteryPercent('shapes') || 0) >= 85 },
  { id: 'master_stats', icon: '📊', name: 'Estadística Veloz', desc: 'Lograr > 85% de dominio en Moda, Media, Mediana y Rango', check: () => (getTopicMasteryPercent('stats') || 0) >= 85 },
  { id: 'master_percent', icon: '💯', name: 'Centena Perfecta', desc: 'Lograr > 85% de dominio en Porcentajes', check: () => (getTopicMasteryPercent('percent') || 0) >= 85 },
  { id: 'stars_15', icon: '🌟', name: 'Cazadora de Estrellas', desc: 'Acumular 15 o más estrellas doradas', check: () => S.stars >= 15 },
  { id: 'exam_done', icon: '📝', name: 'Valiente en Examen', desc: 'Completar tu primer simulacro de examen', check: () => S.examBest !== null },
  { id: 'exam_superior', icon: '👑', name: 'Excelencia Lerner & Klein', desc: 'Sacar 90 o más en el Simulacro de Examen', check: () => (S.examBest || 0) >= 90 }
];

function checkBadges() {
  BADGES_DEF.forEach(b => {
    if (!S.badges[b.id] && b.check()) {
      S.badges[b.id] = true;
      saveState();
      setTimeout(() => {
        showToast(`🏆 ¡Nueva Insignia Desbloqueada: ${b.icon} ${b.name}!`);
        Sound.win();
        launchConfetti();
      }, 300);
    }
  });
}

/* ---------- Motor de Sonido Sintetizado (Web Audio API) ---------- */
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

const Sound = {
  tone(freq, duration = 0.12, type = 'sine', delay = 0, vol = 0.15) {
    if (!S.sound) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration + 0.05);
    } catch (e) {}
  },
  ok() {
    Sound.tone(587.33, 0.1, 'sine', 0); // D5
    Sound.tone(880.00, 0.18, 'sine', 0.1); // A5
  },
  error() {
    Sound.tone(240, 0.15, 'triangle', 0);
    Sound.tone(180, 0.22, 'triangle', 0.12);
  },
  win() {
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      Sound.tone(f, 0.22, 'triangle', i * 0.12, 0.2);
    });
  },
  click() {
    Sound.tone(600, 0.04, 'square', 0, 0.05);
  }
};

window.toggleSound = () => {
  S.sound = !S.sound;
  saveState();
  updateHUD();
  showToast(S.sound ? '🔊 Sonido activado' : '🔇 Sonido silenciado');
};

/* ---------- Confeti en Canvas ---------- */
function launchConfetti() {
  const canvas = $('#confetti');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * (canvas.height * 0.4),
    size: 6 + Math.random() * 8,
    color: pickRandom(colors),
    vx: (Math.random() - 0.5) * 6,
    vy: 3 + Math.random() * 5,
    angle: Math.random() * 6.28,
    va: (Math.random() - 0.5) * 0.2,
    isRect: Math.random() > 0.4
  }));

  let frames = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.va;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.isRect) {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    frames++;
    if (frames < 180) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(animate);
}

/* ---------- Mensajes Flotantes (Toast) ---------- */
function showToast(msg) {
  const old = $('.toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3400);
}

/* ---------- Actualización del HUD ---------- */
function updateHUD() {
  const lvl = getLevel();
  $('#hudLevel').textContent = `Nv ${lvl}`;
  $('#hudLevel').parentElement.title = `Nivel ${lvl}: ${getLevelTitle()}`;
  const currentXpInLevel = S.xp % 100;
  $('#hudXpFill').style.width = `${currentXpInLevel}%`;
  $('#hudXpText').textContent = `${currentXpInLevel} / 100 XP`;
  $('#hudStars').textContent = S.stars;
  $('#hudStreak').textContent = S.streak;
  $('#soundBtn').textContent = S.sound ? '🔊' : '🔇';
  $('#hudAvatar').textContent = S.avatar || '🦊';
}

/* ---------- Navegación de Vistas ---------- */
let currentView = 'home';
let activeLearnTopic = 'fraction';
let activePracticeTopic = 'all';

function navigate(viewName, param = null) {
  Sound.click();
  currentView = viewName;
  $$('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeNav = $(`#nav-${viewName}`);
  if (activeNav) activeNav.classList.add('active');

  const container = $('#app');
  container.innerHTML = '';

  if (viewName === 'home') {
    renderHome(container);
  } else if (viewName === 'learn') {
    if (param) activeLearnTopic = param;
    renderLearn(container);
  } else if (viewName === 'practice') {
    if (param) activePracticeTopic = param;
    renderPractice(container);
  } else if (viewName === 'exam') {
    renderExam(container);
  } else if (viewName === 'trophies') {
    renderTrophies(container);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =========================================================
   VISTA 1: HOME (MAPA DE AVENTURA)
   ========================================================= */
function renderHome(container) {
  let topicsHtml = '';
  Object.values(TOPICS).forEach(t => {
    const masteryPct = getTopicMasteryPercent(t.id);
    let pillClass = 'none';
    let pillText = 'Sin datos';
    if (masteryPct !== null) {
      if (masteryPct >= 85) { pillClass = 'high'; pillText = `🟢 ${masteryPct}% Dominio`; }
      else if (masteryPct >= 65) { pillClass = 'mid'; pillText = `🟡 ${masteryPct}% En proceso`; }
      else { pillClass = 'low'; pillText = `🔴 ${masteryPct}% A reforzar`; }
    }

    topicsHtml += `
      <div class="topic-card">
        <div>
          <div class="topic-card-header">
            <div class="topic-icon">${t.icon}</div>
            <div class="topic-meta">
              <div class="topic-badge-num">${t.badge}</div>
              <h3 class="topic-name">${t.name}</h3>
            </div>
          </div>
          <p class="topic-desc">${t.desc}</p>
        </div>
        <div>
          <div class="topic-mastery">
            <span>Tu Progreso:</span>
            <span class="mastery-pill ${pillClass}">${pillText}</span>
          </div>
          <div class="topic-actions">
            <button class="btn-action-learn" onclick="navigate('learn', '${t.id}')">
              📖 Explorar
            </button>
            <button class="btn-action-practice" onclick="navigate('practice', '${t.id}')">
              🎯 Practicar
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="home-hero">
      <div class="hero-content">
        <div class="hero-school-badge">🏫 Colegio Bilingüe Lerner & Klein · Grado 4.°</div>
        <h1 class="hero-title">¡Hola, ${S.name}! 🌟</h1>
        <p class="hero-desc">
          Prepárate de forma divertida para tu Evaluación de Matemáticas del 3.er Trimestre (semana del 9 al 13 de noviembre).
          Explora los 5 temas interactivos con figuras 3D, supera los desafíos y gana tu diploma de honor.
        </p>
        <div class="hero-actions">
          <button class="btn-primary-hero" onclick="navigate('learn')">
            🚀 Empezar Lecciones
          </button>
          <button class="btn-secondary-hero" onclick="navigate('exam')">
            📝 Probar Simulacro de Examen
          </button>
        </div>
      </div>
    </div>

    <div class="exam-banner-card">
      <div class="exam-banner-info">
        <h3>🏆 Simulacro Oficial del 3.er Trimestre</h3>
        <p>
          Evalúa tus conocimientos con un simulacro interactivo de 15 preguntas tipo colegio.
          Incluye semáforo diagnóstico, retroalimentación paso a paso y diploma personalizable.
        </p>
      </div>
      <button class="btn-exam-start" onclick="navigate('exam')">
        ¡Hacer Simulacro! ⚡
      </button>
    </div>

    <div class="section-header">
      <h2 class="section-title">🗺️ Islas de Aprendizaje y Minijuegos</h2>
    </div>
    <div class="topics-grid">
      ${topicsHtml}
    </div>
  `;
}

/* =========================================================
   VISTA 2: APRENDER (LECCIONES & LABORATORIOS INTERACTIVOS)
   ========================================================= */
let activeThreeScene = null;

function renderLearn(container) {
  // Limpiar escena 3D previa si existía
  if (activeThreeScene && activeThreeScene.destroy) {
    activeThreeScene.destroy();
    activeThreeScene = null;
  }

  let tabsHtml = '';
  Object.values(TOPICS).forEach(t => {
    const isActive = t.id === activeLearnTopic;
    tabsHtml += `
      <button class="learn-tab-btn ${isActive ? 'active' : ''}" onclick="switchLearnTopic('${t.id}')">
        <span>${t.icon}</span>
        <span>${t.name}</span>
      </button>
    `;
  });

  container.innerHTML = `
    <div class="learn-container">
      <div class="learn-tabs">
        ${tabsHtml}
      </div>
      <div id="lessonCard" class="lesson-card"></div>
    </div>
  `;

  // Marcar lección como explorada
  S.completedLessons[activeLearnTopic] = true;
  saveState();
  checkBadges();

  renderActiveLessonContent($('#lessonCard'));
}

window.switchLearnTopic = topicId => {
  activeLearnTopic = topicId;
  navigate('learn', topicId);
};

function renderActiveLessonContent(card) {
  if (activeLearnTopic === 'fraction') {
    renderLessonFraction(card);
  } else if (activeLearnTopic === 'volume') {
    renderLessonVolume(card);
  } else if (activeLearnTopic === 'shapes') {
    renderLessonShapes(card);
  } else if (activeLearnTopic === 'stats') {
    renderLessonStats(card);
  } else if (activeLearnTopic === 'percent') {
    renderLessonPercent(card);
  }
}

/* --- LECCIÓN 1: Fracción de un número (100% Gamificada) --- */
let fracSelectedBoxes = new Set();
let mixedChallengeIdx = 0;
let mixedClickedSlices = 0;

const MIXED_CHALLENGES = [
  { num: 7, den: 6, whole: 1, rem: 1, item: '🍪 galletas (Taller)', emoji: '🍪' },
  { num: 13, den: 4, whole: 3, rem: 1, item: '🟣 círculos rosados (Cuaderno)', emoji: '🟣' },
  { num: 9, den: 4, whole: 2, rem: 1, item: '🍕 porciones de pizza', emoji: '🍕' },
  { num: 11, den: 6, whole: 1, rem: 5, item: '🍫 chocolatinas', emoji: '🍫' }
];

function renderLessonFraction(card) {
  card.innerHTML = `
    <div class="lesson-header">
      <h2 class="lesson-title">🍰 Minijuegos: Fracción de un Número y Números Mixtos</h2>
      <p class="lesson-subtitle">¡Aprende jugando! Toca las cajas para repartir, completa las casillas secretas y gana estrellas.</p>
    </div>

    <div class="fraction-interactive-box">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
        <h3 style="margin:0; font-weight:800; color:#1e293b;">🎮 Juego 1: ¡Atrapa las Cajas y Resuelve el Taller!</h3>
        <div class="fraction-controls" style="margin:0;">
          <select id="fractionPreset" onchange="updateFractionLab()" style="padding:8px 14px; border-radius:12px; font-weight:700; border:2px solid #cbd5e1; font-family:inherit;">
            <option value="3,4,20,barras de plastilina" selected>📄 Misión 1: 3/4 de 20 plastilinas</option>
            <option value="2,5,20,dulces de la caja">📓 Misión 2: 2/5 de 20 dulces</option>
            <option value="2,3,15,botellas de agua">📓 Misión 3: 2/3 de 15 botellas</option>
            <option value="2,5,30,estudiantes">📓 Misión 4: 2/5 de 30 estudiantes</option>
            <option value="1,4,60,mil pesos (Juego de $60.000)">📓 Misión 5: 1/4 de $60.000</option>
            <option value="3,4,24,lápices de colores">🎨 Misión 6: 3/4 de 24 colores</option>
            <option value="5,8,32,galletas">🍪 Misión 7: 5/8 de 32 galletas</option>
          </select>
          <div class="fraction-display" id="fracFormulaBox"></div>
        </div>
      </div>

      <div style="background:#fdf2f8; border:2px dashed #f472b6; border-radius:14px; padding:12px 16px; margin-bottom:12px; text-align:center;">
        <b style="color:#be185d; font-size:1rem;" id="fracStep1Prompt">👆 Paso 1: ¡Toca las cajas para seleccionar la fracción!</b>
      </div>

      <div class="fraction-groups-container" id="fracGroups"></div>

      <div id="fracInteractiveInputs" style="margin-top:16px;"></div>
      <div id="fracGameFeedback" style="margin-top:12px;"></div>
    </div>

    <div class="fraction-interactive-box" style="margin-top:24px; background:linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-color:#f59e0b;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <div>
          <h3 style="margin:0; font-weight:800; color:#92400e;">🍕 Juego 2: ¡Pastelería de Fracciones Impropias a Mixtas!</h3>
          <p style="margin:4px 0 0 0; font-size:0.92rem; color:#b45309;">Toca los pedazos para servir el pedido y descubre cuántos paquetes enteros se completan.</p>
        </div>
        <button class="btn-three-tool" onclick="nextMixedChallenge()" style="background:white; border-color:#f59e0b; color:#92400e;">
          🎲 Cambiar Pedido
        </button>
      </div>
      <div id="mixedBakeryGame"></div>
    </div>

    <div style="text-align:center; margin-top:20px;">
      <button class="btn-action-practice" onclick="navigate('practice', 'fraction')" style="display:inline-flex; width:auto; padding:12px 28px; font-size:1rem;">
        🎯 ¡Ir al Quiz Rápido de este Tema!
      </button>
    </div>
  `;
  updateFractionLab();
  renderMixedBakeryGame();
}

window.updateFractionLab = () => {
  const raw = $('#fractionPreset').value.split(',');
  const num = Number(raw[0]);
  const den = Number(raw[1]);
  const total = Number(raw[2]);
  const label = raw.slice(3).join(',') || 'objetos';

  fracSelectedBoxes = new Set();

  $('#fracFormulaBox').innerHTML = `
    <span class="num">${num}</span>
    <span class="den">${den}</span>
    <span style="font-size:0.9rem; font-weight:700; margin-top:4px;">de ${total}</span>
  `;

  renderFractionBoxes(num, den, total, label);

  const inputStyle = `width:62px; padding:6px 8px; border-radius:10px; border:2px solid #94a3b8; font-weight:800; font-size:1rem; text-align:center; font-family:inherit;`;

  $('#fracInteractiveInputs').innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(270px, 1fr)); gap:14px;">
      <div style="background:white; border:2px solid #fbcfe8; border-radius:14px; padding:14px;">
        <b style="color:#be185d; font-size:1rem;">📓 Método 1 (El Cajón de tu Cuaderno):</b>
        <p style="font-size:0.86rem; color:#64748b; margin:4px 0 10px 0;">Divide el total entre las cajas y multiplica por las que tomaste:</p>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:10px; font-weight:800;">
          <span>1.° División:</span>
          <code>${total} ÷ ${den} =</code>
          <input type="number" id="inpM1Div" placeholder="?" style="${inputStyle}">
        </div>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; font-weight:800;">
          <span>2.° Multiplicas:</span>
          <input type="number" id="inpM1Quot" placeholder="?" style="${inputStyle}">
          <code>× ${num} =</code>
          <input type="number" id="inpM1Res" placeholder="?" style="${inputStyle}; border-color:#ec4899; background:#fdf2f8;">
        </div>
      </div>

      <div style="background:white; border:2px solid #ddd6fe; border-radius:14px; padding:14px;">
        <b style="color:#6d28d9; font-size:1rem;">📄 Método 2 (Taller: Pon un 1 abajo al ${total}):</b>
        <p style="font-size:0.86rem; color:#64748b; margin:4px 0 10px 0;">Multiplica arriba <code>(${total} × ${num})</code> y luego divide entre <code>${den}</code>:</p>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:10px; font-weight:800;">
          <span>1.° Fracción:</span>
          <code>(${total}/1) × (${num}/${den}) =</code>
          <input type="number" id="inpM2Top" placeholder="?" style="${inputStyle}">
          <code>/ ${den}</code>
        </div>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; font-weight:800;">
          <span>2.° Divides:</span>
          <input type="number" id="inpM2Top2" placeholder="?" style="${inputStyle}">
          <code>÷ ${den} =</code>
          <input type="number" id="inpM2Res" placeholder="?" style="${inputStyle}; border-color:#7c3aed; background:#f5f3ff;">
        </div>
      </div>
    </div>

    <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap; margin-top:14px;">
      <button class="btn-primary-hero" onclick="checkFractionGame()" style="background:#ec4899; color:white; padding:10px 24px; font-size:1rem;">
        ✅ ¡Comprobar mi Jugada! (+25 XP ⭐)
      </button>
      <button class="btn-three-tool" onclick="autoFillFractionGame()">
        🪄 Mostrarme cómo se llena
      </button>
    </div>
  `;
  $('#fracGameFeedback').innerHTML = '';
};

function renderFractionBoxes(num, den, total, label) {
  const perGroup = total / den;
  const isMoneyDiscount = label.includes('60.000');
  const selCount = fracSelectedBoxes.size;

  const promptEl = $('#fracStep1Prompt');
  if (promptEl) {
    if (selCount === num) {
      promptEl.innerHTML = `🎉 ¡Genial! Seleccionaste <b>${selCount} de ${den} cajas</b> (${selCount * perGroup} ${label}). ¡Ahora llena las casillas de abajo!`;
      promptEl.style.color = '#15803d';
    } else {
      promptEl.innerHTML = `👆 Paso 1: Toca exactamente <b>${num} de las ${den} cajas</b> para tomar <b>${num}/${den} de ${total}</b> (Llevas: ${selCount}/${den})`;
      promptEl.style.color = '#be185d';
    }
  }

  const container = $('#fracGroups');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < den; i++) {
    const isSelected = fracSelectedBoxes.has(i);
    const box = document.createElement('div');
    box.className = `fraction-group-box ${isSelected ? 'selected' : ''}`;
    box.style.cursor = 'pointer';
    box.onclick = () => {
      Sound.click();
      if (fracSelectedBoxes.has(i)) fracSelectedBoxes.delete(i);
      else fracSelectedBoxes.add(i);
      renderFractionBoxes(num, den, total, label);
    };
    let items = '';
    const dotsToDraw = Math.min(perGroup, 15);
    for (let j = 0; j < dotsToDraw; j++) {
      items += `<span class="fraction-item-dot">${isSelected ? '⭐' : '⚪'}</span>`;
    }
    box.innerHTML = `
      <b style="font-size:0.85rem; color:${isSelected ? '#ec4899' : '#64748b'};">
        Caja ${i + 1} ${isSelected ? '✅' : '(Tócame)'}
      </b>
      <div style="display:flex; flex-wrap:wrap; gap:4px; justify-content:center; max-width:80px;">
        ${items}
      </div>
      <span style="font-size:0.8rem; font-weight:700;">${isMoneyDiscount ? `$${perGroup}.000` : `${perGroup} u.`}</span>
    `;
    container.appendChild(box);
  }
}

window.checkFractionGame = () => {
  const raw = $('#fractionPreset').value.split(',');
  const num = Number(raw[0]);
  const den = Number(raw[1]);
  const total = Number(raw[2]);
  const label = raw.slice(3).join(',') || 'objetos';

  const perGroup = total / den;
  const result = perGroup * num;
  const multTop = total * num;
  const remainder = total - result;

  const m1Div = Number($('#inpM1Div').value);
  const m1Quot = Number($('#inpM1Quot').value);
  const m1Res = Number($('#inpM1Res').value);
  const m2Top = Number($('#inpM2Top').value);
  const m2Top2 = Number($('#inpM2Top2').value);
  const m2Res = Number($('#inpM2Res').value);

  const fb = $('#fracGameFeedback');

  if (fracSelectedBoxes.size !== num) {
    Sound.error();
    fb.innerHTML = `<div class="feedback-banner error"><span>👆</span><div><b>¡Falta el Paso 1!</b> Toca arriba exactamente <b>${num} cajas</b> de las ${den} para representar <b>${num}/${den}</b>.</div></div>`;
    return;
  }

  const m1Ok = (m1Div === perGroup && m1Quot === perGroup && m1Res === result);
  const m2Ok = (m2Top === multTop && m2Top2 === multTop && m2Res === result);

  if (m1Ok && m2Ok) {
    Sound.win();
    addXP(25);
    addStar();
    launchConfetti();
    fb.innerHTML = `
      <div class="feedback-banner success">
        <span style="font-size:1.8rem;">🏆</span>
        <div>
          <b>¡Perfecto, ${S.name}! Dominaste los 2 métodos (+25 XP ⭐)</b><br>
          • <b>Cajón:</b> <code>${total} ÷ ${den} = ${perGroup}</code> y <code>${perGroup} × ${num} = <b>${result}</b></code>.<br>
          • <b>Taller (con el 1 abajo):</b> <code>${total} × ${num} = ${multTop}</code> arriba, y <code><b>${multTop} ÷ ${den} = ${result}</b></code>.<br>
          • <b>R:</b> Son <b>${result} ${label}</b> (y quedan <b>${remainder}</b> sin tomar).
        </div>
      </div>
    `;
  } else {
    Sound.error();
    let tip = '';
    if (!m1Ok) {
      tip += `• En el <b>Método 1 (Cajón)</b>: <code>${total} ÷ ${den} = <b>${perGroup}</b></code>, y luego <code><b>${perGroup}</b> × ${num} = <b>${result}</b></code>.<br>`;
    }
    if (!m2Ok) {
      if (m2Top2 === total) {
        tip += `• 🦊 <b>¡Ojo con la trampa del Taller!</b> En el Método 2 primero multiplicas arriba <code>${total} × ${num} = <b>${multTop}</b></code>. Por eso en la división final debes escribir <code><b>${multTop} ÷ ${den} = ${result}</b></code> (¡y no ${total} ÷ ${den}!).`;
      } else {
        tip += `• En el <b>Método 2 (Taller)</b>: Multiplica arriba <code>${total} × ${num} = <b>${multTop}</b></code> y luego divide <code><b>${multTop}</b> ÷ ${den} = <b>${result}</b></code>.`;
      }
    }
    fb.innerHTML = `
      <div class="feedback-banner error">
        <span style="font-size:1.8rem;">🦊</span>
        <div>
          <b>¡Casi lo tienes! Revisa estas casillas:</b><br>
          ${tip}
        </div>
      </div>
    `;
  }
};

window.autoFillFractionGame = () => {
  const raw = $('#fractionPreset').value.split(',');
  const num = Number(raw[0]);
  const den = Number(raw[1]);
  const total = Number(raw[2]);
  const label = raw.slice(3).join(',') || 'objetos';

  const perGroup = total / den;
  const result = perGroup * num;
  const multTop = total * num;

  fracSelectedBoxes = new Set();
  for (let i = 0; i < num; i++) fracSelectedBoxes.add(i);
  renderFractionBoxes(num, den, total, label);

  $('#inpM1Div').value = perGroup;
  $('#inpM1Quot').value = perGroup;
  $('#inpM1Res').value = result;
  $('#inpM2Top').value = multTop;
  $('#inpM2Top2').value = multTop;
  $('#inpM2Res').value = result;
  Sound.ok();
};

window.nextMixedChallenge = () => {
  Sound.click();
  mixedChallengeIdx = (mixedChallengeIdx + 1) % MIXED_CHALLENGES.length;
  mixedClickedSlices = 0;
  renderMixedBakeryGame();
};

function renderMixedBakeryGame() {
  const box = $('#mixedBakeryGame');
  if (!box) return;
  const ch = MIXED_CHALLENGES[mixedChallengeIdx];
  const totalTrays = ch.whole + 1;
  const totalSlots = totalTrays * ch.den;

  let traysHtml = '';
  let sliceCounter = 0;
  for (let t = 0; t < totalTrays; t++) {
    let slicesHtml = '';
    let coloredInTray = 0;
    for (let s = 0; s < ch.den; s++) {
      const idx = sliceCounter++;
      const isOn = idx < mixedClickedSlices;
      if (isOn) coloredInTray++;
      slicesHtml += `
        <button onclick="clickMixedSlice(${idx + 1})" style="width:38px; height:38px; border-radius:10px; border:2px solid ${isOn ? '#d97706' : '#cbd5e1'}; background:${isOn ? '#fde68a' : '#f8fafc'}; font-size:1.2rem; cursor:pointer; transition:transform 0.15s;">
          ${isOn ? ch.emoji : '⚪'}
        </button>
      `;
    }
    const isFullTray = coloredInTray === ch.den;
    traysHtml += `
      <div style="background:white; border:2px solid ${isFullTray ? '#10b981' : '#fcd34d'}; border-radius:14px; padding:12px; text-align:center; min-width:140px;">
        <div style="font-weight:800; font-size:0.85rem; color:${isFullTray ? '#047857' : '#92400e'}; margin-bottom:6px;">
          Paquete ${t + 1} (${coloredInTray}/${ch.den}) ${isFullTray ? '✅ ¡1 Entero!' : ''}
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:center;">
          ${slicesHtml}
        </div>
      </div>
    `;
  }

  const inpStyle = `width:56px; padding:6px; border-radius:10px; border:2px solid #d97706; font-weight:800; font-size:1.05rem; text-align:center; font-family:inherit;`;

  box.innerHTML = `
    <div style="background:white; border:2px solid #fde68a; border-radius:14px; padding:14px; margin-bottom:12px;">
      <div style="font-size:1.05rem; font-weight:800; color:#78350f; margin-bottom:8px;">
        🎯 Pedido: Sirve <b>${ch.num}/${ch.den}</b> de ${ch.item} (Cada paquete tiene <b>${ch.den}</b> partes iguales).
        <span style="color:#d97706;">Llevas: ${mixedClickedSlices}/${ch.den}</span>
      </div>
      <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin:12px 0;">
        ${traysHtml}
      </div>
      <div style="display:flex; align-items:center; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:12px; font-weight:800; color:#78350f;">
        <span>Fracción Impropia <code>${ch.num}/${ch.den}</code> =</span>
        <input type="number" id="inpMixWhole" placeholder="?" style="${inpStyle}">
        <span>enteros y</span>
        <input type="number" id="inpMixRem" placeholder="?" style="${inpStyle}">
        <span>/</span>
        <input type="number" id="inpMixDen" placeholder="?" style="${inpStyle}">
        <button class="btn-primary-hero" onclick="checkMixedBakeryGame()" style="background:#f59e0b; color:white; padding:8px 18px; font-size:0.95rem;">
          🍕 ¡Entregar Pedido! (+20 XP)
        </button>
      </div>
      <div id="mixedBakeryFeedback" style="margin-top:10px;"></div>
    </div>
  `;
}

window.clickMixedSlice = count => {
  Sound.click();
  mixedClickedSlices = count;
  renderMixedBakeryGame();
};

window.checkMixedBakeryGame = () => {
  const ch = MIXED_CHALLENGES[mixedChallengeIdx];
  const w = Number($('#inpMixWhole').value);
  const r = Number($('#inpMixRem').value);
  const d = Number($('#inpMixDen').value);
  const fb = $('#mixedBakeryFeedback');

  if (mixedClickedSlices !== ch.num) {
    Sound.error();
    fb.innerHTML = `<div class="feedback-banner error"><span>👆</span><div>Toca exactamente <b>${ch.num} pedazos</b> en los paquetes de arriba (tienes ${mixedClickedSlices} marcados).</div></div>`;
    return;
  }

  if (w === ch.whole && r === ch.rem && d === ch.den) {
    Sound.win();
    addXP(20);
    addStar();
    launchConfetti();
    fb.innerHTML = `
      <div class="feedback-banner success">
        <span style="font-size:1.6rem;">🎉</span>
        <div>
          <b>¡Pedido perfecto! +20 XP ⭐</b><br>
          <code><b>${ch.num}/${ch.den} = ${ch.whole} ${ch.rem}/${ch.den}</b></code>: Completaste <b>${ch.whole} paquete(s) entero(s)</b> y sobró <b>${ch.rem}/${ch.den}</b>. ¡El denominador (${ch.den}) nunca cambia!
        </div>
      </div>
    `;
  } else {
    Sound.error();
    fb.innerHTML = `
      <div class="feedback-banner error">
        <span style="font-size:1.6rem;">🦊</span>
        <div>
          <b>¡Mira los paquetes de arriba!</b> Se llenaron <b>${ch.whole}</b> paquetes completos y quedaron <b>${ch.rem}</b> pedazos de <b>${ch.den}</b> (¡recuerda que el denominador ${ch.den} nunca se suma!).
        </div>
      </div>
    `;
  }
};

/* --- LECCIÓN 2: Cálculo de Volumen con Three.js (100% Gamificada) --- */
let volMissionIdx = 0;
const VOL_MISSIONS = [
  { l: 5, w: 2, h: 6, vol: 60, anyDims: false, title: '📓 Misión 1 (Tu Cuaderno): Prisma de 5 × 2 × 6', desc: 'Mueve los deslizadores 3D a Largo = 5, Ancho = 2 y Alto = 6, y calcula cuántos cubitos caben.' },
  { l: 3, w: 3, h: 3, vol: 27, anyDims: false, title: '🎲 Misión 2: El Cubo Mágico (3 × 3 × 3)', desc: 'Construye un cubo perfecto de 3 cm por cada lado y descubre su volumen en cm³.' },
  { l: 4, w: 3, h: 2, vol: 24, anyDims: false, title: '🧱 Misión 3: Caja de 2 Pisos (4 × 3 × 2)', desc: 'Ajusta Largo = 4, Ancho = 3 y Alto = 2. Usa el botón "🥞 Separar Capas" para ver los 2 pisos.' },
  { l: 5, w: 3, h: 2, vol: 30, anyDims: true, title: '🌟 Misión 4 (Arquitecta Libre): Volumen = 30 cm³', desc: '¡Reto creativo! Mueve Largo, Ancho y Alto como quieras para que al multiplicarlos el volumen sea exactamente 30 cm³.' }
];

function renderLessonVolume(card) {
  card.innerHTML = `
    <div class="lesson-header">
      <h2 class="lesson-title">📦 Minijuego 3D: Arquitecta de Volumen</h2>
      <p class="lesson-subtitle">El volumen es el <b>espacio que ocupa un cuerpo</b> en unidades cúbicas (<b>cm³, m³</b>). ¡Construye en 3D y supera las misiones!</p>
    </div>

    <div style="background:linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border:2px solid #3b82f6; border-radius:18px; padding:16px 20px; margin-bottom:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
        <div>
          <h3 id="volMissionTitle" style="margin:0; font-size:1.15rem; font-weight:800; color:#1e40af;"></h3>
          <p id="volMissionDesc" style="margin:4px 0 0 0; font-size:0.92rem; color:#1e3a8a;"></p>
        </div>
        <button class="btn-three-tool" onclick="nextVolumeMission()" style="background:white; border-color:#3b82f6; color:#1d4ed8;">
          🎲 Siguiente Misión 3D
        </button>
      </div>

      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; background:white; padding:12px 14px; border-radius:12px; border:1.5px solid #93c5fd; font-weight:800; color:#1e293b;">
        <span>1.° Cubitos en 1 piso (Largo × Ancho):</span>
        <input type="number" id="inpVolBase" placeholder="?" style="width:64px; padding:6px; border-radius:10px; border:2px solid #3b82f6; font-weight:800; font-size:1rem; text-align:center;">
        <span>| 2.° Volumen Total (× Alto):</span>
        <input type="number" id="inpVolTotal" placeholder="?" style="width:72px; padding:6px; border-radius:10px; border:2px solid #ec4899; background:#fdf2f8; font-weight:800; font-size:1rem; text-align:center;">
        <span>cm³</span>
        <button class="btn-primary-hero" onclick="checkVolumeMission()" style="background:#2563eb; color:white; padding:8px 18px; font-size:0.95rem;">
          🏗️ ¡Entregar Construcción! (+25 XP ⭐)
        </button>
      </div>
      <div id="volMissionFeedback" style="margin-top:10px;"></div>
    </div>

    <div style="background:#f8fafc; border:2px dashed #cbd5e1; border-radius:18px; padding:20px; margin:16px 0;">
      <div style="display:flex; flex-wrap:wrap; gap:20px; align-items:center; justify-content:space-between; margin-bottom:14px;">
        <div style="display:flex; gap:16px; flex-wrap:wrap;">
          <div>
            <label><b>Largo (X):</b> <span id="volLVal" style="color:#3b82f6; font-weight:800;">2</span> cm</label><br>
            <input type="range" id="volL" min="1" max="6" value="2" oninput="updateVolumeLab()" style="cursor:pointer;">
          </div>
          <div>
            <label><b>Ancho (Z):</b> <span id="volWVal" style="color:#10b981; font-weight:800;">2</span> cm</label><br>
            <input type="range" id="volW" min="1" max="5" value="2" oninput="updateVolumeLab()" style="cursor:pointer;">
          </div>
          <div>
            <label><b>Alto (Y):</b> <span id="volHVal" style="color:#ec4899; font-weight:800;">2</span> cm</label><br>
            <input type="range" id="volH" min="1" max="6" value="2" oninput="updateVolumeLab()" style="cursor:pointer;">
          </div>
        </div>
        <div style="background:white; border:2px solid #3b82f6; border-radius:14px; padding:10px 18px; text-align:center;">
          <div style="font-size:0.8rem; font-weight:700; color:#64748b;">MEDIDAS EN EL VISOR 3D:</div>
          <div id="volCalcText" style="font-size:1.3rem; font-weight:800; color:#1e40af;">2 × 2 × 2 = ? cm³</div>
        </div>
      </div>

      <div class="three-viewport-wrap" id="volume3dViewport">
        <div class="three-toolbar">
          <div class="three-badge-info" id="volLayersInfo">Ajusta Largo, Ancho y Alto</div>
          <div class="three-buttons-row">
            <button class="btn-three-tool" id="btnXrayVol" onclick="toggleVolumeXray()">🔍 Rayos X</button>
            <button class="btn-three-tool" id="btnExplodeVol" onclick="toggleVolumeExplode()">🥞 Separar Capas</button>
            <button class="btn-three-tool" onclick="resetVolumeCamera()">🔄 Centrar</button>
          </div>
        </div>
        <div class="three-instructions">🖱️ Arrastra con el ratón o desliza con el dedo para girar en 3D y contar los cubitos</div>
      </div>

      <div style="text-align:center; margin-top:16px;">
        <button class="btn-action-practice" onclick="navigate('practice', 'volume')" style="display:inline-flex; width:auto; padding:12px 28px; font-size:1rem;">
          🎯 ¡Ir al Quiz Rápido de Volumen!
        </button>
      </div>
    </div>
  `;

  renderVolumeMissionHeader();
  initVolume3D();
}

function renderVolumeMissionHeader() {
  const m = VOL_MISSIONS[volMissionIdx];
  const tEl = $('#volMissionTitle');
  const dEl = $('#volMissionDesc');
  if (tEl) tEl.textContent = m.title;
  if (dEl) dEl.textContent = m.desc;
  if ($('#inpVolBase')) $('#inpVolBase').value = '';
  if ($('#inpVolTotal')) $('#inpVolTotal').value = '';
  if ($('#volMissionFeedback')) $('#volMissionFeedback').innerHTML = '';
}

window.nextVolumeMission = () => {
  Sound.click();
  volMissionIdx = (volMissionIdx + 1) % VOL_MISSIONS.length;
  renderVolumeMissionHeader();
};

window.checkVolumeMission = () => {
  const m = VOL_MISSIONS[volMissionIdx];
  const L = parseInt($('#volL').value, 10);
  const W = parseInt($('#volW').value, 10);
  const H = parseInt($('#volH').value, 10);
  const currentVol = L * W * H;
  const currentBase = L * W;

  const userBase = Number($('#inpVolBase').value);
  const userTotal = Number($('#inpVolTotal').value);
  const fb = $('#volMissionFeedback');

  const dimsOk = m.anyDims ? (currentVol === m.vol) : (L === m.l && W === m.w && H === m.h);

  if (!dimsOk) {
    Sound.error();
    fb.innerHTML = `
      <div class="feedback-banner error">
        <span>🎚️</span>
        <div>
          <b>¡Primero ajusta los deslizadores 3D!</b> Ahora mismo tienes <code>${L} × ${W} × ${H}</code>.
          ${m.anyDims ? `Busca medidas que multiplicadas den <b>${m.vol} cm³</b> (por ejemplo 5 × 3 × 2).` : `Mueve las barras hasta tener <b>Largo = ${m.l}, Ancho = ${m.w} y Alto = ${m.h}</b>.`}
        </div>
      </div>
    `;
    return;
  }

  if (userBase === currentBase && userTotal === m.vol) {
    Sound.win();
    addXP(25);
    addStar();
    launchConfetti();
    $('#volCalcText').textContent = `${L} × ${W} × ${H} = ${m.vol} cm³ ✅`;
    fb.innerHTML = `
      <div class="feedback-banner success">
        <span style="font-size:1.8rem;">🏆</span>
        <div>
          <b>¡Construcción 3D Aprobada! +25 XP ⭐</b><br>
          En cada piso hay <code>${L} × ${W} = <b>${currentBase} cubitos</b></code>, y con <b>${H} pisos</b> de altura el volumen es <code>${currentBase} × ${H} = <b>${m.vol} cm³</b></code>.
        </div>
      </div>
    `;
  } else {
    Sound.error();
    fb.innerHTML = `
      <div class="feedback-banner error">
        <span style="font-size:1.6rem;">🦊</span>
        <div>
          <b>¡Tus medidas 3D están listas, pero revisa la multiplicación!</b><br>
          • Cubitos en 1 piso: <code>${L} × ${W} = <b>${currentBase}</b></code>.<br>
          • Volumen total: <code>${currentBase} × ${H} = <b>${m.vol} cm³</b></code>.
        </div>
      </div>
    `;
  }
};

let volumeState = {
  isXray: false,
  isExploded: false
};

function initVolume3D() {
  const container = $('#volume3dViewport');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth;
  const height = container.clientHeight || 400;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1f5f9);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(7, 6, 9);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.shadowMap.enabled = true;
  renderer.domElement.className = 'three-canvas';
  container.appendChild(renderer.domElement);

  let controls = null;
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 25;
    controls.minDistance = 3;
  }

  // Luces
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
  dirLight.position.set(10, 15, 10);
  scene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0xa5b4fc, 0.4);
  dirLight2.position.set(-10, -5, -10);
  scene.add(dirLight2);

  // Cuadrícula del piso
  const gridHelper = new THREE.GridHelper(12, 12, 0x94a3b8, 0xcbd5e1);
  gridHelper.position.y = -0.01;
  scene.add(gridHelper);

  const cubesGroup = new THREE.Group();
  scene.add(cubesGroup);

  let animFrameId = null;
  function animate() {
    animFrameId = requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();

  activeThreeScene = {
    renderer,
    camera,
    controls,
    scene,
    cubesGroup,
    destroy() {
      cancelAnimationFrame(animFrameId);
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    }
  };

  window.volumeThree = activeThreeScene;
  updateVolumeLab();
}

window.resetVolumeCamera = () => {
  if (!window.volumeThree) return;
  window.volumeThree.camera.position.set(7, 6, 9);
  window.volumeThree.camera.lookAt(0, 1, 0);
  if (window.volumeThree.controls) window.volumeThree.controls.target.set(0, 1, 0);
};

window.toggleVolumeXray = () => {
  volumeState.isXray = !volumeState.isXray;
  $('#btnXrayVol').classList.toggle('active', volumeState.isXray);
  updateVolumeLab();
};

window.toggleVolumeExplode = () => {
  volumeState.isExploded = !volumeState.isExploded;
  $('#btnExplodeVol').classList.toggle('active', volumeState.isExploded);
  updateVolumeLab();
};

window.updateVolumeLab = () => {
  const L = parseInt($('#volL').value, 10);
  const W = parseInt($('#volW').value, 10);
  const H = parseInt($('#volH').value, 10);

  $('#volLVal').textContent = L;
  $('#volWVal').textContent = W;
  $('#volHVal').textContent = H;

  $('#volCalcText').textContent = `${L} × ${W} × ${H} = ? cm³`;
  $('#volLayersInfo').textContent = `Base de ${L} × ${W} | ${H} piso${H > 1 ? 's' : ''} de altura`;

  if (!window.volumeThree) return;
  const group = window.volumeThree.cubesGroup;

  // Limpiar cubos anteriores
  while (group.children.length > 0) {
    const obj = group.children[0];
    group.remove(obj);
  }

  const cubeSize = 0.96;
  const spacing = 1.0;
  const geom = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const edgeGeom = new THREE.EdgesGeometry(geom);

  const colors = [0x38bdf8, 0x818cf8, 0xf472b6, 0x34d399, 0xfbbf24];

  const offsetX = (L - 1) * spacing * 0.5;
  const offsetZ = (W - 1) * spacing * 0.5;

  for (let y = 0; y < H; y++) {
    const layerColor = colors[y % colors.length];
    const yExplodeGap = volumeState.isExploded ? y * 0.75 : 0;
    const posY = y * spacing + 0.5 + yExplodeGap;

    for (let x = 0; x < L; x++) {
      for (let z = 0; z < W; z++) {
        const mat = new THREE.MeshStandardMaterial({
          color: layerColor,
          roughness: 0.35,
          metalness: 0.1,
          transparent: volumeState.isXray,
          opacity: volumeState.isXray ? 0.45 : 0.95
        });

        const cube = new THREE.Mesh(geom, mat);
        cube.position.set(x * spacing - offsetX, posY, z * spacing - offsetZ);
        cube.castShadow = true;
        cube.receiveShadow = true;

        const line = new THREE.LineSegments(
          edgeGeom,
          new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 })
        );
        cube.add(line);
        group.add(cube);
      }
    }
  }

  if (window.volumeThree.controls) {
    const totalHeight = (H * spacing + (volumeState.isExploded ? (H - 1) * 0.75 : 0)) * 0.5;
    window.volumeThree.controls.target.set(0, totalHeight, 0);
  }
};

/* --- LECCIÓN 3: Cuerpos Geométricos (Caras, Aristas y Vértices) --- */
const SHAPES_DATA = {
  cube: {
    name: 'Cubo (Hexaedro Regular)',
    type: 'Poliedro (Prisma regular)',
    F: 6, V: 8, E: 12,
    base: 'Cuadrada (2 bases)',
    sides: '4 caras cuadradas iguales',
    desc: 'Un poliedro regular perfecto donde todas sus 6 caras son cuadrados exactamente iguales.'
  },
  prism_tri: {
    name: 'Prisma Triangular',
    type: 'Poliedro (Prisma)',
    F: 5, V: 6, E: 9,
    base: 'Triángulo (2 bases paralelas)',
    sides: '3 caras laterales rectangulares',
    desc: 'Tiene 2 bases triangulares iguales y 3 caras rectangulares que las unen.'
  },
  prism_rect: {
    name: 'Prisma Rectangular (Ortoedro)',
    type: 'Poliedro (Prisma)',
    F: 6, V: 8, E: 12,
    base: 'Rectangular (2 bases)',
    sides: '4 caras laterales rectangulares',
    desc: 'Tiene 6 caras rectangulares en total, como una caja de zapatos o un ladrillo.'
  },
  prism_pent: {
    name: 'Prisma Pentagonal',
    type: 'Poliedro (Prisma)',
    F: 7, V: 10, E: 15,
    base: 'Pentágono de 5 lados (2 bases)',
    sides: '5 caras laterales rectangulares',
    desc: 'Fórmula de prismas: Caras = n + 2, Vértices = 2n, Aristas = 3n (donde n = 5).'
  },
  prism_hex: {
    name: 'Prisma Hexagonal',
    type: 'Poliedro (Prisma)',
    F: 8, V: 12, E: 18,
    base: 'Hexágono de 6 lados (2 bases)',
    sides: '6 caras laterales rectangulares',
    desc: 'Fórmula de prismas: n = 6 -> F = 8, V = 12, A = 18.'
  },
  pyr_tri: {
    name: 'Pirámide Triangular (Tetraedro)',
    type: 'Poliedro (Pirámide)',
    F: 4, V: 4, E: 6,
    base: 'Triángulo (1 base)',
    sides: '3 caras laterales triangulares que se unen en la cúspide',
    desc: 'Todas sus 4 caras son triángulos. ¡Tiene exactamente el mismo número de caras que de vértices (4 y 4)!'
  },
  pyr_square: {
    name: 'Pirámide Cuadrangular',
    type: 'Poliedro (Pirámide)',
    F: 5, V: 5, E: 8,
    base: 'Cuadrado (1 base con 4 aristas)',
    sides: '4 caras triangulares que concurren en la cúspide',
    desc: 'Como las pirámides de Egipto: 1 base cuadrada abajo + 4 triángulos que suben a un punto (cúspide).'
  },
  pyr_pent: {
    name: 'Pirámide Pentagonal',
    type: 'Poliedro (Pirámide)',
    F: 6, V: 6, E: 10,
    base: 'Pentágono (1 base con 5 lados)',
    sides: '5 caras triangulares que concurren en la cúspide',
    desc: 'Fórmula de pirámides: Caras = n + 1, Vértices = n + 1, Aristas = 2n (donde n = 5).'
  },
  pyr_hex: {
    name: 'Pirámide Hexagonal',
    type: 'Poliedro (Pirámide)',
    F: 7, V: 7, E: 12,
    base: 'Hexágono (1 base con 6 lados)',
    sides: '6 caras triangulares hacia la cúspide',
    desc: 'Fórmula de pirámides: n = 6 -> F = 7, V = 7, A = 12.'
  },
  cylinder: {
    name: 'Cilindro',
    type: 'Cuerpo Redondo (Revolución)',
    F: 2, V: 0, E: 2,
    base: '2 bases circulares planas',
    sides: '1 superficie curva lateral',
    desc: 'Un cuerpo redondo que puede rodar. Tiene 2 círculos planos como bases y cero vértices puntiagudos.'
  },
  cone: {
    name: 'Cono',
    type: 'Cuerpo Redondo (Revolución)',
    F: 1, V: 1, E: 1,
    base: '1 base circular plana',
    sides: '1 superficie curva lateral hacia la cúspide',
    desc: 'Tiene 1 base circular plana, 1 superficie curva y 1 cúspide en la punta (como un cono de helado).'
  },
  sphere: {
    name: 'Esfera',
    type: 'Cuerpo Redondo (Revolución)',
    F: 0, V: 0, E: 0,
    base: 'Sin caras planas',
    sides: '1 superficie curva continua',
    desc: 'Completamente redonda y simétrica, como una pelota. No tiene caras planas, aristas ni vértices.'
  }
};

let currentSolidKey = 'pyr_square';
let solidHighlightMode = 'all'; // 'all', 'faces', 'edges', 'vertices'
let shapeSortIdx = 0;

const SHAPE_SORT_CARDS = [
  { clue: 'Tengo 2 bases iguales y paralelas, y mis caras laterales son siempre RECTANGULARES (¡nunca triangulares!).', ans: 'prisma', explain: '¡Exacto! Todo PRISMA tiene 2 bases iguales y caras laterales rectangulares.' },
  { clue: 'Tengo 1 sola base abajo y mis caras laterales son TRIANGULARES que suben y se unen en un vértice o cúspide.', ans: 'piramide', explain: '¡Muy bien! Toda PIRÁMIDE tiene 1 sola base, caras laterales triangulares y una cúspide arriba.' },
  { clue: 'Tengo 1 base circular plana y 1 cúspide arriba, como un barquillo de helado o gorrito de fiesta (Cono).', ans: 'redondo', explain: '¡Correcto! El Cono tiene superficie curva, así que es un Cuerpo REDONDO.' },
  { clue: 'Parecido a una carpa de acampar: tengo 2 bases triangulares y 3 caras laterales rectangulares.', ans: 'prisma', explain: '¡Sí! Es el Prisma Triangular: tiene 2 bases y sus 3 paredes laterales son rectángulos.' },
  { clue: 'Como en Egipto: tengo 1 base cuadrada abajo y 4 caras laterales en forma de triángulo que se unen en la punta.', ans: 'piramide', explain: '¡Así es! Es la Pirámide Cuadrangular (5 caras, 5 vértices y 8 aristas).' },
  { clue: 'Tengo 2 bases circulares planas y 0 vértices puntiagudos, como una lata de gaseosa (Cilindro).', ans: 'redondo', explain: '¡Genial! El Cilindro rueda y es un Cuerpo REDONDO.' }
];

function renderLessonShapes(card) {
  let selectOptions = '';
  Object.keys(SHAPES_DATA).forEach(k => {
    selectOptions += `<option value="${k}" ${k === currentSolidKey ? 'selected' : ''}>${SHAPES_DATA[k].name}</option>`;
  });

  card.innerHTML = `
    <div class="lesson-header">
      <h2 class="lesson-title">🔷 Minijuegos 3D: Cuerpos Sólidos</h2>
      <p class="lesson-subtitle">¡Aprende jugando! Clasifica prismas, pirámides y redondos, y sé una Detective 3D contando caras, aristas y vértices.</p>
    </div>

    <div style="background:linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border:2px solid #8b5cf6; border-radius:18px; padding:18px 20px; margin-bottom:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
        <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#5b21b6;">⚡ Juego 1: ¡Clasificador Relámpago! ¿Qué cuerpo soy?</h3>
        <span id="shapeSortCounter" style="font-size:0.85rem; font-weight:800; background:white; padding:4px 12px; border-radius:999px; color:#6d28d9;">Tarjeta 1 de ${SHAPE_SORT_CARDS.length}</span>
      </div>
      <div id="shapeSortBox"></div>
    </div>

    <div style="background:#f8fafc; border:2px dashed #cbd5e1; border-radius:18px; padding:20px; margin:20px 0;">
      <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:center; justify-content:space-between; margin-bottom:14px;">
        <div>
          <label><b>🕵️‍♀️ Juego 2 (Detective 3D) · Elige el cuerpo a investigar:</b></label><br>
          <select id="solidSelect" onchange="changeSolid(this.value)" style="padding:8px 14px; border-radius:12px; font-weight:700; border:2px solid #cbd5e1; font-family:inherit; font-size:1rem;">
            ${selectOptions}
          </select>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn-three-tool active" id="btnHlAll" onclick="setSolidHighlight('all')">🌟 Normal</button>
          <button class="btn-three-tool" id="btnHlFaces" onclick="setSolidHighlight('faces')">🟢 Iluminar Caras</button>
          <button class="btn-three-tool" id="btnHlEdges" onclick="setSolidHighlight('edges')">🟡 Iluminar Aristas</button>
          <button class="btn-three-tool" id="btnHlVerts" onclick="setSolidHighlight('vertices')">🔴 Iluminar Vértices</button>
        </div>
      </div>

      <div class="three-viewport-wrap" id="shapes3dViewport">
        <div class="three-toolbar">
          <div class="three-badge-info" id="solidQuickBadge">Cuerpo Geométrico</div>
          <div class="three-buttons-row">
            <button class="btn-three-tool" onclick="resetShapesCamera()">🔄 Centrar</button>
          </div>
        </div>
        <div class="three-instructions">🖱️ Gira la figura en 3D y usa los botones de colores para contar sus Caras, Aristas y Vértices</div>
      </div>

      <div id="solidInfoCard" style="background:white; border:2px solid #e2e8f0; border-radius:14px; padding:20px; margin-top:16px;"></div>

      <div style="text-align:center; margin-top:16px;">
        <button class="btn-action-practice" onclick="navigate('practice', 'shapes')" style="display:inline-flex; width:auto; padding:12px 28px; font-size:1rem;">
          🎯 ¡Ir al Quiz Rápido de Cuerpos 3D!
        </button>
      </div>
    </div>
  `;

  renderShapeSortGame();
  initShapes3D();
}

function renderShapeSortGame() {
  const box = $('#shapeSortBox');
  if (!box) return;
  const item = SHAPE_SORT_CARDS[shapeSortIdx];
  const counterEl = $('#shapeSortCounter');
  if (counterEl) counterEl.textContent = `Pista ${shapeSortIdx + 1} de ${SHAPE_SORT_CARDS.length}`;

  box.innerHTML = `
    <div style="background:white; border:2px solid #ddd6fe; border-radius:14px; padding:16px; text-align:center; margin-bottom:12px;">
      <div style="font-size:1.1rem; font-weight:800; color:#1e293b; margin-bottom:14px;">
        "💬 ${item.clue}"
      </div>
      <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
        <button class="btn-primary-hero" onclick="answerShapeSort('prisma')" style="background:#3b82f6; color:white; padding:10px 20px; font-size:0.95rem;">
          🟦 ¡Es un PRISMA!
        </button>
        <button class="btn-primary-hero" onclick="answerShapeSort('piramide')" style="background:#ec4899; color:white; padding:10px 20px; font-size:0.95rem;">
          🔺 ¡Es una PIRÁMIDE!
        </button>
        <button class="btn-primary-hero" onclick="answerShapeSort('redondo')" style="background:#10b981; color:white; padding:10px 20px; font-size:0.95rem;">
          ⚪ ¡Cuerpo REDONDO!
        </button>
      </div>
      <div id="shapeSortFeedback" style="margin-top:12px; text-align:left;"></div>
    </div>
  `;
}

window.answerShapeSort = choice => {
  const item = SHAPE_SORT_CARDS[shapeSortIdx];
  const fb = $('#shapeSortFeedback');
  if (choice === item.ans) {
    Sound.win();
    addXP(15);
    addStar();
    fb.innerHTML = `
      <div class="feedback-banner success" style="margin-top:8px;">
        <span style="font-size:1.5rem;">🎉</span>
        <div style="flex:1;">
          <b>¡Correcto! +15 XP ⭐</b> ${item.explain}
        </div>
        <button class="btn-three-tool" onclick="nextShapeSortCard()" style="background:#15803d; color:white; border:none;">
          Siguiente Pista ➡️
        </button>
      </div>
    `;
  } else {
    Sound.error();
    fb.innerHTML = `
      <div class="feedback-banner error" style="margin-top:8px;">
        <span style="font-size:1.5rem;">🦊</span>
        <div>
          <b>¡Pista!</b> Recuerda: <b>Prisma</b> = 2 bases iguales y caras laterales <b>rectangulares</b>; <b>Pirámide</b> = 1 sola base y caras laterales <b>triangulares</b> con cúspide; <b>Redondo</b> = tiene superficies curvas.
        </div>
      </div>
    `;
  }
};

window.nextShapeSortCard = () => {
  Sound.click();
  shapeSortIdx = (shapeSortIdx + 1) % SHAPE_SORT_CARDS.length;
  renderShapeSortGame();
};

function initShapes3D() {
  const container = $('#shapes3dViewport');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth;
  const height = container.clientHeight || 400;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8fafc);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(4, 3, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.shadowMap.enabled = true;
  renderer.domElement.className = 'three-canvas';
  container.appendChild(renderer.domElement);

  let controls = null;
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 15;
    controls.minDistance = 2;
  }

  // Luces de estudio suaves
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);

  const dir1 = new THREE.DirectionalLight(0xffffff, 0.9);
  dir1.position.set(6, 10, 8);
  scene.add(dir1);

  const dir2 = new THREE.DirectionalLight(0x818cf8, 0.4);
  dir2.position.set(-6, -4, -6);
  scene.add(dir2);

  const meshGroup = new THREE.Group();
  scene.add(meshGroup);

  let animId = null;
  function animate() {
    animId = requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();

  activeThreeScene = {
    renderer,
    camera,
    controls,
    scene,
    meshGroup,
    destroy() {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    }
  };

  window.shapesThree = activeThreeScene;
  renderCurrentSolidIn3D();
}

window.resetShapesCamera = () => {
  if (!window.shapesThree) return;
  window.shapesThree.camera.position.set(4, 3, 5);
  window.shapesThree.camera.lookAt(0, 0, 0);
  if (window.shapesThree.controls) window.shapesThree.controls.target.set(0, 0, 0);
};

window.changeSolid = key => {
  currentSolidKey = key;
  renderCurrentSolidIn3D();
};

window.setSolidHighlight = mode => {
  solidHighlightMode = mode;
  $('#btnHlAll').classList.toggle('active', mode === 'all');
  $('#btnHlFaces').classList.toggle('active', mode === 'faces');
  $('#btnHlEdges').classList.toggle('active', mode === 'edges');
  $('#btnHlVerts').classList.toggle('active', mode === 'vertices');
  renderCurrentSolidIn3D();
};

function renderCurrentSolidIn3D() {
  const data = SHAPES_DATA[currentSolidKey];
  if (!data) return;

  // Actualizar Ficha Interactiva Detective 3D
  const infoEl = $('#solidInfoCard');
  if (infoEl) {
    const inpSt = `width:60px; padding:6px; border-radius:10px; font-weight:800; font-size:1.1rem; text-align:center; font-family:inherit;`;
    infoEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
        <div>
          <h3 style="font-size:1.3rem; font-weight:800; color:#1e293b; margin-bottom:4px;">🕵️‍♀️ Misión Detective: ${data.name}</h3>
          <span style="display:inline-block; padding:4px 12px; border-radius:999px; background:#e0e7ff; color:#4338ca; font-size:0.85rem; font-weight:700;">
            ${data.type} · Base: ${data.base}
          </span>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <div style="background:#ecfdf5; border:2px solid #10b981; padding:6px 12px; border-radius:12px; text-align:center;">
            <div style="font-size:0.72rem; font-weight:800; color:#047857;">🟢 CARAS PLANAS</div>
            <input type="number" id="inpSolidF" placeholder="?" style="${inpSt}; border:2px solid #10b981;">
          </div>
          <div style="background:#fffbeb; border:2px solid #f59e0b; padding:6px 12px; border-radius:12px; text-align:center;">
            <div style="font-size:0.72rem; font-weight:800; color:#b45309;">🟡 ARISTAS</div>
            <input type="number" id="inpSolidE" placeholder="?" style="${inpSt}; border:2px solid #f59e0b;">
          </div>
          <div style="background:#fef2f2; border:2px solid #ef4444; padding:6px 12px; border-radius:12px; text-align:center;">
            <div style="font-size:0.72rem; font-weight:800; color:#b91c1c;">🔴 VÉRTICES</div>
            <input type="number" id="inpSolidV" placeholder="?" style="${inpSt}; border:2px solid #ef4444;">
          </div>
        </div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:10px;">
        <button class="btn-primary-hero" onclick="checkSolidDetective()" style="background:#8b5cf6; color:white; padding:10px 22px; font-size:0.95rem;">
          ✅ ¡Comprobar mi Conteo 3D! (+25 XP ⭐)
        </button>
        <button class="btn-three-tool" onclick="revealSolidDetective()">
          🪄 Revelar respuesta
        </button>
      </div>
      <div id="solidDetectiveFeedback" style="margin-top:12px;"></div>
    `;
  }

  $('#solidQuickBadge').textContent = `${data.name} · ¡Gíralo para contar!`;

  if (!window.shapesThree) return;
  const group = window.shapesThree.meshGroup;

  while (group.children.length > 0) {
    group.remove(group.children[0]);
  }

  let geom = null;

  const key = currentSolidKey;
  if (key === 'cube') {
    geom = new THREE.BoxGeometry(2, 2, 2);
  } else if (key === 'prism_tri') {
    geom = new THREE.CylinderGeometry(1.4, 1.4, 2.2, 3);
  } else if (key === 'prism_rect') {
    geom = new THREE.BoxGeometry(2.4, 1.6, 1.4);
  } else if (key === 'prism_pent') {
    geom = new THREE.CylinderGeometry(1.3, 1.3, 2.2, 5);
  } else if (key === 'prism_hex') {
    geom = new THREE.CylinderGeometry(1.3, 1.3, 2.2, 6);
  } else if (key === 'pyr_tri') {
    geom = new THREE.ConeGeometry(1.4, 2.2, 3);
  } else if (key === 'pyr_square') {
    geom = new THREE.ConeGeometry(1.5, 2.2, 4);
    geom.rotateY(Math.PI / 4);
  } else if (key === 'pyr_pent') {
    geom = new THREE.ConeGeometry(1.4, 2.2, 5);
  } else if (key === 'pyr_hex') {
    geom = new THREE.ConeGeometry(1.4, 2.2, 6);
  } else if (key === 'cylinder') {
    geom = new THREE.CylinderGeometry(1.2, 1.2, 2.4, 32);
  } else if (key === 'cone') {
    geom = new THREE.ConeGeometry(1.3, 2.4, 32);
  } else if (key === 'sphere') {
    geom = new THREE.SphereGeometry(1.3, 32, 32);
  }

  if (!geom) return;

  // Material de caras
  let faceColor = 0xa5b4fc;
  let opacity = 0.55;
  if (solidHighlightMode === 'faces') {
    faceColor = 0x34d399;
    opacity = 0.75;
  } else if (solidHighlightMode === 'edges' || solidHighlightMode === 'vertices') {
    opacity = 0.35;
  }

  const mat = new THREE.MeshStandardMaterial({
    color: faceColor,
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: opacity,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geom, mat);
  group.add(mesh);

  // Aristas destacadas
  const edgeColor = solidHighlightMode === 'edges' ? 0xf59e0b : 0x1e293b;
  const edgeThick = solidHighlightMode === 'edges' ? 3 : 1.5;
  const edges = new THREE.EdgesGeometry(geom, key.startsWith('cylinder') || key === 'cone' ? 25 : 15);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: edgeColor, linewidth: edgeThick })
  );
  group.add(line);

  // Vértices destacados con esferitas brillantes (filtrando centros de tapas de Cylinder/Cone)
  if (data.V > 0 && (solidHighlightMode === 'vertices' || solidHighlightMode === 'all')) {
    const posAttr = geom.attributes.position;
    const pts = [];
    const eps = 0.05;
    for (let i = 0; i < posAttr.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const radialDist = Math.hypot(v.x, v.z);
      // Ignorar el centro de triangulación de las tapas planas
      if (key.startsWith('prism_') && radialDist < 0.2) continue;
      if ((key.startsWith('pyr_') || key === 'cone') && v.y < 0 && radialDist < 0.2) continue;
      if (key === 'cone' && v.y < 0) continue; // El cono solo tiene 1 vértice (la cúspide arriba)

      mesh.localToWorld(v);
      let exists = false;
      for (const p of pts) {
        if (p.distanceTo(v) < eps) { exists = true; break; }
      }
      if (!exists && pts.length < data.V) {
        pts.push(v);
      }
    }

    const vertGeom = new THREE.SphereGeometry(solidHighlightMode === 'vertices' ? 0.12 : 0.08, 16, 16);
    const vertMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff0000,
      emissiveIntensity: solidHighlightMode === 'vertices' ? 0.6 : 0.2
    });

    pts.forEach(p => {
      const vertMesh = new THREE.Mesh(vertGeom, vertMat);
      vertMesh.position.copy(p);
      group.add(vertMesh);
    });
  }
}

window.checkSolidDetective = () => {
  const data = SHAPES_DATA[currentSolidKey];
  if (!data) return;
  const fVal = $('#inpSolidF').value.trim();
  const eVal = $('#inpSolidE').value.trim();
  const vVal = $('#inpSolidV').value.trim();
  const fb = $('#solidDetectiveFeedback');

  if (fVal === '' || eVal === '' || vVal === '') {
    Sound.error();
    fb.innerHTML = `<div class="feedback-banner error"><span>👆</span><div>Escribe cuántos <b>Caras planas</b>, <b>Aristas</b> y <b>Vértices</b> contaste en la figura 3D.</div></div>`;
    return;
  }

  const f = Number(fVal);
  const e = Number(eVal);
  const v = Number(vVal);

  if (f === data.F && e === data.E && v === data.V) {
    Sound.win();
    addXP(25);
    addStar();
    launchConfetti();
    $('#solidQuickBadge').textContent = `${data.name} · C:${data.F} | A:${data.E} | V:${data.V} ✅`;
    fb.innerHTML = `
      <div class="feedback-banner success">
        <span style="font-size:1.8rem;">🕵️‍♀️</span>
        <div>
          <b>¡Caso resuelto, Detective ${S.name}! +25 XP ⭐</b><br>
          El <b>${data.name}</b> tiene exactamente <b>${data.F} caras planas</b>, <b>${data.E} aristas</b> y <b>${data.V} vértices</b>.<br>
          • <b>Base:</b> ${data.base} | <b>Paredes laterales:</b> ${data.sides}.
        </div>
      </div>
    `;
  } else {
    Sound.error();
    fb.innerHTML = `
      <div class="feedback-banner error">
        <span style="font-size:1.6rem;">🦊</span>
        <div>
          <b>¡Sigue investigando en 3D!</b> Usa los botones <b>🟢 Iluminar Caras</b>, <b>🟡 Iluminar Aristas</b> y <b>🔴 Iluminar Vértices</b>:<br>
          • Pista: Base = ${data.base} y paredes = ${data.sides}.
        </div>
      </div>
    `;
  }
};

window.revealSolidDetective = () => {
  const data = SHAPES_DATA[currentSolidKey];
  if (!data) return;
  $('#inpSolidF').value = data.F;
  $('#inpSolidE').value = data.E;
  $('#inpSolidV').value = data.V;
  Sound.ok();
  checkSolidDetective();
};

/* --- LECCIÓN 4: Medidas Estadísticas (100% Gamificada) --- */
const STATS_DATASETS = {
  nb_store: {
    label: '📓 Misión 1: Tienda escolar (9 días)',
    data: [20, 25, 18, 22, 25, 30, 25, 20, 15],
    note: 'Ventas en la tienda escolar durante 9 días.'
  },
  nb_ages: {
    label: '📓 Misión 2: Edades de 9 niños (95 ÷ 9)',
    data: [9, 10, 12, 11, 10, 13, 12, 10, 8],
    note: 'Edades de 9 niños en el colegio (Suma = 95).'
  },
  nb_books: {
    label: '📓 Misión 3: Libros en vacaciones (9 amigos)',
    data: [3, 5, 4, 2, 3, 5, 5, 7, 4],
    note: 'Libros leídos en vacaciones por 9 amigos (Suma = 38).'
  },
  nb_soccer: {
    label: '📓 Misión 4: Goles en 9 partidos',
    data: [2, 4, 3, 5, 2, 3, 2, 6, 5],
    note: 'Goles anotados por un equipo en 9 partidos (Suma = 32).'
  },
  nb_pe: {
    label: '📓 Misión 5: Tiempos Ed. Física (9 niños)',
    data: [12, 15, 14, 13, 15, 11, 16, 15, 14],
    note: 'Segundos que tardaron 9 estudiantes en correr (Suma = 125).'
  },
  exact_7: {
    label: '⚽ Misión 6: Promedio exacto (7 datos)',
    data: [3, 5, 2, 8, 5, 6, 6],
    note: 'Reto con división exacta: 35 ÷ 7 = 5.'
  }
};

let currentStatsKey = 'nb_store';
let statsData = [...STATS_DATASETS.nb_store.data];
let isStatsSorted = false;

function renderLessonStats(card) {
  let optsHtml = '';
  Object.keys(STATS_DATASETS).forEach(k => {
    optsHtml += `<option value="${k}" ${k === currentStatsKey ? 'selected' : ''}>${STATS_DATASETS[k].label}: [${STATS_DATASETS[k].data.join(', ')}]</option>`;
  });

  const inpSt = `width:68px; padding:6px 8px; border-radius:10px; border:2px solid #10b981; font-weight:800; font-size:1.05rem; text-align:center; font-family:inherit;`;

  card.innerHTML = `
    <div class="lesson-header">
      <h2 class="lesson-title">📊 Minijuego: Detective de Estadística</h2>
      <p class="lesson-subtitle">¡Ordena las cartas, toca el centro, descubre el repetido y supera las 6 misiones de datos!</p>
    </div>

    <div style="background:#f8fafc; border:2px dashed #cbd5e1; border-radius:18px; padding:20px; margin:16px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
        <div style="flex:1; min-width:260px;">
          <label><b>🎮 Elige la Misión de Datos:</b></label><br>
          <select id="statsPreset" onchange="changeStatsDataset(this.value)" style="width:100%; max-width:520px; padding:8px 14px; border-radius:12px; font-weight:700; border:2px solid #cbd5e1; font-family:inherit;">
            ${optsHtml}
          </select>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn-primary-hero" id="btnStatsSort" onclick="sortStatsCards()" style="background:#10b981; color:white; padding:8px 16px; font-size:0.92rem;">
            🔢 Paso 1: ¡Ordenar de Menor a Mayor!
          </button>
          <button class="btn-three-tool" onclick="highlightStatsMode()">👑 Iluminar Moda</button>
          <button class="btn-three-tool" onclick="highlightStatsMedian()">🎯 Iluminar Mediana</button>
          <button class="btn-three-tool" onclick="showStatsRange()">📏 Iluminar Rango</button>
        </div>
      </div>

      <div class="stats-cards-row" id="statsCardsContainer"></div>

      <div id="statsDetailBox" style="background:white; border:2px solid #e2e8f0; border-radius:14px; padding:14px 18px; margin-top:12px; font-size:0.98rem;">
        👆 <b>Paso 1:</b> Pulsa el botón verde <b>"🔢 ¡Ordenar de Menor a Mayor!"</b> (o toca cualquier carta para ver cuántas veces se repite).
      </div>

      <div style="background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border:2px solid #10b981; border-radius:16px; padding:16px; margin-top:16px;">
        <h4 style="margin:0 0 12px 0; color:#065f46; font-weight:800; font-size:1.05rem;">✍️ Paso 2: Completa el Tablero de la Misión</h4>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:12px;">
          <div style="background:white; padding:10px 12px; border-radius:12px; border:1.5px solid #a7f3d0;">
            <div style="font-size:0.8rem; font-weight:800; color:#047857;">👑 MODA (Dato que más se repite)</div>
            <div style="margin-top:6px;"><input type="number" id="inpStatMode" placeholder="?" style="${inpSt}"></div>
          </div>
          <div style="background:white; padding:10px 12px; border-radius:12px; border:1.5px solid #a7f3d0;">
            <div style="font-size:0.8rem; font-weight:800; color:#047857;">🎯 MEDIANA (Dato del centro ya ordenado)</div>
            <div style="margin-top:6px;"><input type="number" id="inpStatMedian" placeholder="?" style="${inpSt}"></div>
          </div>
          <div style="background:white; padding:10px 12px; border-radius:12px; border:1.5px solid #a7f3d0;">
            <div style="font-size:0.8rem; font-weight:800; color:#047857;">📏 RANGO (Mayor − Menor)</div>
            <div style="margin-top:6px;"><input type="number" id="inpStatRange" placeholder="?" style="${inpSt}"></div>
          </div>
          <div style="background:white; padding:10px 12px; border-radius:12px; border:1.5px solid #a7f3d0;">
            <div style="font-size:0.8rem; font-weight:800; color:#047857;" id="lblStatMeanBox">➗ MEDIA (Suma ÷ Cantidad, parte entera)</div>
            <div style="margin-top:6px;"><input type="number" id="inpStatMean" placeholder="?" style="${inpSt}"></div>
          </div>
        </div>
        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:14px;">
          <button class="btn-primary-hero" onclick="checkStatsMission()" style="background:#059669; color:white; padding:10px 24px; font-size:1rem;">
            ✅ ¡Comprobar Misión Estadística! (+25 XP ⭐)
          </button>
          <button class="btn-three-tool" onclick="autoFillStatsMission()" style="background:white;">
            🪄 Resolver y ver división en cajón
          </button>
        </div>
        <div id="statsMissionFeedback" style="margin-top:12px;"></div>
      </div>

      <div style="text-align:center; margin-top:20px;">
        <button class="btn-action-practice" onclick="navigate('practice', 'stats')" style="display:inline-flex; width:auto; padding:12px 28px; font-size:1rem;">
          🎯 ¡Ir al Quiz Rápido de Estadística!
        </button>
      </div>
    </div>
  `;

  isStatsSorted = false;
  renderStatsCards();
  updateStatsMeanLabel();
}

function updateStatsMeanLabel() {
  const sum = statsData.reduce((a, b) => a + b, 0);
  const N = statsData.length;
  const lbl = $('#lblStatMeanBox');
  if (lbl) {
    lbl.innerHTML = `➗ MEDIA (<code>${sum} ÷ ${N}</code>, cociente entero)`;
  }
}

window.changeStatsDataset = key => {
  currentStatsKey = key;
  if (STATS_DATASETS[key]) {
    statsData = [...STATS_DATASETS[key].data];
  }
  isStatsSorted = false;
  renderStatsCards();
  updateStatsMeanLabel();
  ['inpStatMode', 'inpStatMedian', 'inpStatRange', 'inpStatMean'].forEach(id => {
    if ($(`#${id}`)) $(`#${id}`).value = '';
  });
  if ($('#statsMissionFeedback')) $('#statsMissionFeedback').innerHTML = '';
  $('#statsDetailBox').innerHTML = `
    <b>${STATS_DATASETS[key] ? STATS_DATASETS[key].note : ''}</b><br>
    👆 <b>Paso 1:</b> Pulsa <b>"🔢 ¡Ordenar de Menor a Mayor!"</b> antes de buscar la Mediana.
  `;
};

function renderStatsCards() {
  const container = $('#statsCardsContainer');
  if (!container) return;
  container.innerHTML = '';
  const N = statsData.length;
  const midIdx = Math.floor(N / 2);

  statsData.forEach((num, idx) => {
    const card = document.createElement('div');
    card.className = 'stat-num-card';
    card.id = `stat-card-${idx}`;
    card.style.cursor = 'pointer';
    card.style.position = 'relative';
    const posBadge = isStatsSorted
      ? `<span style="display:block; font-size:0.68rem; font-weight:800; color:${idx === midIdx ? '#047857' : '#64748b'};">${idx + 1}.°${idx === midIdx ? ' 🎯' : ''}</span>`
      : '';
    card.innerHTML = `${posBadge}<span>${num}</span>`;
    card.onclick = () => {
      Sound.click();
      const count = statsData.filter(x => x === num).length;
      $('#statsDetailBox').innerHTML = `
        🔍 Tocaste el número <b>${num}</b>: aparece <b>${count} ${count === 1 ? 'vez' : 'veces'}</b> en la lista.
        ${isStatsSorted && idx === midIdx ? `¡Además está en la <b>posición ${idx + 1} (el centro exacto)</b>, así que es la <b>Mediana</b>!` : ''}
      `;
    };
    container.appendChild(card);
  });
}

window.sortStatsCards = () => {
  Sound.ok();
  statsData.sort((a, b) => a - b);
  isStatsSorted = true;
  renderStatsCards();
  const midIdx = Math.floor(statsData.length / 2);
  $('#statsDetailBox').innerHTML = `
    <b>✅ ¡Cartas Ordenadas de Menor a Mayor!</b><br>
    Mira las posiciones arriba de cada carta: el <b>1.° dato (${statsData[0]})</b> es el menor, el <b>${midIdx + 1}.° dato (${statsData[midIdx]} 🎯)</b> está en el centro exacto (<b>Mediana</b>), y el último (<b>${statsData[statsData.length - 1]}</b>) es el mayor.
  `;
};

window.highlightStatsMode = () => {
  Sound.click();
  const freq = {};
  statsData.forEach(n => freq[n] = (freq[n] || 0) + 1);
  let maxFreq = 0;
  for (const n in freq) {
    if (freq[n] > maxFreq) maxFreq = freq[n];
  }
  const modes = [];
  for (const n in freq) {
    if (freq[n] === maxFreq && maxFreq > 1) modes.push(Number(n));
  }
  $$('.stat-num-card').forEach((c, idx) => {
    c.className = 'stat-num-card';
    if (modes.includes(statsData[idx])) c.classList.add('highlight-mode');
  });
  $('#statsDetailBox').innerHTML = `
    <b>👑 Pista de Moda:</b> El número iluminado en amarillo se repite <b>${maxFreq} veces</b> (es el más repetido).
  `;
};

window.highlightStatsMedian = () => {
  Sound.click();
  statsData.sort((a, b) => a - b);
  isStatsSorted = true;
  renderStatsCards();
  const midIdx = Math.floor(statsData.length / 2);
  $$('.stat-num-card').forEach(c => c.className = 'stat-num-card');
  $(`#stat-card-${midIdx}`).classList.add('highlight-median');
  $('#statsDetailBox').innerHTML = `
    <b>🎯 Pista de Mediana:</b> Ya ordenados los ${statsData.length} datos, quedan ${midIdx} a la izquierda y ${midIdx} a la derecha. ¡Mira la carta verde en la posición ${midIdx + 1}!
  `;
};

window.showStatsRange = () => {
  Sound.click();
  statsData.sort((a, b) => a - b);
  isStatsSorted = true;
  renderStatsCards();
  $$('.stat-num-card').forEach((c, idx) => {
    c.className = 'stat-num-card';
    if (idx === 0) c.classList.add('highlight-min');
    if (idx === statsData.length - 1) c.classList.add('highlight-max');
  });
  const min = statsData[0];
  const max = statsData[statsData.length - 1];
  $('#statsDetailBox').innerHTML = `
    <b>📏 Pista de Rango:</b> Resta el Dato Mayor (<b>${max}</b>) menos el Dato Menor (<b>${min}</b>).
  `;
};

function getStatsAnswers() {
  const sorted = [...statsData].sort((a, b) => a - b);
  const N = sorted.length;
  const median = sorted[Math.floor(N / 2)];
  const range = sorted[N - 1] - sorted[0];
  const sum = sorted.reduce((a, b) => a + b, 0);
  const meanInt = Math.floor(sum / N);
  const meanDec = (sum / N).toFixed(2).replace('.', ',');

  const freq = {};
  sorted.forEach(n => freq[n] = (freq[n] || 0) + 1);
  let maxFreq = 0;
  let mode = sorted[0];
  for (const n in freq) {
    if (freq[n] > maxFreq) {
      maxFreq = freq[n];
      mode = Number(n);
    }
  }
  return { sorted, N, mode, maxFreq, median, range, min: sorted[0], max: sorted[N - 1], sum, meanInt, meanDec, rem: sum % N };
}

window.checkStatsMission = () => {
  const ans = getStatsAnswers();
  const uMode = Number($('#inpStatMode').value);
  const uMed = Number($('#inpStatMedian').value);
  const uRange = Number($('#inpStatRange').value);
  const uMean = Number($('#inpStatMean').value);
  const fb = $('#statsMissionFeedback');

  if (!isStatsSorted) {
    sortStatsCards();
  }

  if (uMode === ans.mode && uMed === ans.median && uRange === ans.range && uMean === ans.meanInt) {
    Sound.win();
    addXP(25);
    addStar();
    launchConfetti();

    let extraDivNote = '';
    if (ans.sum === 95 && ans.N === 9) {
      extraDivNote = `<br>💡 <b>Truco de Campeona en <code>95 ÷ 9</code>:</b> Cabe a <b>10</b> y sobran <b>5</b>. Al poner la coma agregas un cero al 5 formando <code>50 ÷ 9 = 5</code>, por eso con decimales da <b><code>10,55</code></b>.`;
    }

    fb.innerHTML = `
      <div class="feedback-banner success">
        <span style="font-size:1.8rem;">🏆</span>
        <div>
          <b>¡Misión Estadística Completada! +25 XP ⭐</b><br>
          • <b>Ordenados:</b> <code>[${ans.sorted.join(' - ')}]</code><br>
          • <b>Moda:</b> <b>${ans.mode}</b> (se repite ${ans.maxFreq} veces) | <b>Mediana:</b> <b>${ans.median}</b> (dato central) | <b>Rango:</b> <code>${ans.max} − ${ans.min} = <b>${ans.range}</b></code><br>
          • <b>Media:</b> <code>${ans.sum} ÷ ${ans.N} = <b>${ans.meanInt}</b></code> ${ans.rem > 0 ? `(con decimales: <b><code>${ans.meanDec}</code></b>)` : '(exacto)'}.${extraDivNote}
        </div>
      </div>
    `;
  } else {
    Sound.error();
    fb.innerHTML = `
      <div class="feedback-banner error">
        <span style="font-size:1.6rem;">🦊</span>
        <div>
          <b>¡Revisa tus casillas con estas pistas!</b><br>
          • Datos ordenados: <code>[${ans.sorted.join(' - ')}]</code><br>
          • <b>Moda</b> (más repetido): ${uMode === ans.mode ? '✅' : `Revisa cuál se repite ${ans.maxFreq} veces`}<br>
          • <b>Mediana</b> (posición ${Math.floor(ans.N / 2) + 1} 🎯): ${uMed === ans.median ? '✅' : `Mira la carta del centro (${ans.median})`}<br>
          • <b>Rango</b> (<code>${ans.max} − ${ans.min}</code>): ${uRange === ans.range ? '✅' : `Resta ${ans.max} − ${ans.min}`}<br>
          • <b>Media</b> (<code>${ans.sum} ÷ ${ans.N}</code>): ${uMean === ans.meanInt ? '✅' : `El cociente entero de ${ans.sum} ÷ ${ans.N} es ${ans.meanInt}`}
        </div>
      </div>
    `;
  }
};

window.autoFillStatsMission = () => {
  sortStatsCards();
  const ans = getStatsAnswers();
  $('#inpStatMode').value = ans.mode;
  $('#inpStatMedian').value = ans.median;
  $('#inpStatRange').value = ans.range;
  $('#inpStatMean').value = ans.meanInt;
  checkStatsMission();
};

/* --- LECCIÓN 5: Porcentajes (100% Gamificada) --- */
let coloredCells = 60;
let pctMissionIdx = 0;

const PCT_MISSIONS = [
  { pct: 60, simpN: 3, simpD: 5, dec: '60', title: '📓 Misión 1 (Cuaderno 1): Pinta el 60% (6 filas azules)', desc: 'Pinta 60 cuadritos en la cuadrícula y completa su fracción simplificada (dividiendo entre 20) y su decimal.' },
  { pct: 22, simpN: 11, simpD: 50, dec: '22', title: '📓 Misión 2 (Cuaderno 2): Pinta el 22% (2 filas + 2 cuadritos)', desc: 'Pinta 22 cuadritos azules y descubre cómo se escribe en fracción y en número decimal con coma.' },
  { pct: 25, simpN: 1, simpD: 4, dec: '25', title: '🎲 Misión 3 (Juego de $60.000): Pinta el 25% (La cuarta parte)', desc: 'El juego de mesa tiene 25% (1/4) de descuento. ¡Pinta 25 cuadritos y completa sus equivalencias!' },
  { pct: 75, simpN: 3, simpD: 4, dec: '75', title: '🌟 Misión 4: Pinta el 75% (Tres cuartas partes)', desc: 'Pinta 75 cuadritos (7 filas completas y 5 cuadritos) y completa el código.' }
];

function renderLessonPercent(card) {
  const inpSt = `width:58px; padding:6px; border-radius:10px; border:2px solid #f59e0b; font-weight:800; font-size:1rem; text-align:center; font-family:inherit;`;

  card.innerHTML = `
    <div class="lesson-header">
      <h2 class="lesson-title">💯 Minijuego: Pintora de Porcentajes C-P-A</h2>
      <p class="lesson-subtitle">¡Pinta la cuadrícula de 100 casillas (10×10), conecta el porcentaje con su fracción y su decimal, y gana estrellas!</p>
    </div>

    <div style="background:linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border:2px solid #f59e0b; border-radius:18px; padding:16px 20px; margin-bottom:18px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
        <div>
          <h3 id="pctMissionTitle" style="margin:0; font-size:1.15rem; font-weight:800; color:#92400e;"></h3>
          <p id="pctMissionDesc" style="margin:4px 0 0 0; font-size:0.92rem; color:#b45309;"></p>
        </div>
        <button class="btn-three-tool" onclick="nextPercentMission()" style="background:white; border-color:#f59e0b; color:#92400e;">
          🎲 Siguiente Misión
        </button>
      </div>

      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; background:white; padding:12px 14px; border-radius:12px; border:1.5px solid #fcd34d; font-weight:800; color:#1e293b;">
        <span>Fracción sobre 100:</span>
        <input type="number" id="inpPct100" placeholder="?" style="${inpSt}">
        <code>/ 100</code>
        <span>| Simplificada:</span>
        <input type="number" id="inpPctSimpN" placeholder="?" style="${inpSt}">
        <code>/</code>
        <input type="number" id="inpPctSimpD" placeholder="?" style="${inpSt}">
        <span>| Decimal: <code>0 ,</code></span>
        <input type="text" id="inpPctDec" placeholder="??" maxlength="2" style="${inpSt}">
        <button class="btn-primary-hero" onclick="checkPercentMission()" style="background:#d97706; color:white; padding:8px 18px; font-size:0.95rem;">
          🎨 ¡Revisar Cuadrícula! (+25 XP ⭐)
        </button>
      </div>
      <div id="pctMissionFeedback" style="margin-top:10px;"></div>
    </div>

    <div class="percent-grid-container">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <b>Cuadrícula de 100 casillas (10×10):</b>
          <span style="font-size:0.85rem; color:#64748b;">(Toca o arrastra para pintar)</span>
        </div>
        <div class="grid-100" id="percentGrid100"></div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px; justify-content:center;">
          <button class="btn-three-tool" onclick="setPercentGrid(60)" style="border-color:#3b82f6; color:#1d4ed8;">📓 Pintar 60%</button>
          <button class="btn-three-tool" onclick="setPercentGrid(22)" style="border-color:#3b82f6; color:#1d4ed8;">📓 Pintar 22%</button>
          <button class="btn-three-tool" onclick="setPercentGrid(25)">Pintar 25%</button>
          <button class="btn-three-tool" onclick="setPercentGrid(50)">Pintar 50%</button>
          <button class="btn-three-tool" onclick="setPercentGrid(75)">Pintar 75%</button>
          <button class="btn-three-tool" onclick="setPercentGrid(0)">🧹 Limpiar</button>
        </div>
      </div>

      <div class="percent-stats-panel">
        <h3 style="font-size:1.2rem; font-weight:800; color:#1e293b;">Tablero en Vivo (C-P-A):</h3>
        <div class="percent-trio-box">
          <div class="trio-item">
            <div class="trio-label">Cuadritos Pintados</div>
            <div class="trio-val" id="trioPercent">60%</div>
          </div>
          <div class="trio-item">
            <div class="trio-label">Fracción Decimal</div>
            <div class="trio-val" id="trioFraction">60/100</div>
          </div>
          <div class="trio-item">
            <div class="trio-label">Número Decimal</div>
            <div class="trio-val" id="trioDecimal">0,60</div>
          </div>
        </div>

        <div id="percentMeaningBox" style="background:white; border:1.5px solid #e2e8f0; border-radius:12px; padding:14px; font-size:0.95rem;"></div>
      </div>
    </div>

    <div style="text-align:center; margin-top:20px;">
      <button class="btn-action-practice" onclick="navigate('practice', 'percent')" style="display:inline-flex; width:auto; padding:12px 28px; font-size:1rem;">
        🎯 ¡Ir al Quiz Rápido de Porcentajes!
      </button>
    </div>
  `;

  renderPercentMissionHeader();
  initPercentGrid();
}

function renderPercentMissionHeader() {
  const m = PCT_MISSIONS[pctMissionIdx];
  if ($('#pctMissionTitle')) $('#pctMissionTitle').textContent = m.title;
  if ($('#pctMissionDesc')) $('#pctMissionDesc').textContent = m.desc;
  ['inpPct100', 'inpPctSimpN', 'inpPctSimpD', 'inpPctDec'].forEach(id => {
    if ($(`#${id}`)) $(`#${id}`).value = '';
  });
  if ($('#pctMissionFeedback')) $('#pctMissionFeedback').innerHTML = '';
}

window.nextPercentMission = () => {
  Sound.click();
  pctMissionIdx = (pctMissionIdx + 1) % PCT_MISSIONS.length;
  renderPercentMissionHeader();
};

window.checkPercentMission = () => {
  const m = PCT_MISSIONS[pctMissionIdx];
  const fb = $('#pctMissionFeedback');

  if (coloredCells !== m.pct) {
    Sound.error();
    fb.innerHTML = `<div class="feedback-banner error"><span>🎨</span><div><b>¡Pinta primero la cuadrícula!</b> Debes tener exactamente <b>${m.pct} cuadritos azules</b> pintados (ahora tienes ${coloredCells}).</div></div>`;
    return;
  }

  const u100 = Number($('#inpPct100').value);
  const uSN = Number($('#inpPctSimpN').value);
  const uSD = Number($('#inpPctSimpD').value);
  const uDec = $('#inpPctDec').value.trim();

  const decOk = (uDec === m.dec || (m.pct === 60 && uDec === '6'));
  if (u100 === m.pct && uSN === m.simpN && uSD === m.simpD && decOk) {
    Sound.win();
    addXP(25);
    addStar();
    launchConfetti();
    fb.innerHTML = `
      <div class="feedback-banner success">
        <span style="font-size:1.8rem;">🏆</span>
        <div>
          <b>¡Obra de Arte Matemática! +25 XP ⭐</b><br>
          <b>${m.pct}%</b> son <b>${m.pct} de 100</b> (<code>${m.pct}/100</code>), que simplificada es <b><code>${m.simpN}/${m.simpD}</code></b> y en decimal se escribe <b><code>0,${m.dec}</code></b>.
        </div>
      </div>
    `;
  } else {
    Sound.error();
    fb.innerHTML = `
      <div class="feedback-banner error">
        <span style="font-size:1.6rem;">🦊</span>
        <div>
          <b>¡Tu cuadrícula tiene ${m.pct} cuadritos, pero revisa las casillas!</b><br>
          • Fracción sobre 100: <code><b>${m.pct}</b> / 100</code> | Simplificada: <code><b>${m.simpN} / ${m.simpD}</b></code> | Decimal: <code><b>0,${m.dec}</b></code>.
        </div>
      </div>
    `;
  }
};

let isPointerDownGrid = false;

function initPercentGrid() {
  const grid = $('#percentGrid100');
  if (!grid) return;
  grid.innerHTML = '';

  for (let i = 0; i < 100; i++) {
    const cell = document.createElement('div');
    cell.className = `grid-cell ${i < coloredCells ? 'colored' : ''}`;
    cell.dataset.index = i;

    cell.addEventListener('pointerdown', () => {
      isPointerDownGrid = true;
      toggleCell(i);
    });

    cell.addEventListener('pointerenter', () => {
      if (isPointerDownGrid) toggleCell(i);
    });

    grid.appendChild(cell);
  }

  window.addEventListener('pointerup', () => { isPointerDownGrid = false; });
  updatePercentTrio();
}

function toggleCell(idx) {
  coloredCells = idx + 1;
  Sound.click();
  refreshGridCells();
  updatePercentTrio();
}

window.setPercentGrid = val => {
  coloredCells = val;
  Sound.ok();
  refreshGridCells();
  updatePercentTrio();
};

function refreshGridCells() {
  const cells = $$('.grid-cell', $('#percentGrid100'));
  cells.forEach((c, idx) => {
    c.classList.toggle('colored', idx < coloredCells);
  });
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function updatePercentTrio() {
  const pct = coloredCells;
  const decDot = (pct / 100).toFixed(2);
  const decComma = decDot.replace('.', ',');

  $('#trioPercent').textContent = `${pct}%`;
  $('#trioFraction').textContent = `${pct}/100`;
  $('#trioDecimal').textContent = decComma;

  const g = gcd(pct, 100);
  const simpNum = pct / g;
  const simpDen = 100 / g;
  const simpStr = (pct > 0 && pct < 100 && g > 1)
    ? ` &rarr; Simplificada (dividiendo entre ${g}): <code><b>${simpNum}/${simpDen}</b></code>`
    : (pct === 100 ? ' &rarr; Equivalente a <b>1 unidad entera</b>' : '');

  const entera = pct === 100 ? 1 : 0;
  const decimas = pct === 100 ? 0 : Math.floor(pct / 10);
  const centesimas = pct === 100 ? 0 : (pct % 10);

  $('#percentMeaningBox').innerHTML = `
    <b>Pictórico:</b> <b>${Math.floor(pct / 10)}</b> filas completas de 10 y <b>${pct % 10}</b> cuadritos sueltos (<b>${pct} de 100</b>).<br>
    <b>Fracción:</b> <code>${pct}/100</code>${simpStr}.<br>
    <b>Valor posicional decimal (<code>${decComma}</code>):</b> <b>${entera}</b> parte entera, <b>${decimas}</b> décimas y <b>${centesimas}</b> centésimas.
  `;
}

/* =========================================================
   VISTA 3: PRACTICAR (MINIJUEGOS & DESAFÍOS DE ENTRENAMIENTO)
   ========================================================= */
let currentPracticeQ = null;

function renderPractice(container) {
  let topicFilterButtons = `
    <button class="btn-three-tool ${activePracticeTopic === 'all' ? 'active' : ''}" onclick="filterPracticeTopic('all')">🌟 Todos los Temas</button>
  `;
  Object.values(TOPICS).forEach(t => {
    topicFilterButtons += `
      <button class="btn-three-tool ${activePracticeTopic === t.id ? 'active' : ''}" onclick="filterPracticeTopic('${t.id}')">
        ${t.icon} ${t.badge}
      </button>
    `;
  });

  container.innerHTML = `
    <div class="practice-container">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <h2 class="section-title">🎯 Centro de Entrenamiento</h2>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${topicFilterButtons}
        </div>
      </div>

      <div class="practice-card" id="practiceQuestionCard"></div>
    </div>
  `;

  loadNewPracticeQuestion();
}

window.filterPracticeTopic = topicId => {
  activePracticeTopic = topicId;
  navigate('practice', topicId);
};

/* Banco Completo de Preguntas Alineado al Cuaderno y Talleres de 4.° A */
function getQuestionPoolForTopic(chosenTopic) {
  if (chosenTopic === 'fraction') {
    return [
      {
        topicId: 'fraction',
        topicName: 'Fracción de un número',
        topicBadge: '🍰 Tema 1 · Taller 4.° A',
        question: `📄 <b>[Pregunta del Taller de 4.° A]</b> En el estante hay un paquete con <b>20 barras de plastilina</b>. Si el grupo de cuarto gasta las <b>3/4</b> partes en su maqueta de geometría y ponemos un <b>1 abajo al 20</b> (<code>20/1 × 3/4</code>), ¿cómo queda la operación final <b>numerador ÷ denominador</b> y cuántas barras usaron?`,
        hint: `Multiplica primero los numeradores (20 × 3 = 60) y los denominadores (1 × 4 = 4). Luego divide 60 ÷ 4.`,
        options: shuffle([
          { text: `60 ÷ 4 = 15 barras de plastilina`, isCorrect: true },
          { text: `20 ÷ 4 = 5 barras de plastilina`, isCorrect: false },
          { text: `20 ÷ 3 = 6 barras de plastilina`, isCorrect: false },
          { text: `80 ÷ 4 = 20 barras de plastilina`, isCorrect: false }
        ]),
        explanation: `Al poner un 1 abajo al 20 multiplicamos (20 × 3) / (1 × 4) = 60/4. Por eso en la casilla "numerador ÷ denominador" escribimos 60 ÷ 4 = 15 barras (igual que dividir 20 ÷ 4 = 5 y multiplicar 5 × 3 = 15).`
      },
      {
        topicId: 'fraction',
        topicName: 'Fracción de un número',
        topicBadge: '🍰 Tema 1 · Cuaderno',
        question: `📓 <b>[Ejercicio de tu Cuaderno]</b> Un juego de mesa cuesta <b>$60.000</b> y hoy tiene un descuento de <b>1/4</b> de su valor. ¿De cuánto dinero es el descuento y cuánto se debe pagar finalmente?`,
        hint: `Divide 60.000 ÷ 4 para hallar el descuento (1/4), y luego réstalo de 60.000.`,
        options: shuffle([
          { text: `Descuento de $15.000 y paga $45.000`, isCorrect: true },
          { text: `Descuento de $20.000 y paga $40.000`, isCorrect: false },
          { text: `Descuento de $15.000 y paga $60.000`, isCorrect: false },
          { text: `Descuento de $12.000 y paga $48.000`, isCorrect: false }
        ]),
        explanation: `1/4 de $60.000 es 60.000 ÷ 4 = $15.000 de descuento. Al restar $60.000 − $15.000 quedan $45.000 por pagar.`
      },
      {
        topicId: 'fraction',
        topicName: 'Fracción de un número',
        topicBadge: '🍰 Tema 1 · Cuaderno',
        question: `📓 <b>[Ejercicio de tu Cuaderno]</b> En una caja hay <b>20 dulces</b> y se reparten los <b>2/5</b> entre los amigos. ¿Cuántos dulces se repartieron y cuántos dulces <b>quedaron en la caja</b>?`,
        hint: `Primero calcula 2/5 de 20: (20 ÷ 5) × 2. Luego resta ese resultado a los 20 dulces iniciales.`,
        options: shuffle([
          { text: `Se repartieron 8 dulces y quedaron 12 en la caja`, isCorrect: true },
          { text: `Se repartieron 4 dulces y quedaron 16 en la caja`, isCorrect: false },
          { text: `Se repartieron 10 dulces y quedaron 10 en la caja`, isCorrect: false },
          { text: `Se repartieron 12 dulces y quedaron 8 en la caja`, isCorrect: false }
        ]),
        explanation: `Dividimos 20 ÷ 5 = 4, y multiplicamos 4 × 2 = 8 dulces repartidos. En la caja quedaron 20 − 8 = 12 dulces.`
      },
      {
        topicId: 'fraction',
        topicName: 'Fracción de un número',
        topicBadge: '🍰 Tema 1 · Cuaderno',
        question: `📓 <b>[Ejercicio de tu Cuaderno]</b> Para una actividad escolar se compraron <b>15 botellas de agua</b> y los jugadores bebieron las <b>2/3</b> partes. ¿Cuántas botellas de agua bebieron?`,
        hint: `En tu cajón de división: 15 ÷ 3 = 5, y al lado multiplicas 5 × 2.`,
        options: shuffle([
          { text: `10 botellas de agua`, isCorrect: true },
          { text: `5 botellas de agua`, isCorrect: false },
          { text: `12 botellas de agua`, isCorrect: false },
          { text: `9 botellas de agua`, isCorrect: false }
        ]),
        explanation: `Dividimos 15 ÷ 3 = 5 y multiplicamos por el numerador: 5 × 2 = 10 botellas de agua.`
      },
      {
        topicId: 'fraction',
        topicName: 'Fracción de un número',
        topicBadge: '🍰 Tema 1 · Cuaderno',
        question: `📓 <b>[Ejercicio de tu Cuaderno]</b> En un salón de <b>30 estudiantes</b>, las <b>2/5</b> partes prefieren jugar baloncesto. ¿Cuántos estudiantes prefieren baloncesto?`,
        hint: `Divide 30 ÷ 5 y multiplica el cociente por 2.`,
        options: shuffle([
          { text: `12 estudiantes`, isCorrect: true },
          { text: `6 estudiantes`, isCorrect: false },
          { text: `15 estudiantes`, isCorrect: false },
          { text: `18 estudiantes`, isCorrect: false }
        ]),
        explanation: `30 ÷ 5 = 6 estudiantes por cada quinto. Multiplicamos 6 × 2 = 12 estudiantes.`
      },
      {
        topicId: 'fraction',
        topicName: 'Fracción de un número',
        topicBadge: '🍰 Tema 1 · Taller 4.° A',
        question: `📄 <b>[Conexión Taller: Fracción Impropia a Mixto]</b> En el compartir del salón abrieron paquetes de galletas divididos en <b>6 partes iguales</b> cada uno. Si comieron <b>7/6</b> en total, ¿a qué <b>Número Mixto</b> equivale?`,
        hint: `Cada paquete tiene 6 sextos (6/6 = 1 paquete completo) y sobra 1 sexto adicional.`,
        options: shuffle([
          { text: `1 entero y 1/6 (1 1/6)`, isCorrect: true },
          { text: `6/12`, isCorrect: false },
          { text: `1 entero y 6/7`, isCorrect: false },
          { text: `2 enteros y 1/6`, isCorrect: false }
        ]),
        explanation: `Al dividir 7 ÷ 6 obtenemos 1 paquete completo (cociente = 1) y sobra 1 pedazo de 6 (residuo = 1), es decir, 1 1/6.`
      }
    ];
  } else if (chosenTopic === 'volume') {
    return [
      {
        topicId: 'volume',
        topicName: 'Cálculo de volumen',
        topicBadge: '📦 Tema 2 · Cuaderno',
        question: `📓 <b>[Ejercicio Exacto de tu Cuaderno]</b> Calcula el volumen de un prisma rectangular cuyas medidas son: <b>largo = 5 cm</b>, <b>ancho = 2 cm</b> y <b>alto = 6 cm</b>.`,
        hint: `Usa la fórmula de tu cuaderno: V = largo × ancho × alto.`,
        options: shuffle([
          { text: `60 cm³`, isCorrect: true },
          { text: `13 cm³`, isCorrect: false },
          { text: `30 cm³`, isCorrect: false },
          { text: `50 cm³`, isCorrect: false }
        ]),
        explanation: `Aplicamos V = largo × ancho × alto: 5 × 2 = 10, y 10 × 6 = 60 cm³.`
      },
      {
        topicId: 'volume',
        topicName: 'Cálculo de volumen',
        topicBadge: '📦 Tema 2 · Cuaderno',
        question: `📓 <b>[Definición de tu Cuaderno]</b> ¿Qué es el <b>volumen</b> de un cuerpo y en qué unidades se mide?`,
        hint: `Revisa tu apunte de Clase de Volumen: tiene 3 dimensiones (largo, ancho y alto).`,
        options: shuffle([
          { text: `Es el espacio que ocupa un cuerpo y se mide en unidades cúbicas (cm³, m³, km³)`, isCorrect: true },
          { text: `Es el borde de una figura plana y se mide en centímetros simples (cm)`, isCorrect: false },
          { text: `Es el peso de una figura y se mide únicamente en kilogramos (kg)`, isCorrect: false },
          { text: `Es la suma de los vértices de un polígono`, isCorrect: false }
        ]),
        explanation: `Como anotaste en tu cuaderno: "Volumen es el espacio que ocupa un cuerpo y se mide en m³, cm³, km³...".`
      },
      {
        topicId: 'volume',
        topicName: 'Cálculo de volumen',
        topicBadge: '📦 Tema 2',
        question: `Luciana construye una torre con cubitos de 1 cm³. La base tiene <b>4 cubitos de largo</b> por <b>3 cubitos de ancho</b>, y la torre tiene <b>2 pisos de altura</b>. ¿Cuál es su volumen total?`,
        hint: `Calcula los cubitos de un piso (4 × 3 = 12) y multiplícalo por los 2 pisos.`,
        options: shuffle([
          { text: `24 cm³`, isCorrect: true },
          { text: `9 cm³`, isCorrect: false },
          { text: `14 cm³`, isCorrect: false },
          { text: `18 cm³`, isCorrect: false }
        ]),
        explanation: `En cada piso hay 4 × 3 = 12 cubitos. Como tiene 2 pisos de alto: 12 × 2 = 24 cm³.`
      },
      {
        topicId: 'volume',
        topicName: 'Cálculo de volumen',
        topicBadge: '📦 Tema 2',
        question: `Un cubo mágico tiene <b>3 cm de largo</b>, <b>3 cm de ancho</b> y <b>3 cm de alto</b>. ¿Cuántos cubitos de 1 cm³ caben exactamente en su interior?`,
        hint: `Multiplica 3 × 3 × 3 (¡cuidado: no es 3 + 3 + 3!).`,
        options: shuffle([
          { text: `27 cm³`, isCorrect: true },
          { text: `9 cm³`, isCorrect: false },
          { text: `18 cm³`, isCorrect: false },
          { text: `12 cm³`, isCorrect: false }
        ]),
        explanation: `Multiplicamos Largo × Ancho × Alto: 3 × 3 = 9, y 9 × 3 = 27 cm³.`
      },
      {
        topicId: 'volume',
        topicName: 'Cálculo de volumen',
        topicBadge: '📦 Tema 2',
        question: `Una caja de regalos tiene un volumen total de <b>40 cm³</b>. Si su base mide <b>5 cm de largo</b> y <b>4 cm de ancho</b> (20 cm² en cada piso), ¿cuántos centímetros de <b>alto</b> tiene la caja?`,
        hint: `Si 5 × 4 = 20 en cada capa, ¿por qué número multiplicas 20 para llegar a 40?`,
        options: shuffle([
          { text: `2 cm de alto`, isCorrect: true },
          { text: `4 cm de alto`, isCorrect: false },
          { text: `10 cm de alto`, isCorrect: false },
          { text: `20 cm de alto`, isCorrect: false }
        ]),
        explanation: `La base tiene 5 × 4 = 20 cubitos por piso. Para completar 40 cm³, dividimos 40 ÷ 20 = 2 cm de alto.`
      }
    ];
  } else if (chosenTopic === 'shapes') {
    return [
      {
        topicId: 'shapes',
        topicName: 'Cuerpos Geométricos',
        topicBadge: '🔷 Tema 3 · Mapa del Cuaderno',
        question: `📓 <b>[Mapa Conceptual del Cuaderno]</b> ¿Cuál es la diferencia verdadera entre un <b>Prisma</b> y una <b>Pirámide</b>?`,
        hint: `Recuerda corregir la confusión del cuaderno: ¿cuál tiene 2 bases y caras rectangulares, y cuál tiene 1 base y caras triangulares?`,
        options: shuffle([
          { text: `El Prisma tiene 2 bases iguales y caras laterales rectangulares; la Pirámide tiene 1 sola base, caras laterales triangulares y termina en un vértice (cúspide)`, isCorrect: true },
          { text: `El Prisma tiene 2 bases y caras laterales triangulares; la Pirámide tiene caras rectangulares`, isCorrect: false },
          { text: `Ambos tienen 2 bases, pero la pirámide es redonda`, isCorrect: false },
          { text: `El Prisma no tiene vértices y la Pirámide tiene 2 cúspides`, isCorrect: false }
        ]),
        explanation: `¡Fundamental! Todo PRISMA tiene 2 bases paralelas y caras laterales RECTANGULARES. Toda PIRÁMIDE tiene 1 sola base, caras laterales TRIANGULARES y termina en un vértice o cúspide.`
      },
      {
        topicId: 'shapes',
        topicName: 'Cuerpos Geométricos',
        topicBadge: '🔷 Tema 3',
        question: `Observa una <b>Pirámide Cuadrangular</b> (como las de Egipto, con 1 base cuadrada). ¿Cuántas <b>caras</b>, <b>vértices</b> y <b>aristas</b> tiene en total?`,
        hint: `Tiene 1 base cuadrada (4 lados) + 4 caras triangulares. Arriba tiene 1 cúspide.`,
        options: shuffle([
          { text: `5 caras, 5 vértices y 8 aristas`, isCorrect: true },
          { text: `6 caras, 8 vértices y 12 aristas`, isCorrect: false },
          { text: `4 caras, 4 vértices y 6 aristas`, isCorrect: false },
          { text: `5 caras, 8 vértices y 5 aristas`, isCorrect: false }
        ]),
        explanation: `Con base cuadrada (n = 4): Caras = 4 + 1 = 5; Vértices = 4 de la base + 1 cúspide = 5; Aristas = 4 de la base + 4 laterales = 8.`
      },
      {
        topicId: 'shapes',
        topicName: 'Cuerpos Geométricos',
        topicBadge: '🔷 Tema 3',
        question: `Un <b>Prisma Triangular</b> (como una carpa de acampar o un chocolate Toblerone) tiene 2 bases triangulares y 3 caras laterales rectangulares. ¿Cuántas <b>caras</b>, <b>vértices</b> y <b>aristas</b> tiene?`,
        hint: `Tiene 2 triángulos (3 vértices cada uno) unidos por 3 aristas laterales.`,
        options: shuffle([
          { text: `5 caras, 6 vértices y 9 aristas`, isCorrect: true },
          { text: `4 caras, 4 vértices y 6 aristas`, isCorrect: false },
          { text: `6 caras, 8 vértices y 12 aristas`, isCorrect: false },
          { text: `5 caras, 9 vértices y 6 aristas`, isCorrect: false }
        ]),
        explanation: `Para el Prisma Triangular (n = 3): Caras = 3 + 2 = 5; Vértices = 2 × 3 = 6; Aristas = 3 × 3 = 9.`
      },
      {
        topicId: 'shapes',
        topicName: 'Cuerpos Geométricos',
        topicBadge: '🔷 Tema 3',
        question: `Un <b>Cubo</b> o un <b>Prisma Rectangular</b> (como una caja de zapatos) tiene exactamente:`,
        hint: `Cuenta las tapas de un dado común (Caras), sus esquinas (Vértices) y sus bordes (Aristas).`,
        options: shuffle([
          { text: `6 caras, 8 vértices y 12 aristas`, isCorrect: true },
          { text: `6 caras, 12 vértices y 8 aristas`, isCorrect: false },
          { text: `4 caras, 8 vértices y 10 aristas`, isCorrect: false },
          { text: `8 caras, 6 vértices y 12 aristas`, isCorrect: false }
        ]),
        explanation: `Todo cubo o prisma rectangular tiene 6 caras planas, 8 esquinas (vértices) y 12 bordes (aristas).`
      },
      {
        topicId: 'shapes',
        topicName: 'Cuerpos Geométricos',
        topicBadge: '🔷 Tema 3',
        question: `¿Cómo se clasifican el <b>Cilindro</b>, el <b>Cono</b> y la <b>Esfera</b>, y cuál de ellos tiene exactamente <b>1 base circular plana y 1 vértice (cúspide)</b>?`,
        hint: `Tienen superficies curvas por lo que pueden rodar; piensa en un gorrito de fiesta o barquillo de helado.`,
        options: shuffle([
          { text: `Son Cuerpos Redondos, y el que tiene 1 base circular y 1 cúspide es el Cono`, isCorrect: true },
          { text: `Son Poliedros, y el que tiene 1 cúspide es el Cilindro`, isCorrect: false },
          { text: `Son Prismas, y el que tiene 1 base circular es la Esfera`, isCorrect: false },
          { text: `Son Pirámides redondas y todos tienen 8 vértices`, isCorrect: false }
        ]),
        explanation: `El cilindro, el cono y la esfera son Cuerpos Redondos. El Cono tiene 1 base circular plana y 1 cúspide; el Cilindro tiene 2 bases circulares y 0 vértices; la Esfera no tiene caras planas ni vértices.`
      }
    ];
  } else if (chosenTopic === 'stats') {
    return [
      {
        topicId: 'stats',
        topicName: 'Moda, Media, Mediana y Rango',
        topicBadge: '📊 Tema 4 · Cuaderno (Ej. 1)',
        question: `📓 <b>[Ejercicio 1 de tu Cuaderno: Tienda Escolar]</b> Las ventas durante 9 días fueron: <b>[20, 25, 18, 22, 25, 30, 25, 20, 15]</b>. ¿Cuáles son la <b>Moda</b>, la <b>Mediana</b> y el <b>Rango</b>?`,
        hint: `Ordenados de menor a mayor quedan: [15, 18, 20, 20, 22, 25, 25, 25, 30]. El 5.° dato es el centro.`,
        options: shuffle([
          { text: `Moda = 25 | Mediana = 22 | Rango = 15 (30 − 15)`, isCorrect: true },
          { text: `Moda = 20 | Mediana = 25 | Rango = 10`, isCorrect: false },
          { text: `Moda = 25 | Mediana = 30 | Rango = 15`, isCorrect: false },
          { text: `Moda = 22 | Mediana = 22 | Rango = 30`, isCorrect: false }
        ]),
        explanation: `Al ordenar los 9 datos: [15, 18, 20, 20, 22, 25, 25, 25, 30]. El que más se repite es 25 (Moda = 25), el centro en la posición 5 es 22 (Mediana = 22), y el Rango es 30 − 15 = 15.`
      },
      {
        topicId: 'stats',
        topicName: 'Moda, Media, Mediana y Rango',
        topicBadge: '📊 Tema 4 · Cuaderno (Ej. 5)',
        question: `📓 <b>[Ejercicio 5 de tu Cuaderno: Edades de 9 niños]</b> Las edades son <b>[9, 10, 12, 11, 10, 13, 12, 10, 8]</b>. Su suma total es <b>95</b>. Al calcular la <b>Media (95 ÷ 9)</b>, ¿cuál es el resultado correcto y cuál es la <b>Moda</b>?`,
        hint: `¡Cuidado con el error del cuaderno! 95 ÷ 9 cabe a 10 y sobran 5; al agregar el 0 decimal divides 50 ÷ 9 = 5.`,
        options: shuffle([
          { text: `Media = 10 (con decimal 10,55) y Moda = 10`, isCorrect: true },
          { text: `Media = 10,05 y Moda = 12`, isCorrect: false },
          { text: `Media = 9,5 y Moda = 10`, isCorrect: false },
          { text: `Media = 11 y Moda = 13`, isCorrect: false }
        ]),
        explanation: `La suma es 95. Al dividir 95 ÷ 9 el cociente entero es 10 y sobran 5; al bajar el 0 decimal queda 50 ÷ 9 = 5, dando 10,55 (¡no 10,05!). El 10 se repite 3 veces (Moda = 10).`
      },
      {
        topicId: 'stats',
        topicName: 'Moda, Media, Mediana y Rango',
        topicBadge: '📊 Tema 4 · Cuaderno (Ej. 2)',
        question: `📓 <b>[Ejercicio 2 de tu Cuaderno: Libros en vacaciones]</b> 9 amigos leyeron esta cantidad de libros: <b>[3, 5, 4, 2, 3, 5, 5, 7, 4]</b>. ¿Cuál es la <b>Mediana</b>, la <b>Moda</b> y el <b>Rango</b>?`,
        hint: `Ordena primero los 9 datos: [2, 3, 3, 4, 4, 5, 5, 5, 7]. Ubica el 5.° dato, el más repetido y 7 − 2.`,
        options: shuffle([
          { text: `Mediana = 4 | Moda = 5 | Rango = 5`, isCorrect: true },
          { text: `Mediana = 5 | Moda = 4 | Rango = 5`, isCorrect: false },
          { text: `Mediana = 4 | Moda = 5 | Rango = 7`, isCorrect: false },
          { text: `Mediana = 3 | Moda = 3 | Rango = 5`, isCorrect: false }
        ]),
        explanation: `Ordenados: [2, 3, 3, 4, 4, 5, 5, 5, 7]. El dato central (5.° lugar) es 4 (Mediana = 4), el que más se repite es 5 (Moda = 5), la suma es 38 (Media = 4,22) y la distancia entre el mayor y el menor es 7 − 2 = 5 (Rango = 5).`
      },
      {
        topicId: 'stats',
        topicName: 'Moda, Media, Mediana y Rango',
        topicBadge: '📊 Tema 4 · Cuaderno (Ej. 4)',
        question: `📓 <b>[Ejercicio 4 de tu Cuaderno: Educación Física]</b> Los tiempos en segundos de 9 estudiantes fueron: <b>[12, 15, 14, 13, 15, 11, 16, 15, 14]</b>. ¿Cuáles son su <b>Moda</b>, <b>Mediana</b> y <b>Rango</b>?`,
        hint: `Ordenados de menor a mayor: [11, 12, 13, 14, 14, 15, 15, 15, 16].`,
        options: shuffle([
          { text: `Moda = 15 | Mediana = 14 | Rango = 5 (16 − 11)`, isCorrect: true },
          { text: `Moda = 14 | Mediana = 15 | Rango = 5`, isCorrect: false },
          { text: `Moda = 15 | Mediana = 13 | Rango = 4`, isCorrect: false },
          { text: `Moda = 16 | Mediana = 14 | Rango = 6`, isCorrect: false }
        ]),
        explanation: `El 15 se repite 3 veces (Moda = 15). Al ordenar [11, 12, 13, 14, 14, 15, 15, 15, 16], el centro (5.° dato) es 14 (Mediana = 14). El Rango es 16 − 11 = 5.`
      },
      {
        topicId: 'stats',
        topicName: 'Moda, Media, Mediana y Rango',
        topicBadge: '📊 Tema 4 · Definiciones Clase 52',
        question: `📓 <b>[Conceptos de tu Cuaderno]</b> Según tus apuntes de la Clase 52, ¿qué medida estadística <i>"busca la distancia entre el dato mayor y el dato menor para mostrarnos qué tan separados o dispersos están"</i> y cuál es <i>"el valor de equilibrio si todos los datos se reparten por igual"</i>?`,
        hint: `La distancia (Mayor − Menor) mide la dispersión; repartir la suma entre el total de datos es el promedio.`,
        options: shuffle([
          { text: `La distancia es el RANGO y el valor de equilibrio al repartir es la MEDIA (Promedio)`, isCorrect: true },
          { text: `La distancia es la MODA y el valor de equilibrio es el RANGO`, isCorrect: false },
          { text: `La distancia es la MEDIANA y el valor de equilibrio es la MODA`, isCorrect: false },
          { text: `Ambas definiciones corresponden únicamente a la MODA`, isCorrect: false }
        ]),
        explanation: `En tu cuaderno anotaste: Rango = distancia entre el dato mayor y el dato menor (dispersión); Media o promedio = valor de equilibrio si todos los datos se reparten por igual.`
      },
      {
        topicId: 'stats',
        topicName: 'Moda, Media, Mediana y Rango',
        topicBadge: '📊 Tema 4',
        question: `Las calificaciones de Luciana en 5 talleres fueron: <b>[4, 5, 3, 5, 3]</b>. ¿Cuál es su <b>Media (Promedio)</b> exacta?`,
        hint: `Suma los 5 datos (4 + 5 + 3 + 5 + 3) y divide el total entre 5.`,
        options: shuffle([
          { text: `4 (porque 20 ÷ 5 = 4)`, isCorrect: true },
          { text: `5`, isCorrect: false },
          { text: `3`, isCorrect: false },
          { text: `20`, isCorrect: false }
        ]),
        explanation: `Sumamos los 5 datos: 4 + 5 + 3 + 5 + 3 = 20. Dividimos entre el número de talleres (5): 20 ÷ 5 = 4.`
      }
    ];
  } else {
    return [
      {
        topicId: 'percent',
        topicName: 'Porcentajes',
        topicBadge: '💯 Tema 5 · Cuaderno (Clase 49)',
        question: `📓 <b>[Cuadrícula 1 de tu Cuaderno]</b> En tu cuaderno pegaste una cuadrícula de 10×10 (100 cuadritos) y coloreaste <b>6 filas completas de azul (60 cuadritos)</b>. ¿Cómo se expresa como <b>porcentaje</b>, <b>fracción decimal</b> y <b>número decimal</b>?`,
        hint: `60 cuadritos de 100 son 60 por ciento, 60 sobre 100 y 60 centésimas (o 6 décimas).`,
        options: shuffle([
          { text: `60% = 60/100 (o 3/5) = 0,60 (o 0,6)`, isCorrect: true },
          { text: `6% = 6/100 = 0,06`, isCorrect: false },
          { text: `60% = 100/60 = 6,0`, isCorrect: false },
          { text: `40% = 40/100 = 0,40`, isCorrect: false }
        ]),
        explanation: `6 filas de 10 son 60 cuadritos de 100: equivale al 60%, a la fracción 60/100 (que simplificada es 6/10 o 3/5) y al decimal 0,60 (o 0,6).`
      },
      {
        topicId: 'percent',
        topicName: 'Porcentajes',
        topicBadge: '💯 Tema 5 · Cuaderno (Clase 49)',
        question: `📓 <b>[Cuadrícula 2 de tu Cuaderno]</b> En la segunda cuadrícula de 10×10 de tu cuaderno coloreaste <b>2 filas completas y 2 cuadritos más (22 cuadritos azules)</b>. ¿Cuál es su representación correcta como porcentaje, fracción y decimal?`,
        hint: `Son 22 partes de 100 (veintidós centésimas).`,
        options: shuffle([
          { text: `22% = 22/100 = 0,22`, isCorrect: true },
          { text: `2,2% = 22/10 = 2,2`, isCorrect: false },
          { text: `20% = 20/100 = 0,20`, isCorrect: false },
          { text: `22% = 22/100 = 0,022`, isCorrect: false }
        ]),
        explanation: `22 cuadritos de 100 representan el 22%, la fracción 22/100 (o 11/50 simplificada) y el número decimal 0,22 (0 unidades, 2 décimas y 2 centésimas).`
      },
      {
        topicId: 'percent',
        topicName: 'Porcentajes',
        topicBadge: '💯 Tema 5',
        question: `¿Cuál de las siguientes relaciones entre <b>Porcentaje</b>, <b>Fracción Simplificada</b> y <b>Número Decimal</b> es <b>100% CORRECTA</b>?`,
        hint: `Recuerda que 25 es la cuarta parte de 100 y 75 son las tres cuartas partes de 100.`,
        options: shuffle([
          { text: `25% = 25/100 = 1/4 = 0,25`, isCorrect: true },
          { text: `25% = 25/100 = 1/2 = 2,5`, isCorrect: false },
          { text: `50% = 50/100 = 1/4 = 0,05`, isCorrect: false },
          { text: `75% = 75/100 = 1/3 = 0,75`, isCorrect: false }
        ]),
        explanation: `El 25% es 25/100; si simplificamos dividiendo numerador y denominador entre 25 obtenemos 1/4 (la cuarta parte), y en decimal es 0,25.`
      },
      {
        topicId: 'percent',
        topicName: 'Porcentajes',
        topicBadge: '💯 Tema 5',
        question: `Si en un colegio el <b>75%</b> de los estudiantes de 4.° A ya entregaron su maqueta, ¿qué <b>fracción</b> y qué <b>número decimal</b> representan esa cantidad?`,
        hint: `75 de cada 100 equivale a tres cuartas partes del grupo.`,
        options: shuffle([
          { text: `Fracción 75/100 (o 3/4) y decimal 0,75`, isCorrect: true },
          { text: `Fracción 75/10 y decimal 7,5`, isCorrect: false },
          { text: `Fracción 1/4 y decimal 0,25`, isCorrect: false },
          { text: `Fracción 7/5 y decimal 0,075`, isCorrect: false }
        ]),
        explanation: `75% se escribe como fracción 75/100 (que simplificada entre 25 es 3/4) y como número decimal 0,75 (7 décimas y 5 centésimas).`
      },
      {
        topicId: 'percent',
        topicName: 'Porcentajes',
        topicBadge: '💯 Tema 5 · Clase 46 (Decimales)',
        question: `📓 <b>[Valor Posicional de Decimales y Porcentajes]</b> El número decimal <b>0,45</b> equivale al <b>45%</b> (<code>45/100</code>). Según la tabla posicional de tu cuaderno, ¿cómo se descompone <b>0,45</b>?`,
        hint: `El primer dígito después de la coma son las décimas y el segundo son las centésimas.`,
        options: shuffle([
          { text: `0 parte entera, 4 décimas y 5 centésimas`, isCorrect: true },
          { text: `4 parte entera, 0 décimas y 5 centésimas`, isCorrect: false },
          { text: `0 parte entera, 5 décimas y 4 centésimas`, isCorrect: false },
          { text: `45 parte entera y 0 décimas`, isCorrect: false }
        ]),
        explanation: `En 0,45 el 0 antes de la coma es la parte entera, el 4 ocupa el lugar de las décimas (4/10) y el 5 el lugar de las centésimas (5/100).`
      }
    ];
  }
}

function generateQuestion(topicId = null) {
  const chosenTopic = topicId && topicId !== 'all' ? topicId : pickRandom(Object.keys(TOPICS));
  const pool = getQuestionPoolForTopic(chosenTopic);
  return pickRandom(pool);
}

function loadNewPracticeQuestion() {
  const card = $('#practiceQuestionCard');
  if (!card) return;

  currentPracticeQ = generateQuestion(activePracticeTopic);

  let optionsHtml = '';
  const letters = ['A', 'B', 'C', 'D'];
  currentPracticeQ.options.forEach((opt, idx) => {
    optionsHtml += `
      <button class="option-btn" id="optBtn_${idx}" onclick="handlePracticeOption(${idx})">
        <span class="option-letter">${letters[idx]}</span>
        <span>${opt.text}</span>
      </button>
    `;
  });

  card.innerHTML = `
    <div class="practice-header">
      <div class="practice-topic-tag">${currentPracticeQ.topicBadge}</div>
      <div class="practice-streak-tag">🔥 Racha: <b>${S.streak}</b></div>
    </div>
    <div class="question-text">${currentPracticeQ.question}</div>
    <div class="options-grid">
      ${optionsHtml}
    </div>
    <div id="practiceFeedback"></div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">
      <button class="btn-three-tool" onclick="showPracticeHint()">💡 Dame una pista</button>
      <div id="practiceNextArea"></div>
    </div>
  `;
}

window.showPracticeHint = () => {
  Sound.click();
  showToast(`💡 Pista: ${currentPracticeQ.hint}`);
};

window.handlePracticeOption = selectedIdx => {
  const opt = currentPracticeQ.options[selectedIdx];
  const btn = $(`#optBtn_${selectedIdx}`);
  const feedback = $('#practiceFeedback');

  // Desactivar todos los botones
  $$('.option-btn').forEach((b, i) => {
    b.disabled = true;
    if (currentPracticeQ.options[i].isCorrect) {
      b.classList.add('correct');
    }
  });

  if (opt.isCorrect) {
    btn.classList.add('correct');
    recordAnswer(currentPracticeQ.topicId, true);
    feedback.innerHTML = `
      <div class="feedback-banner success">
        <span style="font-size:1.8rem;">🎉</span>
        <div>
          <b>¡Excelente respuesta! +${15 + Math.min(S.streak * 2, 20)} XP ⭐</b><br>
          ${currentPracticeQ.explanation}
        </div>
      </div>
    `;
    launchConfetti();
  } else {
    btn.classList.add('wrong');
    recordAnswer(currentPracticeQ.topicId, false);
    feedback.innerHTML = `
      <div class="feedback-banner error">
        <span style="font-size:1.8rem;">💪</span>
        <div>
          <b>¡Casi! No te preocupes, aprendemos de cada intento.</b><br>
          ${currentPracticeQ.explanation}
        </div>
      </div>
    `;
  }

  $('#practiceNextArea').innerHTML = `
    <button class="btn-next-question" onclick="loadNewPracticeQuestion()">
      Siguiente Desafío ➡️
    </button>
  `;
};

/* =========================================================
   VISTA 4: EXAMEN SIMULACRO OFICIAL (TRIMESTRE 3)
   ========================================================= */
let examQuestions = [];
let examCurrentIndex = 0;
let examUserAnswers = [];
let examTimerSeconds = 0;
let examTimerInterval = null;

function renderExam(container) {
  // Limpiar temporizador previo
  if (examTimerInterval) {
    clearInterval(examTimerInterval);
    examTimerInterval = null;
  }

  container.innerHTML = `
    <div class="exam-setup-box">
      <div class="exam-setup-icon">📝</div>
      <div class="hero-school-badge">Colegio Bilingüe Lerner & Klein · 4.° A (Prof.ª Andrea Guerrero)</div>
      <h2 style="font-size:1.8rem; font-weight:800; color:#1e293b; margin:10px 0;">
        Simulacro de Examen: 3.er Trimestre
      </h2>
      <p style="color:#64748b; font-size:1.05rem; margin-bottom:24px; line-height:1.5;">
        Este simulacro evalúa exactamente los 5 temas de la circular oficial y los ejercicios reales de tu cuaderno y talleres:
        <b>Fracción de un número (ambos métodos)</b>, <b>Cálculo de volumen</b>, <b>Cuerpos sólidos (prismas, pirámides y redondos)</b>,
        <b>Moda, media, mediana y rango (conjuntos de 9 datos)</b>, y <b>Porcentajes C-P-A (cuadrícula 10×10, fracción y decimal)</b>.
      </p>

      <div style="background:#f8fafc; border:2px solid #e2e8f0; border-radius:14px; padding:18px; margin-bottom:24px; text-align:left;">
        <h4 style="font-weight:800; color:#1e293b; margin-bottom:8px;">📋 Estructura de la prueba:</h4>
        <ul style="padding-left:20px; color:#475569; font-size:0.95rem; line-height:1.6;">
          <li><b>Total de preguntas:</b> 15 preguntas únicas sin repetir (3 de cada uno de los 5 temas).</li>
          <li><b>Puntaje máximo:</b> 100 puntos.</li>
          <li><b>Semáforo diagnóstico:</b> Reporte completo tema por tema y explicación paso a paso.</li>
          <li><b>Premio:</b> Diploma de honor oficial al finalizar.</li>
        </ul>
      </div>

      <button class="btn-exam-start" onclick="startOfficialExam()" style="width:100%; font-size:1.2rem; padding:16px;">
        🚀 ¡Comenzar Examen de Luciana!
      </button>
    </div>
  `;
}

function buildOfficialExamQuestions() {
  const qs = [];
  Object.keys(TOPICS).forEach(tid => {
    const pool = shuffle(getQuestionPoolForTopic(tid));
    qs.push(...pool.slice(0, 3));
  });
  return shuffle(qs);
}

window.startOfficialExam = () => {
  Sound.win();
  examQuestions = buildOfficialExamQuestions();
  examCurrentIndex = 0;
  examUserAnswers = [];
  examTimerSeconds = 0;

  examTimerInterval = setInterval(() => {
    examTimerSeconds++;
    const timerEl = $('#examTimer');
    if (timerEl) {
      const mins = Math.floor(examTimerSeconds / 60).toString().padStart(2, '0');
      const secs = (examTimerSeconds % 60).toString().padStart(2, '0');
      timerEl.textContent = `⏱️ ${mins}:${secs}`;
    }
  }, 1000);

  renderCurrentExamQuestion();
};

function renderCurrentExamQuestion() {
  const container = $('#app');
  const q = examQuestions[examCurrentIndex];
  const total = examQuestions.length;
  const progressPct = ((examCurrentIndex) / total) * 100;

  let optionsHtml = '';
  const letters = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, idx) => {
    optionsHtml += `
      <button class="option-btn" id="examOpt_${idx}" onclick="handleExamAnswer(${idx})">
        <span class="option-letter">${letters[idx]}</span>
        <span>${opt.text}</span>
      </button>
    `;
  });

  container.innerHTML = `
    <div class="practice-card" style="max-width:800px; margin:0 auto;">
      <div class="practice-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <span class="practice-topic-tag">${q.topicBadge}</span>
          <span style="font-size:0.95rem; font-weight:700; color:#64748b;">Pregunta ${examCurrentIndex + 1} de ${total}</span>
        </div>
        <div id="examTimer" style="font-weight:700; color:#4f46e5; font-size:1rem;">⏱️ 00:00</div>
      </div>

      <div class="exam-progress-bar-wrap">
        <div class="exam-progress-bar-fill" style="width:${progressPct}%;"></div>
      </div>

      <div class="question-text">${q.question}</div>

      <div class="options-grid">
        ${optionsHtml}
      </div>
    </div>
  `;
}

window.handleExamAnswer = selectedIdx => {
  Sound.click();
  const q = examQuestions[examCurrentIndex];
  const chosenOpt = q.options[selectedIdx];

  examUserAnswers.push({
    question: q,
    chosenOpt: chosenOpt,
    isCorrect: chosenOpt.isCorrect
  });

  examCurrentIndex++;
  if (examCurrentIndex < examQuestions.length) {
    renderCurrentExamQuestion();
  } else {
    finishExam();
  }
};

function finishExam() {
  if (examTimerInterval) {
    clearInterval(examTimerInterval);
    examTimerInterval = null;
  }

  const total = examQuestions.length;
  const rights = examUserAnswers.filter(a => a.isCorrect).length;
  const score = Math.round((rights / total) * 100);

  // Guardar mejor nota
  if (S.examBest === null || score > S.examBest) {
    S.examBest = score;
  }
  S.examHistory.push({ score, date: new Date().toLocaleDateString(), rights, total });
  addXP(score * 2);
  saveState();
  checkBadges();

  Sound.win();
  launchConfetti();

  // Calcular rendimiento por tema
  const topicStats = {};
  Object.keys(TOPICS).forEach(tid => {
    topicStats[tid] = { total: 0, rights: 0 };
  });

  examUserAnswers.forEach(a => {
    const tid = a.question.topicId;
    topicStats[tid].total++;
    if (a.isCorrect) topicStats[tid].rights++;
  });

  // Determinar desempeño
  let performanceTitle = 'Desempeño Superior 🌟';
  let performanceClass = 'superior';
  let performanceMessage = '¡Impresionante, Luciana! Estás completamente lista para brillar en tu examen del Colegio Lerner & Klein.';

  if (score < 70) {
    performanceTitle = 'Desempeño Bajo (A Reforzar) 💡';
    performanceClass = 'bajo';
    performanceMessage = '¡Buen esfuerzo! Revisa las explicaciones de abajo y repasa los temas en rojo en el modo Aprender.';
  } else if (score < 80) {
    performanceTitle = 'Desempeño Básico ⚡';
    performanceClass = 'basico';
    performanceMessage = '¡Buen trabajo! Estás muy cerca de la excelencia, afina un poco más los detalles de cada tema.';
  } else if (score < 90) {
    performanceTitle = 'Desempeño Alto 🚀';
    performanceClass = 'alto';
    performanceMessage = '¡Excelente trabajo! Tienes bases muy sólidas para tu evaluación.';
  }

  let tableRows = '';
  Object.keys(TOPICS).forEach(tid => {
    const t = TOPICS[tid];
    const st = topicStats[tid];
    const pct = st.total > 0 ? Math.round((st.rights / st.total) * 100) : 0;
    let semaforo = '🟢 Excelente';
    if (pct < 60) semaforo = '🔴 Requiere Repaso';
    else if (pct < 85) semaforo = '🟡 Buen Dominio';

    tableRows += `
      <tr>
        <td><b>${t.icon} ${t.name}</b></td>
        <td>${st.rights} de ${st.total} (${pct}%)</td>
        <td><b>${semaforo}</b></td>
        <td>
          <button class="btn-three-tool" onclick="navigate('learn', '${tid}')" style="font-size:0.78rem; padding:4px 10px;">
            📖 Repasar
          </button>
        </td>
      </tr>
    `;
  });

  const container = $('#app');
  container.innerHTML = `
    <div class="exam-result-card">
      <div class="hero-school-badge">Colegio Bilingüe Lerner & Klein · Grado 4.°</div>
      <h2 style="font-size:2rem; font-weight:800; color:#1e293b; margin:8px 0;">Resultado del Simulacro</h2>

      <div class="score-circle ${performanceClass}">
        <span class="score-number">${score}</span>
        <span class="score-max">/ 100 pts</span>
      </div>

      <h3 style="font-size:1.4rem; font-weight:800; color:#1e293b; margin-bottom:8px;">${performanceTitle}</h3>
      <p style="color:#475569; font-size:1.05rem; max-width:600px; margin:0 auto 20px auto;">${performanceMessage}</p>

      <div style="display:flex; justify-content:center; gap:12px; margin-bottom:24px; flex-wrap:wrap;">
        <button class="btn-primary-hero" onclick="showDiploma(${score})" style="background:#4f46e5; color:white;">
          📜 Ver y Guardar Diploma de Honor
        </button>
        <button class="btn-secondary-hero" onclick="navigate('exam')" style="background:#e0e7ff; color:#4f46e5; border-color:#c7d2fe;">
          🔄 Repetir Simulacro
        </button>
      </div>

      <h4 style="text-align:left; font-size:1.2rem; font-weight:800; color:#1e293b; margin-bottom:10px;">
        🚦 Semáforo Diagnóstico por Tema:
      </h4>
      <div style="overflow-x:auto;">
        <table class="diagnostic-table">
          <thead>
            <tr>
              <th>Tema Evaluado</th>
              <th>Aciertos</th>
              <th>Estado Pedagógico</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>

      <h4 style="text-align:left; font-size:1.2rem; font-weight:800; color:#1e293b; margin:24px 0 12px 0;">
        🔍 Revisión Detallada de Preguntas:
      </h4>
      <div style="text-align:left; display:flex; flex-direction:column; gap:14px;" id="examReviewContainer"></div>
    </div>
  `;

  // Renderizar revisión detallada de preguntas
  const reviewContainer = $('#examReviewContainer');
  examUserAnswers.forEach((ans, idx) => {
    const item = document.createElement('div');
    item.style.background = ans.isCorrect ? '#f0fdf4' : '#fef2f2';
    item.style.border = `2px solid ${ans.isCorrect ? '#86efac' : '#fca5a5'}`;
    item.style.borderRadius = '12px';
    item.style.padding = '14px 18px';
    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; font-weight:800; margin-bottom:6px; font-size:0.9rem;">
        <span style="color:#4f46e5;">Pregunta ${idx + 1} (${ans.question.topicName})</span>
        <span style="color:${ans.isCorrect ? '#15803d' : '#b91c1c'};">${ans.isCorrect ? '✅ Correcta (+6.7 pts)' : '❌ Incorrecta'}</span>
      </div>
      <div style="font-weight:700; color:#1e293b; margin-bottom:8px;">${ans.question.question}</div>
      <div style="font-size:0.9rem; color:#475569;">
        Tu respuesta: <b>${ans.chosenOpt.text}</b><br>
        <b>Explicación:</b> ${ans.question.explanation}
      </div>
    `;
    reviewContainer.appendChild(item);
  });
}

window.showDiploma = score => {
  Sound.win();
  launchConfetti();
  const dateStr = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

  const container = $('#app');
  container.innerHTML = `
    <div style="text-align:center; margin-bottom:20px;">
      <button class="btn-three-tool" onclick="navigate('exam')" style="display:inline-flex; width:auto;">
        ⬅️ Volver a Resultados
      </button>
      <button class="btn-primary-hero" onclick="window.print()" style="background:#10b981; color:white; margin-left:10px;">
        🖨️ Imprimir Diploma
      </button>
    </div>

    <div class="diploma-card">
      <div class="diploma-header">Colegio Bilingüe Lerner & Klein</div>
      <h1 class="diploma-title">DIPLOMA DE EXCELENCIA MATEMÁTICA</h1>
      <p style="font-size:1.1rem; color:#64748b;">Se otorga con orgullo y admiración a:</p>
      
      <div class="diploma-name">${S.name}</div>
      
      <p style="font-size:1.15rem; color:#1e293b; line-height:1.6; max-width:620px; margin:0 auto 20px auto;">
        Por su destacada dedicación, entusiasmo y maestría demostrada en el <b>Simulacro de Matemáticas del 3.er Trimestre</b>,
        alcanzando un puntaje sobresaliente de <b>${score} / 100 puntos</b> en:
      </p>

      <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap; font-size:0.9rem; font-weight:700; color:#4f46e5; margin-bottom:28px;">
        <span>🍰 Fracción de un número</span> •
        <span>📦 Volumen</span> •
        <span>🔷 Cuerpos Geométricos</span> •
        <span>📊 Estadística</span> •
        <span>💯 Porcentajes</span>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top:2px dashed #f59e0b; padding-top:16px; margin-top:20px;">
        <div style="text-align:left;">
          <div style="font-size:0.85rem; color:#64748b;">Fecha de logro:</div>
          <div style="font-weight:700; color:#1e293b;">${dateStr}</div>
        </div>
        <div style="font-size:2.8rem;">🦊 ⭐ 🏆</div>
        <div style="text-align:right;">
          <div style="font-size:0.85rem; color:#64748b;">Aventura Matemática</div>
          <div style="font-weight:700; color:#1e293b;">Grado 4.° de Primaria</div>
        </div>
      </div>
    </div>
  `;
};

/* =========================================================
   VISTA 5: TROFEOS, PERFIL Y DOCUMENTOS IMPRIMIBLES
   ========================================================= */
function renderTrophies(container) {
  let badgesHtml = '';
  BADGES_DEF.forEach(b => {
    const isUnlocked = !!S.badges[b.id];
    badgesHtml += `
      <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="badge-card-icon">${b.icon}</div>
        <h4 class="badge-card-title">${b.name}</h4>
        <p class="badge-card-desc">${b.desc}</p>
        <span style="font-size:0.75rem; font-weight:800; color:${isUnlocked ? '#d97706' : '#94a3b8'};">
          ${isUnlocked ? '¡CONSEGUIDA! 🌟' : 'Bloqueada'}
        </span>
      </div>
    `;
  });

  const avatars = ['🦊', '🦉', '🐱', '🐼', '🦁', '🦄', '🚀', '🎨'];
  let avatarsHtml = '';
  avatars.forEach(av => {
    const isSel = av === S.avatar;
    avatarsHtml += `
      <button class="btn-icon" onclick="changeAvatar('${av}')" style="font-size:1.6rem; border-color:${isSel ? '#4f46e5' : '#e2e8f0'}; background:${isSel ? '#e0e7ff' : 'white'};">
        ${av}
      </button>
    `;
  });

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:24px;">
      <div class="lesson-card">
        <h2 class="section-title">👤 Perfil de ${S.name}</h2>
        <div style="display:flex; flex-wrap:wrap; gap:20px; align-items:center; margin-top:14px;">
          <div>
            <label style="font-weight:700; color:#64748b; font-size:0.9rem;">Elige tu avatar:</label>
            <div style="display:flex; gap:8px; margin-top:6px; flex-wrap:wrap;">
              ${avatarsHtml}
            </div>
          </div>
          <div style="flex:1; min-width:240px;">
            <label style="font-weight:700; color:#64748b; font-size:0.9rem;">Nombre de la estudiante:</label>
            <div style="display:flex; gap:8px; margin-top:6px;">
              <input type="text" id="userNameInput" value="${S.name}" style="padding:10px 14px; border-radius:12px; border:2px solid #cbd5e1; font-family:inherit; font-size:1rem; font-weight:700; flex:1;">
              <button class="btn-action-learn" onclick="updateStudentName()" style="flex:initial; padding:10px 20px;">
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="lesson-card">
        <h2 class="section-title">🏆 Salón de Trofeos e Insignias</h2>
        <p style="color:#64748b; margin-bottom:16px;">Colecciona las 12 insignias especiales demostrando tu maestría en cada tema.</p>
        <div class="badges-grid">
          ${badgesHtml}
        </div>
      </div>

      <div class="lesson-card">
        <h2 class="section-title">🖨️ Documentos Oficiales Imprimibles (PDF / HTML)</h2>
        <p style="color:#64748b; margin-bottom:18px;">
          Diseñados especialmente en formato Carta (Letter) con el membrete oficial del Colegio Bilingüe Lerner & Klein para practicar con lápiz y papel.
        </p>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:18px;">
          <div style="background:#f8fafc; border:2px solid #e2e8f0; border-radius:16px; padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="font-size:2rem; margin-bottom:8px;">📄</div>
              <h3 style="font-size:1.2rem; font-weight:800; color:#1e293b; margin-bottom:6px;">Cuadernillo de Examen (4 págs)</h3>
              <p style="color:#64748b; font-size:0.9rem; line-height:1.4; margin-bottom:14px;">
                Examen impreso de 10 preguntas desafiantes con ilustraciones SVG, diagramas 3D y espacios de procedimiento.
              </p>
            </div>
            <div style="display:flex; gap:8px;">
              <a href="simulacro_examen_matematicas.html" target="_blank" class="btn-action-learn" style="text-decoration:none; text-align:center;">
                🌐 Abrir HTML
              </a>
              <a href="simulacro_examen_matematicas.pdf" target="_blank" class="btn-action-practice" style="text-decoration:none; text-align:center;">
                📥 Descargar PDF
              </a>
            </div>
          </div>

          <div style="background:#f8fafc; border:2px solid #e2e8f0; border-radius:16px; padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="font-size:2rem; margin-bottom:8px;">📘</div>
              <h3 style="font-size:1.2rem; font-weight:800; color:#1e293b; margin-bottom:6px;">Solucionario y Guía Pedagógica</h3>
              <p style="color:#64748b; font-size:0.9rem; line-height:1.4; margin-bottom:14px;">
                Guía completa para el evaluador / padre con respuestas explicadas paso a paso, errores típicos y rúbrica sobre 100 pts.
              </p>
            </div>
            <div style="display:flex; gap:8px;">
              <a href="solucionario_y_guia_evaluacion.html" target="_blank" class="btn-action-learn" style="text-decoration:none; text-align:center;">
                🌐 Abrir HTML
              </a>
              <a href="solucionario_y_guia_evaluacion.pdf" target="_blank" class="btn-action-practice" style="text-decoration:none; text-align:center;">
                📥 Descargar PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.changeAvatar = av => {
  S.avatar = av;
  saveState();
  updateHUD();
  renderTrophies($('#app'));
  Sound.click();
};

window.updateStudentName = () => {
  const val = $('#userNameInput').value.trim();
  if (val) {
    S.name = val;
    saveState();
    showToast(`✅ Nombre actualizado a ${val}`);
    Sound.ok();
  }
};

window.openPrintablesModal = () => {
  navigate('trophies');
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
};

/* ---------- Inicialización de la Aplicación ---------- */
document.addEventListener('DOMContentLoaded', () => {
  updateHUD();
  navigate('home');
});
