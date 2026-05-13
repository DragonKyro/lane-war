export class Player {
  constructor({ side, name, color }) {
    this.side = side;
    this.name = name;
    this.color = color;
    this.statue = null;
    this.units = [];
    this.ink = 0;
  }

  ownsStatue(statue) {
    return this.statue === statue;
  }
}
