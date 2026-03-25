// Get max days for a given month/year
export function getMaxDays(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
