import { PALETTE } from "../config/constants.js";

const FONT = "Georgia, serif";

export class UnitBar {
  constructor(scene, player, x, y, items, onSpawn) {
    this.scene = scene;
    this.player = player;
    this.items = items;
    this.onSpawn = onSpawn;
    this.buttons = [];
    this.draw(x, y);
  }

  draw(x, y) {
    const btnW = 110;
    const btnH = 70;
    const gap = 10;

    this.items.forEach((item, i) => {
      const bx = x + i * (btnW + gap);
      const bg = this.scene.add
        .rectangle(bx, y, btnW, btnH, PALETTE.parchment, 0.9)
        .setOrigin(0, 0)
        .setStrokeStyle(2, PALETTE.ink, 1)
        .setInteractive({ useHandCursor: true });

      const name = this.scene.add
        .text(bx + btnW / 2, y + 10, item.displayName, {
          fontFamily: FONT,
          fontSize: "14px",
          color: "#1a1410",
        })
        .setOrigin(0.5, 0);

      const cost = this.scene.add
        .text(bx + btnW / 2, y + btnH - 22, `${item.cost} ink`, {
          fontFamily: FONT,
          fontSize: "13px",
          color: "#7a1f18",
        })
        .setOrigin(0.5, 0);

      const hint = this.scene.add
        .text(bx + btnW / 2, y + 32, item.kind === "miner" ? "(economy)" : "(combat)", {
          fontFamily: FONT,
          fontSize: "11px",
          color: "#9c8c6a",
        })
        .setOrigin(0.5, 0);

      bg.on("pointerdown", () => this.tryBuy(item));
      bg.on("pointerover", () => bg.setFillStyle(PALETTE.gold, 0.9));
      bg.on("pointerout", () => bg.setFillStyle(PALETTE.parchment, 0.9));

      this.buttons.push({ item, bg, name, cost, hint });
    });
  }

  tryBuy(item) {
    if (this.player.ink < item.cost) return;
    this.player.ink -= item.cost;
    this.onSpawn(item);
  }

  update() {
    for (const b of this.buttons) {
      const affordable = this.player.ink >= b.item.cost;
      b.bg.setAlpha(affordable ? 1 : 0.5);
    }
  }
}
