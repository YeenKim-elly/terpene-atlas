export function readPreference(key, fallback) {
  try { return JSON.parse(localStorage.getItem('terpene-atlas/' + key)) ?? fallback; }
  catch { return fallback; }
}

export function writePreference(key, value) {
  try { localStorage.setItem('terpene-atlas/' + key, JSON.stringify(value)); }
  catch { /* The atlas also works when browser storage is unavailable. */ }
}
