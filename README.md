# 🧸 Maisha Kids Arcade

A playful, mobile-friendly kids arcade built with Next.js, TypeScript, Three.js and React Three Fiber. The current release contains two interactive 3D games and two arcade games.

## Playable games

- **3D Balloon Pop** — pop rising 3D balloons, earn points and stars, and beat the 45-second timer.
- **3D Rainbow Xylophone** — tap 3D musical bars to play synthesized notes.
- **Candy Slicer** — swipe with mouse or touch to slice fruit and candy.
- **Monster Tap** — tap the popping monster before the 30-second timer ends.

Other game ideas are clearly marked **Coming Soon** until their gameplay is implemented.

## Requirements

- Node.js 18.17 or newer
- npm

## Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run lint
npm run build
npm start
```

No database is required. Coins, avatar selection, sound preference and best scores are stored locally in the browser with Zustand persistence. A lightweight service worker provides a cached app-shell fallback; a first visit still requires an internet connection to download the app and game bundles.

## Notes

- 3D canvases use a capped device pixel ratio and low-power WebGL preference for better performance on phones and tablets.
- Game components are loaded on demand.
- Sound is generated with the Web Audio API and can be muted from the header.
- The Google Fonts stylesheet requests Hind Siliguri; system fallbacks are provided if it is unavailable.
