/* STANDING WAVE — the piece.
   Four acts on one instrument:
     01 TUNE     — the lie, the snap, free play
     02 INTERVAL — find the pure ratios by ear and eye
     03 LOOM     — stack twelve pure fifths; watch the circle refuse to close
     04 ETCH     — develop the session into a signed artifact
   The opening "lie" is two voices exactly one Pythagorean comma apart
   (23.46 cents) — the same error the visitor later proves and heals. */

'use strict';

import { createEngine, modesForFreq, mulberry32 } from './engine.js';
import { AudioEngine } from './audio.js';

/* ------------------------------------------------------------ constants */

const COMMA_CENTS = 23.46;                      // 1200*log2(3^12 / 2^19)
const PURE_FIFTH_CENTS = 701.955;
const ROOT = 220;                               // A3
const PHI = (1 + Math.sqrt(5)) / 2;

const RATIOS = [
  { r: 1,      label: '1:1', name: 'UNISON' },
  { r: 5 / 4,  label: '5:4', name: 'MAJOR THIRD' },
  { r: 4 / 3,  label: '4:3', name: 'FOURTH' },
  { r: 3 / 2,  label: '3:2', name: 'FIFTH' },
  { r: PHI,    label: 'φ:1', name: 'GOLDEN — INHARMONIC' },
  { r: 2,      label: '2:1', name: 'OCTAVE' },
];

const cents = (a, b) => 1200 * Math.log2(a / b);

/* ------------------------------------------------------------------ dom */

const $ = (s) => document.querySelector(s);
const plate = $('#plate');
const overlay = $('#overlay');
const octx = overlay.getContext('2d');
const captionEl = $('#caption'), captionSub = $('#caption-sub');
const stampEl = $('#stamp');
const ratioRow = $('#ratio-row');
const chipEl = $('#chip');
const equationEl = $('#equation');
const temperWrap = $('#temper-wrap');
const temperInput = $('#temper');
const sealEl = $('#seal');
const etchPanel = $('#etch-panel');
const telemetryEl = $('#telemetry');
const muteBtn = $('#mute');
const navEl = $('#nav');
const titleFallback = $('#title-fallback');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -------------------------------------------------------------- session */

const seed = (Date.now() ^ (performance.now() * 1000)) >>> 0;
const rng = mulberry32(seed ^ 0x9E3779B9);
const log = [];
const t0 = performance.now();
function logEvent(type, data) {
  log.push({ t: Math.round(performance.now() - t0), type, data });
}
function sessionHash() {
  let h = seed >>> 0;
  for (const e of log) {
    const s = e.type + JSON.stringify(e.data ?? '');
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
    h = (h ^ (h >>> 13)) >>> 0;
  }
  return h.toString(36).toUpperCase().padStart(7, '0');
}

/* ------------------------------------------------------------- engines */

const audio = new AudioEngine();
let engine = null;
let dprCap = Math.min(devicePixelRatio || 1, 2);

const plateEl = () => (engine && engine.canvas) || plate;

function sizeCanvases() {
  if (frozen) return;   // resizing would clear the developed etching
  const w = innerWidth, h = innerHeight;
  for (const c of [plateEl(), overlay]) {
    c.width = Math.round(w * dprCap);
    c.height = Math.round(h * dprCap);
    c.style.width = w + 'px';
    c.style.height = h + 'px';
  }
  if (engine) engine.resize();
}

function boot(texSize) {
  sizeCanvases();
  engine = createEngine(plate, { seed, texSize });
}

/* ---------------------------------------------------------- state machine */

const ACTS = ['tune', 'interval', 'loom', 'etch'];
let act = 'title';
let frozen = false;

const state = {
  targetOn: 0,          // title assembly strength
  scatter: 0,           // one-frame impulse
  lie: null,            // {fA, fB, started}
  liePlayed: false,
  snapSeen: false,
  drone: null,          // interval root {freq, n, m}
  live: new Map(),      // pointerId → {freq, x, y, brightness, lockPull}
  found: new Set(),     // ratio labels discovered
  crystal: 0,           // crystallize boost timer
  fifths: [],           // loom: planted fifth cents positions (pure)
  temper: 0,            // 0..1 healing slider
  commaShown: false,
  healed: false,
  loomPlay: false,
  playIdx: -1,
  ghost: null,          // {x,y,age}
  etched: false,
};

/* ------------------------------------------------------------- captions */

let captionTimer = 0, stampTimer = 0;
function caption(main, sub = '', hold = 0) {
  clearTimeout(captionTimer);
  captionEl.textContent = main;
  captionSub.textContent = sub;
  captionEl.parentElement.classList.add('on');
  if (hold > 0) captionTimer = setTimeout(() => captionEl.parentElement.classList.remove('on'), hold);
}

function stamp(text, ok = true) {
  clearTimeout(stampTimer);
  stampEl.textContent = text;
  stampEl.classList.remove('on', 'ok');
  void stampEl.offsetWidth;
  stampEl.classList.add('on');
  if (ok) stampEl.classList.add('ok');
  stampTimer = setTimeout(() => stampEl.classList.remove('on'), 2600);
}

function chip(text, onClick) {
  if (!text) { chipEl.classList.remove('on'); chipEl.onclick = null; return; }
  chipEl.textContent = text;
  chipEl.classList.add('on');
  chipEl.onclick = onClick;
}

function setNav(current) {
  [...navEl.children].forEach((b) => b.classList.toggle('cur', b.dataset.act === current));
}

/* ------------------------------------------------------------ act logic */

function enterAct(next) {
  if (act === next) return;
  act = next;
  setNav(next);
  chip('');
  equationEl.classList.remove('on');
  temperWrap.classList.remove('on');
  sealEl.classList.remove('on');
  etchPanel.classList.remove('on');
  ratioRow.classList.remove('on');
  audio.allOff();
  state.live.clear();
  state.lie = null;
  state.loomPlay = false;
  frozen = false;
  temperInput.disabled = true;
  plateEl().classList.remove('developing');

  if (next === 'tune') tuneIntro();
  if (next === 'interval') {
    state.drone = makeDrone(ROOT);
    renderRatioRow();
    ratioRow.classList.add('on');
    caption('a root sounds: A · 220 Hz. find the ratios that stand still.',
      'hold and glide — pure intervals lock and crystallize');
  }
  if (next === 'loom') {
    state.fifths = []; state.temper = 0; state.commaShown = false; state.healed = false;
    temperInput.value = 0;
    caption('a scale is a circle of twelve fifths. build it — tap to stack each one.',
      'every fifth is pure: exactly 3:2');
  }
  if (next === 'etch') {
    if (state.etched) {
      // already developed: show the finished print again, not a dead seal
      etchPanel.classList.add('on');
      plateEl().classList.add('developing');
      frozen = true;
      caption('developed.', 'nothing here was drawn. everything was played.');
    } else {
      sealEl.classList.add('on');
      caption('press and hold the seal. develop what you played.',
        'the etching is signed with your session hash — no two exist');
    }
  }
  logEvent('act', next);
}

function tuneIntro() {
  caption('each touch is a note. hold, and the sand explains it.', 'high is up · left is dark');
  setTimeout(() => { if (act === 'tune') chip('02 · INTERVAL →', () => enterAct('interval')); }, 6000);
}

function makeDrone(freq) {
  const [n, m] = modesForFreq(freq);
  audio.voiceOn('drone', freq, 0.11);
  return { freq, n, m };
}

/* ------------------------------------------------------- pitch mapping */

function freqFromY(y) {
  return 110 * Math.pow(2, (1 - y) * 2.5);
}

/* Ratio gravity: near a pure ratio, ease the voice onto it. */
function gravitate(freq) {
  if (!state.drone) return { freq, near: null, off: 0 };
  const r = freq >= state.drone.freq ? freq / state.drone.freq : state.drone.freq / freq;
  let best = null, bestOff = 1e9;
  for (const R of RATIOS) {
    const off = cents(r, R.r);
    if (Math.abs(off) < Math.abs(bestOff)) { bestOff = off; best = R; }
  }
  if (best && Math.abs(bestOff) < 9) {
    const target = freq >= state.drone.freq ? state.drone.freq * best.r : state.drone.freq / best.r;
    freq += (target - freq) * 0.22;               // magnetic pull, re-applied each frame
    return { freq, near: best, off: cents(
      (freq >= state.drone.freq ? freq / state.drone.freq : state.drone.freq / freq), best.r) };
  }
  return { freq, near: best, off: bestOff };
}

function renderRatioRow() {
  ratioRow.innerHTML = RATIOS.map((R) =>
    `<span class="rchip${state.found.has(R.label) ? ' hit' : ''}">${R.label}</span>`).join('');
}

let lockCandidate = null, lockSince = 0;
function checkLock(near, off, now) {
  if (!near || Math.abs(off) > 1.2) { lockCandidate = null; return; }
  if (lockCandidate !== near.label) { lockCandidate = near.label; lockSince = now; return; }
  if (now - lockSince > 350 && !state.found.has(near.label)) {
    state.found.add(near.label);
    state.crystal = 1.4;
    stamp(`${near.label} · ${near.name} · LOCKED`);
    renderRatioRow();
    try { navigator.vibrate && navigator.vibrate(10); } catch (_) {}
    logEvent('lock', near.label);
    if (state.found.size >= 3 && act === 'interval') {
      chip('03 · LOOM →', () => enterAct('loom'));
    }
  }
}

/* -------------------------------------------------------------- pointers */

let firstTouch = true;

function pointerPos(e) {
  return { x: e.clientX / innerWidth, y: e.clientY / innerHeight };
}

function onDown(e) {
  if (e.target.closest('.ui')) return;
  e.preventDefault();
  audio.unlock();

  if (firstTouch) { firstTouch = false; beginLie(pointerPos(e), e.pointerId); return; }
  if (act === 'title') return;   // lie in progress
  if (frozen) return;

  const p = pointerPos(e);

  if (act === 'loom') { plantFifth(); return; }
  if (act === 'etch') return;

  const freq = freqFromY(p.y);
  state.live.set(e.pointerId, { ...p, freq, brightness: p.x });
  audio.voiceOn('p' + e.pointerId, freq, 0.15);
  audio.voiceBrightness('p' + e.pointerId, p.x);
  logEvent('down', { x: +p.x.toFixed(3), y: +p.y.toFixed(3) });
}

function onMove(e) {
  const v = state.live.get(e.pointerId);
  if (!v) return;
  e.preventDefault();
  const p = pointerPos(e);
  v.x = p.x; v.y = p.y;
  v.freq = freqFromY(p.y);
  v.brightness = p.x;
}

function onUp(e) {
  audio.resume();
  const v = state.live.get(e.pointerId);
  if (v) {
    state.live.delete(e.pointerId);
    audio.voiceOff('p' + e.pointerId);
  }
  if (state.lie && state.lie.pid === e.pointerId) resolveLie();
}

/* ------------------------------------------------------------- the lie */

function beginLie(p, pid) {
  state.targetOn = 0;
  state.scatter = 2.4;
  titleFallback.classList.add('gone');
  const fA = ROOT;
  const fB = ROOT * Math.pow(2, COMMA_CENTS / 1200);
  audio.voiceOn('lieA', fA, 0.13);
  audio.voiceOn('lieB', fB, 0.13);
  state.lie = { fA, fB, pid, started: performance.now(), pos: p };
  enterActQuiet('tune');
  caption('you hear one note. it is two.', `${COMMA_CENTS} cents apart — listen to the slow wobble`);
  logEvent('lie', { fA, fB });
}

function enterActQuiet(next) { act = next; setNav(next); }

function resolveLie() {
  if (!state.lie) return;
  if (act !== 'tune') { state.lie = null; return; }
  // glide B down onto A: the wobble stops, the sand snaps
  audio.voiceGlide('lieB', state.lie.fA);
  state.liePlayed = true;
  const lie = state.lie;
  state.lie = null;
  state.crystal = 1.6;
  setTimeout(() => {
    audio.voiceOff('lieA', 1.2);
    audio.voiceOff('lieB', 1.2);
  }, 1400);
  caption('in tune, sand stands still.', 'that difference has a name. you will meet it again.', 7000);
  setTimeout(() => { if (act === 'tune') tuneIntro(); }, 2600);
  logEvent('lieResolved', { heldMs: Math.round(performance.now() - lie.started) });
}

/* ---------------------------------------------------------------- loom */

const ringR = () => Math.min(innerWidth, innerHeight) * 0.34;
const ringC = () => ({ x: innerWidth / 2, y: innerHeight / 2 });

function fifthAngle(k, temper) {
  const pure = (k * PURE_FIFTH_CENTS) % 1200;
  const equal = (k * 700) % 1200;
  const c = pure + (equal - pure) * temper;
  return (c / 1200) * Math.PI * 2 - Math.PI / 2;
}

function plantFifth() {
  if (state.commaShown && !state.healed) return;   // pause input during the reveal
  if (state.fifths.length >= 12) return;
  const k = state.fifths.length + 1;
  state.fifths.push(k);
  // audible: fold k fifths into one octave above the root
  const folded = ROOT * Math.pow(2, ((k * PURE_FIFTH_CENTS) % 1200) / 1200);
  audio.pluck(folded, 0.15, 0.7);
  try { navigator.vibrate && navigator.vibrate(8); } catch (_) {}
  state.crystal = 0.5;
  logEvent('fifth', k);

  if (k < 12) {
    caption(`fifth ${k} of 12`, k >= 9 ? 'notice the drift from the marks…' : '', 1800);
  } else {
    state.commaShown = true;
    setTimeout(showComma, 700);
  }
}

function showComma() {
  temperInput.disabled = false;
  equationEl.classList.add('on');
  caption('the twelfth fifth does not land. it cannot.',
    `twelve pure fifths overshoot seven octaves by ${COMMA_CENTS}¢ — the Pythagorean comma`);
  stamp(`+${COMMA_CENTS}¢ · THE CIRCLE DOES NOT CLOSE`, false);
  temperWrap.classList.add('on');
  logEvent('comma', COMMA_CENTS);
}

temperInput.addEventListener('input', () => {
  if (act !== 'loom' || !state.commaShown) return;
  state.temper = temperInput.value / 100;
  if (state.temper >= 1 && !state.healed) {
    state.healed = true;
    audio.chime();
    equationEl.classList.remove('on');
    caption('spread the error: every fifth 2 cents flat. the circle closes.',
      'equal temperament — the beautiful, deliberate lie in every piano. the one you heard first.');
    stamp('CIRCLE CLOSED · COMMA DISTRIBUTED');
    state.loomPlay = true;
    logEvent('healed', true);
    setTimeout(() => { if (act === 'loom') chip('04 · ETCH →', () => enterAct('etch')); }, 3000);
  }
});

/* ---------------------------------------------------------------- etch */

let pressTimer = null, pressStart = 0;
sealEl.addEventListener('pointerdown', (e) => {
  e.preventDefault(); e.stopPropagation();
  audio.unlock();
  try { sealEl.setPointerCapture(e.pointerId); } catch (_) {}
  pressStart = performance.now();
  sealEl.classList.add('pressing');
  pressTimer = setTimeout(develop, 850);
});
for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) {
  sealEl.addEventListener(ev, () => {
    clearTimeout(pressTimer);
    sealEl.classList.remove('pressing');
  });
}

function develop() {
  if (state.etched) return;
  state.etched = true;
  frozen = true;
  audio.allOff(0.6);
  sealEl.classList.remove('on', 'pressing');
  logEvent('etch', true);

  const hash = sessionHash();
  const date = new Date().toISOString().slice(0, 16).replace('T', ' · ');
  const ratios = [...state.found].join('  ') || '—';
  const comma = state.commaShown ? `FOUND · ${state.healed ? 'HEALED' : 'UNHEALED'} · ${COMMA_CENTS}¢` : 'NOT ENCOUNTERED';

  $('#etch-hash').textContent = 'SW-' + hash;
  $('#etch-date').textContent = date + ' UTC';
  $('#etch-ratios').textContent = ratios;
  $('#etch-comma').textContent = comma;
  $('#etch-engine').textContent =
    `${engine.count.toLocaleString('en-US')} GRAINS · ${engine.kind.toUpperCase()}`;
  etchPanel.classList.add('on');
  plateEl().classList.add('developing');
  caption('developed.', 'nothing here was drawn. everything was played.');
}

function exportPNG() {
  const S = 1400;
  const src = plateEl();
  const c = document.createElement('canvas');
  const aspect = src.width / src.height;
  const pw = S - 160, ph = Math.round(pw / aspect);
  c.width = S; c.height = ph + 420;
  const x = c.getContext('2d');
  x.fillStyle = '#050507'; x.fillRect(0, 0, c.width, c.height);
  if (engine.present) engine.present();   // re-blit: preserveDrawingBuffer is off
  x.drawImage(src, 80, 80, pw, ph);
  x.strokeStyle = 'rgba(237,234,226,0.25)'; x.lineWidth = 1;
  x.strokeRect(80.5, 80.5, pw, ph);
  const mono = (px) => `${px}px "IBM Plex Mono", monospace`;
  let ty = ph + 150;
  x.fillStyle = '#EDEAE2'; x.font = mono(30);
  x.fillText('STANDING WAVE', 80, ty);
  x.fillStyle = '#FF3B1F';
  x.fillText('SW-' + $('#etch-hash').textContent.slice(3), 80 + x.measureText('STANDING WAVE   ').width, ty);
  x.fillStyle = '#8C8A84'; x.font = mono(21);
  ty += 46; x.fillText('RATIOS  ' + $('#etch-ratios').textContent, 80, ty);
  ty += 34; x.fillText('COMMA   ' + $('#etch-comma').textContent, 80, ty);
  ty += 34; x.fillText($('#etch-engine').textContent + ' · ' + $('#etch-date').textContent, 80, ty);
  ty += 50; x.fillStyle = '#EDEAE2'; x.font = 'italic 26px "Instrument Serif", serif';
  x.fillText('Nothing here was drawn. Everything was played.', 80, ty);
  return c;
}

$('#btn-save').addEventListener('click', () => {
  exportPNG().toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `standing-wave-${$('#etch-hash').textContent}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
});
$('#btn-share').addEventListener('click', async () => {
  const blob = await new Promise((res) => exportPNG().toBlob(res));
  const file = new File([blob], 'standing-wave.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'STANDING WAVE' }); } catch (_) {}
  } else {
    $('#btn-save').click();
  }
});
$('#btn-again').addEventListener('click', () => location.reload());

/* --------------------------------------------------------------- title */

async function buildTitleTargets() {
  try { await document.fonts.load('500 100px "IBM Plex Mono"'); } catch (_) {}
  const w = 900, h = Math.round(900 * innerHeight / innerWidth);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = '#fff';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  const size = Math.min(150, w / 7.2);
  x.font = `500 ${size}px "IBM Plex Mono", monospace`;
  try { x.letterSpacing = Math.round(size * 0.08) + 'px'; } catch (_) {}
  x.fillText('STANDING', w / 2, h / 2 - size * 0.62);
  x.fillText('WAVE', w / 2, h / 2 + size * 0.62);
  const img = x.getImageData(0, 0, w, h).data;
  const pts = [];
  for (let py = 0; py < h; py += 2) {
    for (let px = 0; px < w; px += 2) {
      if (img[(py * w + px) * 4 + 3] > 128) pts.push(px / w, py / h);
    }
  }
  return new Float32Array(pts);
}

/* ------------------------------------------------------------ main loop */

const simVoices = [];
let lastT = performance.now();
let frames = 0;
let telemetryAt = 0;
let running = true;

function tick(now) {
  requestAnimationFrame(tick);
  if (!running) return;
  const dtms = now - lastT;
  lastT = now;
  const dt = Math.min(dtms / 1000, 0.033);
  governor(dtms);
  frames++;
  if (frozen) { drawOverlay(now); return; }

  const time = now / 1000;
  simVoices.length = 0;

  /* --- gather voices --- */
  let beatBoil = 0;
  if (state.lie) {
    const { fA, fB } = state.lie;
    const [n, m] = modesForFreq(fA);
    const df = fB - fA;
    // the audible beat envelope, mirrored into agitation: hear = see
    beatBoil = 0.5 - 0.5 * Math.cos(2 * Math.PI * df * (time - state.lie.started / 1000));
    simVoices.push({ n, m, amp: 1.0, boil: beatBoil * 1.6 });
  }
  if (state.drone && (act === 'interval')) {
    simVoices.push({ n: state.drone.n, m: state.drone.m, amp: 0.75, boil: 0 });
  }
  let liveRatio = null, liveOff = null, liveNear = null;
  for (const v of state.live.values()) {
    if (act === 'interval') {
      const g = gravitate(v.freq);
      v.freq = g.freq;
      // track the pointer closest to a pure ratio, not merely the last one
      if (liveOff === null || Math.abs(g.off) < Math.abs(liveOff)) {
        liveNear = g.near; liveOff = g.off;
        liveRatio = v.freq >= state.drone.freq ? v.freq / state.drone.freq : state.drone.freq / v.freq;
      }
    }
    const [n, m] = modesForFreq(v.freq);
    let boil = 0;
    if (state.drone && act === 'interval') {
      const df = Math.abs(v.freq - state.drone.freq);
      if (df < 22 && df > 0.05) boil = (0.5 - 0.5 * Math.cos(2 * Math.PI * df * time)) * 1.2;
    }
    simVoices.push({ n, m, amp: 0.9, boil });
  }
  for (const [id] of state.live) audio.voiceGlide('p' + id, state.live.get(id).freq);
  if (act === 'interval') checkLock(liveNear, liveOff, now);

  /* --- loom playhead: ghost hands re-perform the healed circle --- */
  if (state.loomPlay && state.fifths.length === 12) {
    const stepMs = 460;
    const idx = Math.floor(now / stepMs) % 12;
    if (idx !== state.playIdx) {
      state.playIdx = idx;
      const k = idx + 1;
      const centsK = ((k * (state.healed ? 700 : PURE_FIFTH_CENTS)) % 1200);
      const f = ROOT * Math.pow(2, centsK / 1200);
      audio.pluck(f, 0.10, 0.42);
      const a = fifthAngle(k, state.temper), R = ringR(), C = ringC();
      state.ghost = { x: C.x + Math.cos(a) * R, y: C.y + Math.sin(a) * R, at: now, f };
    }
    if (state.ghost) {
      const [n, m] = modesForFreq(state.ghost.f);
      const age = (now - state.ghost.at) / 460;
      simVoices.push({ n, m, amp: Math.max(0, 0.8 - age * 0.8), boil: 0 });
    }
  }
  if (act === 'loom' && !state.loomPlay && state.fifths.length > 0) {
    const k = state.fifths.length;
    const f = ROOT * Math.pow(2, ((k * PURE_FIFTH_CENTS) % 1200) / 1200);
    const [n, m] = modesForFreq(f);
    simVoices.push({ n, m, amp: 0.7, boil: state.commaShown && !state.healed ? 1.2 : 0 });
  }
  if (simVoices.length === 0 && act !== 'title') {
    // idle breathing: a faint fundamental keeps the field alive
    simVoices.push({ n: 2, m: 3, amp: 0.16, boil: 0 });
  }

  /* --- physics params --- */
  state.crystal = Math.max(0, state.crystal - dt);
  const cry = state.crystal > 0 ? 1 : 0;
  const params = {
    targetOn: state.targetOn,
    scatter: state.scatter,
    settle: (reduceMotion ? 3.4 : 2.2) * (1 + cry * 0.9),
    jitter: (reduceMotion ? 0.010 : 0.028) * (1 - cry * 0.45),
    damp: 0.90,
    // per-time fade: identical decay at 30, 60, or 120 fps
    fade: Math.min(0.55, 1 - Math.pow(1 - (engine.kind === 'webgl2' ? 0.10 : 0.16), dtms / 16.7)),
    pointSize: dprCap >= 1.5 ? 2 : 1.5,
    alpha: engine.count > 200000 ? 0.16 : 0.30,
  };
  if (state.targetOn > 0.5) {
    // title assembly: dimmer, sharper, faster-clearing so glyphs stay legible
    params.alpha = 0.09;
    params.pointSize = dprCap >= 1.5 ? 1.5 : 1;
    params.fade = Math.min(0.6, 1 - Math.pow(0.78, dtms / 16.7));
  }
  state.scatter = 0;

  /* pointer for boil ring */
  let P = { x: 0.5, y: 0.5, active: false, r: 0.14 };
  const firstLive = state.live.values().next().value;
  if (state.lie) P = { ...state.lie.pos, active: true, r: 0.2 };
  else if (firstLive) P = { x: firstLive.x, y: firstLive.y, active: true, r: 0.12 };

  maybeRecover();
  engine.step(dt, time, simVoices, P, params);
  drawOverlay(now);

  /* --- telemetry --- */
  if (now > telemetryAt) {
    telemetryAt = now + 150;
    const ms = dtms.toFixed(1).padStart(5);
    let line = `${engine.count.toLocaleString('en-US')} GRAINS  ·  ${ms} MS`;
    if (liveRatio) {
      line += `  ·  ${liveRatio.toFixed(3)}:1`;
      if (liveNear) line += `  ·  ${liveOff >= 0 ? '+' : ''}${liveOff.toFixed(1)}¢ ${liveNear.label}`;
    } else if (act === 'loom' && state.fifths.length) {
      const k = state.fifths.length;
      line += `  ·  FIFTH ${k}/12  ·  DRIFT +${(k * (PURE_FIFTH_CENTS - 700)).toFixed(2)}¢`;
    }
    telemetryEl.textContent = line;
  }
}

/* --------------------------------------------------------- ring overlay */

function drawOverlay(now) {
  const w = overlay.width, h = overlay.height;
  octx.clearRect(0, 0, w, h);
  if (act !== 'loom' && !(state.loomPlay && act === 'loom')) {
    if (act === 'interval' && state.drone) drawDroneMark();
    return;
  }
  const d = dprCap;
  const C = ringC(), R = ringR();
  octx.save();
  octx.scale(d, d);
  octx.lineWidth = 1;
  octx.strokeStyle = 'rgba(58,58,66,0.9)';
  octx.beginPath();
  octx.arc(C.x, C.y, R, 0, Math.PI * 2);
  octx.stroke();

  /* 12 equal-temperament marks (where fifths SHOULD land) */
  for (let i = 0; i < 12; i++) {
    const a = (i * 700 % 1200) / 1200 * Math.PI * 2 - Math.PI / 2;
    const x1 = C.x + Math.cos(a) * (R - 6), y1 = C.y + Math.sin(a) * (R - 6);
    const x2 = C.x + Math.cos(a) * (R + 6), y2 = C.y + Math.sin(a) * (R + 6);
    octx.strokeStyle = 'rgba(140,138,132,0.55)';
    octx.beginPath(); octx.moveTo(x1, y1); octx.lineTo(x2, y2); octx.stroke();
  }

  /* planted fifths */
  for (const k of state.fifths) {
    const a = fifthAngle(k, state.temper);
    const x = C.x + Math.cos(a) * R, y = C.y + Math.sin(a) * R;
    const isLast = k === state.fifths.length && state.commaShown && !state.healed;
    octx.fillStyle = isLast ? '#FF3B1F' : '#EDEAE2';
    octx.beginPath();
    octx.arc(x, y, isLast ? 6 : 4, 0, Math.PI * 2);
    octx.fill();
  }

  /* the comma gap: red arc between 12th pure fifth and the root mark */
  if (state.commaShown && state.fifths.length === 12 && state.temper < 1) {
    const aEnd = fifthAngle(12, state.temper);
    const aRoot = -Math.PI / 2;
    octx.strokeStyle = '#FF3B1F';
    octx.lineWidth = 3;
    octx.beginPath();
    octx.arc(C.x, C.y, R, aRoot, aEnd, false);
    octx.stroke();
    if (state.temper > 0.02) {
      // gap readout appears once healing starts — before that, the equation speaks
      const mid = (aRoot + aEnd) / 2;
      octx.fillStyle = '#FF3B1F';
      octx.font = `500 ${12}px "IBM Plex Mono", monospace`;
      octx.textAlign = 'center';
      const gap = (COMMA_CENTS * (1 - state.temper)).toFixed(1);
      octx.fillText(`+${gap}¢`, C.x + Math.cos(mid) * (R + 26), C.y + Math.sin(mid) * (R + 26));
    }
  }

  /* ghost hand */
  if (state.loomPlay && state.ghost) {
    const age = Math.min(1, (now - state.ghost.at) / 460);
    octx.strokeStyle = `rgba(255,59,31,${0.9 - age * 0.8})`;
    octx.lineWidth = 1.5;
    octx.beginPath();
    octx.arc(state.ghost.x, state.ghost.y, 10 + age * 14, 0, Math.PI * 2);
    octx.stroke();
  }
  octx.restore();
}

function drawDroneMark() {
  const d = dprCap;
  octx.save();
  octx.scale(d, d);
  const y = (1 - Math.log2(state.drone.freq / 110) / 2.5) * innerHeight;
  octx.strokeStyle = 'rgba(255,59,31,0.7)';
  octx.lineWidth = 1;
  octx.setLineDash([2, 6]);
  octx.beginPath();
  octx.moveTo(14, y); octx.lineTo(innerWidth - 14, y);
  octx.stroke();
  octx.setLineDash([]);
  octx.fillStyle = 'rgba(255,59,31,0.9)';
  octx.font = '500 10px "IBM Plex Mono", monospace';
  octx.fillText('A · 220 HZ · ROOT', 16, y - 6);
  octx.restore();
}

/* ------------------------------------------------------------- governor
   Rolling watchdog: on a struggling renderer (integrated GPU, software GL)
   it steps grain count and resolution down until frames are honest. */

const TIERS = [512, 320, 192];
let tierIdx = 0;
let govWindow = [];
let govFrames = 0;

function governor(dtms) {
  if (engine.kind !== 'webgl2') return;
  govWindow.push(dtms);
  if (govWindow.length > 60) govWindow.shift();
  if (++govFrames % 90 !== 0 || govWindow.length < 45) return;
  const sorted = [...govWindow].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  // calibrate against the display's own cadence: a uniform 33ms rAF
  // (30fps cap, low-power mode) is a baseline, not GPU distress
  const baseline = sorted[Math.floor(sorted.length * 0.1)];
  // degrade when jank exceeds the display's own cadence, or when even the
  // cadence itself is hopeless (uniform 45ms+ is distress, not a frame cap)
  if (median <= Math.max(26, baseline * 1.4) && median <= 45) return;
  if (tierIdx < TIERS.length - 1) {
    tierIdx++;
    rebuildEngine();
    govWindow = [];
    console.info(`[standing-wave] governor: ${TIERS[tierIdx]}² grains (median ${median.toFixed(0)}ms)`);
  } else if (dprCap > 1.05) {
    dprCap = 1;
    sizeCanvases();
    govWindow = [];
    console.info('[standing-wave] governor: DPR capped at 1');
  }
}

function rebuildEngine() {
  const keepTargets = state.targetOn > 0;
  if (engine) engine.destroy();
  engine = createEngine(plateEl(), { seed, texSize: TIERS[tierIdx] });
  if (keepTargets) buildTitleTargets().then((p) => { if (firstTouch) engine.setTargets(p); });
}

/* WebGL context loss: wait briefly for a restore, then rebuild
   (createEngine falls back to Canvas2D if the context stays lost). */
let recovering = false;
plate.addEventListener('webglcontextrestored', () => { recovering = false; rebuildEngine(); });
function maybeRecover() {
  if (recovering || !(engine && engine.lost)) return;
  recovering = true;
  setTimeout(() => { if (recovering) { recovering = false; rebuildEngine(); } }, 2500);
}

/* ----------------------------------------------------------------- wire */

window.addEventListener('pointerdown', onDown, { passive: false });
window.addEventListener('pointermove', onMove, { passive: false });
window.addEventListener('pointerup', onUp);
window.addEventListener('pointercancel', onUp);
window.addEventListener('resize', sizeCanvases);
/* Persistent voices (the interval drone) die with allOff; bring them back. */
function restoreVoices() {
  if (!audio.ctx || audio.muted) return;
  if (act === 'interval' && state.drone) audio.voiceOn('drone', state.drone.freq, 0.11);
}

document.addEventListener('visibilitychange', () => {
  running = !document.hidden;
  if (document.hidden) {
    if (state.lie) resolveLie();      // its voices are about to die anyway
    state.live.clear();               // held-pointer voices die with allOff
    audio.allOff(0.1);
  } else {
    lastT = performance.now();
    audio.resume();
    restoreVoices();
  }
});

muteBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  audio.unlock();
  audio.setMuted(!audio.muted);
  muteBtn.textContent = audio.muted ? 'SOUND OFF' : 'SOUND ON';
  muteBtn.classList.toggle('off', audio.muted);
  if (!audio.muted) restoreVoices();
});

navEl.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  audio.unlock();
  if (firstTouch) { firstTouch = false; titleFallback.classList.add('gone'); state.targetOn = 0; state.scatter = 2; }
  enterAct(b.dataset.act);
});

/* ----------------------------------------------------------------- boot */

boot();
tick(performance.now());

if (reduceMotion) {
  titleFallback.classList.add('static');
  caption('hold anywhere. hear a lie.', 'sound recommended · reduced motion honored');
} else {
  buildTitleTargets().then((pts) => {
    if (!firstTouch) return;   // user already scattered in; don't reassemble over play
    engine.setTargets(pts);
    state.targetOn = 1;
    setTimeout(() => {
      if (firstTouch) caption('hold anywhere. hear a lie.', 'sound on · each act takes under a minute');
    }, 2200);
  });
}
setNav('tune');
logEvent('boot', { seed: seed.toString(36), engine: engine.kind, grains: engine.count });
