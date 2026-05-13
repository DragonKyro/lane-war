import { Building } from "../entities/Building.js";
import { PALETTE } from "../config/constants.js";
import { BUILDING_TYPES } from "./buildings.config.js";

export class InkWell extends Building {
  constructor({ scene, owner, x, y }) {
    super({ scene, owner, x, y, hp: Infinity });
    this.radius = BUILDING_TYPES.inkWell.radius;
    this.draw();
  }

  draw() {
    const g = this.scene.add.graphics();
    g.fillStyle(PALETTE.parchmentDark, 1);
    g.fillCircle(this.x, this.y + 4, this.radius + 6);
    g.fillStyle(PALETTE.ink, 1);
    g.fillCircle(this.x, this.y, this.radius);
    g.lineStyle(3, PALETTE.gold, 1);
    g.strokeCircle(this.x, this.y, this.radius);
    g.fillStyle(PALETTE.gold, 0.6);
    g.fillCircle(this.x - 4, this.y - 4, 4);
    this.gfx = g;
  }

  takeDamage() {}
}
