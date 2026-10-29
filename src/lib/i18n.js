import {readPreference, writePreference} from './preferences.js';

let language = readPreference('language', 'en');
if (!['en', 'ko'].includes(language)) language = 'en';

export const getLanguage = () => language;
export const t = (en, ko) => language === 'ko' ? (ko || en) : en;
export function setLanguage(value) {
  if (!['en', 'ko'].includes(value)) return;
  language = value;
  writePreference('language', language);
}
export const recordName = record => t(record.name || record.title, record.ko);
export const recordNote = record => t(record.note || '', record.noteKo || record.note || '');
