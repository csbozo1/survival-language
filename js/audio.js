// Text-to-speech using the device's built-in voices (works offline once the voice is on the device).
(function () {
  const SL = window.SL = window.SL || {};
  const synth = window.speechSynthesis;
  const listeners = [];
  let voices = [];
  let signature = '';

  function load() {
    try { voices = synth ? synth.getVoices() : []; } catch (e) { voices = []; }
    const sig = voices.map(function (v) { return v.lang; }).join(',');
    if (sig !== signature) {
      signature = sig;
      listeners.forEach(function (f) { f(); });
    }
  }

  function voiceFor(lang) {
    const want = lang.toLowerCase();
    const norm = function (v) { return v.lang.replace('_', '-').toLowerCase(); };
    return voices.find(function (v) { return norm(v) === want; }) ||
      voices.find(function (v) { return norm(v).split('-')[0] === want.split('-')[0]; }) || null;
  }

  if (synth) {
    load();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', load);
    // Some browsers fill the voice list late without firing the event.
    [300, 1000, 3000].forEach(function (ms) { setTimeout(load, ms); });
  }

  SL.speech = {
    available: function (lang) { return !!voiceFor(lang); },
    speak: function (text, lang, slow) {
      const v = synth && voiceFor(lang);
      if (!v) return false;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/…|\.\.\./g, ' ').trim());
      u.voice = v;
      u.lang = v.lang;
      u.rate = slow ? 0.55 : 0.9;
      synth.speak(u);
      return true;
    },
    stop: function () { if (synth) synth.cancel(); },
    onChange: function (f) { listeners.push(f); }
  };
})();
