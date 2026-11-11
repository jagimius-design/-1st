# GAME

Loopstone: a premium digital edition of Surakarta, a traditional (public-domain) Javanese board
game where stones capture by riding loops round the board's corners, dressed as an ancient Maya
temple: carved limestone, jade against obsidian, a pyramid to climb, flute-and-drum music. Plain HTML/CSS/JS ES modules,
no dependencies, no build step to run it; works offline as a PWA. One codebase for every store:
the free web demo and the paid build differ only in `config.js`. The demo is deployed to GitHub
Pages at `/game/` beside SITE (`.github/workflows/pages.yml`).

Rules live in `core.js`, the opponent in `ai.js` (run in a worker), everything on screen in `ui.js`.
Content (opponents, lessons, themes and what the demo includes) is data in `content.js`.

- `index.html` — all screens: menu (with the temple scene), Temple Ascent, Beginner's Path, Achievements,
  Quick Play, Settings, game.
- `style.css` — screen and component styles.
- `ui.js` — screens, canvas drawing (carved board cached per size/theme, stone sprites), animation, input,
  game flow, saved data (`localStorage`).
- `core.js` — rules: circuits, moves, captures with paths, outcome. Pure, runs in Node.
- `ai.js` — `chooseMove` (negamax, quiescence, iterative deepening) and the five `LEVELS`.
- `ai-worker.js` — runs `chooseMove` off the main thread.
- `coach.js` — strategy help: `meetsGoal` checks Beginner's Path puzzle answers, `coachTip` picks the
  in-game coach's line. Rests on threats being mutual: a capture path reversed is a capture path.
- `portraits.js` — `portrait(look, color)`: SVG busts of the Temple Ascent rivals, one headdress per `look.head`.
- `achievements.js` — `earned(data, event)`: which achievements are newly met; `reward(id)`: what each unlocks.
- `content.js` — Temple Ascent opponents (with `look` and spoken `lines`), `ACHIEVEMENTS`, `STONES` sets, tutorial lessons, Beginner's Path puzzles (`DRILLS`), boards
  (`THEMES`), demo limits. Each achievement unlocks exactly one board or stone set (`unlock` field). New puzzles must pass `tests/coach.test.js` (a solution and a wrong answer).
- `audio.js` — synthesised instruments (ocarina, slit drum, rattle, rain stick, conch), sound effects
  and the generative background music: a 16-bar cycle at 100 bpm (groove, full band with harmony, breakdown, drum fill); no continuous drone.
- `config.js` — `FULL_VERSION` and `STORE_URL`, the only build-time switches.
- `build.mjs` — `node build.mjs [store-url]` writes `dist/web` (demo) and `dist/full` (paid), with the
  font inlined into `style.css`.
- `fonts/` — Cinzel 700 (SIL OFL, licence in `OFL.txt`) for headings.
- `sw.js`, `manifest.webmanifest`, `icon.svg`, `icon-512.png` — offline cache and install metadata;
  bump `VERSION` in `sw.js` when shipped files change.
- `store/` — store screenshots (phone 860×1864, desktop 1280×800).
- `SELLING.md` — platforms, price, listing copy, launch steps.
- `tests/` — `npm test` (`node --test`).
