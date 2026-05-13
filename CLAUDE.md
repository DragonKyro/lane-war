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
src/scenes/      BootScene, MenuScene, BattleScene, GameOverScene
src/core/        Pure logic: World, Lane (with buildings array), Player
src/entities/    Entity base, Building base, Unit (slow + controlled-aware), Statue, Miner
src/units/       units.config.js (includes foldedTiger summon), miners.config.js
src/buildings/   InkWell, PaperBastion (wall), InkSentry (turret), buildings.config.js
src/commands/    StanceController + STANCE enum + STANCE_ORDER + STANCE_LABEL
src/powers/      Power base + InkStorm, FoldedTiger, WetPage + powers.config.js
src/ui/          HUD, UnitBar (8-button), LaneSelector, StancePanel, PowerBar
src/ai/          EnemyAI + aiPersonalities (Easy / Normal / Hard)
src/input/       HotseatInput (P2 keyboard adapter)
src/config/      constants.js, balance.js
```

## Current state

Phase 6 ("Menu, Hotseat, Polish") is done. The game is feature-complete for v1. On top of Phases 1–5:
- **Scene flow**: `BootScene` → `MenuScene` → `BattleScene` → `GameOverScene` → (rematch returns to BattleScene, menu button returns to MenuScene). All registered in [src/main.js](src/main.js).
- **Mode is read from `scene.registry["mode"]`** (`"ai"` or `"hotseat"`). Difficulty (`"easy"` / `"normal"` / `"hard"`) is registry-stored too. `MenuScene.start` writes both before launching `BattleScene`. Defaults are `"ai"` + `"normal"` if registry is empty (e.g. direct BattleScene entry during dev).
- **Hotseat input** lives in [src/input/HotseatInput.js](src/input/HotseatInput.js). Created in `BattleScene.create` only when `mode === "hotseat"`. P2 keys: `Q W E` (lane), `A S D F` (stance), `1`–`8` (buys, same order as the UnitBar), `9 0 -` (powers, auto-targeted via `findCluster` — same heuristic as `EnemyAI.findPowerTarget`).
- **Difficulty hotkeys (`1 / 2 / 3` for restart)** only bind in `mode === "ai"` so they don't fight the hotseat buy keys.
- **`BattleScene.showGameOver`** is gated by `gameOverShown` (idempotent) and transitions to `GameOverScene` after a 1.3 s `delayedCall` — gives a beat for the player to read who won before the scene swaps.
- **Controlled-unit boost extended to combat units**: `Unit.isControlled` + `Unit.controlMultiplier` (1.5×) feed into `Unit.effectiveSpeed` and `Unit.attack` damage. Miners still use their own multipliers in [miners.config.js](src/units/miners.config.js). Both still gate on `player.controlled === this`.
- **Statue HP bumped to 1200** in [balance.js](src/config/balance.js) for slightly longer matches. Other unit/building/power numbers unchanged.
- **HUD subtitle** shows `"vs AI: <Difficulty>"` or `"Hotseat — 2 Players"` depending on mode.

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
- **The AI uses the same actions as the human UI** (`handleBuy`, `tryPlaceBuilding`, `spawnCombatUnit`, `castPower`). When you add a new buyable / castable thing, expose it through one of those methods and the AI inherits it. Don't backdoor state changes — the AI deducts ink itself after success, matching the `UnitBar.tryBuy` pattern.
- **Difficulty restart** uses `scene.registry` (not class fields) because the scene is recreated. Anything that should survive a difficulty restart goes in the registry; everything else resets cleanly.
- **Phaser key event names** for digits are `keydown-ONE`/`TWO`/`THREE` etc., not `keydown-1`. Trips people up.
- **Mode-gated keybindings**: digit keys mean two different things in `ai` vs `hotseat` mode (restart difficulty vs P2 buys). Always gate keyboard handlers on `this.mode` in BattleScene before binding to avoid conflicts.
- **Scene transition cleanup**: when BattleScene transitions to GameOverScene, Phaser unbinds the scene's keyboard listeners automatically. Don't manually unbind — the `bindInput()` re-runs on `scene.restart()`.
- **Registry persists across scene starts** but not across page reloads. Use it for inter-scene config (mode, difficulty). For anything player-tunable that should survive a refresh, you'd need `localStorage` — not implemented yet.

## Deployment

GitHub Pages serves static files at the repo root. When ready:
- Add `.nojekyll` at repo root so Pages doesn't try to process `_`-prefixed paths.
- Enable Pages in repo settings (Source: main / root).
- No build step to run.
