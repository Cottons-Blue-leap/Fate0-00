// Fortune history — saves results to localStorage

export interface HistoryEntry {
  id: string;
  type: 'tarot' | 'horoscope' | 'saju' | 'omikuji';
  date: string; // ISO date
  summary: string; // short description (legacy or i18n key)
  data: Record<string, unknown>; // fortune-specific data for i18n rendering
}

const STORAGE_KEY = 'fate0_history';
const MAX_ENTRIES = 50;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, 'id' | 'date'>): void {
  const history = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString(),
  };
  history.unshift(newEntry);
  if (history.length > MAX_ENTRIES) history.length = MAX_ENTRIES;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
