import { PALETTE } from "../config/constants.js";

const FONT = "Georgia, serif";

export class UnitBar {
  constructor(scene, player, x, y, items, onSpawn, opts = {}) {
    this.scene = scene;
    this.player = player;
    this.items = items;
    this.onSpawn = onSpawn;
    this.btnW = opts.btnW || 76;
    this.btnH = opts.btnH || 76;
    this.gap = opts.gap || 4;
    this.buttons = [];
    this.draw(x, y);
  }

  draw(x, y) {
    const { btnW, btnH, gap } = this;
    this.items.forEach((item, i) => {
      const bx = x + i * (btnW + gap);
      const bg = this.scene.add
        .rectangle(bx, y, btnW, btnH, PALETTE.parchment, 0.92)
        .setOrigin(0, 0)
        .setStrokeStyle(2, PALETTE.ink, 1)
        .setInteractive({ useHandCursor: true });

      const name = this.scene.add
        .text(bx + btnW / 2, y + 8, item.shortName || item.displayName, {
          fontFamily: FONT,
          fontSize: "13px",
          color: "#1a1410",
        })
        .setOrigin(0.5, 0);

      const role = this.scene.add
        .text(
          bx + btnW / 2,
          y + 28,
          item.role || (item.kind === "miner" ? "economy" : ""),
          { fontFamily: FONT, fontSize: "10px", color: "#9c8c6a" }
        )
        .setOrigin(0.5, 0);

      const cost = this.scene.add
        .text(bx + btnW / 2, y + btnH - 18, `${item.cost} ink`, {
          fontFamily: FONT,
          fontSize: "12px",
          color: "#7a1f18",
        })
        .setOrigin(0.5, 0);

      bg.on("pointerdown", () => this.tryBuy(item));
      bg.on("pointerover", () => {
        if (this.isAvailable(item)) bg.setFillStyle(PALETTE.gold, 0.9);
      });
      bg.on("pointerout", () => bg.setFillStyle(PALETTE.parchment, 0.92));

      this.buttons.push({ item, bg, name, role, cost });
    });
  }

  isAvailable(item) {
    if (this.player.ink < item.cost) return false;
    if (item.kind === "building" && !this.player.hasBuildingSlot(this.player.activeLane)) {
      return false;
    }
    return true;
  }

  tryBuy(item) {
    if (!this.isAvailable(item)) return;
    const success = this.onSpawn(item);
    if (success) {
      this.player.ink -= item.cost;
    }
  }

  update() {
    for (const b of this.buttons) {
      const ok = this.isAvailable(b.item);
      b.bg.setAlpha(ok ? 1 : 0.45);
    }
  }
}
