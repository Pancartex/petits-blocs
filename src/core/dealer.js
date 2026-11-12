import { COLORS, DEALING } from './config.js';
import { canFit, rotate, shapeKey } from './geometry.js';
import { catalog } from './shapes.js';

const byKey = new Map(catalog.map(shape => [shape.key, shape]));

function chooseWeighted(candidates, random) {
  let draw = random() * candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
  for (const candidate of candidates) {
    draw -= candidate.weight;
    if (draw < 0) return candidate.shape;
  }
  return candidates.at(-1).shape;
}

export function piece(random = Math.random, tray = [], lastPlayed = null, board = null) {
  const held = tray.filter(Boolean).map(p => byKey.get(shapeKey(p.cells))).filter(Boolean);
  const forbidden = lastPlayed ? shapeKey(lastPlayed.cells) : null;
  let candidates = catalog.filter(shape => shape.key !== forbidden).map(shape => ({
    shape,
    weight: held.some(p => p.key === shape.key) ? DEALING.duplicateWeight
      : held.some(p => p.family === shape.family) ? DEALING.familyWeight : 1,
  }));

  if (board) {
    const playable = candidates.filter(candidate => canFit(board, candidate.shape.cells));
    const needsRescue = !tray.some(p => p && canFit(board, p.cells));
    // A rescue still respects the hard no-immediate-repeat rule.
    if (playable.length && (needsRescue || random() < DEALING.helpfulChance)) {
      candidates = playable;
    }
  }

  let cells = chooseWeighted(candidates, random).cells.map(cell => [...cell]);
  for (let turns = Math.floor(random() * 4); turns > 0; turns--) cells = rotate(cells);
  const colors = COLORS.filter(color => !tray.some(p => p && p.color === color));
  return { cells, color: colors[Math.floor(random() * colors.length)] };
}

export function refill(state, random = Math.random) {
  for (let index = 0; index < state.tray.length; index++) {
    if (!state.tray[index]) state.tray[index] = piece(random, state.tray, null, state.board);
  }
}
