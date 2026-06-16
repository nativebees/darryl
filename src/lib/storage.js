// ==============================================
// History persistence (localStorage) + export/import
// Same storage key and shape as the vanilla build.
// ==============================================

export const HISTORY_KEY = 'darryls-castle-history-v1';

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch (e) {
    return [];
  }
}

export function saveHistory(arr) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
}

export function exportHistoryFile() {
  const data = loadHistory();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `darryls-castle-history-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Parse + merge an imported array into existing history (dedupe by id).
// Returns the merged array. Throws on invalid format.
export function mergeImported(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error('Invalid format');
  const existing = loadHistory();
  const merged = [...data, ...existing];
  const seen = new Set();
  const dedup = merged.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
  saveHistory(dedup);
  return { merged: dedup, importedCount: data.length };
}
