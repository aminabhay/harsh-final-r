import { useSyncExternalStore } from 'react';

/**
 * Soft background music, composed live with the Web Audio API (no audio files, no licences).
 * A slow F major progression (Fmaj7, Dm7, B♭maj7, C9sus) with warm pads, a quiet bass and a
 * music-box melody, all through a gentle generated reverb. It never autoplays: it only starts
 * from the guest pressing the music button, and pauses while the tab is hidden.
 */

const EIGHTH = 0.46; // seconds
const BAR = EIGHTH * 8;

const CHORDS = [
  { pad: [53, 57, 60, 64], bass: 41 }, // Fmaj7
  { pad: [50, 53, 57, 60], bass: 38 }, // Dm7
  { pad: [46, 50, 53, 57], bass: 34 }, // B♭maj7
  { pad: [48, 55, 58, 62], bass: 36 }, // C9sus
];

// [midi, eighth-step] per bar; two variations so the loop breathes.
const MELODY: [number, number][][][] = [
  [
    [[72, 0], [76, 2], [79, 3], [77, 5], [76, 6]],
    [[74, 0], [77, 2], [81, 3], [79, 5], [77, 6]],
    [[70, 0], [74, 2], [77, 3], [81, 5], [79, 6]],
    [[72, 0], [74, 2], [79, 3], [76, 5], [74, 6]],
  ],
  [
    [[79, 0], [76, 3], [72, 6]],
    [[77, 0], [74, 3], [81, 5]],
    [[77, 0], [74, 3], [70, 6]],
    [[76, 0], [79, 3], [74, 6]],
  ],
];

const freq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

class SoftMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private timer = 0;
  private nextBar = 0;
  private barIndex = 0;
  playing = false;
  private listeners = new Set<() => void>();

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
  private emit() {
    this.listeners.forEach((l) => l());
  }

  private setup() {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2600;
    tone.connect(master);

    // Generated reverb impulse: softly decaying noise, a little longer on the right.
    const len = Math.floor(ctx.sampleRate * 3.2);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6 + ch * 0.3);
    }
    const reverb = ctx.createConvolver();
    reverb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    reverb.connect(wet).connect(tone);

    const bus = ctx.createGain();
    bus.gain.value = 0.8;
    bus.connect(tone);
    bus.connect(reverb);

    this.ctx = ctx;
    this.master = master;
    this.bus = bus;

    document.addEventListener('visibilitychange', () => {
      if (!this.ctx || !this.playing) return;
      if (document.hidden) this.ctx.suspend();
      else this.ctx.resume();
    });
  }

  private pad(midi: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.022, t + 1.4);
    g.gain.setValueAtTime(0.022, t + dur - 0.4);
    g.gain.linearRampToValueAtTime(0, t + dur + 1.6);
    g.connect(this.bus!);
    [-5, 5].forEach((cents) => {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = freq(midi);
      o.detune.value = cents;
      o.connect(g);
      o.start(t);
      o.stop(t + dur + 1.7);
    });
  }

  private bass(midi: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.8);
    g.connect(this.bus!);
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq(midi);
    o.connect(g);
    o.start(t);
    o.stop(t + dur + 0.9);
  }

  private bell(midi: number, t: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    g.connect(this.bus!);
    [
      [1, 1],
      [2, 0.22],
      [4.01, 0.05],
    ].forEach(([mult, amp]) => {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq(midi) * mult;
      og.gain.value = amp;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + 2.5);
    });
  }

  private schedule = () => {
    const ctx = this.ctx!;
    while (this.nextBar < ctx.currentTime + 1.5) {
      const t = this.nextBar;
      const i = this.barIndex % 4;
      const variation = Math.floor(this.barIndex / 4) % 2;
      const chord = CHORDS[i];
      chord.pad.forEach((m) => this.pad(m, t, BAR));
      this.bass(chord.bass, t, BAR);
      MELODY[variation][i].forEach(([m, step]) => this.bell(m, t + step * EIGHTH));
      this.nextBar += BAR;
      this.barIndex++;
    }
  };

  async play() {
    if (this.playing) return;
    if (!this.ctx) this.setup();
    const ctx = this.ctx!;
    await ctx.resume();
    this.playing = true;
    this.emit();
    this.nextBar = ctx.currentTime + 0.1;
    this.barIndex = 0;
    this.schedule();
    this.timer = window.setInterval(this.schedule, 250);
    const g = this.master!.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0.7, ctx.currentTime + 3);
  }

  pause() {
    if (!this.playing || !this.ctx) return;
    this.playing = false;
    this.emit();
    window.clearInterval(this.timer);
    const ctx = this.ctx;
    const g = this.master!.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
    window.setTimeout(() => {
      if (!this.playing) ctx.suspend();
    }, 1300);
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }
}

export const music = new SoftMusic();

export function useMusicPlaying(): boolean {
  return useSyncExternalStore(music.subscribe, () => music.playing, () => false);
}

export const musicSupported = () =>
  typeof window !== 'undefined' && !!(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);
