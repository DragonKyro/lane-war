# Lane War — Project Notes for Claude

## What this is

A 1v1 lane-battle game (vs AI for v1, online later) inspired by Stick War, Age of War, and Battle Cats. Theme is "Ink & Origami" — Black Ink vs Vermillion paper kingdoms.

The implementation plan and phase roadmap live in `C:\Users\klui\.claude\plans\vast-wandering-gosling.md`. Read it before making non-trivial changes — it has the full design (stances, economy, powers, AI) plus the agreed phase order.

## Tech

- **Phaser 3 (3.80.1) via CDN.** Loaded as a global `<script>` in `index.html`; our code uses the `Phaser` global without importing it.
- **Vanilla ES6 modules** for our own code (`<script type="module" src="src/main.js">`).
- **No build step, no bundler, no package.json.** Project is pure static — drops onto GitHub Pages as-is.
- **No dependencies to install.** Just open it in a browser via a local server.

## Running it

ES6 modules require HTTP, not `file://`. Any local server works:

```bash
python -m http.server 8000   # then http://localhost:8000
```

There are no tests or lints yet. Verification is manual in a browser.

## Code conventions

- **OOP first.** Units, buildings, powers, statues, etc. are classes. Data (stats, costs) lives in `*.config.js` tables; behaviour lives in classes. Keep that split.
- **`Entity` is the base class** for anything tickable+drawable in the world (`src/entities/Entity.js`). New world objects extend it.
- **Phaser globals only inside scenes.** Pure logic classes (`World`, `Player`, `Lane`, `Economy`, AI) should not touch `this.scene.add.*` — they receive the scene if they need it and ask it to draw. This keeps logic testable later.
- **ES6 module imports use explicit `.js` extensions** (required by browsers — no bundler to resolve them).
- **No comments unless the *why* is non-obvious.** Self-explanatory code; reserve comments for hidden constraints / surprising behaviour.
- **File naming:** PascalCase for class files (`Unit.js`), camelCase for data/config (`units.config.js`), kebab-case for HTML/CSS.

## Coordinate system / world layout

Defined in [src/config/constants.js](src/config/constants.js):

- World is `1280 × 720`. Phaser is set to `Phaser.Scale.FIT`, so it scales to viewport while preserving aspect.
- Top `HUD_H = 80` is HUD; bottom `UI_H = 100` is reserved for unit/stance UI. Play area is `PLAY_TOP` (80) to `PLAY_BOTTOM` (620).
- Three lane center-Ys at 25%, 50%, 75% of the play area (`LANE_YS`).
- Statues sit at `STATUE_X.left = 100` and `STATUE_X.right = 1180`.
- Left side = "Black Ink", right side = "Vermillion". `SIDE.LEFT` / `SIDE.RIGHT` constants in `constants.js`.

## Project structure

```
index.html, style.css, src/main.js
src/scenes/      Phaser scenes (BootScene → BattleScene → GameOverScene)
src/core/        Pure logic: World, Lane, Player
src/entities/    Entity base, Unit, Statue, (Miner, Building — future)
src/units/       Concrete unit data + classes
src/buildings/   (future) Defense buildings + InkWell
src/commands/    (future) StanceController
src/powers/      (future) Power base + concrete powers
src/economy/     (future) Economy
src/ai/          (future) EnemyAI
src/ui/          (future) HUD, UnitBar, StancePanel, LaneSelector
src/config/      constants.js, balance.js
```

Folders marked `(future)` are listed in the plan but not yet created.

## Current state

Phase 1 ("Hello, Battlefield") is done: lanes, statues, click-to-spawn a placeholder unit that walks across and damages the enemy statue. No economy, no stances, no AI yet — those come in Phases 2–5.

## Gotchas

- **`scene.update(time, dt)` second arg is delta in ms** — `Unit.update` and `World.update` already expect ms. Don't mix s and ms when adding new tick logic.
- **Phaser graphics are screen-space.** When moving a `Graphics` object, set its `x`/`y` properties (we do that in `Unit.draw`/`update`). Don't redraw every frame; that leaks.
- **Both sides spawn via click in Phase 1.** The right-side click is a stand-in for the future AI — when AI lands, remove the right-side click handler in `BattleScene.bindInput`.
- **Win condition emits `gameOver` on the scene's event emitter** — see `World.update` and `BattleScene.create`. Use that pattern for cross-system signals (don't add direct refs between AI / UI / world).

## Deployment

GitHub Pages serves static files at the repo root. When ready:
- Add `.nojekyll` at repo root so Pages doesn't try to process `_`-prefixed paths.
- Enable Pages in repo settings (Source: main / root).
- No build step to run.
