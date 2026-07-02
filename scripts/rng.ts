/**
 * Seeded deterministic PRNG (mulberry32). No Math.random, no Date.now.
 * Same seed -> identical stream -> identical case.json on every run.
 */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class RNG {
  private next: () => number;

  constructor(seed: number) {
    this.next = mulberry32(seed);
  }

  /** Uniform float in [0, 1) */
  rand(): number {
    return this.next();
  }

  /** Uniform integer in [min, max] inclusive */
  randInt(min: number, max: number): number {
    return min + Math.floor(this.rand() * (max - min + 1));
  }

  /** Uniform pick from a non-empty array */
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.rand() * arr.length)];
  }

  /** base jittered by ±frac (e.g. jitter(100, 0.1) -> 90..110), rounded to integer */
  jitter(base: number, frac: number): number {
    return Math.round(base * (1 + (this.rand() * 2 - 1) * frac));
  }
}
