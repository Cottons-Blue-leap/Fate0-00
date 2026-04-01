#!/usr/bin/env node
/**
 * CSV → TypeScript Data Builder
 *
 * Reads CSV files from data/csv/ and generates TypeScript files in src/data/generated/.
 * Run: node packages/shared/scripts/build-data.mjs
 *
 * Validates:
 * - Required fields present
 * - Omikuji weights sum to 100
 * - No duplicate IDs
 * - All tarot cards 0-21 present
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_DIR = join(__dirname, '..', 'data', 'csv');
const OUT_DIR = join(__dirname, '..', 'src', 'data', 'generated');

// --- CSV Parser ---
function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = (values[i] || '').trim(); });
    return obj;
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function readCSV(filename) {
  let content = readFileSync(join(CSV_DIR, filename), 'utf-8');
  // Strip UTF-8 BOM if present (Excel compatibility)
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  return parseCSV(content);
}

function escStr(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

// --- Validators ---
const errors = [];
function assert(condition, msg) {
  if (!condition) { errors.push(`ERROR: ${msg}`); }
}
function warn(msg) { console.warn(`WARN: ${msg}`); }

// --- Build: Tarot ---
function buildTarot() {
  const rows = readCSV('tarot_cards.csv');
  assert(rows.length === 22, `tarot_cards.csv: expected 22 rows, got ${rows.length}`);

  const ids = new Set();
  for (const r of rows) {
    const id = parseInt(r.id);
    assert(!ids.has(id), `tarot_cards.csv: duplicate id ${id}`);
    assert(r.name, `tarot_cards.csv: missing name for id ${id}`);
    assert(r.nameKo, `tarot_cards.csv: missing nameKo for id ${id}`);
    assert(r.upright, `tarot_cards.csv: missing upright for id ${id}`);
    assert(r.reversed, `tarot_cards.csv: missing reversed for id ${id}`);
    ids.add(id);
  }
  for (let i = 0; i < 22; i++) {
    assert(ids.has(i), `tarot_cards.csv: missing card id ${i}`);
  }

  const cards = rows.map(r =>
    `  { id: ${r.id}, name: '${escStr(r.name)}', nameKo: '${escStr(r.nameKo)}', image: '', upright: '${escStr(r.upright)}', reversed: '${escStr(r.reversed)}', keywords: ['${escStr(r.keyword1)}', '${escStr(r.keyword2)}', '${escStr(r.keyword3)}'] }`
  ).join(',\n');

  const symbols = rows.map(r =>
    `  ${r.id}: '${escStr(r.emoji)}'`
  ).join(',\n');

  writeFileSync(join(OUT_DIR, 'tarot.gen.ts'), `// AUTO-GENERATED from csv/tarot_cards.csv — DO NOT EDIT MANUALLY
import type { TarotCard } from '../../types/fortune';

export const majorArcana: TarotCard[] = [
${cards},
];

export const tarotSymbols: Record<number, string> = {
${symbols},
};
`);
  console.log('  tarot.gen.ts ✓ (22 cards)');
}

// --- Build: Horoscope ---
function buildHoroscope() {
  const signs = readCSV('horoscope_signs.csv');
  const fortunes = readCSV('horoscope_fortunes.csv');

  assert(signs.length === 12, `horoscope_signs.csv: expected 12 rows, got ${signs.length}`);

  const categories = {};
  for (const f of fortunes) {
    if (!categories[f.category]) categories[f.category] = [];
    categories[f.category].push(f.text);
  }
  for (const cat of ['overall', 'love', 'career', 'luckyColor']) {
    assert(categories[cat], `horoscope_fortunes.csv: missing category "${cat}"`);
    assert(categories[cat].length >= 12, `horoscope_fortunes.csv: "${cat}" has ${categories[cat]?.length || 0} entries, need ≥12`);
  }

  const signsArr = signs.map(s =>
    `  { sign: '${s.sign}' as const, nameKo: '${escStr(s.nameKo)}', symbol: '${escStr(s.symbol)}', dateRange: '${s.dateStart} - ${s.dateEnd}', element: '${s.element}' as const }`
  ).join(',\n');

  const fortuneObj = Object.entries(categories).map(([cat, texts]) => {
    const key = cat === 'luckyColor' ? 'luckyColors' : cat;
    const arr = texts.map(t => `    '${escStr(t)}'`).join(',\n');
    return `  ${key}: [\n${arr},\n  ]`;
  }).join(',\n');

  writeFileSync(join(OUT_DIR, 'horoscope.gen.ts'), `// AUTO-GENERATED from csv/horoscope_*.csv — DO NOT EDIT MANUALLY
import type { ZodiacInfo } from '../../types/fortune';

export const zodiacSigns: ZodiacInfo[] = [
${signsArr},
];

export const fortuneTexts = {
${fortuneObj},
};
`);
  console.log(`  horoscope.gen.ts ✓ (${signs.length} signs, ${fortunes.length} fortune texts)`);
}

// --- Build: Saju ---
function buildSaju() {
  const stems = readCSV('saju_stems.csv');
  const branches = readCSV('saju_branches.csv');
  const elements = readCSV('saju_elements.csv');

  assert(stems.length === 10, `saju_stems.csv: expected 10 rows, got ${stems.length}`);
  assert(branches.length === 12, `saju_branches.csv: expected 12 rows, got ${branches.length}`);

  const stemsArr = stems.map(s =>
    `  { stem: '${s.stem}' as HeavenlyStem, element: '${s.element}' as FiveElement, nature: '${s.nature}' as const }`
  ).join(',\n');

  const branchesArr = branches.map(b => {
    const hidden = [];
    if (b.hiddenStem1) hidden.push(`{ stem: '${b.hiddenStem1}' as HeavenlyStem, element: '${b.hiddenElement1}' as FiveElement, weight: ${b.hiddenWeight1} }`);
    if (b.hiddenStem2) hidden.push(`{ stem: '${b.hiddenStem2}' as HeavenlyStem, element: '${b.hiddenElement2}' as FiveElement, weight: ${b.hiddenWeight2} }`);
    if (b.hiddenStem3) hidden.push(`{ stem: '${b.hiddenStem3}' as HeavenlyStem, element: '${b.hiddenElement3}' as FiveElement, weight: ${b.hiddenWeight3} }`);
    return `  { branch: '${b.branch}' as EarthlyBranch, element: '${b.element}' as FiveElement, hiddenStems: [${hidden.join(', ')}] }`;
  }).join(',\n');

  const elemGroups = {};
  for (const e of elements) {
    if (!elemGroups[e.element]) elemGroups[e.element] = [];
    elemGroups[e.element].push(e.text);
  }
  const fortunesObj = Object.entries(elemGroups).map(([el, texts]) => {
    const arr = texts.map(t => `'${escStr(t)}'`).join(', ');
    return `  '${el}': [${arr}]`;
  }).join(',\n');

  // Day master profiles from saju_stems.csv
  const profiles = stems.map(s =>
    `  { stem: '${s.stem}' as HeavenlyStem, element: '${s.element}' as FiveElement, nature: '${s.nature === 'yang' ? '양' : '음'}', symbol: '${escStr(s.symbol)}', emoji: '${escStr(s.emoji)}', title: '${escStr(s.title)}', description: '${escStr(s.description)}' }`
  ).join(',\n');

  writeFileSync(join(OUT_DIR, 'saju.gen.ts'), `// AUTO-GENERATED from csv/saju_*.csv — DO NOT EDIT MANUALLY
import type { HeavenlyStem, EarthlyBranch, FiveElement } from '../../types/fortune';

export interface StemData {
  stem: HeavenlyStem;
  element: FiveElement;
  nature: 'yang' | 'yin';
}

export interface BranchData {
  branch: EarthlyBranch;
  element: FiveElement;
  hiddenStems: { stem: HeavenlyStem; element: FiveElement; weight: number }[];
}

export const heavenlyStems: StemData[] = [
${stemsArr},
];

export const earthlyBranches: BranchData[] = [
${branchesArr},
];

export const elementFortunes: Record<FiveElement, string[]> = {
${fortunesObj},
};

export interface DayMasterProfile {
  stem: HeavenlyStem;
  element: FiveElement;
  nature: string;
  symbol: string;
  emoji: string;
  title: string;
  description: string;
}

export const dayMasterProfiles: DayMasterProfile[] = [
${profiles},
];
`);
  console.log(`  saju.gen.ts ✓ (${stems.length} stems, ${branches.length} branches, ${elements.length} element fortunes)`);
}

// --- Build: Omikuji ---
function buildOmikuji() {
  const ranks = readCSV('omikuji_ranks.csv');
  const fortunes = readCSV('omikuji_fortunes.csv');

  assert(ranks.length === 7, `omikuji_ranks.csv: expected 7 rows, got ${ranks.length}`);

  const totalWeight = ranks.reduce((sum, r) => sum + parseInt(r.weight), 0);
  assert(totalWeight === 100, `omikuji_ranks.csv: weights sum to ${totalWeight}, expected 100`);

  // Group fortunes by rank
  const fortunesByRank = {};
  for (const f of fortunes) {
    if (!fortunesByRank[f.rank]) fortunesByRank[f.rank] = [];
    fortunesByRank[f.rank].push(f);
  }

  for (const r of ranks) {
    assert(fortunesByRank[r.rank], `omikuji_fortunes.csv: no fortunes for rank "${r.rank}"`);
    assert(fortunesByRank[r.rank]?.length >= 2, `omikuji_fortunes.csv: rank "${r.rank}" has only ${fortunesByRank[r.rank]?.length} variants, need ≥2`);
  }

  const dataArr = ranks.map(r => {
    const fArr = (fortunesByRank[r.rank] || []).map(f =>
      `      { wish: '${escStr(f.wish)}', relationship: '${escStr(f.relationship)}', travel: '${escStr(f.travel)}', health: '${escStr(f.health)}', general: '${escStr(f.general)}' }`
    ).join(',\n');
    return `  {\n    rank: '${r.rank}' as OmikujiRank, rankKo: '${escStr(r.rankKo)}', weight: ${r.weight},\n    fortunes: [\n${fArr},\n    ],\n  }`;
  }).join(',\n');

  writeFileSync(join(OUT_DIR, 'omikuji.gen.ts'), `// AUTO-GENERATED from csv/omikuji_*.csv — DO NOT EDIT MANUALLY
import type { OmikujiRank } from '../../types/fortune';

interface OmikujiTemplate {
  rank: OmikujiRank;
  rankKo: string;
  weight: number;
  fortunes: Array<{
    wish: string;
    relationship: string;
    travel: string;
    health: string;
    general: string;
  }>;
}

export const omikujiData: OmikujiTemplate[] = [
${dataArr},
];
`);
  console.log(`  omikuji.gen.ts ✓ (${ranks.length} ranks, ${fortunes.length} fortune variants, weight sum: ${totalWeight})`);
}

// --- Main ---
console.log('Building fortune data from CSV...');
console.log(`  Source: ${CSV_DIR}`);
console.log(`  Output: ${OUT_DIR}`);
console.log('');

buildTarot();
buildHoroscope();
buildSaju();
buildOmikuji();

console.log('');
if (errors.length > 0) {
  console.error('VALIDATION ERRORS:');
  errors.forEach(e => console.error(`  ${e}`));
  process.exit(1);
} else {
  console.log('All validations passed. Data build complete.');
}
