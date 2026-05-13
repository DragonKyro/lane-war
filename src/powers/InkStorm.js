import { Power } from "./Power.js";
import { PALETTE } from "../config/constants.js";

export class InkStorm extends Power {
  cast(scene, player, world, x, y) {
    const radius = this.config.radius;
    const r2 = radius * radius;
    const damage = this.config.damage;
    const enemy = world.opponentOf(player);

    for (const lane of world.lanes) {
      for (const u of lane.units.concat(lane.buildings)) {
        if (u.owner !== enemy || u.dead) continue;
        const dx = u.x - x;
        const dy = u.y - y;
        if (dx * dx + dy * dy <= r2) {
          u.takeDamage(damage);
        }
      }
    }
    if (enemy.statue && !enemy.statue.dead) {
      const dx = enemy.statue.x - x;
      const dy = enemy.statue.y - y;
      if (dx * dx + dy * dy <= r2) {
        enemy.statue.takeDamage(damage);
      }
    }

    this.showFx(scene, x, y, radius);
  }

  showFx(scene, x, y, radius) {
    const g = scene.add.graphics();
    g.fillStyle(PALETTE.ink, 0.7);
    g.fillCircle(0, 0, radius);
    g.setPosition(x, y);
    scene.tweens.add({
      targets: g,
      alpha: 0,
      scale: 1.25,
      duration: 480,
      onComplete: () => g.destroy(),
    });
    for (let i = 0; i < 9; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * radius * 0.75;
      const sx = x + Math.cos(a) * d;
      const sy = y + Math.sin(a) * d;
      const splat = scene.add.circle(sx, sy, 6 + Math.random() * 10, PALETTE.ink, 0.75);
      scene.tweens.add({
        targets: splat,
        alpha: 0,
        scale: 1.4 + Math.random(),
        duration: 350 + Math.random() * 300,
        onComplete: () => splat.destroy(),
      });
    }
  }
}
