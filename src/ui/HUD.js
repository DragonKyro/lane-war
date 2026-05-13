import { WORLD_W, PALETTE, SIDE } from "../config/constants.js";

const FONT = "Georgia, serif";

export class HUD {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.draw();
  }

  draw() {
    this.scene.add.rectangle(0, 0, WORLD_W, 80, PALETTE.ink, 0.9).setOrigin(0, 0);
    this.scene.add
      .text(WORLD_W / 2, 12, "Lane War — Ink & Origami (Phase 2)", {
        fontFamily: FONT,
        fontSize: "16px",
        color: "#c69c4a",
      })
      .setOrigin(0.5, 0);

    this.leftLabel = this.scene.add.text(20, 32, "", {
      fontFamily: FONT,
      fontSize: "18px",
      color: "#ece6d6",
    });
    this.leftIcon = this.scene.add.circle(20 + 8, 60, 6, PALETTE.gold);
    this.leftInk = this.scene.add.text(20 + 20, 52, "", {
      fontFamily: FONT,
      fontSize: "16px",
      color: "#ece6d6",
    });

    this.rightLabel = this.scene.add
      .text(WORLD_W - 20, 32, "", {
        fontFamily: FONT,
        fontSize: "18px",
        color: "#ece6d6",
      })
      .setOrigin(1, 0);
    this.rightIcon = this.scene.add.circle(WORLD_W - 20 - 8, 60, 6, PALETTE.gold);
    this.rightInk = this.scene.add
      .text(WORLD_W - 20 - 20, 52, "", {
        fontFamily: FONT,
        fontSize: "16px",
        color: "#ece6d6",
      })
      .setOrigin(1, 0);
  }

  update() {
    const left = this.world.players[SIDE.LEFT];
    const right = this.world.players[SIDE.RIGHT];
    this.leftLabel.setText(`${left.name}  •  Seal HP ${left.statue ? left.statue.hp : 0}`);
    this.leftInk.setText(`${Math.floor(left.ink)} ink`);
    this.rightLabel.setText(`${right.name}  •  Seal HP ${right.statue ? right.statue.hp : 0}`);
    this.rightInk.setText(`${Math.floor(right.ink)} ink`);
  }
}
