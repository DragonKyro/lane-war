export const POWER_TYPES = {
  inkStorm: {
    key: "inkStorm",
    displayName: "Ink Storm",
    shortName: "Storm",
    cost: 80,
    cooldown: 12000,
    radius: 110,
    damage: 60,
    needsTarget: true,
  },
  foldedTiger: {
    key: "foldedTiger",
    displayName: "Folded Tiger",
    shortName: "Tiger",
    cost: 100,
    cooldown: 22000,
    needsTarget: false,
  },
  wetPage: {
    key: "wetPage",
    displayName: "Wet Page",
    shortName: "Wet Page",
    cost: 50,
    cooldown: 14000,
    radius: 100,
    duration: 4000,
    slowMul: 0.35,
    needsTarget: true,
  },
};

export const POWER_KEYS = ["inkStorm", "foldedTiger", "wetPage"];
