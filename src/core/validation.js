import { BOARD_SIZES, COLORS, TRAY_SIZE } from './config.js';

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
