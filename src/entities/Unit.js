import { Entity } from "./Entity.js";
import { SIDE } from "../config/constants.js";

export class Unit extends Entity {
  constructor({ scene, owner, lane, x, y, type }) {
    super({ scene, owner, x, y, hp: type.hp });
    this.lane = lane;
    this.type = type;
    this.speed = type.speed;
    this.damage = type.damage;
    this.attackInterval = type.attackInterval;
    this.range = type.range;
    this.radius = type.radius;
    this.attackCooldown = 0;
    this.target = null;
    this.draw();
  }

  get facing() {
    return this.owner.side === SIDE.LEFT ? 1 : -1;
  }

  draw() {
    const g = this.scene.add.graphics();
    g.fillStyle(this.type.color, 1);
    g.fillCircle(0, 0, this.radius);
    g.lineStyle(2, this.type.outline, 1);
    g.strokeCircle(0, 0, this.radius);
    const dotX = this.facing * (this.radius * 0.4);
    g.fillStyle(this.type.outline, 1);
    g.fillCircle(dotX, -2, 2);
    g.x = this.x;
    g.y = this.y;
    this.gfx = g;
  }

  acquireTarget(world) {
    const enemyStatue = world.opponentOf(this.owner).statue;
    this.target = enemyStatue;
  }

  inRangeOf(target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const reach = this.range + (target.radius || 0) + this.radius;
    return dx * dx + dy * dy <= reach * reach;
  }

  update(dt, world) {
    if (this.dead) return;

    if (!this.target || this.target.dead) {
      this.acquireTarget(world);
    }

    if (this.target) {
      if (this.inRangeOf(this.target)) {
        this.attackCooldown -= dt;
        if (this.attackCooldown <= 0) {
          this.target.takeDamage(this.damage);
          this.attackCooldown = this.attackInterval;
        }
      } else {
        const dir = Math.sign(this.target.x - this.x) || this.facing;
        this.x += dir * this.speed * (dt / 1000);
      }
    }

    if (this.gfx) {
      this.gfx.x = this.x;
      this.gfx.y = this.y;
    }
  }
}
