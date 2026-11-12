import * as engine from './core/engine.js';
import { BOARD_SIZES } from './core/config.js';
import { validRewind } from './core/validation.js';

// Owns the current run and autosaves. No DOM: this can be exercised in Node tests.
export function createSession(store, random = Math.random) {
  const model = { state: null, selected: -1, cursor: [0, 0], hover: null };

  function resetSelection() {
    model.selected = -1;
    model.hover = null;
  }

  function enter(size) {
    if (!BOARD_SIZES.includes(size)) return;
    if (model.state) store.saveGame(model.state);
    model.state = engine.valid(store.data.games[size], size)
      ? store.data.games[size] : engine.fresh(size, random);
    if (!model.state.over) engine.refill(model.state, random);
    model.state.over = !engine.hasMove(model.state);
    if (model.state.over) store.record(model.state);
    resetSelection();
    model.cursor = [0, 0];
    store.saveGame(model.state);
  }

  function select(index, toggle = false) {
    if (model.state.over || !model.state.tray[index]) return false;
    if (toggle && model.selected === index) resetSelection();
    else model.selected = index;
    return true;
  }

  function place(row, column) {
    // One snapshot only: never copy an older rewind into the new snapshot.
    const { rewind: previousRewind, ...before } = model.state;
    const snapshot = {
      state: structuredClone(before),
      progress: store.captureProgress(model.state.size),
    };
    const result = engine.place(model.state, model.selected, row, column, random);
    if (!result) return null;
    model.state.rewind = snapshot;
    resetSelection();
    if (model.state.over) store.record(model.state);
    store.saveGame(model.state);
    return result;
  }

  function rotate(direction = 1) {
    engine.rotatePieces(model.state.tray, model.selected, direction);
    store.saveGame(model.state);
  }

  function restart() {
    store.record(model.state);
    model.state = engine.fresh(model.state.size, random);
    resetSelection();
    model.cursor = [0, 0];
    store.saveGame(model.state);
  }

  function rewind() {
    const snapshot = model.state.rewind;
    if (!validRewind(snapshot, model.state)) return false;
    model.state = structuredClone(snapshot.state);
    store.restoreProgress(model.state.size, snapshot.progress);
    resetSelection();
    store.saveGame(model.state);
    return true;
  }

  return { model, enter, select, place, rotate, restart, rewind, deselect: resetSelection };
}
