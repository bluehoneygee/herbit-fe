// src/utils/random.js
// =====================

// hash string → 32-bit integer
export function hash32(str) {
  let h = 2166136261 >>> 0; // FNV-1a basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Mulberry32 PRNG → fungsi generator
export function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// RNG dari string seed (contoh: "2025-10-03" atau "2025-10-03#1")
export function rngFromSeed(seedStr) {
  return mulberry32(hash32(String(seedStr ?? "")));
}
