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
src/core/        Pure logic: World, Lane (with buildings array), Player
src/entities/    Entity base, Building base, Unit (slow-aware), Statue, Miner
src/units/       units.config.js (includes foldedTiger summon), miners.config.js
src/buildings/   InkWell, PaperBastion (wall), InkSentry (turret), buildings.config.js
src/commands/    StanceController + STANCE enum + STANCE_ORDER + STANCE_LABEL
src/powers/      Power base + InkStorm, FoldedTiger, WetPage + powers.config.js
src/ui/          HUD, UnitBar (8-button), LaneSelector, StancePanel, PowerBar
src/ai/          (future) EnemyAI
src/config/      constants.js, balance.js
```

Folders marked `(future)` are listed in the plan but not yet created.

## Current state

Phase 4 ("Defenses & Powers") is done. On top of Phases 1–3:
- **Defense buildings** in [src/buildings/](src/buildings/): `PaperBastion` (wall, no attack, big HP) and `InkSentry` (turret, range 200, single-target). Both extend `Building` (which extends `Entity`). Each player has `buildingSlots: [null, null, null]` — one slot per lane. `Player.hasBuildingSlot(laneIdx)` and `BattleScene.tryPlaceBuilding` are the placement entry points. Buildings sit at the dashed defense line position.
- **Lane.buildings** array holds the per-lane defense buildings. `Unit.findEnemy` now iterates `lane.units.concat(lane.buildings)`. Splash damage in `Unit.attack` also hits buildings in radius.
- **Powers** in [src/powers/](src/powers/): `Power` base + `InkStorm` (targeted AoE damage), `FoldedTiger` (instant summon of a `UNIT_TYPES.foldedTiger`), `WetPage` (targeted slow field). Config in [src/powers/powers.config.js](src/powers/powers.config.js). Each `Player.powers` is a list of fresh `Power` instances — cooldowns are per-player.
- **Slow effect on Units**: `slowEnd` (timestamp) + `slowMul` on `Unit`. `Unit.effectiveSpeed` getter reads the current time vs `slowEnd` to apply the multiplier. `WetPage` only refreshes `slowEnd` if its new end is later — slows don't accidentally shorten each other.
- **Targeting flow** in `BattleScene`: `pendingPower` is set when player clicks a power button that `needsTarget`. `drawTargetingCursor` renders a red AoE preview each frame at the mouse. `bindInput` checks `pendingPower` first: clicks inside the play area cast + cancel; clicks outside leave the pending power alone (so clicking another power button doesn't immediately cancel itself). ESC always cancels.
- **HUD layout**: bottom panel now has UnitBar (8 buttons: scribe + 5 units + 2 buildings, btnW 70) → LaneSelector → StancePanel → PowerBar (3 buttons).
- **Right player has powers too** but no UI for them yet — they sit waiting for the Phase 5 AI to use them.

Still deferred: AI opponent (Phase 5), menu / hotseat / polish (Phase 6).

## Gotchas

- **`scene.update(time, dt)` second arg is delta in ms** — `Unit.update`, `Miner.update`, and `World.update` all expect ms. Don't mix s and ms when adding new tick logic.
- **Phaser graphics are screen-space.** For moving entities (`Unit`, `Miner`) we draw in local coords once in `draw()` then translate via `gfx.x` / `gfx.y` each frame. Don't `g.clear()` + redraw every frame; that leaks. Pattern for the controlled-unit indicator is the exception — `BattleScene.drawControlIndicator` does `g.clear()` per frame on a single per-player Graphics it owns, which is fine because there's only one.
- **Statues use absolute coords directly in `draw()`** because they don't move — different convention from Unit/Miner. Don't mix.
- **Right-side click is the AI stand-in.** It free-spawns a Vermillion swordsman. Remove from `BattleScene.bindInput` when the AI ships (Phase 5).
- **Click-to-control:** `BattleScene.pickEntityAt` is what decides if a play-area click hit something. Range is `entity.radius + 4` — slightly forgiving. Right-side entities are unselectable (control is left-player only for now).
- **Win condition emits `gameOver` on the scene's event emitter** — see `World.update` and `BattleScene.create`. Use that pattern for cross-system signals (don't add direct refs between AI / UI / world).
- **Entity cleanup happens in `World.update` after the tick.** Dead entities have `destroy()` called once, then are filtered out of `lane.units`, `player.units`, `player.miners`. `Entity.destroy` (and overrides in `Statue`, `Miner`) is idempotent / null-safe.
- **Controlled state is on `Player`.** `player.controlled` points to the live entity. World clears it automatically if the controlled entity dies. UI / mechanic getters live on the entity (`Miner.isControlled`, `Miner.effective*`).
- **UI panel layering:** the dark bottom panel is drawn *before* the UnitBar / LaneSelector / StancePanel so the buttons render on top. If you add more UI, keep that order in `BattleScene.create`.
- **Stance is read fresh from the controller each tick** — don't cache it on the Unit. The UI flips a single source of truth (`player.stanceController.stances[]`) and Units adapt next frame.
- **Splash damage:** `splashRadius` lives on the *unit type*, not the projectile (there is no projectile entity yet — Phase 3 uses instant hits + FX tweens). When the unit attacks, the AoE is centered on the *target's* position, not the attacker. Statue is included in the splash if within radius.
- **Side-based outlines** are computed in a getter (`Unit.outlineColor`), not stored in the unit-type config — keeps data tables decoupled from team identity.
- **`findEnemy` rejects enemies far behind** (`forward < -2*radius`). This stops melee units from backtracking when a Rush-stance enemy slipped past them — instead they keep marching to the enemy seal. If you ever want true two-direction engagement, remove that guard.
- **Buildings vs combat:** `lane.buildings` is iterated alongside `lane.units` in `Unit.findEnemy` and splash. Buildings can be targeted, damaged, and destroyed exactly like units. The `InkSentry` has its own `findEnemy` (no buildings, simpler — turrets shoot mobile enemies only).
- **Build slot lifecycle:** placing → `Player.buildingSlots[lane]` is set + `Lane.addBuilding` is called. On death, `World.update` cleans the slot back to null and the slot becomes available again. Player can rebuild in that lane.
- **Power targeting click-order trap:** when a power button is clicked, the scene-level `pointerdown` ALSO fires (Phaser doesn't auto-stop). `BattleScene.bindInput` handles this by only canceling `pendingPower` after a successful cast (i.e. when the click was inside the play area). A click on the power button is outside the play area and therefore leaves `pendingPower` intact, which is the correct behavior — the new pending power survives.
- **Power cooldowns are ticked by `World.update`** via `player.powers[].update(dt)`. Don't tick them anywhere else.
- **`Unit.effectiveSpeed`** reads `scene.time.now < slowEnd` to apply `slowMul`. Don't multiply `this.speed` directly when adding movement code.

## Deployment

GitHub Pages serves static files at the repo root. When ready:
- Add `.nojekyll` at repo root so Pages doesn't try to process `_`-prefixed paths.
- Enable Pages in repo settings (Source: main / root).
- No build step to run.
