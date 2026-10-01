# Survival Language

Offline flashcards and multiple-choice quizzes for the handful of phrases every traveller needs. Ships with a Vietnamese pack (34 phrases, Northern standard with Southern variants).

No build step and no dependencies: plain HTML, CSS and JavaScript.

## Run it on a laptop

Double-click `index.html`. That is all.

To also test offline caching, serve the folder instead and open <http://localhost:8000>:

```sh
python3 -m http.server 8000
```

## Put it on an iPhone

1. Publish the folder to GitHub Pages (repo Settings → Pages → Deploy from a branch → `main` / root).
2. Open the Pages link in **Safari**.
3. Share → **Add to Home Screen**.
4. Open the app from the Home Screen once while online so it can store itself.
5. Turn on airplane mode and open it again to confirm it loads.

Progress is saved on the device. The Home Screen app keeps its own progress, separate from Safari, so study from the icon.

### Audio

The app speaks with the phone's built-in voice. Download it before you lose internet:

Settings → Accessibility → Spoken Content (called "Read & Speak" on newer iOS) → Voices → Vietnamese.

The iPhone's Vietnamese voice has a Northern accent. Southern words and pronunciation are shown in writing on each card.

If there is no Vietnamese voice, the app hides the audio buttons and Listen questions and says so on the home screen.

## Add a language

1. Copy `packs/vi.js` to `packs/<code>.js` and change the contents. Each phrase needs `id`, `category`, `en`, `text` and `phonetic`; `south` (a regional variant) and `tip` are optional. Set `hasTones: false` for languages without tones.
2. Add `<script src="packs/<code>.js"></script>` after `packs/vi.js` in `index.html`.
3. Add `'packs/<code>.js'` to the `ASSETS` list in `sw.js` and bump the `CACHE` version.
4. Run `node tools/check-pack.js`.

A language picker appears on the home screen as soon as there is more than one pack.

## Updating the installed app

The app is served from its offline cache and refreshed in the background, so after publishing a change, open the app online twice to see it.

## Tools

- `node tools/check-pack.js` checks every pack for missing fields and duplicates.
- `node tools/make-icons.js` regenerates the app icons.

## Credits

Pixel font: Press Start 2P, SIL Open Font License (see `fonts/OFL.txt`).
