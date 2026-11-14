import type { Palette } from './palettes'

// A pixel-art night sky for the terminal: stars, a swaying aurora and a
// mountain ridge, drawn with half blocks so each cell holds two pixels.

/** Terminal rows the band takes (two pixels each). */
export const BAND_ROWS = 5

const HALF = 0x2580 // ▀: foreground paints the top pixel, background the bottom

type RGB = [number, number, number]

const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

const add = (a: RGB, b: RGB, t: number): RGB => [a[0] + b[0] * t, a[1] + b[1] * t, a[2] + b[2] * t]

const pack = (c: RGB): number => {
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return (ch(c[0]) << 16) | (ch(c[1]) << 8) | ch(c[2])
}

/** A steady pseudo-random value in [0, 1) for one pixel. */
const hash = (x: number, y: number): number => {
  let h = Math.imul(x, 73856093) ^ Math.imul(y + 101, 19349663)
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/** Ridge height in pixels (from the bottom) for a column, near and far. */
const peak = (v: number) => 1 - Math.abs(Math.sin(v))
const ridge = (x: number, seed: number, base: number, amp: number): number =>
  base + amp * (0.55 * peak(x * 0.075 + seed) + 0.3 * peak(x * 0.19 + seed * 2.3) + 0.15 * peak(x * 0.53 + seed * 0.7))

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function toBase64(bytes: Uint8Array): string {
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!
    const b = bytes[i + 1]
    const c = bytes[i + 2]
    const n = (a << 16) | ((b ?? 0) << 8) | (c ?? 0)
    out += BASE64[(n >> 18) & 63]! + BASE64[(n >> 12) & 63]!
    out += b === undefined ? '=' : BASE64[(n >> 6) & 63]!
    out += c === undefined ? '=' : BASE64[n & 63]!
  }
  return out
}

const SKY_TOP: RGB = [0, 0, 0]
const SKY_LOW: RGB = [6, 8, 16]
const STAR: RGB = [225, 232, 255]
const FAR: RGB = [21, 25, 37]
const NEAR: RGB = [5, 6, 9]
const FOG: RGB = [110, 120, 138]

/** One pixel of the scene at time `t` seconds. */
function pixel(x: number, y: number, h: number, t: number, p: Palette): RGB {
  const v = y / (h - 1) // 0 at the top, 1 at the bottom
  let c = mix(SKY_TOP, SKY_LOW, v)

  // Stars: sparse, upper half, each twinkling at its own pace.
  const s = hash(x, y)
  if (s > 0.965 && v < 0.6) {
    const tw = 0.55 + 0.45 * Math.sin(t * (1 + s * 3) + s * 40)
    c = mix(c, STAR, 0.35 + 0.5 * tw)
  }

  // Aurora: a wavering band whose centre drifts, with vertical rays.
  const centre = 0.4 + 0.1 * Math.sin(x * 0.04 + t * 0.35) + 0.07 * Math.sin(x * 0.013 - t * 0.21)
  const d = (v - centre) / 0.3
  const body = Math.exp(-d * d)
  const rays = 0.72 + 0.28 * Math.sin(x * 1.3 + t * 1.2 + 2.5 * Math.sin(x * 0.17 + t * 0.3))
  const sweep = 0.5 + 0.5 * Math.sin(x * 0.018 - t * 0.2)
  const glow = body * rays * sweep
  const top = mix(hex(p.a[0]), hex(p.b[0]), 0.5 + 0.5 * Math.sin(x * 0.03 + t * 0.2))
  const low = mix(hex(p.a[1]), hex(p.b[1]), 0.5 + 0.5 * Math.sin(x * 0.025 - t * 0.15))
  const tint = mix(top, low, Math.max(0, Math.min(1, (v - centre) * 2 + 0.5)))
  c = add(c, tint, 0.85 * glow)

  // Mountains: a far ridge in fog and a near one in front.
  const fromBottom = h - 1 - y
  const far = ridge(x, 1.7, 1, 5)
  const near = ridge(x + 400, 4.2, 0.3, 2.6)
  if (fromBottom < near) {
    return NEAR
  }
  if (fromBottom < far) {
    const fog = 0.06 + 0.06 * Math.sin(x * 0.05 + t * 0.3)
    return mix(FAR, FOG, fog)
  }
  // Fog hanging just above the far ridge.
  const above = fromBottom - far
  if (above < 1.5) {
    c = mix(c, FOG, 0.1 * (1.5 - above))
  }

  return c
}

/** The band's cells for `columns` wide at time `t`, as RasterProps' base64. */
export function frame(columns: number, t: number, p: Palette): string {
  const h = BAND_ROWS * 2
  const words = new Uint32Array(columns * BAND_ROWS * 3)
  for (let row = 0; row < BAND_ROWS; row++) {
    for (let x = 0; x < columns; x++) {
      const i = (row * columns + x) * 3
      words[i] = HALF
      words[i + 1] = pack(pixel(x, row * 2, h, t, p))
      words[i + 2] = pack(pixel(x, row * 2 + 1, h, t, p))
    }
  }
  return toBase64(new Uint8Array(words.buffer))
}
