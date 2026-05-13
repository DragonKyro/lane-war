export class Power {
  constructor(config) {
    this.config = config;
    this.cooldown = 0;
  }

  get key() { return this.config.key; }
  get cost() { return this.config.cost; }
  get cooldownMax() { return this.config.cooldown; }
  get needsTarget() { return !!this.config.needsTarget; }

  isReady() {
    return this.cooldown <= 0;
  }

  canCast(player) {
    return this.isReady() && player.ink >= this.cost;
  }

  cast(_scene, _player, _world, _x, _y) {}

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.cooldown < 0) this.cooldown = 0;
  }
}
