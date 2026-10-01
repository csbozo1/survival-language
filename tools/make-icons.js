// Draws the app icons (gold pixel star on red) as PNG files. Run: node tools/make-icons.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { GRIDS, PALETTE, size } = require('../js/sprites.js');

function rgb(hex) {
  return [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); });
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(body));
  return Buffer.concat([len, body, crc]);
}

function icon(px) {
  const grid = GRIDS.star;
  const d = size('star');
  const cell = Math.floor(px * 0.62 / Math.max(d.w, d.h));
  const ox = Math.floor((px - d.w * cell) / 2);
  const oy = Math.floor((px - d.h * cell) / 2);
  const bg = rgb(PALETTE.r);
  const stride = px * 4 + 1;
  const raw = Buffer.alloc(stride * px);
  for (let y = 0; y < px; y++) {
    for (let x = 0; x < px; x++) {
      const gx = Math.floor((x - ox) / cell);
      const gy = Math.floor((y - oy) / cell);
      const ch = grid[gy] && grid[gy][gx];
      const col = ch && ch !== '.' && /^#/.test(PALETTE[ch] || '') ? rgb(PALETTE[ch]) : bg;
      const o = y * stride + 1 + x * 4;
      raw[o] = col[0]; raw[o + 1] = col[1]; raw[o + 2] = col[2]; raw[o + 3] = 255;
    }
  }
  const head = Buffer.alloc(13);
  head.writeUInt32BE(px, 0);
  head.writeUInt32BE(px, 4);
  head[8] = 8; // bit depth
  head[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', head),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const dir = path.join(__dirname, '..', 'icons');
fs.mkdirSync(dir, { recursive: true });
[180, 192, 512].forEach(function (px) {
  fs.writeFileSync(path.join(dir, 'icon-' + px + '.png'), icon(px));
  console.log('icons/icon-' + px + '.png');
});
