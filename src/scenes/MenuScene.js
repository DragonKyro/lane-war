import { WORLD_W, WORLD_H, PALETTE } from "../config/constants.js";

const FONT = "Georgia, serif";

const MENU_OPTIONS = [
  { label: "vs AI — Easy", mode: "ai", difficulty: "easy" },
  { label: "vs AI — Normal", mode: "ai", difficulty: "normal" },
  { label: "vs AI — Hard", mode: "ai", difficulty: "hard" },
  { label: "Hotseat — Two Players", mode: "hotseat" },
];

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    this.cameras.main.setBackgroundColor("#ece6d6");

    const bg = this.add.graphics();
    bg.fillStyle(PALETTE.parchmentDark, 0.15);
    for (let i = 0; i < 90; i++) {
      bg.fillCircle(Math.random() * WORLD_W, Math.random() * WORLD_H, 1 + Math.random() * 2);
    }

    this.add
      .text(WORLD_W / 2, 90, "Lane War", {
        fontFamily: FONT,
        fontSize: "78px",
        color: "#1a1410",
      })
      .setOrigin(0.5);
    this.add
      .text(WORLD_W / 2, 170, "Ink & Origami", {
        fontFamily: FONT,
        fontStyle: "italic",
        fontSize: "32px",
        color: "#7a1f18",
      })
      .setOrigin(0.5);

    this.add
      .text(
        WORLD_W / 2,
        225,
        "Two paper kingdoms. Three lanes. Fold soldiers, mine ink, smudge the rival seal.",
        {
          fontFamily: FONT,
          fontSize: "16px",
          color: "#4a3a26",
        }
      )
      .setOrigin(0.5);

    const seal = this.add.graphics();
    seal.fillStyle(PALETTE.vermillion, 0.85);
    seal.fillCircle(WORLD_W / 2, 285, 22);
    seal.lineStyle(2, PALETTE.parchment, 1);
    seal.strokeCircle(WORLD_W / 2, 285, 18);
    seal.lineBetween(WORLD_W / 2 - 8, 285, WORLD_W / 2 + 8, 285);
    seal.lineBetween(WORLD_W / 2, 285 - 8, WORLD_W / 2, 285 + 8);

    MENU_OPTIONS.forEach((opt, i) => {
      this.makeButton(WORLD_W / 2, 360 + i * 64, 340, 50, opt.label, () => this.start(opt));
    });

    this.add
      .text(
        WORLD_W / 2,
        WORLD_H - 32,
        "Tip: in-game press 1 / 2 / 3 to restart on Easy / Normal / Hard • ESC cancels a power",
        { fontFamily: FONT, fontSize: "12px", color: "#7a6a4a" }
      )
      .setOrigin(0.5);
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
    return { bg, text };
  }

  start(opt) {
    this.registry.set("mode", opt.mode);
    if (opt.difficulty) this.registry.set("difficulty", opt.difficulty);
    this.scene.start("BattleScene");
  }
}
