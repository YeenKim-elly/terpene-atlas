import {renderGeraniolXray,bindGeraniolXray} from '../components/geraniol-xray.js';
import {renderStudioModeCard} from '../components/studio-practice.js';
import {catalogue} from '../lib/catalogue.js';
import {t, getLanguage, recordName, recordNote} from '../lib/i18n.js';
import {$, $$, esc, formulaHTML, reactionHTML, toast} from '../lib/dom.js';
import {icon as I} from '../components/icons.js';
import {comparisonQuestionFigure} from './comparison.js';
import {createQuestion, questionPool, allQuestions, choiceOptions, answerMatches, shuffle} from '../lib/quiz.js';
import {readProgress, recordAnswer, finishSession} from '../lib/progress.js';

const settings = {
  kind: 'family', style: 'choice', families: ['mono', 'sesqui', 'di', 'tri', 'tetra', 'apo'],
  motifs: null, enzymes: null, challenge: false, count: 10
};
let expandedKind = null;
let progress = null, session = null, currentRoot = null, context = null;

const kinds = () => [
  ['family', 'skeleton', t('Know the family', '골격 계열 익히기'),
   t('Recognise the isoprene-derived parent skeleton.', 'Isoprene 유래 모체 골격을 알아보세요.'), catalogue.molecules.length],
  ['precursor', 'hex', t('Know the precursors', '전구체 익히기'),
   t('From C5 building blocks to stereochemically defined diphosphates.', 'C5 구성 단위부터 입체배열이 지정된 diphosphate까지.'), catalogue.precursors.length],
  ['motif', 'motif', t('Spot the motif', '작용기 찾기'),
   t('Read the highlighted structural feature.', '강조된 부분의 구조적 특징을 읽어보세요.'), catalogue.motifs.length],
  ['enzyme', 'enzyme', t('Think like an enzyme', '효소 반응 익히기'),
   t('Connect a transformation with its enzyme group.', '반응 변화와 효소 종류를 연결해 보세요.'), catalogue.reactions.length],
  ['scaffold', 'skeleton', t('Scaffolds & rings', '골격과 고리'),
   t('Distinguish ring systems and relative models.', '고리 구조와 상대입체배열 모형을 구분하세요.'), catalogue.scaffolds.length],
  ['comparison', 'learn', t('See the difference', '구조 차이 읽기'),
   t('Compare aligned structures and explain what changes.', '정렬된 구조를 비교하고 차이를 설명하세요.'), catalogue.comparisonQuestions.length]
];

export function resetPractice() { session = null; currentRoot = null; expandedKind = null; }
export function startSinglePractice(kind, item, style) {
  startQuestions([createQuestion(kind, item)], style);
}
export function startComparisonPractice(style, pairId) {
  const questions = pairId ? catalogue.comparisonQuestions.filter(q => q.figure?.comparePair === pairId) : catalogue.comparisonQuestions;
  startQuestions(shuffle(questions).map(item => createQuestion('comparison', item)), style);
}
function startQuestions(questions, style = settings.style) {
  if (!questions.length) return;
  session = {
    questions: questions.map(question => ({...question, displayOptions: choiceOptions(question)})),
    style, index: 0, results: [], hinted: false, answered: false, done: false
  };
}
export function renderPractice(root, ctx) {
  currentRoot = root; context = ctx;
  progress ||= readProgress();
  settings.motifs ||= catalogue.motifs.map(item => item.id);
  settings.enzymes ||= Object.keys(catalogue.enzymes);
  redraw();
}
const redraw = () => { if (session) session.done ? renderSummary() : renderQuestion(); else renderSetup(); };
const weakQuestions = () => allQuestions().filter(question => progress.items[question.uid]?.weak);
function startWeak() {
  const questions = weakQuestions();
  if (!questions.length) {
    toast(t('Your review collection is empty. Start a session first.', '복습할 카드가 없습니다. 먼저 연습을 시작하세요.'));
    return;
  }
  startQuestions(shuffle(questions).slice(0, 20)); redraw();
}
function chip(id, label, selected, type) {
  return '<button class="chip ' + (selected ? 'active' : '') + '" data-filter="' + type +
    '" data-id="' + esc(id) + '" aria-pressed="' + selected + '">' + esc(label) + '</button>';
}
function renderSetup() {
  const root = currentRoot, pool = questionPool(settings);
  const mode = settings.kind === 'name' ? 'family' : settings.kind;
  const count = Math.min(settings.count, pool.length);
  let filters = '';
  if (['family','name'].includes(settings.kind)) {
    filters = '<div class="chip-row">' + Object.entries(catalogue.families).filter(([id])=>id!=='hemi')
      .map(([id,family])=>chip(id,family.short+' · '+(family.carbonLabel?t(family.carbonLabel,family.carbonLabelKo):'C'+family.carbon),settings.families.includes(id),'families')).join('') +
      '</div><p class="filter-note">'+t('Choose the skeleton families you want to recognise.','알아보고 싶은 골격 계열을 고르세요.')+'</p><label class="switch-row"><input id="challenge" type="checkbox" '+(settings.challenge?'checked':'')+'>'+t('Include decorated structures','당·acyl기가 부착된 구조 포함')+'</label><button class="inline-name-link" id="name-mode">'+(settings.kind==='name'?t('Switch to family recognition','골격 구분으로 돌아가기'):t('Try molecule-name typing →','분자 이름 타이핑 →'))+'</button>';
  } else if (settings.kind === 'motif') {
    filters = '<div class="chip-row">'+catalogue.motifs.map(item=>chip(item.id,recordName(item),settings.motifs.includes(item.id),'motifs')).join('')+'</div><p class="filter-note">'+t('Identify the highlighted group or local relationship. Some descriptions can coexist; follow the question prompt.','강조한 작용기나 국소 구조 관계를 구분하세요. 여러 설명이 동시에 맞을 수 있으므로 문제에서 묻는 기준을 따르세요.')+'</p>';
  } else if (settings.kind === 'enzyme') {
    filters = '<div class="chip-row">'+Object.entries(catalogue.enzymes).map(([id,enzyme])=>chip(id,t(enzyme.name,enzyme.ko),settings.enzymes.includes(id),'enzymes')).join('')+'</div>';
  } else {
    filters = '<p class="filter-note">'+(settings.kind==='precursor'?t('Identify the name or abbreviation. Keep stereochemical prefixes specific.','이름이나 약어를 구분하세요. 입체화학 접두어를 정확하게 유지하세요.'):settings.kind==='scaffold'?t('Name the parent skeleton, ring system or labelled relative model.','기본 골격, 고리 구조, 표시된 상대입체배열 모형의 이름을 쓰세요.'):t('Compare aligned structures and read the source-specific qualifications.','정렬된 구조를 비교하고 출처에 따른 해석 범위를 확인하세요.'))+'</p>';
  }
  const launchLabels={family:['Launch family practice','골격 계열 연습 시작'],name:['Launch name recall','분자 이름 연습 시작'],precursor:['Launch precursor practice','전구체 연습 시작'],motif:['Launch motif practice','모티프 연습 시작'],enzyme:['Launch reaction practice','효소 반응 연습 시작'],scaffold:['Launch scaffold practice','골격과 고리 연습 시작'],comparison:['Launch comparison practice','구조 비교 연습 시작']};
  const configuration=`<section class="configure inline-config" aria-labelledby="practice-curate-label"><div class="config-left"><h3 class="section-label" id="practice-curate-label"><span class="step-number">02</span>${t('Curate your session','나만의 문제 구성')}</h3>${filters}</div><div class="config-right"><div class="row-label">${t('PRACTICE STYLE','연습 방식')}</div><div class="segmented">${[['choice',t('Choose an answer','보기에서 선택')],['typing',t('Type from memory','직접 입력')]].map(([style,label])=>`<button data-style="${style}" class="${settings.style===style?'active':''}" aria-pressed="${settings.style===style}">${label}</button>`).join('')}</div><div class="row-label">${t('QUESTIONS','문제 수')}</div><div class="question-count">${[5,10,20].map(n=>`<button data-count="${n}" class="${settings.count===n?'active':''}" aria-pressed="${settings.count===n}">${n}</button>`).join('')}<span>${count} / ${pool.length}</span></div><p class="launch-summary" aria-live="polite">${count} ${t('cards','개 문제')} · ${t(settings.style==='typing'?'Type from memory':'Choose an answer',settings.style==='typing'?'직접 입력':'보기에서 선택')}</p><button class="primary start-button" id="start" ${pool.length?'':'disabled'}>${t(...launchLabels[settings.kind])}${I('arrow')}</button></div></section>`;
  const modes=kinds();
  const countLabels={family:['structures','개 구조'],precursor:['precursors','개 전구체'],motif:['motifs','개 모티프'],enzyme:['reactions','개 반응'],scaffold:['scaffolds','개 골격'],comparison:['study cards','학습 문제']};
  const rows=[];
  for(let i=0;i<modes.length;i+=2){
    const row=modes.slice(i,i+2),active=row.findIndex(([kind])=>kind===expandedKind);
    rows.push(`<div class="studio-practice-row${active>=0?' has-open':''}" data-expanded-column="${active<0?'none':active===0?'left':'right'}">${row.map(([kind,glyph,title,description,n])=>{
      const expanded=kind===expandedKind,panelId='practice-config-'+kind;
      return `<article class="studio-practice-option studio-practice-option--${kind}${expanded?' is-open':''}">${renderStudioModeCard({mode:kind,title,description,count:n+' '+t(...countLabels[kind]),selected:expanded,expanded,panelId,lang:getLanguage()})}<div id="${panelId}"${expanded?` class="studio-config-extension" role="region" aria-labelledby="practice-mode-title-${kind}"`:' hidden'}>${expanded?configuration:''}</div></article>`;
    }).join('')}</div>`);
  }
  root.innerHTML=`<div class="eyebrow">${t('A FIELD GUIDE, ONE MOLECULE AT A TIME','한 번에 한 분자씩 익히는 구조 안내서')}</div><section class="hero"><div><h1>${t('A little practice.<br><em>A better eye for terpenes.</em>','조금씩 연습하고,<br><em>테르펜을 알아보는 눈.</em>')}</h1><p>${t('Recognise the skeleton. Spot the modification.<br>Understand the enzyme behind the chemistry.','골격을 알아보고, 달라진 부분을 찾고,<br>그 반응을 만드는 효소를 이해하세요.')}</p><div class="hero-collection" aria-label="${t('Atlas collection','Atlas 자료 모음')}"><span><i aria-hidden="true"></i>${catalogue.molecules.length} ${t('structures','개 구조')}</span><span>${catalogue.scaffolds.length} ${t('scaffolds & rings','개 골격·고리')}</span><span>${catalogue.precursors.length} ${t('precursors','개 전구체')}</span></div></div>${renderGeraniolXray(getLanguage())}</section><section aria-labelledby="mode-label"><div class="section-label" id="mode-label"><span class="step-number">01</span>${t('What would you like to practise?','어떤 내용을 연습할까요?')}</div><div class="mode-grid studio-mode-grid">${rows.join('')}</div></section><div class="support-row"><span>${t('No countdown. Just you and the chemistry.','시간제한 없이, 구조를 천천히 익혀보세요.')}</span></div><div class="principle">${I('bulb')}<p><strong>${t('Count the skeleton, then read the decorations.','골격을 세고, 부착된 구조를 살펴보세요.')}</strong>${t('Stevioside has 38 carbons overall, but its C20 steviol core makes it a diterpenoid glycoside.','Stevioside의 전체 탄소 수는 38개지만, C20 steviol 골격을 가진 diterpenoid glycoside입니다.')}</p></div><div class="support-row"><span>${progress.answered} ${t('cards practised','개 카드 연습')} · ${progress.sessions} ${t('sessions complete','회 세션 완료')}</span><button id="weak-review">${t('Review tricky cards','헷갈린 문제 복습')} (${weakQuestions().length})</button></div>`;
  bindGeraniolXray(root);
  $$('[data-mode]',root).forEach(button=>button.onclick=()=>{
    const kind=button.dataset.mode;expandedKind=expandedKind===kind?null:kind;settings.kind=kind;renderSetup();$('[data-mode="'+kind+'"]',root)?.focus({preventScroll:true});
  });
  $$('[data-filter]',root).forEach(button=>button.onclick=()=>{
    const key=button.dataset.filter,id=button.dataset.id;
    settings[key]=settings[key].includes(id)?settings[key].filter(value=>value!==id):[...settings[key],id];renderSetup();
    $('[data-filter="'+key+'"][data-id="'+id+'"]',root)?.focus({preventScroll:true});
  });
  $$('[data-style]',root).forEach(button=>button.onclick=()=>{const style=button.dataset.style;settings.style=style;renderSetup();$('[data-style="'+style+'"]',root)?.focus({preventScroll:true});});
  $$('[data-count]',root).forEach(button=>button.onclick=()=>{const n=button.dataset.count;settings.count=Number(n);renderSetup();$('[data-count="'+n+'"]',root)?.focus({preventScroll:true});});
  if($('#challenge',root))$('#challenge',root).onchange=event=>{settings.challenge=event.target.checked;renderSetup();$('#challenge',root)?.focus({preventScroll:true});};
  if($('#name-mode',root))$('#name-mode',root).onclick=()=>{settings.kind=settings.kind==='name'?'family':'name';renderSetup();$('#name-mode',root)?.focus({preventScroll:true});};
  if($('#start',root))$('#start',root).onclick=()=>{
    startQuestions(shuffle(questionPool(settings)).slice(0,settings.count).map(item=>createQuestion(settings.kind,item)));
    redraw();window.scrollTo({top:0});
  };
  $('#weak-review',root).onclick=startWeak;
}

function questionPrompt(question) {
  if(question.prompt) return t(question.prompt,question.promptKo);
  if (question.kind === 'comparison') return t(question.item.prompt, question.item.promptKo);
  if (question.kind === 'family') return t('Which terpene family does this parent skeleton belong to?', '이 모체 골격은 어느 테르펜 계열에 속하나요?');
  if (question.kind === 'enzyme') return t('Which enzyme group fits this transformation?', '이 구조 변화를 만드는 효소 종류는 무엇인가요?');
  if (question.kind === 'motif') return t('What is the most specific highlighted motif?', '강조된 부분을 가장 구체적으로 설명하는 모티프는 무엇인가요?');
  if (question.kind === 'scaffold') return t('Which scaffold or ring model is shown?', '어떤 골격 또는 고리 모형인가요?');
  return t('Name this structure.', '이 구조의 이름은 무엇인가요?');
}
function questionFigure(question) {
  if (question.kind === 'comparison') return comparisonQuestionFigure(question.item.figure.comparePair,
    {numbered: question.item.figure.numbered, lang: document.documentElement.lang});
  if (question.kind === 'enzyme') return reactionHTML(question.item);
  return '<img src="' + esc(question.item.image) + '" alt="' +
    t('Chemical structure to identify', '이름을 맞힐 화학 구조') + '">' +
    (question.item.id === 'crispene-d' ? '<p class="source-figure-target">' +
      t('Identify compound 4 (R=H)', '화합물 4(R=H)의 이름을 답하세요') + '</p>' : '');
}
function hintFor(question) {
  if(question.hint) return t(question.hint,question.hintKo);
  if (question.kind === 'comparison') return t(question.item.hint, question.item.hintKo);
  if (question.kind === 'family') return t('The terpene-derived parent has ', '테르펜 유래 모체에는 탄소가 ') +
    question.item.skeleton + t(' carbons.', '개 있습니다.');
  if (question.kind === 'enzyme') return t('Read the bond changes and the cofactors above the arrow.', '결합의 변화와 화살표 위의 cofactor를 함께 보세요.');
  if (question.kind === 'motif') return t('Focus on the highlighted atoms and bonds.', '강조된 원자와 결합에 집중하세요.');
  return t('The English name begins with ', '영문 이름의 첫 부분은 ') + question.answer.slice(0, 2) + '…';
}
function renderQuestion() {
  const root = currentRoot, question = session.questions[session.index];
  const typing = session.style === 'typing', result = session.results[session.index];
  root.innerHTML = '<div class="quiz-top"><button class="text-button" id="quiz-back">' + I('back') +
    t('Back to studio', '연습 설정으로') + '</button><div class="quiz-meta"><strong>' +
    (session.index + 1) + ' / ' + session.questions.length + '</strong><span>' +
    (typing ? t('Type from memory', '기억해서 입력') : t('Choose an answer', '정답 선택')) +
    '</span></div></div><div class="progress-track"><div class="progress-fill" style="width:' +
    (session.index / session.questions.length * 100) + '%"></div></div><div class="question-heading">' +
    '<div><div class="eyebrow">' + t('READ THE STRUCTURE', '구조를 읽어보세요') + '</div><h1>' +
    esc(questionPrompt(question)) + '</h1></div></div><section class="question-card"><div class="molecule-stage">' +
    questionFigure(question) + '</div><div class="answer-area">' +
    (typing ? '<form class="answer-form" id="answer-form"><input id="answer-input" class="answer-input" autocomplete="off" spellcheck="false" aria-label="' +
      t('Your answer', '정답 입력') + '" placeholder="' + t('Type a name or accepted abbreviation…', '이름 또는 허용된 약어 입력…') +
      '" ' + (session.answered ? 'disabled' : '') + '><button class="primary" ' +
      (session.answered ? 'disabled' : '') + '>' + t('Check', '확인') + '</button></form>' :
      '<div class="choices">' + question.displayOptions.map((option, index) => '<button class="choice ' +
        (session.answered && option.id === question.correctId ? 'correct' : '') +
        (session.answered && result.selectedId === option.id && !result.correct ? ' wrong' : '') +
        '" data-choice="' + option.id + '" ' + (session.answered ? 'disabled' : '') +
        '><span>' + (index + 1) + '</span>' + esc(t(option.label, option.ko)) + '</button>').join('') + '</div>') +
    '</div>' + (session.answered ? feedbackHTML(question, result) : '') + '</section>' +
    (session.answered ? '' : '<div class="quiz-bottom"><div class="left"><button class="text-button" id="hint">' +
      I('bulb') + t('A little hint', '힌트 보기') + '</button><button class="text-button" id="reveal">' +
      t('Reveal answer', '정답 보기') + '</button></div><button class="text-button" id="skip">' +
      t('Skip', '건너뛰기') + ' →</button></div>') +
    (session.hinted && !session.answered ? '<p class="hint-text">' + esc(hintFor(question)) + '</p>' : '');
  $('#quiz-back', root).onclick = () => { session = null; renderSetup(); };
  if (typing && !session.answered) {
    $('#answer-form', root).onsubmit = event => {
      event.preventDefault();
      const input = $('#answer-input', root).value;
      if (!input.trim()) return;
      submitAnswer(answerMatches(question, input), {input});
    };
    $('#answer-input', root).focus({preventScroll: true});
  }
  $$('[data-choice]', root).forEach(button => button.onclick = () =>
    submitAnswer(button.dataset.choice === question.correctId, {selectedId: button.dataset.choice}));
  if (!session.answered) {
    $('#hint', root).onclick = () => { session.hinted = true; renderQuestion(); };
    $('#reveal', root).onclick = () => submitAnswer(false, {revealed: true});
    $('#skip', root).onclick = () => submitAnswer(false, {skipped: true});
  } else {
    $('#next-question', root).onclick = () => {
      if (session.index + 1 === session.questions.length) {
        session.done = true; finishSession(progress); renderSummary();
      } else {
        session.index++; session.answered = false; session.hinted = false; renderQuestion();
      }
      window.scrollTo({top: 0});
    };
    $('#next-question', root).focus({preventScroll: true});
  }
}
function submitAnswer(correct, extra) {
  if (session.answered) return;
  const question = session.questions[session.index];
  const independent = recordAnswer(progress, question, {correct, hinted: session.hinted, ...extra});
  session.results[session.index] = {correct, independent, hinted: session.hinted, ...extra};
  session.answered = true;
  renderQuestion();
}
function feedbackHTML(question, result) {
  const title = result.revealed ? t('Answer revealed', '정답 확인') :
    result.skipped ? t('Saved for review', '복습 목록에 추가') :
    result.correct ? (result.hinted ? t('Correct with a hint', '힌트를 보고 맞혔어요') : t('That is right.', '정답입니다.')) :
      t('A useful one to revisit.', '다시 살펴볼 만한 카드예요.');
  const source = question.item.source;
  return '<div class="answer-feedback ' + (result.correct ? '' : 'wrong') + '" role="status">' +
    '<div class="feedback-title">' + I(result.correct ? 'check' : 'learn') + title + '</div><strong>' +
    esc(t(question.answer, question.answerKo)) + '</strong><p>' + esc(recordNote(question.item)) + '</p>' +
    (question.item.MolecularFormula ? '<div class="feedback-tags"><span class="tag">' +
      formulaHTML(question.item.MolecularFormula) + '</span></div>' : '') +
    '<div class="feedback-actions">' + (source ? '<a href="' + esc(source) +
      '" target="_blank" rel="noopener noreferrer">' + t('Supporting source', '관련 출처') + ' ↗</a>' : '<span></span>') +
    '<button class="primary" id="next-question">' +
    (session.index + 1 === session.questions.length ? t('See results', '결과 보기') : t('Next structure', '다음 카드')) +
    ' →</button></div></div>';
}
function renderSummary() {
  const root = currentRoot, score = session.results.filter(result => result.independent).length;
  root.innerHTML = '<div class="summary-title"><div class="summary-icon">' + I('check') + '</div><h1>' +
    t('A little more familiar.', '조금 더 익숙해졌어요.') + '</h1><p>' +
    t('Independent answers count towards your score. Assisted and skipped cards return to review.',
      '힌트 없이 맞힌 답을 점수에 반영합니다. 힌트를 보거나 건너뛴 카드는 복습 목록에 남습니다.') +
    '</p></div><div class="score-strip"><div class="score"><strong>' + score + ' / ' + session.questions.length +
    '</strong><span>' + t('Independent correct', '힌트 없이 정답') + '</span></div><div class="score"><strong>' +
    Math.round(score / session.questions.length * 100) + '%</strong><span>' + t('Accuracy', '정확도') +
    '</span></div><div class="score"><strong>' + session.results.filter(result => !result.independent).length +
    '</strong><span>' + t('For review', '복습할 카드') + '</span></div></div><div class="summary-actions">' +
    '<button class="primary" id="summary-again">' + t('New session', '새 연습') +
    '</button><button class="secondary" id="summary-review">' + t('Review tricky cards', '어려웠던 카드 복습') +
    '</button></div><section class="summary-review"><h2>' + t('Your session', '이번 연습') + '</h2>' +
    session.questions.map((question, index) => '<div class="review-row"><span class="status ' +
      (session.results[index].independent ? '' : 'miss') + '">' + I(session.results[index].independent ? 'check' : 'learn') +
      '</span><span>' + esc(recordName(question.item)) + '</span><span class="answer">' +
      esc(t(question.answer, question.answerKo)) + '</span></div>').join('') + '</section>';
  $('#summary-again', root).onclick = () => { session = null; renderSetup(); };
  $('#summary-review', root).onclick = startWeak;
}
export function handlePracticeKey(event) {
  if (!currentRoot?.isConnected || !session || session.done || session.answered || session.style !== 'choice' ||
      document.querySelector('#detail-modal') || event.ctrlKey || event.metaKey || event.altKey ||
      /INPUT|SELECT|TEXTAREA/.test(event.target?.tagName || '') || !/^[1-6]$/.test(event.key)) return;
  const choice = $$('.choice', currentRoot)[Number(event.key) - 1];
  if (choice) { event.preventDefault(); choice.click(); }
}
