/**
 * Moon & Zodiac Engine — powered by lunarphase-js
 *
 * Moon phase calculations delegate to lunarphase-js.
 * Zodiac sign determination uses standard date ranges.
 */

import type { ZodiacSign } from '../types/fortune';
import { Moon } from 'lunarphase-js';

const ZODIAC_ORDER: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const ZODIAC_ELEMENTS: Record<ZodiacSign, 'fire' | 'earth' | 'air' | 'water'> = {
  aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water',
  leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water',
  sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water',
};

// Approximate lunar zodiac position based on moon age
export function getLunarZodiac(date: Date): ZodiacSign {
  const age = Moon.lunarAge(date);
  const lunarCycleDays = 29.53059;
  const signIndex = Math.floor((age / lunarCycleDays) * 12) % 12;
  // New moon in Capricorn as reference (approximate)
  return ZODIAC_ORDER[(9 + signIndex) % 12];
}

// Moon phase (0-1, 0=new, 0.5=full) — using lunarphase-js
export function getMoonPhase(date: Date): number {
  const age = Moon.lunarAge(date);
  const lunarCycleDays = 29.53059;
  return (age % lunarCycleDays) / lunarCycleDays;
}

export function getMoonPhaseName(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return 'newMoon';
  if (phase < 0.22) return 'waxingCrescent';
  if (phase < 0.28) return 'firstQuarter';
  if (phase < 0.47) return 'waxingGibbous';
  if (phase < 0.53) return 'fullMoon';
  if (phase < 0.72) return 'waningGibbous';
  if (phase < 0.78) return 'lastQuarter';
  return 'waningCrescent';
}

export function getMoonEmoji(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return '🌑';
  if (phase < 0.22) return '🌒';
  if (phase < 0.28) return '🌓';
  if (phase < 0.47) return '🌔';
  if (phase < 0.53) return '🌕';
  if (phase < 0.72) return '🌖';
  if (phase < 0.78) return '🌗';
  return '🌘';
}

// Distance between two signs (0-6, 0=same, 6=opposite)
export function getSignDistance(a: ZodiacSign, b: ZodiacSign): number {
  const idxA = ZODIAC_ORDER.indexOf(a);
  const idxB = ZODIAC_ORDER.indexOf(b);
  const diff = Math.abs(idxA - idxB);
  return Math.min(diff, 12 - diff);
}

// Resonance level based on element compatibility
export function getResonance(sunSign: ZodiacSign, moonSign: ZodiacSign): 'aligned' | 'approaching' | 'neutral' | 'distant' {
  if (sunSign === moonSign) return 'aligned';
  const sunEl = ZODIAC_ELEMENTS[sunSign];
  const moonEl = ZODIAC_ELEMENTS[moonSign];
  if (sunEl === moonEl) return 'aligned';
  const compatible: Record<string, string> = { fire: 'air', air: 'fire', earth: 'water', water: 'earth' };
  if (compatible[sunEl] === moonEl) return 'approaching';
  const dist = getSignDistance(sunSign, moonSign);
  return dist <= 3 ? 'neutral' : 'distant';
}

// Get sun sign from birth date (standard boundaries)
export function getSunSign(month: number, day: number): ZodiacSign {
  const cutoffs: [number, number, ZodiacSign][] = [
    [1, 19, 'capricorn'], [2, 18, 'aquarius'], [3, 20, 'pisces'],
    [4, 19, 'aries'], [5, 20, 'taurus'], [6, 21, 'gemini'],
    [7, 22, 'cancer'], [8, 22, 'leo'], [9, 22, 'virgo'],
    [10, 23, 'libra'], [11, 21, 'scorpio'], [12, 21, 'sagittarius'],
  ];
  for (const [m, d, sign] of cutoffs) {
    if (month < m || (month === m && day <= d)) return sign;
  }
  return 'capricorn';
}
