import { PALETTE } from "../config/constants.js";

const FONT = "Georgia, serif";

export class LaneSelector {
  constructor(scene, player, x, y) {
    this.scene = scene;
    this.player = player;
    this.buttons = [];
    this.draw(x, y);
  }

  draw(x, y) {
    const label = this.scene.add.text(x, y - 18, "Lane", {
      fontFamily: FONT,
      fontSize: "13px",
      color: "#ece6d6",
    });
    this.label = label;

    const btnW = 60;
    const btnH = 60;
    const gap = 8;

    for (let i = 0; i < 3; i++) {
      const bx = x + i * (btnW + gap);
      const bg = this.scene.add
        .rectangle(bx, y, btnW, btnH, PALETTE.parchment, 0.9)
        .setOrigin(0, 0)
        .setStrokeStyle(2, PALETTE.ink, 1)
        .setInteractive({ useHandCursor: true });

      const num = this.scene.add
        .text(bx + btnW / 2, y + btnH / 2, `${i + 1}`, {
          fontFamily: FONT,
          fontSize: "22px",
          color: "#1a1410",
        })
        .setOrigin(0.5);

      bg.on("pointerdown", () => {
        this.player.activeLane = i;
        this.refresh();
      });
      bg.on("pointerover", () => {
        if (this.player.activeLane !== i) bg.setFillStyle(PALETTE.gold, 0.7);
      });
      bg.on("pointerout", () => {
        if (this.player.activeLane !== i) bg.setFillStyle(PALETTE.parchment, 0.9);
      });

      this.buttons.push({ bg, num });
    }
    this.refresh();
  }

  refresh() {
    this.buttons.forEach((b, i) => {
      if (i === this.player.activeLane) {
        b.bg.setFillStyle(PALETTE.vermillion, 0.85);
        b.num.setColor("#ece6d6");
      } else {
        b.bg.setFillStyle(PALETTE.parchment, 0.9);
        b.num.setColor("#1a1410");
      }
    });
  }
}
