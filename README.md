# Timekeeper — iPad PWA

Single-page app, no build step. Offline-capable, installs to the iPad Home Screen.

## Files

```
index.html            app (patched from timekeeper.html)
fonts.css             @font-face rules -> ./fonts
fonts/                Doto + IBM Plex Mono + Sans Condensed, latin + latin-ext (123 KB)
icons/                180 / 192 / 512 / 512-maskable / favicon
manifest.webmanifest  standalone, landscape, dark
sw.js                 precaches all 21 assets, cache-first
README.md
```

## Deploy

HTTPS is mandatory — service workers and Add to Home Screen do not work over `http://`
except on `localhost`.

**GitHub Pages**

```bash
git init && git add . && git commit -m "timekeeper pwa"
git branch -M main
git remote add origin git@github.com:<user>/timekeeper.git
git push -u origin main
```
Repo → Settings → Pages → Source: `main`, folder `/ (root)`.
Live at `https://<user>.github.io/timekeeper/`.

**Netlify** — drag this folder onto https://app.netlify.com/drop.

**Local test** — `python3 -m http.server 8080`, then `http://localhost:8080`.
Service worker registers on localhost; iOS install still needs a real HTTPS host.

## Install on iPad

1. Open the URL in **Safari** (Chrome/Firefox on iOS cannot install PWAs).
2. Share → **Add to Home Screen** → Add.
3. Launch from the icon. No address bar, no tab bar, full screen.

## What changed vs. the original file

| Area | Change |
|---|---|
| Clock | `performance.now()` → `Date.now()`. iOS suspends `requestAnimationFrame` when the app is backgrounded or the screen locks; wall-clock time survives that, so the readout is correct on resume instead of frozen. |
| Missed alert | If the app was backgrounded straight through zero, it enters overtime silently rather than blinking and beeping late. Threshold is `BLINK_MS` (3000 ms). |
| Screen sleep | `navigator.wakeLock` acquired on start, released on pause/reset, re-acquired on `visibilitychange`. Safari 16.4+. |
| Alert tone | Three 880 Hz square blips on the lit blink phases (500/1500/2500 ms). WebAudio is unlocked by the first `pointerdown`. Set `const BEEP = false` at the top of the script to silence. |
| Drums | `scrollend` listener commits the value after iOS momentum settles; `touch-action:pan-y` keeps the page from moving with them. |
| Rotation | Re-snap on `resize`, `orientationchange`, and `visualViewport` resize. |
| Safe area | Body gutter is `--frame` + `env(safe-area-inset-*)`; the 16:9 panel height math subtracts `--pad-v` so it never runs under the home indicator. |
| Touch chrome | No text selection, no callout menu, no tap highlight, no double-tap or pinch zoom, no rubber-band scroll. `:hover` neutralised under `@media (hover:none)` so buttons don't stay latched after a tap. |
| Fonts | Self-hosted. Google Fonts over the network would break the app offline. |

## Known limits

- **Silent switch.** Safari has no audio-session control, so the alert tone is muted when the iPad's ringer switch is off or Silent Mode is on. The blink is the reliable cue.
- **No background execution.** iOS freezes the app when you switch away. Elapsed time is recovered correctly on return, but nothing fires while it is hidden — no notification at zero. That requires a native build.
- **Letterboxing.** The panel is locked to 16:9; an iPad is 4:3, so there are bars above and below. To fill the screen instead, relax `aspect-ratio` on `.rig`.
- **Wake Lock needs the app in the foreground.** Locking the iPad manually still suspends it.

## After editing anything

Bump `CACHE` in `sw.js` (`timekeeper-v1` → `-v2`) or the old files keep being served.
