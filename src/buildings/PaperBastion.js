import { Building } from "../entities/Building.js";
import { PALETTE, SIDE } from "../config/constants.js";

export class PaperBastion extends Building {
  constructor({ scene, owner, lane, x, y, config }) {
    super({ scene, owner, x, y, hp: config.hp });
    this.lane = lane;
    this.config = config;
    this.radius = config.radius;
    this.draw();
  }

  get outlineColor() {
    return this.owner.side === SIDE.LEFT ? PALETTE.ink : PALETTE.vermillion;
  }

  draw() {
    const g = this.scene.add.graphics();
    g.fillStyle(PALETTE.parchmentDark, 1);
    g.fillRect(this.x - this.radius, this.y - 26, this.radius * 2, 52);
    g.lineStyle(3, this.outlineColor, 1);
    g.strokeRect(this.x - this.radius, this.y - 26, this.radius * 2, 52);

    g.fillStyle(PALETTE.vermillion, 0.85);
    g.fillCircle(this.x, this.y, 9);
    g.lineStyle(1, PALETTE.parchment, 1);
    g.strokeCircle(this.x, this.y, 7);
    g.lineBetween(this.x - 3, this.y, this.x + 3, this.y);
    g.lineBetween(this.x, this.y - 3, this.x, this.y + 3);
    this.gfx = g;

    this.hpText = this.scene.add
      .text(this.x, this.y - 38, `${this.hp}`, {
        fontFamily: "Georgia, serif",
        fontSize: "12px",
        color: "#ece6d6",
        stroke: "#1a1410",
        strokeThickness: 2,
      })
      .setOrigin(0.5);
  }

  update(_dt, _world) {
    if (this.hpText) this.hpText.setText(`${this.hp}`);
  }

  destroy() {
    super.destroy();
    if (this.hpText) {
      this.hpText.destroy();
      this.hpText = null;
    }
  }
}
