#!/usr/bin/env node
// Generates public/icons/{icon-192,icon-512,maskable-512}.png from the Taka Plan logo
// (same rounded square + "T" glyph as the header) with a tiny hand-written PNG encoder.
// No dependencies beyond node:zlib. Re-run with `node scripts/gen-icons.mjs` after changing colours.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { crc32, deflateSync } from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/icons");

/** Brand tokens from app/globals.css (--color-brand-600) and white for the glyph. */
const BRAND = [0x0b, 0x7f, 0x6d];
const WHITE = [0xff, 0xff, 0xff];

/** Logo geometry in the 28-unit box used by the inline header SVG. */
const BOX = 28;
const RECT = { x: 2, y: 2, w: 24, h: 24, r: 7 };
const STROKE_W = 2.2;
const STROKES = [
  [9, 10, 19, 10],
  [14, 10, 14, 19],
  [11, 19, 17, 19],
];

function sdRoundRect(px, py) {
  const cx = RECT.x + RECT.w / 2;
  const cy = RECT.y + RECT.h / 2;
  const hx = RECT.w / 2 - RECT.r;
  const hy = RECT.h / 2 - RECT.r;
  const dx = Math.abs(px - cx) - hx;
  const dy = Math.abs(py - cy) - hy;
  const ox = Math.max(dx, 0);
  const oy = Math.max(dy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(dx, dy), 0) - RECT.r;
}

function distSeg(px, py, x1, y1, x2, y2) {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const len2 = vx * vx + vy * vy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * vx + (py - y1) * vy) / len2));
  return Math.hypot(px - (x1 + t * vx), py - (y1 + t * vy));
}

function onGlyph(px, py) {
  for (const [x1, y1, x2, y2] of STROKES) if (distSeg(px, py, x1, y1, x2, y2) <= STROKE_W / 2) return true;
  return false;
}

/**
 * Renders an icon. `maskable` fills the whole canvas with the brand colour and keeps the glyph
 * inside the central safe zone; otherwise the rounded square sits on a transparent background.
 */
function render(size, maskable) {
  const SS = 4; // supersampling per axis
  const rgba = Buffer.alloc(size * size * 4);
  // Glyph box → canvas mapping.
  const scale = maskable ? (size * 0.62) / BOX : size / BOX;
  const offset = maskable ? (size - BOX * scale) / 2 : 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bg = 0;
      let fg = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS - offset) / scale;
          const py = (y + (sy + 0.5) / SS - offset) / scale;
          const inRect = maskable ? true : sdRoundRect(px, py) <= 0;
          if (!inRect) continue;
          if (onGlyph(px, py)) fg++;
          else bg++;
        }
      }
      const total = SS * SS;
      const cover = (bg + fg) / total;
      const i = (y * size + x) * 4;
      if (cover === 0) continue;
      const fgShare = fg / (bg + fg);
      for (let c = 0; c < 3; c++) rgba[i + c] = Math.round(BRAND[c] * (1 - fgShare) + WHITE[c] * fgShare);
      rgba[i + 3] = Math.round(255 * cover);
    }
  }
  return rgba;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter type: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

fs.mkdirSync(outDir, { recursive: true });
const targets = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["maskable-512.png", 512, true],
];
for (const [name, size, maskable] of targets) {
  const png = encodePng(size, render(size, maskable));
  fs.writeFileSync(path.join(outDir, name), png);
  console.log(`${name}: ${png.length} bytes`);
}
