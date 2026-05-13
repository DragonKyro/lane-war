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
  }

  setControlled(entity) {
    if (entity && entity.owner !== this) return;
    this.controlled = entity;
  }

  clearControlled() {
    this.controlled = null;
  }
}
