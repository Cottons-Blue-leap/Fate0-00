// Re-export data from generated (source of truth: data/csv/saju_*.csv)
export { heavenlyStems, earthlyBranches, elementFortunes, dayMasterProfiles } from './generated/saju.gen';
export type { StemData, BranchData, DayMasterProfile } from './generated/saju.gen';

/** 60 갑자 (Sexagenary Cycle) lookup — stem index and branch index pairs */
export function getSexagenaryCycle(index: number): { stemIdx: number; branchIdx: number } {
  const normalized = ((index % 60) + 60) % 60;
  return {
    stemIdx: normalized % 10,
    branchIdx: normalized % 12,
  };
}

/** Get the 60갑자 index from stem and branch indices */
export function toSexagenaryIndex(stemIdx: number, branchIdx: number): number {
  for (let n = 0; n < 60; n++) {
    if (n % 10 === stemIdx && n % 12 === branchIdx) return n;
  }
  return 0;
}
