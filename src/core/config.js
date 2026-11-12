export const BOARD_SIZES = [8, 10, 12];
export const TRAY_SIZE = 3;
export const COLORS = [1, 2, 3, 4, 5, 6];
export const SCORE_LIMIT = 10;

export const DEALING = Object.freeze({
  duplicateWeight: 0.015,
  familyWeight: 0.08,
  helpfulChance: 0.9,
  crowdingStart: 0.3,
  crowdedAt: 0.75,
  largeMinimum: 0.08,
  mediumMinimum: 0.35,
  fourCellMinimum: 0.7,
});

export const SCORING = Object.freeze({
  square: 10,
  line: 100,
  streak: 50,
});
