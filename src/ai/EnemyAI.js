import { UNIT_TYPES } from "../units/units.config.js";
import { MINER_TYPE } from "../units/miners.config.js";
import { BUILDING_TYPES } from "../buildings/buildings.config.js";
import { STANCE } from "../commands/StanceController.js";
import { LANE_COUNT, SIDE, WORLD_W } from "../config/constants.js";

export class EnemyAI {
  constructor(scene, world, player, personality) {
    this.scene = scene;
    this.world = world;
    this.player = player;
    this.diff = personality;
    this.nextDecisionTime = 0;
  }

  update() {
    if (this.world.gameOver) return;
    const now = this.scene.time.now;
    if (now < this.nextDecisionTime) return;
    this.nextDecisionTime = now + this.diff.decisionInterval;

    this.adjustStance();

    if (this.maybeBuildDefense()) return;
    if (this.maybeCastPower()) return;
    if (this.maybeBuyMiner()) return;
    this.maybeBuyUnit();
  }

  get enemy() {
    return this.world.opponentOf(this.player);
  }

  adjustStance() {
    const myFrac = this.player.statue.hp / this.player.statue.maxHp;
    const enemyFrac = this.enemy.statue.hp / this.enemy.statue.maxHp;

    let stance;
    if (myFrac < this.diff.defendHpFrac && enemyFrac > 0.4) {
      stance = STANCE.DEFEND;
    } else if (enemyFrac < this.diff.pushHpFrac && myFrac > 0.5) {
      stance = STANCE.RUSH;
    } else {
      stance = STANCE.ATTACK;
    }

    this.player.stanceController.setAll(stance);
  }

  maybeBuildDefense() {
    if (Math.random() > this.diff.defenseProbability) return false;
    const lane = this.pickPressuredLane();
    if (lane === null) return false;
    if (this.player.buildingSlots[lane]) return false;

    const choice = Math.random() < 0.55 ? BUILDING_TYPES.inkSentry : BUILDING_TYPES.paperBastion;
    if (this.player.ink < choice.cost) return false;

    this.player.activeLane = lane;
    const ok = this.scene.tryPlaceBuilding(this.player, lane, choice);
    if (ok) {
      this.player.ink -= choice.cost;
      return true;
    }
    return false;
  }

  pickPressuredLane() {
    let best = null;
    let bestPressure = 0;
    for (let i = 0; i < LANE_COUNT; i++) {
      if (this.player.buildingSlots[i]) continue;
      const enemyUnits = this.world.lanes[i].units.filter(
        (u) => u.owner !== this.player && !u.dead
      );
      let pressure = enemyUnits.length;
      const myHalfX = this.player.side === SIDE.RIGHT ? WORLD_W / 2 : WORLD_W / 2;
      const penetrators = enemyUnits.filter((u) => {
        return this.player.side === SIDE.RIGHT ? u.x > myHalfX : u.x < myHalfX;
      });
      pressure += penetrators.length * 2;
      if (pressure > bestPressure) {
        bestPressure = pressure;
        best = i;
      }
    }
    if (best === null) {
      const free = [];
      for (let i = 0; i < LANE_COUNT; i++) {
        if (!this.player.buildingSlots[i]) free.push(i);
      }
      if (free.length === 0) return null;
      return free[Math.floor(Math.random() * free.length)];
    }
    return best;
  }

  maybeCastPower() {
    if (Math.random() > this.diff.powerProbability) return false;
    const ready = this.player.powers.filter((p) => p.canCast(this.player));
    if (ready.length === 0) return false;

    for (const power of ready) {
      if (!power.needsTarget) {
        this.scene.castPower(power, this.player, 0, 0);
        return true;
      }
      const target = this.findPowerTarget(power);
      if (target) {
        this.scene.castPower(power, this.player, target.x, target.y);
        return true;
      }
    }
    return false;
  }

  findPowerTarget(power) {
    const radius = power.config.radius;
    if (!radius) return null;
    const r2 = radius * radius;
    const enemies = this.enemy.units.filter((u) => !u.dead);
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

  maybeBuyMiner() {
    if (this.player.miners.length >= this.diff.targetMiners) return false;
    if (this.player.ink < MINER_TYPE.cost) return false;
    const ok = this.scene.handleBuy(this.player, { ...MINER_TYPE, kind: "miner" });
    if (ok) {
      this.player.ink -= MINER_TYPE.cost;
      return true;
    }
    return false;
  }

  maybeBuyUnit() {
    const choice = this.pickUnit();
    if (!choice) return false;

    const lane = this.pickAttackLane();
    this.player.activeLane = lane;
    this.scene.spawnCombatUnit(this.player, lane, choice);
    this.player.ink -= choice.cost;
    return true;
  }

  pickUnit() {
    const weights = this.diff.unitWeights;
    const affordable = [];
    let total = 0;
    for (const [key, weight] of Object.entries(weights)) {
      const type = UNIT_TYPES[key];
      if (!type) continue;
      if (this.player.ink < type.cost + this.diff.inkReserve) continue;
      affordable.push({ type, weight });
      total += weight;
    }
    if (affordable.length === 0) return null;
    let roll = Math.random() * total;
    for (const e of affordable) {
      roll -= e.weight;
      if (roll <= 0) return e.type;
    }
    return affordable[affordable.length - 1].type;
  }

  pickAttackLane() {
    let best = 0;
    let bestScore = Infinity;
    for (let i = 0; i < LANE_COUNT; i++) {
      const lane = this.world.lanes[i];
      const enemyDef = lane.units.filter((u) => u.owner !== this.player && !u.dead).length;
      const enemyBuilding = lane.buildings.filter(
        (b) => b.owner !== this.player && !b.dead
      ).length;
      const score = enemyDef + enemyBuilding * 3 + Math.random() * 1.5;
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    }
    return best;
  }
}
