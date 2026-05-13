import { Lane } from "./Lane.js";
import { LANE_YS, SIDE } from "../config/constants.js";

export class World {
  constructor(scene, players) {
    this.scene = scene;
    this.lanes = LANE_YS.map((y, i) => new Lane(i, y));
    this.players = { [SIDE.LEFT]: players.left, [SIDE.RIGHT]: players.right };
    this.gameOver = false;
    this.winner = null;
  }

  opponentOf(player) {
    return player.side === SIDE.LEFT ? this.players[SIDE.RIGHT] : this.players[SIDE.LEFT];
  }

  spawnUnit(unit) {
    unit.owner.units.push(unit);
    this.lanes[unit.lane].add(unit);
  }

  update(dt) {
    if (this.gameOver) return;

    for (const lane of this.lanes) {
      for (const unit of lane.units) {
        unit.update(dt, this);
      }
      lane.removeDead();
    }

    for (const player of Object.values(this.players)) {
      player.units = player.units.filter((u) => !u.dead);
      if (player.statue) player.statue.update(dt);
      if (player.statue && player.statue.dead) {
        this.gameOver = true;
        this.winner = this.opponentOf(player);
        this.scene.events.emit("gameOver", this.winner);
      }
    }
  }
}
