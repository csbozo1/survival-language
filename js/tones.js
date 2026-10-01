// Vietnamese tones, derived from the tone mark on each syllable.
(function () {
  const SL = window.SL = window.SL || {};

  const LIST = [
    { key: 'ngang', name: 'ngang', label: 'Level', mark: 'no mark', example: 'ma', means: 'ghost',
      desc: 'Mid-high and flat, like holding a note.' },
    { key: 'huyen', name: 'huyền', label: 'Falling', mark: 'grave  ̀', example: 'mà', means: 'but',
      desc: 'Starts low and drifts lower, like a tired sigh.' },
    { key: 'sac', name: 'sắc', label: 'Rising', mark: 'acute  ́', example: 'má', means: 'cheek',
      desc: 'Rises sharply, like a surprised "what?"' },
    { key: 'hoi', name: 'hỏi', label: 'Dipping', mark: 'hook  ̉', example: 'mả', means: 'tomb',
      desc: 'Dips down then comes back up, like a doubtful "really?"' },
    { key: 'nga', name: 'ngã', label: 'Broken', mark: 'tilde  ̃', example: 'mã', means: 'code',
      desc: 'Rises with a catch in the throat halfway. In the South it sounds the same as the dipping tone.' },
    { key: 'nang', name: 'nặng', label: 'Heavy', mark: 'dot below  ̣', example: 'mạ', means: 'rice seedling',
      desc: 'Short, low and cut off abruptly, like a firm "uh".' }
  ];

  const SHAPES = {
    ngang: '<polyline points="2,4 22,4"/>',
    huyen: '<polyline points="2,5 22,11"/>',
    sac: '<polyline points="2,10 22,2"/>',
    hoi: '<polyline points="2,5 11,12 22,4"/>',
    nga: '<polyline points="2,8 9,5"/><polyline points="13,10 22,2"/>',
    nang: '<polyline points="2,5 11,11"/><rect x="14" y="9" width="3" height="3" fill="currentColor" stroke="none"/>'
  };

  // Tone marks are separate combining characters once the syllable is decomposed.
  const MARKS = [['̀', 'huyen'], ['́', 'sac'], ['̉', 'hoi'], ['̃', 'nga'], ['̣', 'nang']];

  function ofSyllable(s) {
    const d = s.normalize('NFD');
    for (const [mark, key] of MARKS) if (d.includes(mark)) return key;
    return 'ngang';
  }

  function contour(key, w) {
    w = w || 24;
    return '<svg class="contour" width="' + w + '" height="' + Math.round(w * 14 / 24) +
      '" viewBox="0 0 24 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">' +
      SHAPES[key] + '</svg>';
  }

  function chips(text) {
    return text.split(/\s+/).map(function (tok) {
      const syl = tok.replace(/[^\p{L}]/gu, '');
      if (!syl) return '';
      const key = ofSyllable(syl);
      const t = LIST.find(function (x) { return x.key === key; });
      return '<span class="tone tone-' + key + '" title="' + t.label + ' tone"><span class="vi">' + SL.esc(syl) +
        '</span>' + contour(key) + '</span>';
    }).join('');
  }

  SL.tones = { LIST: LIST, ofSyllable: ofSyllable, contour: contour, chips: chips };
})();
