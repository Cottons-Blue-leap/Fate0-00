// === TAROT ===
export interface TarotCard {
  id: number;
  name: string;
  nameKo: string;
  image: string;
  upright: string;
  reversed: string;
  keywords: string[];
}

export interface TarotReading {
  spread: '1-card' | '3-card';
  cards: Array<{
    card: TarotCard;
    isReversed: boolean;
    position: string;
  }>;
  summary: string;
}

// === HOROSCOPE ===
export type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export interface ZodiacInfo {
  sign: ZodiacSign;
  nameKo: string;
  symbol: string;
  dateRange: string;
  element: 'fire' | 'earth' | 'air' | 'water';
}

export interface HoroscopeReading {
  sign: ZodiacSign;
  date: string;
  overall: string;
  love: string;
  career: string;
  luckyNumber: number;
  luckyColor: string;
  rating: number;
}

// === SAJU ===
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';
export type EarthlyBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';
export type FiveElement = '木' | '火' | '土' | '金' | '水';

export interface SajuPillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  element: FiveElement;
  label: string;
}

export interface SajuReading {
  birthDate: Date;
  birthHour: number;
  isLunar: boolean;
  pillars: [SajuPillar, SajuPillar, SajuPillar, SajuPillar];
  dominantElement: FiveElement;
  fortune: string;
}

// === OMIKUJI ===
export type OmikujiRank = '大吉' | '吉' | '中吉' | '小吉' | '末吉' | '凶' | '大凶';

export interface OmikujiReading {
  rank: OmikujiRank;
  rankKo: string;
  number: number;
  wish: string;
  relationship: string;
  travel: string;
  health: string;
  general: string;
}
