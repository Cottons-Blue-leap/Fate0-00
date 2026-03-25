import type { OmikujiReading } from '../types/fortune';
import { omikujiData } from '../data/omikuji';

export function drawOmikuji(): OmikujiReading {
  const totalWeight = omikujiData.reduce((sum, d) => sum + d.weight, 0);
  let random = Math.random() * totalWeight;

  let selected = omikujiData[0];
  for (const entry of omikujiData) {
    random -= entry.weight;
    if (random <= 0) {
      selected = entry;
      break;
    }
  }

  const fortune = selected.fortunes[Math.floor(Math.random() * selected.fortunes.length)];
  const stickNumber = Math.floor(Math.random() * 100) + 1;

  return {
    rank: selected.rank,
    rankKo: selected.rankKo,
    number: stickNumber,
    ...fortune,
  };
}
