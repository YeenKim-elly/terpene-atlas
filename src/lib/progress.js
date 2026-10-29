import {readPreference, writePreference} from './preferences.js';

export const emptyProgress = () => ({answered: 0, correct: 0, sessions: 0, items: {}});
export function readProgress() {
  const stored = readPreference('learning-v1', null);
  if (!stored || !Number.isInteger(stored.answered) || stored.answered < 0 ||
      !Number.isInteger(stored.correct) || stored.correct < 0 ||
      !Number.isInteger(stored.sessions) || stored.sessions < 0 ||
      !stored.items || typeof stored.items !== 'object' || Array.isArray(stored.items)) return emptyProgress();
  return stored;
}
export function recordAnswer(progress, question, {correct, hinted = false, revealed = false}) {
  const independent = Boolean(correct && !hinted && !revealed);
  progress.answered++;
  if (independent) progress.correct++;
  progress.items[question.uid] = {weak: !independent};
  writePreference('learning-v1', progress);
  return independent;
}
export function finishSession(progress) {
  progress.sessions++;
  writePreference('learning-v1', progress);
}
