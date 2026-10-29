import {catalogue, allStructures} from './catalogue.js';

export function normalizeAnswer(value) {
  return String(value ?? '').normalize('NFKC').trim().toLowerCase()
    .replace(/[−–]/g, '-')
    .replace(/^\(([+-])\)\s*/, (_, sign) => sign === '+' ? 'plus ' : 'minus ')
    .replace(/^[+]\s*/, 'plus ').replace(/^[-]\s*/, 'minus ')
    .replace(/β/g, 'beta').replace(/α/g, 'alpha').replace(/γ/g, 'gamma').replace(/ε/g, 'epsilon')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

export function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createQuestion(kind, item) {
  const question = {uid: kind + ':' + item.id, kind, item, correctId: item.id};
  const nameOption = record => ({id: record.id, label: record.name, ko: record.ko || record.name});
  let answer = item;
  if (kind === 'family') {
    answer = catalogue.families[item.family];
    question.correctId = item.family;
    question.options = Object.entries(catalogue.families)
      .filter(([id]) => id !== 'hemi')
      .map(([id, family]) => ({id, label: family.name, ko: family.ko}));
  } else if (kind === 'enzyme') {
    answer = catalogue.enzymes[item.enzyme];
    question.correctId = item.enzyme;
    question.options = Object.entries(catalogue.enzymes)
      .map(([id, enzyme]) => ({id, label: enzyme.name, ko: enzyme.ko}));
  } else if (kind === 'comparison') {
    question.answer = item.answer;
    question.answerKo = item.answerKo;
    question.correctId = item.correctId;
    question.aliases = [item.answer, item.answerKo, ...(item.aliases || [])].filter(Boolean);
    question.options = [...item.options];
    return question;
  } else {
    const entries = kind === 'precursor' ? catalogue.precursors :
      kind === 'motif' ? catalogue.motifs : kind === 'scaffold' ? catalogue.scaffolds : catalogue.molecules;
    question.options = entries.map(nameOption);
  }
  question.answer = answer.name;
  question.answerKo = answer.ko || answer.name;
  question.aliases = [
    answer.name, answer.ko, ...(answer.aliases || []),
    ...(['name', 'precursor', 'scaffold'].includes(kind) ? [item.query] : [])
  ].filter(Boolean);
  return question;
}

export function answerMatches(question, value) {
  const normalized = normalizeAnswer(value);
  return normalized.length > 0 && question.aliases.some(alias => normalizeAnswer(alias) === normalized);
}

export function choiceOptions(question, random = Math.random) {
  const correct = question.options.find(option => option.id === question.correctId);
  if (!correct) throw new Error('Question has no correct option: ' + question.uid);
  const seen = new Set([question.correctId]);
  const others = question.options.filter(option => {
    if (seen.has(option.id)) return false;
    seen.add(option.id);
    return true;
  });
  return shuffle([correct, ...shuffle(others, random).slice(0, 5)], random);
}

export function questionPool(settings) {
  if (settings.kind === 'precursor') return catalogue.precursors;
  if (settings.kind === 'motif') return catalogue.motifs.filter(item => settings.motifs.includes(item.id));
  if (settings.kind === 'enzyme') return catalogue.reactions.filter(item => settings.enzymes.includes(item.enzyme));
  if (settings.kind === 'scaffold') return catalogue.scaffolds;
  if (settings.kind === 'comparison') return catalogue.comparisonQuestions;
  return catalogue.molecules.filter(item =>
    settings.families.includes(item.family) && (settings.challenge || item.level !== 'challenge')
  );
}

export function allQuestions() {
  return [
    ...allStructures().flatMap(item => item.role === 'precursor' ? [createQuestion('precursor', item)] :
      [createQuestion('family', item), createQuestion('name', item)]),
    ...catalogue.motifs.map(item => createQuestion('motif', item)),
    ...catalogue.scaffolds.map(item => createQuestion('scaffold', item)),
    ...catalogue.reactions.map(item => createQuestion('enzyme', item)),
    ...catalogue.comparisonQuestions.map(item => createQuestion('comparison', item))
  ];
}

export const questionKindForRecord = record => record.enzyme ? 'enzyme' :
  record.role === 'precursor' ? 'precursor' :
  catalogue.motifs.some(item => item.id === record.id) ? 'motif' :
  catalogue.scaffolds.some(item => item.id === record.id) ? 'scaffold' :
  catalogue.molecules.some(item => item.id === record.id) ? 'name' : null;
