import { BOARD_SIZES, SCORE_LIMIT } from '../core/config.js';
import { valid } from '../core/validation.js';

// Preserve this key and envelope so pre-refactor saves continue to load.
export const STORAGE_KEY = 'little-blocks.v1';
const isRecord = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isScore = value => Number.isSafeInteger(value) && value >= 0;

export function emptyData() {
  return { size: 8, games: {}, scores: {}, bests: {}, sound: false };
}

function normalize(raw) {
  const data = emptyData();
  if (!isRecord(raw)) return data;
  if (BOARD_SIZES.includes(raw.size)) data.size = raw.size;
  data.sound = Boolean(raw.sound);
  if (['light', 'dark'].includes(raw.theme)) data.theme = raw.theme;
  for (const size of BOARD_SIZES) {
    if (valid(raw.games?.[size], size)) data.games[size] = raw.games[size];
    if (isScore(raw.bests?.[size])) data.bests[size] = raw.bests[size];
    if (Array.isArray(raw.scores?.[size])) {
      data.scores[size] = raw.scores[size]
        .filter(entry => isRecord(entry) && isScore(entry.score) && typeof entry.date === 'string')
        .map(entry => ({ score: entry.score, lines: isScore(entry.lines) ? entry.lines : 0, date: entry.date }))
        .sort((a, b) => b.score - a.score).slice(0, SCORE_LIMIT);
    }
  }
  return data;
}

export function createStore(getStorage = () => window.localStorage) {
  let storage;
  let available = true;
  let data = emptyData();
  try {
    storage = getStorage();
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      try { data = normalize(JSON.parse(raw)); }
      catch { /* Malformed JSON starts a fresh save instead of breaking the game. */ }
    }
  } catch {
    available = false;
  }

  function persist() {
    try {
      storage ??= getStorage();
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
      available = true;
    } catch {
      available = false;
    }
    return available;
  }

  function history(size) { return data.scores[size] ?? []; }

  function best(state) {
    return Math.max(data.bests[state.size] ?? 0, state.score, ...history(state.size).map(s => s.score));
  }

  function record(state) {
    if (state.recorded || !state.moves) return;
    data.scores[state.size] = [
      ...history(state.size),
      { score: state.score, lines: state.lines, date: new Date().toISOString() },
    ].sort((a, b) => b.score - a.score).slice(0, SCORE_LIMIT);
    data.bests[state.size] = best(state);
    state.recorded = true;
  }

  function saveGame(state) {
    data.games[state.size] = state;
    data.size = state.size;
    data.bests[state.size] = best(state);
    return persist();
  }

  return { data, history, best, record, saveGame, persist, get available() { return available; } };
}
