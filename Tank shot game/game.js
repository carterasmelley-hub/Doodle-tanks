(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const ui = {
    turnCounter: document.getElementById("turn-counter"),
    angleSlider: document.getElementById("angle-slider"),
    powerSlider: document.getElementById("power-slider"),
    angleValue: document.getElementById("angle-value"),
    powerValue: document.getElementById("power-value"),
    moveValue: document.getElementById("move-value"),
    moveFill: document.getElementById("move-fill"),
    sniperBtn: document.getElementById("sniper-btn"),
    sniperCount: document.getElementById("sniper-count"),
    teleportBtn: document.getElementById("teleport-btn"),
    teleportCount: document.getElementById("teleport-count"),
    earthquakeBtn: document.getElementById("earthquake-btn"),
    earthquakeCount: document.getElementById("earthquake-count"),
    airstrikeBtn: document.getElementById("airstrike-btn"),
    airstrikeCount: document.getElementById("airstrike-count"),
    laserBtn: document.getElementById("laser-btn"),
    laserCount: document.getElementById("laser-count"),
    fireBtn: document.getElementById("fire-btn"),
    statusPill: document.getElementById("status-pill"),
    menuScreen: document.getElementById("menu-screen"),
    mainMenuCard: document.getElementById("main-menu-card"),
    customMenuCard: document.getElementById("custom-menu-card"),
    quickStartBtn: document.getElementById("quick-start-btn"),
    openCustomBtn: document.getElementById("open-custom-btn"),
    menuSettingsBtn: document.getElementById("menu-settings-btn"),
    backMainBtn: document.getElementById("back-main-btn"),
    pauseMenu: document.getElementById("pause-menu"),
    resumeBtn: document.getElementById("resume-btn"),
    pauseRestartBtn: document.getElementById("pause-restart-btn"),
    pauseMainBtn: document.getElementById("pause-main-btn"),
    pauseSettingsBtn: document.getElementById("pause-settings-btn"),
    pauseHelpBtn: document.getElementById("pause-help-btn"),
    pauseHelp: document.getElementById("pause-help"),
    pauseMapBtn: document.getElementById("pause-map-btn"),
    startBtn: document.getElementById("start-btn"),
    humanPlayersBtn: document.getElementById("human-players-btn"),
    mapSizeSelect: document.getElementById("map-size-select"),
    playerCountLabel: document.getElementById("player-count-label"),
    enemyCountLabel: document.getElementById("enemy-count-label"),
    aiDifficultyLabel: document.getElementById("ai-difficulty-label"),
    playerCountSelect: document.getElementById("player-count-select"),
    enemyCountSelect: document.getElementById("enemy-count-select"),
    aiDifficultySelect: document.getElementById("ai-difficulty-select"),
    healthSelect: document.getElementById("health-select"),
    mapSourceBtn: document.getElementById("map-source-btn"),
    terrainModeBtn: document.getElementById("terrain-mode-btn"),
    settingsPanel: document.getElementById("settings-panel"),
    settingsCloseBtn: document.getElementById("settings-close-btn"),
    fxIntensitySlider: document.getElementById("fx-intensity-slider"),
    fxIntensityValue: document.getElementById("fx-intensity-value"),
    bottomUi: document.getElementById("bottom-ui")
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (min, max) => min + Math.random() * (max - min);
  const degToRad = (deg) => (deg * Math.PI) / 180;
  const clampAimDeg = (deg) => clamp(deg, -179, 179);
  const TAU = Math.PI * 2;

  const MAX_WORLD_W = 2600;
  const WORLD_H = 900;
  const DEFAULT_MAP_SIZE = "normal";

  const TANK_W = 30;
  const TANK_H = 12;
  const BARREL_LEN = 20;
  const MAX_TILT = degToRad(66);
  const HULL_TOP_Y = -TANK_H * 0.54;
  const HULL_BOTTOM_Y = TANK_H * 0.26;
  const HULL_TOP_HALF = TANK_W * 0.58;
  const HULL_BOTTOM_HALF = TANK_W * 0.49;
  const TURRET_X = -TANK_W * 0.33;
  const TURRET_Y = -TANK_H * 1.32;
  const TURRET_W = TANK_W * 0.5;
  const TURRET_H = TANK_H * 0.82;
  const BARREL_OVERLAP = 2.8;

  const GRAVITY = 320;
  const DEFAULT_MAX_HP = 100;
  const MIN_CONFIG_HP = 50;
  const MAX_CONFIG_HP = 500;

  const MIN_POWER = 150;
  const MAX_POWER = 620;
  const DEFAULT_SHOT_POWER = 430;

  const MAX_MOVE_PER_TURN = 92;
  const DRIVE_SPEED = 62;
  const MAX_DRIVE_STEP_UP = 7;
  const MAX_DRIVE_STEP_DOWN = 22;

  const EXPLOSION_RADIUS = 34;
  const EXPLOSION_DAMAGE = 90;
  const MIN_SPLASH_DAMAGE = 10;
  const TERRAIN_CARVE_SCALE = 0.5;
  const CRATER_EDGE_WIDTH = 2.6;
  const MAX_CRATERS = 180;
  const MAX_BURSTS = 10;
  const EDGE_LOOK_MARGIN = 115;
  const EDGE_LOOK_MAX = 460;
  const MAX_POWERUPS_ON_MAP = 3;
  const DRAG_POWER_DISTANCE = 230;
  const DRAG_MIN_DISTANCE = 12;
  const EARTHQUAKE_SHAKE_TIME = 0.68;
  const EARTHQUAKE_SHAKE_AMP = 14;
  const TERRAIN_MAX_STEP = 16;
  const TERRAIN_PIT_DEPTH = 26;
  const TERRAIN_NARROW_PIT_DEPTH = 18;
  const TERRAIN_NARROW_PIT_SLOPE = 11;
  const IMPACT_CRATER_MAX_DEPTH = 64;
  const TERRAIN_SURFACE_MIN_FRAC = 0.1;
  const TERRAIN_SURFACE_MAX_FRAC = 0.73;
  const LASER_DAMAGE = 58;
  const LASER_KNOCKBACK = 130;
  const LASER_TUNNEL_RADIUS = 5;
  const MAX_LASER_CUTS = 36;
  const LASER_CUT_LIFE = 0.42;

  const MAP_PRESETS = {
    small: { width: 1400, amp: 0.96, rough: 0.9, plateau: 0.66, plateauRadius: 92 },
    normal: { width: 1900, amp: 1.14, rough: 1.04, plateau: 0.62, plateauRadius: 120 },
    large: { width: 2600, amp: 1.34, rough: 1.2, plateau: 0.59, plateauRadius: 156 }
  };

  const PLAYER_NAMES = ["Ranger", "Viper", "Atlas", "Echo", "Iris", "Nova"];
  const ENEMY_NAMES = ["Brute", "Cinder", "Hex", "Mara", "Knell", "Rook"];
  const TEAM_COLORS = ["#00ff00", "#ff00ff", "#22a8ff", "#ff9f1a"];
  const TEAM_LABELS = ["P1", "P2", "P3", "P4"];
  const MAP_SOURCE_ORDER = ["random", "drawn"];
  const TERRAIN_MODE_ORDER = ["flat", "hilly", "mountain"];
  const TERRAIN_STYLE = {
    flat: { amp: 0.45, rough: 0.58, base: 0.61, label: "FLAT" },
    hilly: { amp: 1, rough: 1, base: 0.56, label: "HILLY" },
    mountain: { amp: 1.68, rough: 1.44, base: 0.52, label: "MOUNTAIN" }
  };
  const DRAW_MIN_POINTS = 28;

  const AI_PRESETS = {
    easy: {
      samples: 24,
      aimJitter: 15,
      powerJitter: 118,
      earlyScore: 32,
      moveRange: 280,
      fireDelay: 1.34,
      powerupFocus: 0.08,
      powerupSeekRange: 220,
      refinePasses: 0,
      laserChance: 0.12,
      sniperChance: 0.16,
      quakeChance: 0.05,
      teleportChance: 0.08,
      airstrikeChance: 0.15
    },
    normal: {
      samples: 96,
      aimJitter: 5.5,
      powerJitter: 38,
      earlyScore: 12,
      moveRange: 370,
      fireDelay: 1.13,
      powerupFocus: 0.5,
      powerupSeekRange: 360,
      refinePasses: 22,
      laserChance: 0.52,
      sniperChance: 0.5,
      quakeChance: 0.28,
      teleportChance: 0.34,
      airstrikeChance: 0.5
    },
    hard: {
      samples: 180,
      aimJitter: 1.5,
      powerJitter: 13,
      earlyScore: 7,
      moveRange: 455,
      fireDelay: 0.95,
      powerupFocus: 0.82,
      powerupSeekRange: 540,
      refinePasses: 72,
      laserChance: 0.9,
      sniperChance: 0.82,
      quakeChance: 0.62,
      teleportChance: 0.66,
      airstrikeChance: 0.82
    }
  };

  const POWERUP_TYPES = ["sniper", "teleport", "earthquake", "airstrike", "laser", "health"];
  const HEALTH_POWERUP_AMOUNT = 28;
  const EARTHQUAKE_SMOOTH_PASSES = 8;
  const EARTHQUAKE_EROSION_PASSES = 9;

  const keys = new Set();

  const state = {
    phase: "menu",
    worldW: MAP_PRESETS[DEFAULT_MAP_SIZE].width,
    config: {
      humanPlayers: 1,
      mapSize: DEFAULT_MAP_SIZE,
      playerCount: 1,
      enemyCount: 2,
      aiDifficulty: "normal",
      maxHealth: DEFAULT_MAX_HP,
      mapSource: "random",
      terrainMode: "hilly"
    },
    settings: {
      fxIntensity: 0.7
    },
    menuView: "main",
    pauseFromPhase: null,
    teams: [],
    tanks: [],
    activeIndex: 0,
    projectile: null,
    particles: [],
    bursts: [],
    cameraX: 0,
    cameraLookX: 0,
    powerUps: [],
    nextPowerUpId: 1,
    selectedShotType: "normal",
    abilityMode: null,
    rangefinderPendingTargetId: null,
    settleTimer: 0,
    resolveTimeout: 0,
    aiTimer: 0,
    aiPlan: null,
    aiMoveDir: 0,
    winnerTeam: null,
    statusText: "",
    lastImpact: { x: MAP_PRESETS[DEFAULT_MAP_SIZE].width * 0.5, y: WORLD_H * 0.5 },
    surfaceY: [],
    craters: [],
    craterLayersDirty: true,
    currentShotPath: [],
    lastShotPath: [],
    lastShotEnd: null,
    rangefinderHint: null,
    laserCuts: [],
    customSurfaceY: null,
    drawMap: {
      pointerId: null,
      drawing: false,
      points: [],
      previewPoints: [],
      ready: false,
      surface: null
    },
    screenShakeTime: 0,
    screenShakeDuration: 0,
    screenShakeAmp: 0,
    screenShakeX: 0,
    screenShakeY: 0,
    turnCounter: 1,
    turnsIntoRound: 0,
    quakePendingTime: 0,
    audioCtx: null,
    audioMaster: null,
    audioNoiseBuffer: null
  };

  const craterFillCanvas = document.createElement("canvas");
  craterFillCanvas.width = MAX_WORLD_W;
  craterFillCanvas.height = WORLD_H;
  const craterFillCtx = craterFillCanvas.getContext("2d");

  const craterEdgeCanvas = document.createElement("canvas");
  craterEdgeCanvas.width = MAX_WORLD_W;
  craterEdgeCanvas.height = WORLD_H;
  const craterEdgeCtx = craterEdgeCanvas.getContext("2d");

  const pointer = {
    x: 0,
    y: 0,
    initialized: false
  };

  const aimDrag = {
    active: false,
    pointerId: null
  };

  if (ui.powerSlider) {
    ui.powerSlider.min = `${MIN_POWER}`;
    ui.powerSlider.max = `${MAX_POWER}`;
  }

  function setFxIntensity(value) {
    const clamped = clamp(value, 0, 1);
    state.settings.fxIntensity = clamped;
    if (ui.fxIntensitySlider) {
      ui.fxIntensitySlider.value = `${Math.round(clamped * 100)}`;
    }
    if (ui.fxIntensityValue) {
      ui.fxIntensityValue.textContent = `${Math.round(clamped * 100)}%`;
    }
  }

  function getMaxHp() {
    return clamp(Number(state.config.maxHealth || DEFAULT_MAX_HP), MIN_CONFIG_HP, MAX_CONFIG_HP);
  }

  function getMapSourceMode() {
    return MAP_SOURCE_ORDER.includes(state.config.mapSource) ? state.config.mapSource : "random";
  }

  function getTerrainMode() {
    return TERRAIN_MODE_ORDER.includes(state.config.terrainMode) ? state.config.terrainMode : "hilly";
  }

  function refreshMapModeUi() {
    const source = getMapSourceMode();
    const terrainMode = getTerrainMode();

    if (ui.mapSourceBtn) {
      ui.mapSourceBtn.textContent = source === "drawn" ? "DRAWN MAP" : "RANDOM MAP";
    }
    if (ui.terrainModeBtn) {
      const style = TERRAIN_STYLE[terrainMode] || TERRAIN_STYLE.hilly;
      ui.terrainModeBtn.textContent = style.label;
      ui.terrainModeBtn.disabled = source === "drawn";
    }
  }

  function powerToPercent(power) {
    const t = clamp((power - MIN_POWER) / (MAX_POWER - MIN_POWER), 0, 1);
    return Math.round(t * 100);
  }

  function sampleArrayLinear(arr, x) {
    const last = arr.length - 1;
    const px = clamp(x, 0, last);
    const x0 = Math.floor(px);
    const x1 = Math.min(last, x0 + 1);
    const t = px - x0;
    return lerp(arr[x0], arr[x1], t);
  }

  function relaxSurfaceForMobility(surface, passes = 2) {
    if (!surface || surface.length < 5) {
      return surface;
    }

    let arr = surface.slice();
    const last = arr.length - 1;

    for (let pass = 0; pass < passes; pass += 1) {
      const maxStep = TERRAIN_MAX_STEP + pass * 2;

      for (let x = 1; x <= last; x += 1) {
        const d = arr[x] - arr[x - 1];
        if (d > maxStep) {
          arr[x] = arr[x - 1] + maxStep;
        } else if (d < -maxStep) {
          arr[x] = arr[x - 1] - maxStep;
        }
      }
      for (let x = last - 1; x >= 0; x -= 1) {
        const d = arr[x] - arr[x + 1];
        if (d > maxStep) {
          arr[x] = arr[x + 1] + maxStep;
        } else if (d < -maxStep) {
          arr[x] = arr[x + 1] - maxStep;
        }
      }

      const next = arr.slice();
      for (let x = 2; x < last - 1; x += 1) {
        const localAvg = (arr[x - 1] + arr[x + 1]) * 0.5;
        const wideAvg = (arr[x - 2] + arr[x + 2]) * 0.5;
        const target = Math.min(localAvg, wideAvg + 6);
        const depth = arr[x] - target;
        if (depth > TERRAIN_PIT_DEPTH) {
          next[x] = arr[x] - depth * 0.7;
        }
      }

      // Fill narrow V pits so tanks don't get trapped in steep wedges.
      for (let x = 3; x < last - 2; x += 1) {
        const leftSlope = arr[x] - arr[x - 1];
        const rightSlope = arr[x] - arr[x + 1];
        if (leftSlope < TERRAIN_NARROW_PIT_SLOPE || rightSlope < TERRAIN_NARROW_PIT_SLOPE) {
          continue;
        }

        const flankMin = Math.min(arr[x - 3], arr[x - 2], arr[x + 2], arr[x + 3]);
        const pitDepth = arr[x] - flankMin;
        if (pitDepth <= TERRAIN_NARROW_PIT_DEPTH) {
          continue;
        }

        const lift = (pitDepth - TERRAIN_NARROW_PIT_DEPTH) * 0.78;
        next[x] = arr[x] - lift;
      }
      arr = next;
    }

    const minSurfaceY = Math.round(WORLD_H * TERRAIN_SURFACE_MIN_FRAC);
    const maxSurfaceY = Math.round(WORLD_H * TERRAIN_SURFACE_MAX_FRAC);
    return arr.map((yy) => clamp(Math.round(yy), minSurfaceY, maxSurfaceY));
  }

  function ensureAudio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return null;
    }

    if (!state.audioCtx) {
      const ac = new AudioCtx();
      const master = ac.createGain();
      master.gain.value = 0.24;
      master.connect(ac.destination);

      const noiseBuffer = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }

      state.audioCtx = ac;
      state.audioMaster = master;
      state.audioNoiseBuffer = noiseBuffer;
    }

    if (state.audioCtx.state === "suspended") {
      state.audioCtx.resume();
    }
    return state.audioCtx;
  }

  function startScreenShake(duration, amplitude) {
    if (duration <= 0 || amplitude <= 0) {
      return;
    }
    state.screenShakeTime = Math.max(state.screenShakeTime, duration);
    state.screenShakeDuration = Math.max(state.screenShakeDuration, duration);
    state.screenShakeAmp = Math.max(state.screenShakeAmp, amplitude);
  }

  function updateScreenShake(dt) {
    if (state.screenShakeTime <= 0) {
      state.screenShakeTime = 0;
      state.screenShakeDuration = 0;
      state.screenShakeAmp = 0;
      state.screenShakeX = 0;
      state.screenShakeY = 0;
      return;
    }

    state.screenShakeTime = Math.max(0, state.screenShakeTime - dt);
    const t = clamp(state.screenShakeTime / Math.max(0.0001, state.screenShakeDuration), 0, 1);
    const amp = state.screenShakeAmp * t;
    state.screenShakeX = rand(-amp, amp);
    state.screenShakeY = rand(-amp * 0.55, amp * 0.55);
  }

  function playExplosionSound(strength = 1) {
    const ac = ensureAudio();
    if (!ac || !state.audioMaster || !state.audioNoiseBuffer) {
      return;
    }

    const s = clamp(strength, 0.5, 1.7);
    const now = ac.currentTime;

    const noise = ac.createBufferSource();
    noise.buffer = state.audioNoiseBuffer;
    noise.loop = true;
    const band = ac.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.setValueAtTime(420 + 140 * s, now);
    band.Q.value = 0.85;
    const low = ac.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.setValueAtTime(1900 + 700 * s, now);
    const noiseGain = ac.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.18 * s, now + 0.014);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    noise.connect(band);
    band.connect(low);
    low.connect(noiseGain);
    noiseGain.connect(state.audioMaster);

    const tone = ac.createOscillator();
    tone.type = "square";
    tone.frequency.setValueAtTime(230 + 130 * s, now);
    tone.frequency.exponentialRampToValueAtTime(58, now + 0.34);
    const toneGain = ac.createGain();
    toneGain.gain.setValueAtTime(0.11 * s, now);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    tone.connect(toneGain);
    toneGain.connect(state.audioMaster);

    const zap = ac.createOscillator();
    zap.type = "sawtooth";
    zap.frequency.setValueAtTime(900 + 420 * s, now);
    zap.frequency.exponentialRampToValueAtTime(140, now + 0.13);
    const zapGain = ac.createGain();
    zapGain.gain.setValueAtTime(0.055 * s, now);
    zapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    zap.connect(zapGain);
    zapGain.connect(state.audioMaster);

    noise.start(now);
    tone.start(now);
    zap.start(now);
    noise.stop(now + 0.45);
    tone.stop(now + 0.37);
    zap.stop(now + 0.16);
  }

  function playEarthquakeRumble(duration = EARTHQUAKE_SHAKE_TIME) {
    const ac = ensureAudio();
    if (!ac || !state.audioMaster || !state.audioNoiseBuffer) {
      return;
    }

    const now = ac.currentTime;
    const len = clamp(duration, 0.24, 1.3);

    const noise = ac.createBufferSource();
    noise.buffer = state.audioNoiseBuffer;
    noise.loop = true;
    const low = ac.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.setValueAtTime(180, now);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + len);
    noise.connect(low);
    low.connect(gain);
    gain.connect(state.audioMaster);

    const sub = ac.createOscillator();
    sub.type = "triangle";
    sub.frequency.setValueAtTime(42, now);
    sub.frequency.exponentialRampToValueAtTime(28, now + len);
    const subGain = ac.createGain();
    subGain.gain.setValueAtTime(0.05, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + len);
    sub.connect(subGain);
    subGain.connect(state.audioMaster);

    noise.start(now);
    sub.start(now);
    noise.stop(now + len + 0.04);
    sub.stop(now + len + 0.05);
  }

  function getMenuConfig() {
    const humanPlayers = clamp(Number(state.config.humanPlayers || 1), 1, 4);
    const mapSize = ui.mapSizeSelect?.value || DEFAULT_MAP_SIZE;
    const playerCount = clamp(Number(ui.playerCountSelect?.value || 1), 1, 4);
    const enemyCount = clamp(Number(ui.enemyCountSelect?.value || 2), 1, 4);
    const aiDifficulty = ui.aiDifficultySelect?.value || "normal";
    const maxHealth = clamp(Number(ui.healthSelect?.value || DEFAULT_MAX_HP), MIN_CONFIG_HP, MAX_CONFIG_HP);
    return {
      humanPlayers,
      mapSize: MAP_PRESETS[mapSize] ? mapSize : DEFAULT_MAP_SIZE,
      playerCount,
      enemyCount,
      aiDifficulty: AI_PRESETS[aiDifficulty] ? aiDifficulty : "normal",
      maxHealth,
      mapSource: getMapSourceMode(),
      terrainMode: getTerrainMode()
    };
  }

  function refreshHumanPlayersUi() {
    const humanPlayers = clamp(Number(state.config.humanPlayers || 1), 1, 4);
    if (ui.humanPlayersBtn) {
      ui.humanPlayersBtn.textContent = humanPlayers === 1 ? "1 PLAYER" : `${humanPlayers} PLAYERS`;
    }

    const multiplayer = humanPlayers > 1;
    if (ui.playerCountLabel) {
      ui.playerCountLabel.textContent = multiplayer ? "TANKS / PLAYER" : "PLAYER TANKS";
    }
    if (ui.enemyCountLabel) {
      ui.enemyCountLabel.textContent = multiplayer ? "AI TANKS (OFF)" : "ENEMY TANKS";
    }
    if (ui.enemyCountSelect) {
      ui.enemyCountSelect.disabled = multiplayer;
    }
    if (ui.aiDifficultyLabel) {
      ui.aiDifficultyLabel.textContent = multiplayer ? "AI DIFFICULTY (OFF)" : "AI DIFFICULTY";
    }
    if (ui.aiDifficultySelect) {
      ui.aiDifficultySelect.disabled = multiplayer;
    }
  }

  function cycleHumanPlayers() {
    const current = clamp(Number(state.config.humanPlayers || 1), 1, 4);
    state.config.humanPlayers = current >= 4 ? 1 : current + 1;
    refreshHumanPlayersUi();
  }

  function cycleMapSourceMode() {
    const current = getMapSourceMode();
    const idx = MAP_SOURCE_ORDER.indexOf(current);
    const next = MAP_SOURCE_ORDER[(idx + 1) % MAP_SOURCE_ORDER.length];
    state.config.mapSource = next;
    refreshMapModeUi();
  }

  function cycleTerrainMode() {
    const current = getTerrainMode();
    const idx = TERRAIN_MODE_ORDER.indexOf(current);
    const next = TERRAIN_MODE_ORDER[(idx + 1) % TERRAIN_MODE_ORDER.length];
    state.config.terrainMode = next;
    refreshMapModeUi();
  }

  function syncMenuControls() {
    refreshHumanPlayersUi();
    refreshMapModeUi();
    if (ui.mapSizeSelect) {
      ui.mapSizeSelect.value = state.config.mapSize;
    }
    if (ui.playerCountSelect) {
      ui.playerCountSelect.value = `${state.config.playerCount}`;
    }
    if (ui.enemyCountSelect) {
      ui.enemyCountSelect.value = `${state.config.enemyCount}`;
    }
    if (ui.aiDifficultySelect) {
      ui.aiDifficultySelect.value = state.config.aiDifficulty;
    }
    if (ui.healthSelect) {
      ui.healthSelect.value = `${getMaxHp()}`;
    }
  }

  function applyMenuConfig() {
    state.config = getMenuConfig();
    const preset = MAP_PRESETS[state.config.mapSize] || MAP_PRESETS[DEFAULT_MAP_SIZE];
    state.worldW = preset.width;
  }

  function getMatchTeamSpecs() {
    const humanPlayers = clamp(Number(state.config.humanPlayers || 1), 1, 4);
    const teams = [];

    if (humanPlayers <= 1) {
      teams.push({
        id: "team1",
        name: "Player",
        color: TEAM_COLORS[0],
        controller: "human",
        tankCount: clamp(state.config.playerCount, 1, 4),
        slot: 0
      });
      teams.push({
        id: "team2",
        name: "Enemy",
        color: TEAM_COLORS[1],
        controller: "ai",
        tankCount: clamp(state.config.enemyCount, 1, 4),
        slot: 1
      });
      return teams;
    }

    const tanksPerPlayer = clamp(state.config.playerCount, 1, 4);
    for (let i = 0; i < humanPlayers; i += 1) {
      teams.push({
        id: `team${i + 1}`,
        name: TEAM_LABELS[i] || `P${i + 1}`,
        color: TEAM_COLORS[i] || TEAM_COLORS[TEAM_COLORS.length - 1],
        controller: "human",
        tankCount: tanksPerPlayer,
        slot: i
      });
    }
    return teams;
  }

  function getAiPreset() {
    return AI_PRESETS[state.config.aiDifficulty] || AI_PRESETS.normal;
  }

  function pickRandomPowerupType() {
    return POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  }

  function spawnPowerUp(type = null) {
    if (state.powerUps.length >= MAX_POWERUPS_ON_MAP) {
      return false;
    }

    const kind = type || pickRandomPowerupType();
    const r = 11;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const x = rand(state.worldW * 0.08, state.worldW * 0.92);
      const y = rand(90, Math.min(WORLD_H * 0.34, 250));
      let valid = true;
      for (const p of state.powerUps) {
        if (Math.hypot(p.x - x, p.y - y) < p.r + r + 16) {
          valid = false;
          break;
        }
      }
      if (!valid) {
        continue;
      }
      state.powerUps.push({ id: state.nextPowerUpId++, type: kind, x, y, r });
      return true;
    }

    return false;
  }

  function setMenuView(view) {
    state.menuView = view === "custom" ? "custom" : "main";
    if (ui.mainMenuCard) {
      ui.mainMenuCard.classList.toggle("hidden", state.menuView !== "main");
    }
    if (ui.customMenuCard) {
      ui.customMenuCard.classList.toggle("hidden", state.menuView !== "custom");
    }
  }

  function setSettingsOpen(open) {
    if (!ui.settingsPanel) {
      return;
    }
    ui.settingsPanel.classList.toggle("hidden", !open);
  }

  function setPauseHelpOpen(open) {
    if (!ui.pauseHelp) {
      return;
    }
    ui.pauseHelp.classList.toggle("hidden", !open);
    if (ui.pauseHelpBtn) {
      ui.pauseHelpBtn.textContent = open ? "HIDE HELP" : "HELP";
    }
  }

  function setPauseOpen(open) {
    if (!ui.pauseMenu) {
      return;
    }

    if (open) {
      if (state.phase === "menu" || state.phase === "paused") {
        return;
      }
      state.pauseFromPhase = state.phase;
      state.phase = "paused";
      ui.pauseMenu.classList.remove("hidden");
      setPauseHelpOpen(false);
      setStatus("Paused");
      return;
    }

    ui.pauseMenu.classList.add("hidden");
    setPauseHelpOpen(false);
    if (state.phase === "paused") {
      state.phase = state.pauseFromPhase || "aim";
      state.pauseFromPhase = null;
    }
  }

  function togglePause() {
    if (state.phase === "menu") {
      return;
    }
    setPauseOpen(state.phase !== "paused");
  }

  function clampCamera(x) {
    const max = state.worldW - canvas.width;
    if (max >= 0) {
      return clamp(x, 0, max);
    }
    return max * 0.5;
  }

  function makeTank({ id, name, team, x, color, controller, teamName }) {
    return {
      id,
      name,
      team,
      teamName: teamName || team,
      controller: controller || "human",
      color,
      x,
      y: 0,
      vx: 0,
      vy: 0,
      angle: x < state.worldW * 0.5 ? 40 : 140,
      power: DEFAULT_SHOT_POWER,
      moveRemaining: MAX_MOVE_PER_TURN,
      hp: getMaxHp(),
      alive: true,
      tilt: 0,
      lastShotPath: [],
      lastShotEnd: null,
      powerups: {
        sniper: 0,
        teleport: 0,
        earthquake: 0,
        airstrike: 0,
        laser: 0
      }
    };
  }

  function getActiveTank() {
    return state.tanks[state.activeIndex] || null;
  }

  function getTankById(id) {
    return state.tanks.find((tank) => tank.id === id) || null;
  }

  function getAliveTeamCount(team) {
    return state.tanks.filter((tank) => tank.alive && tank.team === team).length;
  }

  function setStatus(text) {
    state.statusText = text;
    if (ui.statusPill) {
      ui.statusPill.textContent = text;
    }
  }

  function openMenu() {
    state.phase = "menu";
    state.pauseFromPhase = null;
    state.projectile = null;
    state.particles = [];
    state.bursts = [];
    state.powerUps = [];
    state.cameraLookX = 0;
    state.selectedShotType = "normal";
    clearAbilityMode();
    setAimDragActive(false);
    state.currentShotPath = [];
    state.rangefinderHint = null;
    state.laserCuts = [];
    state.customSurfaceY = null;
    state.drawMap.pointerId = null;
    state.drawMap.drawing = false;
    state.drawMap.points = [];
    state.drawMap.previewPoints = [];
    state.drawMap.ready = false;
    state.drawMap.surface = null;
    state.quakePendingTime = 0;
    state.screenShakeTime = 0;
    state.screenShakeDuration = 0;
    state.screenShakeAmp = 0;
    state.screenShakeX = 0;
    state.screenShakeY = 0;
    state.turnCounter = 1;
    state.turnsIntoRound = 0;
    keys.clear();
    ui.menuScreen.classList.remove("hidden");
    if (ui.pauseMenu) {
      ui.pauseMenu.classList.add("hidden");
    }
    setPauseHelpOpen(false);
    document.body.classList.remove("in-game");
    setSettingsOpen(false);
    setMenuView("main");
    syncMenuControls();
    setStatus("Select a match");
  }

  function enterInGameShell() {
    setSettingsOpen(false);
    if (ui.pauseMenu) {
      ui.pauseMenu.classList.add("hidden");
    }
    state.pauseFromPhase = null;
    ui.menuScreen.classList.add("hidden");
    document.body.classList.add("in-game");
  }

  function launchMatchSession() {
    enterInGameShell();
    resetMatch();
  }

  function beginDrawMapPhase() {
    state.customSurfaceY = null;
    state.phase = "draw_map";
    state.teams = [];
    state.tanks = [];
    state.activeIndex = 0;
    state.projectile = null;
    state.particles = [];
    state.bursts = [];
    state.powerUps = [];
    state.craters = [];
    state.craterLayersDirty = true;
    state.currentShotPath = [];
    state.lastShotPath = [];
    state.lastShotEnd = null;
    state.rangefinderHint = null;
    state.laserCuts = [];
    state.abilityMode = null;
    state.selectedShotType = "normal";
    state.drawMap.pointerId = null;
    state.drawMap.drawing = false;
    state.drawMap.points = [];
    state.drawMap.previewPoints = [];
    state.drawMap.ready = false;
    state.drawMap.surface = null;
    state.quakePendingTime = 0;
    state.surfaceY = new Array(state.worldW).fill(Math.round(WORLD_H * 0.62));
    state.cameraX = clampCamera(state.worldW * 0.5 - canvas.width * 0.5);
    state.cameraLookX = 0;
    state.screenShakeTime = 0;
    state.screenShakeDuration = 0;
    state.screenShakeAmp = 0;
    state.screenShakeX = 0;
    state.screenShakeY = 0;
    keys.clear();
    setStatus("Draw one continuous line from left edge to right edge");
    enterInGameShell();
    updateUi();
  }

  function startGame() {
    applyMenuConfig();
    if (state.config.mapSource === "drawn") {
      beginDrawMapPhase();
      return;
    }
    state.customSurfaceY = null;
    launchMatchSession();
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (!pointer.initialized) {
      pointer.x = canvas.width * 0.5;
      pointer.y = canvas.height * 0.5;
    }
  }

  function pathRoundedRect(context, x, y, w, h, r) {
    const rr = Math.min(r, Math.abs(w) * 0.5, Math.abs(h) * 0.5);
    context.beginPath();
    context.moveTo(x + rr, y);
    context.lineTo(x + w - rr, y);
    context.quadraticCurveTo(x + w, y, x + w, y + rr);
    context.lineTo(x + w, y + h - rr);
    context.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    context.lineTo(x + rr, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - rr);
    context.lineTo(x, y + rr);
    context.quadraticCurveTo(x, y, x + rr, y);
    context.closePath();
  }

  function spreadSpawnXs(startPct, endPct, count, worldW) {
    if (count <= 1) {
      return [Math.floor(worldW * ((startPct + endPct) * 0.5))];
    }

    const xs = [];
    const start = worldW * startPct;
    const end = worldW * endPct;
    for (let i = 0; i < count; i += 1) {
      const t = count > 1 ? i / (count - 1) : 0.5;
      xs.push(Math.floor(lerp(start, end, t)));
    }
    return xs;
  }

  function clampDrawY(y) {
    const gameplayBottom = getGameplayBottomY();
    return clamp(y, 14, gameplayBottom - 14);
  }

  function resetDrawMapStroke() {
    state.drawMap.pointerId = null;
    state.drawMap.drawing = false;
    state.drawMap.points = [];
    state.drawMap.previewPoints = [];
    state.drawMap.ready = false;
    state.drawMap.surface = null;
    state.customSurfaceY = null;
    state.surfaceY = new Array(state.worldW).fill(Math.round(WORLD_H * 0.62));
    state.craters = [];
    state.craterLayersDirty = true;
  }

  function appendDrawPoint(worldX, worldY) {
    const x = clamp(worldX, 0, state.worldW - 1);
    const y = clampDrawY(worldY);
    const points = state.drawMap.points;
    const last = points[points.length - 1];
    if (!last || Math.hypot(x - last.x, y - last.y) >= 2.2) {
      points.push({ x, y });
    }
  }

  function buildSurfaceFromDrawPoints(points, worldW) {
    const surface = new Array(worldW).fill(null);
    const weight = new Array(worldW).fill(0);

    for (let i = 1; i < points.length; i += 1) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const steps = Math.max(1, Math.ceil(Math.abs(dx)));
      for (let s = 0; s <= steps; s += 1) {
        const t = s / steps;
        const x = p0.x + dx * t;
        const y = p0.y + dy * t;
        const xi = clamp(Math.round(x), 0, worldW - 1);
        surface[xi] = (surface[xi] || 0) + y;
        weight[xi] += 1;
      }
    }

    for (let x = 0; x < worldW; x += 1) {
      if (weight[x] > 0) {
        surface[x] /= weight[x];
      }
    }

    let leftKnown = -1;
    for (let x = 0; x < worldW; x += 1) {
      if (surface[x] != null) {
        if (leftKnown === -1) {
          for (let k = 0; k < x; k += 1) {
            surface[k] = surface[x];
          }
        } else {
          const rightY = surface[x];
          const leftY = surface[leftKnown];
          const span = x - leftKnown;
          for (let k = leftKnown + 1; k < x; k += 1) {
            surface[k] = lerp(leftY, rightY, (k - leftKnown) / span);
          }
        }
        leftKnown = x;
      }
    }
    if (leftKnown >= 0) {
      for (let x = leftKnown + 1; x < worldW; x += 1) {
        surface[x] = surface[leftKnown];
      }
    }

    for (let pass = 0; pass < 6; pass += 1) {
      for (let x = 1; x < worldW - 1; x += 1) {
        surface[x] = (surface[x - 1] + surface[x] * 2 + surface[x + 1]) * 0.25;
      }
    }

    return relaxSurfaceForMobility(surface.map((yy) => clamp(Math.round(yy), 0, WORLD_H - 1)), 2);
  }

  function tryFinalizeDrawMap() {
    const points = state.drawMap.points;
    if (!points || points.length < DRAW_MIN_POINTS) {
      setStatus("Draw failed: make one continuous line across the whole map");
      return false;
    }

    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let travelX = 0;
    for (let i = 0; i < points.length; i += 1) {
      minX = Math.min(minX, points[i].x);
      maxX = Math.max(maxX, points[i].x);
      if (i > 0) {
        travelX += Math.abs(points[i].x - points[i - 1].x);
      }
    }

    const first = points[0];
    const last = points[points.length - 1];
    const edgeMargin = Math.max(24, state.worldW * 0.04);
    const touchesLeft = minX <= edgeMargin;
    const touchesRight = maxX >= state.worldW - edgeMargin;
    const spansAcross = touchesLeft && touchesRight && travelX >= state.worldW * 0.75;
    const continuousDirection =
      (first.x <= edgeMargin && last.x >= state.worldW - edgeMargin) ||
      (last.x <= edgeMargin && first.x >= state.worldW - edgeMargin);

    if (!spansAcross || !continuousDirection) {
      resetDrawMapStroke();
      setStatus("Draw failed: start at one edge and finish at the opposite edge in one stroke");
      return false;
    }

    const built = buildSurfaceFromDrawPoints(points, state.worldW);
    state.drawMap.previewPoints = points.slice();
    state.drawMap.surface = built;
    state.drawMap.ready = true;
    state.surfaceY = built.slice();
    state.craters = [];
    state.craterLayersDirty = true;
    setStatus("Map ready: press USE MAP or Space");
    return true;
  }

  function confirmDrawnMapAndStart() {
    if (state.phase !== "draw_map") {
      return;
    }
    if (!state.drawMap.ready || !state.drawMap.surface) {
      setStatus("Draw a continuous line from one edge to the other first");
      return;
    }
    state.customSurfaceY = state.drawMap.surface.slice();
    launchMatchSession();
  }

  function generateTerrain(teamSpecs) {
    const worldW = state.worldW;
    const preset = MAP_PRESETS[state.config.mapSize] || MAP_PRESETS[DEFAULT_MAP_SIZE];
    const useDrawnMap = state.config.mapSource === "drawn" && Array.isArray(state.customSurfaceY) && state.customSurfaceY.length === worldW;
    const style = TERRAIN_STYLE[getTerrainMode()] || TERRAIN_STYLE.hilly;
    let heights;

    if (useDrawnMap) {
      heights = state.customSurfaceY.slice();
    } else {
      heights = new Array(worldW);
      let h = WORLD_H * style.base;
      let slope = 0;

      for (let x = 0; x < worldW; x += 1) {
        slope += (Math.random() - 0.5) * (1.36 * preset.rough * style.rough);
        slope *= 0.955;
        h += slope;
        h = clamp(h, WORLD_H * 0.14, WORLD_H * 0.72);
        heights[x] =
          h -
          Math.sin(x * 0.0028) * (114 * preset.amp * style.amp) -
          Math.sin(x * 0.0089 + 1.1) * (54 * preset.amp * style.amp);
      }
    }

    const clampedTeams = teamSpecs && teamSpecs.length ? teamSpecs : getMatchTeamSpecs();
    const spawnByTeam = {};
    const allSpawns = [];
    const teamCount = clampedTeams.length;

    for (let i = 0; i < teamCount; i += 1) {
      const team = clampedTeams[i];
      const bandStart = 0.07 + (0.86 * i) / teamCount;
      const bandEnd = 0.07 + (0.86 * (i + 1)) / teamCount;
      const innerStart = Math.min(0.97, bandStart + 0.03);
      const innerEnd = Math.max(0.03, bandEnd - 0.03);
      const spawns = spreadSpawnXs(innerStart, innerEnd, team.tankCount, worldW);
      spawnByTeam[team.id] = spawns;
      for (const sx of spawns) {
        allSpawns.push(sx);
      }
    }

    if (!useDrawnMap) {
      for (const spawnX of allSpawns) {
        const plateauY = WORLD_H * preset.plateau;
        const radius = preset.plateauRadius;
        for (let x = Math.floor(spawnX - radius); x <= spawnX + radius; x += 1) {
          if (x > 0 && x < worldW) {
            const t = Math.abs(x - spawnX) / radius;
            const influence = 1 - t * t;
            heights[x] = lerp(heights[x], plateauY, clamp(influence * 0.76, 0, 0.76));
          }
        }
      }

      for (let pass = 0; pass < 8; pass += 1) {
        for (let x = 1; x < worldW - 1; x += 1) {
          heights[x] = (heights[x - 1] + heights[x] * 2 + heights[x + 1]) * 0.25;
        }
      }
    }

    state.surfaceY = relaxSurfaceForMobility(heights.map((yy) => clamp(Math.floor(yy), 0, WORLD_H - 1)), useDrawnMap ? 1 : 3);
    state.craters = [];
    state.craterLayersDirty = true;

    return spawnByTeam;
  }

  function makeCraterStamp(x, y, r) {
    const rr = Math.max(2, r);
    return {
      x,
      y,
      r: rr,
      r2: rr * rr,
      minX: x - rr,
      maxX: x + rr,
      minY: y - rr,
      maxY: y + rr
    };
  }

  function pushCraterStamp(x, y, r) {
    const cx = clamp(x, 0, state.worldW - 1);
    const cy = clamp(y, 0, WORLD_H - 1);
    state.craters.push(makeCraterStamp(cx, cy, r));
    if (state.craters.length > MAX_CRATERS) {
      state.craters.splice(0, state.craters.length - MAX_CRATERS);
    }
  }

  function stampImpactCrater(ix, iy, radius) {
    const xi = clamp(Math.floor(ix), 0, state.worldW - 1);
    const baseY = state.surfaceY[xi] ?? iy;
    const cupY = Math.max(iy + radius * 0.36, baseY + radius * 0.28);
    const cappedStamp = (sx, sy, sr) => {
      const sxi = clamp(Math.floor(sx), 0, state.worldW - 1);
      const surfY = state.surfaceY[sxi] ?? sy;
      const maxY = surfY + IMPACT_CRATER_MAX_DEPTH + sr * 0.5;
      pushCraterStamp(sx, Math.min(sy, maxY), sr);
    };

    // Keep crater bowls broad and readable without creating deep trap shafts.
    cappedStamp(ix, cupY, radius * 0.96);
    cappedStamp(ix + rand(-radius * 0.1, radius * 0.1), cupY + radius * 0.46, radius * 0.62);
    cappedStamp(ix - radius * 0.52 + rand(-radius * 0.1, radius * 0.1), cupY + radius * 0.2, radius * 0.36);
    cappedStamp(ix + radius * 0.52 + rand(-radius * 0.1, radius * 0.1), cupY + radius * 0.2, radius * 0.36);
    cappedStamp(ix + rand(-radius * 0.24, radius * 0.24), cupY + radius * 0.76, radius * 0.3);
  }

  function isVoidAt(x, y) {
    for (const crater of state.craters) {
      if (x < crater.minX || x > crater.maxX || y < crater.minY || y > crater.maxY) {
        continue;
      }
      const dx = x - crater.x;
      const dy = y - crater.y;
      if (dx * dx + dy * dy <= crater.r2) {
        return true;
      }
    }
    return false;
  }

  function supportY(x) {
    const xi = clamp(Math.floor(x), 0, state.worldW - 1);
    let y = state.surfaceY[xi] ?? WORLD_H - 1;

    let guard = 260;
    while (guard > 0 && isVoidAt(xi, y + 1)) {
      y += 1;
      guard -= 1;
      if (y >= WORLD_H - 1) {
        break;
      }
    }

    return clamp(y, 0, WORLD_H - 1);
  }

  function rebuildCraterLayers() {
    if (!state.craterLayersDirty) {
      return;
    }

    craterFillCtx.clearRect(0, 0, MAX_WORLD_W, WORLD_H);
    craterEdgeCtx.clearRect(0, 0, MAX_WORLD_W, WORLD_H);

    if (state.craters.length > 0) {
      craterFillCtx.fillStyle = "#6a6a6a";
      for (const crater of state.craters) {
        craterFillCtx.beginPath();
        craterFillCtx.arc(crater.x, crater.y, crater.r, 0, TAU);
        craterFillCtx.fill();
      }

      craterEdgeCtx.fillStyle = "#000000";
      for (const crater of state.craters) {
        craterEdgeCtx.beginPath();
        craterEdgeCtx.arc(crater.x, crater.y, crater.r, 0, TAU);
        craterEdgeCtx.fill();
      }

      craterEdgeCtx.globalCompositeOperation = "destination-out";
      for (const crater of state.craters) {
        const innerR = crater.r - CRATER_EDGE_WIDTH;
        if (innerR <= 0) {
          continue;
        }
        craterEdgeCtx.beginPath();
        craterEdgeCtx.arc(crater.x, crater.y, innerR, 0, TAU);
        craterEdgeCtx.fill();
      }
      craterEdgeCtx.globalCompositeOperation = "source-over";
    }

    state.craterLayersDirty = false;
  }

  function isTerrainSolid(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);

    if (xi < 0 || xi >= state.worldW) {
      return false;
    }
    if (yi < 0) {
      return false;
    }
    if (yi >= WORLD_H) {
      return true;
    }

    if (yi < supportY(xi)) {
      return false;
    }
    return !isVoidAt(xi, yi);
  }

  function getTankTiltTarget(tank) {
    const leftX = tank.x - TANK_W * 0.43;
    const rightX = tank.x + TANK_W * 0.43;
    let leftY = 0;
    let rightY = 0;
    let count = 0;
    for (let ox = -2; ox <= 2; ox += 2) {
      leftY += supportY(leftX + ox);
      rightY += supportY(rightX + ox);
      count += 1;
    }
    leftY /= count;
    rightY /= count;
    const raw = Math.atan2(rightY - leftY, rightX - leftX);
    return clamp(raw, -MAX_TILT, MAX_TILT);
  }

  function updateTankTilt(tank, dt) {
    const target = hasGroundUnderTank(tank) ? getTankTiltTarget(tank) : 0;
    const next = lerp(tank.tilt, target, clamp(dt * 10, 0, 1));
    tank.tilt = Math.abs(next - target) < 0.002 ? target : next;
  }

  function placeTankOnGround(tank) {
    tank.y = supportY(tank.x) - TANK_H * 0.5 - 1;
    tank.tilt = getTankTiltTarget(tank);
  }

  function hasGroundUnderTank(tank) {
    const footY = tank.y + TANK_H * 0.5 + 1;
    let contacts = 0;
    for (let sx = -TANK_W * 0.4; sx <= TANK_W * 0.4; sx += 4) {
      const groundY = supportY(tank.x + sx);
      if (footY >= groundY - 2 && footY <= groundY + 8) {
        contacts += 1;
      }
    }
    return contacts > 0;
  }

  function tankCollidesTerrain(tank) {
    for (let y = -TANK_H * 0.5 + 1; y <= TANK_H * 0.5 - 1; y += 2) {
      for (let x = -TANK_W * 0.46; x <= TANK_W * 0.46; x += 3) {
        if (isTerrainSolid(tank.x + x, tank.y + y)) {
          return true;
        }
      }
    }
    return false;
  }

  function resolveTankTerrain(tank) {
    tank.x = clamp(tank.x, TANK_W * 0.6, state.worldW - TANK_W * 0.6);

    let tries = 0;
    while (tankCollidesTerrain(tank) && tries < 70) {
      tank.y -= 1;
      tank.vy = Math.min(0, tank.vy);
      tries += 1;
    }

    if (tank.y > WORLD_H + 120) {
      tank.alive = false;
      tank.hp = 0;
    }
  }

  function getMuzzleData(tank, shotAngle = tank.angle) {
    const bodyTilt = tank.tilt || 0;
    const bodyTiltDeg = (bodyTilt * 180) / Math.PI;
    const worldDeg = clampAimDeg(shotAngle);
    const worldRad = degToRad(worldDeg);
    const localRad = degToRad(worldDeg + bodyTiltDeg);

    const localBaseX = TURRET_X + TURRET_W * 0.5;
    const localBaseY = TURRET_Y + TURRET_H * 0.52;
    const cosT = Math.cos(bodyTilt);
    const sinT = Math.sin(bodyTilt);
    const baseX = tank.x + localBaseX * cosT - localBaseY * sinT;
    const baseY = tank.y + localBaseX * sinT + localBaseY * cosT;

    return {
      x: baseX + Math.cos(worldRad) * BARREL_LEN,
      y: baseY - Math.sin(worldRad) * BARREL_LEN,
      rad: worldRad,
      localRad,
      baseX,
      baseY
    };
  }

  function resetMatch() {
    const teamSpecs = getMatchTeamSpecs();
    const spawnsByTeam = generateTerrain(teamSpecs);
    const tanks = [];
    state.teams = teamSpecs.map((team) => ({ id: team.id, name: team.name, color: team.color, controller: team.controller }));
    let id = 0;

    for (const team of teamSpecs) {
      const teamSpawns = spawnsByTeam[team.id] || [];
      for (let i = 0; i < teamSpawns.length; i += 1) {
        let tankName = `${team.name}-${i + 1}`;
        if (team.controller === "human" && team.id === "team1") {
          tankName = PLAYER_NAMES[i] || tankName;
        } else if (team.controller === "ai") {
          tankName = ENEMY_NAMES[i] || tankName;
        }

        tanks.push(
          makeTank({
            id,
            name: tankName,
            team: team.id,
            teamName: team.name,
            controller: team.controller,
            x: teamSpawns[i],
            color: team.color
          })
        );
        id += 1;
      }
    }

    state.tanks = tanks;

    for (const tank of state.tanks) {
      tank.vx = 0;
      tank.vy = 0;
      tank.moveRemaining = MAX_MOVE_PER_TURN;
      placeTankOnGround(tank);
    }

    state.activeIndex = 0;
    state.projectile = null;
    state.particles = [];
    state.bursts = [];
    state.powerUps = [];
    state.nextPowerUpId = 1;
    state.selectedShotType = "normal";
    clearAbilityMode();
    state.currentShotPath = [];
    state.lastShotPath = [];
    state.lastShotEnd = null;
    state.rangefinderHint = null;
    state.laserCuts = [];
    state.drawMap.pointerId = null;
    state.drawMap.drawing = false;
    state.drawMap.points = [];
    state.drawMap.previewPoints = [];
    state.drawMap.ready = false;
    state.drawMap.surface = null;
    state.winnerTeam = null;
    state.settleTimer = 0;
    state.resolveTimeout = 0;
    state.aiTimer = 0;
    state.aiPlan = null;
    state.aiMoveDir = 0;
    state.quakePendingTime = 0;
    state.screenShakeTime = 0;
    state.screenShakeDuration = 0;
    state.screenShakeAmp = 0;
    state.screenShakeX = 0;
    state.screenShakeY = 0;
    state.turnCounter = 1;
    state.turnsIntoRound = 0;
    state.lastImpact = { x: state.worldW * 0.5, y: WORLD_H * 0.5 };
    state.cameraX = clampCamera(state.tanks[0].x - canvas.width * 0.5);
    state.cameraLookX = 0;

    if (Math.random() < 0.8) {
      spawnPowerUp();
    }
    if (Math.random() < 0.35) {
      spawnPowerUp();
    }

    configureTurn();
    updateUi();
  }

  function checkGameOver() {
    const aliveTeams = [...new Set(state.tanks.filter((tank) => tank.alive).map((tank) => tank.team))];
    if (aliveTeams.length > 1) {
      return false;
    }

    state.phase = "gameover";
    if (aliveTeams.length === 1) {
      state.winnerTeam = aliveTeams[0];
      const winnerTank = state.tanks.find((tank) => tank.alive && tank.team === aliveTeams[0]);
      if (state.config.humanPlayers <= 1) {
        if (winnerTank && winnerTank.controller === "human") {
          setStatus("Victory");
        } else {
          setStatus("Defeat");
        }
      } else {
        setStatus(`${winnerTank?.teamName || "Team"} Wins`);
      }
    } else {
      state.winnerTeam = "draw";
      setStatus("Draw");
    }

    return true;
  }

  function configureTurn() {
    if (checkGameOver()) {
      return;
    }

    const tank = getActiveTank();
    if (!tank || !tank.alive) {
      advanceTurn();
      return;
    }

    tank.vx = 0;
    tank.vy = 0;
    tank.moveRemaining = MAX_MOVE_PER_TURN;
    state.aiTimer = 0;
    state.aiPlan = null;
    state.aiMoveDir = 0;
    setAimDragActive(false);

    if (tank.controller === "human") {
      state.phase = "aim";
      setStatus(`${tank.name}: drag to aim and power, then fire`);
    } else {
      state.phase = "ai";
      setStatus(`${tank.name} is aiming`);
    }

    state.resolveTimeout = 0;
    state.selectedShotType = "normal";
    clearAbilityMode();
    state.rangefinderHint = null;
    if (Math.random() < 0.42) {
      spawnPowerUp();
    }
    syncControlsFromActive();
  }

  function advanceTurn() {
    if (checkGameOver()) {
      return;
    }

    let scheduledRoundQuake = false;
    const aliveCount = state.tanks.filter((tank) => tank.alive).length;
    if (aliveCount > 0) {
      state.turnsIntoRound += 1;
      if (state.turnsIntoRound >= aliveCount) {
        state.turnsIntoRound = 0;
        state.turnCounter += 1;
        if (state.turnCounter % 5 === 0) {
          state.quakePendingTime = Math.max(state.quakePendingTime, EARTHQUAKE_SHAKE_TIME);
          startScreenShake(EARTHQUAKE_SHAKE_TIME, EARTHQUAKE_SHAKE_AMP);
          playEarthquakeRumble(EARTHQUAKE_SHAKE_TIME);
          scheduledRoundQuake = true;
        }
      }
    }

    let next = state.activeIndex;
    let guard = 0;
    do {
      next = (next + 1) % state.tanks.length;
      guard += 1;
    } while (!state.tanks[next].alive && guard < state.tanks.length + 1);

    state.activeIndex = next;
    configureTurn();
    if (scheduledRoundQuake) {
      setStatus(`Turn ${state.turnCounter}: earthquake rumbling...`);
    }
  }

  function isPlayerTurn() {
    const tank = getActiveTank();
    return state.phase === "aim" && tank && tank.controller === "human";
  }

  function syncControlsFromActive() {
    const tank = getActiveTank();
    if (!tank) {
      return;
    }

    const trueAngle = Math.round(getTrueShotAngleDeg(tank));
    if (ui.angleSlider) {
      ui.angleSlider.value = `${trueAngle}`;
    }
    if (ui.powerSlider) {
      ui.powerSlider.value = `${Math.round(tank.power)}`;
    }
    if (ui.angleValue) {
      ui.angleValue.textContent = `${trueAngle}°`;
    }
    if (ui.powerValue) {
      ui.powerValue.textContent = `${powerToPercent(tank.power)}%`;
    }
  }

  function tryDriveTank(tank, direction, dt) {
    if (!tank || !tank.alive || direction === 0 || tank.moveRemaining <= 0) {
      return 0;
    }

    const distance = Math.min(DRIVE_SPEED * dt, tank.moveRemaining);
    if (distance <= 0) {
      return 0;
    }

    const oldX = tank.x;
    const oldSupport = supportY(oldX);
    const targetX = clamp(oldX + direction * distance, TANK_W * 0.6, state.worldW - TANK_W * 0.6);
    const targetSupport = supportY(targetX);
    const rise = oldSupport - targetSupport;
    const drop = targetSupport - oldSupport;

    // Block unrealistic climbing/jumping up steep walls while still allowing downhill movement.
    if (rise > MAX_DRIVE_STEP_UP || drop > MAX_DRIVE_STEP_DOWN) {
      tank.vx = 0;
      return 0;
    }

    tank.x = targetX;
    tank.vx = 0;
    tank.vy = Math.min(tank.vy, 0);
    resolveTankTerrain(tank);

    const used = Math.abs(tank.x - oldX);
    tank.moveRemaining = Math.max(0, tank.moveRemaining - used);
    if (tank.moveRemaining <= 0.1) {
      tank.moveRemaining = 0;
      tank.vx = 0;
    }

    return used;
  }

  function updatePointerFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.initialized = true;
  }

  function applyDragAimToActiveTank(worldX, worldY) {
    const tank = getActiveTank();
    if (!isPlayerTurn() || !tank) {
      return;
    }

    const muzzle = getMuzzleData(tank);
    const dx = worldX - muzzle.baseX;
    const dy = muzzle.baseY - worldY;
    const dist = Math.hypot(dx, dy);
    if (dist < DRAG_MIN_DISTANCE) {
      return;
    }

    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (Number.isFinite(angle)) {
      tank.angle = clampAimDeg(angle);
      const powerT = clamp((dist - DRAG_MIN_DISTANCE) / (DRAG_POWER_DISTANCE - DRAG_MIN_DISTANCE), 0, 1);
      tank.power = clamp(lerp(MIN_POWER, MAX_POWER, powerT), MIN_POWER, MAX_POWER);
      syncControlsFromActive();
    }
  }

  function getTrueShotAngleDeg(tank) {
    if (!tank) {
      return 0;
    }
    return clampAimDeg(tank.angle);
  }

  function setAimDragActive(active, pointerId = null) {
    aimDrag.active = active;
    aimDrag.pointerId = active ? pointerId : null;
  }

  function tankAtPoint(x, y, ownerId = null) {
    for (const tank of state.tanks) {
      if (!tank.alive || tank.id === ownerId) {
        continue;
      }

      const left = tank.x - TANK_W * 0.5;
      const right = tank.x + TANK_W * 0.5;
      const top = tank.y - TANK_H * 1.1;
      const bottom = tank.y + TANK_H * 0.22;

      if (x >= left && x <= right && y >= top && y <= bottom) {
        return tank;
      }
    }
    return null;
  }

  function tankAtWorldPoint(x, y) {
    for (const tank of state.tanks) {
      if (!tank.alive) {
        continue;
      }
      const left = tank.x - TANK_W * 0.62;
      const right = tank.x + TANK_W * 0.62;
      const top = tank.y - TANK_H * 1.46;
      const bottom = tank.y + TANK_H * 0.34;
      if (x >= left && x <= right && y >= top && y <= bottom) {
        return tank;
      }
    }
    return null;
  }

  function powerUpAtPoint(x, y) {
    for (const p of state.powerUps) {
      const dx = x - p.x;
      const dy = y - p.y;
      if (dx * dx + dy * dy <= (p.r + 2) * (p.r + 2)) {
        return p;
      }
    }
    return null;
  }

  function traceCollision(x0, y0, x1, y1, ownerId) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / 1.4));

    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      const sx = x0 + dx * t;
      const sy = y0 + dy * t;

      if (sx < 0 || sx >= state.worldW || sy >= WORLD_H) {
        return { kind: "bounds", x: clamp(sx, 0, state.worldW - 1), y: clamp(sy, 0, WORLD_H - 1) };
      }

      const hitPowerUp = powerUpAtPoint(sx, sy);
      if (hitPowerUp) {
        return { kind: "powerup", x: sx, y: sy, powerup: hitPowerUp };
      }

      if (sy >= 0 && isTerrainSolid(sx, sy)) {
        return { kind: "terrain", x: sx, y: sy };
      }

      const hitTank = tankAtPoint(sx, sy, ownerId);
      if (hitTank) {
        return { kind: "tank", x: sx, y: sy, tank: hitTank };
      }
    }

    return null;
  }

  function finalizeShotPath(ownerId, endX, endY) {
    const owner = getTankById(ownerId);
    if (owner && state.currentShotPath.length > 1) {
      owner.lastShotPath = state.currentShotPath.slice();
      owner.lastShotPath.push({ x: endX, y: endY });
      owner.lastShotEnd = { x: endX, y: endY };
    }
    state.currentShotPath = [];
  }

  function clearAbilityMode() {
    state.abilityMode = null;
    state.rangefinderPendingTargetId = null;
  }

  function grantPowerUp(ownerId, type) {
    const owner = getTankById(ownerId);
    if (!owner) {
      return;
    }

    if (type === "health") {
      const before = owner.hp;
      owner.hp = clamp(owner.hp + HEALTH_POWERUP_AMOUNT, 0, getMaxHp());
      const gained = Math.max(0, Math.round(owner.hp - before));
      if (gained > 0) {
        setStatus(`${owner.name} repaired +${gained} HP`);
      } else {
        setStatus(`${owner.name} is already full HP`);
      }
      return;
    }

    if (!owner.powerups || owner.powerups[type] === undefined) {
      return;
    }
    owner.powerups[type] += 1;
    setStatus(`${owner.name} got ${type.toUpperCase()}`);
  }

  function consumePowerUp(tank, type) {
    if (!tank || !tank.powerups || (tank.powerups[type] || 0) <= 0) {
      return false;
    }
    tank.powerups[type] -= 1;
    return true;
  }

  function applyEarthquake() {
    if (!state.surfaceY || state.surfaceY.length < 3) {
      return;
    }

    const sourceTank = getActiveTank();
    const epicenterX = sourceTank ? sourceTank.x : rand(state.worldW * 0.25, state.worldW * 0.75);
    const last = state.worldW - 1;
    const src = state.surfaceY.slice(0, state.worldW);
    const radius = Math.max(220, state.worldW * 0.68);
    const coreRadius = radius * 0.34;
    const pushPixels = clamp(state.worldW * 0.03, 18, 72);
    const sinkAmp = clamp(WORLD_H * 0.075, 28, 88);
    const rippleAmp = clamp(WORLD_H * 0.055, 22, 62);
    const phase = rand(0, TAU);
    const displaced = new Array(state.worldW);

    for (let x = 0; x <= last; x += 1) {
      const dx = x - epicenterX;
      const ad = Math.abs(dx);
      const influence = clamp(1 - ad / radius, 0, 1);
      const dir = dx === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(dx);

      // Lateral shove: terrain is sampled inward then pushed outward.
      const sampleX = x - dir * pushPixels * influence * influence;
      const base = sampleArrayLinear(src, sampleX);

      const coreInfluence = ad < coreRadius ? 1 - (ad / coreRadius) ** 2 : 0;
      const ringInfluence = Math.max(0, influence - coreInfluence);
      const sink = coreInfluence * sinkAmp;
      const rimLift = ringInfluence * rippleAmp * 0.32;
      const ripple = Math.sin((ad / radius) * Math.PI * 6.2 + phase) * rippleAmp * influence * 0.55;
      displaced[x] = base + sink - rimLift + ripple;
    }

    let smoothSrc = displaced;
    let smoothDst = smoothSrc.slice();

    for (let pass = 0; pass < EARTHQUAKE_SMOOTH_PASSES; pass += 1) {
      smoothDst[0] = smoothSrc[0];
      smoothDst[last] = smoothSrc[last];
      smoothDst[1] = smoothSrc[1];
      smoothDst[last - 1] = smoothSrc[last - 1];
      for (let x = 2; x < last - 1; x += 1) {
        const ad = Math.abs(x - epicenterX);
        const centerInfluence = clamp(1 - ad / (coreRadius * 1.6), 0, 1);
        const smooth =
          (smoothSrc[x - 2] + smoothSrc[x - 1] * 4 + smoothSrc[x] * 6 + smoothSrc[x + 1] * 4 + smoothSrc[x + 2]) / 16;
        const blend = 0.62 + centerInfluence * 0.3;
        smoothDst[x] = lerp(smoothSrc[x], smooth, blend);
      }
      const tmp = smoothSrc;
      smoothSrc = smoothDst;
      smoothDst = tmp;
    }

    // Landslide transfer: steep slopes shed "loose earth" into nearby lows.
    for (let pass = 0; pass < EARTHQUAKE_EROSION_PASSES; pass += 1) {
      const next = smoothSrc.slice();
      for (let x = 0; x < last; x += 1) {
        const diff = smoothSrc[x + 1] - smoothSrc[x];
        const ad = Math.abs(diff);
        if (ad <= 2.2) {
          continue;
        }

        let transfer = (ad - 2.2) * 0.13;
        transfer = clamp(transfer, 0, 4.2);
        if (diff > 0) {
          next[x] += transfer;
          next[x + 1] -= transfer;
        } else {
          next[x] -= transfer;
          next[x + 1] += transfer;
        }
      }
      smoothSrc = next;
    }

    state.surfaceY = relaxSurfaceForMobility(smoothSrc, 3);

    // Quake packs loose earth into voids: clear all crater masks in-place.
    state.craters = [];
    state.laserCuts = [];
    state.craterLayersDirty = true;
    state.lastImpact.x = clamp(epicenterX, 0, state.worldW - 1);
    state.lastImpact.y = supportY(state.lastImpact.x);

    for (const tank of state.tanks) {
      if (!tank.alive) {
        continue;
      }
      tank.x = clamp(tank.x, TANK_W * 0.6, state.worldW - TANK_W * 0.6);
      tank.y = supportY(tank.x) - TANK_H * 0.5 - 1;
      tank.vx = 0;
      tank.vy = 0;
      tank.tilt = getTankTiltTarget(tank);
    }
  }

  function updateQuakePending(dt) {
    if (state.quakePendingTime <= 0) {
      return;
    }

    state.quakePendingTime = Math.max(0, state.quakePendingTime - dt);
    if (state.quakePendingTime > 0) {
      return;
    }

    applyEarthquake();
    startScreenShake(0.22, 4.8);
    playExplosionSound(1.12);
    setStatus("Earthquake reshaped terrain");
  }

  function fireActiveTank() {
    const tank = getActiveTank();
    if (!tank || !tank.alive) {
      return;
    }
    if (state.quakePendingTime > 0) {
      setStatus("Ground is shaking...");
      return;
    }
    setAimDragActive(false);

    if (tank.controller === "human" && state.phase !== "aim") {
      return;
    }
    if (tank.controller === "ai" && state.phase !== "ai") {
      return;
    }
    if (tank.controller === "human" && state.abilityMode) {
      if (state.abilityMode === "teleport_target") {
        setStatus("Teleport: click terrain");
      } else if (state.abilityMode === "airstrike_target") {
        setStatus("Airstrike: click an enemy tank");
      }
      return;
    }

    let shotType = "normal";
    if (state.selectedShotType === "sniper" && (tank.powerups.sniper || 0) > 0) {
      shotType = "sniper";
      consumePowerUp(tank, "sniper");
    }
    if (state.selectedShotType === "laser" && (tank.powerups.laser || 0) > 0) {
      executeLaserShot(tank);
      return;
    }

    const muzzle = getMuzzleData(tank);
    const launchSpeed = shotType === "sniper" ? Math.max(820, tank.power * 1.9) : tank.power;
    state.projectile = {
      x: muzzle.x,
      y: muzzle.y,
      px: muzzle.x,
      py: muzzle.y,
      vx: Math.cos(muzzle.rad) * launchSpeed,
      vy: -Math.sin(muzzle.rad) * launchSpeed,
      ownerId: tank.id,
      radius: 4,
      active: true,
      shotType
    };

    state.currentShotPath = [{ x: muzzle.x, y: muzzle.y }];
    state.phase = "projectile";
    state.settleTimer = 0;
    state.resolveTimeout = 0;
    state.selectedShotType = "normal";
    clearAbilityMode();
    state.rangefinderHint = null;
    setStatus(`${tank.name} fired`);
  }

  function explode(ix, iy, radius, maxDamage) {
    state.lastImpact.x = ix;
    state.lastImpact.y = iy;

    const carveRadius = radius * TERRAIN_CARVE_SCALE;
    stampImpactCrater(ix, iy, carveRadius);
    state.craterLayersDirty = true;

    for (const tank of state.tanks) {
      if (!tank.alive) {
        continue;
      }

      const dx = tank.x - ix;
      const dy = tank.y - iy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        continue;
      }

      const falloff = 1 - dist / radius;
      const damage = Math.max(MIN_SPLASH_DAMAGE, Math.round(maxDamage * falloff * falloff));
      tank.hp = clamp(tank.hp - damage, 0, getMaxHp());

      const nx = dist > 0.0001 ? dx / dist : 0;
      const ny = dist > 0.0001 ? dy / dist : -1;
      const impulse = 210 * falloff;
      tank.vx += nx * impulse;
      tank.vy += ny * impulse;

      if (tank.hp <= 0) {
        tank.alive = false;
      }
    }

    const fx = state.settings.fxIntensity;
    const particleCount = Math.round(16 + fx * 34);
    for (let i = 0; i < particleCount; i += 1) {
      const a = Math.random() * TAU;
      const speed = rand(28, 148 + fx * 70);
      const ttl = rand(0.28, 0.78);
      state.particles.push({
        x: ix,
        y: iy,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - rand(6, 24),
        life: ttl,
        ttl,
        size: rand(1.2, 3.8),
        tone: Math.random() < 0.5 ? "255, 111, 35" : "0, 0, 0"
      });
    }

    state.bursts.push({
      x: ix,
      y: iy,
      life: 0.6,
      ttl: 0.6,
      radius: radius * (0.95 + fx * 0.7),
      seed: Math.random() * 1000
    });
    if (state.bursts.length > MAX_BURSTS) {
      state.bursts.shift();
    }

    startScreenShake(0.22 + radius * 0.003, 2.6 + radius * 0.055);
    playExplosionSound(0.8 + maxDamage / 120);

    state.phase = "resolving";
    state.settleTimer = 0;
    state.resolveTimeout = 0;
    checkGameOver();
  }

  function updateProjectile(dt) {
    const p = state.projectile;
    if (!p || !p.active) {
      return;
    }

    let substeps = Math.ceil((Math.abs(p.vx) + Math.abs(p.vy)) * dt / 60);
    substeps = clamp(substeps, 1, p.shotType === "sniper" ? 14 : 8);
    const sdt = dt / substeps;

    for (let i = 0; i < substeps; i += 1) {
      p.px = p.x;
      p.py = p.y;

      if (p.shotType !== "sniper") {
        p.vy += GRAVITY * sdt;
      }

      p.x += p.vx * sdt;
      p.y += p.vy * sdt;
      state.currentShotPath.push({ x: p.x, y: p.y });

      const hit = traceCollision(p.px, p.py, p.x, p.y, p.ownerId);
      if (hit) {
        if (hit.kind === "powerup" && hit.powerup) {
          grantPowerUp(p.ownerId, hit.powerup.type);
          state.powerUps = state.powerUps.filter((pp) => pp.id !== hit.powerup.id);
          p.x = hit.x;
          p.y = hit.y;
          p.px = hit.x;
          p.py = hit.y;
          p.vx *= 0.96;
          p.vy *= 0.96;
          continue;
        }
        finalizeShotPath(p.ownerId, hit.x, hit.y);
        p.active = false;
        state.projectile = null;
        explode(hit.x, hit.y, EXPLOSION_RADIUS, EXPLOSION_DAMAGE);
        return;
      }
    }

    if (p.x < -30 || p.x > state.worldW + 30 || p.y > WORLD_H + 30) {
      finalizeShotPath(p.ownerId, clamp(p.x, 0, state.worldW - 1), clamp(p.y, 0, WORLD_H - 1));
      p.active = false;
      state.projectile = null;
      state.phase = "resolving";
      state.settleTimer = 0;
      state.resolveTimeout = 0;
      setStatus("Missed");
    }
  }

  function updateParticles(dt) {
    for (const p of state.particles) {
      p.vy += GRAVITY * 0.48 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);

    for (const b of state.bursts) {
      b.life -= dt;
    }
    state.bursts = state.bursts.filter((b) => b.life > 0);

    for (const cut of state.laserCuts) {
      cut.life -= dt;
    }
    state.laserCuts = state.laserCuts.filter((cut) => cut.life > 0);

  }

  function updateTankPhysics(dt) {
    for (const tank of state.tanks) {
      if (!tank.alive) {
        continue;
      }

      tank.vy += GRAVITY * dt;
      tank.x += tank.vx * dt;
      tank.y += tank.vy * dt;
      tank.vx *= 0.985;

      resolveTankTerrain(tank);

      const grounded = hasGroundUnderTank(tank);
      if (grounded) {
        const gy = supportY(tank.x) - TANK_H * 0.5 - 1;
        tank.y = gy;
        if (tank.vy > 0) {
          tank.vy = 0;
        }
      }
      updateTankTilt(tank, dt);

      if (grounded) {
        tank.vx *= 0.84;
      }

      if (Math.abs(tank.vx) < 4.5) {
        tank.vx = 0;
      }
    }

    checkGameOver();
  }

  function tanksAreStill() {
    for (const tank of state.tanks) {
      if (!tank.alive) {
        continue;
      }
      if (!hasGroundUnderTank(tank)) {
        return false;
      }
      if (Math.abs(tank.vx) > 7 || Math.abs(tank.vy) > 8) {
        return false;
      }
    }
    return true;
  }

  function evaluateAiShot(aiTank, target, angle, power) {
    const dt = 1 / 30;
    const muzzle = getMuzzleData(aiTank, angle);

    let x = muzzle.x;
    let y = muzzle.y;
    let vx = Math.cos(muzzle.rad) * power;
    let vy = -Math.sin(muzzle.rad) * power;

    let bestDist = Math.hypot(x - target.x, y - target.y);

    for (let i = 0; i < 200; i += 1) {
      const px = x;
      const py = y;

      vy += GRAVITY * dt;
      x += vx * dt;
      y += vy * dt;

      const hit = traceCollision(px, py, x, y, aiTank.id);
      if (hit) {
        if (hit.kind === "powerup") {
          x = hit.x;
          y = hit.y;
          continue;
        }
        if (hit.kind === "tank" && hit.tank.id === target.id) {
          return 0;
        }
        return Math.min(bestDist, Math.hypot(hit.x - target.x, hit.y - target.y));
      }

      if (x < -60 || x > state.worldW + 60 || y > WORLD_H + 80) {
        break;
      }

      const d = Math.hypot(x - target.x, y - target.y);
      if (d < bestDist) {
        bestDist = d;
      }
    }

    return bestDist + 30;
  }

  function findBestShotSolution(shooter, target, samples = 240) {
    const targetLeft = target.x < shooter.x;
    let best = { angle: targetLeft ? 142 : 38, power: DEFAULT_SHOT_POWER, score: Number.POSITIVE_INFINITY };

    for (let i = 0; i < samples; i += 1) {
      const lowArcAngle = targetLeft ? rand(96, 172) : rand(8, 84);
      const lowArcPower = rand(MIN_POWER, MAX_POWER - 8);
      const lowScore = evaluateAiShot(shooter, target, lowArcAngle, lowArcPower);
      if (lowScore < best.score) {
        best = { angle: lowArcAngle, power: lowArcPower, score: lowScore };
      }

      const highArcAngle = targetLeft ? rand(120, 173) : rand(22, 88);
      const highArcPower = rand(MIN_POWER, MAX_POWER - 8);
      const highScore = evaluateAiShot(shooter, target, highArcAngle, highArcPower);
      if (highScore < best.score) {
        best = { angle: highArcAngle, power: highArcPower, score: highScore };
      }
    }

    return best;
  }

  function evaluateShotToPoint(shooter, targetX, targetY, angle, power, capturePath = false) {
    const dt = 1 / 30;
    const muzzle = getMuzzleData(shooter, angle);
    let x = muzzle.x;
    let y = muzzle.y;
    let vx = Math.cos(muzzle.rad) * power;
    let vy = -Math.sin(muzzle.rad) * power;
    let bestDist = Math.hypot(x - targetX, y - targetY);
    const path = capturePath ? [{ x, y }] : null;

    for (let i = 0; i < 220; i += 1) {
      const px = x;
      const py = y;
      vy += GRAVITY * dt;
      x += vx * dt;
      y += vy * dt;

      const d = Math.hypot(x - targetX, y - targetY);
      if (d < bestDist) {
        bestDist = d;
      }
      if (path) {
        path.push({ x, y });
      }

      const hit = traceCollision(px, py, x, y, shooter.id);
      if (hit) {
        if (hit.kind === "powerup") {
          x = hit.x;
          y = hit.y;
          if (path) {
            path[path.length - 1] = { x, y };
          }
          continue;
        }
        if (path && (Math.abs(hit.x - x) > 0.001 || Math.abs(hit.y - y) > 0.001)) {
          path.push({ x: hit.x, y: hit.y });
        }
        return {
          score: Math.min(bestDist, Math.hypot(hit.x - targetX, hit.y - targetY)),
          path,
          endX: hit.x,
          endY: hit.y
        };
      }

      if (x < -60 || x > state.worldW + 60 || y > WORLD_H + 80) {
        break;
      }
    }

    return {
      score: bestDist + 12,
      path,
      endX: x,
      endY: y
    };
  }

  function findBestShotToPoint(shooter, targetX, targetY, samples = 360) {
    const targetLeft = targetX < shooter.x;
    let best = { angle: targetLeft ? 142 : 38, power: DEFAULT_SHOT_POWER, score: Number.POSITIVE_INFINITY, path: null };

    for (let i = 0; i < samples; i += 1) {
      const lowAngle = targetLeft ? rand(96, 172) : rand(8, 84);
      const lowPower = rand(MIN_POWER, MAX_POWER - 8);
      const lowEval = evaluateShotToPoint(shooter, targetX, targetY, lowAngle, lowPower, false);
      if (lowEval.score < best.score) {
        best = { angle: lowAngle, power: lowPower, score: lowEval.score, path: null };
      }

      const highAngle = targetLeft ? rand(120, 173) : rand(22, 88);
      const highPower = rand(MIN_POWER, MAX_POWER - 8);
      const highEval = evaluateShotToPoint(shooter, targetX, targetY, highAngle, highPower, false);
      if (highEval.score < best.score) {
        best = { angle: highAngle, power: highPower, score: highEval.score, path: null };
      }

      if (best.score < 7) {
        break;
      }
    }

    const refined = evaluateShotToPoint(shooter, targetX, targetY, best.angle, best.power, true);
    best.score = refined.score;
    best.path = refined.path || null;
    return best;
  }

  function activatePowerUp(type) {
    if (!isPlayerTurn()) {
      return;
    }
    const tank = getActiveTank();
    if (!tank || !tank.powerups) {
      return;
    }
    if ((tank.powerups[type] || 0) <= 0) {
      setStatus(`No ${type.toUpperCase()} charge`);
      return;
    }

    if (type === "sniper") {
      state.selectedShotType = state.selectedShotType === "sniper" ? "normal" : "sniper";
      clearAbilityMode();
      setStatus(state.selectedShotType === "sniper" ? "Sniper shot ready" : "Normal shot selected");
      return;
    }

    state.selectedShotType = "normal";
    if (type === "teleport") {
      state.abilityMode = "teleport_target";
      state.rangefinderPendingTargetId = null;
      setStatus("Teleport: click terrain location");
      return;
    }

    if (type === "airstrike") {
      state.abilityMode = "airstrike_target";
      state.rangefinderPendingTargetId = null;
      setStatus("Airstrike: click an enemy tank");
      return;
    }

    if (type === "earthquake") {
      if (state.quakePendingTime > 0) {
        setStatus("Earthquake already rumbling");
        return;
      }
      if (!consumePowerUp(tank, "earthquake")) {
        return;
      }
      clearAbilityMode();
      state.selectedShotType = "normal";
      state.quakePendingTime = EARTHQUAKE_SHAKE_TIME;
      startScreenShake(EARTHQUAKE_SHAKE_TIME, EARTHQUAKE_SHAKE_AMP);
      playEarthquakeRumble(EARTHQUAKE_SHAKE_TIME);
      setStatus("Earthquake rumbling...");
      return;
    }

    if (type === "laser") {
      state.selectedShotType = state.selectedShotType === "laser" ? "normal" : "laser";
      clearAbilityMode();
      setStatus(state.selectedShotType === "laser" ? "Laser shot ready" : "Normal shot selected");
    }
  }

  function teleportTankToX(tank, worldX) {
    if (!tank || !tank.alive) {
      return false;
    }
    tank.x = clamp(worldX, TANK_W * 0.6, state.worldW - TANK_W * 0.6);
    tank.y = supportY(tank.x) - TANK_H * 0.5 - 1;
    tank.vx = 0;
    tank.vy = 0;
    resolveTankTerrain(tank);
    updateTankTilt(tank, 0.2);
    tank.moveRemaining = Math.max(0, tank.moveRemaining - 38);
    return true;
  }

  function tryTeleportTo(worldX) {
    const tank = getActiveTank();
    if (!tank || !isPlayerTurn()) {
      return false;
    }
    if (!consumePowerUp(tank, "teleport")) {
      return false;
    }
    if (!teleportTankToX(tank, worldX)) {
      return false;
    }
    clearAbilityMode();
    setStatus("Teleported");
    return true;
  }

  function launchAirstrike(shooter, targetTank) {
    if (!shooter || !targetTank || !targetTank.alive) {
      return false;
    }

    const targetX = clamp(targetTank.x + rand(-10, 10), 0, state.worldW - 1);
    const spawnX = clamp(targetX + rand(-16, 16), 0, state.worldW - 1);
    const spawnY = -16;
    const vx = clamp((targetX - spawnX) * 1.15, -140, 140);
    const vy = 320;

    state.projectile = {
      x: spawnX,
      y: spawnY,
      px: spawnX,
      py: spawnY,
      vx,
      vy,
      ownerId: shooter.id,
      radius: 4,
      active: true,
      shotType: "airstrike"
    };

    state.currentShotPath = [{ x: spawnX, y: spawnY }];
    state.phase = "projectile";
    state.settleTimer = 0;
    state.resolveTimeout = 0;
    state.selectedShotType = "normal";
    clearAbilityMode();
    state.rangefinderHint = null;
    setStatus(`${shooter.name} called AIRSTRIKE on ${targetTank.name}`);
    return true;
  }

  function tryAirstrikeTarget(worldX, worldY) {
    const shooter = getActiveTank();
    if (!shooter || !isPlayerTurn()) {
      return false;
    }
    const target = tankAtWorldPoint(worldX, worldY);
    if (!target || !target.alive || target.team === shooter.team) {
      setStatus("Airstrike: click an enemy tank");
      return false;
    }
    if (!consumePowerUp(shooter, "airstrike")) {
      return false;
    }
    return launchAirstrike(shooter, target);
  }

  function traceLaserBeam(ownerId, x0, y0, rad) {
    const dirX = Math.cos(rad);
    const dirY = -Math.sin(rad);
    const step = 2.6;
    const maxDist = state.worldW + WORLD_H;
    const steps = Math.max(1, Math.ceil(maxDist / step));
    let lastX = x0;
    let lastY = y0;

    for (let i = 1; i <= steps; i += 1) {
      const x = x0 + dirX * step * i;
      const y = y0 + dirY * step * i;
      if (x < 0 || x >= state.worldW || y < 0 || y >= WORLD_H) {
        return {
          kind: "bounds",
          x: clamp(x, 0, state.worldW - 1),
          y: clamp(y, 0, WORLD_H - 1)
        };
      }

      const hitTank = tankAtPoint(x, y, ownerId);
      if (hitTank) {
        return { kind: "tank", x, y, tank: hitTank };
      }

      lastX = x;
      lastY = y;
    }

    return { kind: "range", x: lastX, y: lastY };
  }

  function addLaserCut(x0, y0, x1, y1) {
    state.laserCuts.push({ x0, y0, x1, y1, life: LASER_CUT_LIFE, ttl: LASER_CUT_LIFE });
    if (state.laserCuts.length > MAX_LASER_CUTS) {
      state.laserCuts.splice(0, state.laserCuts.length - MAX_LASER_CUTS);
    }
  }

  function carveLaserTunnel(x0, y0, x1, y1, radius = LASER_TUNNEL_RADIUS) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / 2.8));
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = x0 + dx * t;
      const y = y0 + dy * t;
      pushCraterStamp(x, y, radius);
    }
    state.craterLayersDirty = true;
  }

  function executeLaserShot(shooter) {
    if (!consumePowerUp(shooter, "laser")) {
      return false;
    }

    const muzzle = getMuzzleData(shooter);
    const hit = traceLaserBeam(shooter.id, muzzle.x, muzzle.y, muzzle.rad);
    const hitX = hit.x;
    const hitY = hit.y;

    addLaserCut(muzzle.x, muzzle.y, hitX, hitY);
    carveLaserTunnel(muzzle.x, muzzle.y, hitX, hitY);

    if (hit.kind === "tank" && hit.tank) {
      const dx = hit.tank.x - shooter.x;
      const dy = hit.tank.y - shooter.y;
      const dist = Math.max(0.001, Math.hypot(dx, dy));
      hit.tank.hp = clamp(hit.tank.hp - LASER_DAMAGE, 0, getMaxHp());
      hit.tank.vx += (dx / dist) * LASER_KNOCKBACK;
      hit.tank.vy += (dy / dist) * LASER_KNOCKBACK * 0.28;
      if (hit.tank.hp <= 0) {
        hit.tank.alive = false;
      }
    }

    state.lastImpact.x = hitX;
    state.lastImpact.y = hitY;
    state.selectedShotType = "normal";
    clearAbilityMode();
    state.rangefinderHint = null;
    state.currentShotPath = [];

    shooter.lastShotPath = [
      { x: muzzle.x, y: muzzle.y },
      { x: hitX, y: hitY }
    ];
    shooter.lastShotEnd = { x: hitX, y: hitY };

    startScreenShake(0.32, 8.4);
    playExplosionSound(1.35);
    setStatus(hit.kind === "tank" ? `${shooter.name} hit ${hit.tank.name} with LASER` : `${shooter.name} fired LASER`);
    state.phase = "resolving";
    state.settleTimer = 0;
    state.resolveTimeout = 0;
    checkGameOver();
    return true;
  }

  function pickAiTarget(aiTank) {
    const candidates = state.tanks.filter((tank) => tank.alive && tank.team !== aiTank.team);
    if (!candidates.length) {
      return null;
    }

    let best = candidates[0];
    let bestScore = Number.POSITIVE_INFINITY;
    for (const c of candidates) {
      const dist = Math.abs(c.x - aiTank.x);
      const hpBias = (state.config.aiDifficulty === "hard" ? 0.95 : 0.55) * c.hp;
      const score = dist + hpBias;
      if (score < bestScore) {
        best = c;
        bestScore = score;
      }
    }
    return best;
  }

  function chooseAiMoveDirection(aiTank, target) {
    const aiPreset = getAiPreset();
    const dx = target.x - aiTank.x;
    if (Math.abs(dx) < aiPreset.moveRange) {
      return 0;
    }
    return dx > 0 ? 1 : -1;
  }

  function planAiShot(aiTank, target) {
    const aiPreset = getAiPreset();
    const targetLeft = target.x < aiTank.x;
    let best = {
      angle: targetLeft ? 142 : 38,
      power: DEFAULT_SHOT_POWER,
      score: Number.POSITIVE_INFINITY
    };

    for (let i = 0; i < aiPreset.samples; i += 1) {
      const angle = targetLeft ? rand(95, 172) : rand(8, 85);
      const power = rand(150, MAX_POWER - 10);
      const score = evaluateAiShot(aiTank, target, angle, power);

      if (score < best.score) {
        best = { angle, power, score };
      }

      if (score < aiPreset.earlyScore) {
        break;
      }
    }

    best.angle = clampAimDeg(best.angle + rand(-aiPreset.aimJitter, aiPreset.aimJitter));
    best.power = clamp(best.power + rand(-aiPreset.powerJitter, aiPreset.powerJitter), MIN_POWER, MAX_POWER);

    // Easy bots occasionally take a poor shot on purpose.
    if (state.config.aiDifficulty === "easy" && Math.random() < 0.24) {
      const looseAngle = targetLeft ? rand(95, 172) : rand(8, 85);
      const loosePower = rand(160, MAX_POWER - 20);
      best.angle = clampAimDeg(looseAngle + rand(-16, 16));
      best.power = clamp(loosePower + rand(-100, 100), MIN_POWER, MAX_POWER);
    }

    for (let i = 0; i < aiPreset.refinePasses; i += 1) {
      const angle = clampAimDeg(best.angle + rand(-4.2, 4.2));
      const power = clamp(best.power + rand(-42, 42), MIN_POWER, MAX_POWER);
      const score = evaluateAiShot(aiTank, target, angle, power);
      if (score < best.score) {
        best = { angle, power, score };
      }
    }

    return best;
  }

  function chooseAiPowerUpTarget(aiTank, target, aiPreset) {
    if (!state.powerUps.length) {
      return null;
    }

    const missingHp = getMaxHp() - aiTank.hp;
    let best = null;
    let bestScore = -Infinity;

    for (const p of state.powerUps) {
      const dist = Math.hypot(p.x - aiTank.x, p.y - aiTank.y);
      if (dist > aiPreset.powerupSeekRange) {
        continue;
      }

      let value = 0;
      if (p.type === "health") {
        value = missingHp > 36 ? 230 : missingHp > 18 ? 150 : missingHp > 0 ? 70 : 10;
      } else if (p.type === "laser") {
        value = 210;
      } else if (p.type === "airstrike") {
        value = 188;
      } else if (p.type === "sniper") {
        value = 164;
      } else if (p.type === "teleport") {
        value = 136;
      } else if (p.type === "earthquake") {
        value = 126;
      }

      let score = value - dist * 0.26;
      if (target) {
        score += Math.max(0, 240 - Math.abs(target.x - p.x)) * 0.1;
      }

      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }

    const threshold = state.config.aiDifficulty === "hard" ? 24 : state.config.aiDifficulty === "normal" ? 48 : 78;
    return best && bestScore >= threshold ? best : null;
  }

  function chooseAiShotMode(aiTank, target, shotPlan, aiPreset) {
    if (!target || !target.alive) {
      return { shotType: "normal" };
    }

    if ((aiTank.powerups.laser || 0) > 0) {
      const angle = clampAimDeg((Math.atan2(aiTank.y - (target.y - TANK_H * 0.35), target.x - aiTank.x) * 180) / Math.PI);
      const muzzle = getMuzzleData(aiTank, angle);
      const hit = traceLaserBeam(aiTank.id, muzzle.x, muzzle.y, muzzle.rad);
      if (hit.kind === "tank" && hit.tank && hit.tank.id === target.id && Math.random() < aiPreset.laserChance) {
        return { shotType: "laser", angle, power: aiTank.power };
      }
    }

    if ((aiTank.powerups.sniper || 0) > 0) {
      const angle = clampAimDeg((Math.atan2(aiTank.y - (target.y - TANK_H * 0.35), target.x - aiTank.x) * 180) / Math.PI);
      const muzzle = getMuzzleData(aiTank, angle);
      const lineHit = traceCollision(muzzle.x, muzzle.y, target.x, target.y - TANK_H * 0.35, aiTank.id);
      const canDirectHit = lineHit && lineHit.kind === "tank" && lineHit.tank && lineHit.tank.id === target.id;
      const longShot = Math.abs(target.x - aiTank.x) > 340;
      const weakArc = shotPlan.score > (state.config.aiDifficulty === "hard" ? 22 : 34);
      if (canDirectHit && (longShot || weakArc) && Math.random() < aiPreset.sniperChance) {
        const dist = Math.hypot(target.x - muzzle.x, target.y - TANK_H * 0.35 - muzzle.y);
        return {
          shotType: "sniper",
          angle,
          power: clamp(Math.max(DEFAULT_SHOT_POWER, dist * 1.25), MIN_POWER, MAX_POWER)
        };
      }
    }

    return { shotType: "normal" };
  }

  function aiTryUseSupportPowerUps(aiTank, target, aiPlan, aiPreset) {
    if (!aiTank || !aiTank.alive) {
      return false;
    }

    if (target && (aiTank.powerups.airstrike || 0) > 0) {
      const shouldAirstrike =
        Math.random() < aiPreset.airstrikeChance &&
        (aiPlan?.score > (state.config.aiDifficulty === "hard" ? 12 : 26) || target.hp <= Math.round(getMaxHp() * 0.45));
      if (shouldAirstrike && consumePowerUp(aiTank, "airstrike")) {
        launchAirstrike(aiTank, target);
        return true;
      }
    }

    if (target && (aiTank.powerups.teleport || 0) > 0) {
      const farFromTarget = Math.abs(target.x - aiTank.x) > aiPreset.moveRange * 1.75;
      if (farFromTarget && Math.random() < aiPreset.teleportChance) {
        const offset = target.x >= aiTank.x ? -rand(78, 148) : rand(78, 148);
        const destX = clamp(target.x + offset, TANK_W * 0.6, state.worldW - TANK_W * 0.6);
        if (consumePowerUp(aiTank, "teleport") && teleportTankToX(aiTank, destX)) {
          setStatus(`${aiTank.name} used TELEPORT`);
          return true;
        }
      }
    }

    if ((aiTank.powerups.earthquake || 0) > 0 && state.quakePendingTime <= 0) {
      const badShot = aiPlan && aiPlan.score > (state.config.aiDifficulty === "hard" ? 58 : 86);
      if (badShot && Math.random() < aiPreset.quakeChance && consumePowerUp(aiTank, "earthquake")) {
        state.quakePendingTime = EARTHQUAKE_SHAKE_TIME;
        startScreenShake(EARTHQUAKE_SHAKE_TIME, EARTHQUAKE_SHAKE_AMP);
        playEarthquakeRumble(EARTHQUAKE_SHAKE_TIME);
        setStatus(`${aiTank.name} triggered EARTHQUAKE`);
        return true;
      }
    }

    return false;
  }

  function updateAi(dt) {
    if (state.phase !== "ai") {
      return;
    }

    const tank = getActiveTank();
    if (!tank || !tank.alive) {
      advanceTurn();
      return;
    }

    state.aiTimer += dt;

    const aiPreset = getAiPreset();
    if (!state.aiPlan) {
      const target = pickAiTarget(tank);
      if (target) {
        const desiredPowerUp = chooseAiPowerUpTarget(tank, target, aiPreset);
        if (desiredPowerUp && Math.random() < aiPreset.powerupFocus) {
          const pickup = findBestShotToPoint(tank, desiredPowerUp.x, desiredPowerUp.y, Math.round(aiPreset.samples * 1.25));
          if (pickup.score < (state.config.aiDifficulty === "hard" ? 42 : 56)) {
            state.aiMoveDir = chooseAiMoveDirection(tank, { x: desiredPowerUp.x });
            state.aiPlan = {
              angle: pickup.angle,
              power: pickup.power,
              score: pickup.score,
              shotType: "normal",
              targetId: target.id,
              intent: "pickup",
              supportChecked: false
            };
            setStatus(`${tank.name} going for ${desiredPowerUp.type.toUpperCase()}`);
          }
        }

        if (!state.aiPlan) {
          const shot = planAiShot(tank, target);
          const mode = chooseAiShotMode(tank, target, shot, aiPreset);
          state.aiMoveDir = chooseAiMoveDirection(tank, target);
          state.aiPlan = {
            angle: mode.angle ?? shot.angle,
            power: mode.power ?? shot.power,
            score: shot.score,
            shotType: mode.shotType || "normal",
            targetId: target.id,
            intent: "attack",
            supportChecked: false
          };
          setStatus(`${tank.name} targeting ${target.name}`);
        }
      } else {
        state.aiMoveDir = 0;
        state.aiPlan = { angle: tank.angle, power: tank.power, score: 999, shotType: "normal", supportChecked: true };
      }
    }

    if (state.aiMoveDir !== 0 && state.aiTimer < 0.82 && tank.moveRemaining > 0) {
      tryDriveTank(tank, state.aiMoveDir, dt);
    }

    if (state.aiPlan && !state.aiPlan.supportChecked && state.aiTimer > 0.22) {
      const target = state.aiPlan.targetId != null ? getTankById(state.aiPlan.targetId) : null;
      const usedSupport = aiTryUseSupportPowerUps(tank, target, state.aiPlan, aiPreset);
      if (usedSupport) {
        state.aiPlan = null;
        state.aiTimer = 0;
        state.aiMoveDir = 0;
        return;
      }
      state.aiPlan.supportChecked = true;
    }

    if (state.aiPlan && state.aiTimer > 0.44) {
      const aimLerp = state.config.aiDifficulty === "hard" ? 0.16 : state.config.aiDifficulty === "easy" ? 0.09 : 0.12;
      tank.angle = lerp(tank.angle, state.aiPlan.angle, aimLerp);
      tank.power = lerp(tank.power, state.aiPlan.power, aimLerp);
      syncControlsFromActive();
    }

    if (state.aiTimer > aiPreset.fireDelay) {
      state.selectedShotType = state.aiPlan?.shotType || "normal";
      fireActiveTank();
      if (state.phase === "ai") {
        // Failsafe if firing was blocked for any reason.
        state.phase = "resolving";
        state.settleTimer = 0;
        state.resolveTimeout = 0;
        setStatus("Turn skipped");
      }
    }

    if (state.phase === "ai" && state.aiTimer > 2.4) {
      state.phase = "resolving";
      state.settleTimer = 0;
      state.resolveTimeout = 0;
      setStatus("AI timeout");
    }
  }

  function updateAimInput(dt) {
    if (!isPlayerTurn()) {
      return;
    }

    const tank = getActiveTank();
    if (!tank) {
      return;
    }

    let driveDir = 0;

    if (keys.has("KeyA")) {
      driveDir -= 1;
    }
    if (keys.has("KeyD")) {
      driveDir += 1;
    }
    if (driveDir !== 0) {
      tryDriveTank(tank, driveDir, dt);
    }
  }

  function updateCamera(dt) {
    if (state.phase === "paused") {
      return;
    }

    if (state.phase === "draw_map") {
      const margin = Math.min(EDGE_LOOK_MARGIN, canvas.width * 0.22);
      let dir = 0;
      let t = 0;
      if (pointer.x <= margin) {
        t = clamp((margin - pointer.x) / margin, 0, 1);
        dir = -1;
      } else if (pointer.x >= canvas.width - margin) {
        t = clamp((pointer.x - (canvas.width - margin)) / margin, 0, 1);
        dir = 1;
      }
      if (dir !== 0) {
        const panSpeed = 260 + 980 * t * t;
        state.cameraX = clampCamera(state.cameraX + dir * panSpeed * dt);
      }
      state.cameraLookX = 0;
      return;
    }

    let targetX = state.worldW * 0.5;

    if ((state.phase === "aim" || state.phase === "ai") && getActiveTank()) {
      targetX = getActiveTank().x;
    } else if (state.phase === "projectile" && state.projectile) {
      targetX = state.projectile.x;
    } else if (state.phase === "resolving") {
      targetX = state.lastImpact.x;
    } else if (state.phase === "gameover") {
      const survivor = state.tanks.find((tank) => tank.alive);
      targetX = survivor ? survivor.x : state.worldW * 0.5;
    }

    let edgeLookTarget = 0;
    if (state.phase === "aim" || state.phase === "ai" || state.phase === "gameover" || state.phase === "draw_map") {
      const margin = Math.min(EDGE_LOOK_MARGIN, canvas.width * 0.22);
      if (pointer.x <= margin) {
        const t = clamp((margin - pointer.x) / margin, 0, 1);
        edgeLookTarget = -EDGE_LOOK_MAX * t * t;
      } else if (pointer.x >= canvas.width - margin) {
        const t = clamp((pointer.x - (canvas.width - margin)) / margin, 0, 1);
        edgeLookTarget = EDGE_LOOK_MAX * t * t;
      }
    }

    state.cameraLookX = lerp(state.cameraLookX, edgeLookTarget, clamp(dt * 6.4, 0, 1));
    const desired = targetX + state.cameraLookX - canvas.width * 0.5;
    const smooth = 1 - Math.pow(0.001, dt);
    state.cameraX = lerp(state.cameraX, desired, smooth);
    state.cameraX = clampCamera(state.cameraX);
  }

  function getGameplayBottomY() {
    if (!ui.bottomUi) {
      return canvas.height;
    }
    const rect = ui.bottomUi.getBoundingClientRect();
    return clamp(rect.top - 4, 140, canvas.height);
  }

  function drawBackground() {
    // Doodle notebook style backdrop.
    ctx.fillStyle = "#f8f8f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.strokeStyle = "rgba(66, 133, 244, 0.18)";
    ctx.lineWidth = 1;
    const lineGap = 34;
    const lineOffset = 22;
    for (let y = lineOffset; y < canvas.height; y += lineGap) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(canvas.width, y + 0.5);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(220, 38, 38, 0.22)";
    ctx.lineWidth = 1.6;
    const marginX = Math.min(96, Math.max(64, canvas.width * 0.08));
    ctx.beginPath();
    ctx.moveTo(marginX, 0);
    ctx.lineTo(marginX, canvas.height);
    ctx.stroke();
    ctx.restore();
  }

  function drawTerrain() {
    if (!state.surfaceY || state.surfaceY.length !== state.worldW) {
      return;
    }

    rebuildCraterLayers();

    ctx.save();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;

    // Clip crater fill so removed mass only appears below/inside the terrain profile.
    ctx.beginPath();
    ctx.moveTo(-state.cameraX, state.surfaceY[0]);
    for (let x = 1; x < state.worldW; x += 2) {
      ctx.lineTo(x - state.cameraX, state.surfaceY[x]);
    }
    ctx.lineTo(state.worldW - state.cameraX + 4, WORLD_H + 8);
    ctx.lineTo(-state.cameraX - 4, WORLD_H + 8);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    ctx.drawImage(craterFillCanvas, -state.cameraX, 0);
    ctx.drawImage(craterEdgeCanvas, -state.cameraX, 0);
    ctx.restore();

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-state.cameraX, state.surfaceY[0]);
    for (let x = 1; x < state.worldW; x += 2) {
      ctx.lineTo(x - state.cameraX, state.surfaceY[x]);
    }
    ctx.stroke();

    ctx.restore();
  }

  function drawLaserCuts() {
    if (!state.laserCuts.length) {
      return;
    }

    ctx.save();
    ctx.lineCap = "round";
    for (const cut of state.laserCuts) {
      const alpha = clamp(cut.life / cut.ttl, 0, 1);
      if (alpha <= 0.01) {
        continue;
      }

      const sx = cut.x0 - state.cameraX;
      const sy = cut.y0;
      const ex = cut.x1 - state.cameraX;
      const ey = cut.y1;

      ctx.globalAlpha = 0.18 * alpha;
      ctx.strokeStyle = "#ff3030";
      ctx.lineWidth = 7.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.globalAlpha = 0.94 * alpha;
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 3.1;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawMapEditorOverlay() {
    if (state.phase !== "draw_map") {
      return;
    }

    const edgeBand = Math.max(18, state.worldW * 0.03);
    const bottom = getGameplayBottomY();
    const drawPoints = state.drawMap.ready ? state.drawMap.previewPoints : state.drawMap.points;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
    ctx.fillRect(-state.cameraX, 0, edgeBand, bottom);
    ctx.fillRect(state.worldW - edgeBand - state.cameraX, 0, edgeBand, bottom);

    if (drawPoints.length > 1) {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.92)";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(drawPoints[0].x - state.cameraX, drawPoints[0].y);
      for (let i = 1; i < drawPoints.length; i += 1) {
        ctx.lineTo(drawPoints[i].x - state.cameraX, drawPoints[i].y);
      }
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const bubbleW = Math.min(430, canvas.width - 40);
    const bubbleH = 44;
    const bubbleX = canvas.width * 0.5 - bubbleW * 0.5;
    const bubbleY = 72;
    pathRoundedRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000000";
    ctx.font = "700 14px 'Comic Sans MS', 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Click once to start drawing, click again to stop", canvas.width * 0.5, bubbleY + 17);
    ctx.font = "600 12px 'Comic Sans MS', 'Trebuchet MS', sans-serif";
    ctx.fillText("Make one continuous line from one edge to the other", canvas.width * 0.5, bubbleY + 31);
    ctx.restore();
  }

  function drawLastShotGhost(tank) {
    if (!tank || !tank.lastShotPath || tank.lastShotPath.length < 2) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.24)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tank.lastShotPath[0].x - state.cameraX, tank.lastShotPath[0].y);
    for (let i = 1; i < tank.lastShotPath.length; i += 1) {
      const p = tank.lastShotPath[i];
      ctx.lineTo(p.x - state.cameraX, p.y);
    }
    ctx.stroke();

    if (tank.lastShotEnd) {
      ctx.fillStyle = "rgba(90, 90, 90, 0.3)";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(tank.lastShotEnd.x - state.cameraX, tank.lastShotEnd.y, 4, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawRangefinderHint(tank) {
    if (!tank || !state.rangefinderHint || state.rangefinderHint.shooterId !== tank.id) {
      return;
    }
    if (!isPlayerTurn() || getActiveTank() !== tank) {
      return;
    }

    const hint = state.rangefinderHint;
    const muzzle = getMuzzleData(tank);

    if (hint.path && hint.path.length > 1) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(hint.path[0].x - state.cameraX, hint.path[0].y);
      for (let i = 1; i < hint.path.length; i += 1) {
        const p = hint.path[i];
        ctx.lineTo(p.x - state.cameraX, p.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.58)";
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(hint.x - state.cameraX, hint.y);
    ctx.lineTo(muzzle.x - state.cameraX, muzzle.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.84)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(hint.x - state.cameraX, hint.y, 7, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawTrajectoryPreview(tank) {
    if (!isPlayerTurn() || getActiveTank() !== tank) {
      return;
    }

    drawLastShotGhost(tank);
    drawRangefinderHint(tank);

    const hasRangefinderPath =
      state.rangefinderHint &&
      state.rangefinderHint.shooterId === tank.id &&
      Array.isArray(state.rangefinderHint.path) &&
      state.rangefinderHint.path.length > 1;
    if (hasRangefinderPath) {
      return;
    }

    const muzzle = getMuzzleData(tank);
    const laserReady = state.selectedShotType === "laser" && (tank.powerups.laser || 0) > 0;
    if (laserReady) {
      const hit = traceLaserBeam(tank.id, muzzle.x, muzzle.y, muzzle.rad);
      ctx.save();
      ctx.strokeStyle = "rgba(255, 0, 0, 0.62)";
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(muzzle.x - state.cameraX, muzzle.y);
      ctx.lineTo(hit.x - state.cameraX, hit.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.72)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(hit.x - state.cameraX, hit.y, 6, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }

    const previewSniper = state.selectedShotType === "sniper" && (tank.powerups.sniper || 0) > 0;
    let x = muzzle.x;
    let y = muzzle.y;
    let vx = Math.cos(muzzle.rad) * (previewSniper ? Math.max(820, tank.power * 1.9) : tank.power);
    let vy = -Math.sin(muzzle.rad) * (previewSniper ? Math.max(820, tank.power * 1.9) : tank.power);

    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.66)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x - state.cameraX, y);
    let endX = x;
    let endY = y;

    const dt = 1 / 30;
    for (let i = 0; i < 22; i += 1) {
      const px = x;
      const py = y;

      if (!previewSniper) {
        vy += GRAVITY * dt;
      }
      x += vx * dt;
      y += vy * dt;

      const hit = traceCollision(px, py, x, y, tank.id);
      if (hit) {
        ctx.lineTo(hit.x - state.cameraX, hit.y);
        endX = hit.x;
        endY = hit.y;
        break;
      }

      ctx.lineTo(x - state.cameraX, y);
      endX = x;
      endY = y;
    }

    ctx.stroke();
    ctx.setLineDash([]);

    // Endpoint marker is attached to the simulated preview arc.
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.72)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(endX - state.cameraX, endY, 6, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawTank(tank) {
    if (!tank.alive) {
      return;
    }

    const tx = tank.x - state.cameraX;
    const ty = tank.y;
    const bodyTilt = tank.tilt || 0;
    const worldGunRad = degToRad(clampAimDeg(tank.angle));
    const localGunRad = worldGunRad + bodyTilt;
    const bodyColor = tank.color || "#000000";

    drawTrajectoryPreview(tank);

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(bodyTilt);

    // Reference-inspired silhouette: broad trapezoid hull + simple box turret.
    ctx.beginPath();
    ctx.moveTo(-HULL_BOTTOM_HALF, HULL_BOTTOM_Y);
    ctx.lineTo(HULL_BOTTOM_HALF, HULL_BOTTOM_Y);
    ctx.lineTo(HULL_TOP_HALF, HULL_TOP_Y);
    ctx.lineTo(-HULL_TOP_HALF, HULL_TOP_Y);
    ctx.closePath();
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.fillStyle = bodyColor;
    ctx.fillRect(TURRET_X, TURRET_Y, TURRET_W, TURRET_H);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.2;
    ctx.strokeRect(TURRET_X, TURRET_Y, TURRET_W, TURRET_H);

    // Flat cannon bar anchored at the center of the turret top.
    const mountX = TURRET_X + TURRET_W * 0.5;
    const mountY = TURRET_Y + TURRET_H * 0.52;
    ctx.save();
    ctx.translate(mountX, mountY);
    ctx.rotate(-localGunRad);
    const barrelLen = BARREL_LEN;
    pathRoundedRect(ctx, -BARREL_OVERLAP, -1.25, barrelLen + BARREL_OVERLAP, 2.5, 0.6);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.9;
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    const hpRatio = clamp(tank.hp / getMaxHp(), 0, 1);
    const hpBarW = 36;
    const hpBarX = tx - hpBarW * 0.5;
    const hpBarY = ty - 28;
    ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
    ctx.fillRect(hpBarX, hpBarY, hpBarW, 4);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(hpBarX, hpBarY, hpBarW * hpRatio, 4);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.1;
    ctx.strokeRect(hpBarX, hpBarY, hpBarW, 4);

    ctx.fillStyle = "#000000";
    ctx.font = "600 12px 'Comic Sans MS', 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(tank.name, tx, ty - 35);
  }

  function drawProjectile() {
    if (!state.projectile || !state.projectile.active) {
      return;
    }

    const p = state.projectile;
    ctx.fillStyle = "#808080";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x - state.cameraX, p.y, p.radius + 1.2, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  function drawPowerUps() {
    for (const p of state.powerUps) {
      const x = p.x - state.cameraX;
      const y = p.y;
      const fill = p.type === "health" ? "#22c55e" : "#2f7fff";
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y, p.r, 0, TAU);
      ctx.fill();
    }
  }

  function drawExplosionBursts() {
    const fx = state.settings.fxIntensity;
    if (fx <= 0.01) {
      return;
    }

    for (const burst of state.bursts) {
      const t = 1 - clamp(burst.life / burst.ttl, 0, 1);
      const alpha = (1 - t) * fx;
      const ringR = burst.radius * (0.34 + t * 0.96);

      ctx.save();
      ctx.lineWidth = 2 + (1 - t) * 4;
      ctx.strokeStyle = `rgba(255, 120, 40, ${0.5 * alpha})`;
      ctx.beginPath();
      ctx.arc(burst.x - state.cameraX, burst.y, ringR, 0, TAU);
      ctx.stroke();

      ctx.strokeStyle = `rgba(20, 20, 20, ${0.45 * alpha})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(burst.x - state.cameraX, burst.y, ringR * 0.76, 0, TAU);
      ctx.stroke();

      const sparkCount = Math.round(22 + fx * 58);
      for (let i = 0; i < sparkCount; i += 1) {
        const a = Math.random() * TAU + burst.seed;
        const rr = ringR * (0.18 + Math.random() * 1.02);
        const px = burst.x - state.cameraX + Math.cos(a) * rr;
        const py = burst.y + Math.sin(a) * rr;
        const size = 1 + Math.random() * 2.2;
        const shade = Math.random() < 0.7 ? 20 : 255;
        ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade === 255 ? 255 : 60}, ${0.35 * alpha})`;
        ctx.fillRect(px, py, size, size);
      }
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of state.particles) {
      const alpha = clamp(p.life / p.ttl, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgba(${p.tone || "123, 123, 123"}, 0.95)`;
      ctx.beginPath();
      ctx.arc(p.x - state.cameraX, p.y, p.size, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawGameOverBanner() {
    if (state.phase !== "gameover") {
      return;
    }

    let text = "DRAW";
    if (state.winnerTeam && state.winnerTeam !== "draw") {
      const winnerTank = state.tanks.find((tank) => tank.alive && tank.team === state.winnerTeam);
      if (state.config.humanPlayers <= 1) {
        text = winnerTank?.controller === "human" ? "YOU WIN" : "ENEMY WINS";
      } else {
        text = `${winnerTank?.teamName || "TEAM"} WINS`;
      }
    }

    ctx.save();
    ctx.translate(canvas.width * 0.5, canvas.height * 0.2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.fillRect(-165, -34, 330, 72);
    ctx.strokeRect(-165, -34, 330, 72);

    ctx.fillStyle = "#000000";
    ctx.font = "700 32px 'Comic Sans MS', 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 0, -4);
    ctx.font = "600 15px 'Comic Sans MS', 'Trebuchet MS', sans-serif";
    ctx.fillText("Press R to restart", 0, 22);
    ctx.restore();
  }

  function updateUi() {
    const active = getActiveTank();
    const isDrawPhase = state.phase === "draw_map";
    if (ui.turnCounter) {
      let counterText = isDrawPhase ? "DRAW MAP" : `TURN ${state.turnCounter}`;
      if (state.phase === "paused") {
        counterText += " (PAUSED)";
      } else if (state.phase === "gameover") {
        counterText += " (GAME OVER)";
      } else if (state.quakePendingTime > 0) {
        counterText += " (QUAKE)";
      }
      ui.turnCounter.textContent = counterText;
    }

    if (active) {
      if (ui.angleValue) {
        ui.angleValue.textContent = `${Math.round(getTrueShotAngleDeg(active))}°`;
      }
      if (ui.powerValue) {
        ui.powerValue.textContent = `${powerToPercent(active.power)}%`;
      }
      if (ui.moveValue) {
        ui.moveValue.textContent = `${Math.round(active.moveRemaining)} px`;
      }
      if (ui.moveFill) {
        ui.moveFill.style.width = `${clamp((active.moveRemaining / MAX_MOVE_PER_TURN) * 100, 0, 100)}%`;
      }
    } else if (isDrawPhase) {
      if (ui.angleValue) {
        ui.angleValue.textContent = "--";
      }
      if (ui.powerValue) {
        ui.powerValue.textContent = "--";
      }
      if (ui.moveValue) {
        ui.moveValue.textContent = "--";
      }
      if (ui.moveFill) {
        ui.moveFill.style.width = "0%";
      }
    } else {
      if (ui.moveValue) {
        ui.moveValue.textContent = "0 px";
      }
      if (ui.moveFill) {
        ui.moveFill.style.width = "0%";
      }
    }

    const canControl = isPlayerTurn();
    if (ui.angleSlider) {
      ui.angleSlider.disabled = true;
    }
    if (ui.powerSlider) {
      ui.powerSlider.disabled = true;
    }
    if (ui.fireBtn) {
      ui.fireBtn.textContent = isDrawPhase ? "USE MAP" : "FIRE";
      ui.fireBtn.disabled = isDrawPhase ? !state.drawMap.ready : !canControl;
    }

    const sniperCount = active?.powerups?.sniper || 0;
    const teleCount = active?.powerups?.teleport || 0;
    const quakeCount = active?.powerups?.earthquake || 0;
    const airstrikeCount = active?.powerups?.airstrike || 0;
    const laserCount = active?.powerups?.laser || 0;

    if (ui.sniperCount) {
      ui.sniperCount.textContent = `${sniperCount}`;
    }
    if (ui.teleportCount) {
      ui.teleportCount.textContent = `${teleCount}`;
    }
    if (ui.earthquakeCount) {
      ui.earthquakeCount.textContent = `${quakeCount}`;
    }
    if (ui.airstrikeCount) {
      ui.airstrikeCount.textContent = `${airstrikeCount}`;
    }
    if (ui.laserCount) {
      ui.laserCount.textContent = `${laserCount}`;
    }

    if (ui.sniperBtn) {
      ui.sniperBtn.disabled = isDrawPhase || !canControl;
      ui.sniperBtn.classList.toggle("active", state.selectedShotType === "sniper");
    }
    if (ui.teleportBtn) {
      ui.teleportBtn.disabled = isDrawPhase || !canControl;
      ui.teleportBtn.classList.toggle("active", state.abilityMode === "teleport_target");
    }
    if (ui.earthquakeBtn) {
      ui.earthquakeBtn.disabled = isDrawPhase || !canControl;
      ui.earthquakeBtn.classList.toggle("active", false);
    }
    if (ui.airstrikeBtn) {
      ui.airstrikeBtn.disabled = isDrawPhase || !canControl;
      ui.airstrikeBtn.classList.toggle("active", state.abilityMode === "airstrike_target");
    }
    if (ui.laserBtn) {
      ui.laserBtn.disabled = isDrawPhase || !canControl;
      ui.laserBtn.classList.toggle("active", state.selectedShotType === "laser");
    }
  }

  let lastTs = performance.now();

  function tick(ts) {
    const dt = clamp((ts - lastTs) / 1000, 0, 0.033);
    lastTs = ts;

    if (state.phase === "aim") {
      updateAimInput(dt);
      updateTankPhysics(dt);
    } else if (state.phase === "ai") {
      updateAi(dt);
      updateTankPhysics(dt);
    } else if (state.phase === "projectile") {
      updateProjectile(dt);
    } else if (state.phase === "resolving") {
      updateTankPhysics(dt);
      updateParticles(dt);
      state.resolveTimeout += dt;

      if (tanksAreStill() && state.particles.length === 0 && state.bursts.length === 0) {
        state.settleTimer += dt;
      } else {
        state.settleTimer = 0;
      }

      if (state.settleTimer > 0.5 || state.resolveTimeout > 2.4) {
        advanceTurn();
      }
    } else if (state.phase === "gameover") {
      updateParticles(dt);
      updateTankPhysics(dt);
    } else if (state.phase === "paused") {
      // Freeze gameplay while paused.
    }

    if (state.phase !== "menu" && state.phase !== "paused" && state.phase !== "resolving" && state.phase !== "gameover") {
      updateParticles(dt);
    }

    if (state.phase !== "menu" && state.phase !== "paused") {
      updateQuakePending(dt);
    }

    updateCamera(dt);
    if (state.phase === "draw_map" && state.drawMap.drawing && pointer.initialized) {
      appendDrawPoint(pointer.x + state.cameraX, pointer.y);
    }
    updateScreenShake(dt);

    const gameplayBottom = getGameplayBottomY();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, gameplayBottom);
    ctx.clip();
    ctx.translate(state.screenShakeX, state.screenShakeY);

    drawBackground();
    drawTerrain();
    drawMapEditorOverlay();

    for (const tank of state.tanks) {
      drawTank(tank);
    }

    drawPowerUps();
    drawProjectile();
    drawLaserCuts();
    drawExplosionBursts();
    drawParticles();
    drawGameOverBanner();

    ctx.restore();

    updateUi();

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);

  window.addEventListener("keydown", (event) => {
    ensureAudio();

    if (event.code === "KeyP") {
      event.preventDefault();
      togglePause();
      return;
    }

    if (event.code === "Escape") {
      if (state.phase === "paused") {
        setPauseOpen(false);
      } else {
        setSettingsOpen(false);
      }
    }

    if (state.phase === "menu" && (event.code === "Enter" || event.code === "Space")) {
      event.preventDefault();
      startGame();
      return;
    }
    if (state.phase === "menu") {
      return;
    }
    if (state.phase === "paused") {
      return;
    }

    if (state.phase === "draw_map") {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        confirmDrawnMapAndStart();
      } else if (event.code === "KeyR") {
        event.preventDefault();
        resetDrawMapStroke();
        setStatus("Map cleared. Draw one continuous edge-to-edge line");
      }
      return;
    }

    keys.add(event.code);

    if (event.code.startsWith("Arrow") || event.code === "Space") {
      event.preventDefault();
    }

    if (event.code === "Space") {
      fireActiveTank();
    }

    if (event.code === "KeyR") {
      resetMatch();
    }
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });

  canvas.addEventListener("pointerdown", (event) => {
    ensureAudio();
    updatePointerFromEvent(event);
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    if (state.phase === "menu" || state.phase === "paused") {
      return;
    }
    if (state.phase === "draw_map") {
      if (!state.drawMap.drawing) {
        state.drawMap.pointerId = event.pointerId;
        state.drawMap.drawing = true;
        state.drawMap.points = [];
        state.drawMap.previewPoints = [];
        state.drawMap.ready = false;
        state.drawMap.surface = null;
        appendDrawPoint(pointer.x + state.cameraX, pointer.y);
        if (canvas.setPointerCapture) {
          canvas.setPointerCapture(event.pointerId);
        }
        setStatus("Drawing... click again to stop at the opposite edge");
      } else {
        appendDrawPoint(pointer.x + state.cameraX, pointer.y);
        state.drawMap.drawing = false;
        if (canvas.releasePointerCapture && state.drawMap.pointerId !== null && canvas.hasPointerCapture(state.drawMap.pointerId)) {
          canvas.releasePointerCapture(state.drawMap.pointerId);
        }
        state.drawMap.pointerId = null;
        tryFinalizeDrawMap();
      }
      event.preventDefault();
      return;
    }
    if (!isPlayerTurn()) {
      return;
    }
    if (state.abilityMode) {
      return;
    }

    setAimDragActive(true, event.pointerId);
    if (canvas.setPointerCapture) {
      canvas.setPointerCapture(event.pointerId);
    }
    applyDragAimToActiveTank(pointer.x + state.cameraX, pointer.y);
    event.preventDefault();
  });

  canvas.addEventListener("pointermove", (event) => {
    updatePointerFromEvent(event);
    if (state.phase === "draw_map") {
      if (!state.drawMap.drawing) {
        return;
      }
      if (state.drawMap.pointerId !== null && state.drawMap.pointerId !== event.pointerId) {
        return;
      }
      appendDrawPoint(pointer.x + state.cameraX, pointer.y);
      event.preventDefault();
      return;
    }
    if (!aimDrag.active || event.pointerId !== aimDrag.pointerId) {
      return;
    }
    if (!isPlayerTurn() || state.abilityMode) {
      return;
    }

    applyDragAimToActiveTank(pointer.x + state.cameraX, pointer.y);
    event.preventDefault();
  });

  canvas.addEventListener("pointerup", (event) => {
    updatePointerFromEvent(event);
    if (state.phase === "draw_map") {
      return;
    }
    if (aimDrag.active && event.pointerId === aimDrag.pointerId) {
      setAimDragActive(false);
      if (canvas.releasePointerCapture && canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    }
    if (!isPlayerTurn()) {
      return;
    }

    const worldX = pointer.x + state.cameraX;
    const worldY = pointer.y;

    if (state.abilityMode === "airstrike_target") {
      tryAirstrikeTarget(worldX, worldY);
      return;
    }

    if (state.abilityMode === "teleport_target") {
      if (!tryTeleportTo(worldX)) {
        setStatus("Teleport unavailable");
      }
      return;
    }
  });

  canvas.addEventListener("pointercancel", (event) => {
    if (state.phase === "draw_map" && state.drawMap.pointerId === event.pointerId) {
      state.drawMap.pointerId = null;
      state.drawMap.drawing = false;
      return;
    }
    if (aimDrag.active && event.pointerId === aimDrag.pointerId) {
      setAimDragActive(false);
    }
  });

  if (ui.angleSlider) {
    ui.angleSlider.addEventListener("input", () => {
      if (!isPlayerTurn()) {
        return;
      }

      const tank = getActiveTank();
      if (!tank) {
        return;
      }

      tank.angle = clampAimDeg(Number(ui.angleSlider.value));
      syncControlsFromActive();
    });
  }

  if (ui.powerSlider) {
    ui.powerSlider.addEventListener("input", () => {
      if (!isPlayerTurn()) {
        return;
      }

      const tank = getActiveTank();
      if (!tank) {
        return;
      }

      tank.power = clamp(Number(ui.powerSlider.value), MIN_POWER, MAX_POWER);
      syncControlsFromActive();
    });
  }

  if (ui.fireBtn) {
    ui.fireBtn.addEventListener("click", () => {
      ensureAudio();
      if (state.phase === "draw_map") {
        confirmDrawnMapAndStart();
        return;
      }
      fireActiveTank();
    });
  }

  if (ui.humanPlayersBtn) {
    ui.humanPlayersBtn.addEventListener("click", () => {
      cycleHumanPlayers();
    });
  }

  if (ui.mapSourceBtn) {
    ui.mapSourceBtn.addEventListener("click", () => {
      cycleMapSourceMode();
    });
  }

  if (ui.terrainModeBtn) {
    ui.terrainModeBtn.addEventListener("click", () => {
      cycleTerrainMode();
    });
  }

  if (ui.sniperBtn) {
    ui.sniperBtn.addEventListener("click", () => {
      activatePowerUp("sniper");
    });
  }

  if (ui.teleportBtn) {
    ui.teleportBtn.addEventListener("click", () => {
      activatePowerUp("teleport");
    });
  }

  if (ui.earthquakeBtn) {
    ui.earthquakeBtn.addEventListener("click", () => {
      activatePowerUp("earthquake");
    });
  }

  if (ui.airstrikeBtn) {
    ui.airstrikeBtn.addEventListener("click", () => {
      activatePowerUp("airstrike");
    });
  }

  if (ui.laserBtn) {
    ui.laserBtn.addEventListener("click", () => {
      activatePowerUp("laser");
    });
  }

  if (ui.startBtn) {
    ui.startBtn.addEventListener("click", () => {
      startGame();
    });
  }

  if (ui.quickStartBtn) {
    ui.quickStartBtn.addEventListener("click", () => {
      state.config = {
        humanPlayers: 1,
        mapSize: DEFAULT_MAP_SIZE,
        playerCount: 1,
        enemyCount: 2,
        aiDifficulty: "normal",
        maxHealth: DEFAULT_MAX_HP,
        mapSource: "random",
        terrainMode: "hilly"
      };
      syncMenuControls();
      startGame();
    });
  }

  if (ui.openCustomBtn) {
    ui.openCustomBtn.addEventListener("click", () => {
      setMenuView("custom");
    });
  }

  if (ui.backMainBtn) {
    ui.backMainBtn.addEventListener("click", () => {
      setMenuView("main");
    });
  }

  if (ui.menuSettingsBtn) {
    ui.menuSettingsBtn.addEventListener("click", () => {
      setSettingsOpen(true);
    });
  }

  if (ui.settingsCloseBtn) {
    ui.settingsCloseBtn.addEventListener("click", () => {
      setSettingsOpen(false);
    });
  }

  if (ui.pauseMapBtn) {
    ui.pauseMapBtn.addEventListener("click", () => {
      togglePause();
    });
  }

  if (ui.resumeBtn) {
    ui.resumeBtn.addEventListener("click", () => {
      setPauseOpen(false);
    });
  }

  if (ui.pauseRestartBtn) {
    ui.pauseRestartBtn.addEventListener("click", () => {
      setPauseOpen(false);
      if (state.config.mapSource === "drawn" && !state.customSurfaceY) {
        beginDrawMapPhase();
      } else {
        resetMatch();
      }
    });
  }

  if (ui.pauseMainBtn) {
    ui.pauseMainBtn.addEventListener("click", () => {
      openMenu();
    });
  }

  if (ui.pauseSettingsBtn) {
    ui.pauseSettingsBtn.addEventListener("click", () => {
      setSettingsOpen(true);
    });
  }

  if (ui.pauseHelpBtn) {
    ui.pauseHelpBtn.addEventListener("click", () => {
      if (!ui.pauseHelp) {
        return;
      }
      const isOpen = !ui.pauseHelp.classList.contains("hidden");
      setPauseHelpOpen(!isOpen);
    });
  }

  if (ui.fxIntensitySlider) {
    ui.fxIntensitySlider.addEventListener("input", () => {
      setFxIntensity(Number(ui.fxIntensitySlider.value) / 100);
    });
  }

  syncMenuControls();
  setFxIntensity(state.settings.fxIntensity);
  resize();
  openMenu();
  requestAnimationFrame(tick);
})();
