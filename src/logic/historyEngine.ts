// Fortune history — saves results to localStorage with optional server sync

import { isLoggedIn, syncHistory as syncToServer } from '../services/api';
import i18n from '../i18n';

export interface HistoryEntry {
  id: string;
  type: 'tarot' | 'horoscope' | 'saju' | 'omikuji';
  date: string; // ISO date
  summary: string; // short description (legacy or i18n key)
  data: Record<string, unknown>; // fortune-specific data for i18n rendering
  language?: string; // language code at time of fortune generation
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
    language: entry.language || i18n.language,
  };
  history.unshift(newEntry);
  if (history.length > MAX_ENTRIES) history.length = MAX_ENTRIES;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

  // Background server sync (fire-and-forget)
  if (isLoggedIn()) {
    syncToServer([
      {
        id: newEntry.id,
        type: newEntry.type,
        summary: newEntry.summary,
        data: newEntry.data,
        createdAt: newEntry.date,
      },
    ]).catch(() => {
      // Silent fail — localStorage is the source of truth
    });
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function syncAllHistory(): Promise<number> {
  if (!isLoggedIn()) return 0;

  const history = getHistory();
  if (history.length === 0) return 0;

  const result = await syncToServer(
    history.map((h) => ({
      id: h.id,
      type: h.type,
      summary: h.summary,
      data: h.data,
      createdAt: h.date,
    })),
  );

  return result.synced;
}
