// Sanity-checks every language pack. Run: node tools/check-pack.js
const fs = require('fs');
const path = require('path');
const { GRIDS } = require('../js/sprites.js');

global.window = {};
const dir = path.join(__dirname, '..', 'packs');
require(path.join(dir, 'index.js'));
fs.readdirSync(dir).filter(function (f) { return f !== 'index.js' && f.endsWith('.js'); })
  .forEach(function (f) { require(path.join(dir, f)); });

let errors = 0;
function fail(msg) { errors++; console.error('  FAIL ' + msg); }

Object.keys(window.PACKS).forEach(function (code) {
  const pack = window.PACKS[code];
  console.log(code + ': ' + pack.phrases.length + ' phrases');
  ['code', 'name', 'voiceLang', 'categories'].forEach(function (k) { if (!pack[k]) fail('pack is missing ' + k); });
  if (pack.code !== code) fail('pack.code does not match its key');
  if (pack.phrases.length < 4) fail('needs at least 4 phrases for a quiz');
  Object.keys(pack.categories).forEach(function (c) {
    if (!GRIDS[pack.categories[c]]) fail('category "' + c + '" uses unknown sprite ' + pack.categories[c]);
  });
  const seen = { id: {}, en: {}, text: {} };
  pack.phrases.forEach(function (p) {
    ['id', 'category', 'en', 'text', 'phonetic'].forEach(function (k) { if (!p[k]) fail((p.id || '?') + ' is missing ' + k); });
    if (!pack.categories[p.category]) fail(p.id + ' has unknown category ' + p.category);
    if (p.south && !p.south.phonetic) fail(p.id + ' south variant needs a phonetic');
    ['id', 'en', 'text'].forEach(function (k) {
      if (seen[k][p[k]]) fail('duplicate ' + k + ': ' + p[k]);
      seen[k][p[k]] = true;
    });
  });
});

if (errors) { console.error(errors + ' problem(s)'); process.exit(1); }
console.log('All packs OK');
