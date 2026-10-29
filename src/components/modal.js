import {catalogue} from '../lib/catalogue.js';
import {esc, formulaHTML, reactionHTML} from '../lib/dom.js';
import {t, recordName, recordNote} from '../lib/i18n.js';
import {questionKindForRecord} from '../lib/quiz.js';
import {icon as I} from './icons.js';

let returnFocus = null;
export function closeModal() {
  const dialog = document.querySelector('#detail-modal');
  if (!dialog) return;
  dialog.remove();
  document.body.style.overflow = '';
  if (returnFocus?.isConnected) returnFocus.focus({preventScroll: true});
  returnFocus = null;
}

export function provenanceHTML(record) {
  if (record.structureScope === 'relative-pairs-only') {
    return esc(t(
      'Partial relative model: C5/C10 and C8/C9 relationships are specified independently. Absolute configuration, inter-pair relationships and side-chain C13 E/Z remain unassigned.',
      '부분적인 상대입체배열 모형입니다. C5/C10과 C8/C9 관계는 독립적으로 지정하며 절대 입체배열, 두 쌍 사이의 관계, 곁사슬 C13 E/Z는 미정입니다.'
    ));
  }
  if (record.structureScope === 'primary-figure') {
    const figure = record.sourceFigure;
    return esc(t('Primary Figure ', '원 논문 Figure ')) + esc(figure.figure) + ', ' +
      esc(t('compound ', '화합물 ')) + esc(figure.compound) + '. ' + esc(figure.attribution) + ' ' +
      '<a href="' + esc(figure.licenceUrl) + '" target="_blank" rel="noopener noreferrer">' +
      esc(figure.licence) + '</a> · <a href="' + esc(figure.localPdf || figure.publisherPdf) +
      '" target="_blank" rel="noopener noreferrer">' + t('Source PDF', '원문 PDF') + '</a>';
  }
  if (record.CID) return esc(t(
    'Selected PubChem record, CID ' + record.CID + '. Stereochemistry is displayed where specified; read the record-specific qualifications.',
    '선택한 PubChem 기록의 CID는 ' + record.CID + '입니다. 지정된 입체배열만 표시하며, 항목별 주의사항을 함께 확인하세요.'
  ));
  return esc(t(
    'A labelled structural or connectivity model. It does not independently establish a biosynthetic conversion.',
    '구조 또는 결합 관계를 설명하는 모형이며, 그 자체로 생합성 전환을 입증하지 않습니다.'
  ));
}

export function openRecord(record, {startPractice} = {}) {
  closeModal();
  returnFocus = document.activeElement;
  const kind = questionKindForRecord(record);
  const family = catalogue.families[record.family];
  const wrapper = document.createElement('div');
  wrapper.id = 'detail-modal';
  wrapper.className = 'modal-backdrop';
  wrapper.innerHTML = '<section class="modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">' +
    '<button class="close" aria-label="' + t('Close details', '상세 정보 닫기') + '">' + I('close') + '</button>' +
    '<div class="eyebrow">' + t('A CLOSER LOOK', '조금 더 자세히') + '</div>' +
    '<h2 id="detail-title">' + esc(recordName(record)) + '</h2>' +
    (record.enzyme ? reactionHTML(record) : '<img src="' + esc(record.image) + '" alt="' +
      esc(recordName(record)) + ' ' + t('chemical structure', '화학 구조') + '">') +
    (record.id === 'crispene-d' ? '<p class="source-figure-target">' +
      t('Compound 4 (R=H) in the shared drawing', '공유된 그림의 화합물 4(R=H)') + '</p>' : '') +
    '<div class="facts">' + (family ? '<span class="tag">' + esc(t(family.name, family.ko)) + '</span>' : '') +
    (record.MolecularFormula ? '<span class="tag">' + formulaHTML(record.MolecularFormula) + '</span>' : '') +
    (record.skeleton ? '<span class="tag">' + t('Parent skeleton', '모체 골격') + ': C' + record.skeleton + '</span>' : '') +
    '</div><p>' + esc(recordNote(record)) + '</p><p class="notice">' +
    (record.enzyme ? esc(t(
      'A simplified teaching scheme. Enzyme function and substrate specificity require the cited reaction evidence.',
      '단순화한 학습 반응식입니다. 효소 기능과 기질 특이성은 인용된 반응 근거를 확인하세요.'
    )) : provenanceHTML(record)) + '</p>' +
    (record.source ? '<a href="' + esc(record.source) + '" target="_blank" rel="noopener noreferrer">' +
      t('Supporting source', '관련 출처') + ' ↗</a>' : '') +
    (kind && startPractice ? '<div class="detail-practice"><p>' + t('Practise this card', '이 카드로 연습하기') +
      '</p><div class="practice-buttons"><button class="secondary" data-detail-practice="choice">' +
      t('Choose an answer', '정답 선택') + '</button><button class="secondary" data-detail-practice="typing">' +
      t('Type from memory', '기억해서 입력') + '</button></div></div>' : '') + '</section>';
  document.body.append(wrapper);
  document.body.style.overflow = 'hidden';
  wrapper.querySelector('.close').onclick = closeModal;
  wrapper.onclick = event => { if (event.target === wrapper) closeModal(); };
  wrapper.querySelectorAll('[data-detail-practice]').forEach(button => button.onclick = () => {
    const style = button.dataset.detailPractice;
    closeModal();
    startPractice(kind, record, style);
  });
  wrapper.querySelector('.close').focus({preventScroll: true});
}

document.addEventListener('keydown', event => {
  const dialog = document.querySelector('#detail-modal');
  if (!dialog) return;
  if (event.key === 'Escape') { closeModal(); return; }
  if (event.key !== 'Tab') return;
  const controls = Array.from(dialog.querySelectorAll('button:not(:disabled),a[href],input,select'));
  const first = controls[0], last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
