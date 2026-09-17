// Sistema de Sonido Arcade con Sintetizador 8-bit Web Audio API + Fallback de archivos MP3
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.soundCache = {};
    
    // Cargar preferencia de silencio
    try {
      const savedMute = localStorage.getItem('arcade_auction_muted');
      if (savedMute !== null) {
        this.muted = JSON.parse(savedMute);
      }
    } catch (e) {
      console.warn('No se pudo acceder a localStorage', e);
    }
  }

  // Inicializar contexto de audio en la primera interacción del usuario
  initContext() {
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

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('arcade_auction_muted', JSON.stringify(this.muted));
    } catch (e) {}
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Intenta reproducir un archivo local /sounds/[name].mp3 si existe
  playFileWithFallback(filename, synthFallback) {
    if (this.muted) return;
    this.initContext();

    const audioPath = `/sounds/${filename}.mp3`;
    const audio = new Audio(audioPath);
    
    // Si el archivo no existe o falla, se ejecuta la síntesis 8-bit nativa
    audio.play().catch(() => {
      synthFallback();
    });
  }

  // 1. Sonido de Moneda / Puja (+1 Moneda)
  playCoin() {
    this.playFileWithFallback('coin', () => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
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

  // 2. Tic-tac de ruleta
  playRouletteTick(pitchMultiplier = 1) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440 * pitchMultiplier, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.045);
  }

  // 3. Revelación Gacha según rareza
  playGachaReveal(rarity = 'R') {
    this.playFileWithFallback('gacha_reveal', () => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;

      if (rarity === 'LR') {
        // Fanfarria masiva legendaria
        const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t + idx * 0.06);

          gain.gain.setValueAtTime(0.15, t + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t + idx * 0.06);
          osc.stop(t + idx * 0.06 + 0.85);
        });
      } else if (rarity === 'UR' || rarity === 'SSR') {
        // Acorde épico cósmico
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, t + idx * 0.07);

          gain.gain.setValueAtTime(0.12, t + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.6);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t + idx * 0.07);
          osc.stop(t + idx * 0.07 + 0.65);
        });
      } else if (rarity === 'SR') {
        // Brillo dorado
        [587.33, 739.99, 880].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + idx * 0.08);

          gain.gain.setValueAtTime(0.15, t + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t + idx * 0.08);
          osc.stop(t + idx * 0.08 + 0.45);
        });
      } else {
        // Estándar R
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, t);
        osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.15);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.35);
      }
    });
  }

  // 4. Tic-tac de cuenta regresiva
  playTimerTick(isUrgent = false) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(isUrgent ? 880 : 523.25, t);

    gain.gain.setValueAtTime(isUrgent ? 0.18 : 0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isUrgent ? 0.08 : 0.04));

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // 5. Victoria de subasta (Compra confirmada)
  playVictory() {
    this.playFileWithFallback('win', () => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      // Melodía tipo Level Clear
      const notes = [
        { f: 523.25, d: 0.1 },
        { f: 659.25, d: 0.1 },
        { f: 783.99, d: 0.1 },
        { f: 1046.5, d: 0.3 }
      ];

      let offset = 0;
      notes.forEach((note) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t + offset);

        gain.gain.setValueAtTime(0.2, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + offset);
        osc.stop(t + offset + note.d + 0.05);
        offset += note.d * 0.9;
      });
    });
  }

  // 6. Personaje Desechado (Tiempo expirado sin postor)
  playDiscard() {
    this.playFileWithFallback('discard', () => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(329.63, t);
      osc.frequency.exponentialRampToValueAtTime(130.81, t + 0.4);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.42);
    });
  }

  // 7. Jugador "Listo"
  playReady() {
    this.playFileWithFallback('ready', () => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  // 8. Clic general de botón
  playClick() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.03);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.035);
  }
}

export const sounds = new SoundManager();
export default sounds;
