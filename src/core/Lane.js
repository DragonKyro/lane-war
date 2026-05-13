export class Lane {
  constructor(index, y) {
    this.index = index;
    this.y = y;
    this.units = [];
  }

  add(unit) {
    this.units.push(unit);
  }

  removeDead() {
    this.units = this.units.filter((u) => !u.dead);
  }
}
