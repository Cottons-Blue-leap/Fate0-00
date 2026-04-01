import type { HeavenlyStem, FiveElement } from '../types/fortune';
import { heavenlyStems, earthlyBranches, getSexagenaryCycle, toSexagenaryIndex, dayMasterProfiles } from '../data/saju';
import type { DayMasterProfile } from '../data/saju';
import { getAdjacentTerm } from './solarTerms';
import { getElementInteraction } from './fiveElements';

export type { DayMasterProfile };

export function getDayMasterProfile(stem: HeavenlyStem): DayMasterProfile {
  return dayMasterProfiles.find(p => p.stem === stem) || dayMasterProfiles[0];
}

// === Five Element Landscape ===
export interface ElementLandscape {
  counts: Record<FiveElement, number>;
  dominant: FiveElement;
  deficient: FiveElement;
  analysis: string;
}

const elementNames: Record<FiveElement, string> = { '木': '목', '火': '화', '土': '토', '金': '금', '水': '수' };
const elementColors: Record<FiveElement, string> = { '木': '#2ecc71', '火': '#e74c3c', '土': '#f39c12', '金': '#ecf0f1', '水': '#3498db' };
const elementEmojis: Record<FiveElement, string> = { '木': '🌳', '火': '🔥', '土': '⛰️', '金': '⚔️', '水': '💧' };

export { elementColors, elementEmojis, elementNames };

export function analyzeElements(stems: HeavenlyStem[], branches: string[]): ElementLandscape {
  const counts: Record<FiveElement, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  // Count stem elements
  for (const s of stems) {
    const found = heavenlyStems.find(h => h.stem === s);
    if (found) counts[found.element]++;
  }

  // Count branch elements INCLUDING 지장간 (hidden stems)
  for (const b of branches) {
    const found = earthlyBranches.find(e => e.branch === b);
    if (found) {
      for (const hidden of found.hiddenStems) {
        // Normalize weight: 본기=1.0, 중기=0.5, 여기=0.3
        counts[hidden.element] += hidden.weight / 10;
      }
    }
  }

  let dominant: FiveElement = '木', deficient: FiveElement = '木';
  let maxC = 0, minC = 999;
  for (const [el, c] of Object.entries(counts) as [FiveElement, number][]) {
    if (c > maxC) { maxC = c; dominant = el; }
    if (c < minC) { minC = c; deficient = el; }
  }

  const analysisKey = `sajuAnalysis.${dominant}`;
  return { counts, dominant, deficient, analysis: analysisKey };
}

// === 대운 (Major Fortune Cycle) ===
export interface DaeunPeriod {
  startAge: number;
  endAge: number;
  stem: HeavenlyStem;
  branch: string;
  element: FiveElement;
  interaction: 'clash' | 'harmony' | 'neutral';
  description: string;
}

// Five Element interaction imported from fiveElements.ts

/**
 * Calculate 대운 (Major Fortune Periods).
 *
 * Standard method:
 * 1. Determine direction: 양남음녀 = forward (순행), 음남양녀 = backward (역행)
 * 2. Starting point: month pillar's position in the 60갑자 cycle
 * 3. Each period advances/retreats by 1 in the 60갑자 cycle
 * 4. Start age: calculated from birth date to next/prev 절기
 *
 * @param monthStemIdx - Month pillar stem index
 * @param monthBranchIdx - Month pillar branch index
 * @param yearStemIdx - Year pillar stem index (for determining 양/음)
 * @param gender - Gender
 * @param birthDate - Birth date (for start age calculation)
 * @param dayMasterElement - Day master's element (for interaction analysis)
 */
export function calculateDaeun(
  monthStemIdx: number,
  monthBranchIdx: number,
  yearStemIdx: number,
  gender: 'male' | 'female',
  birthDate?: Date,
  dayMasterElement?: FiveElement,
): DaeunPeriod[] {
  const isYangStem = yearStemIdx % 2 === 0;
  const isForward = (isYangStem && gender === 'male') || (!isYangStem && gender === 'female');

  // Calculate start age from birth date to adjacent 절기
  let startAge = 3; // default fallback
  if (birthDate) {
    const direction = isForward ? 'next' : 'prev';
    const adjacentTerm = getAdjacentTerm(birthDate, direction);
    const diffMs = Math.abs(adjacentTerm.date.getTime() - birthDate.getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    // 3 days = 1 year of 대운, rounded
    startAge = Math.round(diffDays / 3);
    if (startAge < 1) startAge = 1;
    if (startAge > 10) startAge = 10;
  }

  // Get month pillar's 60갑자 index
  const monthSexagenaryIdx = toSexagenaryIndex(monthStemIdx, monthBranchIdx);

  const periods: DaeunPeriod[] = [];
  for (let i = 0; i < 8; i++) {
    // Advance or retreat in the 60갑자 cycle
    const offset = isForward ? i + 1 : -(i + 1);
    const sexagenaryIdx = ((monthSexagenaryIdx + offset) % 60 + 60) % 60;
    const { stemIdx, branchIdx } = getSexagenaryCycle(sexagenaryIdx);

    const stem = heavenlyStems[stemIdx];
    const branch = earthlyBranches[branchIdx];
    const periodStartAge = startAge + i * 10;

    // Determine interaction with day master
    const interaction = dayMasterElement
      ? getElementInteraction(dayMasterElement, stem.element)
      : (['harmony', 'neutral', 'clash', 'neutral', 'harmony'] as const)[i % 5];

    periods.push({
      startAge: periodStartAge,
      endAge: periodStartAge + 9,
      stem: stem.stem,
      branch: branch.branch,
      element: stem.element,
      interaction,
      description: `daeunDesc.${interaction}`,
    });
  }

  return periods;
}
