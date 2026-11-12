import { SCORING, TRAY_SIZE } from './config.js';
import { fits, canFit } from './geometry.js';
import { piece, refill } from './dealer.js';

// Public game API: pure rules and data, with no browser or storage dependency.
export { fits, canFit, rotate, rotatePieces, shapeKey } from './geometry.js';
export { piece, refill } from './dealer.js';
export { valid } from './validation.js';
export { shapeCount } from './shapes.js';

export function fresh(size, random = Math.random) {
  const state = {
    size,
    board: Array.from({ length: size }, () => Array(size).fill(0)),
    tray: Array(TRAY_SIZE).fill(null),
    score: 0, lines: 0, combo: 0, moves: 0, over: false, recorded: false,
  };
  refill(state, random);
  return state;
}

export function hasMove(state) {
  return state.tray.some(p => p && canFit(state.board, p.cells));
}

function clearLines(board) {
  const rows = new Set();
  const columns = new Set();
  const cleared = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i].every(Boolean)) rows.add(i);
    if (board.every(row => row[i])) columns.add(i);
  }
  // Discover all lines before removing their intersections.
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board.length; c++) {
      if (rows.has(r) || columns.has(c)) {
        cleared.push([r, c]);
        board[r][c] = 0;
      }
    }
  }
  return { count: rows.size + columns.size, cleared };
}

export function place(state, index, row, column, random = Math.random) {
  const played = state.tray[index];
  if (state.over || !played || !fits(state.board, played.cells, row, column)) return null;
  played.cells.forEach(([dr, dc]) => { state.board[row + dr][column + dc] = played.color; });
  const { count, cleared } = clearLines(state.board);
  state.combo = count ? state.combo + 1 : 0;
  const gained = played.cells.length * SCORING.square + count ** 2 * SCORING.line
    + Math.max(0, state.combo - 1) * SCORING.streak;
  state.score += gained;
  state.lines += count;
  state.moves++;
  state.tray[index] = null;
  state.tray[index] = piece(random, state.tray, played, state.board);
  refill(state, random);
  state.over = !hasMove(state);
  return { gained, count, cleared };
}
