import { World } from "../core/World.js";
import { Player } from "../core/Player.js";
import { Statue } from "../entities/Statue.js";
import { Unit } from "../entities/Unit.js";
import { Miner } from "../entities/Miner.js";
import { InkWell } from "../buildings/InkWell.js";
import { HUD } from "../ui/HUD.js";
import { UnitBar } from "../ui/UnitBar.js";
import { LaneSelector } from "../ui/LaneSelector.js";
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
import { MINER_TYPE } from "../units/miners.config.js";

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

    const midY = (PLAY_TOP + PLAY_BOTTOM) / 2;
    left.statue = new Statue({ scene: this, owner: left, x: STATUE_X.left, y: midY, hp: BALANCE.statueHp });
    right.statue = new Statue({ scene: this, owner: right, x: STATUE_X.right, y: midY, hp: BALANCE.statueHp });

    left.inkWell = new InkWell({ scene: this, owner: left, x: STATUE_X.left - BALANCE.inkWellOffset, y: midY });
    right.inkWell = new InkWell({ scene: this, owner: right, x: STATUE_X.right + BALANCE.inkWellOffset, y: midY });

    this.spawnStartingMiners(left);
    this.spawnStartingMiners(right);

    this.drawBottomPanel();

    this.hud = new HUD(this, this.world);
    this.unitBar = new UnitBar(
      this,
      left,
      20,
      WORLD_H - 90,
      [
        { ...MINER_TYPE, kind: "miner" },
        { ...UNIT_TYPES.brushSwordsman, kind: "unit" },
      ],
      (item) => this.handleBuy(left, item)
    );
    this.laneSelector = new LaneSelector(this, left, 260, WORLD_H - 85);

    this.controlIndicators = {
      [SIDE.LEFT]: this.add.graphics(),
      [SIDE.RIGHT]: this.add.graphics(),
    };

    this.drawHintText();
    this.bindInput();

    this.events.on("gameOver", (winner) => this.showGameOver(winner));
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

  drawBottomPanel() {
    this.add.rectangle(0, WORLD_H - 100, WORLD_W, 100, PALETTE.ink, 0.6).setOrigin(0, 0);
  }

  drawHintText() {
    const hint =
      "Click a scribe on YOUR side to control it (faster + more ink). Click empty space to release. Click the RIGHT play area to spawn a free Vermillion swordsman for testing.";
    this.add
      .text(WORLD_W / 2, WORLD_H - 6, hint, {
        fontFamily: "Georgia, serif",
        fontSize: "11px",
        color: "#9c8c6a",
        wordWrap: { width: WORLD_W - 40 },
      })
      .setOrigin(0.5, 1);
  }

  spawnStartingMiners(player) {
    const baseX = player.side === SIDE.LEFT
      ? player.statue.x - 30
      : player.statue.x + 30;
    for (let i = 0; i < BALANCE.startingMiners; i++) {
      const jitter = (i - 1) * BALANCE.minerSpawnJitter;
      const miner = new Miner({
        scene: this,
        owner: player,
        x: baseX,
        y: player.statue.y + jitter,
        config: MINER_TYPE,
      });
      this.world.spawnMiner(miner);
    }
  }

  handleBuy(player, item) {
    if (item.kind === "miner") {
      const baseX = player.side === SIDE.LEFT
        ? player.statue.x - 30
        : player.statue.x + 30;
      const jitter = (Math.random() - 0.5) * BALANCE.minerSpawnJitter * 2;
      const miner = new Miner({
        scene: this,
        owner: player,
        x: baseX,
        y: player.statue.y + jitter,
        config: MINER_TYPE,
      });
      this.world.spawnMiner(miner);
    } else {
      this.spawnCombatUnit(player, player.activeLane, item);
    }
  }

  spawnCombatUnit(player, laneIdx, type) {
    const x = player.side === SIDE.LEFT ? STATUE_X.left + 50 : STATUE_X.right - 50;
    const y = LANE_YS[laneIdx];
    const unit = new Unit({ scene: this, owner: player, lane: laneIdx, x, y, type });
    this.world.spawnUnit(unit);
  }

  bindInput() {
    this.input.on("pointerdown", (pointer) => {
      if (this.world.gameOver) return;
      if (pointer.y < PLAY_TOP || pointer.y > PLAY_BOTTOM) return;

      const left = this.world.players[SIDE.LEFT];

      if (pointer.x < WORLD_W / 2) {
        const hit = this.pickEntityAt(left, pointer.x, pointer.y);
        if (hit) {
          left.setControlled(hit);
        } else {
          left.clearControlled();
        }
      } else {
        this.spawnCombatUnit(
          this.world.players[SIDE.RIGHT],
          this.nearestLaneIndex(pointer.y),
          UNIT_TYPES.brushSwordsman
        );
      }
    });
  }

  pickEntityAt(player, x, y) {
    const candidates = [...player.miners, ...player.units];
    for (const e of candidates) {
      const dx = e.x - x;
      const dy = e.y - y;
      const r = e.radius + 4;
      if (dx * dx + dy * dy <= r * r) return e;
    }
    return null;
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

  drawControlIndicator(player) {
    const g = this.controlIndicators[player.side];
    g.clear();
    if (!player.controlled || player.controlled.dead) return;
    const e = player.controlled;
    const t = this.time.now / 200;
    const pulse = 4 + Math.sin(t) * 2;
    g.lineStyle(2, PALETTE.gold, 1);
    g.strokeCircle(e.x, e.y, e.radius + pulse);
    g.lineStyle(1, PALETTE.gold, 0.5);
    g.strokeCircle(e.x, e.y, e.radius + pulse + 4);
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
    this.hud.update();
    this.unitBar.update();
    for (const player of Object.values(this.world.players)) {
      this.drawControlIndicator(player);
    }
  }
}
