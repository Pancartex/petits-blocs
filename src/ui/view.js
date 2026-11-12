import { fits } from '../core/geometry.js';
import { $, $$, blockColor, formatNumber, setPressed, setLabel } from './dom.js';
import { messages } from './messages.js';

export function createView(model, store) {
  const board = $('#board');
  const tray = $('#tray');

  function renderBoard() {
    const { state, cursor } = model;
    board.style.setProperty('--size', state.size);
    board.setAttribute('aria-label', `Grille de ${state.size} sur ${state.size}. Déplace-toi avec les flèches ; Entrée place le bloc sélectionné.`);
    const fragment = document.createDocumentFragment();
    state.board.forEach((row, r) => row.forEach((color, c) => {
      const cell = document.createElement('button');
      cell.className = color ? 'cell filled' : 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.style.setProperty('--block', blockColor(color));
      cell.tabIndex = r === cursor[0] && c === cursor[1] ? 0 : -1;
      cell.setAttribute('aria-label', `Ligne ${r + 1}, colonne ${c + 1}, ${color ? 'occupée' : 'vide'}`);
      fragment.append(cell);
    }));
    board.replaceChildren(fragment);
  }

  function renderTray() {
    const fragment = document.createDocumentFragment();
    model.state.tray.forEach((piece, index) => {
      const button = document.createElement('button');
      button.className = `piece${piece ? '' : ' used'}${model.selected === index ? ' selected' : ''}`;
      button.dataset.index = index;
      button.disabled = !piece || model.state.over;
      setPressed(button, model.selected === index);
      if (piece) {
        const height = Math.max(...piece.cells.map(([r]) => r)) + 1;
        const width = Math.max(...piece.cells.map(([, c]) => c)) + 1;
        button.setAttribute('aria-label', `Bloc ${index + 1}, ${piece.cells.length} cases, ${width} de large sur ${height} de haut. Sélectionne-le, puis place-le ou tourne-le.`);
        const grid = document.createElement('span');
        grid.className = 'mini-grid';
        grid.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
        const occupied = new Set(piece.cells.map(cell => cell.join(',')));
        for (let r = 0; r < height; r++) {
          for (let c = 0; c < width; c++) {
            const cell = document.createElement('span');
            cell.className = `mini-cell${occupied.has(`${r},${c}`) ? '' : ' blank'}`;
            cell.style.setProperty('--block', blockColor(piece.color));
            grid.append(cell);
          }
        }
        button.append(grid);
      } else {
        button.setAttribute('aria-label', `Bloc ${index + 1} placé`);
      }
      fragment.append(button);
    });
    tray.replaceChildren(fragment);
  }

  function preview() {
    const { state, hover, selected } = model;
    for (const cell of board.children) {
      cell.classList.remove('preview', 'invalid');
      cell.style.setProperty('--block', blockColor(state.board[Number(cell.dataset.r)][Number(cell.dataset.c)]));
    }
    const piece = state.tray[selected];
    if (!hover || !piece) return;
    const valid = fits(state.board, piece.cells, ...hover);
    piece.cells.forEach(([dr, dc]) => {
      const r = hover[0] + dr;
      const c = hover[1] + dc;
      if (r < 0 || c < 0 || r >= state.size || c >= state.size) return;
      const cell = board.children[r * state.size + c];
      cell.style.setProperty('--block', blockColor(piece.color));
      cell.classList.add(valid ? 'preview' : 'invalid');
    });
  }

  function updateSaveStatus() {
    $('#save-label').textContent = store.available ? messages.saved : messages.savingUnavailable;
  }

  function render() {
    renderBoard();
    renderTray();
    const { state, selected } = model;
    $('#score').textContent = formatNumber(state.score);
    $('#best').textContent = formatNumber(store.best(state));
    $('#lines').textContent = formatNumber(state.lines);
    $('#combo').textContent = state.combo > 1 ? `${state.combo} coups gagnants de suite ♡` : 'Prends ton temps';
    const label = selected < 0 ? 'Tourner les trois pièces de 90 degrés vers la droite' : 'Tourner la pièce sélectionnée de 90 degrés vers la droite';
    setLabel($('#rotate'), label);
    $('#rotate').title = `${label} (R)`;
    $('#rotate span').textContent = selected < 0 ? 'Tout tourner 90°' : 'Tourner 90°';
    setPressed($('#sound'), store.data.sound);
    setLabel($('#sound'), store.data.sound ? 'Couper le son' : 'Activer le son');
    $$('[data-size]').forEach(button => setPressed(button, Number(button.dataset.size) === state.size));
    updateSaveStatus();
    preview();
  }

  function focusCursor() {
    for (const cell of board.children) cell.tabIndex = -1;
    const cell = board.children[model.cursor[0] * model.state.size + model.cursor[1]];
    cell.tabIndex = 0;
    cell.focus({ preventScroll: true });
  }

  function celebrate(result) {
    result.cleared.forEach(([r, c]) => board.children[r * model.state.size + c].classList.add('flash'));
    if (!result.count) return;
    const element = $('#celebration');
    element.textContent = result.count > 1 ? 'Bien joué !' : 'Un peu de place pour la suite';
    element.classList.remove('show');
    void element.offsetWidth;
    element.classList.add('show');
  }

  return { board, tray, render, preview, focusCursor, celebrate, updateSaveStatus,
    say: text => { $('#status').textContent = text; } };
}
