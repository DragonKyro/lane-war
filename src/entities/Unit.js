import { Entity } from "./Entity.js";
import { PALETTE, SIDE, STATUE_X } from "../config/constants.js";
import { BALANCE } from "../config/balance.js";
import { STANCE } from "../commands/StanceController.js";

export class Unit extends Entity {
  constructor({ scene, owner, lane, x, y, type }) {
    super({ scene, owner, x, y, hp: type.hp });
    this.lane = lane;
    this.type = type;
    this.speed = type.speed;
    this.damage = type.damage;
    this.attackInterval = type.attackInterval;
    this.range = type.range;
    this.splashRadius = type.splashRadius || 0;
    this.radius = type.radius;
    this.attackCooldown = 0;
    this.slowEnd = 0;
    this.slowMul = 1;
    this.draw();
  }

  get isControlled() {
    return this.owner.controlled === this;
  }

  get controlMultiplier() {
    return this.isControlled ? 1.5 : 1;
  }

  get effectiveSpeed() {
    const slow = this.scene.time.now < this.slowEnd ? this.slowMul : 1;
    return this.speed * slow * this.controlMultiplier;
  }

  get facing() {
    return this.owner.side === SIDE.LEFT ? 1 : -1;
  }

  get outlineColor() {
    return this.owner.side === SIDE.LEFT ? PALETTE.ink : PALETTE.vermillion;
  }

  get defenseLineX() {
    return this.owner.side === SIDE.LEFT
      ? STATUE_X.left + BALANCE.defenseLineOffset
      : STATUE_X.right - BALANCE.defenseLineOffset;
  }

  draw() {
    const g = this.scene.add.graphics();
    g.fillStyle(this.type.color, 1);
    g.fillCircle(0, 0, this.radius);
    g.lineStyle(2, this.outlineColor, 1);
    g.strokeCircle(0, 0, this.radius);

    const dotX = this.facing * this.radius * 0.45;
    g.fillStyle(this.outlineColor, 1);
    g.fillCircle(dotX, -2, 2);

    if (this.type.role === "splash") {
      g.fillStyle(PALETTE.gold, 1);
      g.fillCircle(0, 0, 3);
    } else if (this.type.role === "juggernaut") {
      g.lineStyle(2, this.outlineColor, 1);
      g.strokeCircle(0, 0, this.radius - 5);
    } else if (this.type.role === "tank") {
      g.lineStyle(2, this.outlineColor, 1);
      g.lineBetween(-this.radius + 4, 0, this.radius - 4, 0);
    } else if (this.type.role === "range") {
      g.lineStyle(2, this.outlineColor, 1);
      g.lineBetween(0, -this.radius + 4, 0, this.radius - 4);
    }

    g.x = this.x;
    g.y = this.y;
    this.gfx = g;
  }

  inAttackRangeOf(target) {
    if (!target) return false;
    const reach = this.range + (target.radius || 0) + this.radius;
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    return dx * dx + dy * dy <= reach * reach;
  }

  findEnemy(world) {
    const lane = world.lanes[this.lane];
    let best = null;
    let bestDist = Infinity;
    const candidates = lane.units.concat(lane.buildings);
    for (const u of candidates) {
      if (u.owner === this.owner || u.dead) continue;
      const forward = (u.x - this.x) * this.facing;
      if (forward < -this.radius * 2) continue;
      const d = Math.abs(u.x - this.x);
      if (d < bestDist) {
        best = u;
        bestDist = d;
      }
    }
    return best;
  }

  update(dt, world) {
    if (this.dead) return;
    this.attackCooldown -= dt;

    const stance = this.owner.stanceController.get(this.lane);
    const ds = this.effectiveSpeed * (dt / 1000);
    const enemyStatue = world.opponentOf(this.owner).statue;

    if (stance === STANCE.RETREAT) {
      const dx = this.owner.statue.x - this.x;
      if (Math.abs(dx) > ds) this.x += Math.sign(dx) * ds;
      this.updateGfx();
      return;
    }

    if (stance === STANCE.RUSH) {
      if (this.inAttackRangeOf(enemyStatue)) {
        this.attack(enemyStatue, world);
      } else {
        this.x += this.facing * ds;
      }
      this.updateGfx();
      return;
    }

    const enemy = this.findEnemy(world);
    const inRangeEnemy = enemy && this.inAttackRangeOf(enemy);
    const inRangeStatue = !enemy && this.inAttackRangeOf(enemyStatue);

    if (inRangeEnemy) {
      this.attack(enemy, world);
    } else if (inRangeStatue) {
      this.attack(enemyStatue, world);
    } else if (stance === STANCE.DEFEND) {
      const dx = this.defenseLineX - this.x;
      if (Math.abs(dx) > ds) this.x += Math.sign(dx) * ds;
    } else {
      const goalX = enemy ? enemy.x : enemyStatue.x;
      this.x += Math.sign(goalX - this.x) * ds;
    }

    this.updateGfx();
  }

  attack(target, world) {
    if (this.attackCooldown > 0) return;
    this.attackCooldown = this.attackInterval;

    const dmg = this.damage * this.controlMultiplier;
    if (this.splashRadius) {
      const tx = target.x;
      const ty = target.y;
      const lane = world.lanes[this.lane];
      const r2 = this.splashRadius * this.splashRadius;
      for (const u of lane.units.concat(lane.buildings)) {
        if (u.owner === this.owner || u.dead) continue;
        const dx = u.x - tx;
        const dy = u.y - ty;
        if (dx * dx + dy * dy <= r2) {
          u.takeDamage(dmg);
        }
      }
      const es = world.opponentOf(this.owner).statue;
      const sdx = es.x - tx;
      const sdy = es.y - ty;
      if (sdx * sdx + sdy * sdy <= r2) {
        es.takeDamage(dmg);
      }
    } else {
      target.takeDamage(dmg);
    }

    this.showAttackFx(target);
  }

  showAttackFx(target) {
    if (this.range > 60) {
      const g = this.scene.add.graphics();
      g.lineStyle(2, this.outlineColor, 0.7);
      g.lineBetween(this.x, this.y, target.x, target.y);
      this.scene.tweens.add({
        targets: g,
        alpha: 0,
        duration: 200,
        onComplete: () => g.destroy(),
      });
    } else {
      const flash = this.scene.add.circle(target.x, target.y - 4, 6, PALETTE.gold, 0.85);
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 1.8,
        duration: 180,
        onComplete: () => flash.destroy(),
      });
    }

    if (this.splashRadius) {
      const ring = this.scene.add.circle(target.x, target.y, this.splashRadius, this.outlineColor, 0.2);
      this.scene.tweens.add({
        targets: ring,
        alpha: 0,
        scale: 1.25,
        duration: 360,
        onComplete: () => ring.destroy(),
      });
    }
  }

  updateGfx() {
    if (!this.gfx) return;
    this.gfx.x = this.x;
    this.gfx.y = this.y;
  }
}
