// === Types ===
export type {
  TarotCard,
  TarotReading,
  ZodiacSign,
  ZodiacInfo,
  HoroscopeReading,
  HeavenlyStem,
  EarthlyBranch,
  FiveElement,
  SajuPillar,
  SajuReading,
  OmikujiRank,
  OmikujiReading,
} from './types/fortune';

// === Data: Tarot ===
export { majorArcana } from './data/tarot';
export { tarotSymbols } from './data/tarotSymbols';

// === Data: Horoscope ===
export { zodiacSigns, fortuneTexts } from './data/horoscope';

// === Data: Saju ===
export {
  heavenlyStems,
  earthlyBranches,
  elementFortunes,
} from './data/saju';

// === Data: Omikuji ===
export { omikujiData } from './data/omikuji';

// === Logic: Tarot ===
export { getReading } from './logic/tarotEngine';

// === Logic: Horoscope ===
export { getDailyHoroscope } from './logic/horoscopeEngine';

// === Logic: Saju ===
export { getSajuReading } from './logic/sajuEngine';

// === Logic: Saju Deep Analysis ===
export type {
  DayMasterProfile,
  ElementLandscape,
  DaeunPeriod,
} from './logic/sajuDeepEngine';
export {
  getDayMasterProfile,
  analyzeElements,
  calculateDaeun,
  elementColors,
  elementEmojis,
  elementNames,
} from './logic/sajuDeepEngine';

// === Logic: Omikuji ===
export { drawOmikuji } from './logic/omikujiEngine';

// === Logic: Moon/Lunar ===
export {
  getLunarZodiac,
  getMoonPhase,
  getMoonPhaseName,
  getMoonEmoji,
  getSignDistance,
  getResonance,
  getSunSign,
} from './logic/moonEngine';


// === Logic: Waka ===
export type { Waka } from './logic/wakaEngine';
export { getWaka } from './logic/wakaEngine';

// === Logic: Date Utilities ===
export { getMaxDays } from './logic/dateUtils';

// === Logic: Daily Saju ===
export type {
  DailyPillar,
  DailyFortune,
} from './logic/dailySajuEngine';
export { getTodayPillar, getDailyFortune } from './logic/dailySajuEngine';
