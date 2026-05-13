let nextId = 1;

export class Entity {
  constructor({ scene, owner, x, y, hp = 1 }) {
    this.id = nextId++;
    this.scene = scene;
    this.owner = owner;
    this.x = x;
    this.y = y;
    this.hp = hp;
    this.maxHp = hp;
    this.dead = false;
    this.gfx = null;
  }

  takeDamage(amount) {
    if (this.dead) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.onDeath();
    }
  }

  onDeath() {}

  update(_dt) {}

  destroy() {
    if (this.gfx) {
      this.gfx.destroy();
      this.gfx = null;
    }
  }
}
