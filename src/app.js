import {loadCatalogue, catalogue} from './lib/catalogue.js';
import {getLanguage, setLanguage, t} from './lib/i18n.js';
import {shellHTML, navigation} from './components/shell.js';
import {openRecord, closeModal} from './components/modal.js';
import {renderLibrary} from './pages/library.js';
import {renderPractice, resetPractice, startSinglePractice, startComparisonPractice, handlePracticeKey} from './pages/practice.js';
import {renderStructureWeb, disposeStructureWeb, selectStructureGraph} from './pages/structure-web.js';
import {renderStructureComparison, selectComparison} from './pages/comparison.js';
import {renderSources} from './pages/sources.js';

const app = document.querySelector('#app');
const allowedViews = new Set(navigation.map(([id]) => id));
let view = 'practice', ready = false;
const route = () => {
  const id = location.hash.slice(1);
  return allowedViews.has(id) ? id : 'practice';
};

function navigate(next) {
  if (!allowedViews.has(next)) return;
  if (view === 'practice' && next !== 'practice') resetPractice();
  closeModal();
  view = next;
  history.pushState(null, '', '#' + view);
  render();
  document.querySelector('#main').focus({preventScroll: true});
  window.scrollTo({top: 0});
}
function practiseRecord(kind, record, style) {
  startSinglePractice(kind, record, style);
  navigate('practice');
}
const detail = record => openRecord(record, {startPractice: practiseRecord});
function render() {
  disposeStructureWeb();
  document.documentElement.lang = getLanguage();
  document.title = 'Terpene Atlas · ' + t(...navigation.find(([id]) => id === view)[2]);
  app.innerHTML = shellHTML(view);
  const root = document.querySelector('#page-root');
  if (view === 'practice') renderPractice(root, {openRecord: detail});
  else if (view === 'library') renderLibrary(root, {openRecord: detail, goMap: id => { selectStructureGraph(id); navigate('web'); }, goCompare: id => {
    if (id) selectComparison(id);
    navigate('compare');
  }});
  else if (view === 'web') renderStructureWeb(root, {
    molecules: [...catalogue.molecules, ...catalogue.precursors],
    scaffolds: catalogue.scaffolds, webNotes: catalogue.graphNotes, lang: getLanguage(), open: detail,
    openCompare: id => { selectComparison(id); navigate('compare'); }
  });
  else if (view === 'compare') renderStructureComparison(root, {
    molecules: [...catalogue.molecules, ...catalogue.precursors], lang: getLanguage(),
    openRecord: id => {
      const record = [...catalogue.molecules, ...catalogue.precursors, ...catalogue.comparisonStructures].find(item => item.id === id);
      if (record) detail(record);
    },
    back: () => navigate('library'),
    startPractice: (style, pairId) => { startComparisonPractice(style, pairId); navigate('practice'); }
  });
  else renderSources(root);
  app.querySelectorAll('[data-nav]').forEach(button => button.onclick = event => {
    event.preventDefault(); navigate(button.dataset.nav);
  });
  app.querySelectorAll('[data-lang]').forEach(button => button.onclick = () => {
    closeModal(); setLanguage(button.dataset.lang); render();
  });
}
window.addEventListener('hashchange', () => {
  if (!ready || route() === view) return;
  if (view === 'practice') resetPractice();
  closeModal(); view = route(); render(); window.scrollTo({top: 0});
});
document.addEventListener('keydown', handlePracticeKey);

async function init() {
  try {
    await loadCatalogue();
    ready = true; view = route(); render();
  } catch (error) {
    console.error('Atlas startup:', error.message);
    app.innerHTML = '<main class="error-screen"><h1>' + t('Could not open the atlas.', '도감을 열지 못했습니다.') +
      '</h1><p>' + t('Serve the repository with npm start, then reload this page.',
        'npm start로 서버를 실행한 뒤 페이지를 새로 고침하세요.') +
      '</p><button class="secondary" id="retry">' + t('Reload', '새로 고침') + '</button></main>';
    document.querySelector('#retry').onclick = () => location.reload();
  }
}
export const appReady = init();
