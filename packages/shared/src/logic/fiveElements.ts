/**
 * Five Element (五行) interaction logic — single source of truth.
 */

import type { FiveElement } from '../types/fortune';

export type Interaction = 'generate' | 'restrain' | 'same' | 'generated' | 'restrained';

export const generationCycle: Record<FiveElement, FiveElement> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
export const restraintCycle: Record<FiveElement, FiveElement> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

export function getInteraction(myElement: FiveElement, targetElement: FiveElement): Interaction {
  if (myElement === targetElement) return 'same';
  if (generationCycle[myElement] === targetElement) return 'generate';
  if (generationCycle[targetElement] === myElement) return 'generated';
  if (restraintCycle[myElement] === targetElement) return 'restrain';
  return 'restrained';
}

/** Coarser 3-way interaction for 대운 display */
export function getElementInteraction(a: FiveElement, b: FiveElement): 'harmony' | 'clash' | 'neutral' {
  const i = getInteraction(a, b);
  if (i === 'same' || i === 'generate' || i === 'generated') return 'harmony';
  if (i === 'restrain' || i === 'restrained') return 'clash';
  return 'neutral';
}

export function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}
