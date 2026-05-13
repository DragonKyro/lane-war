# Lane War — Ink & Origami

A 1v1 lane-battle game inspired by **Stick War**, **Age of War**, and **Battle Cats**. Two paper kingdoms — **Black Ink** and **Vermillion** — fold warriors from parchment and mine ink to crush each other's calligraphy seal.

Built with vanilla ES6 + Phaser 3 (via CDN). No build step, no dependencies. Deploys as static files to GitHub Pages.

## Running locally

ES6 modules can't load from `file://` — you need a tiny local server. Pick one:

```bash
# Python 3 (already on most systems)
python -m http.server 8000

# Node
npx http-server -p 8000
```

Then open <http://localhost:8000>. VS Code's "Live Server" extension also works (right-click `index.html` → *Open with Live Server*).

## Current state — Phase 1: "Hello, Battlefield"

- Three lanes, two statues facing off across a parchment battlefield.
- Click anywhere on the **left half** of the play area to spawn a Black Ink swordsman in the closest lane.
- Click the **right half** to spawn one for Vermillion (placeholder for the future AI).
- Units walk forward and attack the enemy statue when in range.
- First statue to 0 HP loses.

## Roadmap

The game ships in seven phases. Each phase is playtestable on its own before moving on.

### Phase 1 — Hello, Battlefield ✅
Phaser bootstrap, three lanes, two statues, click-to-spawn a single placeholder unit that walks to the enemy statue and damages it. Win condition fires when a statue reaches 0 HP. Establishes the OOP foundation (`Entity` / `Unit` / `Statue` / `World` / `Lane` / `Player`).

### Phase 2 — Economy & Control
- **Ink** as the core resource for both players, displayed in the HUD.
- **InkWell** building at each base; **Miner** units cycle (walk to well → mine → walk back → deposit → repeat).
- **Controlled-unit mechanic**: click a miner (or, later, any unit) to "control" it — boosts its mine rate / move speed / damage while controlled. Only one entity controlled per player at a time. Stick War's signature feel.
- **UnitBar UI** at the bottom: buttons for each unit type with ink cost; click to queue a spawn.
- **LaneSelector**: pick which lane the next spawned unit enters.

### Phase 3 — Stances & Combat
- **Unit-vs-unit combat**: target acquisition picks the nearest enemy on the same lane before falling back to the statue. Existing `Unit.update` is the hook.
- **More unit types**: at least three — Brush Swordsman (cheap melee), Quill Archer (ranged), Paper Giant (expensive tank). Stats live in `units.config.js`.
- **StanceController** with four states per lane, per player:
  - `ATTACK` — push forward, engage anything in range
  - `DEFEND` — fall back to a line in front of the statue, engage if approached
  - `RETREAT` — return to the statue and stop
  - `RUSH` — ignore enemies and beeline for the opposing statue (the tower-rush option)
- **StancePanel UI**: per-lane buttons plus global "All-X" shortcuts (Stick War style hotkeys).

### Phase 4 — Defenses & Powers
- **SealStamp walls**: blocking buildings placed in a fixed slot in front of each lane on your side; slow enemy advance.
- **InkTurret**: ranged static defender that auto-attacks enemies in range. Replaces Stick War's retreat-only archers — defense is now persistent infrastructure.
- **Three powers** with cooldown + ink cost, cast from the HUD:
  - *Ink Storm* — AoE damage in a chosen area
  - *Folded Tiger* — summon a temporary strong unit on a chosen lane
  - *Wet Page* — slow field that decays over a few seconds
- Build slots are limited, so defense choices are a real tradeoff.

### Phase 5 — AI Opponent
- **EnemyAI state machine** in `src/ai/EnemyAI.js`. Phases: `ECONOMY` (build miners) → `ARMY` (build units) → `PUSH` (commit + cast powers + change stance). Reacts to enemy army size, ink income, and statue-HP delta.
- **Difficulty tiers** (Easy / Normal / Hard) via `aiPersonalities.js` — tune reaction speed, decision noise, and starting-ink handicap.
- Right-side click-to-spawn is removed; the right player becomes the AI.

### Phase 6 — Menu, Hotseat, Polish
- **MenuScene**: New Game / vs AI (difficulty) / Hotseat / Settings.
- **Hotseat mode**: two humans share input — one mouse, one keyboard hotkeys.
- **GameOverScene** with rematch / return-to-menu.
- **Balance pass** — central tuning in `src/config/balance.js`. Audio if time allows.

### Phase 7 — Deploy to GitHub Pages
- Add `.nojekyll` at repo root, enable Pages in repo settings, verify the live URL works.
- Tag a `v1.0` release.

### Phase 8 (maybe) — Online Multiplayer
Out of scope for v1; deferred until single-player feels good. Likely WebRTC P2P with room codes via PeerJS, or Firebase Realtime DB. Requires revisiting the simulation for determinism (lockstep) or making the host authoritative.

## Inspirations and twists

- From **Stick War**: miners, ink economy, the "control one unit for a boost" mechanic, Attack/Defend/Retreat global commands, and spell powers.
- From **Age of War**: static defense buildings instead of Stick War's retreat-only archers.
- From **Battle Cats**: multiple lanes with separate combat resolution.
- *New*: a per-lane **Rush** stance — units ignore enemies and beeline for the opposing statue, enabling intentional tower rushes.

## Project layout

```
index.html, style.css, src/main.js
src/scenes/      Phaser scenes (Boot, Battle, GameOver)
src/core/        Pure logic: World, Lane, Player
src/entities/    Entity base class, Unit, Statue (Miner, Building — future)
src/units/       Concrete unit data + classes
src/config/      Constants, balance numbers
```

Future folders (per the design plan): `src/buildings/`, `src/commands/`, `src/powers/`, `src/economy/`, `src/ai/`, `src/ui/`.

## Tech

- **Phaser 3.80.1** (CDN) for rendering and the game loop.
- **Vanilla ES6 modules** for our code. No bundler, no npm install.
- **OOP-first** — classes for units, buildings, powers, statues; data tables (`*.config.js`) for stats and costs.

## License

MIT (TBD).
