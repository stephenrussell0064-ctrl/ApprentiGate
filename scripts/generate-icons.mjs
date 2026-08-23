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
const SIGNAL = readToken(css, 'color-ag-signal');
const PAPER = readToken(css, 'color-ag-paper');

/**
 * Signed distance to a rounded rectangle; negative inside, positive outside.
 *
 * This is the standard rounded-box SDF. A simpler nearest-point form was tried
 * first and silently failed for r = 0, because every interior point returns
 * exactly 0 rather than a negative value, so a square-cornered shape rendered
 * as nothing at all.
 */
function roundedRectDistance(px, py, x, y, w, h, r) {
  const qx = Math.abs(px - (x + w / 2)) - (w / 2 - r);
  const qy = Math.abs(py - (y + h / 2)) - (h / 2 - r);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return Math.min(Math.max(qx, qy), 0) + outside - r;
}

/**
 * Renders the mark at `size` px as an RGBA buffer.
 * Geometry matches src/app/icon.svg on a 32-unit grid.
 */
function renderMark(size) {
  const SS = 4; // supersampling factor
  const scale = size / 32;
  const pixels = Buffer.alloc(size * size * 4);

  const shapes = [
    { x: 0, y: 0, w: 32, h: 32, r: 8, colour: SIGNAL, alpha: 1 },
    // A slot cut clean through the block, offset right of centre. It reads as
    // an opening in a wall rather than as a barrier — the one permitted use of
    // the "gate" idea. Two inset bars were tried first and read as a pause
    // button, which is why the slot now runs edge to edge.
    { x: 19, y: 0, w: 5, h: 32, r: 0, colour: PAPER, alpha: 1 },
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
            const inside =
              roundedRectDistance(ux, uy, shape.x, shape.y, shape.w, shape.h, shape.r) <
              0;
            if (!inside) continue;
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
