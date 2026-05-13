import { BootScene } from "./scenes/BootScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { BattleScene } from "./scenes/BattleScene.js";
import { GameOverScene } from "./scenes/GameOverScene.js";
import { WORLD_W, WORLD_H } from "./config/constants.js";

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: WORLD_W,
  height: WORLD_H,
  backgroundColor: "#1a1410",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
  scene: [BootScene, MenuScene, BattleScene, GameOverScene],
};

new Phaser.Game(config);
