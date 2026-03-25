import { getHistory, type HistoryEntry } from '../logic/historyEngine';

export function getLatestEntry(type: string): HistoryEntry | undefined {
  return getHistory().find(e => e.type === type);
}
