import { createStore } from './services/storage.js';
import { createAudio } from './services/audio.js';
import { createSession } from './session.js';
import { createView } from './ui/view.js';
import { createDialogs } from './ui/dialogs.js';
import { bindControls } from './ui/controls.js';
import { initializeTheme } from './ui/theme.js';
import { messages } from './ui/messages.js';

const store = createStore();
const session = createSession(store);
const { model } = session;
const view = createView(model, store);
const playTone = createAudio();
const toggleTheme = initializeTheme(store);
const dialogs = createDialogs(model, store, restart, rewind);

function enter(size, announce = true) {
  session.enter(size);
  view.render();
  if (announce) view.say(messages.sizeChanged(size));
  if (model.state.over) dialogs.end();
}

function select(index, toggle = false) {
  if (!session.select(index, toggle)) return;
  view.render();
  view.say(model.selected < 0 ? messages.deselected : messages.selected);
}

function place(row, column) {
  if (model.selected < 0) { view.say(messages.selectFirst); return; }
  const result = session.place(row, column);
  if (!result) { view.say(messages.invalidPlacement); return; }
  view.render();
  playTone(store.data.sound, result.count > 0);
  view.say(messages.placed(result));
  view.celebrate(result);
  if (model.state.over) dialogs.end();
}

function rotate(direction = 1) {
  const all = model.selected < 0;
  session.rotate(direction);
  view.render();
  view.say(messages.rotation(all, direction));
}

function restart() {
  session.restart();
  dialogs.close();
  view.render();
  view.say(messages.restarted);
}

function rewind() {
  if (!session.rewind()) return;
  dialogs.close();
  view.render();
  view.say(messages.rewound);
}

bindControls(model, view, dialogs, {
  enter, select, place, rotate, rewind,
  deselect() { session.deselect(); view.render(); },
  toggleTheme() { toggleTheme(); view.updateSaveStatus(); },
  toggleSound() {
    store.data.sound = !store.data.sound;
    store.persist();
    view.render();
    playTone(store.data.sound);
  },
});
enter(store.data.size, false);
