export type SoundKey =
  | 'ui_click'
  | 'ui_navigate'
  | 'correct'
  | 'pass'
  | 'timer_warn'
  | 'timer_end'
  | 'act_end'
  | 'game_start'
  | 'final_win'
  | 'error';

type SoundFn = (ctx: AudioContext, dest: AudioNode) => void;

// ── primitive: single oscillator note with attack/decay envelope ──────────────

function tone(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  endFreq: number,
  duration: number,
  gain: number,
  type: OscillatorType = 'sine',
  startOffset = 0,
) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.connect(env);
  env.connect(dest);

  const t0 = ctx.currentTime + startOffset;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq !== freq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 20), t0 + duration);
  }

  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(gain, t0 + 0.006);
  env.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// ── sound catalog ─────────────────────────────────────────────────────────────

const SOUNDS: Record<SoundKey, SoundFn> = {
  ui_click(ctx, dest) {
    tone(ctx, dest, 900, 600, 0.07, 0.22);
  },

  ui_navigate(ctx, dest) {
    tone(ctx, dest, 480, 780, 0.10, 0.15);
    tone(ctx, dest, 680, 980, 0.10, 0.08, 'sine', 0.04);
  },

  correct(ctx, dest) {
    tone(ctx, dest, 880, 880, 0.10, 0.32);
    tone(ctx, dest, 1174, 1174, 0.14, 0.30, 'sine', 0.10);
    tone(ctx, dest, 1318, 1318, 0.22, 0.28, 'sine', 0.22);
  },

  pass(ctx, dest) {
    tone(ctx, dest, 420, 260, 0.13, 0.18);
  },

  timer_warn(ctx, dest) {
    tone(ctx, dest, 880, 880, 0.05, 0.20, 'square');
  },

  timer_end(ctx, dest) {
    [0, 0.18, 0.36].forEach(off => {
      tone(ctx, dest, 220, 160, 0.10, 0.28, 'square', off);
    });
  },

  act_end(ctx, dest) {
    [523, 659, 784].forEach((f, i) => {
      tone(ctx, dest, f, f, 0.20, 0.28, 'sine', i * 0.14);
    });
  },

  game_start(ctx, dest) {
    [523, 587, 659, 784].forEach((f, i) => {
      tone(ctx, dest, f, f, 0.14, 0.26, 'sine', i * 0.12);
    });
  },

  final_win(ctx, dest) {
    [523, 659, 784, 1046].forEach((f, i) => {
      tone(ctx, dest, f, f, i === 3 ? 0.40 : 0.16, 0.28, 'sine', i * 0.13);
    });
    tone(ctx, dest, 1318, 1318, 0.45, 0.18, 'sine', 0.52);
  },

  error(ctx, dest) {
    tone(ctx, dest, 240, 160, 0.14, 0.22, 'sawtooth');
    tone(ctx, dest, 200, 140, 0.14, 0.16, 'sawtooth', 0.06);
  },
};

// ── service singleton ─────────────────────────────────────────────────────────

class SfxService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _muted = false;
  private _volume = 0.8;

  private getCtx(): { ctx: AudioContext; dest: AudioNode } | null {
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this._muted ? 0 : this._volume;
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return { ctx: this.ctx, dest: this.masterGain! };
    } catch {
      return null;
    }
  }

  get muted(): boolean { return this._muted; }
  get volume(): number { return this._volume; }

  setVolume(v: number): void {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain && !this._muted) {
      this.masterGain.gain.value = this._volume;
    }
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this._volume;
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this._muted);
    return this._muted;
  }

  play(key: SoundKey): void {
    if (this._muted) return;
    const audio = this.getCtx();
    if (!audio) return;
    try {
      SOUNDS[key]?.(audio.ctx, audio.dest);
    } catch {
      // silently ignore audio errors
    }
  }
}

export const sfxService = new SfxService();
