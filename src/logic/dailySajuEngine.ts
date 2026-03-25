import type { HeavenlyStem, EarthlyBranch, FiveElement } from '../types/fortune';
import { heavenlyStems, earthlyBranches } from '../data/saju';

// Calculate today's Heavenly Stem and Earthly Branch (일진, 日辰)
export interface DailyPillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  element: FiveElement;
}

export function getTodayPillar(date: Date = new Date()): DailyPillar {
  const baseDate = new Date(1900, 0, 1); // 1900-01-01 = 庚子
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const stemIdx = ((diffDays % 10) + 6) % 10; // 庚 is index 6
  const branchIdx = ((diffDays % 12) + 0) % 12; // 子 is index 0
  return {
    stem: heavenlyStems[stemIdx].stem,
    branch: earthlyBranches[branchIdx].branch,
    element: heavenlyStems[stemIdx].element,
  };
}

// Five Element interactions
type Interaction = 'generate' | 'restrain' | 'same' | 'generated' | 'restrained';

const generationCycle: Record<FiveElement, FiveElement> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const restraintCycle: Record<FiveElement, FiveElement> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

function getInteraction(myElement: FiveElement, todayElement: FiveElement): Interaction {
  if (myElement === todayElement) return 'same';
  if (generationCycle[myElement] === todayElement) return 'generate';
  if (generationCycle[todayElement] === myElement) return 'generated';
  if (restraintCycle[myElement] === todayElement) return 'restrain';
  return 'restrained';
}

export interface DailyFortune {
  todayPillar: DailyPillar;
  interaction: Interaction;
  overallScore: number; // 1-5
  categories: {
    career: number;   // 1-5
    love: number;     // 1-5
    health: number;   // 1-5
    wealth: number;   // 1-5
  };
  adviceKey: string; // i18n key
  dateStr: string;
}

function hashDate(date: Date, salt: string): number {
  const str = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${salt}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

export function getDailyFortune(dayMasterElement: FiveElement, date: Date = new Date()): DailyFortune {
  const todayPillar = getTodayPillar(date);
  const interaction = getInteraction(dayMasterElement, todayPillar.element);

  // Score based on interaction
  const baseScores: Record<Interaction, number> = {
    same: 4, generate: 5, generated: 3, restrain: 2, restrained: 1,
  };
  const base = baseScores[interaction];

  // Add some daily variation using date hash
  const seed = hashDate(date, dayMasterElement);
  const variation = (seed % 3) - 1; // -1, 0, or 1
  const overall = Math.max(1, Math.min(5, base + variation));

  const categories = {
    career: Math.max(1, Math.min(5, base + ((seed >> 2) % 3) - 1)),
    love: Math.max(1, Math.min(5, base + ((seed >> 4) % 3) - 1)),
    health: Math.max(1, Math.min(5, base + ((seed >> 6) % 3) - 1)),
    wealth: Math.max(1, Math.min(5, base + ((seed >> 8) % 3) - 1)),
  };

  // Advice key based on interaction
  const adviceKey = `sajuDaily.advice.${interaction}.${seed % 3}`;

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return { todayPillar, interaction, overallScore: overall, categories, adviceKey, dateStr };
}
