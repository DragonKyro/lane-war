export const WORLD_W = 1280;
export const WORLD_H = 720;

export const HUD_H = 80;
export const UI_H = 100;

export const PLAY_TOP = HUD_H;
export const PLAY_BOTTOM = WORLD_H - UI_H;

export const LANE_COUNT = 3;
export const LANE_YS = [
  PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * 0.25,
  PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * 0.5,
  PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * 0.75,
];

export const STATUE_X = {
  left: 100,
  right: WORLD_W - 100,
};

export const SIDE = Object.freeze({
  LEFT: "left",
  RIGHT: "right",
});

export const PALETTE = Object.freeze({
  parchment: 0xece6d6,
  parchmentDark: 0x9c8c6a,
  ink: 0x1a1410,
  black: 0x121212,
  vermillion: 0xc8362c,
  vermillionDark: 0x7a1f18,
  gold: 0xc69c4a,
  laneShade: 0x4a3a26,
});
