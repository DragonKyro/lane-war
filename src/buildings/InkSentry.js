import { Building } from "../entities/Building.js";
import { PALETTE, SIDE } from "../config/constants.js";

export class InkSentry extends Building {
  constructor({ scene, owner, lane, x, y, config }) {
    super({ scene, owner, x, y, hp: config.hp });
    this.lane = lane;
    this.config = config;
    this.radius = config.radius;
    this.range = config.range;
    this.damage = config.damage;
    this.attackInterval = config.attackInterval;
    this.attackCooldown = 0;
    this.draw();
  }

  get outlineColor() {
    return this.owner.side === SIDE.LEFT ? PALETTE.ink : PALETTE.vermillion;
  }

  draw() {
    const g = this.scene.add.graphics();
    g.fillStyle(PALETTE.parchmentDark, 1);
    g.fillRect(this.x - this.radius, this.y - 22, this.radius * 2, 44);
    g.lineStyle(2, this.outlineColor, 1);
    g.strokeRect(this.x - this.radius, this.y - 22, this.radius * 2, 44);

    g.fillStyle(PALETTE.ink, 1);
    g.beginPath();
    g.moveTo(this.x - 7, this.y - 22);
    g.lineTo(this.x + 7, this.y - 22);
    g.lineTo(this.x, this.y - 34);
    g.closePath();
    g.fillPath();

    g.fillStyle(PALETTE.gold, 1);
    g.fillCircle(this.x, this.y, 4);
    this.gfx = g;

    this.hpText = this.scene.add
      .text(this.x, this.y - 44, `${this.hp}`, {
        fontFamily: "Georgia, serif",
        fontSize: "11px",
        color: "#ece6d6",
        stroke: "#1a1410",
        strokeThickness: 2,
      })
      .setOrigin(0.5);
  }

  findEnemy(world) {
    const lane = world.lanes[this.lane];
    let best = null;
    let bestDist = Infinity;
    for (const u of lane.units) {
      if (u.owner === this.owner || u.dead) continue;
      const dx = u.x - this.x;
      const dy = u.y - this.y;
      const d = Math.hypot(dx, dy);
      if (d <= this.range + u.radius && d < bestDist) {
        best = u;
        bestDist = d;
      }
    }
    return best;
  }

  update(dt, world) {
    if (this.dead) return;
    if (this.hpText) this.hpText.setText(`${this.hp}`);
    this.attackCooldown -= dt;
    const enemy = this.findEnemy(world);
    if (enemy && this.attackCooldown <= 0) {
      enemy.takeDamage(this.damage);
      this.attackCooldown = this.attackInterval;
      this.showAttackFx(enemy);
    }
  }

  showAttackFx(target) {
    const g = this.scene.add.graphics();
    g.lineStyle(2, this.outlineColor, 0.75);
    g.lineBetween(this.x, this.y - 24, target.x, target.y);
    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      duration: 200,
      onComplete: () => g.destroy(),
    });
  }

  destroy() {
    super.destroy();
    if (this.hpText) {
      this.hpText.destroy();
      this.hpText = null;
    }
  }
}
