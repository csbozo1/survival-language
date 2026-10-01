// Progress and settings, kept on this device only.
(function () {
  const SL = window.SL = window.SL || {};
  const PREFIX = 'sl:v1:';
  const mem = {};

  function read(key) {
    try {
      const s = localStorage.getItem(PREFIX + key);
      if (s) return JSON.parse(s);
    } catch (e) { /* storage blocked: fall back to memory */ }
    return mem[key] || null;
  }

  function write(key, val) {
    mem[key] = val;
    try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }

  function settings() {
    return Object.assign({ sound: true, pack: 'vi', quizLen: 10, quizTypes: { en2x: true, x2en: true, listen: true } },
      read('settings'));
  }

  function setSetting(k, v) {
    const s = settings();
    s[k] = v;
    write('settings', s);
  }

  function progress(code) {
    return read('pack:' + code) || { phrases: {}, history: [] };
  }

  function get(code, id) {
    return Object.assign({ c: 0, w: 0, streak: 0, status: 'new' }, progress(code).phrases[id]);
  }

  function put(code, id, rec) {
    const p = progress(code);
    p.phrases[id] = rec;
    write('pack:' + code, p);
  }

  // Flashcard self-grade.
  function grade(code, id, known) {
    const r = get(code, id);
    r.status = known ? 'known' : 'learning';
    r.streak = known ? Math.max(r.streak, 2) : 0;
    put(code, id, r);
  }

  // Quiz answer: two correct in a row marks a phrase as known; any miss sends it back to learning.
  function answer(code, id, correct) {
    const r = get(code, id);
    if (correct) {
      r.c++;
      r.streak++;
      r.status = r.streak >= 2 ? 'known' : 'learning';
    } else {
      r.w++;
      r.streak = 0;
      r.status = 'learning';
    }
    put(code, id, r);
  }

  function addHistory(code, entry) {
    const p = progress(code);
    p.history.unshift(entry);
    p.history = p.history.slice(0, 5);
    write('pack:' + code, p);
  }

  function counts(pack) {
    const c = { known: 0, learning: 0, new: 0 };
    pack.phrases.forEach(function (p) { c[get(pack.code, p.id).status]++; });
    return c;
  }

  function reset(code) {
    write('pack:' + code, { phrases: {}, history: [] });
  }

  SL.store = { settings, setSetting, progress, get, grade, answer, addHistory, counts, reset };
})();
