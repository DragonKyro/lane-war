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

## Current state — Phase 6: Menu, Hotseat, Polish

The game now opens to a **main menu** with four options:

- **vs AI — Easy / Normal / Hard** — single-player against the EnemyAI from Phase 5.
- **Hotseat — Two Players** — share a keyboard. Player 1 plays Black Ink with mouse + the normal UI. Player 2 plays Vermillion entirely from the keyboard.

When a match ends, a **game-over screen** announces the winner and offers **Rematch** (same mode/difficulty) or **Main Menu**.

### Controls

| Action | Player 1 (mouse) | Player 2 (hotseat keyboard) |
| --- | --- | --- |
| Pick active lane | LaneSelector buttons | `Q` / `W` / `E` |
| Set all-lanes stance | StancePanel "All lanes" row | `A` Attack / `S` Defend / `D` Retreat / `F` Rush |
| Buy Scribe / Swordsman / Archer / Sentinel / Mortar / Dragon | UnitBar buttons | `1` / `2` / `3` / `4` / `5` / `6` |
| Build Bastion / Sentry | UnitBar (right end) | `7` / `8` |
| Cast Storm / Tiger / Wet Page | PowerBar (click → click field for targeted) | `9` / `0` / `-` (auto-targets densest enemy cluster) |
| Control a unit (boost) | Click your unit | — (not yet available to P2) |

In vs-AI mode, **1 / 2 / 3 restart the current match** on Easy / Normal / Hard.

### Polish in this phase
- **Controlled-unit boost** now applies to combat units too — 1.5× damage and speed while you have one selected (it always worked on scribes; this extends Stick War's signature feel to your army).
- Statue HP raised to 1200 so matches breathe a little more.

## The roster

| Unit | Role | Cost | HP | DMG | Range | Speed |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| **Brush Swordsman** | Melee | 25 | 80 | 12 | 28 | 70 |
| **Quill Archer** | Range | 35 | 45 | 9 | 180 | 60 |
| **Folded Sentinel** | Tank | 60 | 260 | 14 | 32 | 38 |
| **Ink Mortar** | Splash (55) | 80 | 55 | 18 | 210 | 38 |
| **Paper Dragon** | Juggernaut | 200 | 650 | 38 | 42 | 44 |

(Numbers are first-pass — expect to tune them during Phase 6 balance.)

Things deliberately deferred: defense buildings + powers (Phase 4), AI opponent (Phase 5), menu / hotseat / polish (Phase 6).

## Roadmap

The game ships in seven phases. Each phase is playtestable on its own before moving on.

### Phase 1 — Hello, Battlefield ✅
Phaser bootstrap, three lanes, two statues, click-to-spawn a single placeholder unit that walks to the enemy statue and damages it. Win condition fires when a statue reaches 0 HP. Establishes the OOP foundation (`Entity` / `Unit` / `Statue` / `World` / `Lane` / `Player`).

### Phase 2 — Economy & Control ✅
- **Ink** as the core resource for both players, displayed in the HUD.
- **InkWell** building at each base; **Miner** units cycle (walk to well → mine → walk back → deposit → repeat).
- **Controlled-unit mechanic**: click a miner (or, later, any unit) to "control" it — boosts its mine rate / move speed / damage while controlled. Only one entity controlled per player at a time. Stick War's signature feel.
- **UnitBar UI** at the bottom: buttons for each unit type with ink cost; click to queue a spawn.
- **LaneSelector**: pick which lane the next spawned unit enters.

### Phase 3 — Stances & Combat ✅
- **Unit-vs-unit combat**: target acquisition picks the nearest enemy on the same lane before falling back to the statue.
- **Five unit types**: Brush Swordsman (melee), Quill Archer (range), Folded Sentinel (tank), Ink Mortar (splash), Paper Dragon (juggernaut).
- **StanceController** with four states per lane, per player:
  - `ATTACK` — push forward, engage anything in range
  - `DEFEND` — fall back to a line in front of the statue, engage if approached
  - `RETREAT` — return to the statue and stop
  - `RUSH` — ignore enemies and beeline for the opposing statue (the tower-rush option)
- **StancePanel UI**: per-lane row plus an All-lanes row for the Stick-War-style commands.

### Phase 4 — Defenses & Powers ✅
- **Paper Bastion** (wall) and **Ink Sentry** (turret) — built per lane via the rightmost two buttons in the unit bar. One slot per lane, so wall *or* sentry, not both.
- **Three powers** cast from the bottom-right of the bar with ink cost + cooldown:
  - *Ink Storm* — targeted AoE damage
  - *Folded Tiger* — instant summon of a fast, hard-hitting Tiger into the active lane
  - *Wet Page* — targeted slow field
- Targeted powers show an AoE preview that tracks your mouse; press **ESC** to cancel.

### Phase 5 — AI Opponent ✅
- **EnemyAI** in [src/ai/EnemyAI.js](src/ai/EnemyAI.js). Each tick (interval set by difficulty) the AI: adjusts stance from seal-HP differentials, then in priority order tries defense → power → miner → combat unit.
- **Difficulty tiers** in [src/ai/aiPersonalities.js](src/ai/aiPersonalities.js) — Easy / Normal / Hard tune reaction speed, unit-roll weights, power & defense probabilities, and starting-ink handicap (Hard gets +60 ink).
- Right-side click-to-spawn is removed; the right player is the AI. Press 1 / 2 / 3 to restart on Easy / Normal / Hard.

### Phase 6 — Menu, Hotseat, Polish ✅
- **MenuScene** at boot — vs AI (Easy / Normal / Hard) or Hotseat.
- **Hotseat mode**: P1 mouse + UI, P2 keyboard hotkeys. Targeted powers auto-find the densest enemy cluster for P2.
- **GameOverScene** with Rematch / Main Menu.
- **Controlled-unit boost** extended to combat units (1.5× damage and speed). Statue HP bumped to 1200.

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
src/scenes/      Boot, Menu, Battle, GameOver
src/core/        Pure logic: World, Lane, Player
src/entities/    Entity base, Building base, Unit, Statue, Miner
src/units/       Unit + miner data tables
src/buildings/   InkWell, PaperBastion, InkSentry + config
src/commands/    StanceController + STANCE enum
src/powers/      Power base + InkStorm, FoldedTiger, WetPage + config
src/ai/          EnemyAI + aiPersonalities (Easy / Normal / Hard)
src/input/       HotseatInput (P2 keyboard adapter)
src/ui/          HUD, UnitBar, LaneSelector, StancePanel, PowerBar
src/config/      Constants, balance numbers
```

## Tech

- **Phaser 3.80.1** (CDN) for rendering and the game loop.
- **Vanilla ES6 modules** for our code. No bundler, no npm install.
- **OOP-first** — classes for units, buildings, powers, statues; data tables (`*.config.js`) for stats and costs.

## License

MIT (TBD).
