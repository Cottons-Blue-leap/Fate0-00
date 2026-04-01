/**
 * Lunar-Solar calendar conversion wrapper.
 *
 * Uses the `korean-lunar-calendar` package (installed in root workspace).
 */

export interface SolarDate {
  year: number;
  month: number;
  day: number;
}

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
}

// Dynamic import cache
let KoreanLunarCalendar: any = null;
let loadAttempted = false;

async function loadCalendar() {
  if (KoreanLunarCalendar) return KoreanLunarCalendar;
  if (loadAttempted) return null;
  loadAttempted = true;
  try {
    const mod = await import('korean-lunar-calendar');
    KoreanLunarCalendar = mod.default || mod;
    return KoreanLunarCalendar;
  } catch {
    console.warn('korean-lunar-calendar not available');
    return null;
  }
}

/**
 * Convert a lunar date to solar date (async).
 * Call this before passing to saju engine.
 */
export async function lunarToSolarAsync(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth: boolean = false,
): Promise<SolarDate> {
  const Cal = await loadCalendar();
  if (!Cal) return { year: lunarYear, month: lunarMonth, day: lunarDay };

  const calendar = new Cal();
  calendar.setLunarDate(lunarYear, lunarMonth, lunarDay, isLeapMonth);
  const solar = calendar.getSolarCalendar();
  return { year: solar.year, month: solar.month, day: solar.day };
}

/**
 * Synchronous version — uses cached module. Call lunarToSolarAsync first to warm cache.
 * Falls back to returning lunar date as-is if module not loaded.
 */
export function lunarToSolar(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth: boolean = false,
): SolarDate {
  if (!KoreanLunarCalendar) {
    // Try sync require as fallback (works in Node, may work in bundled builds)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      // @ts-expect-error — dynamic require fallback for non-ESM environments
      KoreanLunarCalendar = require('korean-lunar-calendar');
    } catch {
      return { year: lunarYear, month: lunarMonth, day: lunarDay };
    }
  }
  const calendar = new KoreanLunarCalendar();
  calendar.setLunarDate(lunarYear, lunarMonth, lunarDay, isLeapMonth);
  const solar = calendar.getSolarCalendar();
  return { year: solar.year, month: solar.month, day: solar.day };
}

/**
 * Convert a solar date to lunar date.
 */
export function solarToLunar(
  solarYear: number,
  solarMonth: number,
  solarDay: number,
): LunarDate {
  if (!KoreanLunarCalendar) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      // @ts-expect-error — dynamic require fallback for non-ESM environments
      KoreanLunarCalendar = require('korean-lunar-calendar');
    } catch {
      return { year: solarYear, month: solarMonth, day: solarDay, isLeapMonth: false };
    }
  }
  const calendar = new KoreanLunarCalendar();
  calendar.setSolarDate(solarYear, solarMonth, solarDay);
  const lunar = calendar.getLunarCalendar();
  return {
    year: lunar.year,
    month: lunar.month,
    day: lunar.day,
    isLeapMonth: lunar.isLeapMonth ?? false,
  };
}
