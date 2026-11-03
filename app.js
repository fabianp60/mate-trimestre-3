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
      <h2 class="section-title">🗺️ Islas de Aprendizaje</h2>
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

/* --- LECCIÓN 1: Fracción de un número --- */
function renderLessonFraction(card) {
  card.innerHTML = `
    <div class="lesson-header">
      <h2 class="lesson-title">🍰 Fracción de un Número</h2>
      <p class="lesson-subtitle">Descubre cómo calcular una parte fraccionaria de una cantidad total de manera visual y paso a paso.</p>
    </div>

    <div class="formula-card">
      <b>💡 La Regla Mágica de 2 Pasos:</b><br>
      Para calcular <b><span style="color:#ec4899">a/b</span> de una cantidad total N</b>:<br>
      <b>Paso 1:</b> Divide el total entre el denominador (abajo): <code>N ÷ b</code> (tamaño de cada grupo).<br>
      <b>Paso 2:</b> Multiplica el resultado por el numerador (arriba): <code>(N ÷ b) × a</code> (los grupos que tomas).
    </div>

    <div class="fraction-interactive-box">
      <h3 style="margin-bottom:12px; font-weight:800; color:#1e293b;">🔬 Laboratorio de Repartición</h3>
      <div class="fraction-controls">
        <label><b>Selecciona un ejemplo:</b></label>
        <select id="fractionPreset" onchange="updateFractionLab()" style="padding:8px 14px; border-radius:12px; font-weight:700; border:2px solid #cbd5e1; font-family:inherit;">
          <option value="2,3,18">2/3 de 18 caramelos</option>
          <option value="3,4,24" selected>3/4 de 24 lápices de colores</option>
          <option value="2,5,20">2/5 de 20 chocolates</option>
          <option value="4,6,30">4/6 de 30 stickers</option>
          <option value="5,8,32">5/8 de 32 galletas</option>
        </select>
        <div class="fraction-display" id="fracFormulaBox"></div>
      </div>

      <div id="fracExplanation" style="background:white; border:2px solid #e2e8f0; border-radius:14px; padding:16px; margin:16px 0; font-size:1.05rem;"></div>

      <div class="fraction-groups-container" id="fracGroups"></div>

      <div style="text-align:center; margin-top:16px;">
        <button class="btn-action-practice" onclick="navigate('practice', 'fraction')" style="display:inline-flex; width:auto; padding:12px 28px; font-size:1rem;">
          🎯 ¡Practicar este tema ahora!
        </button>
      </div>
    </div>
  `;
  updateFractionLab();
}

window.updateFractionLab = () => {
  const val = $('#fractionPreset').value.split(',').map(Number);
  const num = val[0];
  const den = val[1];
  const total = val[2];

  const perGroup = total / den;
  const result = perGroup * num;

  $('#fracFormulaBox').innerHTML = `
    <span class="num">${num}</span>
    <span class="den">${den}</span>
    <span style="font-size:0.9rem; font-weight:700; margin-top:4px;">de ${total}</span>
  `;

  $('#fracExplanation').innerHTML = `
    <div style="margin-bottom:8px;">
      <b>Paso 1:</b> Repartimos los <b>${total}</b> objetos en <b>${den}</b> cajas iguales:
      <code>${total} ÷ ${den} = <b>${perGroup}</b> objetos por caja</code>.
    </div>
    <div>
      <b>Paso 2:</b> Tomamos <b>${num}</b> de esas cajas:
      <code>${perGroup} × ${num} = <b style="color:#ec4899; font-size:1.25rem;">${result}</b></code>.
      <br>¡Por lo tanto, <b>${num}/${den} de ${total} es igual a ${result}</b>! 🎉
    </div>
  `;

  const container = $('#fracGroups');
  container.innerHTML = '';
  for (let i = 0; i < den; i++) {
    const isSelected = i < num;
    const box = document.createElement('div');
    box.className = `fraction-group-box ${isSelected ? 'selected' : ''}`;
    let items = '';
    for (let j = 0; j < perGroup; j++) {
      items += `<span class="fraction-item-dot">${isSelected ? '⭐' : '⚪'}</span>`;
    }
    box.innerHTML = `
      <b style="font-size:0.85rem; color:${isSelected ? '#ec4899' : '#64748b'};">
        Caja ${i + 1} ${isSelected ? '(Tomada)' : ''}
      </b>
      <div style="display:flex; flex-wrap:wrap; gap:4px; justify-content:center; max-width:80px;">
        ${items}
      </div>
      <span style="font-size:0.8rem; font-weight:700;">${perGroup} objetos</span>
    `;
    container.appendChild(box);
  }
};

/* --- LECCIÓN 2: Cálculo de Volumen con Three.js --- */
function renderLessonVolume(card) {
  card.innerHTML = `
    <div class="lesson-header">
      <h2 class="lesson-title">📦 Cálculo de Volumen</h2>
      <p class="lesson-subtitle">El volumen mide la cantidad de espacio 3D que ocupa un cuerpo, medido en cubitos unidad (u³ o cm³).</p>
    </div>

    <div class="formula-card">
      <b>📐 Fórmula del Ortoedro (Prisma Rectangular):</b><br>
      <code>Volumen = Largo × Ancho × Alto</code><br>
      O también: <code>Volumen = (Área de la base) × Altura</code> (número de cubos por capa × cantidad de pisos).
    </div>

    <div style="background:#f8fafc; border:2px dashed #cbd5e1; border-radius:18px; padding:20px; margin:20px 0;">
      <div style="display:flex; flex-wrap:wrap; gap:20px; align-items:center; justify-content:space-between; margin-bottom:14px;">
        <div style="display:flex; gap:16px; flex-wrap:wrap;">
          <div>
            <label><b>Largo (X):</b> <span id="volLVal" style="color:#3b82f6; font-weight:800;">3</span></label><br>
            <input type="range" id="volL" min="1" max="5" value="3" oninput="updateVolumeLab()" style="cursor:pointer;">
          </div>
          <div>
            <label><b>Ancho (Z):</b> <span id="volWVal" style="color:#10b981; font-weight:800;">2</span></label><br>
            <input type="range" id="volW" min="1" max="4" value="2" oninput="updateVolumeLab()" style="cursor:pointer;">
          </div>
          <div>
            <label><b>Alto (Y):</b> <span id="volHVal" style="color:#ec4899; font-weight:800;">2</span></label><br>
            <input type="range" id="volH" min="1" max="4" value="2" oninput="updateVolumeLab()" style="cursor:pointer;">
          </div>
        </div>
        <div style="background:white; border:2px solid #3b82f6; border-radius:14px; padding:10px 18px; text-align:center;">
          <div style="font-size:0.8rem; font-weight:700; color:#64748b;">VOLUMEN TOTAL:</div>
          <div id="volCalcText" style="font-size:1.4rem; font-weight:800; color:#1e40af;">3 × 2 × 2 = 12 u³</div>
        </div>
      </div>

      <div class="three-viewport-wrap" id="volume3dViewport">
        <div class="three-toolbar">
          <div class="three-badge-info" id="volLayersInfo">Base: 6 cubitos | 2 capas</div>
          <div class="three-buttons-row">
            <button class="btn-three-tool" id="btnXrayVol" onclick="toggleVolumeXray()">🔍 Rayos X</button>
            <button class="btn-three-tool" id="btnExplodeVol" onclick="toggleVolumeExplode()">🥞 Separar Capas</button>
            <button class="btn-three-tool" onclick="resetVolumeCamera()">🔄 Centrar</button>
          </div>
        </div>
        <div class="three-instructions">🖱️ Arrastra con el ratón o desliza con el dedo para girar en 3D</div>
      </div>

      <div style="text-align:center; margin-top:16px;">
        <button class="btn-action-practice" onclick="navigate('practice', 'volume')" style="display:inline-flex; width:auto; padding:12px 28px; font-size:1rem;">
          🎯 ¡Practicar Desafíos de Volumen!
        </button>
      </div>
    </div>
  `;

  initVolume3D();
}

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

  const total = L * W * H;
  const baseArea = L * W;
  $('#volCalcText').textContent = `${L} × ${W} × ${H} = ${total} u³`;
  $('#volLayersInfo').textContent = `Base: ${baseArea} cubitos | ${H} capa${H > 1 ? 's' : ''}`;

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

function renderLessonShapes(card) {
  let selectOptions = '';
  Object.keys(SHAPES_DATA).forEach(k => {
    selectOptions += `<option value="${k}" ${k === currentSolidKey ? 'selected' : ''}>${SHAPES_DATA[k].name}</option>`;
  });

  card.innerHTML = `
    <div class="lesson-header">
      <h2 class="lesson-title">🔷 Cuerpos Geométricos 3D</h2>
      <p class="lesson-subtitle">Explora prismas, pirámides y cuerpos redondos. Cuenta sus caras, aristas y vértices en 3D interactivo.</p>
    </div>

    <div class="formula-card">
      <b>✨ Fórmulas Maestras de Primaria:</b><br>
      • <b>Prismas (base de n lados):</b> Caras = n + 2 | Vértices = 2n | Aristas = 3n<br>
      • <b>Pirámides (base de n lados):</b> Caras = n + 1 | Vértices = n + 1 | Aristas = 2n<br>
      • <b>Relación Mágica de Euler:</b> <code>Caras + Vértices = Aristas + 2</code> (se cumple en todos los poliedros).
    </div>

    <div style="background:#f8fafc; border:2px dashed #cbd5e1; border-radius:18px; padding:20px; margin:20px 0;">
      <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:center; justify-content:space-between; margin-bottom:14px;">
        <div>
          <label><b>Selecciona el cuerpo 3D:</b></label><br>
          <select id="solidSelect" onchange="changeSolid(this.value)" style="padding:8px 14px; border-radius:12px; font-weight:700; border:2px solid #cbd5e1; font-family:inherit; font-size:1rem;">
            ${selectOptions}
          </select>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn-three-tool active" id="btnHlAll" onclick="setSolidHighlight('all')">🌟 Normal</button>
          <button class="btn-three-tool" id="btnHlFaces" onclick="setSolidHighlight('faces')">🟢 Caras</button>
          <button class="btn-three-tool" id="btnHlEdges" onclick="setSolidHighlight('edges')">🟡 Aristas</button>
          <button class="btn-three-tool" id="btnHlVerts" onclick="setSolidHighlight('vertices')">🔴 Vértices</button>
        </div>
      </div>

      <div class="three-viewport-wrap" id="shapes3dViewport">
        <div class="three-toolbar">
          <div class="three-badge-info" id="solidQuickBadge">Cuerpo Geométrico</div>
          <div class="three-buttons-row">
            <button class="btn-three-tool" onclick="resetShapesCamera()">🔄 Centrar</button>
          </div>
        </div>
        <div class="three-instructions">🖱️ Arrastra o desliza para girar el cuerpo y ver sus aristas y caras ocultas</div>
      </div>

      <div id="solidInfoCard" style="background:white; border:2px solid #e2e8f0; border-radius:14px; padding:20px; margin-top:16px;"></div>

      <div style="text-align:center; margin-top:16px;">
        <button class="btn-action-practice" onclick="navigate('practice', 'shapes')" style="display:inline-flex; width:auto; padding:12px 28px; font-size:1rem;">
          🎯 ¡Practicar Adivinanzas de Cuerpos 3D!
        </button>
      </div>
    </div>
  `;

  initShapes3D();
}

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

  // Actualizar Ficha Técnica
  const infoEl = $('#solidInfoCard');
  if (infoEl) {
    const isPoly = data.type.startsWith('Poliedro');
    const eulerCheck = isPoly ? `${data.F} + ${data.V} = ${data.E} + 2 (${data.F + data.V} = ${data.E + 2}) ✓` : 'No aplica (es cuerpo redondo)';

    infoEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
        <div>
          <h3 style="font-size:1.35rem; font-weight:800; color:#1e293b; margin-bottom:4px;">${data.name}</h3>
          <span style="display:inline-block; padding:4px 12px; border-radius:999px; background:#e0e7ff; color:#4338ca; font-size:0.85rem; font-weight:700;">
            ${data.type}
          </span>
        </div>
        <div style="display:flex; gap:12px;">
          <div style="background:#f1f5f9; padding:8px 14px; border-radius:12px; text-align:center;">
            <div style="font-size:0.75rem; font-weight:700; color:#64748b;">CARAS</div>
            <div style="font-size:1.3rem; font-weight:800; color:#10b981;">${data.F}</div>
          </div>
          <div style="background:#f1f5f9; padding:8px 14px; border-radius:12px; text-align:center;">
            <div style="font-size:0.75rem; font-weight:700; color:#64748b;">ARISTAS</div>
            <div style="font-size:1.3rem; font-weight:800; color:#f59e0b;">${data.E}</div>
          </div>
          <div style="background:#f1f5f9; padding:8px 14px; border-radius:12px; text-align:center;">
            <div style="font-size:0.75rem; font-weight:700; color:#64748b;">VÉRTICES</div>
            <div style="font-size:1.3rem; font-weight:800; color:#ef4444;">${data.V}</div>
          </div>
        </div>
      </div>
      <p style="color:#475569; margin-bottom:12px; line-height:1.5;">${data.desc}</p>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px; font-size:0.9rem; background:#f8fafc; padding:12px; border-radius:10px;">
        <div><b>Base:</b> ${data.base}</div>
        <div><b>Caras laterales:</b> ${data.sides}</div>
        <div><b>Fórmula de Euler:</b> <code>${eulerCheck}</code></div>
      </div>
    `;
  }

  $('#solidQuickBadge').textContent = `${data.name} · C:${data.F} | A:${data.E} | V:${data.V}`;

  if (!window.shapesThree) return;
  const group = window.shapesThree.meshGroup;

  while (group.children.length > 0) {
    group.remove(group.children[0]);
  }

  let geom = null;
  let customVertices = [];

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

  // Vértices destacados con esferitas brillantes
  if (data.V > 0 && (solidHighlightMode === 'vertices' || solidHighlightMode === 'all')) {
    // Extraer vértices únicos
    const posAttr = geom.attributes.position;
    const pts = [];
    const eps = 0.05;
    for (let i = 0; i < posAttr.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      mesh.localToWorld(v.clone());
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

/* --- LECCIÓN 4: Medidas Estadísticas (Media, Mediana, Moda y Rango) --- */
let statsData = [3, 5, 2, 8, 5, 6, 5];

function renderLessonStats(card) {
  card.innerHTML = `
    <div class="lesson-header">
      <h2 class="lesson-title">📊 Moda, Media, Mediana y Rango</h2>
      <p class="lesson-subtitle">Aprende a analizar conjuntos de datos de forma interactiva con tarjetas animadas y explicaciones paso a paso.</p>
    </div>

    <div class="formula-card">
      <b>📌 Las 4 Medidas Estadísticas de 4.° Grado:</b><br>
      • <b>Media (Promedio):</b> Suma todos los datos y divide entre el número total de datos: <code>(Suma) ÷ N</code>.<br>
      • <b>Mediana:</b> ¡PRIMERO ORDENA de menor a mayor! Es el dato que queda en el centro exacto.<br>
      • <b>Moda:</b> El dato que tiene mayor frecuencia (el que más se repite).<br>
      • <b>Rango:</b> La amplitud o dispersión: <code>Dato Mayor - Dato Menor</code>.
    </div>

    <div style="background:#f8fafc; border:2px dashed #cbd5e1; border-radius:18px; padding:22px; margin:20px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
        <div>
          <label><b>Selecciona un conjunto de datos:</b></label><br>
          <select id="statsPreset" onchange="changeStatsDataset(this.value)" style="padding:8px 14px; border-radius:12px; font-weight:700; border:2px solid #cbd5e1; font-family:inherit;">
            <option value="goals">Goles por partido: [3, 5, 2, 8, 5, 6, 5]</option>
            <option value="grades">Calificaciones de Luciana: [5, 4, 5, 3, 5, 4, 5]</option>
            <option value="ages">Edades de primas: [8, 10, 9, 12, 10, 7, 10]</option>
            <option value="even">Libros leídos (par): [2, 6, 4, 8, 4, 10]</option>
          </select>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn-three-tool" id="btnStatsSort" onclick="sortStatsCards()">🔢 1. ¡Ordenar de menor a mayor!</button>
          <button class="btn-three-tool" id="btnStatsMode" onclick="highlightStatsMode()">👑 2. Ver Moda</button>
          <button class="btn-three-tool" id="btnStatsMedian" onclick="highlightStatsMedian()">🎯 3. Ver Mediana</button>
          <button class="btn-three-tool" id="btnStatsMean" onclick="showStatsMean()">➗ 4. Ver Media</button>
          <button class="btn-three-tool" id="btnStatsRange" onclick="showStatsRange()">📏 5. Ver Rango</button>
        </div>
      </div>

      <div class="stats-cards-row" id="statsCardsContainer"></div>

      <div id="statsDetailBox" style="background:white; border:2px solid #e2e8f0; border-radius:14px; padding:18px; margin-top:16px; font-size:1.05rem;">
        Haz clic en cualquiera de los botones de arriba para ver la magia de cada medida estadística.
      </div>

      <div style="text-align:center; margin-top:20px;">
        <button class="btn-action-practice" onclick="navigate('practice', 'stats')" style="display:inline-flex; width:auto; padding:12px 28px; font-size:1rem;">
          🎯 ¡Practicar Ejercicios de Estadística!
        </button>
      </div>
    </div>
  `;

  renderStatsCards();
}

window.changeStatsDataset = key => {
  if (key === 'goals') statsData = [3, 5, 2, 8, 5, 6, 5];
  else if (key === 'grades') statsData = [5, 4, 5, 3, 5, 4, 5];
  else if (key === 'ages') statsData = [8, 10, 9, 12, 10, 7, 10];
  else if (key === 'even') statsData = [2, 6, 4, 8, 4, 10];
  renderStatsCards();
  $('#statsDetailBox').textContent = 'Conjunto actualizado. Recuerda el primer mandamiento de la estadística: ¡Primero ordenar!';
};

function renderStatsCards() {
  const container = $('#statsCardsContainer');
  if (!container) return;
  container.innerHTML = '';
  statsData.forEach((num, idx) => {
    const card = document.createElement('div');
    card.className = 'stat-num-card';
    card.id = `stat-card-${idx}`;
    card.textContent = num;
    container.appendChild(card);
  });
}

window.sortStatsCards = () => {
  Sound.ok();
  statsData.sort((a, b) => a - b);
  renderStatsCards();
  $('#statsDetailBox').innerHTML = `
    <b>✅ ¡Datos Ordenados de Menor a Mayor!</b><br>
    <code>[${statsData.join(', ')}]</code><br>
    Ordenar es indispensable para encontrar la <b>Mediana</b> y calcular fácilmente el <b>Rango</b>.
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

  $$('.stat-num-card').forEach(c => {
    c.className = 'stat-num-card';
    if (modes.includes(Number(c.textContent))) {
      c.classList.add('highlight-mode');
    }
  });

  if (modes.length === 0) {
    $('#statsDetailBox').innerHTML = `<b>Moda:</b> No hay moda porque todos los datos aparecen solo una vez.`;
  } else {
    $('#statsDetailBox').innerHTML = `
      <b>👑 Moda = ${modes.join(', ')}</b><br>
      El valor que más veces se repite (aparece <b>${maxFreq} veces</b>).
    `;
  }
};

window.highlightStatsMedian = () => {
  Sound.click();
  const sorted = [...statsData].sort((a, b) => a - b);
  statsData = sorted;
  renderStatsCards();

  const N = statsData.length;
  $$('.stat-num-card').forEach(c => c.className = 'stat-num-card');

  if (N % 2 !== 0) {
    const midIdx = Math.floor(N / 2);
    $(`#stat-card-${midIdx}`).classList.add('highlight-median');
    const medianVal = statsData[midIdx];
    $('#statsDetailBox').innerHTML = `
      <b>🎯 Mediana = ${medianVal}</b><br>
      Como hay un número impar de datos (${N}), la mediana es el dato que queda en el centro exacto: <code>posición ${midIdx + 1}</code>.
    `;
  } else {
    const mid1 = N / 2 - 1;
    const mid2 = N / 2;
    $(`#stat-card-${mid1}`).classList.add('highlight-median');
    $(`#stat-card-${mid2}`).classList.add('highlight-median');
    const medianVal = (statsData[mid1] + statsData[mid2]) / 2;
    $('#statsDetailBox').innerHTML = `
      <b>🎯 Mediana = (${statsData[mid1]} + ${statsData[mid2]}) ÷ 2 = ${medianVal}</b><br>
      Como hay un número par de datos (${N}), promediamos los dos datos centrales: <b>${statsData[mid1]}</b> y <b>${statsData[mid2]}</b>.
    `;
  }
};

window.showStatsMean = () => {
  Sound.click();
  const sum = statsData.reduce((a, b) => a + b, 0);
  const N = statsData.length;
  const mean = (sum / N).toFixed(2);
  const cleanMean = sum % N === 0 ? (sum / N) : mean;

  $$('.stat-num-card').forEach(c => c.className = 'stat-num-card');
  $('#statsDetailBox').innerHTML = `
    <b>➗ Media Aritmética (Promedio):</b><br>
    Suma de todos los datos: <code>${statsData.join(' + ')} = ${sum}</code><br>
    Dividido entre el total de datos (${N}): <code>${sum} ÷ ${N} = <b style="color:#10b981; font-size:1.2rem;">${cleanMean}</b></code>.
  `;
};

window.showStatsRange = () => {
  Sound.click();
  const sorted = [...statsData].sort((a, b) => a - b);
  statsData = sorted;
  renderStatsCards();

  const min = statsData[0];
  const max = statsData[statsData.length - 1];
  const range = max - min;

  $$('.stat-num-card').forEach((c, idx) => {
    c.className = 'stat-num-card';
    if (idx === 0) c.classList.add('highlight-min');
    if (idx === statsData.length - 1) c.classList.add('highlight-max');
  });

  $('#statsDetailBox').innerHTML = `
    <b>📏 Rango = Dato Mayor - Dato Menor:</b><br>
    Dato Máximo: <b>${max}</b> (morado) | Dato Mínimo: <b>${min}</b> (azul)<br>
    <code>${max} - ${min} = <b style="color:#3b82f6; font-size:1.2rem;">${range}</b></code>.
    <br>El rango mide qué tan separados o dispersos están los datos.
  `;
};

/* --- LECCIÓN 5: Porcentajes (Cuadrícula 100, Fracción y Decimal) --- */
let coloredCells = 25; // 25% por defecto

function renderLessonPercent(card) {
  card.innerHTML = `
    <div class="lesson-header">
      <h2 class="lesson-title">💯 Porcentajes: El Trío Matemático</h2>
      <p class="lesson-subtitle">Comprende cómo se relacionan los porcentajes, las fracciones sobre 100 y los números decimales en una cuadrícula interactiva de 10×10.</p>
    </div>

    <div class="formula-card">
      <b>✨ El Trío Mágico Indispensable:</b><br>
      • <b>Porcentaje:</b> Partes tomadas de cada 100 (símbolo %).<br>
      • <b>Fracción Decimal:</b> El porcentaje escrito sobre 100: <code>% / 100</code>.<br>
      • <b>Número Decimal:</b> Divide entre 100 corriendo la coma 2 lugares a la izquierda: <code>25% = 0.25</code>.
    </div>

    <div class="percent-grid-container">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <b>Cuadrícula de 100 casillas:</b>
          <span style="font-size:0.85rem; color:#64748b;">(Haz clic para colorear)</span>
        </div>
        <div class="grid-100" id="percentGrid100"></div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px; justify-content:center;">
          <button class="btn-three-tool" onclick="setPercentGrid(10)">10%</button>
          <button class="btn-three-tool" onclick="setPercentGrid(25)">25%</button>
          <button class="btn-three-tool" onclick="setPercentGrid(50)">50%</button>
          <button class="btn-three-tool" onclick="setPercentGrid(75)">75%</button>
          <button class="btn-three-tool" onclick="setPercentGrid(100)">100%</button>
          <button class="btn-three-tool" onclick="setPercentGrid(0)">🧹 Limpiar</button>
        </div>
      </div>

      <div class="percent-stats-panel">
        <h3 style="font-size:1.2rem; font-weight:800; color:#1e293b;">Equivalencias del Trío:</h3>
        <div class="percent-trio-box">
          <div class="trio-item">
            <div class="trio-label">Porcentaje</div>
            <div class="trio-val" id="trioPercent">25%</div>
          </div>
          <div class="trio-item">
            <div class="trio-label">Fracción</div>
            <div class="trio-val" id="trioFraction">25/100</div>
          </div>
          <div class="trio-item">
            <div class="trio-label">Decimal</div>
            <div class="trio-val" id="trioDecimal">0.25</div>
          </div>
        </div>

        <div id="percentMeaningBox" style="background:white; border:1.5px solid #e2e8f0; border-radius:12px; padding:14px; font-size:0.95rem;">
          <b>Lectura:</b> Significa <b>25 de cada 100 partes</b> (la cuarta parte de un todo, 1/4).
        </div>

        <div style="font-size:0.85rem; color:#64748b; line-height:1.4;">
          <b>💡 Equivalencias clave para el examen:</b><br>
          • 10% = 10/100 = 1/10 = 0.10<br>
          • 25% = 25/100 = 1/4 = 0.25 (la cuarta parte)<br>
          • 50% = 50/100 = 1/2 = 0.50 (la mitad exacta)<br>
          • 75% = 75/100 = 3/4 = 0.75 (tres cuartas partes)<br>
          • 100% = 100/100 = 1 entero
        </div>
      </div>
    </div>

    <div style="text-align:center; margin-top:20px;">
      <button class="btn-action-practice" onclick="navigate('practice', 'percent')" style="display:inline-flex; width:auto; padding:12px 28px; font-size:1rem;">
        🎯 ¡Practicar Retos de Porcentajes!
      </button>
    </div>
  `;

  initPercentGrid();
}

let isPointerDownGrid = false;

function initPercentGrid() {
  const grid = $('#percentGrid100');
  if (!grid) return;
  grid.innerHTML = '';

  for (let i = 0; i < 100; i++) {
    const cell = document.createElement('div');
    cell.className = `grid-cell ${i < coloredCells ? 'colored' : ''}`;
    cell.dataset.index = i;

    cell.addEventListener('pointerdown', e => {
      isPointerDownGrid = true;
      toggleCell(i);
    });

    cell.addEventListener('pointerenter', e => {
      if (isPointerDownGrid) toggleCell(i);
    });

    grid.appendChild(cell);
  }

  window.addEventListener('pointerup', () => { isPointerDownGrid = false; });
  updatePercentTrio();
}

function toggleCell(idx) {
  coloredCells = idx + 1; // Si tocas la celda 30, se pintan 30 casillas
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

function updatePercentTrio() {
  const pct = coloredCells;
  const dec = (pct / 100).toFixed(2);

  $('#trioPercent').textContent = `${pct}%`;
  $('#trioFraction').textContent = `${pct}/100`;
  $('#trioDecimal').textContent = dec;

  let simplified = '';
  if (pct === 25) simplified = ' (Simplificada: 1/4, la cuarta parte)';
  else if (pct === 50) simplified = ' (Simplificada: 1/2, la mitad)';
  else if (pct === 75) simplified = ' (Simplificada: 3/4, tres cuartas partes)';
  else if (pct === 10) simplified = ' (Simplificada: 1/10, la décima parte)';
  else if (pct === 20) simplified = ' (Simplificada: 1/5, la quinta parte)';
  else if (pct === 100) simplified = ' (Simplificada: 1 entero)';

  $('#percentMeaningBox').innerHTML = `
    <b>Lectura:</b> Significa <b>${pct} de cada 100 partes</b>.<br>
    Fracción: <code>${pct}/100</code>${simplified}.<br>
    Decimal: <code>${dec}</code>.
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

/* Banco de Generación Dinámica de Preguntas de Práctica */
function generateQuestion(topicId = null) {
  const chosenTopic = topicId && topicId !== 'all' ? topicId : pickRandom(Object.keys(TOPICS));

  if (chosenTopic === 'fraction') {
    // Fracción de un número
    const pairs = [
      { n: 2, d: 3, tot: 18, name: 'caramelos' },
      { n: 3, d: 4, tot: 24, name: 'lápices' },
      { n: 2, d: 5, tot: 20, name: 'figuritas' },
      { n: 4, d: 5, tot: 35, name: 'páginas de un libro' },
      { n: 3, d: 7, tot: 28, name: 'monedas' },
      { n: 5, d: 6, tot: 30, name: 'stickers' },
      { n: 3, d: 8, tot: 32, name: 'galletas' }
    ];
    const p = pickRandom(pairs);
    const correct = (p.tot / p.d) * p.n;
    const wrongs = [
      correct + p.n,
      correct - p.n > 0 ? correct - p.n : correct + 4,
      Math.floor(p.tot / p.d)
    ];

    return {
      topicId: 'fraction',
      topicName: 'Fracción de un número',
      topicBadge: '🍰 Tema 1',
      question: `Luciana tiene <b>${p.tot} ${p.name}</b>. Si regala los <b>${p.n}/${p.d}</b> a sus amigas, ¿cuántos ${p.name} regaló en total?`,
      hint: `Paso 1: Divide ${p.tot} ÷ ${p.d} = ${p.tot / p.d}. Paso 2: Multiplica el resultado por ${p.n}.`,
      options: shuffle([
        { text: `${correct} ${p.name}`, isCorrect: true },
        { text: `${wrongs[0]} ${p.name}`, isCorrect: false },
        { text: `${wrongs[1]} ${p.name}`, isCorrect: false },
        { text: `${wrongs[2]} ${p.name}`, isCorrect: false }
      ]),
      explanation: `Calculamos ${p.n}/${p.d} de ${p.tot}: Primero dividimos ${p.tot} ÷ ${p.d} = ${p.tot / p.d}. Luego multiplicamos ${p.tot / p.d} × ${p.n} = ${correct}.`
    };
  } else if (chosenTopic === 'volume') {
    // Volumen
    const l = randInt(2, 5);
    const w = randInt(2, 4);
    const h = randInt(2, 3);
    const correct = l * w * h;
    const wrongs = [
      (l + w) * h,
      l * w + h,
      correct + l
    ];

    return {
      topicId: 'volume',
      topicName: 'Cálculo de volumen',
      topicBadge: '📦 Tema 2',
      question: `Un prisma rectangular (ortoedro) tiene <b>${l} cm de largo</b>, <b>${w} cm de ancho</b> y <b>${h} cm de alto</b>. ¿Cuál es su volumen total?`,
      hint: `Recuerda la fórmula: Volumen = Largo × Ancho × Alto.`,
      options: shuffle([
        { text: `${correct} cm³`, isCorrect: true },
        { text: `${wrongs[0]} cm³`, isCorrect: false },
        { text: `${wrongs[1]} cm³`, isCorrect: false },
        { text: `${wrongs[2]} cm³`, isCorrect: false }
      ]),
      explanation: `Multiplicamos las tres dimensiones: ${l} × ${w} × ${h} = ${correct} cm³. Recuerda que el volumen se expresa en unidades cúbicas (cm³).`
    };
  } else if (chosenTopic === 'shapes') {
    // Cuerpos 3D
    const solidKeys = ['cube', 'prism_tri', 'pyr_square', 'pyr_tri', 'cylinder', 'cone', 'prism_hex'];
    const sKey = pickRandom(solidKeys);
    const s = SHAPES_DATA[sKey];

    const typeQ = randInt(1, 3);
    if (typeQ === 1) {
      return {
        topicId: 'shapes',
        topicName: 'Cuerpos Geométricos',
        topicBadge: '🔷 Tema 3',
        question: `¿Cuántos <b>vértices</b> tiene un(a) <b>${s.name}</b>?`,
        hint: `En los prismas los vértices son 2n; en las pirámides son n + 1 (incluyendo la cúspide).`,
        options: shuffle([
          { text: `${s.V} vértices`, isCorrect: true },
          { text: `${s.V + 2} vértices`, isCorrect: false },
          { text: `${s.V > 2 ? s.V - 2 : s.V + 4} vértices`, isCorrect: false },
          { text: `${s.E} vértices`, isCorrect: false }
        ]),
        explanation: `El(la) ${s.name} tiene exactamente ${s.V} vértices, ${s.F} caras y ${s.E} aristas.`
      };
    } else if (typeQ === 2) {
      return {
        topicId: 'shapes',
        topicName: 'Cuerpos Geométricos',
        topicBadge: '🔷 Tema 3',
        question: `¿Cuántas <b>caras</b> en total tiene un(a) <b>${s.name}</b>?`,
        hint: `Cuenta las bases más las caras laterales que unen los lados.`,
        options: shuffle([
          { text: `${s.F} caras`, isCorrect: true },
          { text: `${s.F + 1} caras`, isCorrect: false },
          { text: `${s.F > 2 ? s.F - 2 : s.F + 3} caras`, isCorrect: false },
          { text: `${s.E} caras`, isCorrect: false }
        ]),
        explanation: `El(la) ${s.name} tiene ${s.F} caras en total (${s.base} y ${s.sides}).`
      };
    } else {
      return {
        topicId: 'shapes',
        topicName: 'Cuerpos Geométricos',
        topicBadge: '🔷 Tema 3',
        question: `Si un poliedro tiene <b>1 sola base cuadrada</b> y <b>4 caras laterales triangulares</b> que se unen en una cúspide, ¿qué cuerpo es?`,
        hint: `Tiene 1 base y caras triangulares: es una pirámide.`,
        options: shuffle([
          { text: `Pirámide cuadrangular`, isCorrect: true },
          { text: `Prisma cuadrangular`, isCorrect: false },
          { text: `Pirámide triangular`, isCorrect: false },
          { text: `Cilindro`, isCorrect: false }
        ]),
        explanation: `Al tener una sola base cuadrada y caras laterales triangulares que concurren en una cúspide, es una Pirámide cuadrangular.`
      };
    }
  } else if (chosenTopic === 'stats') {
    // Estadística
    const sub = pickRandom(['mean', 'median', 'mode', 'range']);
    if (sub === 'mode') {
      const nums = [4, 7, 2, 7, 5, 7, 3];
      return {
        topicId: 'stats',
        topicName: 'Moda, Media, Mediana y Rango',
        topicBadge: '📊 Tema 4',
        question: `En el conjunto de datos <b>[4, 7, 2, 7, 5, 7, 3]</b>, ¿cuál es la <b>MODA</b>?`,
        hint: `La moda es el valor que tiene mayor frecuencia (el que más se repite).`,
        options: shuffle([
          { text: `7 (aparece 3 veces)`, isCorrect: true },
          { text: `5`, isCorrect: false },
          { text: `4`, isCorrect: false },
          { text: `2`, isCorrect: false }
        ]),
        explanation: `El número 7 aparece 3 veces, más que cualquier otro número. Por lo tanto, la Moda es 7.`
      };
    } else if (sub === 'median') {
      const nums = [2, 9, 3, 7, 5];
      return {
        topicId: 'stats',
        topicName: 'Moda, Media, Mediana y Rango',
        topicBadge: '📊 Tema 4',
        question: `¿Cuál es la <b>MEDIANA</b> del conjunto de datos <b>[2, 9, 3, 7, 5]</b>?`,
        hint: `¡Paso indispensable! Primero ordena los datos de menor a mayor: [2, 3, 5, 7, 9]. Luego toma el del centro.`,
        options: shuffle([
          { text: `5`, isCorrect: true },
          { text: `3`, isCorrect: false },
          { text: `7`, isCorrect: false },
          { text: `9`, isCorrect: false }
        ]),
        explanation: `Primero ordenamos de menor a mayor: [2, 3, 5, 7, 9]. El dato que queda exactamente en el centro es el 5.`
      };
    } else if (sub === 'range') {
      const nums = [4, 12, 6, 18, 9];
      return {
        topicId: 'stats',
        topicName: 'Moda, Media, Mediana y Rango',
        topicBadge: '📊 Tema 4',
        question: `¿Cuál es el <b>RANGO</b> del conjunto de datos <b>[4, 12, 6, 18, 9]</b>?`,
        hint: `Rango = Dato Máximo - Dato Mínimo.`,
        options: shuffle([
          { text: `14 (18 - 4)`, isCorrect: true },
          { text: `18`, isCorrect: false },
          { text: `12`, isCorrect: false },
          { text: `8`, isCorrect: false }
        ]),
        explanation: `El dato mayor es 18 y el dato menor es 4. El rango es 18 - 4 = 14.`
      };
    } else {
      // media
      const nums = [4, 6, 8, 2];
      return {
        topicId: 'stats',
        topicName: 'Moda, Media, Mediana y Rango',
        topicBadge: '📊 Tema 4',
        question: `¿Cuál es la <b>MEDIA (Promedio)</b> de las notas <b>[4, 6, 8, 2]</b>?`,
        hint: `Suma los 4 números (4 + 6 + 8 + 2 = 20) y luego divide entre 4.`,
        options: shuffle([
          { text: `5`, isCorrect: true },
          { text: `6`, isCorrect: false },
          { text: `4`, isCorrect: false },
          { text: `20`, isCorrect: false }
        ]),
        explanation: `Sumamos todos los datos: 4 + 6 + 8 + 2 = 20. Dividimos entre la cantidad de datos (4): 20 ÷ 4 = 5.`
      };
    }
  } else {
    // Porcentajes
    const pOptions = [
      { pct: '25%', frac: '25/100 o 1/4', dec: '0.25', desc: 'la cuarta parte' },
      { pct: '50%', frac: '50/100 o 1/2', dec: '0.50', desc: 'la mitad exacta' },
      { pct: '75%', frac: '75/100 o 3/4', dec: '0.75', desc: 'tres cuartas partes' },
      { pct: '10%', frac: '10/100 o 1/10', dec: '0.10', desc: 'la décima parte' }
    ];
    const item = pickRandom(pOptions);
    const mode = randInt(1, 2);

    if (mode === 1) {
      return {
        topicId: 'percent',
        topicName: 'Porcentajes',
        topicBadge: '💯 Tema 5',
        question: `¿A qué número decimal equivale el <b>${item.pct}</b>?`,
        hint: `Recuerda correr la coma dos lugares a la izquierda al dividir entre 100.`,
        options: shuffle([
          { text: `${item.dec}`, isCorrect: true },
          { text: `${(parseFloat(item.dec) * 10).toFixed(1)}`, isCorrect: false },
          { text: `${(parseFloat(item.dec) / 10).toFixed(3)}`, isCorrect: false },
          { text: `0.${parseInt(item.pct) + 5}`, isCorrect: false }
        ]),
        explanation: `${item.pct} significa ${item.pct.replace('%', '')} dividido entre 100, lo que da como número decimal ${item.dec}.`
      };
    } else {
      return {
        topicId: 'percent',
        topicName: 'Porcentajes',
        topicBadge: '💯 Tema 5',
        question: `En una cuadrícula de 100 casillas, Luciana pintó <b>${item.pct}</b> de color azul. ¿Cuántas casillas pintó?`,
        hint: `Cada casilla de la cuadrícula de 100 representa exactamente el 1%.`,
        options: shuffle([
          { text: `${parseInt(item.pct)} casillas`, isCorrect: true },
          { text: `${parseInt(item.pct) / 2} casillas`, isCorrect: false },
          { text: `${100 - parseInt(item.pct)} casillas`, isCorrect: false },
          { text: `${parseInt(item.pct) * 2} casillas`, isCorrect: false }
        ]),
        explanation: `Como la cuadrícula tiene 100 casillas en total, el ${item.pct} corresponde a exactamente ${parseInt(item.pct)} casillas.`
      };
    }
  }
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
      <div class="hero-school-badge">Colegio Bilingüe Lerner & Klein</div>
      <h2 style="font-size:1.8rem; font-weight:800; color:#1e293b; margin:10px 0;">
        Simulacro de Examen: 3.er Trimestre
      </h2>
      <p style="color:#64748b; font-size:1.05rem; margin-bottom:24px; line-height:1.5;">
        Este simulacro evalúa exactamente los 5 temas de la circular oficial para 4.° grado:
        <b>Fracción de un número</b>, <b>Cálculo de volumen</b>, <b>Cuerpos geométricos (caras, aristas, vértices)</b>,
        <b>Moda, media, mediana y rango</b>, y <b>Porcentajes (cuadrícula, fracción y decimal)</b>.
      </p>

      <div style="background:#f8fafc; border:2px solid #e2e8f0; border-radius:14px; padding:18px; margin-bottom:24px; text-align:left;">
        <h4 style="font-weight:800; color:#1e293b; margin-bottom:8px;">📋 Estructura de la prueba:</h4>
        <ul style="padding-left:20px; color:#475569; font-size:0.95rem; line-height:1.6;">
          <li><b>Total de preguntas:</b> 15 preguntas balanceadas (3 de cada tema).</li>
          <li><b>Puntaje máximo:</b> 100 puntos.</li>
          <li><b>Semáforo diagnóstico:</b> Reporte completo tema por tema.</li>
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
  // 3 de fracción
  qs.push(generateQuestion('fraction'));
  qs.push(generateQuestion('fraction'));
  qs.push(generateQuestion('fraction'));

  // 3 de volumen
  qs.push(generateQuestion('volume'));
  qs.push(generateQuestion('volume'));
  qs.push(generateQuestion('volume'));

  // 3 de cuerpos 3D
  qs.push(generateQuestion('shapes'));
  qs.push(generateQuestion('shapes'));
  qs.push(generateQuestion('shapes'));

  // 3 de estadística
  qs.push(generateQuestion('stats'));
  qs.push(generateQuestion('stats'));
  qs.push(generateQuestion('stats'));

  // 3 de porcentajes
  qs.push(generateQuestion('percent'));
  qs.push(generateQuestion('percent'));
  qs.push(generateQuestion('percent'));

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
