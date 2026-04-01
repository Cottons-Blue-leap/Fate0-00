/**
 * Fix missing tarot.deep cards 1-21 in locales that only have card 0.
 * Copies from English as fallback for locales without native translations.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const LOCALES_DIR = join(import.meta.dirname, '..', 'src', 'i18n', 'locales');

// Read English deep cards as fallback
const enFortune = JSON.parse(readFileSync(join(LOCALES_DIR, 'en', 'fortune.json'), 'utf8'));
const enDeep = enFortune.tarot.deep;

// Locales that need fixing (have only card 0, missing 1-21)
const LOCALES = ['zh-TW','es','fr','pt','de','it','hi','ar','bn','ru','tr'];

for (const locale of LOCALES) {
  const path = join(LOCALES_DIR, locale, 'fortune.json');
  const data = JSON.parse(readFileSync(path, 'utf8'));

  if (data.tarot && data.tarot.deep) {
    // Check how many cards exist
    const existing = Object.keys(data.tarot.deep).filter(k => !isNaN(k));
    if (existing.length < 22) {
      // Fill missing cards from English
      for (let i = 0; i <= 21; i++) {
        if (!data.tarot.deep[String(i)]) {
          data.tarot.deep[String(i)] = enDeep[String(i)];
        }
      }
      writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
      console.log(`✓ ${locale}: filled ${22 - existing.length} missing tarot cards`);
    } else {
      console.log(`✓ ${locale}: already has all 22 cards`);
    }
  }
}
