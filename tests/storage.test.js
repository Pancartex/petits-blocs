import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, STORAGE_KEY } from '../src/services/storage.js';
import { fresh, rotate } from '../src/core/engine.js';
import { createSession } from '../src/session.js';

function memoryStorage(initial) {
  const items = new Map(initial ? [[STORAGE_KEY, JSON.stringify(initial)]] : []);
  return { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) };
}

test('existing v1 saves preserve all boards, orientations, scores, and preferences', () => {
  const legacy = { size: 12, games: {}, scores: { 8: [{ score: 250, lines: 2, date: '2026-11-12' }] }, bests: { 8: 250 }, sound: true, theme: 'dark' };
  for (const size of [8, 10, 12]) {
    const state = fresh(size);
    state.board[2][3] = 4;
    state.score = 80;
    state.moves = 2;
    state.tray[1].cells = rotate(state.tray[1].cells);
    legacy.games[size] = state;
  }
  const storage = memoryStorage(legacy);
  const store = createStore(() => storage);
  assert.deepEqual(store.data, legacy);
  const session = createSession(store);
  session.enter(store.data.size);
  assert.deepEqual(session.model.state, legacy.games[12]);
  assert.equal(store.available, true);
});

test('real save and reload preserve placements, selection rotations, and all-piece rotation', () => {
  const storage = memoryStorage();
  const store = createStore(() => storage);
  const session = createSession(store);
  session.enter(8);
  session.select(0);
  session.rotate(-1);
  assert.ok(session.place(0, 0));
  session.rotate();
  const expected = structuredClone(session.model.state);
  const reopened = createSession(createStore(() => storage));
  reopened.enter(8);
  assert.deepEqual(reopened.model.state, expected);
});

test('switching board sizes and restarting preserve independent runs and history', () => {
  const storage = memoryStorage();
  const store = createStore(() => storage);
  const session = createSession(store);
  session.enter(8);
  session.select(0);
  session.place(0, 0);
  const eight = structuredClone(session.model.state);
  session.enter(10);
  session.select(1);
  session.place(2, 2);
  session.enter(8);
  assert.deepEqual(session.model.state, eight);
  session.restart();
  assert.equal(session.model.state.score, 0);
  assert.equal(store.history(8).length, 1);
  assert.equal(store.history(8)[0].score, eight.score);
  assert.ok(store.data.games[10].score > 0);
});

test('recording an ended run twice does not duplicate its score', () => {
  const store = createStore(() => memoryStorage());
  const state = fresh(8);
  state.moves = 1;
  state.score = 10;
  store.record(state);
  store.record(state);
  assert.equal(store.history(8).length, 1);
});

test('malformed data falls back safely while valid sibling games survive', () => {
  const validGame = fresh(10);
  const store = createStore(() => memoryStorage({ size: 99, games: { 8: {}, 10: validGame }, scores: { 8: [null, { score: -1 }] }, bests: { 8: 'bad' } }));
  assert.equal(store.data.size, 8);
  assert.equal(store.data.games[8], undefined);
  assert.deepEqual(store.data.games[10], validGame);
  assert.deepEqual(store.history(8), []);
  const broken = createStore(() => ({ getItem: () => '{bad JSON', setItem() {} }));
  assert.equal(broken.data.size, 8);
  assert.equal(broken.persist(), true);
});

test('blocked or full localStorage does not interrupt play and reports failure', () => {
  for (const getStorage of [
    () => { throw new Error('blocked'); },
    () => ({ getItem: () => null, setItem: () => { throw new Error('quota'); } }),
  ]) {
    const store = createStore(getStorage);
    const session = createSession(store);
    session.enter(8);
    session.select(0);
    assert.ok(session.place(0, 0));
    assert.equal(store.available, false);
    assert.ok(session.model.state.score > 0);
  }
});

test('selection toggles while dragging-style selection keeps the chosen piece', () => {
  const session = createSession(createStore(() => memoryStorage()));
  session.enter(8);
  session.select(1, true);
  assert.equal(session.model.selected, 1);
  session.select(1);
  assert.equal(session.model.selected, 1);
  session.select(1, true);
  assert.equal(session.model.selected, -1);
});
