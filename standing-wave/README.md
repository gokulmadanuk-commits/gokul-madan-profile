# STANDING WAVE

**An instrument that proves a theorem.**

A quarter-million grains of sand on a vibrating plate, in your browser.
You play it with your fingers. It ends with you proving — by ear — that
perfect musical tuning is mathematically impossible.

## The piece

Four acts, each under a minute:

| Act | What happens |
|---|---|
| **01 · TUNE** | The cold open is a lie: one note that is secretly two, beating audibly, boiling the sand. Release, and they fuse — the sand snaps into a razor nodal pattern. Then the plate is yours: every touch is a voice, pitch on the vertical, brightness on the horizontal. |
| **02 · INTERVAL** | A root drone sounds. Glide a second voice and hunt the pure ratios — 1:1, 5:4, 4:3, 3:2, 2:1, and one golden impostor. Within a few cents the ratio pulls you in; land it and the sand crystallizes with a red stamp. |
| **03 · LOOM** | Stack twelve pure fifths around a circle. Eleven land sweetly. The twelfth *cannot* land — it overshoots by 23.46¢, the Pythagorean comma, because 3¹² ≠ 2¹⁹. A slider lets you smear the error around the ring: equal temperament, the beautiful compromise in every piano. It is also the lie you heard in the first ten seconds. |
| **04 · ETCH** | Long-press the seal and the session develops like a darkroom print — stamped with your discovered ratios, the comma, a timestamp, and a hash signature derived from your unique event log. No two etchings exist. |

## How it works

- **One analytic Chladni field drives everything.** Grains descend the
  gradient of F² and jitter in proportion to local vibration amplitude |F| —
  so nodal lines (the zeros) are where sand comes to rest, exactly as on a
  physical plate. The mode numbers (n, m) derive deterministically from
  pitch: what you hear *is* what the sand feels.
- **Beating is real in both domains.** Two close voices interfere acoustically
  (two detuned oscillators, no fake tremolo) and the same |f₁−f₂| term drives
  the sand's agitation. Hear = see.
- **GPGPU sand**: 512² = 262,144 grains in ping-ponged RGBA32F textures,
  simulated in a fragment shader, drawn as points with additive persistence.
  A rolling governor steps down to 320²/192² and lowers DPR on weak GPUs;
  a Canvas2D fallback runs the identical field on ~8k grains with no WebGL at all.
- **The telemetry is honest.** Grain count, frame time, live ratio, cents
  offset — open devtools and check.
- **The session is an event log** seeded at load; the etching hash is folded
  from it, so the artifact is provably yours.

## Stack

None. Vanilla HTML/CSS/JS, WebGL2 + WebAudio, three subset fonts (~36KB),
zero dependencies, zero build step, works offline once loaded.
~75KB total excluding fonts.

## Run it

Any static server:

```sh
npx serve standing-wave
```

## Provenance

Designed and built end-to-end by an AI agent (Claude) in a single session —
concept selected from a judged panel of competing directions, implemented,
browser-verified at desktop and mobile viewports, and adversarially reviewed
by parallel agents before release.

*Nothing here was drawn. Everything was played.*
