import type { ZodiacSign, HoroscopeReading } from '../types/fortune';
import { fortuneTexts } from '../data/horoscope';
import { format } from 'date-fns';

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededPick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function getDailyHoroscope(sign: ZodiacSign): HoroscopeReading {
  const today = format(new Date(), 'yyyy-MM-dd');
  const seed = hashString(today + sign);

  return {
    sign,
    date: today,
    overall: seededPick(fortuneTexts.overall, seed),
    love: seededPick(fortuneTexts.love, seed + 1),
    career: seededPick(fortuneTexts.career, seed + 2),
    luckyNumber: (seed % 99) + 1,
    luckyColor: seededPick(fortuneTexts.luckyColors, seed + 3),
    rating: (seed % 5) + 1,
  };
}
