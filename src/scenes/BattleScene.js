import { World } from "../core/World.js";
import { Player } from "../core/Player.js";
import { Statue } from "../entities/Statue.js";
import { Unit } from "../entities/Unit.js";
import {
  WORLD_W,
  WORLD_H,
  PLAY_TOP,
  PLAY_BOTTOM,
  LANE_YS,
  STATUE_X,
  SIDE,
  PALETTE,
} from "../config/constants.js";
import { BALANCE } from "../config/balance.js";
import { UNIT_TYPES } from "../units/units.config.js";

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
  }

  create() {
    this.drawBackground();
    this.drawLanes();

    const left = new Player({ side: SIDE.LEFT, name: "Black Ink", color: PALETTE.ink });
    const right = new Player({ side: SIDE.RIGHT, name: "Vermillion", color: PALETTE.vermillion });
    left.ink = BALANCE.startingInk;
    right.ink = BALANCE.startingInk;

    this.world = new World(this, { left, right });

    left.statue = new Statue({
      scene: this,
      owner: left,
      x: STATUE_X.left,
      y: (PLAY_TOP + PLAY_BOTTOM) / 2,
      hp: BALANCE.statueHp,
    });
    right.statue = new Statue({
      scene: this,
      owner: right,
      x: STATUE_X.right,
      y: (PLAY_TOP + PLAY_BOTTOM) / 2,
      hp: BALANCE.statueHp,
    });

    this.drawHud();
    this.drawHints();
    this.bindInput();

    this.events.on("gameOver", (winner) => {
      this.showGameOver(winner);
    });
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillStyle(PALETTE.parchment, 1);
    g.fillRect(0, 0, WORLD_W, WORLD_H);

    g.fillStyle(PALETTE.parchmentDark, 0.15);
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * WORLD_W;
      const y = PLAY_TOP + Math.random() * (PLAY_BOTTOM - PLAY_TOP);
      g.fillCircle(x, y, 1 + Math.random() * 2);
    }
  }

  drawLanes() {
    const g = this.add.graphics();
    g.lineStyle(2, PALETTE.laneShade, 0.5);
    g.fillStyle(PALETTE.laneShade, 0.08);

    const laneHeight = (PLAY_BOTTOM - PLAY_TOP) / LANE_YS.length;
    for (let i = 0; i < LANE_YS.length; i++) {
      const yMid = LANE_YS[i];
      const yTop = yMid - laneHeight / 2 + 8;
      const yBot = yMid + laneHeight / 2 - 8;
      g.fillRect(0, yTop, WORLD_W, yBot - yTop);
      g.lineBetween(0, yMid, WORLD_W, yMid);
    }
  }

  drawHud() {
    this.add.rectangle(0, 0, WORLD_W, 80, PALETTE.ink, 0.85).setOrigin(0, 0);
    this.add
      .text(WORLD_W / 2, 40, "Lane War — Ink & Origami (Phase 1)", {
        fontFamily: "Georgia, serif",
        fontSize: "22px",
        color: "#ece6d6",
      })
      .setOrigin(0.5);
  }

  drawHints() {
    const hint =
      "Click LEFT side to spawn for Black Ink • Click RIGHT side to spawn for Vermillion • Y picks the lane closest to your click";
    this.add
      .text(WORLD_W / 2, WORLD_H - 50, hint, {
        fontFamily: "Georgia, serif",
        fontSize: "14px",
        color: "#ece6d6",
      })
      .setOrigin(0.5);
  }

  bindInput() {
    this.input.on("pointerdown", (pointer) => {
      if (this.world.gameOver) return;
      const inPlayArea = pointer.y >= PLAY_TOP && pointer.y <= PLAY_BOTTOM;
      if (!inPlayArea) return;

      const side = pointer.x < WORLD_W / 2 ? SIDE.LEFT : SIDE.RIGHT;
      const player = this.world.players[side];
      const laneIdx = this.nearestLaneIndex(pointer.y);
      this.spawnFor(player, laneIdx);
    });
  }

  nearestLaneIndex(y) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < LANE_YS.length; i++) {
      const d = Math.abs(LANE_YS[i] - y);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }

  spawnFor(player, laneIdx) {
    const type = UNIT_TYPES.brushSwordsman;
    const x = player.side === SIDE.LEFT ? STATUE_X.left + 50 : STATUE_X.right - 50;
    const y = LANE_YS[laneIdx];
    const unit = new Unit({
      scene: this,
      owner: player,
      lane: laneIdx,
      x,
      y,
      type,
    });
    this.world.spawnUnit(unit);
  }

  showGameOver(winner) {
    this.add.rectangle(0, 0, WORLD_W, WORLD_H, 0x000000, 0.6).setOrigin(0, 0);
    this.add
      .text(WORLD_W / 2, WORLD_H / 2, `${winner.name} wins!`, {
        fontFamily: "Georgia, serif",
        fontSize: "64px",
        color: "#ece6d6",
        stroke: "#1a1410",
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.add
      .text(WORLD_W / 2, WORLD_H / 2 + 60, "Refresh the page to play again", {
        fontFamily: "Georgia, serif",
        fontSize: "20px",
        color: "#ece6d6",
      })
      .setOrigin(0.5);
  }

  update(_time, dt) {
    this.world.update(dt);
  }
}
