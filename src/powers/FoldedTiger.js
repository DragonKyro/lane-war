import { Power } from "./Power.js";
import { Unit } from "../entities/Unit.js";
import { UNIT_TYPES } from "../units/units.config.js";
import { LANE_YS, STATUE_X, SIDE, PALETTE } from "../config/constants.js";

export class FoldedTiger extends Power {
  cast(scene, player, world) {
    const lane = player.activeLane;
    const x = player.side === SIDE.LEFT ? STATUE_X.left + 50 : STATUE_X.right - 50;
    const y = LANE_YS[lane];
    const unit = new Unit({
      scene,
      owner: player,
      lane,
      x,
      y,
      type: UNIT_TYPES.foldedTiger,
    });
    world.spawnUnit(unit);

    const flash = scene.add.circle(x, y, 28, PALETTE.gold, 0.85);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.8,
      duration: 400,
      onComplete: () => flash.destroy(),
    });
  }
}
