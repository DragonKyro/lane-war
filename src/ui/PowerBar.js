import { PALETTE } from "../config/constants.js";

const FONT = "Georgia, serif";

export class PowerBar {
  constructor(scene, player, x, y, onPick) {
    this.scene = scene;
    this.player = player;
    this.onPick = onPick;
    this.buttons = [];
    this.draw(x, y);
  }

  draw(x, y) {
    const btnW = 60;
    const btnH = 76;
    const gap = 4;

    this.player.powers.forEach((power, i) => {
      const bx = x + i * (btnW + gap);
      const bg = this.scene.add
        .rectangle(bx, y, btnW, btnH, PALETTE.parchment, 0.92)
        .setOrigin(0, 0)
        .setStrokeStyle(2, PALETTE.vermillionDark, 1)
        .setInteractive({ useHandCursor: true });

      const name = this.scene.add
        .text(bx + btnW / 2, y + 8, power.config.shortName, {
          fontFamily: FONT,
          fontSize: "12px",
          color: "#7a1f18",
        })
        .setOrigin(0.5, 0);

      const cost = this.scene.add
        .text(bx + btnW / 2, y + btnH - 18, `${power.cost} ink`, {
          fontFamily: FONT,
          fontSize: "11px",
          color: "#7a1f18",
        })
        .setOrigin(0.5, 0);

      const cdOverlay = this.scene.add
        .rectangle(bx, y, btnW, btnH, PALETTE.ink, 0.55)
        .setOrigin(0, 0)
        .setVisible(false);
      const cdText = this.scene.add
        .text(bx + btnW / 2, y + btnH / 2, "", {
          fontFamily: FONT,
          fontSize: "22px",
          color: "#ece6d6",
        })
        .setOrigin(0.5)
        .setVisible(false);

      bg.on("pointerdown", () => {
        if (this.onPick) this.onPick(power);
      });
      bg.on("pointerover", () => {
        if (power.canCast(this.player)) bg.setFillStyle(PALETTE.gold, 0.9);
      });
      bg.on("pointerout", () => bg.setFillStyle(PALETTE.parchment, 0.92));

      this.buttons.push({ power, bg, name, cost, cdOverlay, cdText });
    });
  }

  update() {
    for (const b of this.buttons) {
      const ready = b.power.isReady();
      const affordable = this.player.ink >= b.power.cost;
      b.bg.setAlpha(ready && affordable ? 1 : 0.55);
      if (ready) {
        b.cdOverlay.setVisible(false);
        b.cdText.setVisible(false);
      } else {
        b.cdOverlay.setVisible(true);
        b.cdText.setVisible(true);
        b.cdText.setText(`${Math.ceil(b.power.cooldown / 1000)}`);
      }
    }
  }

  highlight(power) {
    for (const b of this.buttons) {
      b.bg.setStrokeStyle(b.power === power ? 3 : 2, PALETTE.vermillionDark, 1);
    }
  }

  clearHighlight() {
    for (const b of this.buttons) {
      b.bg.setStrokeStyle(2, PALETTE.vermillionDark, 1);
    }
  }
}
