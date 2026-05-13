import { LANE_COUNT } from "../config/constants.js";

export const STANCE = Object.freeze({
  ATTACK: "ATTACK",
  DEFEND: "DEFEND",
  RETREAT: "RETREAT",
  RUSH: "RUSH",
});

export const STANCE_ORDER = [STANCE.ATTACK, STANCE.DEFEND, STANCE.RETREAT, STANCE.RUSH];

export const STANCE_LABEL = Object.freeze({
  [STANCE.ATTACK]: "Attack",
  [STANCE.DEFEND]: "Defend",
  [STANCE.RETREAT]: "Retreat",
  [STANCE.RUSH]: "Rush",
});

export class StanceController {
  constructor(defaultStance = STANCE.ATTACK) {
    this.stances = new Array(LANE_COUNT).fill(defaultStance);
  }

  get(laneIdx) {
    return this.stances[laneIdx];
  }

  set(laneIdx, stance) {
    this.stances[laneIdx] = stance;
  }

  setAll(stance) {
    for (let i = 0; i < this.stances.length; i++) this.stances[i] = stance;
  }

  allSame() {
    return this.stances.every((s) => s === this.stances[0]);
  }
}
