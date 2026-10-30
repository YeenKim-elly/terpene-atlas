import {catalogue} from '../lib/catalogue.js';
import {esc, formulaHTML, reactionHTML} from '../lib/dom.js';
import {t, recordName} from '../lib/i18n.js';

export function structureCardHTML(record, category) {
  const reaction = category === 'reactions';
  const family = catalogue.families[record.family];
  const badge = reaction ? catalogue.enzymes[record.enzyme].name :
    family ? t(family.name, family.ko) : record.category || t('Connectivity model', '결합 관계 모형');
  return '<button class="compound-card" data-detail="' + esc(record.id) + '">' +
    '<div class="card-image">' + (reaction ? reactionHTML(record) :
      '<img src="' + esc(record.image) + '" loading="lazy" alt="' + esc(recordName(record)) + ' ' +
      t('structure', '구조') + '">') + '</div><div class="card-info"><h3>' +
    esc(recordName(record)) + '</h3><span class="tag">' + esc(badge) + '</span>' +
    (record.level === 'challenge' ? '<span class="tag challenge">' + t('Decorated', '추가 작용기') + '</span>' : '') +
    '<p>' + (record.MolecularFormula ? formulaHTML(record.MolecularFormula) : '') +
    (record.skeleton ? ' · ' + t('Parent skeleton', '모체 골격') + ' C' + record.skeleton : '') +
    (record.originSkeleton ? ' · ' + t('From C', '유래 C') + record.originSkeleton : '') +
    '</p></div></button>';
}
