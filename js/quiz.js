// Multiple-choice quiz with three question types and a retry round for missed phrases.
(function () {
  const SL = window.SL;
  const esc = SL.esc;
  const TYPES = ['en2x', 'x2en', 'listen'];
  let S = null;

  function typeLabel(key, pack) {
    if (key === 'en2x') return 'English → ' + pack.name;
    if (key === 'x2en') return pack.name + ' → English';
    return 'Listen → English';
  }

  // Listen questions need sound, so they drop out when it is off.
  function activeTypes() {
    const chosen = SL.store.settings().quizTypes;
    const on = SL.soundOn();
    return TYPES.filter(function (k) { return chosen[k] && (k !== 'listen' || on); });
  }

  function seg(act, items) {
    return '<div class="seg">' + items.map(function (it) {
      return '<button class="btn small' + (it.on ? ' on' : '') + '" data-act="' + act + '" data-val="' + it.val +
        '" aria-pressed="' + it.on + '">' + esc(it.label) + '</button>';
    }).join('') + '</div>';
  }

  function setup() {
    const pack = SL.pack();
    const s = SL.store.settings();
    const on = SL.soundOn();
    const n = pack.phrases.length;
    let h = SL.bar('Quiz setup');

    h += '<section class="panel px"><h3>Sound</h3>';
    if (SL.speech.available(pack.voiceLang)) {
      h += seg('quiz-sound', [{ val: '1', label: 'On', on: on }, { val: '0', label: 'Off', on: !on }]) +
        '<p class="hint">No headphones? Turn it off. Listen questions are skipped and nothing plays aloud.</p>';
    } else {
      h += '<p class="hint">No ' + esc(pack.name) + ' voice was found on this device, so audio and Listen questions are off.</p>';
    }
    h += '</section>';

    h += '<section class="panel px"><h3>Question types</h3><div class="stack tight">';
    TYPES.forEach(function (k) {
      const blocked = k === 'listen' && !on;
      const sel = s.quizTypes[k] && !blocked;
      h += '<button class="btn small check' + (sel ? ' on' : '') + '" data-act="quiz-type" data-key="' + k + '"' +
        (blocked ? ' disabled' : '') + ' aria-pressed="' + sel + '"><span class="box">' + (sel ? '&#9632;' : '&#9633;') +
        '</span> ' + esc(typeLabel(k, pack)) + '</button>';
    });
    h += '</div></section>';

    if (n > 10) {
      h += '<section class="panel px"><h3>Length</h3>' + seg('quiz-len', [
        { val: '10', label: '10 questions', on: s.quizLen !== 'all' },
        { val: 'all', label: 'All ' + n, on: s.quizLen === 'all' }
      ]) + '<p class="hint">Phrases you are still learning come up first.</p></section>';
    }

    h += '<div class="stack"><button class="btn red" data-act="quiz-start"' + (activeTypes().length ? '' : ' disabled') +
      '>Start quiz</button></div>';
    SL.render(h);
  }

  // Shaky phrases first, then unseen, then known.
  function choose(pack, n) {
    const rank = { learning: 0, new: 1, known: 2 };
    const st = function (p) { return rank[SL.store.get(pack.code, p.id).status]; };
    const sorted = SL.shuffle(pack.phrases).sort(function (a, b) { return st(a) - st(b); });
    return SL.shuffle(sorted.slice(0, n));
  }

  function makeQuestion(pack, p, types) {
    const type = types[Math.floor(Math.random() * types.length)];
    const label = function (x) { return type === 'en2x' ? x.text : x.en; };
    const others = pack.phrases.filter(function (x) { return x.id !== p.id; });
    const same = SL.shuffle(others.filter(function (x) { return x.category === p.category; }));
    const rest = SL.shuffle(others.filter(function (x) { return x.category !== p.category; }));
    // Two wrong answers from the same category keep it plausible; the third adds variety.
    const candidates = same.slice(0, 2).concat(rest, same.slice(2));
    const opts = [p];
    for (const x of candidates) {
      if (opts.length === 4) break;
      if (!opts.some(function (o) { return label(o) === label(x); })) opts.push(x);
    }
    return { p: p, type: type, opts: SL.shuffle(opts) };
  }

  function start(list, retry) {
    const pack = SL.pack();
    const types = activeTypes();
    S = {
      pack: pack, retry: !!retry, i: 0, score: 0, missed: [], picked: null,
      qs: list.map(function (p) { return makeQuestion(pack, p, types); })
    };
    SL.show(render);
    autoListen();
  }

  function autoListen() {
    const q = S.qs[S.i];
    if (q.type === 'listen' && SL.soundOn()) SL.say(q.p.text);
  }

  function render() {
    const q = S.qs[S.i];
    const p = q.p;
    const answered = S.picked !== null;
    let h = SL.bar((S.retry ? 'Retry ' : 'Quiz ') + (S.i + 1) + '/' + S.qs.length);

    h += '<section class="panel px prompt">';
    if (q.type === 'en2x') {
      h += '<p class="label">How do you say</p><div class="en big">' + esc(p.en) + '</div>';
    } else if (q.type === 'x2en') {
      h += '<p class="label">What does this mean?</p><div class="vi big">' + esc(p.text) + '</div>';
    } else {
      h += '<p class="label">Listen, then pick the meaning</p>' + SL.playButtons(p.text);
    }
    h += '</section><div class="stack">';

    q.opts.forEach(function (o, i) {
      let cls = 'btn opt';
      if (answered && o.id === p.id) cls += ' right';
      else if (answered && i === S.picked) cls += ' wrong';
      const body = q.type === 'en2x'
        ? '<span class="vi">' + esc(o.text) + '</span><span class="phon">' + esc(o.phonetic) + '</span>'
        : '<span>' + esc(o.en) + '</span>';
      h += '<button class="' + cls + '" data-act="quiz-pick" data-i="' + i + '"' + (answered ? ' disabled' : '') + '>' +
        body + '</button>';
    });
    h += '</div>';

    if (answered) {
      const ok = q.opts[S.picked].id === p.id;
      h += '<section class="panel px result ' + (ok ? 'ok' : 'no') + '"><h3>' +
        (ok ? '<span class="pop">' + SL.sprite('star', 3) + '</span> Correct!' : 'Not quite') + '</h3><div class="en">' +
        esc(p.en) + '</div>' + SL.detail(S.pack, p) + '</section>' +
        '<div class="stack"><button class="btn red" data-act="quiz-next">' +
        (S.i + 1 === S.qs.length ? 'See results' : 'Next') + '</button></div>';
    }
    SL.render(h);
  }

  function results() {
    const total = S.qs.length;
    const missed = S.missed;
    const perfect = !missed.length;
    let h = SL.bar(S.retry ? 'Retry results' : 'Results');
    h += '<section class="panel px center"><div class="' + (perfect ? 'party' : '') + '">' +
      SL.sprite(perfect ? 'pho' : 'coffee', 8) + '</div><div class="score">' + S.score + ' / ' + total + '</div><p>' +
      (perfect ? (S.retry ? 'Every missed phrase nailed.' : 'Perfect round!') : 'Keep going. The missed ones are below.') +
      '</p></section>';
    if (!perfect) {
      h += '<section class="panel px"><h3>Missed</h3><ul class="missed">' + missed.map(function (p) {
        return '<li><span class="en">' + esc(p.en) + '</span><span class="vi">' + esc(p.text) + '</span><span class="phon">' +
          esc(p.phonetic) + '</span></li>';
      }).join('') + '</ul></section>';
    }
    h += '<div class="stack">';
    if (!perfect) h += '<button class="btn red" data-act="quiz-retry">Retry missed (' + missed.length + ')</button>';
    h += '<button class="btn' + (perfect ? ' red' : '') + '" data-act="quiz-setup">New quiz</button>' +
      '<button class="btn" data-act="home">Home</button></div>';
    SL.render(h);
  }

  SL.actions['quiz-setup'] = function () { SL.show(setup); };

  SL.actions['quiz-sound'] = function (el) {
    SL.store.setSetting('sound', el.dataset.val === '1');
    SL.speech.stop();
    setup();
  };

  SL.actions['quiz-type'] = function (el) {
    const t = SL.store.settings().quizTypes;
    t[el.dataset.key] = !t[el.dataset.key];
    SL.store.setSetting('quizTypes', t);
    setup();
  };

  SL.actions['quiz-len'] = function (el) {
    SL.store.setSetting('quizLen', el.dataset.val === 'all' ? 'all' : 10);
    setup();
  };

  SL.actions['quiz-start'] = function () {
    const pack = SL.pack();
    const len = SL.store.settings().quizLen;
    start(choose(pack, len === 'all' ? pack.phrases.length : 10), false);
  };

  SL.actions['quiz-pick'] = function (el) {
    if (S.picked !== null) return;
    const q = S.qs[S.i];
    S.picked = Number(el.dataset.i);
    const ok = q.opts[S.picked].id === q.p.id;
    if (ok) S.score++; else S.missed.push(q.p);
    SL.store.answer(S.pack.code, q.p.id, ok);
    render();
    const panel = document.querySelector('.result');
    if (panel && panel.scrollIntoView) panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    if (q.type !== 'listen' && SL.soundOn()) SL.say(q.p.text);
  };

  SL.actions['quiz-next'] = function () {
    if (S.i + 1 < S.qs.length) {
      S.i++;
      S.picked = null;
      SL.show(render);
      autoListen();
      return;
    }
    if (!S.retry) SL.store.addHistory(S.pack.code, { t: Date.now(), score: S.score, total: S.qs.length });
    SL.show(results);
  };

  SL.actions['quiz-retry'] = function () { start(SL.shuffle(S.missed), true); };
})();
