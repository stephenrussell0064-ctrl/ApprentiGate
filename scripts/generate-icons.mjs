#!/usr/bin/env node
/**
 * Generates the raster half of the favicon set from the design tokens.
 *
 *   src/app/favicon.ico    32x32, requested unconditionally by browsers
 *   src/app/apple-icon.png 180x180, requested by iOS and Safari
 *
 * src/app/icon.svg is the vector primary and is maintained by hand; these two
 * exist because browsers request them whether or not an SVG icon is declared,
 * and a missing one is a console 404 that costs a Lighthouse best-practices
 * point.
 *
 * Colours are parsed out of src/app/tokens.css rather than repeated here, so
 * the token file stays the single source of truth. Run `pnpm icons:generate`
 * after changing the mark or the signal colour.
 *
 * No image dependency: PNG is written with Node's zlib, and the ICO is a
 * container around a PNG. The mark is only rounded rectangles, so it is
 * rasterised directly with 4x supersampling for antialiasing.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('..', import.meta.url);
const TOKENS = fileURLToPath(new URL('src/app/tokens.css', ROOT));

function readToken(css, name) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!match) throw new Error(`Token --${name} not found in tokens.css`);
  const hex = match[1].slice(1);
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

const css = readFileSync(TOKENS, 'utf8');
const INK = readToken(css, 'color-ag-ink');
const PAPER = readToken(css, 'color-ag-paper');
const ACCENT = readToken(css, 'color-ag-brand-accent');

/** Distance from a point to a line segment. The basis for every stroke here. */
function segmentDistance(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const len2 = vx * vx + vy * vy;
  const t =
    len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / len2));
  return Math.hypot(px - (ax + t * vx), py - (ay + t * vy));
}

/*
 * The arch, as a stroke of width 2.6 on the same 32-unit grid as icon.svg:
 * two vertical legs and a half-round head centred on (16, 14.4) with radius
 * 5.6. Subtracting half the stroke width from the distance is what turns a
 * path into a stroked shape, and it gives round caps for free — which is what
 * the SVG asks for.
 */
const ARCH_HALF_STROKE = 1.3;
const CHEVRON_HALF_STROKE = 1.5;

function archDistance(x, y) {
  const left = segmentDistance(x, y, 10.4, 24.6, 10.4, 14.4);
  const right = segmentDistance(x, y, 21.6, 24.6, 21.6, 14.4);
  // Half-annulus: only above the springing line, so the head does not close
  // into a full ring across the middle of the mark.
  const head = y <= 14.4 ? Math.abs(Math.hypot(x - 16, y - 14.4) - 5.6) : Infinity;
  return Math.min(left, right, head) - ARCH_HALF_STROKE;
}

function chevronDistance(x, y) {
  return (
    Math.min(
      segmentDistance(x, y, 12.5, 19.4, 16, 15.9),
      segmentDistance(x, y, 16, 15.9, 19.5, 19.4),
    ) - CHEVRON_HALF_STROKE
  );
}

/**
 * Renders the mark at `size` px as an RGBA buffer.
 * Geometry matches src/app/icon.svg on a 32-unit grid.
 */
function renderMark(size) {
  const SS = 4; // supersampling factor
  const scale = size / 32;
  const pixels = Buffer.alloc(size * size * 4);

  /*
   * Each shape carries its own distance function rather than being assumed to
   * be a rounded rectangle. The mark is a disc with a stroked arch and a
   * chevron, none of which a rectangle can express.
   */
  const shapes = [
    { colour: INK, alpha: 1, distance: (x, y) => Math.hypot(x - 16, y - 16) - 16 },
    { colour: PAPER, alpha: 1, distance: archDistance },
    { colour: ACCENT, alpha: 1, distance: chevronDistance },
  ];

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const ux = (px + (sx + 0.5) / SS) / scale;
          const uy = (py + (sy + 0.5) / SS) / scale;

          let sr = 0;
          let sg = 0;
          let sb = 0;
          let sa = 0;

          for (const shape of shapes) {
            if (shape.distance(ux, uy) >= 0) continue;
            const sAlpha = shape.alpha;
            // Source-over compositing.
            sr = shape.colour[0] * sAlpha + sr * (1 - sAlpha);
            sg = shape.colour[1] * sAlpha + sg * (1 - sAlpha);
            sb = shape.colour[2] * sAlpha + sb * (1 - sAlpha);
            sa = sAlpha + sa * (1 - sAlpha);
          }

          r += sr;
          g += sg;
          b += sb;
          a += sa;
        }
      }

      const samples = SS * SS;
      const offset = (py * size + px) * 4;
      pixels[offset] = Math.round(r / samples);
      pixels[offset + 1] = Math.round(g / samples);
      pixels[offset + 2] = Math.round(b / samples);
      pixels[offset + 3] = Math.round((a / samples) * 255);
    }
  }

  return pixels;
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(pixels, size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  // Each scanline is prefixed with filter type 0 (None).
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/** ICO container wrapping a single PNG entry. */
function encodeIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  entry[0] = size === 256 ? 0 : size; // 0 means 256
  entry[1] = size === 256 ? 0 : size;
  entry[2] = 0; // palette size
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32BE(0, 8);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12); // offset of image data

  return Buffer.concat([header, entry, png]);
}

const faviconPng = encodePng(renderMark(32), 32);
writeFileSync(
  fileURLToPath(new URL('src/app/favicon.ico', ROOT)),
  encodeIco(faviconPng, 32),
);

const applePng = encodePng(renderMark(180), 180);
writeFileSync(fileURLToPath(new URL('src/app/apple-icon.png', ROOT)), applePng);

console.log(
  `Icons generated from tokens: favicon.ico (32px, ${faviconPng.length} B) and ` +
    `apple-icon.png (180px, ${applePng.length} B).`,
);
