/**
 * SNAKE PRO ARCADE
 * A modern, responsive, non-neon arcade Snake game built with HTML5 Canvas,
 * Web Audio API, real-time speed controls, and tactile customizable skins.
 */

(function () {
  'use strict';

  // --- CONSTANTS & CONFIGURATION ---
  const CANVAS_SIZE = 440;
  const GRID_COUNT = 22;
  const CELL_SIZE = CANVAS_SIZE / GRID_COUNT; // 20px per cell

  const DIRECTIONS = {
    UP: { x: 0, y: -1, name: 'UP' },
    DOWN: { x: 0, y: 1, name: 'DOWN' },
    LEFT: { x: -1, y: 0, name: 'LEFT' },
    RIGHT: { x: 1, y: 0, name: 'RIGHT' }
  };

  const GAME_STATES = {
    START: 'START',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER'
  };

  // Speed Presets Mapping
  const SPEED_PRESETS = [
    { ms: 150, name: 'Chill' },
    { ms: 120, name: 'Relax' },
    { ms: 90, name: 'Normal' },
    { ms: 65, name: 'Fast' },
    { ms: 40, name: 'Ludicrous' }
  ];

  // Refined Non-Neon Snake Skins
  const SKINS = {
    emerald: {
      name: 'Emerald Viper',
      headPrimary: '#10b981',
      headSecondary: '#059669',
      bodyPrimary: '#10b981',
      bodySecondary: '#047857',
      belly: '#a7f3d0',
      spine: '#34d399',
      eye: '#f59e0b',
      pupil: '#0f172a',
      particle: '#10b981'
    },
    obsidian: {
      name: 'Obsidian Shadow',
      headPrimary: '#475569',
      headSecondary: '#1e293b',
      bodyPrimary: '#334155',
      bodySecondary: '#0f172a',
      belly: '#94a3b8',
      spine: '#cbd5e1',
      eye: '#ef4444',
      pupil: '#0f172a',
      particle: '#64748b'
    },
    python: {
      name: 'Desert Python',
      headPrimary: '#f59e0b',
      headSecondary: '#b45309',
      bodyPrimary: '#d97706',
      bodySecondary: '#78350f',
      belly: '#fde68a',
      spine: '#fcd34d',
      eye: '#0284c7',
      pupil: '#0f172a',
      particle: '#f59e0b'
    },
    coral: {
      name: 'Coral Banded',
      headPrimary: '#ef4444',
      headSecondary: '#b91c1c',
      bodyBands: ['#ef4444', '#18181b', '#fef3c7'],
      belly: '#fca5a5',
      spine: '#ffffff',
      eye: '#18181b',
      pupil: '#000000',
      particle: '#ef4444'
    },
    arctic: {
      name: 'Arctic Glacier',
      headPrimary: '#38bdf8',
      headSecondary: '#0284c7',
      bodyPrimary: '#0ea5e9',
      bodySecondary: '#0369a1',
      belly: '#e0f2fe',
      spine: '#bae6fd',
      eye: '#6366f1',
      pupil: '#0f172a',
      particle: '#38bdf8'
    }
  };

  // Handcrafted SVG Icons (Replacing raw emojis with bespoke vector design)
  const SVG_ICONS = {
    soundOn: `<svg class="svg-icon sound-svg" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3.5 7.5H6.5L11 4V16L6.5 12.5H3.5C2.95 12.5 2.5 12.05 2.5 11.5V8.5C2.5 7.95 2.95 7.5 3.5 7.5Z" fill="currentColor"/><path d="M14 6.5C15.2 7.6 16 9.2 16 10C16 10.8 15.2 12.4 14 13.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M16.5 4C18.2 5.7 19.2 7.7 19.2 10C19.2 12.3 18.2 14.3 16.5 16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    soundMuted: `<svg class="svg-icon sound-svg muted" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3.5 7.5H6.5L11 4V16L6.5 12.5H3.5C2.95 12.5 2.5 12.05 2.5 11.5V8.5C2.5 7.95 2.95 7.5 3.5 7.5Z" fill="currentColor"/><line x1="14" y1="7" x2="18.5" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="18.5" y1="7" x2="14" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    pause: `<svg class="svg-icon pause-svg" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="5.5" y="4" width="3" height="12" rx="1.5" fill="currentColor"/><rect x="11.5" y="4" width="3" height="12" rx="1.5" fill="currentColor"/></svg>`,
    play: `<svg class="svg-icon play-svg" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6.5 4.7C6.5 3.9 7.4 3.4 8.1 3.8L16.2 9.1C16.8 9.5 16.8 10.5 16.2 10.9L8.1 16.2C7.4 16.6 6.5 16.1 6.5 15.3V4.7Z" fill="currentColor"/></svg>`
  };

  // --- AUDIO SYNTHESIZER (WEB AUDIO API) ---
  class SoundEffects {
    constructor() {
      this.ctx = null;
      this.isMuted = localStorage.getItem('snake_pro_muted') === 'true';
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playEat() {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.1);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
      } catch (e) {}
    }

    playBonus() {
      if (this.isMuted || !this.ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const now = this.ctx.currentTime + idx * 0.045;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.12);
        });
      } catch (e) {}
    }

    playDie() {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      } catch (e) {}
    }

    playClick() {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(560, now);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
      } catch (e) {}
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      localStorage.setItem('snake_pro_muted', this.isMuted);
      return this.isMuted;
    }
  }

  // --- CLEAN PARTICLE SYSTEM (NO GLOWING BLUR) ---
  class ParticleSystem {
    constructor() {
      this.particles = [];
    }

    burst(x, y, color, count = 12, speedMul = 1) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 2.8 + 1.2) * speedMul;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.2 + 1.2,
          color: color,
          alpha: 1,
          decay: Math.random() * 0.035 + 0.02
        });
      }
    }

    update() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      ctx.save();
      for (const p of this.particles) {
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    clear() {
      this.particles = [];
    }
  }

  // --- MAIN GAME ENGINE ---
  class SnakeGame {
    constructor() {
      // DOM Elements
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.currentScoreEl = document.getElementById('current-score');
      this.highScoreEl = document.getElementById('high-score');
      this.snakeLengthEl = document.getElementById('snake-length');
      this.soundBtn = document.getElementById('sound-btn');
      this.pauseBtn = document.getElementById('pause-btn');

      // Speed & Skin DOM Elements
      this.speedToggleBtn = document.getElementById('speed-toggle-btn');
      this.headerSpeedBadge = document.getElementById('header-speed-badge');
      this.quickSpeedBar = document.getElementById('quick-speed-bar');
      this.speedSlider = document.getElementById('speed-slider');
      this.liveSpeedLabel = document.getElementById('live-speed-label');
      this.speedMovesSec = document.getElementById('speed-moves-sec');
      this.diffButtons = document.querySelectorAll('.diff-btn');
      this.skinToggleBtn = document.getElementById('skin-toggle-btn');
      this.skinSwatches = document.querySelectorAll('.skin-swatch');

      // Overlays & buttons
      this.startScreen = document.getElementById('start-screen');
      this.pauseScreen = document.getElementById('pause-screen');
      this.gameoverScreen = document.getElementById('gameover-screen');
      this.startBtn = document.getElementById('start-btn');
      this.resumeBtn = document.getElementById('resume-btn');
      this.restartPauseBtn = document.getElementById('restart-from-pause-btn');
      this.retryBtn = document.getElementById('retry-btn');
      this.finalScoreEl = document.getElementById('final-score');
      this.statApplesEl = document.getElementById('stat-apples');
      this.statBonusesEl = document.getElementById('stat-bonuses');
      this.newRecordTag = document.getElementById('new-record-tag');

      // Audio & Particles
      this.audio = new SoundEffects();
      this.particles = new ParticleSystem();

      // State variables
      this.state = GAME_STATES.START;
      this.highScore = parseInt(localStorage.getItem('snake_pro_high_score'), 10) || 0;
      
      // Speed settings (Load from storage or default 90ms)
      const storedSpeed = parseInt(localStorage.getItem('snake_pro_speed'), 10);
      this.selectedSpeed = (!isNaN(storedSpeed) && storedSpeed >= 40 && storedSpeed <= 150) ? storedSpeed : 90;
      this.tickRate = this.selectedSpeed;

      // Skin settings (Load from storage or default emerald)
      const storedSkin = localStorage.getItem('snake_pro_skin');
      this.currentSkin = (storedSkin && SKINS[storedSkin]) ? storedSkin : 'emerald';

      // Game run data
      this.snake = [];
      this.direction = DIRECTIONS.RIGHT;
      this.nextDirections = []; // Input buffer
      this.score = 0;
      this.applesEaten = 0;
      this.bonusesEaten = 0;
      this.food = null;
      this.bonus = null; // {x, y, timer, maxTimer}
      this.lastTickTime = 0;
      this.lastFrameTime = 0;

      // Initialize UI, bindings, and render preview
      this.initUI();
      this.bindEvents();
      this.renderInitialBoard();

      // Start continuous animation loop
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    initUI() {
      this.highScoreEl.textContent = this.highScore;
      this.updateSoundBtnIcon();
      this.setPauseIcon(false);
      this.setSpeed(this.selectedSpeed, true);
      this.setSkin(this.currentSkin);
    }

    updateSoundBtnIcon() {
      const icon = this.soundBtn.querySelector('.sound-icon');
      if (icon) {
        if (this.audio.isMuted) {
          icon.innerHTML = SVG_ICONS.soundMuted;
          this.soundBtn.classList.add('muted');
        } else {
          icon.innerHTML = SVG_ICONS.soundOn;
          this.soundBtn.classList.remove('muted');
        }
      }
    }

    setPauseIcon(isPaused) {
      const icon = this.pauseBtn.querySelector('.pause-icon');
      if (icon) {
        icon.innerHTML = isPaused ? SVG_ICONS.play : SVG_ICONS.pause;
      }
    }

    // --- SPEED MANAGEMENT (REAL-TIME, ACCESSIBLE ANYTIME) ---
    getSpeedLabel(ms) {
      if (ms >= 140) return 'Chill';
      if (ms >= 110) return 'Relax';
      if (ms >= 80) return 'Normal';
      if (ms >= 55) return 'Fast';
      return 'Ludicrous';
    }

    setSpeed(ms, updateSlider = true) {
      const clamped = Math.max(40, Math.min(150, parseInt(ms, 10) || 90));
      this.selectedSpeed = clamped;
      this.tickRate = clamped;
      localStorage.setItem('snake_pro_speed', clamped);

      const label = this.getSpeedLabel(clamped);
      const movesPerSec = (1000 / clamped).toFixed(1);

      // Update Header badge
      if (this.headerSpeedBadge) {
        this.headerSpeedBadge.textContent = `${clamped}ms`;
      }

      // Update Quick Speed Bar labels
      if (this.liveSpeedLabel) {
        this.liveSpeedLabel.textContent = `${clamped}ms (${label})`;
      }
      if (this.speedMovesSec) {
        this.speedMovesSec.textContent = `${movesPerSec} moves/sec`;
      }

      // Update Slider value if requested
      if (updateSlider && this.speedSlider) {
        this.speedSlider.value = clamped;
      }

      // Update preset buttons active state
      this.diffButtons.forEach(btn => {
        const btnSpeed = parseInt(btn.dataset.speed, 10);
        if (btnSpeed === clamped) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // --- SKIN MANAGEMENT ---
    setSkin(skinKey) {
      if (!SKINS[skinKey]) return;
      this.currentSkin = skinKey;
      localStorage.setItem('snake_pro_skin', skinKey);

      // Sync all skin swatches in start & pause screens
      this.skinSwatches.forEach(swatch => {
        if (swatch.dataset.skin === skinKey) {
          swatch.classList.add('active');
        } else {
          swatch.classList.remove('active');
        }
      });
    }

    resetGame() {
      const mid = Math.floor(GRID_COUNT / 2);
      this.snake = [
        { x: mid, y: mid },
        { x: mid - 1, y: mid },
        { x: mid - 2, y: mid }
      ];
      this.direction = DIRECTIONS.RIGHT;
      this.nextDirections = [];
      this.score = 0;
      this.applesEaten = 0;
      this.bonusesEaten = 0;
      this.tickRate = this.selectedSpeed;
      this.bonus = null;
      this.particles.clear();

      this.updateScoresHUD();
      this.spawnFood();
    }

    startGame() {
      this.audio.init();
      this.audio.playClick();
      this.resetGame();
      this.state = GAME_STATES.PLAYING;
      this.startScreen.classList.add('hidden');
      this.pauseScreen.classList.add('hidden');
      this.gameoverScreen.classList.add('hidden');
      this.setPauseIcon(false);
      this.lastTickTime = performance.now();
    }

    pauseGame() {
      if (this.state === GAME_STATES.PLAYING) {
        this.state = GAME_STATES.PAUSED;
        this.pauseScreen.classList.remove('hidden');
        this.setPauseIcon(true);
        this.audio.playClick();
      }
    }

    resumeGame() {
      if (this.state === GAME_STATES.PAUSED) {
        this.state = GAME_STATES.PLAYING;
        this.pauseScreen.classList.add('hidden');
        this.setPauseIcon(false);
        this.lastTickTime = performance.now();
        this.audio.playClick();
      }
    }

    togglePause() {
      if (this.state === GAME_STATES.PLAYING) {
        this.pauseGame();
      } else if (this.state === GAME_STATES.PAUSED) {
        this.resumeGame();
      }
    }

    gameOver() {
      this.state = GAME_STATES.GAMEOVER;
      this.audio.playDie();

      // Explode snake into clean particles matching the chosen skin
      const skin = SKINS[this.currentSkin];
      for (const segment of this.snake) {
        const px = segment.x * CELL_SIZE + CELL_SIZE / 2;
        const py = segment.y * CELL_SIZE + CELL_SIZE / 2;
        this.particles.burst(px, py, skin.particle, 5, 1.2);
        this.particles.burst(px, py, skin.headSecondary, 4, 1.5);
      }

      // Check high score
      let isNewRecord = false;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('snake_pro_high_score', this.highScore);
        this.highScoreEl.textContent = this.highScore;
        isNewRecord = true;
      }

      // Populate Game Over Screen
      this.finalScoreEl.textContent = this.score;
      this.statApplesEl.textContent = this.applesEaten;
      this.statBonusesEl.textContent = this.bonusesEaten;

      if (isNewRecord && this.score > 0) {
        this.newRecordTag.classList.remove('hidden');
      } else {
        this.newRecordTag.classList.add('hidden');
      }

      setTimeout(() => {
        this.gameoverScreen.classList.remove('hidden');
      }, 350);
    }

    spawnFood() {
      const emptyCells = [];
      const occupied = new Set(this.snake.map(seg => `${seg.x},${seg.y}`));
      if (this.bonus) {
        occupied.add(`${this.bonus.x},${this.bonus.y}`);
      }

      for (let x = 0; x < GRID_COUNT; x++) {
        for (let y = 0; y < GRID_COUNT; y++) {
          if (!occupied.has(`${x},${y}`)) {
            emptyCells.push({ x, y });
          }
        }
      }

      if (emptyCells.length === 0) {
        this.gameOver();
        return;
      }

      const randIndex = Math.floor(Math.random() * emptyCells.length);
      this.food = emptyCells[randIndex];
    }

    spawnBonus() {
      if (this.bonus) return;
      const emptyCells = [];
      const occupied = new Set(this.snake.map(seg => `${seg.x},${seg.y}`));
      if (this.food) {
        occupied.add(`${this.food.x},${this.food.y}`);
      }

      for (let x = 0; x < GRID_COUNT; x++) {
        for (let y = 0; y < GRID_COUNT; y++) {
          if (!occupied.has(`${x},${y}`)) {
            emptyCells.push({ x, y });
          }
        }
      }

      if (emptyCells.length === 0) return;

      const randIndex = Math.floor(Math.random() * emptyCells.length);
      const cell = emptyCells[randIndex];
      this.bonus = {
        x: cell.x,
        y: cell.y,
        timer: 7000,
        maxTimer: 7000
      };
    }

    queueDirection(newDir) {
      if (!newDir) return;

      const current = this.nextDirections.length > 0 
        ? this.nextDirections[this.nextDirections.length - 1] 
        : this.direction;

      const isOpposite = (
        (newDir === DIRECTIONS.UP && current === DIRECTIONS.DOWN) ||
        (newDir === DIRECTIONS.DOWN && current === DIRECTIONS.UP) ||
        (newDir === DIRECTIONS.LEFT && current === DIRECTIONS.RIGHT) ||
        (newDir === DIRECTIONS.RIGHT && current === DIRECTIONS.LEFT)
      );

      if (!isOpposite && newDir !== current && this.nextDirections.length < 2) {
        this.nextDirections.push(newDir);
      }
    }

    updateGame() {
      if (this.nextDirections.length > 0) {
        this.direction = this.nextDirections.shift();
      }

      const head = this.snake[0];
      const newHead = {
        x: head.x + this.direction.x,
        y: head.y + this.direction.y
      };

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_COUNT || newHead.y < 0 || newHead.y >= GRID_COUNT) {
        this.gameOver();
        return;
      }

      // Check self-collision
      const willGrow = (this.food && newHead.x === this.food.x && newHead.y === this.food.y) || 
                       (this.bonus && newHead.x === this.bonus.x && newHead.y === this.bonus.y);
      const bodyToCheck = willGrow ? this.snake : this.snake.slice(0, -1);

      if (bodyToCheck.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        this.gameOver();
        return;
      }

      this.snake.unshift(newHead);

      // Eating regular food
      if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
        this.score += 1;
        this.applesEaten += 1;
        this.audio.playEat();

        const px = this.food.x * CELL_SIZE + CELL_SIZE / 2;
        const py = this.food.y * CELL_SIZE + CELL_SIZE / 2;
        this.particles.burst(px, py, '#f43f5e', 10);
        this.particles.burst(px, py, '#10b981', 4);

        this.updateScoresHUD();
        this.spawnFood();

        if (this.applesEaten % 5 === 0 && !this.bonus) {
          this.spawnBonus();
        }
      } else if (this.bonus && newHead.x === this.bonus.x && newHead.y === this.bonus.y) {
        // Ate Bonus Fruit
        this.score += 5;
        this.bonusesEaten += 1;
        this.audio.playBonus();

        const px = this.bonus.x * CELL_SIZE + CELL_SIZE / 2;
        const py = this.bonus.y * CELL_SIZE + CELL_SIZE / 2;
        this.particles.burst(px, py, '#f59e0b', 16, 1.4);
        this.particles.burst(px, py, '#fbbf24', 8, 1.6);

        this.bonus = null;
        this.updateScoresHUD();
      } else {
        this.snake.pop();
      }

      this.snakeLengthEl.textContent = this.snake.length;
    }

    updateBonusTimer(dt) {
      if (!this.bonus) return;
      this.bonus.timer -= dt;
      if (this.bonus.timer <= 0) {
        const px = this.bonus.x * CELL_SIZE + CELL_SIZE / 2;
        const py = this.bonus.y * CELL_SIZE + CELL_SIZE / 2;
        this.particles.burst(px, py, '#64748b', 6, 0.6);
        this.bonus = null;
      }
    }

    updateScoresHUD() {
      this.currentScoreEl.textContent = this.score;
      this.currentScoreEl.classList.remove('bump');
      void this.currentScoreEl.offsetWidth; // Force reflow
      this.currentScoreEl.classList.add('bump');

      this.snakeLengthEl.textContent = this.snake.length;
    }

    // --- MAIN RENDER ENGINE (CLEAN NON-NEON AESTHETIC) ---
    drawGrid() {
      // Matte Charcoal/Slate Background
      this.ctx.fillStyle = '#0c121e';
      this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Clean subtle grid lines (NO glowing neon)
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';

      for (let i = 0; i <= GRID_COUNT; i++) {
        const pos = i * CELL_SIZE;
        this.ctx.beginPath();
        this.ctx.moveTo(pos, 0);
        this.ctx.lineTo(pos, CANVAS_SIZE);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(0, pos);
        this.ctx.lineTo(CANVAS_SIZE, pos);
        this.ctx.stroke();
      }
    }

    drawFood() {
      if (!this.food) return;

      const cx = this.food.x * CELL_SIZE + CELL_SIZE / 2;
      const cy = this.food.y * CELL_SIZE + CELL_SIZE / 2;
      const r = CELL_SIZE * 0.38;

      this.ctx.save();

      // Subtle ground contact shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy + r * 0.85, r * 0.85, r * 0.35, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Apple Body (Rich spherical 3D shading, NO neon glow)
      const grad = this.ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      grad.addColorStop(0, '#fb7185');
      grad.addColorStop(0.6, '#e11d48');
      grad.addColorStop(1, '#881337');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy + 1, r, 0, Math.PI * 2);
      this.ctx.fill();

      // Specular highlight arc
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(cx - r * 0.25, cy - r * 0.2, r * 0.5, Math.PI * 0.8, Math.PI * 1.4);
      this.ctx.stroke();

      // Wooden Curved Stem
      this.ctx.strokeStyle = '#78350f';
      this.ctx.lineWidth = 2.2;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - r * 0.6);
      this.ctx.quadraticCurveTo(cx + 2, cy - r * 1.3, cx + 4, cy - r * 1.2);
      this.ctx.stroke();

      // Fresh Green Leaf
      this.ctx.fillStyle = '#10b981';
      this.ctx.beginPath();
      this.ctx.ellipse(cx + 3.5, cy - r * 0.85, 3.5, 2, Math.PI / 4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    drawBonus() {
      if (!this.bonus) return;

      const cx = this.bonus.x * CELL_SIZE + CELL_SIZE / 2;
      const cy = this.bonus.y * CELL_SIZE + CELL_SIZE / 2;
      const r = CELL_SIZE * 0.42;

      this.ctx.save();

      // Soft ground shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy + r * 0.9, r * 0.8, r * 0.35, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Circular Countdown Ring (Crisp Track, NO neon)
      const progress = Math.max(0, this.bonus.timer / this.bonus.maxTimer);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, CELL_SIZE * 0.46, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, CELL_SIZE * 0.46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      this.ctx.stroke();

      // Golden Star / Gem Shape
      const grad = this.ctx.createRadialGradient(cx - 2, cy - 2, 2, cx, cy, r);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#f59e0b');
      grad.addColorStop(1, '#b45309');

      this.ctx.fillStyle = grad;
      const spikes = 5;
      const outerRadius = r;
      const innerRadius = r * 0.52;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * outerRadius;
        let y = cy + Math.sin(rot) * outerRadius;
        this.ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        this.ctx.lineTo(x, y);
        rot += step;
      }
      this.ctx.lineTo(cx, cy - outerRadius);
      this.ctx.closePath();
      this.ctx.fill();

      // Subtle center specular glint
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.beginPath();
      this.ctx.arc(cx - 2, cy - 2, 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    // --- SLEEK, ORGANIC, NON-NEON SNAKE RENDERER ---
    drawSnake() {
      if (this.snake.length === 0) return;

      const skin = SKINS[this.currentSkin] || SKINS.emerald;
      const len = this.snake.length;
      this.ctx.save();

      // 1. Draw Body Segments (from tail up to segment 1) with continuous organic capsules
      for (let i = len - 1; i >= 1; i--) {
        const seg = this.snake[i];
        const prevSeg = this.snake[i - 1]; // segment closer to head

        const cx = seg.x * CELL_SIZE + CELL_SIZE / 2;
        const cy = seg.y * CELL_SIZE + CELL_SIZE / 2;

        const prevCx = prevSeg.x * CELL_SIZE + CELL_SIZE / 2;
        const prevCy = prevSeg.y * CELL_SIZE + CELL_SIZE / 2;

        // Smooth tapering radius: full size near head, gently tapering down to tail
        const ratio = i / len;
        const radius = CELL_SIZE * (0.42 - ratio * 0.16); // ~8.4px down to 5.2px

        // Determine segment color based on skin
        let segColor1 = skin.bodyPrimary;
        let segColor2 = skin.bodySecondary;

        if (skin.bodyBands) {
          // Banded pattern (like Coral snake)
          const bandIndex = i % skin.bodyBands.length;
          segColor1 = skin.bodyBands[bandIndex];
          segColor2 = skin.bodyBands[bandIndex];
        }

        // Draw connecting capsule between current segment and previous segment
        // to make the body slither as a unified continuous organism!
        this.ctx.save();
        this.ctx.strokeStyle = segColor1;
        this.ctx.lineWidth = radius * 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(prevCx, prevCy);
        this.ctx.stroke();

        // Inner 3D spherical shading on segment node
        const nodeGrad = this.ctx.createRadialGradient(
          cx - radius * 0.35, cy - radius * 0.35, radius * 0.15,
          cx, cy, radius
        );
        nodeGrad.addColorStop(0, segColor1);
        nodeGrad.addColorStop(0.7, segColor2);
        nodeGrad.addColorStop(1, '#0b0f17');

        this.ctx.fillStyle = nodeGrad;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Dorsal spine accent line down the back
        if (skin.spine && i % 2 === 0) {
          this.ctx.fillStyle = skin.spine;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, radius * 0.28, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }

      // 2. Draw Snake Head (Segment 0)
      const head = this.snake[0];
      const hx = head.x * CELL_SIZE + CELL_SIZE / 2;
      const hy = head.y * CELL_SIZE + CELL_SIZE / 2;
      const headRadius = CELL_SIZE * 0.44;

      this.ctx.save();

      // Animated Forked Tongue (Flicks out periodically, crimson red)
      this.drawSnakeTongue(hx, hy, this.direction);

      // Head Base Shape with direction-oriented curvature
      const headGrad = this.ctx.createRadialGradient(
        hx - this.direction.x * 2 - 2,
        hy - this.direction.y * 2 - 2,
        2,
        hx, hy, headRadius
      );
      headGrad.addColorStop(0, skin.headPrimary);
      headGrad.addColorStop(0.75, skin.headSecondary);
      headGrad.addColorStop(1, '#0b0f17');

      this.ctx.fillStyle = headGrad;
      this.ctx.beginPath();
      this.ctx.arc(hx, hy, headRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // Subtle Snout extension towards movement direction
      const snoutDist = headRadius * 0.4;
      const sx = hx + this.direction.x * snoutDist;
      const sy = hy + this.direction.y * snoutDist;
      this.ctx.fillStyle = skin.headPrimary;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, headRadius * 0.72, 0, Math.PI * 2);
      this.ctx.fill();

      // Expressive Eyes with Pupils and Highlights (NO neon blur)
      this.drawSnakeEyes(hx, hy, this.direction, skin);

      // Subtle Nostrils at snout tip
      this.drawSnakeNostrils(sx, sy, this.direction);

      this.ctx.restore();
    }

    drawSnakeTongue(hx, hy, dir) {
      const now = performance.now();
      // Tongue flickers out every 1.8 seconds for a brief moment
      const cycle = Math.sin(now * 0.007);
      if (cycle < 0.65) return;

      const progress = (cycle - 0.65) / 0.35; // 0 to 1
      const tongueLength = (CELL_SIZE * 0.7) * progress;
      const forkSize = 3.5;

      const baseX = hx + dir.x * (CELL_SIZE * 0.45);
      const baseY = hy + dir.y * (CELL_SIZE * 0.45);
      const tipX = baseX + dir.x * tongueLength;
      const tipY = baseY + dir.y * tongueLength;

      // Normal vector for fork split
      const perpX = -dir.y;
      const perpY = dir.x;

      this.ctx.save();
      this.ctx.strokeStyle = '#e11d48'; // Crisp crimson red
      this.ctx.lineWidth = 1.6;
      this.ctx.lineCap = 'round';

      // Stem of tongue
      this.ctx.beginPath();
      this.ctx.moveTo(baseX, baseY);
      this.ctx.lineTo(tipX, tipY);
      this.ctx.stroke();

      // Left and right fork tips
      this.ctx.beginPath();
      this.ctx.moveTo(tipX, tipY);
      this.ctx.lineTo(tipX + dir.x * forkSize + perpX * forkSize, tipY + dir.y * forkSize + perpY * forkSize);
      this.ctx.moveTo(tipX, tipY);
      this.ctx.lineTo(tipX + dir.x * forkSize - perpX * forkSize, tipY + dir.y * forkSize - perpY * forkSize);
      this.ctx.stroke();

      this.ctx.restore();
    }

    drawSnakeEyes(hx, hy, dir, skin) {
      const eyeOffsetForward = CELL_SIZE * 0.18;
      const eyeOffsetSide = CELL_SIZE * 0.28;
      const eyeRadius = 3.2;
      const pupilRadius = 1.8;

      let eye1 = { x: 0, y: 0 };
      let eye2 = { x: 0, y: 0 };
      let pupilOffset = { x: dir.x * 0.9, y: dir.y * 0.9 };

      if (dir === DIRECTIONS.RIGHT) {
        eye1 = { x: hx + eyeOffsetForward, y: hy - eyeOffsetSide };
        eye2 = { x: hx + eyeOffsetForward, y: hy + eyeOffsetSide };
      } else if (dir === DIRECTIONS.LEFT) {
        eye1 = { x: hx - eyeOffsetForward, y: hy - eyeOffsetSide };
        eye2 = { x: hx - eyeOffsetForward, y: hy + eyeOffsetSide };
      } else if (dir === DIRECTIONS.UP) {
        eye1 = { x: hx - eyeOffsetSide, y: hy - eyeOffsetForward };
        eye2 = { x: hx + eyeOffsetSide, y: hy - eyeOffsetForward };
      } else if (dir === DIRECTIONS.DOWN) {
        eye1 = { x: hx - eyeOffsetSide, y: hy + eyeOffsetForward };
        eye2 = { x: hx + eyeOffsetSide, y: hy + eyeOffsetForward };
      }

      [eye1, eye2].forEach(eye => {
        // White Sclera
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(eye.x, eye.y, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Eye Ring / Depth Border
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        this.ctx.lineWidth = 0.8;
        this.ctx.stroke();

        // Iris (skin-specific accent)
        this.ctx.fillStyle = skin.eye;
        this.ctx.beginPath();
        this.ctx.arc(eye.x + pupilOffset.x * 0.4, eye.y + pupilOffset.y * 0.4, pupilRadius * 1.15, 0, Math.PI * 2);
        this.ctx.fill();

        // Pupil (looking forward)
        this.ctx.fillStyle = skin.pupil;
        this.ctx.beginPath();
        this.ctx.arc(eye.x + pupilOffset.x, eye.y + pupilOffset.y, pupilRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Specular glint
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(eye.x - 0.7, eye.y - 0.7, 0.9, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }

    drawSnakeNostrils(sx, sy, dir) {
      const perpX = -dir.y;
      const perpY = dir.x;
      const nostrilDist = 3.2;
      const tipForward = 3.5;

      const n1 = {
        x: sx + dir.x * tipForward + perpX * nostrilDist,
        y: sy + dir.y * tipForward + perpY * nostrilDist
      };
      const n2 = {
        x: sx + dir.x * tipForward - perpX * nostrilDist,
        y: sy + dir.y * tipForward - perpY * nostrilDist
      };

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      this.ctx.beginPath();
      this.ctx.arc(n1.x, n1.y, 0.9, 0, Math.PI * 2);
      this.ctx.arc(n2.x, n2.y, 0.9, 0, Math.PI * 2);
      this.ctx.fill();
    }

    renderInitialBoard() {
      this.drawGrid();
      const mid = Math.floor(GRID_COUNT / 2);
      this.snake = [
        { x: mid, y: mid },
        { x: mid - 1, y: mid },
        { x: mid - 2, y: mid }
      ];
      this.food = { x: mid + 4, y: mid };
      this.drawFood();
      this.drawSnake();
    }

    // --- MAIN GAME TICK & ANIMATION LOOP ---
    loop(timestamp) {
      const dt = timestamp - (this.lastFrameTime || timestamp);
      this.lastFrameTime = timestamp;

      if (this.state === GAME_STATES.PLAYING) {
        if (timestamp - this.lastTickTime >= this.tickRate) {
          this.updateGame();
          this.lastTickTime = timestamp;
        }
        this.updateBonusTimer(dt);
      }

      this.particles.update();

      // Render Everything Cleanly
      this.drawGrid();
      this.drawFood();
      this.drawBonus();
      this.drawSnake();
      this.particles.draw(this.ctx);

      requestAnimationFrame(this.loop);
    }

    // --- EVENT BINDINGS & CONTROLS ---
    bindEvents() {
      // 1. Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          e.preventDefault();
        }

        this.audio.init();

        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            if (this.state === GAME_STATES.PLAYING) this.queueDirection(DIRECTIONS.UP);
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            if (this.state === GAME_STATES.PLAYING) this.queueDirection(DIRECTIONS.DOWN);
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            if (this.state === GAME_STATES.PLAYING) this.queueDirection(DIRECTIONS.LEFT);
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            if (this.state === GAME_STATES.PLAYING) this.queueDirection(DIRECTIONS.RIGHT);
            break;
          case ' ':
          case 'p':
          case 'P':
            if (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.PAUSED) {
              this.togglePause();
            } else if (this.state === GAME_STATES.START || this.state === GAME_STATES.GAMEOVER) {
              this.startGame();
            }
            break;
          case 'Enter':
            if (this.state === GAME_STATES.START || this.state === GAME_STATES.GAMEOVER) {
              this.startGame();
            }
            break;
          case 'm':
          case 'M':
            this.audio.toggleMute();
            this.updateSoundBtnIcon();
            break;

          // Hotkeys for live speed adjustment
          case '[':
          case '-':
            // Slower (+10ms delay)
            this.setSpeed(this.selectedSpeed + 10, true);
            break;
          case ']':
          case '=':
          case '+':
            // Faster (-10ms delay)
            this.setSpeed(this.selectedSpeed - 10, true);
            break;

          // Number keys 1-5 for instant speed presets
          case '1':
            this.setSpeed(150, true);
            break;
          case '2':
            this.setSpeed(120, true);
            break;
          case '3':
            this.setSpeed(90, true);
            break;
          case '4':
            this.setSpeed(65, true);
            break;
          case '5':
            this.setSpeed(40, true);
            break;
        }
      });

      // 2. Sound & Pause Buttons
      this.soundBtn.addEventListener('click', () => {
        this.audio.init();
        this.audio.toggleMute();
        this.updateSoundBtnIcon();
      });

      this.pauseBtn.addEventListener('click', () => {
        this.audio.init();
        this.togglePause();
      });

      // 3. Real-Time Speed Slider Event
      if (this.speedSlider) {
        this.speedSlider.addEventListener('input', (e) => {
          this.audio.init();
          const speedValue = parseInt(e.target.value, 10);
          this.setSpeed(speedValue, false);
        });
      }

      // 4. Speed Preset Buttons (Chill, Relax, Normal, Fast, Ludicrous)
      this.diffButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.audio.init();
          this.audio.playClick();
          const speedValue = parseInt(btn.dataset.speed, 10);
          this.setSpeed(speedValue, true);
        });
      });

      // 5. Header Speed Pill Button (Quick toggle/collapse speed bar)
      if (this.speedToggleBtn) {
        this.speedToggleBtn.addEventListener('click', () => {
          this.audio.init();
          this.audio.playClick();
          if (this.quickSpeedBar) {
            this.quickSpeedBar.classList.toggle('collapsed');
          }
        });
      }

      // 6. Skin Swatches (Start & Pause screens)
      this.skinSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
          this.audio.init();
          this.audio.playClick();
          const skinKey = swatch.dataset.skin;
          this.setSkin(skinKey);
          if (this.state !== GAME_STATES.PLAYING) {
            this.drawGrid();
            this.drawFood();
            this.drawSnake();
          }
        });
      });

      // 7. Header Skin Button
      if (this.skinToggleBtn) {
        this.skinToggleBtn.addEventListener('click', () => {
          this.audio.init();
          this.audio.playClick();
          // Cycle through skins
          const skinKeys = Object.keys(SKINS);
          const currentIndex = skinKeys.indexOf(this.currentSkin);
          const nextIndex = (currentIndex + 1) % skinKeys.length;
          this.setSkin(skinKeys[nextIndex]);
          if (this.state !== GAME_STATES.PLAYING) {
            this.drawGrid();
            this.drawFood();
            this.drawSnake();
          }
        });
      }

      // 8. Overlay Action Buttons
      this.startBtn.addEventListener('click', () => this.startGame());
      this.resumeBtn.addEventListener('click', () => this.resumeGame());
      this.restartPauseBtn.addEventListener('click', () => this.startGame());
      this.retryBtn.addEventListener('click', () => this.startGame());

      // 9. Touch & Swipe gestures on Canvas
      let touchStartX = 0;
      let touchStartY = 0;
      const minSwipeDistance = 22;

      this.canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }, { passive: true });

      this.canvas.addEventListener('touchend', (e) => {
        if (this.state !== GAME_STATES.PLAYING) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > minSwipeDistance) {
            this.queueDirection(dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
          }
        } else {
          if (Math.abs(dy) > minSwipeDistance) {
            this.queueDirection(dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
          }
        }
      }, { passive: true });

      // 10. Mobile Virtual D-Pad Buttons
      const dpadButtons = document.querySelectorAll('.dpad-btn[data-dir]');
      dpadButtons.forEach(btn => {
        const handlePress = (e) => {
          e.preventDefault();
          this.audio.init();
          const dirKey = btn.dataset.dir;
          if (DIRECTIONS[dirKey] && this.state === GAME_STATES.PLAYING) {
            this.queueDirection(DIRECTIONS[dirKey]);
          }
        };
        btn.addEventListener('touchstart', handlePress, { passive: false });
        btn.addEventListener('mousedown', handlePress);
      });
    }
  }

  // Launch on DOM ready
  window.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
  });
})();
