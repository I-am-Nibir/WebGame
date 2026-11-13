import { useGameStore } from "./store";

interface ToneOpts {
  type?: OscillatorType;
  to?: number;
  at?: number;
  vol?: number;
}

/** Tiny Web Audio synth. Respects the global mute switch in the store. */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!useGameStore.getState().soundEnabled) return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      const comp = this.ctx.createDynamicsCompressor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.7;
      this.master.connect(comp);
      comp.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, dur: number, o: ToneOpts = {}) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t0 = ctx.currentTime + (o.at ?? 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type ?? "sine";
    osc.frequency.setValueAtTime(freq, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol ?? 0.3, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /** Call from a user gesture to unlock audio on iOS/Safari. */
  unlock() {
    this.ensure();
  }

  pop(pitch = 1) {
    this.tone(450 * pitch, 0.09, { to: 900 * pitch, vol: 0.35 });
  }
  coin() {
    this.tone(987.77, 0.15, { type: "triangle" });
    this.tone(1318.51, 0.2, { type: "triangle", at: 0.07 });
  }
  slice() {
    this.tone(800, 0.12, { type: "sawtooth", to: 200, vol: 0.15 });
  }
  note(freq: number) {
    this.tone(freq, 0.7, { vol: 0.45 });
    this.tone(freq * 2, 0.35, { vol: 0.08 });
  }
  wrong() {
    this.tone(220, 0.25, { type: "square", to: 140, vol: 0.12 });
  }
  thud() {
    this.tone(180, 0.15, { to: 70, vol: 0.4 });
  }
  bonk() {
    this.tone(330, 0.12, { type: "triangle", to: 160, vol: 0.4 });
    this.tone(660, 0.08, { type: "square", vol: 0.08 });
  }
  star() {
    [783.99, 987.77, 1318.51].forEach((f, i) => this.tone(f, 0.18, { type: "triangle", at: i * 0.06, vol: 0.25 }));
  }
  tick() {
    this.tone(1200, 0.04, { type: "square", vol: 0.06 });
  }
  whoosh() {
    this.tone(300, 0.2, { type: "sawtooth", to: 900, vol: 0.06 });
  }
  giggle() {
    [600, 760, 680, 880].forEach((f, i) => this.tone(f, 0.09, { at: i * 0.07, vol: 0.22 }));
  }
  win() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.tone(f, 0.28, { type: "triangle", at: i * 0.12, vol: 0.3 })
    );
  }
}

export const sounds = new SoundEngine();
