import {catalogue} from '../lib/catalogue.js';
import {t, recordName} from '../lib/i18n.js';
import {$, $$, esc} from '../lib/dom.js';
import {structureCardHTML} from '../components/structure-card.js';

export const libraryCategories = [
  ['molecules', ['Molecules', '분자']],
  ['precursors', ['Precursors', '전구체']],
  ['scaffolds', ['Scaffolds & rings', '골격과 고리']],
  ['motifs', ['Functional motifs', '작용기와 모티프']],
  ['reactions', ['Enzyme reactions', '효소 반응']]
];
const state = {tab: 'molecules', query: '', family: 'all'};

export function filterLibrary(records, query = '', family = 'all') {
  const needle = query.trim().normalize('NFKC').toLowerCase();
  return records.filter(record => (family === 'all' || record.family === family) &&
    (!needle || [
      record.id, record.name, record.title, record.ko, record.query, record.MolecularFormula,
      record.CID, record.category, record.left, record.right, ...(record.aliases || [])
    ].filter(value => value !== undefined && value !== null).join(' ').normalize('NFKC').toLowerCase().includes(needle)));
}

export function renderLibrary(root, ctx) {
  root.innerHTML = '<div class="eyebrow">' + t('THE COLLECTION', '구조 모음') +
    '</div><div class="page-heading"><h1>' + t('A world of structures.', '구조로 살펴보는 테르펜.') +
    '</h1><p>' + t('Explore the skeleton, the motif and the chemistry behind each record.',
      '각 구조의 골격과 작용기, 그리고 관련 반응을 살펴보세요.') + '</p></div>' +
    '<div class="view-tabs library-tabs" role="group" aria-label="' + t('Library categories', '라이브러리 종류') + '">' +
    libraryCategories.map(([id, label]) => '<button data-library-tab="' + id + '" class="' +
      (state.tab === id ? 'active' : '') + '" aria-pressed="' + (state.tab === id) + '">' +
      t(...label) + ' <small>' + catalogue[id].length + '</small></button>').join('') +
    '</div><div class="library-toolbar"><input class="search" id="library-search" type="search" value="' +
    esc(state.query) + '" aria-label="' + t('Search structures and reactions', '구조와 반응 검색') +
    '" placeholder="' + t('Search a name, formula or CID…', '이름, 분자식, CID 검색…') + '">' +
    (['molecules', 'precursors'].includes(state.tab) ? '<select id="library-family" aria-label="' +
      t('Filter by family', '계열로 필터') + '"><option value="all">' + t('All families', '모든 계열') +
      '</option>' + Object.entries(catalogue.families).map(([id, family]) => '<option value="' +
        id + '" ' + (state.family === id ? 'selected' : '') + '>' + esc(t(family.name, family.ko)) +
        '</option>').join('') + '</select>' : '') +
    '<button class="secondary" id="library-clear">' + t('Clear filters', '필터 초기화') +
    '</button><button class="secondary" id="library-compare">' + t('Compare structures', '구조 비교') +
    '</button></div><div class="progress-summary" id="library-count" role="status"></div>' +
    '<div class="library-grid" id="library-grid"></div>';
  function draw() {
    const family = ['molecules', 'precursors'].includes(state.tab) ? state.family : 'all';
    const records = filterLibrary(catalogue[state.tab], state.query, family);
    $('#library-count', root).textContent = records.length + ' / ' + catalogue[state.tab].length + ' ' +
      t('records', '항목');
    $('#library-grid', root).innerHTML = records.length ?
      records.map(record => structureCardHTML(record, state.tab)).join('') :
      '<div class="empty">' + t('No matching records. Try another name or clear the filters.',
        '일치하는 항목이 없습니다. 다른 이름을 검색하거나 필터를 초기화해 보세요.') + '</div>';
    $$('[data-detail]', root).forEach(button => button.onclick = () =>
      ctx.openRecord(records.find(record => record.id === button.dataset.detail)));
  }
  $$('[data-library-tab]', root).forEach(button => button.onclick = () => {
    state.tab = button.dataset.libraryTab;
    state.family = 'all';
    renderLibrary(root, ctx);
    $('[data-library-tab="' + state.tab + '"]', root).focus();
  });
  $('#library-search', root).oninput = event => { state.query = event.target.value; draw(); };
  if ($('#library-family', root)) $('#library-family', root).onchange = event => {
    state.family = event.target.value; draw();
  };
  $('#library-clear', root).onclick = () => {
    state.query = ''; state.family = 'all'; renderLibrary(root, ctx); $('#library-search', root).focus();
  };
  $('#library-compare', root).onclick = () => ctx.goCompare();
  draw();
}
