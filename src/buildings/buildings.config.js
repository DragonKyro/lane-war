export const BUILDING_TYPES = {
  inkWell: {
    key: "inkWell",
    displayName: "Ink Well",
    shortName: "Well",
    radius: 22,
  },
  paperBastion: {
    key: "paperBastion",
    displayName: "Paper Bastion",
    shortName: "Bastion",
    role: "wall",
    cost: 70,
    hp: 400,
    radius: 18,
  },
  inkSentry: {
    key: "inkSentry",
    displayName: "Ink Sentry",
    shortName: "Sentry",
    role: "turret",
    cost: 120,
    hp: 180,
    range: 200,
    damage: 11,
    attackInterval: 900,
    radius: 14,
  },
};

export const DEFENSE_BUILDING_LIST = [
  BUILDING_TYPES.paperBastion,
  BUILDING_TYPES.inkSentry,
];
