import { StanceController } from "../commands/StanceController.js";
import { LANE_COUNT } from "../config/constants.js";

export class Player {
  constructor({ side, name, color }) {
    this.side = side;
    this.name = name;
    this.color = color;
    this.statue = null;
    this.inkWell = null;
    this.units = [];
    this.miners = [];
    this.ink = 0;
    this.controlled = null;
    this.activeLane = 1;
    this.stanceController = new StanceController();
    this.buildingSlots = new Array(LANE_COUNT).fill(null);
    this.powers = [];
  }

  setControlled(entity) {
    if (entity && entity.owner !== this) return;
    this.controlled = entity;
  }

  clearControlled() {
    this.controlled = null;
  }

  hasBuildingSlot(laneIdx) {
    return !this.buildingSlots[laneIdx];
  }
}
