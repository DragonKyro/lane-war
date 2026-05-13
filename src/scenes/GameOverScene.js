import { WORLD_W, WORLD_H, PALETTE } from "../config/constants.js";

const FONT = "Georgia, serif";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  init(data) {
    this.winnerName = data && data.winnerName ? data.winnerName : "Someone";
    this.subtitle = data && data.subtitle ? data.subtitle : "";
  }

  create() {
    this.cameras.main.setBackgroundColor("#ece6d6");

    const bg = this.add.graphics();
    bg.fillStyle(PALETTE.parchmentDark, 0.15);
    for (let i = 0; i < 60; i++) {
      bg.fillCircle(Math.random() * WORLD_W, Math.random() * WORLD_H, 1 + Math.random() * 2);
    }

    this.add
      .text(WORLD_W / 2, 160, `${this.winnerName} wins`, {
        fontFamily: FONT,
        fontSize: "64px",
        color: "#1a1410",
      })
      .setOrigin(0.5);

    if (this.subtitle) {
      this.add
        .text(WORLD_W / 2, 230, this.subtitle, {
          fontFamily: FONT,
          fontStyle: "italic",
          fontSize: "20px",
          color: "#7a1f18",
        })
        .setOrigin(0.5);
    }

    const stamp = this.add.graphics();
    stamp.fillStyle(PALETTE.vermillion, 0.85);
    stamp.fillCircle(WORLD_W / 2, 320, 38);
    stamp.lineStyle(3, PALETTE.parchment, 1);
    stamp.strokeCircle(WORLD_W / 2, 320, 32);
    stamp.lineBetween(WORLD_W / 2 - 14, 320, WORLD_W / 2 + 14, 320);
    stamp.lineBetween(WORLD_W / 2, 320 - 14, WORLD_W / 2, 320 + 14);

    this.makeButton(WORLD_W / 2, 430, 280, 52, "Rematch", () =>
      this.scene.start("BattleScene")
    );
    this.makeButton(WORLD_W / 2, 500, 280, 52, "Main Menu", () =>
      this.scene.start("MenuScene")
    );
  }

  makeButton(x, y, w, h, label, onClick) {
    const bg = this.add
      .rectangle(x, y, w, h, PALETTE.ink, 0.92)
      .setStrokeStyle(2, PALETTE.gold, 1)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: FONT,
        fontSize: "20px",
        color: "#ece6d6",
      })
      .setOrigin(0.5);
    bg.on("pointerdown", onClick);
    bg.on("pointerover", () => {
      bg.setFillStyle(PALETTE.vermillion, 0.95);
      text.setColor("#ffffff");
    });
    bg.on("pointerout", () => {
      bg.setFillStyle(PALETTE.ink, 0.92);
      text.setColor("#ece6d6");
    });
  }
}
