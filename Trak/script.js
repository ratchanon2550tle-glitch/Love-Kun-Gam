/* ============================================================
   HAPPY ANNIVERSARY — 3D Cosmic Love Scene
   Three.js r128 (UMD) + OrbitControls
   ============================================================ */

/* ---------------------------------------------------------
   1. INTRO LOADING SCREEN
--------------------------------------------------------- */
const introScreen  = document.getElementById('intro-screen');
const heartFill     = document.getElementById('heart-fill');
const percentLabel  = document.getElementById('percent');
const hud           = document.getElementById('hud');
const musicBtn      = document.getElementById('music-toggle');

let loadProgress = 0;
const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 9 + 3;
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loadInterval);
    setTimeout(finishIntro, 500);
  }
  heartFill.style.height = loadProgress + '%';
  percentLabel.textContent = Math.floor(loadProgress) + '%';
}, 180);

function finishIntro() {
  introScreen.classList.add('fade-out');
  hud.classList.remove('hidden');
  musicBtn.classList.remove('hidden');
  initScene();
  animate();
  startFallingHearts();
}

/* ---------------------------------------------------------
   1b. FALLING HEARTS OVERLAY (confetti-style, like the ref clip)
--------------------------------------------------------- */
function startFallingHearts() {
  const container = document.getElementById('falling-hearts');
  container.classList.remove('hidden');
  const emojis = ['💗', '💖', '💕', '💓'];
  const heartCount = innerWidth < 600 ? 18 : 32;

  for (let i = 0; i < heartCount; i++) {
    const heart = document.createElement('span');
    heart.className = 'falling-heart';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const size = Math.random() * 16 + 12; // 12px - 28px
    const left = Math.random() * 100;
    const duration = Math.random() * 8 + 8; // 8s - 16s
    const delay = Math.random() * -16; // stagger so they don't all start together
    const drift = (Math.random() - 0.5) * 160; // px sideways drift

    heart.style.left = left + 'vw';
    heart.style.fontSize = size + 'px';
    heart.style.setProperty('--drift', drift + 'px');
    heart.style.animationDuration = duration + 's';
    heart.style.animationDelay = delay + 's';

    container.appendChild(heart);
  }
}

/* ---------------------------------------------------------
   2. THREE.JS SCENE SETUP
--------------------------------------------------------- */
const canvas   = document.getElementById('scene-canvas');
const scene    = new THREE.Scene();
scene.fog      = new THREE.FogExp2(0x05020c, 0.018);

const camera   = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 4, 26);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 8;
controls.maxDistance = 45;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

let galaxyPoints, heartPoints, clickables = [];
const clock = new THREE.Clock();

function initScene() {
  buildGalaxy();
  buildHeartCore();
  buildFloatingLabels();
  buildLighting();
}

/* ---------------------------------------------------------
   3. PARTICLE GALAXY BACKGROUND
--------------------------------------------------------- */
function buildGalaxy() {
  const count = 9000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const colorA = new THREE.Color('#a855f7'); // purple
  const colorB = new THREE.Color('#ec4899'); // pink

  for (let i = 0; i < count; i++) {
    const radius = Math.pow(Math.random(), 0.6) * 22 + 2;
    const spinAngle = radius * 0.6;
    const branchAngle = ((i % 5) / 5) * Math.PI * 2;

    const randX = (Math.random() - 0.5) * 2 * (22 - radius) * 0.06;
    const randY = (Math.random() - 0.5) * 2 * 1.4;
    const randZ = (Math.random() - 0.5) * 2 * (22 - radius) * 0.06;

    const angle = branchAngle + spinAngle;
    positions[i * 3]     = Math.cos(angle) * radius + randX;
    positions[i * 3 + 1] = randY;
    positions[i * 3 + 2] = Math.sin(angle) * radius + randZ;

    const mixed = colorA.clone().lerp(colorB, Math.random());
    colors[i * 3]     = mixed.r;
    colors[i * 3 + 1]  = mixed.g;
    colors[i * 3 + 2]  = mixed.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.14,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  galaxyPoints = new THREE.Points(geo, mat);
  scene.add(galaxyPoints);
}

/* ---------------------------------------------------------
   4. GLOWING HEART CORE (made of particles)
--------------------------------------------------------- */
function heartParametric(t, scaleVal) {
  // classic 2D heart curve
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x: (x / 16) * scaleVal, y: (y / 16) * scaleVal };
}

function buildHeartCore() {
  const count = 4000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const pink = new THREE.Color('#ec4899');
  const purple = new THREE.Color('#a855f7');

  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const layer = Math.random(); // fills the heart volume, not just outline
    const { x, y } = heartParametric(t, 4.4 * Math.sqrt(layer));
    const z = (Math.random() - 0.5) * 1.6;

    positions[i * 3]     = x;
    positions[i * 3 + 1] = y + 2; // lift above galaxy plane
    positions[i * 3 + 2] = z;

    const mixed = pink.clone().lerp(purple, Math.random());
    colors[i * 3]     = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  heartPoints = new THREE.Points(geo, mat);
  scene.add(heartPoints);
}

/* ---------------------------------------------------------
   5. FLOATING TEXT + ICON SPRITES (clickable)
--------------------------------------------------------- */
function makeTextSprite(text, opts = {}) {
  const {
    fontSize = 64,
    color = '#ffffff',
    glow = '#ec4899',
    fontFace = 'bold 64px Segoe UI, sans-serif',
    padding = 40
  } = opts;

  const canvasEl = document.createElement('canvas');
  const ctx = canvasEl.getContext('2d');
  ctx.font = fontFace;
  const textWidth = ctx.measureText(text).width;

  canvasEl.width = textWidth + padding * 2;
  canvasEl.height = fontSize + padding * 2;

  ctx.font = fontFace;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = glow;
  ctx.shadowBlur = 26;
  ctx.fillStyle = color;
  for (let i = 0; i < 3; i++) {
    ctx.fillText(text, canvasEl.width / 2, canvasEl.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvasEl);
  texture.needsUpdate = true;

  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  const aspect = canvasEl.width / canvasEl.height;
  const h = 1.6;
  sprite.scale.set(h * aspect, h, 1);
  return sprite;
}

const floatingGroup = new THREE.Group();
const iconGroup = new THREE.Group();

function buildFloatingLabels() {
  const texts = CONFIG.floatingTexts;
  const modalTargets = ['modal-letter', 'modal-timer', 'modal-cards', 'modal-puzzle', 'modal-memory'];

  texts.forEach((txt, i) => {
    const angle = (i / texts.length) * Math.PI * 2;
    const radius = 8.5;
    const sprite = makeTextSprite(txt, {
      color: i % 2 === 0 ? '#ffe6f7' : '#e9d9ff',
      glow: i % 2 === 0 ? '#ec4899' : '#a855f7'
    });
    sprite.position.set(Math.cos(angle) * radius, 2 + Math.sin(i * 1.3) * 1.5, Math.sin(angle) * radius);
    sprite.userData = { baseAngle: angle, radius, speed: 0.15, modal: modalTargets[i], floatOffset: i };
    floatingGroup.add(sprite);
    clickables.push(sprite);
  });

  // Icon sprites — closer orbit, slightly different height, act as quick-access buttons
  const icons = [
    { emoji: '💌', modal: 'modal-letter' },
    { emoji: '⏱️', modal: 'modal-timer' },
    { emoji: '🔮', modal: 'modal-cards' },
    { emoji: '🧩', modal: 'modal-puzzle' },
    { emoji: '📸', modal: 'modal-memory' }
  ];

  icons.forEach((it, i) => {
    const angle = (i / icons.length) * Math.PI * 2 + Math.PI / icons.length;
    const radius = 5.5;
    const sprite = makeTextSprite(it.emoji, { fontFace: '58px sans-serif', glow: '#ec4899' });
    sprite.position.set(Math.cos(angle) * radius, -1 + Math.sin(i) * 1.2, Math.sin(angle) * radius);
    sprite.userData = { baseAngle: angle, radius, speed: -0.22, modal: it.modal, floatOffset: i + 10 };
    iconGroup.add(sprite);
    clickables.push(sprite);
  });

  scene.add(floatingGroup, iconGroup);
}

function buildLighting() {
  scene.add(new THREE.AmbientLight(0x9d6bff, 0.6));
  const p1 = new THREE.PointLight(0xec4899, 2.2, 40);
  p1.position.set(0, 5, 0);
  scene.add(p1);
  const p2 = new THREE.PointLight(0xa855f7, 1.6, 60);
  p2.position.set(0, -5, 10);
  scene.add(p2);
}

/* ---------------------------------------------------------
   6. CLICK / TAP DETECTION (distinguish from orbit-drag)
--------------------------------------------------------- */
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let downPos = { x: 0, y: 0 };

canvas.addEventListener('pointerdown', (e) => { downPos = { x: e.clientX, y: e.clientY }; });

canvas.addEventListener('pointerup', (e) => {
  const dx = e.clientX - downPos.x;
  const dy = e.clientY - downPos.y;
  if (Math.sqrt(dx * dx + dy * dy) > 6) return; // was a drag, ignore

  pointerNDC.x = (e.clientX / innerWidth) * 2 - 1;
  pointerNDC.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects(clickables, false);
  if (hits.length > 0) {
    const modalId = hits[0].object.userData.modal;
    if (modalId) openModal(modalId);
  }
});

/* ---------------------------------------------------------
   7. ANIMATION LOOP
--------------------------------------------------------- */
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (galaxyPoints) galaxyPoints.rotation.y = t * 0.045;

  if (heartPoints) {
    const pulse = 1 + Math.sin(t * 2.2) * 0.06;
    heartPoints.scale.set(pulse, pulse, pulse);
    heartPoints.rotation.y = t * 0.15;
  }

  floatingGroup.children.forEach((s) => {
    const d = s.userData;
    const a = d.baseAngle + t * d.speed;
    s.position.x = Math.cos(a) * d.radius;
    s.position.z = Math.sin(a) * d.radius;
    s.position.y = 2 + Math.sin(t * 0.8 + d.floatOffset) * 0.8;
  });

  iconGroup.children.forEach((s) => {
    const d = s.userData;
    const a = d.baseAngle + t * d.speed;
    s.position.x = Math.cos(a) * d.radius;
    s.position.z = Math.sin(a) * d.radius;
    s.position.y = -1 + Math.sin(t * 1.1 + d.floatOffset) * 0.7;
  });

  controls.update();
  renderer.render(scene, camera);
}

/* ---------------------------------------------------------
   8. MODAL SYSTEM
--------------------------------------------------------- */
function openModal(id) {
  document.getElementById(id)?.classList.add('active');
  if (id === 'modal-timer') startTimer();
  if (id === 'modal-cards') initCardGame();
  if (id === 'modal-puzzle') initPuzzle();
  if (id === 'modal-memory') renderMemories();
}
function closeModal(el) { el.classList.remove('active'); }

document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay); });
  overlay.querySelector('.modal-close')?.addEventListener('click', () => closeModal(overlay));
});

/* ---------------------------------------------------------
   9. RELATIONSHIP TIMER
--------------------------------------------------------- */
let timerInterval = null;
function startTimer() {
  clearInterval(timerInterval);
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}
function updateTimer() {
  const diff = Date.now() - CONFIG.relationshipStartDate.getTime();
  if (diff < 0) return;
  const secTotal = Math.floor(diff / 1000);
  const days = Math.floor(secTotal / 86400);
  const hours = Math.floor((secTotal % 86400) / 3600);
  const mins = Math.floor((secTotal % 3600) / 60);
  const secs = secTotal % 60;
  document.getElementById('t-days').textContent = days;
  document.getElementById('t-hours').textContent = hours;
  document.getElementById('t-mins').textContent = mins;
  document.getElementById('t-secs').textContent = secs;
}

/* ---------------------------------------------------------
   10. LOVE CARD GAME
--------------------------------------------------------- */
function initCardGame() {
  const row = document.getElementById('card-row');
  const result = document.getElementById('fortune-result');
  result.textContent = '';
  row.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    const card = document.createElement('div');
    card.className = 'love-card';
    card.textContent = '🔮';
    card.addEventListener('click', () => {
      if (card.classList.contains('flipped')) return;
      // lock all other cards
      row.querySelectorAll('.love-card').forEach((c) => c.classList.add('flipped'));
      const fortune = CONFIG.fortunes[Math.floor(Math.random() * CONFIG.fortunes.length)];
      card.textContent = '💖';
      result.textContent = fortune;
    }, { once: false });
    row.appendChild(card);
  }
}
document.getElementById('reset-cards').addEventListener('click', initCardGame);

/* ---------------------------------------------------------
   11. JIGSAW SLIDING PUZZLE (3x3)
--------------------------------------------------------- */
const PUZZLE_SIZE = 3;
let puzzleTiles = [];
let emptyIndex = PUZZLE_SIZE * PUZZLE_SIZE - 1;

function initPuzzle() {
  document.getElementById('puzzle-status').textContent = 'ลองต่อดูสิ 💕';
  puzzleTiles = Array.from({ length: PUZZLE_SIZE * PUZZLE_SIZE }, (_, i) => i);
  shuffleTiles();
  renderPuzzle();
}

function shuffleTiles() {
  // perform random valid slides so puzzle stays solvable
  emptyIndex = puzzleTiles.length - 1;
  for (let i = 0; i < 150; i++) {
    const neighbors = getNeighbors(emptyIndex);
    const swapWith = neighbors[Math.floor(Math.random() * neighbors.length)];
    [puzzleTiles[emptyIndex], puzzleTiles[swapWith]] = [puzzleTiles[swapWith], puzzleTiles[emptyIndex]];
    emptyIndex = swapWith;
  }
}

function getNeighbors(index) {
  const row = Math.floor(index / PUZZLE_SIZE);
  const col = index % PUZZLE_SIZE;
  const result = [];
  if (row > 0) result.push(index - PUZZLE_SIZE);
  if (row < PUZZLE_SIZE - 1) result.push(index + PUZZLE_SIZE);
  if (col > 0) result.push(index - 1);
  if (col < PUZZLE_SIZE - 1) result.push(index + 1);
  return result;
}

function renderPuzzle() {
  const board = document.getElementById('puzzle-board');
  board.innerHTML = '';
  puzzleTiles.forEach((tileValue, pos) => {
    const tile = document.createElement('div');
    if (tileValue === puzzleTiles.length - 1) {
      tile.className = 'puzzle-tile empty';
    } else {
      tile.className = 'puzzle-tile';
      const row = Math.floor(tileValue / PUZZLE_SIZE);
      const col = tileValue % PUZZLE_SIZE;
      tile.style.backgroundImage = `url('${CONFIG.puzzleImage}')`;
      tile.style.backgroundPosition = `${(col / (PUZZLE_SIZE - 1)) * 100}% ${(row / (PUZZLE_SIZE - 1)) * 100}%`;
      tile.addEventListener('click', () => trySlide(pos));
    }
    board.appendChild(tile);
  });
}

function trySlide(pos) {
  const neighbors = getNeighbors(emptyIndex);
  if (!neighbors.includes(pos)) return;
  [puzzleTiles[emptyIndex], puzzleTiles[pos]] = [puzzleTiles[pos], puzzleTiles[emptyIndex]];
  emptyIndex = pos;
  renderPuzzle();
  checkPuzzleSolved();
}

function checkPuzzleSolved() {
  const solved = puzzleTiles.every((v, i) => v === i);
  if (solved) document.getElementById('puzzle-status').textContent = '🎉 เก่งมาก! ต่อสำเร็จแล้ว 💖';
}
document.getElementById('reset-puzzle').addEventListener('click', initPuzzle);

/* ---------------------------------------------------------
   12. MEMORY TIMELINE
--------------------------------------------------------- */
function renderMemories() {
  const list = document.getElementById('memory-list');
  list.innerHTML = '';
  CONFIG.memories.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.innerHTML = `
      <img src="${m.img}" alt="memory">
      <div>
        <div class="memory-date">${m.date}</div>
        <div class="memory-caption">${m.caption}</div>
      </div>`;
    list.appendChild(card);
  });
}

/* ---------------------------------------------------------
   13. BACKGROUND MUSIC TOGGLE
--------------------------------------------------------- */
const bgMusic = document.getElementById('bg-music');
let musicPlaying = false;
musicBtn.addEventListener('click', () => {
  if (musicPlaying) {
    bgMusic.pause();
    musicBtn.textContent = '🔇';
  } else {
    bgMusic.play().catch(() => console.warn('เพิ่มไฟล์ music.mp3 ในโฟลเดอร์เดียวกันเพื่อเปิดเพลง'));
    musicBtn.textContent = '🔊';
  }
  musicPlaying = !musicPlaying;
});
