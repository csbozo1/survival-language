// Pixel-art sprites as character grids. Each character maps to a palette colour;
// "." is transparent and "k" is the outline (follows the current text colour).
(function (root) {
  var PALETTE = {
    k: 'currentColor',
    r: '#da251d', y: '#ffcd00', w: '#fff8e7', c: '#fbeecb',
    p: '#f8a5c2', P: '#e0528f',
    g: '#4caf50', G: '#2e7d32',
    b: '#8d5a3b', B: '#5d3a25',
    t: '#f0d59a', T: '#c9a25e',
    o: '#f08a24', s: '#a9afb5', S: '#6b7076'
  };

  var GRIDS = {
    star: [
      '....y....',
      '....y....',
      '...yyy...',
      'yyyyyyyyy',
      '.yyyyyyy.',
      '..yyyyy..',
      '..yyyyy..',
      '.yyy.yyy.',
      '.y.....y.'
    ],
    hat: [
      '.......kk.......',
      '......kttk......',
      '.....kttttk.....',
      '....kttTtttk....',
      '...kttTtttttk...',
      '..kttTtttttttk..',
      '.kttTtttttttttk.',
      'kttTtttttttttttk',
      'kkkkkkkkkkkkkkkk'
    ],
    pho: [
      '....s...s.....',
      '...s...s......',
      '....s...s.....',
      '..............',
      'kkkkkkkkkkkkkk',
      'kcgcoccgccocck',
      '.kwwwwwwwwwwk.',
      '.kwrrrrrrrrwk.',
      '..kwwwwwwwwk..',
      '...kkkkkkkk...',
      '....kkkkkk....'
    ],
    lotus: [
      '......p......',
      '.....pPp.....',
      '..p..pPp..p..',
      '.pPp.pPp.pPp.',
      '.pPPppPppPPp.',
      '..pPPpPpPPp..',
      'g..pPPPPPp..g',
      'gg..ppppp..gg',
      '.ggggggggggg.',
      '...ggggggg...'
    ],
    coffee: [
      '......kk..',
      '.....kk...',
      '.kkkkkkkk.',
      '.kwwwwwwk.',
      '.kbbbbbbk.',
      '.kbwbbwbk.',
      '.kbbbbbbk.',
      '.kBBBBBBk.',
      '..kBBBBk..',
      '..kkkkkk..'
    ],
    motorbike: [
      '.........kk.....',
      '........kk......',
      '...rrrrrrk..k...',
      '..rrrrrrrrrkk...',
      '.kkrrrrrrrrk....',
      '.kkk..rrr..kkk..',
      'kksskk...kksskk.',
      'kssssk...kssssk.',
      'kksskk...kksskk.',
      '.kkkk.....kkkk..'
    ],
    buffalo: [
      'kk........kk',
      '.kk......kk.',
      '..kSSSSSSk..',
      '.kSSSSSSSSk.',
      '.kSkSSSSkSk.',
      '.kSSSSSSSSk.',
      '..kSppppSk..',
      '..kpkppkpk..',
      '...kkkkkk...'
    ]
  };

  function size(name) {
    var g = GRIDS[name], w = 0;
    for (var i = 0; i < g.length; i++) w = Math.max(w, g[i].length);
    return { w: w, h: g.length };
  }

  function svg(name, px) {
    var g = GRIDS[name];
    if (!g) return '';
    px = px || 4;
    var d = size(name), out = '';
    for (var y = 0; y < g.length; y++) {
      var row = g[y], x = 0;
      while (x < row.length) {
        var ch = row[x];
        if (ch === '.' || !PALETTE[ch]) { x++; continue; }
        var start = x;
        while (x < row.length && row[x] === ch) x++;
        out += '<rect x="' + start + '" y="' + y + '" width="' + (x - start) + '" height="1" fill="' + PALETTE[ch] + '"/>';
      }
    }
    return '<svg class="sprite" xmlns="http://www.w3.org/2000/svg" width="' + d.w * px + '" height="' + d.h * px +
      '" viewBox="0 0 ' + d.w + ' ' + d.h + '" shape-rendering="crispEdges" aria-hidden="true">' + out + '</svg>';
  }

  var api = { PALETTE: PALETTE, GRIDS: GRIDS, size: size, svg: svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.SL = root.SL || {}; root.SL.sprites = api; }
})(typeof window !== 'undefined' ? window : this);
