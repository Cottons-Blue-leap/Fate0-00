/**
 * Daily Saju Engine — powered by lunar-typescript
 *
 * Calculates today's pillar and fortune interaction with user's day master.
 */

import type { HeavenlyStem, EarthlyBranch, FiveElement } from '../types/fortune';
import { heavenlyStems, earthlyBranches } from '../data/saju';
import { Solar } from 'lunar-typescript';

// --- Types ---

export interface DailyPillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  element: FiveElement;
  branchElement: FiveElement;
}

let _pillarCache: { key: string; pillar: DailyPillar } | null = null;

export function getTodayPillar(date: Date = new Date()): DailyPillar {
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  if (_pillarCache?.key === key) return _pillarCache.pillar;

  const solar = Solar.fromYmdHms(
    date.getFullYear(), date.getMonth() + 1, date.getDate(),
    date.getHours(), 0, 0,
  );
  const ec = solar.getLunar().getEightChar();
  const ganStr = ec.getDayGan();
  const zhiStr = ec.getDayZhi();

  const stemData = heavenlyStems.find(s => s.stem === ganStr) || heavenlyStems[0];
  const branchData = earthlyBranches.find(b => b.branch === zhiStr) || earthlyBranches[0];

  const pillar: DailyPillar = {
    stem: stemData.stem,
    branch: branchData.branch,
    element: stemData.element,
    branchElement: branchData.element,
  };
  _pillarCache = { key, pillar };
  return pillar;
}

import { getInteraction, hashString } from './fiveElements';
import type { Interaction } from './fiveElements';
export type { Interaction };

export interface DailyFortune {
  todayPillar: DailyPillar;
  interaction: Interaction;
  overallScore: number;
  categories: {
    career: number;
    love: number;
    health: number;
    wealth: number;
  };
  adviceKey: string;
  dateStr: string;
}

function hashDate(date: Date, salt: string): number {
  return hashString(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${salt}`);
}

export function getDailyFortune(dayMasterElement: FiveElement, date: Date = new Date()): DailyFortune {
  const todayPillar = getTodayPillar(date);
  const interaction = getInteraction(dayMasterElement, todayPillar.element);

  const baseScores: Record<Interaction, number> = {
    same: 4, generate: 5, generated: 3, restrain: 2, restrained: 1,
  };
  const base = baseScores[interaction];

  const seed = hashDate(date, dayMasterElement);
  const variation = (seed % 3) - 1;
  const overall = Math.max(1, Math.min(5, base + variation));

  const categories = {
    career: Math.max(1, Math.min(5, base + ((seed >> 2) % 3) - 1)),
    love: Math.max(1, Math.min(5, base + ((seed >> 4) % 3) - 1)),
    health: Math.max(1, Math.min(5, base + ((seed >> 6) % 3) - 1)),
    wealth: Math.max(1, Math.min(5, base + ((seed >> 8) % 3) - 1)),
  };

  const adviceKey = `sajuDaily.advice.${interaction}.${seed % 3}`;

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return { todayPillar, interaction, overallScore: overall, categories, adviceKey, dateStr };
}
