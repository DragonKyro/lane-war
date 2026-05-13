export class Lane {
  constructor(index, y) {
    this.index = index;
    this.y = y;
    this.units = [];
    this.buildings = [];
  }

  add(unit) {
    this.units.push(unit);
  }

  addBuilding(b) {
    this.buildings.push(b);
  }

  removeDead() {
    this.units = this.units.filter((u) => !u.dead);
    this.buildings = this.buildings.filter((b) => !b.dead);
  }
}
