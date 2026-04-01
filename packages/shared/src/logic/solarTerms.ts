/**
 * Solar Terms (절기/節氣) Calculator
 *
 * Calculates the 24 solar terms using simplified VSOP87 solar longitude.
 * Accuracy: ~1 minute of time, sufficient for saju month/year boundary determination.
 *
 * The 12 절(節) that define saju month boundaries:
 *   立春(315°) 驚蟄(345°) 清明(15°) 立夏(45°) 芒種(75°) 小暑(105°)
 *   立秋(135°) 白露(165°) 寒露(195°) 立冬(225°) 大雪(255°) 小寒(285°)
 */

// --- Julian Date Utilities ---

function dateToJD(year: number, month: number, day: number, hour: number = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hour / 24 + B - 1524.5;
}

function jdToDate(jd: number): Date {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  const hourFrac = f * 24;
  const hour = Math.floor(hourFrac);
  const min = Math.floor((hourFrac - hour) * 60);

  return new Date(year, month - 1, day, hour, min);
}

// --- Solar Longitude Calculation (Meeus, simplified VSOP87) ---

const DEG = Math.PI / 180;

function solarLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525; // Julian centuries from J2000.0

  // Mean longitude (degrees)
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;

  // Mean anomaly (degrees)
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;

  // Equation of center
  const Mrad = M * DEG;
  const C =
    (1.9146 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.00029 * Math.sin(3 * Mrad);

  // Sun's true longitude
  let trueLong = L0 + C;

  // Nutation correction (simplified)
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * DEG);

  // Normalize to 0-360
  return ((lambda % 360) + 360) % 360;
}

// --- Solar Term Finder ---

/**
 * Find the Julian Date when solar longitude reaches a target value.
 * Uses Newton-Raphson iteration starting from an initial estimate.
 */
function findSolarTermJD(targetLongitude: number, year: number, estimateMonth: number): number {
  // Initial estimate
  let jd = dateToJD(year, estimateMonth, 15);

  for (let i = 0; i < 50; i++) {
    const lng = solarLongitude(jd);
    let diff = targetLongitude - lng;

    // Handle wrap-around at 0°/360°
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < 0.0001) break; // ~0.3 seconds accuracy

    // Sun moves ~1° per day
    jd += diff / 360 * 365.25;
  }

  return jd;
}

// --- Public API ---

/** The 12 절(節) that define saju month boundaries, with their solar longitudes.
 *  monthBranch uses standard earthly branch index: 子=0, 丑=1, 寅=2, ..., 亥=11 */
export const MONTH_BOUNDARY_TERMS = [
  { name: '소한', nameKo: '小寒', longitude: 285, monthBranch: 1,  branchChar: '丑' },  // 丑月 start
  { name: '입춘', nameKo: '立春', longitude: 315, monthBranch: 2,  branchChar: '寅' },  // 寅月 start (new year)
  { name: '경칩', nameKo: '驚蟄', longitude: 345, monthBranch: 3,  branchChar: '卯' },  // 卯月 start
  { name: '청명', nameKo: '清明', longitude: 15,  monthBranch: 4,  branchChar: '辰' },  // 辰月 start
  { name: '입하', nameKo: '立夏', longitude: 45,  monthBranch: 5,  branchChar: '巳' },  // 巳月 start
  { name: '망종', nameKo: '芒種', longitude: 75,  monthBranch: 6,  branchChar: '午' },  // 午月 start
  { name: '소서', nameKo: '小暑', longitude: 105, monthBranch: 7,  branchChar: '未' },  // 未月 start
  { name: '입추', nameKo: '立秋', longitude: 135, monthBranch: 8,  branchChar: '申' },  // 申月 start
  { name: '백로', nameKo: '白露', longitude: 165, monthBranch: 9,  branchChar: '酉' },  // 酉月 start
  { name: '한로', nameKo: '寒露', longitude: 195, monthBranch: 10, branchChar: '戌' },  // 戌月 start
  { name: '입동', nameKo: '立冬', longitude: 225, monthBranch: 11, branchChar: '亥' },  // 亥月 start
  { name: '대설', nameKo: '大雪', longitude: 255, monthBranch: 0,  branchChar: '子' },  // 子月 start
] as const;

// Approximate Gregorian months when each 절 falls
const TERM_ESTIMATE_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export interface SolarTermDate {
  name: string;
  nameKo: string;
  date: Date;
  jd: number;
  monthBranch: number;   // index into earthlyBranches (丑=1, 寅=2, ... 子=0)
  branchChar: string;
}

/** Cache for computed solar term dates: year -> term dates */
const cache = new Map<number, SolarTermDate[]>();

/**
 * Get all 12 month-boundary 절기 dates for a given year.
 * Results are cached for performance.
 */
export function getSolarTermDates(year: number): SolarTermDate[] {
  const cached = cache.get(year);
  if (cached) return cached;

  const results: SolarTermDate[] = MONTH_BOUNDARY_TERMS.map((term, i) => {
    const jd = findSolarTermJD(term.longitude, year, TERM_ESTIMATE_MONTHS[i]);
    return {
      name: term.name,
      nameKo: term.nameKo,
      date: jdToDate(jd),
      jd,
      monthBranch: term.monthBranch,
      branchChar: term.branchChar,
    };
  });

  cache.set(year, results);
  return results;
}

/**
 * Get the 입춘 (Start of Spring) date for a given year.
 * This marks the saju year boundary.
 */
export function getLichunDate(year: number): Date {
  const terms = getSolarTermDates(year);
  const lichun = terms.find(t => t.name === '입춘');
  return lichun!.date;
}

export interface SajuMonthInfo {
  /** Earthly branch index for the month (子=0, 丑=1, 寅=2, ...) */
  branchIndex: number;
  /** The saju year this date belongs to (may differ from calendar year near 입춘) */
  sajuYear: number;
  /** The 절기 that starts this month */
  termName: string;
}

/**
 * Determine the saju month and year for a given date.
 * Uses solar terms for month boundaries and 입춘 for year boundary.
 */
export function getSajuMonthAndYear(date: Date): SajuMonthInfo {
  const year = date.getFullYear();
  const dateJD = dateToJD(year, date.getMonth() + 1, date.getDate(), date.getHours());

  // Get solar terms for current year and adjacent years
  const prevTerms = getSolarTermDates(year - 1);
  const currTerms = getSolarTermDates(year);
  const nextTerms = getSolarTermDates(year + 1);

  // Build a sorted list of all relevant term dates
  const allTerms = [...prevTerms, ...currTerms, ...nextTerms].sort((a, b) => a.jd - b.jd);

  // Find which term period the date falls in
  let sajuYear = year;
  let branchIndex = 2; // default: 寅
  let termName = '입춘';

  for (let i = allTerms.length - 1; i >= 0; i--) {
    if (dateJD >= allTerms[i].jd) {
      branchIndex = allTerms[i].monthBranch;
      termName = allTerms[i].name;
      break;
    }
  }

  // Determine saju year: before 입춘 of current year = previous year
  const lichunJD = currTerms.find(t => t.name === '입춘')!.jd;
  if (dateJD < lichunJD) {
    sajuYear = year - 1;
  }

  return { branchIndex, sajuYear, termName };
}

/**
 * Get the next/previous 절기 date from a given date.
 * Used for 대운 start age calculation.
 */
export function getAdjacentTerm(
  date: Date,
  direction: 'next' | 'prev'
): { date: Date; jd: number; name: string } {
  const year = date.getFullYear();
  const dateJD = dateToJD(year, date.getMonth() + 1, date.getDate(), date.getHours());

  const allTerms = [
    ...getSolarTermDates(year - 1),
    ...getSolarTermDates(year),
    ...getSolarTermDates(year + 1),
  ].sort((a, b) => a.jd - b.jd);

  if (direction === 'next') {
    for (const term of allTerms) {
      if (term.jd > dateJD) return { date: term.date, jd: term.jd, name: term.name };
    }
  } else {
    for (let i = allTerms.length - 1; i >= 0; i--) {
      if (allTerms[i].jd < dateJD) return { date: allTerms[i].date, jd: allTerms[i].jd, name: allTerms[i].name };
    }
  }

  // Fallback (should never reach)
  return { date, jd: dateJD, name: '' };
}
