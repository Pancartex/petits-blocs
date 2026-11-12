import { $, formatNumber, formatDate } from './dom.js';
import { helpHTML } from './messages.js';

export function createDialogs(model, store, restart, rewind) {
  const dialog = $('#dialog');

  function open(html) {
    $('#dialog-content').innerHTML = html;
    if (!dialog.open) dialog.showModal();
  }

  function end() {
    const state = model.state;
    open(`<span class="eyebrow">UNE JOLIE PETITE PARTIE</span>
      <h2>Chaque bloc a eu son moment.</h2>
      <div class="big-score">${formatNumber(state.score)}</div>
      <p>${state.lines} lignes effacées sur la grille ${state.size} × ${state.size}.
      Aucun bloc restant ne peut être placé, même en le tournant.
      Ton score est conservé ${store.available ? 'sur cet appareil' : 'uniquement pour cette visite'}.</p>
      <button class="primary" id="again">Encore une petite partie</button>
      ${state.rewind ? '<button class="secondary" id="undo-end">Annuler le dernier coup</button>' : ''}`);
    $('#again').onclick = restart;
    if (state.rewind) $('#undo-end').onclick = rewind;
  }

  function confirmRestart() {
    if (!model.state.moves) { restart(); return; }
    open(`<h2>Une nouvelle petite partie ?</h2>
      <p>Ton score actuel sera conservé parmi tes meilleurs moments. Cette grille sera remplacée.</p>
      <button class="primary" id="confirm-new">Recommencer</button>
      <button class="secondary" id="keep">Continuer</button>`);
    $('#confirm-new').onclick = restart;
    $('#keep').onclick = () => dialog.close();
  }

  function scores() {
    const { state } = model;
    const entries = store.history(state.size);
    const list = entries.length ? `<ol class="score-list">${entries.map((entry, index) => `
      <li><span>${index + 1}. <b>${formatNumber(entry.score)}</b> points</span>
      <small>${entry.lines} lignes · ${formatDate(entry.date)}</small></li>`).join('')}</ol>`
      : '<p>Tes parties terminées apparaîtront ici. Une petite aventure t’attend.</p>';
    open(`<span class="eyebrow">GRILLE ${state.size} × ${state.size}</span>
      <h2>Tes meilleurs moments</h2><p>Ton record : <b>${formatNumber(store.best(state))}</b></p>
      ${list}<p>Tes 10 meilleurs scores de parties terminées ou recommencées, sauvegardés sur cet appareil.
      Change la taille de la grille pour voir ses scores.</p>`);
  }

  $('#close-dialog').onclick = () => dialog.close();
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      dialog.close();
    }
  });

  return { end, confirmRestart, scores, help: () => open(helpHTML),
    close: () => dialog.close(), get open() { return dialog.open; } };
}
