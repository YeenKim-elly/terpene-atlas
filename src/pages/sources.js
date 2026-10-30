import {catalogue} from '../lib/catalogue.js';
import {esc} from '../lib/dom.js';
import {t} from '../lib/i18n.js';

export function renderSources(root) {
  const tips = [
    [t('Follow carotenoid-cleavage origin.', '카로티노이드 절단 유래를 확인하세요.'),
     t('Apocarotenoids span different carbon counts. Retinal has a C20 core, β-ionone C13 and cyclocitral C10. Crocin I has 44 carbons overall but retains a C20 crocetin core; picrocrocin has 16 overall and a C10 core.',
       '아포카로티노이드는 탄소 수가 다양합니다. Retinal의 핵심 골격은 C20, β-ionone은 C13, cyclocitral은 C10입니다. Crocin I은 전체 C44이지만 C20 crocetin 골격을 유지하며 picrocrocin은 전체 C16, 핵심 C10입니다.')],
    [t('Count the parent skeleton.', '모체 골격을 기준으로 분류하세요.'),
     t('Sugars and acyl groups can increase the total carbon count. Stevioside retains a C20 steviol core, while fucoxanthin retains a C40 carotenoid core.',
       '당이나 acyl기가 붙으면 전체 탄소 수가 늘어날 수 있습니다. Stevioside는 C20 steviol 모체를, fucoxanthin은 C40 carotenoid 모체를 유지합니다.')],
    [t('Separate a model from an identified compound.', '모형과 동정된 물질을 구분하세요.'),
     t('Motif cards show generic connectivity. Ring and scaffold cards may show representative or partial stereochemistry. Read the qualifications beside the drawing.',
       '모티프 카드는 일반적인 결합 관계를 보여줍니다. 골격과 고리 카드에는 대표 구조나 부분적으로만 지정된 입체배열도 있으므로 그림 옆 설명을 함께 읽어야 합니다.')],
    [t('Read each connection by its label.', '연결선의 의미를 확인하세요.'),
     t('The structure web distinguishes a reaction, a summarised pathway and a structural relationship. Similar structures alone do not establish a substrate–product relationship.',
       '구조 연결망은 반응, 요약 경로, 구조 관계를 구분합니다. 구조가 비슷하다는 사실만으로 기질과 생성물의 관계를 확정할 수는 없습니다.')],
    [t('Keep stereochemistry specific.', '입체배열을 구체적으로 확인하세요.'),
     t('CPP stereoisomers have separate records. A clerodane cis/trans description specifies relative relationships; it does not by itself resolve every stereocentre.',
       'CPP 입체이성질체는 별도 항목으로 제공합니다. Clerodane의 cis/trans 분류는 상대적인 관계를 나타내며 모든 입체중심을 확정하는 것은 아닙니다.')]
  ];
  root.innerHTML = '<div class="eyebrow">' + t('LEARNING WITH SOURCES', '출처와 함께 배우기') +
    '</div><div class="page-heading"><h1>' + t('Rooted in chemistry.', '화학에 근거한 학습.') +
    '</h1><p>' + t('A few useful rules, their limits and the references behind the atlas.',
      '학습에 유용한 원칙과 그 한계, 도감의 참고문헌을 모았습니다.') +
    '</p></div><div class="notes-grid">' + tips.map(([title, text]) =>
      '<section class="note-card"><h2>' + esc(title) + '</h2><p>' + esc(text) + '</p></section>').join('') +
    '<section class="note-card wide"><h2>' + t('The skeleton map', '골격 분류표') +
    '</h2><div class="table-scroll"><table class="reference-table"><thead><tr><th>' +
    t('Family', '계열') + '</th><th>' + t('Parent skeleton', '모체 골격') + '</th><th>' +
    t('Common precursor route', '대표 전구체 경로') + '</th></tr></thead><tbody>' +
    Object.values(catalogue.families).filter(family => family.carbon !== 5).map(family =>
      '<tr><td>' + esc(t(family.name, family.ko)) + '</td><td>' + esc(family.carbonLabel ? t(family.carbonLabel,family.carbonLabelKo) : 'C' + family.carbon) + '</td><td>' +
      esc(family.precursor) + '</td></tr>').join('') + '</tbody></table></div></section>' +
    '<section class="note-card wide"><h2>' + t('Reference sources', '참고문헌과 자료') +
    '</h2><p>' + t('Individual structure and reaction cards link to their supporting records. Source-derived figures retain their attribution and licence links.',
      '각 구조와 반응 카드에서 해당 출처를 확인할 수 있습니다. 원 논문에서 발췌한 그림에는 저작자와 이용 조건을 함께 표시합니다.') +
    '</p><div class="source-list">' + catalogue.references.map(source => '<div><a href="' +
      esc(source.url) + '" target="_blank" rel="noopener noreferrer">' + esc(source.name) +
      ' ↗</a><small>' + esc(source.detail || '') + '</small></div>').join('') +
    '</div></section><section class="note-card wide"><h2>' + t('Learn at your own pace.', '자신의 속도로 연습하세요.') +
    '</h2><p>' + t('Language, learning progress and diagram layouts can be saved in this browser. These preferences are not synchronised across devices.',
      '언어, 학습 진도, 연결망 배치는 이 브라우저에 저장할 수 있습니다. 다른 기기와 동기화되지는 않습니다.') +
    '</p></section></div>';
}
