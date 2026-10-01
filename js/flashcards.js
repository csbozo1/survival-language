// Flashcards: flip, then self-grade. "Still learning" cards go to the back of the deck until cleared.
(function () {
  const SL = window.SL;
  const esc = SL.esc;
  let F = null;

  function status(pack, p) { return SL.store.get(pack.code, p.id).status; }

  function deckList(pack, deck) {
    if (deck === 'weak') return pack.phrases.filter(function (p) { return status(pack, p) !== 'known'; });
    if (deck.indexOf('cat:') === 0) {
      return pack.phrases.filter(function (p) { return p.category === deck.slice(4); });
    }
    return pack.phrases.slice();
  }

  function deckBtn(deck, sprite, title, sub, cls) {
    return '<button class="btn deck ' + (cls || '') + '" data-act="flash-start" data-deck="' + esc(deck) + '">' +
      SL.sprite(sprite, 3) + '<span class="deck-name">' + esc(title) + '</span><small>' + esc(sub) + '</small></button>';
  }

  function setup() {
    const pack = SL.pack();
    const all = pack.phrases;
    const weak = deckList(pack, 'weak');
    let h = SL.bar('Flashcards', SL.soundBtn()) + '<div class="stack">';
    h += deckBtn('all', 'star', 'All phrases', all.length + ' cards', 'red');
    if (weak.length && weak.length < all.length) h += deckBtn('weak', 'coffee', 'Needs work', weak.length + ' cards', 'gold');
    Object.keys(pack.categories).forEach(function (cat) {
      const list = deckList(pack, 'cat:' + cat);
      const known = list.filter(function (p) { return status(pack, p) === 'known'; }).length;
      h += deckBtn('cat:' + cat, pack.categories[cat], cat, known + '/' + list.length + ' known');
    });
    SL.render(h + '</div>');
  }

  function render() {
    if (!F.queue.length) return done();
    const pack = F.pack;
    const p = F.queue[0];
    let h = SL.bar('Flashcards', SL.soundBtn());
    h += '<p class="count">' + F.cleared + ' / ' + F.total + ' cleared</p>';
    h += '<div class="card px ' + (F.flipped ? 'back' : 'front') + '" data-act="flash-flip" role="button" tabindex="0">';
    if (F.flipped) {
      h += '<div class="en">' + esc(p.en) + '</div>' + SL.detail(pack, p);
    } else {
      h += SL.sprite(pack.categories[p.category], 6) + '<p class="label">' + esc(p.category) + '</p><div class="en big">' +
        esc(p.en) + '</div><p class="hint">Tap to flip</p>';
    }
    h += '</div>';
    if (F.flipped) {
      h += '<div class="pair"><button class="btn gold" data-act="flash-grade" data-ok="0">Still learning</button>' +
        '<button class="btn green" data-act="flash-grade" data-ok="1">Got it</button></div>';
    }
    SL.render(h);
  }

  function done() {
    SL.render(SL.bar('Flashcards') +
      '<section class="panel px center">' + '<div class="party">' + SL.sprite('lotus', 8) + '</div>' +
      '<h3>Deck cleared!</h3><p>' + F.total + ' cards down. Lock them in with a quiz.</p></section>' +
      '<div class="stack"><button class="btn red" data-act="quiz-setup">Quiz me</button>' +
      '<button class="btn" data-act="flash-setup">More flashcards</button>' +
      '<button class="btn" data-act="home">Home</button></div>');
  }

  SL.actions['flash-setup'] = function () { SL.show(setup); };

  SL.actions['flash-start'] = function (el) {
    const pack = SL.pack();
    const list = deckList(pack, el.dataset.deck);
    F = { pack: pack, queue: list, total: list.length, cleared: 0, flipped: false };
    SL.show(render);
  };

  SL.actions['flash-flip'] = function () {
    F.flipped = !F.flipped;
    render();
    if (F.flipped && SL.soundOn()) SL.say(F.queue[0].text);
  };

  SL.actions['flash-grade'] = function (el) {
    const ok = el.dataset.ok === '1';
    const p = F.queue.shift();
    SL.store.grade(F.pack.code, p.id, ok);
    if (ok) F.cleared++; else F.queue.push(p);
    F.flipped = false;
    SL.speech.stop();
    render();
    window.scrollTo(0, 0);
  };
})();
