import { Power } from "./Power.js";
import { PALETTE } from "../config/constants.js";

export class WetPage extends Power {
  cast(scene, player, world, x, y) {
    const radius = this.config.radius;
    const r2 = radius * radius;
    const duration = this.config.duration;
    const slowMul = this.config.slowMul;
    const slowEnd = scene.time.now + duration;
    const enemy = world.opponentOf(player);

    for (const lane of world.lanes) {
      for (const u of lane.units) {
        if (u.owner !== enemy || u.dead) continue;
        const dx = u.x - x;
        const dy = u.y - y;
        if (dx * dx + dy * dy <= r2) {
          if (slowEnd > u.slowEnd) {
            u.slowEnd = slowEnd;
            u.slowMul = slowMul;
          }
        }
      }
    }

    this.showFx(scene, x, y, radius, duration);
  }

  showFx(scene, x, y, radius, duration) {
    const g = scene.add.graphics();
    g.fillStyle(PALETTE.ink, 0.22);
    g.fillCircle(0, 0, radius);
    g.lineStyle(2, PALETTE.laneShade, 0.7);
    g.strokeCircle(0, 0, radius);
    g.setPosition(x, y);
    scene.tweens.add({
      targets: g,
      alpha: 0,
      duration: duration,
      onComplete: () => g.destroy(),
    });
  }
}
