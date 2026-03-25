// 역천(逆天) — Reverse Fate system
// Max 2 uses per day, resets at midnight

const STORAGE_KEY = 'fate0_reverse';
const MAX_DAILY = 3;

interface ReverseData {
  date: string;
  used: number;
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getData(): ReverseData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getTodayStr(), used: 0 };
    const data: ReverseData = JSON.parse(raw);
    if (data.date !== getTodayStr()) return { date: getTodayStr(), used: 0 };
    return data;
  } catch {
    return { date: getTodayStr(), used: 0 };
  }
}

function saveData(data: ReverseData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getReverseRemaining(): number {
  return MAX_DAILY - getData().used;
}

export function canReverse(): boolean {
  return getReverseRemaining() > 0;
}

export function useReverse(): boolean {
  if (!canReverse()) return false;
  const data = getData();
  data.used++;
  saveData(data);
  return true;
}
