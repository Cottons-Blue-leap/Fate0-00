// Daily fortune limit — one reading per fortune type per day, resets at midnight

type FortuneType = 'tarot' | 'horoscope' | 'saju' | 'omikuji';

const STORAGE_KEY = 'fate0_daily_limits';

interface DailyLimits {
  date: string; // YYYY-MM-DD
  used: Record<string, boolean>;
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getLimits(): DailyLimits {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getTodayStr(), used: {} };
    const data: DailyLimits = JSON.parse(raw);
    // Reset if date changed (midnight passed)
    if (data.date !== getTodayStr()) {
      return { date: getTodayStr(), used: {} };
    }
    return data;
  } catch {
    return { date: getTodayStr(), used: {} };
  }
}

function saveLimits(limits: DailyLimits): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limits));
  } catch {
    // Privacy mode or quota exceeded — limit state won't persist but app continues
  }
}

export function hasUsedToday(type: FortuneType): boolean {
  return !!getLimits().used[type];
}

export function markUsedToday(type: FortuneType): void {
  const limits = getLimits();
  limits.used[type] = true;
  saveLimits(limits);
}

export function unlockType(type: FortuneType): void {
  const limits = getLimits();
  delete limits.used[type];
  saveLimits(limits);
}

export function getRemainingTypes(): FortuneType[] {
  const limits = getLimits();
  return (['tarot', 'horoscope', 'saju', 'omikuji'] as FortuneType[]).filter(t => !limits.used[t]);
}
