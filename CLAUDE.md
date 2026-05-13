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
src/scenes/      BootScene, BattleScene  (GameOverScene — future)
src/core/        Pure logic: World, Lane, Player
src/entities/    Entity base, Building base, Unit, Statue, Miner
src/units/       units.config.js, miners.config.js
src/buildings/   InkWell, buildings.config.js  (SealStamp, InkTurret — future)
src/ui/          HUD, UnitBar, LaneSelector  (StancePanel — future)
src/commands/    (future) StanceController
src/powers/      (future) Power base + concrete powers
src/ai/          (future) EnemyAI
src/config/      constants.js, balance.js
```

Folders marked `(future)` are listed in the plan but not yet created.

## Current state

Phase 2 ("Economy & Control") is done. On top of Phase 1:
- Each player has an `InkWell` building and 3 starting `Miner` entities that auto-cycle (walk-mine-deposit) and add ink to their `Player`.
- Controlled-entity mechanic on `Player` (`controlled`, `setControlled`, `clearControlled`). While controlled, `Miner.effective*` getters apply multipliers from `miners.config.js`. Visualised by a pulsing gold ring drawn each frame by `BattleScene.drawControlIndicator`.
- UI: `HUD` (top bar with names, seal HP, ink), `UnitBar` (buy buttons — costs deducted directly from `player.ink`), `LaneSelector` (sets `player.activeLane`).
- Left-side click in the play area = control / deselect. Right-side click = free Vermillion spawn (placeholder for Phase 5 AI).

Still deferred: unit-vs-unit combat (units pass through each other and only attack statues), stances, defense buildings, powers, AI, menu.

## Gotchas

- **`scene.update(time, dt)` second arg is delta in ms** — `Unit.update`, `Miner.update`, and `World.update` all expect ms. Don't mix s and ms when adding new tick logic.
- **Phaser graphics are screen-space.** For moving entities (`Unit`, `Miner`) we draw in local coords once in `draw()` then translate via `gfx.x` / `gfx.y` each frame. Don't `g.clear()` + redraw every frame; that leaks. Pattern for the controlled-unit indicator is the exception — `BattleScene.drawControlIndicator` does `g.clear()` per frame on a single per-player Graphics it owns, which is fine because there's only one.
- **Statues use absolute coords directly in `draw()`** because they don't move — different convention from Unit/Miner. Don't mix.
- **Right-side click is the AI stand-in.** It free-spawns a Vermillion swordsman. Remove from `BattleScene.bindInput` when the AI ships (Phase 5).
- **Click-to-control:** `BattleScene.pickEntityAt` is what decides if a play-area click hit something. Range is `entity.radius + 4` — slightly forgiving. Right-side entities are unselectable (control is left-player only for now).
- **Win condition emits `gameOver` on the scene's event emitter** — see `World.update` and `BattleScene.create`. Use that pattern for cross-system signals (don't add direct refs between AI / UI / world).
- **Entity cleanup happens in `World.update` after the tick.** Dead entities have `destroy()` called once, then are filtered out of `lane.units`, `player.units`, `player.miners`. `Entity.destroy` (and overrides in `Statue`, `Miner`) is idempotent / null-safe.
- **Controlled state is on `Player`.** `player.controlled` points to the live entity. World clears it automatically if the controlled entity dies. UI / mechanic getters live on the entity (`Miner.isControlled`, `Miner.effective*`).
- **UI panel layering:** the dark bottom panel is drawn *before* the UnitBar / LaneSelector so the buttons render on top. If you add more UI, keep that order in `BattleScene.create`.

## Deployment

GitHub Pages serves static files at the repo root. When ready:
- Add `.nojekyll` at repo root so Pages doesn't try to process `_`-prefixed paths.
- Enable Pages in repo settings (Source: main / root).
- No build step to run.
