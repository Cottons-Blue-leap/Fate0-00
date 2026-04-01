/**
 * Translation audit script — compare all locales against Korean (ko) as ground truth.
 * Run: node scripts/audit-translations.mjs
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const LOCALES_DIR = join(import.meta.dirname, '..', 'src', 'i18n', 'locales');
const LOCALES = ['en','ja','zh-CN','zh-TW','es','fr','pt','de','it','hi','ar','bn','ru','tr'];
const FILES = ['fortune.json', 'common.json'];

function readJson(p) { return JSON.parse(readFileSync(p, 'utf8')); }

// Extract all leaf key paths from an object
function getKeyPaths(obj, prefix = '') {
  const paths = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      paths.push(...getKeyPaths(v, path));
    } else if (Array.isArray(v)) {
      // For arrays, check length and each element's keys if objects
      paths.push(path + `[len=${v.length}]`);
      // Also recurse into array elements if they're objects
      v.forEach((item, i) => {
        if (item && typeof item === 'object') {
          paths.push(...getKeyPaths(item, `${path}[${i}]`));
        }
      });
    } else {
      paths.push(path);
    }
  }
  return paths;
}

// Get value at dot-separated path
function getVal(obj, path) {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return cur;
}

// Extract {{var}} template variables from a string
function extractVars(str) {
  if (typeof str !== 'string') return [];
  return [...str.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]).sort();
}

// Check if a string contains Korean characters
function hasKorean(str) {
  if (typeof str !== 'string') return false;
  return /[\uAC00-\uD7A3\u3131-\u3163]/.test(str);
}

// ============================================================

const issues = {};
for (const locale of LOCALES) issues[locale] = [];

for (const file of FILES) {
  const koPath = join(LOCALES_DIR, 'ko', file);
  const ko = readJson(koPath);
  const koLeafs = getKeyPaths(ko);

  // Extract only non-array leaf paths (skip array length markers)
  const koSimplePaths = koLeafs.filter(p => !p.includes('['));

  for (const locale of LOCALES) {
    const targetPath = join(LOCALES_DIR, locale, file);
    let target;
    try { target = readJson(targetPath); } catch(e) {
      issues[locale].push(`❌ ${file}: Cannot read file — ${e.message}`);
      continue;
    }

    const targetLeafs = getKeyPaths(target);
    const targetSimplePaths = targetLeafs.filter(p => !p.includes('['));

    // 1. Missing keys (in ko but not in target)
    for (const kp of koSimplePaths) {
      const koVal = getVal(ko, kp);
      const targetVal = getVal(target, kp);

      if (targetVal === undefined) {
        issues[locale].push(`🔑 ${file}: Missing key "${kp}"`);
      }
    }

    // 2. Extra keys (in target but not in ko)
    for (const tp of targetSimplePaths) {
      const koVal = getVal(ko, tp);
      if (koVal === undefined) {
        issues[locale].push(`➕ ${file}: Extra key "${tp}" (not in ko)`);
      }
    }

    // 3. Template variable mismatch
    for (const kp of koSimplePaths) {
      const koVal = getVal(ko, kp);
      const targetVal = getVal(target, kp);
      if (typeof koVal === 'string' && typeof targetVal === 'string') {
        const koVars = extractVars(koVal);
        const targetVars = extractVars(targetVal);
        if (koVars.length > 0 && JSON.stringify(koVars) !== JSON.stringify(targetVars)) {
          issues[locale].push(`⚠️ ${file}: Template var mismatch at "${kp}" — ko: {{${koVars.join(',')}}} vs ${locale}: {{${targetVars.join(',')}}}`);
        }
      }
    }

    // 4. Untranslated Korean text (for non-ko locales)
    for (const kp of koSimplePaths) {
      const koVal = getVal(ko, kp);
      const targetVal = getVal(target, kp);
      if (typeof koVal === 'string' && typeof targetVal === 'string') {
        // Skip if it's a template variable only or Chinese character key
        if (targetVal === koVal && koVal.length > 5 && !kp.includes('elementName')) {
          issues[locale].push(`🇰🇷 ${file}: Untranslated (same as ko) at "${kp}": "${koVal.slice(0, 40)}..."`);
        }
        // Check for Korean chars in non-CJK locales
        if (!['ja','zh-CN','zh-TW'].includes(locale) && hasKorean(targetVal) && !kp.includes('elementName')) {
          issues[locale].push(`🇰🇷 ${file}: Korean text found in ${locale} at "${kp}": "${targetVal.slice(0, 40)}..."`);
        }
      }
    }

    // 5. Empty or null values
    for (const kp of koSimplePaths) {
      const targetVal = getVal(target, kp);
      if (targetVal === '' || targetVal === null) {
        issues[locale].push(`🚫 ${file}: Empty/null value at "${kp}"`);
      }
    }

    // 6. Array length mismatches
    const koArrayPaths = koLeafs.filter(p => p.includes('[len='));
    const targetArrayPaths = targetLeafs.filter(p => p.includes('[len='));
    for (const kap of koArrayPaths) {
      const basePath = kap.split('[len=')[0];
      const koLen = parseInt(kap.match(/\[len=(\d+)\]/)[1]);
      const matchTarget = targetArrayPaths.find(p => p.startsWith(basePath + '[len='));
      if (matchTarget) {
        const targetLen = parseInt(matchTarget.match(/\[len=(\d+)\]/)[1]);
        if (koLen !== targetLen) {
          issues[locale].push(`📏 ${file}: Array length mismatch at "${basePath}" — ko: ${koLen} vs ${locale}: ${targetLen}`);
        }
      }
    }
  }
}

// ============================================================
// REPORT
// ============================================================

let totalIssues = 0;
console.log('═══════════════════════════════════════');
console.log('  TRANSLATION AUDIT REPORT (vs ko)');
console.log('═══════════════════════════════════════\n');

for (const locale of LOCALES) {
  const locIssues = issues[locale];
  totalIssues += locIssues.length;
  if (locIssues.length === 0) {
    console.log(`✅ ${locale}: No issues found`);
  } else {
    console.log(`\n❌ ${locale}: ${locIssues.length} issue(s)`);
    for (const issue of locIssues) {
      console.log(`   ${issue}`);
    }
  }
}

console.log(`\n═══════════════════════════════════════`);
console.log(`  Total: ${totalIssues} issues across ${LOCALES.length} locales`);
console.log(`═══════════════════════════════════════`);
