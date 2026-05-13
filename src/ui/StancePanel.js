import { PALETTE } from "../config/constants.js";
import { STANCE_ORDER, STANCE_LABEL } from "../commands/StanceController.js";

const FONT = "Georgia, serif";

export class StancePanel {
  constructor(scene, player, x, y) {
    this.scene = scene;
    this.player = player;
    this.laneButtons = [];
    this.allButtons = [];
    this.draw(x, y);
  }

  draw(x, y) {
    const btnW = 60;
    const btnH = 22;
    const gap = 4;

    this.laneLabel = this.scene.add.text(x, y, "", {
      fontFamily: FONT,
      fontSize: "12px",
      color: "#ece6d6",
    });

    STANCE_ORDER.forEach((stance, i) => {
      const bx = x + i * (btnW + gap);
      const by = y + 16;
      const bg = this.scene.add
        .rectangle(bx, by, btnW, btnH, PALETTE.parchment, 0.92)
        .setOrigin(0, 0)
        .setStrokeStyle(1, PALETTE.ink, 1)
        .setInteractive({ useHandCursor: true });
      const text = this.scene.add
        .text(bx + btnW / 2, by + btnH / 2, STANCE_LABEL[stance], {
          fontFamily: FONT,
          fontSize: "12px",
          color: "#1a1410",
        })
        .setOrigin(0.5);
      bg.on("pointerdown", () => {
        this.player.stanceController.set(this.player.activeLane, stance);
      });
      this.laneButtons.push({ stance, bg, text });
    });

    this.scene.add.text(x, y + 46, "All lanes", {
      fontFamily: FONT,
      fontSize: "12px",
      color: "#ece6d6",
    });

    STANCE_ORDER.forEach((stance, i) => {
      const bx = x + i * (btnW + gap);
      const by = y + 62;
      const bg = this.scene.add
        .rectangle(bx, by, btnW, btnH, PALETTE.parchment, 0.92)
        .setOrigin(0, 0)
        .setStrokeStyle(1, PALETTE.ink, 1)
        .setInteractive({ useHandCursor: true });
      const text = this.scene.add
        .text(bx + btnW / 2, by + btnH / 2, STANCE_LABEL[stance], {
          fontFamily: FONT,
          fontSize: "12px",
          color: "#1a1410",
        })
        .setOrigin(0.5);
      bg.on("pointerdown", () => {
        this.player.stanceController.setAll(stance);
      });
      this.allButtons.push({ stance, bg, text });
    });
  }

  update() {
    const lane = this.player.activeLane;
    this.laneLabel.setText(`Lane ${lane + 1}`);
    const currentStance = this.player.stanceController.get(lane);
    for (const b of this.laneButtons) {
      const active = b.stance === currentStance;
      b.bg.setFillStyle(active ? PALETTE.vermillion : PALETTE.parchment, active ? 0.95 : 0.92);
      b.text.setColor(active ? "#ece6d6" : "#1a1410");
    }

    const allSame = this.player.stanceController.allSame();
    const globalStance = allSame ? this.player.stanceController.get(0) : null;
    for (const b of this.allButtons) {
      const active = b.stance === globalStance;
      b.bg.setFillStyle(active ? PALETTE.vermillion : PALETTE.parchment, active ? 0.95 : 0.92);
      b.text.setColor(active ? "#ece6d6" : "#1a1410");
    }
  }
}
