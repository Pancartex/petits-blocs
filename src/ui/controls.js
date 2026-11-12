import { $, $$ } from './dom.js';

export function bindControls(model, view, dialogs, actions) {
  const { board, tray } = view;
  let drag = null;
  let suppressClick = false;

  function atPoint(x, y) {
    const rect = board.getBoundingClientRect();
    const style = getComputedStyle(board);
    const border = parseFloat(style.borderLeftWidth);
    const gap = parseFloat(style.gap);
    const step = (rect.width - 2 * border + gap) / model.state.size;
    return [Math.floor((y - rect.top - border) / step), Math.floor((x - rect.left - border) / step)];
  }

  function clearHover() {
    model.hover = null;
    view.preview();
  }

  $('#restart').onclick = dialogs.confirmRestart;
  $('#rewind').onclick = actions.rewind;
  $('#help').onclick = dialogs.help;
  $('#scores').onclick = dialogs.scores;
  $('#rotate').onclick = () => actions.rotate();
  $('#theme').onclick = actions.toggleTheme;
  $('#sound').onclick = actions.toggleSound;
  $$('[data-size]').forEach(button => {
    button.onclick = () => {
      const size = Number(button.dataset.size);
      if (size !== model.state.size) actions.enter(size);
    };
  });

  // Pointer input is handled on release; synthetic keyboard clicks use click.
  tray.addEventListener('click', event => {
    if (event.detail > 0 || suppressClick) return;
    const button = event.target.closest('[data-index]');
    if (button) actions.select(Number(button.dataset.index), true);
  });
  tray.addEventListener('pointerdown', event => {
    const button = event.target.closest('[data-index]');
    if (!button || button.disabled || event.button !== 0) return;
    tray.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, index: Number(button.dataset.index), x: event.clientX, y: event.clientY, moved: false };
  });
  document.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 7) {
      drag.moved = true;
      actions.select(drag.index);
    }
    if (drag.moved) {
      model.hover = atPoint(event.clientX, event.clientY);
      view.preview();
    }
  });
  document.addEventListener('pointerup', event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (drag.moved) {
      suppressClick = true;
      const [r, c] = atPoint(event.clientX, event.clientY);
      if (r >= 0 && c >= 0 && r < model.state.size && c < model.state.size) actions.place(r, c);
      clearHover();
      setTimeout(() => { suppressClick = false; }, 0);
    } else {
      actions.select(drag.index, true);
    }
    drag = null;
  });
  document.addEventListener('pointercancel', () => { drag = null; clearHover(); });

  board.addEventListener('click', event => {
    if (suppressClick) return;
    const cell = event.target.closest('.cell');
    if (!cell) return;
    model.cursor = [Number(cell.dataset.r), Number(cell.dataset.c)];
    actions.place(...model.cursor);
  });
  board.addEventListener('pointermove', event => {
    if (drag) return;
    model.hover = atPoint(event.clientX, event.clientY);
    view.preview();
  });
  board.addEventListener('pointerleave', () => { if (!drag) clearHover(); });

  const arrows = { ArrowDown: [1, 0], ArrowUp: [-1, 0], ArrowRight: [0, 1], ArrowLeft: [0, -1] };
  document.addEventListener('keydown', event => {
    if (dialogs.open) return;
    if (['1', '2', '3'].includes(event.key)) { actions.select(Number(event.key) - 1); return; }
    if (event.key.toLowerCase() === 'r') {
      event.preventDefault();
      if (!event.repeat) actions.rotate();
      return;
    }
    if (event.key === 'Escape') { actions.deselect(); return; }
    if (arrows[event.key]) {
      event.preventDefault();
      model.cursor = model.cursor.map((value, axis) =>
        Math.max(0, Math.min(model.state.size - 1, value + arrows[event.key][axis])));
      view.focusCursor();
      model.hover = [...model.cursor];
      view.preview();
    }
    if (['Enter', ' '].includes(event.key) && board.contains(document.activeElement)) {
      event.preventDefault();
      actions.place(...model.cursor);
      view.focusCursor();
    }
  });

  document.addEventListener('wheel', event => {
    if (dialogs.open || model.selected < 0 || model.state.over || event.ctrlKey || !event.deltaY) return;
    event.preventDefault();
    actions.rotate(event.deltaY < 0 ? -1 : 1);
  }, { passive: false });
}
