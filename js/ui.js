// Shared rendering helpers and click handling.
(function () {
  const SL = window.SL = window.SL || {};
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  SL.actions = {};
  SL.current = null;

  SL.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  };

  SL.shuffle = function (list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  SL.pack = function () {
    return window.PACKS[SL.store.settings().pack] || window.PACKS[Object.keys(window.PACKS)[0]];
  };

  SL.sprite = function (name, px) { return SL.sprites.svg(name, px); };

  SL.render = function (html) { document.getElementById('app').innerHTML = html; };

  // Switch to a screen. The screen function is kept so it can be redrawn in place.
  SL.show = function (fn) {
    SL.current = fn;
    SL.speech.stop();
    fn();
    window.scrollTo(0, 0);
  };

  SL.refresh = function () { if (SL.current) SL.current(); };

  SL.soundOn = function () {
    return SL.store.settings().sound && SL.speech.available(SL.pack().voiceLang);
  };

  SL.say = function (text, slow) { return SL.speech.speak(text, SL.pack().voiceLang, slow); };

  SL.bar = function (title, right) {
    return '<header class="bar"><button class="iconbtn" data-act="home" aria-label="Home">&#9664;</button><h2>' +
      SL.esc(title) + '</h2>' + (right || '<span class="iconbtn ghost"></span>') + '</header>';
  };

  SL.soundBtn = function () {
    if (!SL.speech.available(SL.pack().voiceLang)) return '';
    const on = SL.store.settings().sound;
    return '<button class="iconbtn' + (on ? ' on' : '') + '" data-act="toggle-sound" aria-pressed="' + on +
      '" aria-label="Sound ' + (on ? 'on' : 'off') + '">' + (on ? '&#9835;' : '&#9835;&#824;') + '</button>';
  };

  SL.playButtons = function (text) {
    if (!SL.soundOn()) return '';
    const t = SL.esc(text);
    return '<div class="play"><button class="btn small" data-act="say" data-text="' + t + '">&#9654; Hear it</button>' +
      '<button class="btn small" data-act="say" data-slow="1" data-text="' + t + '">Slow</button></div>';
  };

  // Everything about a phrase except its English: text, phonetics, tones, audio, regional variant, tip.
  SL.detail = function (pack, p) {
    const esc = SL.esc;
    let h = '<div class="variant">';
    if (p.south) h += '<span class="tag north">North</span>';
    h += '<div class="vi big">' + esc(p.text) + '</div><div class="phon">' + esc(p.phonetic) + '</div></div>';
    if (pack.hasTones) h += '<div class="tones">' + SL.tones.chips(p.text) + '</div>';
    h += SL.playButtons(p.text);
    if (p.south) {
      h += '<div class="variant south"><span class="tag">South</span><div class="vi mid">' + esc(p.south.text || p.text) +
        '</div><div class="phon">' + esc(p.south.phonetic) + '</div>';
      if (p.south.text && SL.soundOn()) {
        h += '<button class="btn small" data-act="say" data-text="' + esc(p.south.text) + '">&#9654; Hear the words</button>';
      }
      h += '</div>';
    }
    if (p.tip) h += '<p class="tip">' + esc(p.tip) + '</p>';
    return h;
  };

  SL.actions.say = function (el) { SL.say(el.dataset.text, !!el.dataset.slow); };

  SL.actions['toggle-sound'] = function () {
    SL.store.setSetting('sound', !SL.store.settings().sound);
    SL.speech.stop();
    SL.refresh();
  };

  function dispatch(e) {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = SL.actions[el.dataset.act];
    if (fn) fn(el, e);
  }

  document.addEventListener('click', dispatch);
  // Lets keyboard users activate tappable elements that are not real buttons (the flashcard).
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-act]')) {
      e.preventDefault();
      dispatch(e);
    }
  });
})();
