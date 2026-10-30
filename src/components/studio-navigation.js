let navigationOpen = typeof window !== 'undefined' && Boolean(window.matchMedia?.('(min-width: 1100px)').matches);
let escapeBound = false;
export const isStudioNavigationOpen = () => navigationOpen;
function updateNavigation(returnFocus = false) {
  const shell = document.querySelector('.studio-shell');
  const sidebar = document.querySelector('#atlas-navigation');
  const toggle = document.querySelector('#atlas-nav-toggle');
  const scrim = document.querySelector('#atlas-nav-close');
  if (!shell || !sidebar || !toggle) return;
  shell.classList.toggle('nav-collapsed', !navigationOpen);
  sidebar.inert = !navigationOpen;
  if (navigationOpen) sidebar.removeAttribute('aria-hidden');
  else sidebar.setAttribute('aria-hidden','true');
  toggle.setAttribute('aria-expanded', String(navigationOpen));
  toggle.setAttribute('aria-label', navigationOpen ? toggle.dataset.closeLabel : toggle.dataset.openLabel);
  if (scrim) scrim.hidden = !navigationOpen;
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 1099px)').matches;
  const workspace = document.querySelector('.app-content');
  if (workspace) workspace.inert = navigationOpen && mobile;
  if (navigationOpen && mobile) {
    sidebar.setAttribute('role','dialog');
    sidebar.setAttribute('aria-modal','true');
  } else {
    sidebar.removeAttribute('role');
    sidebar.removeAttribute('aria-modal');
  }
  if (returnFocus) toggle.focus({preventScroll:true});
}

export function closeStudioNavigation() {
  navigationOpen = false;
  updateNavigation();
}

export function bindStudioShell() {
  const toggle = document.querySelector('#atlas-nav-toggle');
  if (toggle) toggle.onclick = () => {
    navigationOpen = !navigationOpen;
    updateNavigation();
    if (navigationOpen && window.matchMedia('(max-width: 1099px)').matches) document.querySelector('#atlas-navigation [data-nav]')?.focus({preventScroll:true});
  };
  const scrim = document.querySelector('#atlas-nav-close');
  if (scrim) scrim.onclick = () => { navigationOpen = false; updateNavigation(true); };
  const dismiss = document.querySelector('#atlas-nav-dismiss');
  if (dismiss) dismiss.onclick = () => { navigationOpen = false; updateNavigation(true); };
  updateNavigation();
  if (!escapeBound) {
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && navigationOpen) {
        navigationOpen = false;
        updateNavigation(true);
      }
      if (event.key === 'Tab' && navigationOpen && window.matchMedia('(max-width: 1099px)').matches) {
        const links = [...document.querySelectorAll('#atlas-navigation a[href],#atlas-navigation button:not([disabled])')];
        const first = links[0], last = links[links.length-1];
        if (!first) return;
        if (event.shiftKey && (document.activeElement === first || !links.includes(document.activeElement))) {event.preventDefault();last.focus();}
        else if (!event.shiftKey && (document.activeElement === last || !links.includes(document.activeElement))) {event.preventDefault();first.focus();}
      }
    });
    if (typeof window !== 'undefined') window.matchMedia('(max-width: 1099px)').addEventListener?.('change',()=>updateNavigation());
    escapeBound = true;
  }
}
