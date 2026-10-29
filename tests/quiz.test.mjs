import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTestCatalogue} from './support/catalogue.mjs';
import {allQuestions,choiceOptions,answerMatches,normalizeAnswer,createQuestion} from '../src/lib/quiz.js';
import {emptyProgress,recordAnswer} from '../src/lib/progress.js';
const data = await loadTestCatalogue();
test('all question types support recall and bounded choice answers', () => {
  const questions = allQuestions();
  assert.ok(questions.length > 200);
  for (const question of questions) {
    assert.ok(question.answer && answerMatches(question,question.answer),question.uid);
    const options = choiceOptions(question);
    assert.ok(options.length >= 2 && options.length <= 6,question.uid);
    assert.equal(options.filter(option => option.id === question.correctId).length,1);
    assert.equal(new Set(options.map(option => option.id)).size,options.length);
    assert.ok(!answerMatches(question,''));
  }
});
test('matching preserves stereochemical signs and accepts Greek-letter names', () => {
  assert.equal(normalizeAnswer('β-Carotene'),normalizeAnswer('beta carotene'));
  assert.notEqual(normalizeAnswer('(+)-CPP'),normalizeAnswer('(−)-CPP'));
  const cpp=createQuestion('precursor',data.precursors.find(item=>item.id==='cpp'));
  assert.ok(!answerMatches(cpp,'(−)-CPP'));
  const kpp=createQuestion('precursor',data.precursors.find(item=>item.id==='kpp'));
  assert.ok(!answerMatches(kpp,'(+)-KPP'));
  assert.ok(!answerMatches(kpp,'CLPP'));
});
test('assisted and revealed answers remain in review', () => {
  const progress=emptyProgress(),question=allQuestions()[0];
  recordAnswer(progress,question,{correct:true,hinted:true});
  assert.equal(progress.correct,0);assert.equal(progress.items[question.uid].weak,true);
  recordAnswer(progress,question,{correct:true});
  assert.equal(progress.correct,1);assert.equal(progress.items[question.uid].weak,false);
  recordAnswer(progress,question,{correct:false,revealed:true});
  assert.equal(progress.items[question.uid].weak,true);assert.equal(progress.answered,3);
});
