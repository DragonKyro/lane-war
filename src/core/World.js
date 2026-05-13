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

  spawnMiner(miner) {
    miner.owner.miners.push(miner);
  }

  addBuilding(building) {
    this.lanes[building.lane].addBuilding(building);
  }

  update(dt) {
    if (this.gameOver) return;

    for (const lane of this.lanes) {
      for (const unit of lane.units) unit.update(dt, this);
      for (const building of lane.buildings) building.update(dt, this);
    }
    for (const player of Object.values(this.players)) {
      for (const miner of player.miners) miner.update(dt, this);
      for (const power of player.powers) power.update(dt);
    }

    for (const lane of this.lanes) {
      for (const u of lane.units) if (u.dead) u.destroy();
      for (const b of lane.buildings) if (b.dead) b.destroy();
      lane.removeDead();
    }
    for (const player of Object.values(this.players)) {
      for (const m of player.miners) if (m.dead) m.destroy();
      player.miners = player.miners.filter((m) => !m.dead);
      player.units = player.units.filter((u) => !u.dead);
      for (let i = 0; i < player.buildingSlots.length; i++) {
        if (player.buildingSlots[i] && player.buildingSlots[i].dead) {
          player.buildingSlots[i] = null;
        }
      }

      if (player.controlled && player.controlled.dead) {
        player.clearControlled();
      }

      if (player.statue) player.statue.update(dt);
      if (player.statue && player.statue.dead) {
        this.gameOver = true;
        this.winner = this.opponentOf(player);
        this.scene.events.emit("gameOver", this.winner);
      }
    }
  }
}
