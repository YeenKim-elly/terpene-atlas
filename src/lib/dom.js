export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
export const esc = value => String(value ?? '').replace(
  /[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character])
);
export const formulaHTML = value => esc(value).replace(/(\d+)/g, '<sub>$1</sub>');

export function reactionHTML(reaction) {
  return '<div class="reaction"><div class="reactant">' + esc(reaction.left) +
    '</div><div class="reaction-arrow"><small>' + esc(reaction.cofactor).replace(/\n/g, '<br>') +
    '</small>→</div><div class="reactant">' + esc(reaction.right) + '</div></div>';
}

export function toast(message) {
  $('.toast')?.remove();
  const element = document.createElement('div');
  element.className = 'toast';
  element.setAttribute('role', 'status');
  element.textContent = message;
  document.body.append(element);
  setTimeout(() => element.remove(), 4000);
}
