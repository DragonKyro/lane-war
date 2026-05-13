import { Entity } from "./Entity.js";
import { PALETTE, SIDE } from "../config/constants.js";

export const MINER_STATE = Object.freeze({
  GOING_TO_WELL: "GOING_TO_WELL",
  MINING: "MINING",
  RETURNING: "RETURNING",
});

export class Miner extends Entity {
  constructor({ scene, owner, x, y, config }) {
    super({ scene, owner, x, y, hp: config.hp });
    this.config = config;
    this.radius = config.radius;
    this.state = MINER_STATE.GOING_TO_WELL;
    this.mineTimer = 0;
    this.carrying = 0;
    this.draw();
  }

  get isControlled() {
    return this.owner.controlled === this;
  }

  get effectiveSpeed() {
    return this.config.speed * (this.isControlled ? this.config.controlSpeedMul : 1);
  }

  get effectiveMineTime() {
    return this.config.mineTime * (this.isControlled ? this.config.controlMineTimeMul : 1);
  }

  get effectiveYield() {
    return this.config.yieldPerCycle * (this.isControlled ? this.config.controlYieldMul : 1);
  }

  get wellX() {
    return this.owner.inkWell.x;
  }

  get depositX() {
    return this.owner.side === SIDE.LEFT
      ? this.owner.statue.x - 18
      : this.owner.statue.x + 18;
  }

  update(dt, _world) {
    if (this.dead) return;
    const ds = this.effectiveSpeed * (dt / 1000);

    if (this.state === MINER_STATE.GOING_TO_WELL) {
      const dx = this.wellX - this.x;
      if (Math.abs(dx) <= ds) {
        this.x = this.wellX;
        this.state = MINER_STATE.MINING;
        this.mineTimer = this.effectiveMineTime;
      } else {
        this.x += Math.sign(dx) * ds;
      }
    } else if (this.state === MINER_STATE.MINING) {
      this.mineTimer -= dt;
      if (this.mineTimer <= 0) {
        this.carrying = this.effectiveYield;
        this.state = MINER_STATE.RETURNING;
      }
    } else if (this.state === MINER_STATE.RETURNING) {
      const dx = this.depositX - this.x;
      if (Math.abs(dx) <= ds) {
        this.x = this.depositX;
        this.owner.ink += this.carrying;
        this.carrying = 0;
        this.state = MINER_STATE.GOING_TO_WELL;
      } else {
        this.x += Math.sign(dx) * ds;
      }
    }

    this.updateGfx();
  }

  updateGfx() {
    if (!this.gfx) return;
    this.gfx.x = this.x;
    this.gfx.y = this.y;
    if (this.carryDot) {
      this.carryDot.setVisible(this.state === MINER_STATE.RETURNING);
      this.carryDot.x = this.x;
      this.carryDot.y = this.y - this.radius - 6;
    }
  }

  draw() {
    const g = this.scene.add.graphics();
    g.fillStyle(this.config.color, 1);
    g.fillCircle(0, 0, this.radius);
    g.lineStyle(2, this.config.outline, 1);
    g.strokeCircle(0, 0, this.radius);
    g.lineBetween(this.radius - 2, -this.radius + 2, this.radius + 5, -this.radius - 3);
    g.x = this.x;
    g.y = this.y;
    this.gfx = g;

    this.carryDot = this.scene.add.circle(this.x, this.y - this.radius - 6, 3, PALETTE.ink);
    this.carryDot.setVisible(false);
  }

  destroy() {
    super.destroy();
    if (this.carryDot) {
      this.carryDot.destroy();
      this.carryDot = null;
    }
  }
}
