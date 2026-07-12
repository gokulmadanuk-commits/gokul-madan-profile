/* STANDING WAVE — audio engine.
   Each touch is a voice: two barely-detuned saws + a sub sine through a
   lowpass, into a shared feedback-delay space and a gentle compressor.
   Beating between voices is REAL acoustic interference — the same |f1−f2|
   term the sand engine visualizes. Nothing is faked in either domain. */

'use strict';

class Space {
  /* Simple stereo feedback-delay "room" — dark, damped, unobtrusive. */
  constructor(ctx, out) {
    this.input = ctx.createGain();
    const dL = ctx.createDelay(1); dL.delayTime.value = 0.211;
    const dR = ctx.createDelay(1); dR.delayTime.value = 0.271;
    const fbL = ctx.createGain(); fbL.gain.value = 0.34;
    const fbR = ctx.createGain(); fbR.gain.value = 0.34;
    const damp = ctx.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 2400;
    const damp2 = ctx.createBiquadFilter(); damp2.type = 'lowpass'; damp2.frequency.value = 2100;
    const merger = ctx.createChannelMerger(2);
    const wet = ctx.createGain(); wet.gain.value = 0.16;
    this.input.connect(dL); this.input.connect(dR);
    dL.connect(damp); damp.connect(fbL); fbL.connect(dR);
    dR.connect(damp2); damp2.connect(fbR); fbR.connect(dL);
    dL.connect(merger, 0, 0); dR.connect(merger, 0, 1);
    merger.connect(wet); wet.connect(out);
  }
}

class Voice {
  constructor(ctx, dest, space) {
    this.ctx = ctx;
    const t = ctx.currentTime;
    this.oscA = ctx.createOscillator(); this.oscA.type = 'sawtooth';
    this.oscB = ctx.createOscillator(); this.oscB.type = 'sawtooth';
    this.sub = ctx.createOscillator(); this.sub.type = 'sine';
    this.oscA.detune.value = -3.5;
    this.oscB.detune.value = 3.5;
    this.subGain = ctx.createGain(); this.subGain.gain.value = 0.35;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass'; this.filter.Q.value = 0.8;
    this.gain = ctx.createGain(); this.gain.gain.value = 0;
    this.oscA.connect(this.filter);
    this.oscB.connect(this.filter);
    this.sub.connect(this.subGain); this.subGain.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(dest);
    this.gain.connect(space.input);
    this.oscA.start(t); this.oscB.start(t); this.sub.start(t);
    this.freq = 220;
    this.alive = true;
  }

  setFreq(f, glide = 0.04) {
    this.freq = f;
    const t = this.ctx.currentTime;
    for (const o of [this.oscA, this.oscB]) {
      o.frequency.cancelScheduledValues(t);
      o.frequency.setTargetAtTime(f, t, glide);
    }
    this.sub.frequency.setTargetAtTime(f * 0.5, t, glide);
    // filter tracks pitch so timbre stays even across the range
    this.filter.frequency.setTargetAtTime(Math.min(f * 3.2, 6500), t, glide);
  }

  setBrightness(b) { // 0..1 from x position
    const f = this.freq * (1.6 + b * 4.5);
    this.filter.frequency.setTargetAtTime(Math.min(f, 8000), this.ctx.currentTime, 0.06);
  }

  on(level = 0.16, attack = 0.06) {
    const t = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(t);
    this.gain.gain.setTargetAtTime(level, t, attack);
  }

  off(release = 0.35) {
    const t = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(t);
    this.gain.gain.setTargetAtTime(0, t, release / 3);
    this.alive = false;
    const doomed = [this.oscA, this.oscB, this.sub];
    setTimeout(() => { for (const o of doomed) { try { o.stop(); } catch (_) {} } }, release * 1000 + 600);
  }
}

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.voices = new Map();  // id → Voice
    this.muted = false;
  }

  /* Must be called synchronously inside a user gesture (iOS). */
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC({ latencyHint: 'interactive' });
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.comp = this.ctx.createDynamicsCompressor();
    this.comp.threshold.value = -18; this.comp.knee.value = 24;
    this.comp.ratio.value = 5; this.comp.attack.value = 0.01; this.comp.release.value = 0.24;
    this.master.connect(this.comp);
    this.comp.connect(this.ctx.destination);
    this.space = new Space(this.ctx, this.master);
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }

  get ready() { return !!this.ctx && this.ctx.state === 'running'; }

  voiceOn(id, freq, level = 0.16) {
    if (!this.ctx || this.muted) return null;
    this.voiceOff(id, 0.15);
    const v = new Voice(this.ctx, this.master, this.space);
    v.setFreq(freq, 0.005);
    v.on(level);
    this.voices.set(id, v);
    return v;
  }

  voiceGlide(id, freq) {
    const v = this.voices.get(id);
    if (v) v.setFreq(freq);
  }

  voiceBrightness(id, b) {
    const v = this.voices.get(id);
    if (v) v.setBrightness(b);
  }

  voiceOff(id, release = 0.35) {
    const v = this.voices.get(id);
    if (v) { v.off(release); this.voices.delete(id); }
  }

  allOff(release = 0.3) {
    for (const id of [...this.voices.keys()]) this.voiceOff(id, release);
  }

  /* One-shot pluck used by the loom playhead / ghost hands. */
  pluck(freq, level = 0.14, dur = 0.5) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const o1 = this.ctx.createOscillator(); o1.type = 'sawtooth';
    const o2 = this.ctx.createOscillator(); o2.type = 'sawtooth';
    o1.detune.value = -3; o2.detune.value = 3;
    o1.frequency.value = freq; o2.frequency.value = freq;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.value = Math.min(freq * 4, 7000); f.Q.value = 0.7;
    const g = this.ctx.createGain(); g.gain.value = 0;
    o1.connect(f); o2.connect(f); f.connect(g);
    g.connect(this.master); g.connect(this.space.input);
    g.gain.setTargetAtTime(level, t, 0.008);
    g.gain.setTargetAtTime(0, t + dur * 0.3, dur * 0.28);
    o1.start(t); o2.start(t);
    o1.stop(t + dur + 0.6); o2.stop(t + dur + 0.6);
  }

  /* Soft confirmation chime (the healed circle). */
  chime(freqs = [523.25, 659.25, 784.0]) {
    if (!this.ctx || this.muted) return;
    freqs.forEach((f, i) => {
      const t = this.ctx.currentTime + i * 0.09;
      const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = this.ctx.createGain(); g.gain.value = 0;
      o.connect(g); g.connect(this.master); g.connect(this.space.input);
      g.gain.setTargetAtTime(0.1, t, 0.01);
      g.gain.setTargetAtTime(0, t + 0.15, 0.4);
      o.start(t); o.stop(t + 2.2);
    });
  }

  setMuted(m) {
    this.muted = m;
    if (this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.03);
      if (m) this.allOff(0.1);
    }
  }
}

export { AudioEngine };
