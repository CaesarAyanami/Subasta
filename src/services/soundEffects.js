// ============================================================================
// SISTEMA DE SONIDO ARCADE
// Sintetizador 8-bit con Web Audio API + fallback opcional a MP3
// ============================================================================

const MUTE_KEY = "arcade_auction_muted";
const AUDIO_BASE_PATH = "/sounds";

/**
 * Gestiona todos los efectos de sonido de la app.
 * Todo está sintetizado, sin archivos externos.
 * Si existen MP3 en /public/sounds/, los usa preferentemente.
 */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;

    // Cache de disponibilidad de MP3 (evita repetir 404s)
    this._fileAvailableCache = new Map();

    // Cache de Audio objects por archivo
    this._audioCache = new Map();

    // Cargar preferencia de silencio
    try {
      const savedMute = localStorage.getItem(MUTE_KEY);
      if (savedMute !== null) {
        this.muted = JSON.parse(savedMute);
      }
    } catch (e) {
      console.warn("[sound] No se pudo leer localStorage:", e);
    }
  }

  // ==========================================================================
  // CONTEXTO
  // ==========================================================================

  /**
   * Inicializa el AudioContext en la primera interacción del usuario.
   * Debe llamarse desde un evento (click, keydown) por las autoplay policies.
   */
  initContext() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch (e) {
          console.warn("[sound] No se pudo crear AudioContext:", e);
        }
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  destroy() {
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {
        // Ignorar
      }
      this.ctx = null;
    }
    this._audioCache.clear();
    this._fileAvailableCache.clear();
  }

  // ==========================================================================
  // MUTE
  // ==========================================================================
  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem(MUTE_KEY, JSON.stringify(this.muted));
    } catch (e) {
      // Ignorar
    }
    return this.muted;
  }

  setMuted(value) {
    this.muted = !!value;
    try {
      localStorage.setItem(MUTE_KEY, JSON.stringify(this.muted));
    } catch (e) {
      // Ignorar
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // ==========================================================================
  // HELPER: crear un oscilador con envelope
  // ==========================================================================
  _playTone({
    freq,
    freqEnd,
    duration = 0.15,
    type = "square",
    volume = 0.15,
    delay = 0,
    attack = 0,
  }) {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (freqEnd != null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t + duration);
      }

      gain.gain.setValueAtTime(attack === 0 ? volume : 0.001, t);
      if (attack > 0) {
        gain.gain.linearRampToValueAtTime(volume, t + attack);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      } else {
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    } catch (e) {
      // Silencioso
    }
  }

  /**
   * Reproduce secuencia de notas.
   * notes: [{f, d, type?, volume?}]
   */
  _playSequence(notes) {
    if (this.muted || !this.ctx) return;
    let offset = 0;
    notes.forEach((note) => {
      this._playTone({
        freq: note.f,
        duration: note.d,
        type: note.type || "square",
        volume: note.volume ?? 0.15,
        delay: offset,
      });
      offset += note.d * 0.9;
    });
  }

  // ==========================================================================
  // CARGA DE ARCHIVOS CON FALLBACK A SYNTH
  // ==========================================================================
  playFileWithFallback(filename, synthFallback) {
    if (this.muted) return;
    this.initContext();

    const cached = this._fileAvailableCache.get(filename);
    if (cached === false) {
      synthFallback();
      return;
    }

    const audioPath = `${AUDIO_BASE_PATH}/${filename}.mp3`;

    let audio = this._audioCache.get(filename);
    if (!audio) {
      audio = new Audio(audioPath);
      audio.preload = "auto";
      this._audioCache.set(filename, audio);
    } else {
      try {
        audio.currentTime = 0;
      } catch (e) {
        // Ignorar
      }
    }

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => this._fileAvailableCache.set(filename, true))
        .catch(() => {
          this._fileAvailableCache.set(filename, false);
          this._audioCache.delete(filename);
          synthFallback();
        });
    } else {
      synthFallback();
    }
  }

  // ==========================================================================
  // 1. MONEDA / PUJA
  // ==========================================================================
  playCoin() {
    this.playFileWithFallback("coin", () => {
      this._playTone({ freq: 987.77, duration: 0.08, type: "square", volume: 0.2 });
      this._playTone({ freq: 1318.51, duration: 0.27, type: "square", volume: 0.2, delay: 0.08 });
    });
  }

  // ==========================================================================
  // 2. TICK DE RULETA
  // ==========================================================================
  playRouletteTick(pitchMultiplier = 1) {
    if (this.muted) return;
    this.initContext();
    this._playTone({
      freq: 440 * pitchMultiplier,
      freqEnd: 110,
      duration: 0.04,
      type: "triangle",
      volume: 0.12,
    });
  }

  // ==========================================================================
  // 3. REVELACIÓN GACHA
  // ==========================================================================
  playGachaReveal(rarity = "R") {
    this.playFileWithFallback("gacha_reveal", () => {
      if (rarity === "LR") {
        // Fanfarria épica
        [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) => {
          this._playTone({
            freq: f,
            duration: 0.8,
            type: "sawtooth",
            volume: 0.15,
            delay: i * 0.06,
          });
        });
      } else if (rarity === "UR" || rarity === "SSR") {
        [440, 554.37, 659.25, 880].forEach((f, i) => {
          this._playTone({
            freq: f,
            duration: 0.6,
            type: "square",
            volume: 0.12,
            delay: i * 0.07,
          });
        });
      } else if (rarity === "SR") {
        [587.33, 739.99, 880].forEach((f, i) => {
          this._playTone({
            freq: f,
            duration: 0.4,
            type: "triangle",
            volume: 0.15,
            delay: i * 0.08,
          });
        });
      } else {
        this._playTone({
          freq: 523.25,
          freqEnd: 659.25,
          duration: 0.3,
          type: "sine",
          volume: 0.15,
        });
      }
    });
  }

  // ==========================================================================
  // 4. TICK DE CUENTA REGRESIVA
  // ==========================================================================
  playTimerTick(isUrgent = false) {
    if (this.muted) return;
    this.initContext();
    this._playTone({
      freq: isUrgent ? 880 : 523.25,
      duration: isUrgent ? 0.08 : 0.04,
      type: "square",
      volume: isUrgent ? 0.18 : 0.08,
    });
  }

  // ==========================================================================
  // 5. VICTORIA
  // ==========================================================================
  playVictory() {
    this.playFileWithFallback("win", () => {
      this._playSequence([
        { f: 523.25, d: 0.1, type: "triangle", volume: 0.2 },
        { f: 659.25, d: 0.1, type: "triangle", volume: 0.2 },
        { f: 783.99, d: 0.1, type: "triangle", volume: 0.2 },
        { f: 1046.5, d: 0.3, type: "triangle", volume: 0.2 },
      ]);
    });
  }

  // ==========================================================================
  // 6. DESECHADO
  // ==========================================================================
  playDiscard() {
    this.playFileWithFallback("discard", () => {
      this._playTone({
        freq: 329.63,
        freqEnd: 130.81,
        duration: 0.4,
        type: "sawtooth",
        volume: 0.15,
      });
    });
  }

  // ==========================================================================
  // 7. JUGADOR LISTO
  // ==========================================================================
  playReady() {
    this.playFileWithFallback("ready", () => {
      this._playTone({
        freq: 440,
        freqEnd: 880,
        duration: 0.18,
        type: "sine",
        volume: 0.15,
      });
    });
  }

  // ==========================================================================
  // 8. CLICK GENERAL
  // ==========================================================================
  playClick() {
    if (this.muted) return;
    this.initContext();
    this._playTone({
      freq: 600,
      freqEnd: 200,
      duration: 0.03,
      type: "sine",
      volume: 0.08,
    });
  }

  // ==========================================================================
  // 9. PUJA ACEPTADA
  // ==========================================================================
  playBid() {
    this.playFileWithFallback("bid", () => {
      this._playTone({ freq: 660, duration: 0.06, type: "square", volume: 0.18 });
      this._playTone({ freq: 990, duration: 0.2, type: "square", volume: 0.18, delay: 0.06 });
    });
  }

  // ==========================================================================
  // 10. ERROR / RECHAZO
  // ==========================================================================
  playError() {
    if (this.muted) return;
    this.initContext();
    this._playTone({ freq: 220, duration: 0.08, type: "sawtooth", volume: 0.15 });
    this._playTone({ freq: 180, duration: 0.17, type: "sawtooth", volume: 0.15, delay: 0.08 });
  }

  // ==========================================================================
  // 11. NUEVA RONDA
  // ==========================================================================
  playNewRound() {
    this.playFileWithFallback("new_round", () => {
      [523.25, 659.25, 783.99].forEach((f, i) => {
        this._playTone({
          freq: f,
          duration: 0.2,
          type: "triangle",
          volume: 0.15,
          delay: i * 0.09,
        });
      });
    });
  }

  // ==========================================================================
  // 12. ALERTA PITY (60-89%)
  // ==========================================================================
  playPityWarning() {
    if (this.muted) return;
    this.initContext();
    this._playTone({
      freq: 660,
      freqEnd: 880,
      duration: 0.15,
      type: "triangle",
      volume: 0.12,
    });
    this._playTone({
      freq: 880,
      freqEnd: 990,
      duration: 0.15,
      type: "triangle",
      volume: 0.12,
      delay: 0.15,
    });
  }

  // ==========================================================================
  // 13. PITY CRÍTICO (90-99%)
  // ==========================================================================
  playPityCritical() {
    if (this.muted) return;
    this.initContext();
    // Corazón acelerado
    [0, 0.12, 0.24].forEach((delay, i) => {
      this._playTone({
        freq: 880 + i * 100,
        duration: 0.1,
        type: "square",
        volume: 0.15,
        delay,
      });
    });
    this._playTone({
      freq: 1200,
      freqEnd: 1500,
      duration: 0.3,
      type: "sine",
      volume: 0.15,
      delay: 0.4,
    });
  }

  // ==========================================================================
  // 14. MODIFICADOR AL ALZA (OFERTA +N)
  // ==========================================================================
  playModifierUp() {
    if (this.muted) return;
    this.initContext();
    [0, 0.06, 0.12, 0.18].forEach((delay, i) => {
      this._playTone({
        freq: 440 + i * 110,
        duration: 0.12,
        type: "square",
        volume: 0.18,
        delay,
      });
    });
  }

  // ==========================================================================
  // 15. MODIFICADOR A LA BAJA (CONTRAOFERTA -N)
  // ==========================================================================
  playModifierDown() {
    if (this.muted) return;
    this.initContext();
    [0, 0.06, 0.12, 0.18].forEach((delay, i) => {
      this._playTone({
        freq: 880 - i * 110,
        duration: 0.12,
        type: "square",
        volume: 0.18,
        delay,
      });
    });
  }

  // ==========================================================================
  // 16. MODAL ABRIÉNDOSE
  // ==========================================================================
  playModalOpen() {
    if (this.muted) return;
    this.initContext();
    this._playTone({
      freq: 400,
      freqEnd: 800,
      duration: 0.15,
      type: "sine",
      volume: 0.1,
    });
    this._playTone({
      freq: 800,
      freqEnd: 1200,
      duration: 0.1,
      type: "sine",
      volume: 0.08,
      delay: 0.12,
    });
  }

  // ==========================================================================
  // 17. MODAL CERRÁNDOSE
  // ==========================================================================
  playModalClose() {
    if (this.muted) return;
    this.initContext();
    this._playTone({
      freq: 800,
      freqEnd: 400,
      duration: 0.12,
      type: "sine",
      volume: 0.1,
    });
  }

  // ==========================================================================
  // 18. LÍMITE DE SUBASTAS ALCANZADO
  // ==========================================================================
  playLimitReached() {
    if (this.muted) return;
    this.initContext();
    // Alerta de sirena corta
    this._playTone({
      freq: 600,
      freqEnd: 1000,
      duration: 0.2,
      type: "square",
      volume: 0.15,
    });
    this._playTone({
      freq: 1000,
      freqEnd: 600,
      duration: 0.2,
      type: "square",
      volume: 0.15,
      delay: 0.2,
    });
  }

  // ==========================================================================
  // 19. HINT / TEASER (indicador rotativo)
  // ==========================================================================
  playHint() {
    if (this.muted) return;
    this.initContext();
    this._playTone({
      freq: 1200,
      freqEnd: 1500,
      duration: 0.06,
      type: "sine",
      volume: 0.06,
    });
  }

  // ==========================================================================
  // 20. SELLO DE APROBACIÓN (consenso alcanzado)
  // ==========================================================================
  playConsensus() {
    if (this.muted) return;
    this.initContext();
    [1046.5, 1318.51, 1567.98].forEach((f, i) => {
      this._playTone({
        freq: f,
        duration: 0.25,
        type: "triangle",
        volume: 0.18,
        delay: i * 0.08,
      });
    });
  }
}

// ============================================================================
// EXPORT
// ============================================================================
export const sounds = new SoundManager();
export default sounds;