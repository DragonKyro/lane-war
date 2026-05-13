import { Entity } from "./Entity.js";
import { PALETTE, SIDE } from "../config/constants.js";

export class Statue extends Entity {
  constructor({ scene, owner, x, y, hp }) {
    super({ scene, owner, x, y, hp });
    this.radius = 48;
    this.draw();
  }

  draw() {
    const isLeft = this.owner.side === SIDE.LEFT;
    const baseColor = isLeft ? PALETTE.ink : PALETTE.vermillion;
    const accent = isLeft ? PALETTE.parchment : PALETTE.gold;

    const g = this.scene.add.graphics();
    g.fillStyle(PALETTE.parchmentDark, 1);
    g.fillRect(this.x - 36, this.y - 70, 72, 140);
    g.lineStyle(3, PALETTE.ink, 1);
    g.strokeRect(this.x - 36, this.y - 70, 72, 140);

    g.fillStyle(baseColor, 1);
    g.fillRect(this.x - 28, this.y - 60, 56, 120);

    g.lineStyle(2, accent, 1);
    g.beginPath();
    g.moveTo(this.x - 14, this.y - 30);
    g.lineTo(this.x + 14, this.y - 30);
    g.moveTo(this.x, this.y - 30);
    g.lineTo(this.x, this.y + 30);
    g.moveTo(this.x - 10, this.y + 20);
    g.lineTo(this.x + 10, this.y + 20);
    g.strokePath();

    this.gfx = g;

    this.hpText = this.scene.add.text(this.x, this.y - 90, `${this.hp}`, {
      fontFamily: "Georgia, serif",
      fontSize: "18px",
      color: "#ece6d6",
      stroke: "#1a1410",
      strokeThickness: 3,
    }).setOrigin(0.5);
  }

  update(_dt) {
    if (this.hpText) {
      this.hpText.setText(`${this.hp}`);
    }
  }

  destroy() {
    super.destroy();
    if (this.hpText) {
      this.hpText.destroy();
      this.hpText = null;
    }
  }
}
