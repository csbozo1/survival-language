// Home, phrasebook, tone guide, and start-up.
(function () {
  const SL = window.SL;
  const esc = SL.esc;

  function progressBar(pack) {
    const c = SL.store.counts(pack);
    const n = pack.phrases.length;
    return '<section class="panel px"><h3>Progress</h3><div class="pbar"><i class="known" style="width:' + (c.known / n * 100) +
      '%"></i><i class="learning" style="width:' + (c.learning / n * 100) + '%"></i></div>' +
      '<p class="legend"><span class="dot known"></span>' + c.known + ' known <span class="dot learning"></span>' + c.learning +
      ' learning <span class="dot new"></span>' + c.new + ' new</p></section>';
  }

  SL.home = function () {
    const pack = SL.pack();
    const codes = Object.keys(window.PACKS);
    const hist = SL.store.progress(pack.code).history;
    let h = '<section class="hero px"><div class="hero-art">' + SL.sprite('star', 5) + SL.sprite('hat', 5) +
      SL.sprite('pho', 5) + '</div><h1>Survival Language</h1><p>' + esc(pack.name) + ' &middot; ' + pack.phrases.length +
      ' phrases</p></section>';

    if (codes.length > 1) {
      h += '<div class="seg">' + codes.map(function (c) {
        return '<button class="btn small' + (c === pack.code ? ' on' : '') + '" data-act="set-pack" data-val="' + esc(c) + '">' +
          esc(window.PACKS[c].name) + '</button>';
      }).join('') + '</div>';
    }

    h += progressBar(pack);
    h += '<div class="stack"><button class="btn red" data-act="flash-setup">Flashcards</button>' +
      '<button class="btn gold" data-act="quiz-setup">Quiz</button>' +
      '<button class="btn" data-act="book">Phrasebook</button>' +
      (pack.hasTones ? '<button class="btn" data-act="tones">Tone guide</button>' : '') + '</div>';

    if (hist.length) {
      h += '<section class="panel px"><h3>Recent quizzes</h3><ul class="history">' + hist.map(function (e) {
        return '<li><span>' + new Date(e.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
          '</span><b>' + e.score + ' / ' + e.total + '</b></li>';
      }).join('') + '</ul></section>';
    }

    if (!SL.speech.available(pack.voiceLang)) {
      h += '<section class="panel px notice"><h3>No audio yet</h3><p>This device has no ' + esc(pack.name) +
        ' voice. On iPhone: Settings &rarr; Accessibility &rarr; Spoken Content (or Read &amp; Speak) &rarr; Voices &rarr; ' +
        esc(pack.name) + ', then download a voice while you still have internet.</p></section>';
    }

    h += '<p class="foot"><button class="link" data-act="reset">Reset progress</button></p>';
    SL.render(h);
  };

  function book() {
    const pack = SL.pack();
    let h = SL.bar('Phrasebook', SL.soundBtn());
    Object.keys(pack.categories).forEach(function (cat) {
      h += '<h3 class="cat">' + SL.sprite(pack.categories[cat], 3) + ' ' + esc(cat) + '</h3>';
      pack.phrases.filter(function (p) { return p.category === cat; }).forEach(function (p) {
        h += '<section class="panel px entry"><div class="en"><span class="dot ' + SL.store.get(pack.code, p.id).status +
          '"></span>' + esc(p.en) + '</div>' + SL.detail(pack, p) + '</section>';
      });
    });
    SL.render(h);
  }

  function tones() {
    let h = SL.bar('Tone guide') +
      '<section class="panel px"><p>Vietnamese has six tones. The same syllable said with a different tone is a different word, ' +
      'so the mark above or below a vowel matters as much as the letters.</p><p>Every card shows each syllable with a small ' +
      'line tracing how your voice should move.</p></section>';
    SL.tones.LIST.forEach(function (t) {
      h += '<section class="panel px tone-row tone-' + t.key + '">' + SL.tones.contour(t.key, 72) + '<div><h3>' + esc(t.label) +
        ' <span class="vi">(' + esc(t.name) + ')</span></h3><p class="phon">' + esc(t.mark) + ' &middot; <span class="vi">' +
        esc(t.example) + '</span> = ' + esc(t.means) + '</p><p>' + esc(t.desc) + '</p></div></section>';
    });
    h += '<section class="panel px"><h3>North vs South</h3><p>Hanoi keeps all six tones distinct. In Ho Chi Minh City the ' +
      'dipping and broken tones sound alike, and some letters change: "d", "gi" and often "v" sound like "y", and "r" is ' +
      'rolled rather than "z". The phone\'s voice uses the Northern accent.</p></section>';
    SL.render(h);
  }

  SL.actions.home = function () { SL.show(SL.home); };
  SL.actions.book = function () { SL.show(book); };
  SL.actions.tones = function () { SL.show(tones); };

  SL.actions['set-pack'] = function (el) {
    SL.store.setSetting('pack', el.dataset.val);
    SL.show(SL.home);
  };

  SL.actions.reset = function () {
    const pack = SL.pack();
    if (window.confirm('Reset all ' + pack.name + ' progress and quiz history?')) {
      SL.store.reset(pack.code);
      SL.refresh();
    }
  };

  SL.speech.onChange(SL.refresh);
  SL.show(SL.home);

  // Offline support. Service workers need http(s), so this is skipped when opened straight from disk.
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(function () { /* still usable online */ });
  }
})();
