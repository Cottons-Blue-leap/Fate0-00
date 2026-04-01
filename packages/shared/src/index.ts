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
  getSexagenaryCycle,
  toSexagenaryIndex,
} from './data/saju';
export type { StemData, BranchData } from './data/saju';

// === Data: Omikuji ===
export { omikujiData } from './data/omikuji';

// === Logic: Tarot ===
export { getReading } from './logic/tarotEngine';

// === Logic: Horoscope ===
export { getDailyHoroscope } from './logic/horoscopeEngine';

// === Logic: Saju ===
export { getSajuReading, countElements, setUseKoreanManseryeok } from './logic/sajuEngine';

// === Logic: Solar Terms ===
export { getSajuMonthAndYear, getAdjacentTerm } from './logic/solarTerms';
export type { SajuMonthInfo } from './logic/solarTerms';

// === Logic: Lunar Converter ===
export { lunarToSolar, lunarToSolarAsync, solarToLunar } from './logic/lunarConverter';

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

// === Logic: Five Elements ===
export type { Interaction } from './logic/fiveElements';
export { getInteraction, getElementInteraction, generationCycle, restraintCycle, hashString } from './logic/fiveElements';

// === Logic: Personal Message ===
export type {
  PersonalMessageResult,
  PersonalMessageInput,
} from './logic/personalMessageEngine';
export { getPersonalMessage } from './logic/personalMessageEngine';
