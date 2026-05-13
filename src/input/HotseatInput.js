import { UNIT_TYPES } from "../units/units.config.js";
import { MINER_TYPE } from "../units/miners.config.js";
import { BUILDING_TYPES } from "../buildings/buildings.config.js";
import { STANCE } from "../commands/StanceController.js";

const BUY_KEYS = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT"];
const POWER_KEYS = ["NINE", "ZERO", "MINUS"];

export class HotseatInput {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.bindKeys();
  }

  get items() {
    return [
      { ...MINER_TYPE, kind: "miner" },
      { ...UNIT_TYPES.brushSwordsman, kind: "unit" },
      { ...UNIT_TYPES.quillArcher, kind: "unit" },
      { ...UNIT_TYPES.foldedSentinel, kind: "unit" },
      { ...UNIT_TYPES.inkMortar, kind: "unit" },
      { ...UNIT_TYPES.paperDragon, kind: "unit" },
      { ...BUILDING_TYPES.paperBastion, kind: "building" },
      { ...BUILDING_TYPES.inkSentry, kind: "building" },
    ];
  }

  bindKeys() {
    const kb = this.scene.input.keyboard;

    kb.on("keydown-Q", () => this.setLane(0));
    kb.on("keydown-W", () => this.setLane(1));
    kb.on("keydown-E", () => this.setLane(2));

    kb.on("keydown-A", () => this.setAllStance(STANCE.ATTACK));
    kb.on("keydown-S", () => this.setAllStance(STANCE.DEFEND));
    kb.on("keydown-D", () => this.setAllStance(STANCE.RETREAT));
    kb.on("keydown-F", () => this.setAllStance(STANCE.RUSH));

    BUY_KEYS.forEach((key, i) => {
      kb.on(`keydown-${key}`, () => {
        const item = this.items[i];
        if (item) this.buy(item);
      });
    });

    POWER_KEYS.forEach((key, i) => {
      kb.on(`keydown-${key}`, () => this.castPowerByIndex(i));
    });
  }

  setLane(idx) {
    if (this.scene.world.gameOver) return;
    this.player.activeLane = idx;
  }

  setAllStance(stance) {
    if (this.scene.world.gameOver) return;
    this.player.stanceController.setAll(stance);
  }

  buy(item) {
    if (this.scene.world.gameOver) return;
    if (this.player.ink < item.cost) return;
    if (item.kind === "building" && !this.player.hasBuildingSlot(this.player.activeLane)) {
      return;
    }
    const ok = this.scene.handleBuy(this.player, item);
    if (ok) this.player.ink -= item.cost;
  }

  castPowerByIndex(idx) {
    if (this.scene.world.gameOver) return;
    const power = this.player.powers[idx];
    if (!power || !power.canCast(this.player)) return;
    if (power.needsTarget) {
      const target = this.findCluster(power);
      if (!target) return;
      this.scene.castPower(power, this.player, target.x, target.y);
    } else {
      this.scene.castPower(power, this.player, 0, 0);
    }
  }

  findCluster(power) {
    const radius = power.config.radius;
    if (!radius) return null;
    const r2 = radius * radius;
    const enemyPlayer = this.scene.world.opponentOf(this.player);
    const enemies = enemyPlayer.units.filter((u) => !u.dead);
    if (enemies.length === 0) return null;

    let bestCount = 1;
    let best = null;
    for (const u of enemies) {
      let count = 0;
      for (const v of enemies) {
        const dx = v.x - u.x;
        const dy = v.y - u.y;
        if (dx * dx + dy * dy <= r2) count++;
      }
      if (count > bestCount) {
        bestCount = count;
        best = { x: u.x, y: u.y };
      }
    }
    return best;
  }
}
