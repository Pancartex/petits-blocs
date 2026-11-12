import { $, setLabel, setPressed } from './dom.js';

export function initializeTheme(store) {
  if (!['light', 'dark'].includes(store.data.theme)) {
    store.data.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply() {
    const dark = store.data.theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    setPressed($('#theme'), dark);
    setLabel($('#theme'), dark ? 'Activer le mode clair' : 'Activer le mode sombre');
    $('#theme').textContent = dark ? '☀' : '☾';
    $('meta[name="theme-color"]').content = dark ? '#18211e' : '#f6f3ec';
  }

  apply();
  return function toggle() {
    store.data.theme = store.data.theme === 'dark' ? 'light' : 'dark';
    apply();
    store.persist();
  };
}
