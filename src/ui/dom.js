export const $ = selector => document.querySelector(selector);
export const $$ = selector => [...document.querySelectorAll(selector)];
export const blockColor = number => `var(--c${number})`;
export const formatNumber = number => number.toLocaleString('fr-FR');
export const formatDate = date => Number.isNaN(Date.parse(date)) ? '' : new Date(date).toLocaleDateString('fr-FR');

export function setPressed(button, value) {
  button.setAttribute('aria-pressed', String(Boolean(value)));
}

export function setLabel(button, label) {
  button.setAttribute('aria-label', label);
  button.title = label;
}
