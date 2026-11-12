import { BOARD_SIZES, COLORS, TRAY_SIZE, SCORE_LIMIT } from './config.js';

export function validPiece(piece) {
  return Boolean(piece) && COLORS.includes(piece.color)
    && Array.isArray(piece.cells) && piece.cells.length > 0 && piece.cells.length <= 9
    && piece.cells.every(cell => Array.isArray(cell) && cell.length === 2
      && cell.every(value => Number.isInteger(value) && value >= 0 && value < 5))
    && new Set(piece.cells.map(cell => cell.join(','))).size === piece.cells.length;
}

export function valid(state, size) {
  return Boolean(state) && BOARD_SIZES.includes(size) && state.size === size
    && Array.isArray(state.board) && state.board.length === size
    && state.board.every(row => Array.isArray(row) && row.length === size
      && row.every(value => value === 0 || COLORS.includes(value)))
    && ['score', 'lines', 'combo', 'moves'].every(key =>
      Number.isSafeInteger(state[key]) && state[key] >= 0)
    && typeof state.over === 'boolean' && typeof state.recorded === 'boolean'
    && Array.isArray(state.tray) && state.tray.length === TRAY_SIZE
    && state.tray.some(Boolean) && state.tray.every(p => p === null || validPiece(p));
}

export function validRewind(rewind, current) {
  const before = rewind?.state;
  const progress = rewind?.progress;
  return Boolean(before && progress) && valid(before, current.size)
    && !before.over && !before.recorded && !Object.hasOwn(before, 'rewind')
    && before.moves === current.moves - 1
    && Number.isSafeInteger(progress.best) && progress.best >= 0
    && Array.isArray(progress.scores) && progress.scores.length <= SCORE_LIMIT
    && progress.scores.every(entry => entry && Number.isSafeInteger(entry.score) && entry.score >= 0
      && Number.isSafeInteger(entry.lines) && entry.lines >= 0 && typeof entry.date === 'string');
}
