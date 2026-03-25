import type { ZodiacSign } from '../types/fortune';

const ZODIAC_ORDER: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const ZODIAC_ELEMENTS: Record<ZodiacSign, 'fire' | 'earth' | 'air' | 'water'> = {
  aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water',
  leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water',
  sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water',
};

// Approximate lunar zodiac position based on date
// The moon moves through all 12 signs in ~29.5 days (~2.46 days per sign)
export function getLunarZodiac(date: Date): ZodiacSign {
  // Using a known reference: 2024-01-11 new moon was in Capricorn
  const refDate = new Date(2024, 0, 11);
  const diffMs = date.getTime() - refDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const lunarCycleDays = 29.53059;
  const daysInCycle = ((diffDays % lunarCycleDays) + lunarCycleDays) % lunarCycleDays;
  const signIndex = Math.floor((daysInCycle / lunarCycleDays) * 12) % 12;
  // Capricorn is index 9, offset from there
  return ZODIAC_ORDER[(9 + signIndex) % 12];
}

// Moon phase (0-1, 0=new, 0.5=full)
export function getMoonPhase(date: Date): number {
  const refNewMoon = new Date(2024, 0, 11).getTime();
  const lunarCycleMs = 29.53059 * 24 * 60 * 60 * 1000;
  const diff = date.getTime() - refNewMoon;
  return (((diff % lunarCycleMs) + lunarCycleMs) % lunarCycleMs) / lunarCycleMs;
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

// Get sun sign from birth date
export function getSunSign(month: number, day: number): ZodiacSign {
  const cutoffs: [number, number, ZodiacSign][] = [
    [1, 20, 'capricorn'], [2, 19, 'aquarius'], [3, 20, 'pisces'],
    [4, 20, 'aries'], [5, 21, 'taurus'], [6, 21, 'gemini'],
    [7, 23, 'cancer'], [8, 23, 'leo'], [9, 23, 'virgo'],
    [10, 23, 'libra'], [11, 22, 'scorpio'], [12, 22, 'sagittarius'],
  ];
  for (const [m, d, sign] of cutoffs) {
    if (month < m || (month === m && day <= d)) return sign;
  }
  return 'capricorn';
}
