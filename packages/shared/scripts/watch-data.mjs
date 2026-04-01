#!/usr/bin/env node
/**
 * CSV Data Watcher
 *
 * Watches data/csv/ for changes and auto-rebuilds TypeScript files.
 * Run: node packages/shared/scripts/watch-data.mjs
 */

import { watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_DIR = join(__dirname, '..', 'data', 'csv');
const BUILD_SCRIPT = join(__dirname, 'build-data.mjs');

let debounceTimer = null;
let building = false;

function rebuild() {
  if (building) return;
  building = true;
  const time = new Date().toLocaleTimeString();
  console.log(`\n[${time}] CSV change detected, rebuilding...`);
  try {
    execSync(`node "${BUILD_SCRIPT}"`, { stdio: 'inherit' });
    console.log(`[${time}] Rebuild complete.`);
  } catch (e) {
    console.error(`[${time}] Rebuild failed!`);
  }
  building = false;
}

console.log('Watching CSV files for changes...');
console.log(`  Directory: ${CSV_DIR}`);
console.log('  Press Ctrl+C to stop.\n');

// Initial build
rebuild();

watch(CSV_DIR, { recursive: true }, (eventType, filename) => {
  if (!filename?.endsWith('.csv')) return;
  console.log(`  Changed: ${filename}`);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(rebuild, 300);
});
