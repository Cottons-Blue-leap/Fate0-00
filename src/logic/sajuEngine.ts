import type { SajuPillar, SajuReading, FiveElement } from '../types/fortune';
import { heavenlyStems, earthlyBranches, elementFortunes } from '../data/saju';

function getStemIndex(year: number): number {
  return (year - 4) % 10;
}

function getBranchIndex(year: number): number {
  return (year - 4) % 12;
}

function getMonthStemIndex(yearStemIndex: number, month: number): number {
  const base = (yearStemIndex % 5) * 2;
  return (base + month - 1) % 10;
}

function getMonthBranchIndex(month: number): number {
  return (month + 1) % 12;
}

function getDayStemIndex(year: number, month: number, day: number): number {
  const date = new Date(year, month - 1, day);
  const baseDate = new Date(1900, 0, 1);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  return (diffDays + 10) % 10;
}

function getDayBranchIndex(year: number, month: number, day: number): number {
  const date = new Date(year, month - 1, day);
  const baseDate = new Date(1900, 0, 1);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  return (diffDays + 10) % 12;
}

function getHourBranchIndex(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2);
}

function getHourStemIndex(dayStemIndex: number, hourBranchIndex: number): number {
  const base = (dayStemIndex % 5) * 2;
  return (base + hourBranchIndex) % 10;
}

function makePillar(stemIdx: number, branchIdx: number, label: string): SajuPillar {
  const stem = heavenlyStems[stemIdx];
  const branch = earthlyBranches[branchIdx];
  return {
    stem: stem.stem,
    branch: branch.branch,
    element: stem.element,
    label,
  };
}

function findDominantElement(pillars: SajuPillar[]): FiveElement {
  const counts: Record<FiveElement, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  for (const p of pillars) {
    counts[p.element]++;
    const branchEl = earthlyBranches.find(b => b.branch === p.branch)?.element;
    if (branchEl) counts[branchEl]++;
  }
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

export function getSajuReading(birthYear: number, birthMonth: number, birthDay: number, birthHour: number, isLunar: boolean): SajuReading {
  const yearStemIdx = getStemIndex(birthYear);
  const yearBranchIdx = getBranchIndex(birthYear);
  const monthStemIdx = getMonthStemIndex(yearStemIdx, birthMonth);
  const monthBranchIdx = getMonthBranchIndex(birthMonth);
  const dayStemIdx = getDayStemIndex(birthYear, birthMonth, birthDay);
  const dayBranchIdx = getDayBranchIndex(birthYear, birthMonth, birthDay);
  const hourBranchIdx = getHourBranchIndex(birthHour);
  const hourStemIdx = getHourStemIndex(dayStemIdx, hourBranchIdx);

  const pillars: [SajuPillar, SajuPillar, SajuPillar, SajuPillar] = [
    makePillar(yearStemIdx, yearBranchIdx, '年柱'),
    makePillar(monthStemIdx, monthBranchIdx, '月柱'),
    makePillar(dayStemIdx, dayBranchIdx, '日柱'),
    makePillar(hourStemIdx, hourBranchIdx, '時柱'),
  ];

  const dominant = findDominantElement(pillars);
  const fortunes = elementFortunes[dominant];
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];

  return {
    birthDate: new Date(birthYear, birthMonth - 1, birthDay),
    birthHour,
    isLunar,
    pillars,
    dominantElement: dominant,
    fortune,
  };
}
