/* STANDING WAVE — sand engine.
   One analytic Chladni field drives everything: grains descend the energy
   gradient and jitter in proportion to local vibration amplitude, so nodal
   lines (the zeros of the field) are where sand comes to rest — exactly as
   on a physical plate. WebGL2 GPGPU when available, Canvas2D otherwise. */

'use strict';

const MAX_VOICES = 8;

/* Deterministic PRNG so a session is replayable from its seed. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Chladni mode numbers from frequency: lawful pitch→pattern mapping.
   Modes ordered roughly by spatial frequency so higher notes ring in
   finer patterns, like a real plate. */
const MODE_TABLE = [];
for (let n = 1; n <= 7; n++) {
  for (let m = n; m <= 7; m++) {
    if (n === m && n === 1) continue;            // (1,1) is featureless
    MODE_TABLE.push([n, m, n * n + m * m]);
  }
}
MODE_TABLE.sort((a, b) => a[2] - b[2]);

function modesForFreq(freq) {
  const t = Math.log2(Math.max(55, Math.min(1760, freq)) / 55) / 5; // 0..1 over 5 octaves
  const i = Math.min(MODE_TABLE.length - 1, Math.max(0, Math.round(t * (MODE_TABLE.length - 1))));
  return MODE_TABLE[i];
}

/* ---------------------------------------------------------------- WebGL2 */

const SIM_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const SIM_FS = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform sampler2D uTarget;
uniform float uTargetOn;      // 0..1 title-assembly attraction
uniform float uDt;
uniform float uTime;
uniform int   uVoiceCount;
uniform vec4  uVoiceA[${MAX_VOICES}]; // n, m, amp, boil(extra jitter share)
uniform vec4  uPointer;       // x, y, active, boilRadius
uniform float uSettle;        // gradient descent strength
uniform float uJitter;        // brownian scale
uniform float uDamp;
uniform float uScatter;       // one-frame outward impulse (title burst)

layout(location=0) out vec4 outState;

float hash(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main(){
  ivec2 tc = ivec2(gl_FragCoord.xy);
  vec4 s = texelFetch(uState, tc, 0);
  vec2 pos = s.xy;
  vec2 vel = s.zw;

  const float PI = 3.14159265358979;

  /* Field F and analytic gradient. Symmetric square-plate mode shapes. */
  float F = 0.0;
  vec2 grad = vec2(0.0);
  float totalAmp = 0.0;
  float boil = 0.0;
  for (int v = 0; v < ${MAX_VOICES}; v++){
    if (v >= uVoiceCount) break;
    float n = uVoiceA[v].x, m = uVoiceA[v].y, A = uVoiceA[v].z;
    if (A <= 0.0001) continue;
    float cnx = cos(n*PI*pos.x), cmy = cos(m*PI*pos.y);
    float cmx = cos(m*PI*pos.x), cny = cos(n*PI*pos.y);
    float snx = sin(n*PI*pos.x), smy = sin(m*PI*pos.y);
    float smx = sin(m*PI*pos.x), sny = sin(n*PI*pos.y);
    F += A * (cnx*cmy + cmx*cny);
    grad.x += A * (-n*PI*snx*cmy - m*PI*smx*cny);
    grad.y += A * (-m*PI*cnx*smy - n*PI*cmx*sny);
    totalAmp += A;
    boil += uVoiceA[v].w;
  }

  float absF = abs(F);
  /* Descend F^2 → settle on nodal lines. d(F^2) = 2F∇F */
  vec2 force = -uSettle * 2.0 * F * grad;

  /* Brownian agitation ∝ local vibration amplitude (plus beat boil). */
  float r1 = hash(pos * 913.7 + uTime);
  float r2 = hash(pos * 771.3 - uTime * 1.31);
  float ang = r1 * 6.28318530718;
  float agitation = uJitter * (absF + 0.02 * totalAmp) * (1.0 + boil * 2.5);

  /* Extra boil in a ring around an active pointer. */
  if (uPointer.z > 0.5) {
    float d = distance(pos, uPointer.xy);
    agitation += uJitter * (1.2 + boil * 4.0) * (1.0 - smoothstep(0.0, uPointer.w, d)) * totalAmp;
  }

  force += vec2(cos(ang), sin(ang)) * agitation * (0.5 + r2);

  /* Title assembly: pull each grain toward its glyph target. */
  if (uTargetOn > 0.001) {
    vec4 t = texelFetch(uTarget, tc, 0);
    if (t.z > 0.5) {
      vec2 toT = t.xy - pos;
      force = force * (1.0 - uTargetOn) + toT * (14.0 * uTargetOn);
      vel *= mix(1.0, 0.82, uTargetOn);
    }
  }

  /* Scatter burst: radial impulse away from pointer (title destruction). */
  if (uScatter > 0.001) {
    vec2 away = pos - uPointer.xy;
    float len = max(length(away), 0.02);
    vel += (away / len) * uScatter * (0.4 + 0.6 * r1);
  }

  vel = (vel + force * uDt) * uDamp;
  /* Speed limit keeps the integrator stable at any tier. */
  float sp = length(vel);
  if (sp > 1.4) vel *= 1.4 / sp;
  pos += vel * uDt;

  /* Soft walls with a small inward nudge so grains never silt up in corners. */
  if (pos.x < 0.003) { pos.x = 0.003; vel.x = abs(vel.x) * 0.5 + 0.02; }
  if (pos.x > 0.997) { pos.x = 0.997; vel.x = -abs(vel.x) * 0.5 - 0.02; }
  if (pos.y < 0.003) { pos.y = 0.003; vel.y = abs(vel.y) * 0.5 + 0.02; }
  if (pos.y > 0.997) { pos.y = 0.997; vel.y = -abs(vel.y) * 0.5 - 0.02; }

  outState = vec4(pos, vel);
}`;

const PTS_VS = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform int uTexSize;
uniform float uPointSize;
out float vSpeed;
void main(){
  ivec2 tc = ivec2(gl_VertexID % uTexSize, gl_VertexID / uTexSize);
  vec4 s = texelFetch(uState, tc, 0);
  vSpeed = length(s.zw);
  vec2 clip = s.xy * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = uPointSize;
}`;

const PTS_FS = `#version 300 es
precision highp float;
in float vSpeed;
uniform vec3 uColor;
uniform float uAlpha;
out vec4 frag;
void main(){
  /* moving grains dim slightly; settled grains burn brightest */
  float a = uAlpha * clamp(1.15 - vSpeed * 2.0, 0.35, 1.0);
  frag = vec4(uColor * a, a);
}`;

const FADE_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FADE_FS = `#version 300 es
precision highp float;
uniform float uFade;
out vec4 frag;
void main(){ frag = vec4(0.0196, 0.0196, 0.0275, uFade); }`;

const BLIT_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
out vec4 frag;
void main(){
  vec3 c = texture(uTex, vUv).rgb;
  /* gentle filmic lift + corner vignette */
  c = c / (1.0 + c * 0.35);
  float d = distance(vUv, vec2(0.5));
  c *= 1.0 - smoothstep(0.55, 0.95, d) * 0.45;
  frag = vec4(c, 1.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error('shader: ' + gl.getShaderInfoLog(sh));
  }
  return sh;
}
function program(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error('link: ' + gl.getProgramInfoLog(p));
  }
  return p;
}

class GLEngine {
  constructor(canvas, texSize, rng) {
    this.kind = 'webgl2';
    this.canvas = canvas;
    this.texSize = texSize;
    this.count = texSize * texSize;
    this.rng = rng;
    const gl = canvas.getContext('webgl2', {
      alpha: false, antialias: false, depth: false, stencil: false,
      powerPreference: 'high-performance', preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error('no webgl2');
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('no float fbo');
    this.gl = gl;
    this.lost = false;
    this._onLost = (e) => { e.preventDefault(); this.lost = true; };
    canvas.addEventListener('webglcontextlost', this._onLost);

    this.simProg = program(gl, SIM_VS, SIM_FS);
    this.ptsProg = program(gl, PTS_VS, PTS_FS);
    this.fadeProg = program(gl, FADE_VS, FADE_FS);
    this.blitProg = program(gl, FADE_VS, BLIT_FS);

    // fullscreen quad
    this.quad = gl.createVertexArray();
    gl.bindVertexArray(this.quad);
    const qb = this.quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, qb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    this.emptyVao = gl.createVertexArray(); // points fetch their own state

    // state ping-pong
    const init = new Float32Array(this.count * 4);
    for (let i = 0; i < this.count; i++) {
      init[i * 4] = rng(); init[i * 4 + 1] = rng();
      init[i * 4 + 2] = (rng() - 0.5) * 0.1; init[i * 4 + 3] = (rng() - 0.5) * 0.1;
    }
    this.stateTex = [this._makeTex(texSize, init), this._makeTex(texSize, null)];
    this.stateFbo = [gl.createFramebuffer(), gl.createFramebuffer()];
    for (let i = 0; i < 2; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.stateFbo[i]);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.stateTex[i], 0);
    }
    this.cur = 0;

    this.targetTex = this._makeTex(texSize, new Float32Array(this.count * 4));

    // persistence buffer at drawing-buffer resolution
    this._makeTrail();

    this.uniforms = {};
    for (const name of ['uState','uTarget','uTargetOn','uDt','uTime','uVoiceCount','uVoiceA','uPointer','uSettle','uJitter','uDamp','uScatter']) {
      this.uniforms[name] = gl.getUniformLocation(this.simProg, name);
    }
    this.pu = {};
    for (const name of ['uState','uTexSize','uPointSize','uColor','uAlpha']) {
      this.pu[name] = gl.getUniformLocation(this.ptsProg, name);
    }
    this.fadeU = gl.getUniformLocation(this.fadeProg, 'uFade');
    this.blitU = gl.getUniformLocation(this.blitProg, 'uTex');
    this.voiceData = new Float32Array(MAX_VOICES * 4);
  }

  _makeTex(size, data) {
    const gl = this.gl;
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, size, size, 0, gl.RGBA, gl.FLOAT, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  _makeTrail() {
    const gl = this.gl;
    const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
    if (this.trailTex) { gl.deleteTexture(this.trailTex); gl.deleteFramebuffer(this.trailFbo); }
    this.trailTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.trailTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.trailFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.trailFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.trailTex, 0);
    gl.clearColor(0.0196, 0.0196, 0.0275, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.trailW = w; this.trailH = h;
  }

  resize() {
    if (this.gl.drawingBufferWidth !== this.trailW || this.gl.drawingBufferHeight !== this.trailH) {
      this._makeTrail();
    }
  }

  setTargets(points) {
    // points: Float32Array of [x,y] pairs; each grain gets points[i % n] + jitter
    const gl = this.gl;
    const data = new Float32Array(this.count * 4);
    const n = points.length / 2;
    if (n === 0) return;
    for (let i = 0; i < this.count; i++) {
      const j = i % n;
      data[i * 4] = points[j * 2] + (this.rng() - 0.5) * 0.0015;
      data[i * 4 + 1] = points[j * 2 + 1] + (this.rng() - 0.5) * 0.0015;
      data[i * 4 + 2] = 1.0;
    }
    gl.bindTexture(gl.TEXTURE_2D, this.targetTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, this.texSize, this.texSize, 0, gl.RGBA, gl.FLOAT, data);
  }

  /* Re-blit the trail buffer to screen (preserveDrawingBuffer is off,
     so exportPNG calls this right before drawImage). */
  present() {
    const gl = this.gl;
    if (this.lost || gl.isContextLost()) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.disable(gl.BLEND);
    gl.useProgram(this.blitProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.trailTex);
    gl.uniform1i(this.blitU, 0);
    gl.bindVertexArray(this.quad);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  destroy() {
    const gl = this.gl;
    this.canvas.removeEventListener('webglcontextlost', this._onLost);
    if (gl.isContextLost()) return;
    for (const t of [this.stateTex[0], this.stateTex[1], this.targetTex, this.trailTex]) gl.deleteTexture(t);
    for (const f of [this.stateFbo[0], this.stateFbo[1], this.trailFbo]) gl.deleteFramebuffer(f);
    for (const p of [this.simProg, this.ptsProg, this.fadeProg, this.blitProg]) gl.deleteProgram(p);
    gl.deleteVertexArray(this.quad);
    gl.deleteVertexArray(this.emptyVao);
    gl.deleteBuffer(this.quadBuf);
  }

  /* voices: [{n, m, amp, boil}], pointer: {x,y,active,r}, params: {...} */
  step(dt, time, voices, pointer, params) {
    const gl = this.gl;
    if (this.lost || gl.isContextLost()) return;
    this.resize();

    // --- simulation pass ---
    gl.useProgram(this.simProg);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.stateFbo[1 - this.cur]);
    gl.viewport(0, 0, this.texSize, this.texSize);
    gl.disable(gl.BLEND);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.stateTex[this.cur]);
    gl.uniform1i(this.uniforms.uState, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.targetTex);
    gl.uniform1i(this.uniforms.uTarget, 1);
    gl.uniform1f(this.uniforms.uTargetOn, params.targetOn || 0);
    gl.uniform1f(this.uniforms.uDt, dt);
    gl.uniform1f(this.uniforms.uTime, time % 1000);
    const vd = this.voiceData; vd.fill(0);
    const vc = Math.min(voices.length, MAX_VOICES);
    for (let i = 0; i < vc; i++) {
      vd[i * 4] = voices[i].n; vd[i * 4 + 1] = voices[i].m;
      vd[i * 4 + 2] = voices[i].amp; vd[i * 4 + 3] = voices[i].boil || 0;
    }
    gl.uniform1i(this.uniforms.uVoiceCount, vc);
    gl.uniform4fv(this.uniforms.uVoiceA, vd);
    gl.uniform4f(this.uniforms.uPointer, pointer.x, pointer.y, pointer.active ? 1 : 0, pointer.r || 0.1);
    gl.uniform1f(this.uniforms.uSettle, params.settle);
    gl.uniform1f(this.uniforms.uJitter, params.jitter);
    gl.uniform1f(this.uniforms.uDamp, params.damp);
    gl.uniform1f(this.uniforms.uScatter, params.scatter || 0);
    gl.bindVertexArray(this.quad);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.cur = 1 - this.cur;

    // --- fade persistence buffer ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.trailFbo);
    gl.viewport(0, 0, this.trailW, this.trailH);
    gl.useProgram(this.fadeProg);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(this.fadeU, params.fade);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // --- draw grains additively ---
    gl.useProgram(this.ptsProg);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.stateTex[this.cur]);
    gl.uniform1i(this.pu.uState, 0);
    gl.uniform1i(this.pu.uTexSize, this.texSize);
    gl.uniform1f(this.pu.uPointSize, params.pointSize);
    gl.uniform3f(this.pu.uColor, 0.929, 0.917, 0.886);
    gl.uniform1f(this.pu.uAlpha, params.alpha);
    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.POINTS, 0, this.count);

    // --- blit to screen ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.disable(gl.BLEND);
    gl.useProgram(this.blitProg);
    gl.bindTexture(gl.TEXTURE_2D, this.trailTex);
    gl.uniform1i(this.blitU, 0);
    gl.bindVertexArray(this.quad);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }
}

/* ------------------------------------------------------------- Canvas2D */

class CPUEngine {
  constructor(canvas, count, rng) {
    this.kind = 'canvas2d';
    this.canvas = canvas;
    this.count = count;
    this.rng = rng;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.px = new Float32Array(count);
    this.py = new Float32Array(count);
    this.vx = new Float32Array(count);
    this.vy = new Float32Array(count);
    for (let i = 0; i < count; i++) { this.px[i] = rng(); this.py[i] = rng(); }
    this.targets = null;
    this.first = true;
  }

  setTargets(points) {
    const n = points.length / 2;
    if (!n) return;
    this.targets = { points, n };
  }

  present() {}
  destroy() {}

  step(dt, time, voices, pointer, params) {
    const { px, py, vx, vy, count, ctx, canvas } = this;
    const PI = Math.PI;
    const vc = Math.min(voices.length, 4);
    const tOn = params.targetOn || 0;
    for (let i = 0; i < count; i++) {
      let F = 0, gx = 0, gy = 0, amp = 0, boil = 0;
      for (let v = 0; v < vc; v++) {
        const V = voices[v];
        if (V.amp <= 0.0001) continue;
        const n = V.n, m = V.m, A = V.amp;
        const cnx = Math.cos(n * PI * px[i]), cmy = Math.cos(m * PI * py[i]);
        const cmx = Math.cos(m * PI * px[i]), cny = Math.cos(n * PI * py[i]);
        F += A * (cnx * cmy + cmx * cny);
        gx += A * (-n * PI * Math.sin(n * PI * px[i]) * cmy - m * PI * Math.sin(m * PI * px[i]) * cny);
        gy += A * (-m * PI * cnx * Math.sin(m * PI * py[i]) - n * PI * cmx * Math.sin(n * PI * py[i]));
        amp += A; boil += V.boil || 0;
      }
      let fx = -params.settle * 2 * F * gx;
      let fy = -params.settle * 2 * F * gy;
      const ang = this.rng() * 6.28318;
      let agit = params.jitter * (Math.abs(F) + 0.02 * amp) * (1 + boil * 2.5);
      if (pointer.active) {
        const dx = px[i] - pointer.x, dy = py[i] - pointer.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < pointer.r) agit += params.jitter * (1.2 + boil * 4) * (1 - d / pointer.r) * amp;
      }
      fx += Math.cos(ang) * agit; fy += Math.sin(ang) * agit;
      if (tOn > 0.001 && this.targets) {
        const j = i % this.targets.n;
        fx = fx * (1 - tOn) + (this.targets.points[j * 2] - px[i]) * 14 * tOn;
        fy = fy * (1 - tOn) + (this.targets.points[j * 2 + 1] - py[i]) * 14 * tOn;
        vx[i] *= 0.86; vy[i] *= 0.86;
      }
      if (params.scatter > 0.001) {
        let ax = px[i] - pointer.x, ay = py[i] - pointer.y;
        const len = Math.max(Math.hypot(ax, ay), 0.02);
        vx[i] += (ax / len) * params.scatter; vy[i] += (ay / len) * params.scatter;
      }
      vx[i] = (vx[i] + fx * dt) * params.damp;
      vy[i] = (vy[i] + fy * dt) * params.damp;
      const sp = Math.hypot(vx[i], vy[i]);
      if (sp > 1.4) { vx[i] *= 1.4 / sp; vy[i] *= 1.4 / sp; }
      px[i] += vx[i] * dt; py[i] += vy[i] * dt;
      if (px[i] < 0.003) { px[i] = 0.003; vx[i] = Math.abs(vx[i]) * 0.5; }
      if (px[i] > 0.997) { px[i] = 0.997; vx[i] = -Math.abs(vx[i]) * 0.5; }
      if (py[i] < 0.003) { py[i] = 0.003; vy[i] = Math.abs(vy[i]) * 0.5; }
      if (py[i] > 0.997) { py[i] = 0.997; vy[i] = -Math.abs(vy[i]) * 0.5; }
    }
    const w = canvas.width, h = canvas.height;
    if (this.first) { ctx.fillStyle = '#050507'; ctx.fillRect(0, 0, w, h); this.first = false; }
    ctx.fillStyle = `rgba(5,5,7,${params.fade})`;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(237,234,226,0.8)';
    const s = Math.max(1, Math.round(params.pointSize * 0.75));
    for (let i = 0; i < count; i++) {
      ctx.fillRect(px[i] * w, py[i] * h, s, s);
    }
  }

  resize() { this.first = true; }
}

/* Factory with capability probe + tiering. */
function createEngine(canvas, opts) {
  const rng = mulberry32(opts.seed);
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  let texSize = opts.texSize || (small ? 384 : 512);
  try {
    return new GLEngine(canvas, texSize, rng);
  } catch (e) {
    console.warn('[standing-wave] webgl2 unavailable → canvas2d fallback:', e.message);
    let c = canvas;
    if (!c.getContext('2d')) {
      // a GL context already claimed this element — swap in a fresh canvas
      const fresh = canvas.cloneNode(false);
      canvas.replaceWith(fresh);
      c = fresh;
    }
    return new CPUEngine(c, small ? 6000 : 9000, rng);
  }
}

export { createEngine, modesForFreq, mulberry32, MAX_VOICES };
