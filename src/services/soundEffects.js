// ============================================================================
// SISTEMA DE SONIDO ARCADE
// Sintetizador 8-bit con Web Audio API + fallback opcional a archivos MP3
// ============================================================================

const MUTE_KEY = "arcade_auction_muted";
const AUDIO_BASE_PATH = "/sounds";

/**
 * Gestiona todos los efectos de sonido de la app.
 * Diseñado para funcionar sin archivos MP3 (todo sintetizado).
 * Si existen archivos en /public/sounds/, los usa preferentemente.
 */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;

    // Cache de disponibilidad de archivos MP3 (evita repetir 404s)
    // Map<string, boolean | null>  →  null = no comprobado, false = no existe, true = existe
    this._fileAvailableCache = new Map();

    // Cache de Audio objects por archivo (limitado)
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

  /**
   * Cierra el AudioContext. Útil para cleanup.
   */
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
  // CARGA DE ARCHIVOS CON FALLBACK A SYNTH
  // ==========================================================================

  /**
   * Intenta reproducir un MP3 local. Si no existe (404) o falla el play,
   * ejecuta la función de síntesis como fallback.
   *
   * Optimizaciones:
   *  - Cache de disponibilidad: si un archivo dio 404 una vez, no se reintenta.
   *  - Cache de Audio objects: reusamos el mismo objeto para no crear mil.
   *
   * @param {string} filename - Nombre sin extensión (ej: 'coin')
   * @param {Function} synthFallback - Función que sintetiza el sonido
   */
  playFileWithFallback(filename, synthFallback) {
    if (this.muted) return;
    this.initContext();

    // Si ya sabemos que el archivo no existe, ir directo al synth
    const cached = this._fileAvailableCache.get(filename);
    if (cached === false) {
      synthFallback();
      return;
    }

    const audioPath = `${AUDIO_BASE_PATH}/${filename}.mp3`;

    // Reusar Audio object si ya existe
    let audio = this._audioCache.get(filename);
    if (!audio) {
      audio = new Audio(audioPath);
      audio.preload = "auto";
      this._audioCache.set(filename, audio);
    } else {
      // Resetear para permitir replay inmediato
      try {
        audio.currentTime = 0;
      } catch (e) {
        // Algunos navegadores lanzan si el audio no está cargado; ignorar
      }
    }

    const playPromise = audio.play();

    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          // Éxito: marcar archivo como disponible
          this._fileAvailableCache.set(filename, true);
        })
        .catch(() => {
          // Fallo: 404, autoplay bloqueado, o formato no soportado.
          // Marcar como no disponible y usar synth.
          this._fileAvailableCache.set(filename, false);
          this._audioCache.delete(filename);
          synthFallback();
        });
    } else {
      // Navegadores viejos sin promise: dejar pasar
      synthFallback();
    }
  }

  // ==========================================================================
  // 1. MONEDA / PUJA
  // ==========================================================================
  playCoin() {
    this.playFileWithFallback("coin", () => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(987.77, t); // B5
      osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  // ==========================================================================
  // 2. TICK DE RULETA
  // ==========================================================================
  playRouletteTick(pitchMultiplier = 1) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(440 * pitchMultiplier, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.04);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.045);
    } catch (e) {
      // Ignorar errores de audio
    }
  }

  // ==========================================================================
  // 3. REVELACIÓN GACHA SEGÚN RAREZA
  // ==========================================================================
  playGachaReveal(rarity = "R") {
    this.playFileWithFallback("gacha_reveal", () => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;

      try {
        if (rarity === "LR") {
          // Fanfarria masiva legendaria
          const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
          freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, t + idx * 0.06);

            gain.gain.setValueAtTime(0.15, t + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              t + idx * 0.06 + 0.8
            );

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t + idx * 0.06);
            osc.stop(t + idx * 0.06 + 0.85);
          });
        } else if (rarity === "UR" || rarity === "SSR") {
          // Acorde épico cósmico
          [440, 554.37, 659.25, 880].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(freq, t + idx * 0.07);

            gain.gain.setValueAtTime(0.12, t + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              t + idx * 0.07 + 0.6
            );

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t + idx * 0.07);
            osc.stop(t + idx * 0.07 + 0.65);
          });
        } else if (rarity === "SR") {
          // Brillo dorado
          [587.33, 739.99, 880].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, t + idx * 0.08);

            gain.gain.setValueAtTime(0.15, t + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              t + idx * 0.08 + 0.4
            );

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t + idx * 0.08);
            osc.stop(t + idx * 0.08 + 0.45);
          });
        } else {
          // Estándar R
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(523.25, t);
          osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.15);

          gain.gain.setValueAtTime(0.15, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t);
          osc.stop(t + 0.35);
        }
      } catch (e) {
        // Ignorar
      }
    });
  }

  // ==========================================================================
  // 4. TICK DE CUENTA REGRESIVA
  // ==========================================================================
  playTimerTick(isUrgent = false) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(isUrgent ? 880 : 523.25, t);

      gain.gain.setValueAtTime(isUrgent ? 0.18 : 0.08, t);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        t + (isUrgent ? 0.08 : 0.04)
      );

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {
      // Ignorar
    }
  }

  // ==========================================================================
  // 5. VICTORIA DE SUBASTA
  // ==========================================================================
  playVictory() {
    this.playFileWithFallback("win", () => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;

      try {
        const notes = [
          { f: 523.25, d: 0.1 },
          { f: 659.25, d: 0.1 },
          { f: 783.99, d: 0.1 },
          { f: 1046.5, d: 0.3 },
        ];

        let offset = 0;
        notes.forEach((note) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(note.f, t + offset);

          gain.gain.setValueAtTime(0.2, t + offset);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            t + offset + note.d
          );

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t + offset);
          osc.stop(t + offset + note.d + 0.05);
          offset += note.d * 0.9;
        });
      } catch (e) {
        // Ignorar
      }
    });
  }

  // ==========================================================================
  // 6. PERSONAJE DESECHADO
  // ==========================================================================
  playDiscard() {
    this.playFileWithFallback("discard", () => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(329.63, t);
        osc.frequency.exponentialRampToValueAtTime(130.81, t + 0.4);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.42);
      } catch (e) {
        // Ignorar
      }
    });
  }

  // ==========================================================================
  // 7. JUGADOR "LISTO"
  // ==========================================================================
  playReady() {
    this.playFileWithFallback("ready", () => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.2);
      } catch (e) {
        // Ignorar
      }
    });
  }

  // ==========================================================================
  // 8. CLICK GENERAL DE BOTÓN
  // ==========================================================================
  playClick() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.03);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.035);
    } catch (e) {
      // Ignorar
    }
  }

  // ==========================================================================
  // 9. NUEVO: PUJA ACEPTADA (para el flujo de subasta)
  // ==========================================================================
  playBid() {
    this.playFileWithFallback("bid", () => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(660, t);
        osc.frequency.setValueAtTime(990, t + 0.06);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.26);
      } catch (e) {
        // Ignorar
      }
    });
  }

  // ==========================================================================
  // 10. NUEVO: ERROR / RECHAZO (para validaciones)
  // ==========================================================================
  playError() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.setValueAtTime(180, t + 0.08);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    } catch (e) {
      // Ignorar
    }
  }

  // ==========================================================================
  // 11. NUEVO: NUEVA RONDA
  // ==========================================================================
  playNewRound() {
    this.playFileWithFallback("new_round", () => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;

      try {
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, t + idx * 0.09);

          gain.gain.setValueAtTime(0.15, t + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            t + idx * 0.09 + 0.2
          );

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t + idx * 0.09);
          osc.stop(t + idx * 0.09 + 0.22);
        });
      } catch (e) {
        // Ignorar
      }
    });
  }
}

// ============================================================================
// EXPORT
// ============================================================================
export const sounds = new SoundManager();
export default sounds;