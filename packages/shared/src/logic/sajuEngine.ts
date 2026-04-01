/**
 * Saju Engine — powered by lunar-typescript
 *
 * All four-pillar calculations are delegated to the battle-tested
 * lunar-typescript library. This module adapts its output to match
 * the existing SajuReading / SajuPillar interfaces used by the UI.
 */

import type { SajuPillar, SajuReading, FiveElement, HeavenlyStem, EarthlyBranch } from '../types/fortune';
import { heavenlyStems, earthlyBranches, elementFortunes } from '../data/saju';
import { Solar, Lunar } from 'lunar-typescript';

// Lazy-loaded Korean manseryeok (only bundled for Korean users)
let _manseryeok: { calculateSaju: typeof import('@fullstackfamily/manseryeok').calculateSaju; lunarToSolar: typeof import('@fullstackfamily/manseryeok').lunarToSolar } | null = null;
let _useKoreanManseryeok = false;

export function setUseKoreanManseryeok(value: boolean): void {
  _useKoreanManseryeok = value;
  if (value && !_manseryeok) {
    // Preload manseryeok when Korean locale detected
    import('@fullstackfamily/manseryeok').then(m => { _manseryeok = m; }).catch(() => {});
  }
}

// --- Lookup helpers ---

const STEMS: HeavenlyStem[] = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES: EarthlyBranch[] = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

function stemIndex(s: string): number { return STEMS.indexOf(s as HeavenlyStem); }
function branchIndex(b: string): number { return BRANCHES.indexOf(b as EarthlyBranch); }

function makePillar(stemChar: string, branchChar: string, label: string): SajuPillar {
  const si = stemIndex(stemChar);
  const bi = branchIndex(branchChar);
  const stem = heavenlyStems[si >= 0 ? si : 0];
  const branch = earthlyBranches[bi >= 0 ? bi : 0];
  return {
    stem: stem.stem,
    branch: branch.branch,
    element: stem.element,
    branchElement: branch.element,
    label,
  };
}

// --- Element Balance (with 지장간) ---

export function countElements(pillars: SajuPillar[]): Record<FiveElement, number> {
  const counts: Record<FiveElement, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  for (const p of pillars) {
    counts[p.element] += 10;

    const branchData = earthlyBranches.find(b => b.branch === p.branch);
    if (branchData) {
      for (const hidden of branchData.hiddenStems) {
        counts[hidden.element] += hidden.weight;
      }
    }
  }

  return counts;
}

function findDominantElement(pillars: SajuPillar[]): FiveElement {
  const counts = countElements(pillars);
  let max: FiveElement = '木';
  let maxCount = 0;
  for (const [el, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      max = el as FiveElement;
    }
  }
  return max;
}

// --- Main Entry Point ---

export function getSajuReading(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  isLunar: boolean,
  solarDate?: { year: number; month: number; day: number },
): SajuReading {
  let sYear = birthYear;
  let sMonth = birthMonth;
  let sDay = birthDay;

  if (isLunar) {
    if (solarDate) {
      sYear = solarDate.year;
      sMonth = solarDate.month;
      sDay = solarDate.day;
    } else if (_useKoreanManseryeok && _manseryeok) {
      try {
        const converted = _manseryeok.lunarToSolar(birthYear, birthMonth, birthDay);
        sYear = converted.solar.year;
        sMonth = converted.solar.month;
        sDay = converted.solar.day;
      } catch {
        // Fallback to lunar-typescript
        const lunar = Lunar.fromYmd(birthYear, birthMonth, birthDay);
        const solar = lunar.getSolar();
        sYear = solar.getYear();
        sMonth = solar.getMonth();
        sDay = solar.getDay();
      }
    } else {
      const lunar = Lunar.fromYmd(birthYear, birthMonth, birthDay);
      const solar = lunar.getSolar();
      sYear = solar.getYear();
      sMonth = solar.getMonth();
      sDay = solar.getDay();
    }
  }

  let pillars: [SajuPillar, SajuPillar, SajuPillar, SajuPillar];

  if (_useKoreanManseryeok && _manseryeok) {
    try {
      const kr = _manseryeok.calculateSaju(sYear, sMonth, sDay, birthHour);
      pillars = [
        makePillarFromHanja(kr.yearPillarHanja, '年柱'),
        makePillarFromHanja(kr.monthPillarHanja, '月柱'),
        makePillarFromHanja(kr.dayPillarHanja, '日柱'),
        makePillarFromHanja(kr.hourPillarHanja || '', '時柱'),
      ];
    } catch {
      // Fallback to lunar-typescript
      pillars = getPillarsFromLunarTs(sYear, sMonth, sDay, birthHour);
    }
  } else {
    pillars = getPillarsFromLunarTs(sYear, sMonth, sDay, birthHour);
  }

  const dominant = findDominantElement(pillars);
  const fortunes = elementFortunes[dominant];
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];

  return {
    birthDate: new Date(sYear, sMonth - 1, sDay),
    birthHour,
    isLunar,
    pillars,
    dominantElement: dominant,
    fortune,
  };
}

function getPillarsFromLunarTs(sYear: number, sMonth: number, sDay: number, birthHour: number): [SajuPillar, SajuPillar, SajuPillar, SajuPillar] {
  const solar = Solar.fromYmdHms(sYear, sMonth, sDay, birthHour, 0, 0);
  const ec = solar.getLunar().getEightChar();
  return [
    makePillar(ec.getYearGan(), ec.getYearZhi(), '年柱'),
    makePillar(ec.getMonthGan(), ec.getMonthZhi(), '月柱'),
    makePillar(ec.getDayGan(), ec.getDayZhi(), '日柱'),
    makePillar(ec.getTimeGan(), ec.getTimeZhi(), '時柱'),
  ];
}

function makePillarFromHanja(hanja: string, label: string): SajuPillar {
  // hanja is 2-char like "戊寅"
  return makePillar(hanja[0], hanja[1], label);
}

// --- Compatibility exports (used by other modules) ---
// These are kept for backward compatibility but now delegate to lunar-typescript indices

function getYearStemIndex(sajuYear: number): number {
  return ((sajuYear - 4) % 10 + 10) % 10;
}

function getYearBranchIndex(sajuYear: number): number {
  return ((sajuYear - 4) % 12 + 12) % 12;
}

function getDayStemIndex(year: number, month: number, day: number): number {
  const solar = Solar.fromYmd(year, month, day);
  const gan = solar.getLunar().getEightChar().getDayGan();
  return stemIndex(gan);
}

function getDayBranchIndex(year: number, month: number, day: number): number {
  const solar = Solar.fromYmd(year, month, day);
  const zhi = solar.getLunar().getEightChar().getDayZhi();
  return branchIndex(zhi);
}

function getHourBranchIndex(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2);
}

function getMonthStemIndex(yearStemIndex: number, monthBranchIndex: number): number {
  const base = ((yearStemIndex % 5) * 2 + 2) % 10;
  const monthsFromYin = ((monthBranchIndex - 2) + 12) % 12;
  return (base + monthsFromYin) % 10;
}

export { getYearStemIndex, getYearBranchIndex, getDayStemIndex, getDayBranchIndex, getHourBranchIndex, getMonthStemIndex };
