#!/usr/bin/env node
/* LedgerPeer static source integrity checker.
 * Run from the repository root: node scripts/check-notes-coverage.cjs
 * Strict mode (known to fail until all outcomes are certified):
 *   node scripts/check-notes-coverage.cjs --strict
 * This checks data integrity, NOT correctness of accounting teaching.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
function jsonAssignment(src, marker) {
  const i = src.indexOf(marker);
  if (i < 0) throw new Error('Cannot find data assignment: ' + marker);
  const start = src.indexOf('{', i + marker.length);
  if (start < 0) throw new Error('Cannot find opening data brace');
  let depth = 0, quoted = false, escape = false;
  for (let j = start; j < src.length; ++j) {
    const c = src[j];
    if (quoted) {
      if (escape) escape = false;
      else if (c === '\\') escape = true;
      else if (c === '"') quoted = false;
    } else if (c === '"') quoted = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return JSON.parse(src.slice(start, j + 1));
  }
  throw new Error('Unclosed JSON object after ' + marker);
}
function inspect() {
  const published = jsonAssignment(read('acca-published-data.js'), 'root.LedgerPublishedSyllabi=');
  const overrides = jsonAssignment(read('notes-uk-syllabi.js'), 'root.LedgerPublishedSyllabi.papers,...');
  const syllabi = Object.assign({}, published.papers, overrides);
  const base = jsonAssignment(read('notes-data.js'), 'root.LedgerFiaNotes=');
  const expanded = jsonAssignment(read('notes-expanded-data.js'), 'Object.assign(notes,');
  const outcome = jsonAssignment(read('notes-outcome-lessons.js'), 'root.LedgerOutcomeLessons=');
  const guides = jsonAssignment(read('fia-study-data-v2.js'), 'window.LedgerFiaGuides=');
  const notes = Object.assign({}, base, expanded);
  // This is exactly how notes-expanded-data.js removes old law/tax variants.
  for (const k of Object.keys(notes)) {
    if (['LW', 'TX', 'ATX'].includes(k.split(':')[0]) &&
        !Object.prototype.hasOwnProperty.call(expanded, k)) delete notes[k];
  }

  const failures = [], caution = [];
  const perPaper = [];
  const seen = new Set();
  let headings = 0, starters = 0, expandedTopics = 0, outcomes = 0, worked = 0;
  for (const [paper, data] of Object.entries(syllabi)) {
    let paperHeads = 0, paperStarters = 0, paperExpanded = 0;
    const local = new Set();
    for (const topic of data.topics || []) {
      const m = /^([A-Z]\d+) · (.+)$/.exec(topic);
      if (!m) { failures.push(paper + ': malformed syllabus heading ' + topic); continue; }
      const key = paper + ':' + m[1];
      if (local.has(key)) failures.push('duplicate syllabus heading: ' + key);
      local.add(key); seen.add(key); headings++; paperHeads++;
      const n = notes[key], detail = outcome[key];
      if (!n) { failures.push('no starter: ' + key); continue; }
      starters++; paperStarters++;
      for (const field of ['summary', 'example', 'check', 'answer', 'trap']) {
        if (typeof n[field] !== 'string' || !n[field].trim()) {
          failures.push(key + ': missing ' + field);
        }
      }
      if (!Array.isArray(n.steps) || n.steps.length === 0) {
        failures.push(key + ': no teaching steps');
      }
      if (n.paper !== paper || n.code !== m[1]) {
        failures.push(key + ': lesson identity mismatch');
      }
      if (detail) {
        expandedTopics++; paperExpanded++;
        const ids = Object.keys(detail.outcomes || {});
        if (!ids.length) failures.push(key + ': empty outcome map');
        ids.forEach((id, k) => {
          if (id !== String.fromCharCode(97 + k)) {
            failures.push(key + ': non-sequential outcome id ' + id);
          }
          const o = detail.outcomes[id];
          if (!['K', 'S'].includes(o.level) || !o.title || !o.explanation) {
            failures.push(key + ':' + id + ' incomplete K/S outcome');
          }
        });
        outcomes += ids.length;
        worked += (detail.workings || []).length;
        if (!String(detail.edition || '').includes('2025')) {
          caution.push(key + ': source edition not explicitly documented as 2025–26');
        }
      }
    }
    perPaper.push([paper, data.variant, paperHeads, paperStarters, paperExpanded]);
  }

  for (const k of Object.keys(outcome)) {
    if (!seen.has(k)) failures.push('outcome data for unknown syllabus heading: ' + k);
  }
  const ui = read('notes-page.js');
  if (!ui.includes('officialSyllabusPages') ||
      !ui.includes('financialExaminableDocs')) {
    failures.push('missing 2026–27 official reference wiring in notes-page.js');
  }
  if (!read('notes.html').includes('notes-outcome-lessons.js')) {
    failures.push('outcome data script is not loaded by notes.html');
  }
  if (expandedTopics !== headings) {
    caution.push(String(headings - expandedTopics) + ' headings have no individual outcome expansion');
  }
  if (!read('notes.html').includes('has yet been certified')) {
    failures.push('website must retain the disclaimer about uncertified 2026–27 content');
  }
  const shared = Object.keys(guides.topicChapters || {}).length;
  const chapters = new Set(Object.values(guides.topicChapters || {})).size;
  return {
    headings, starters, expandedTopics, outcomes, worked, shared, chapters,
    perPaper, failures, caution,
    note: 'Source-integrity checker only. It cannot establish syllabus completeness or calculation accuracy.'
  };
}
const result = inspect();
console.log('LEDGERPEER NOTES AUDIT');
console.log('Headings with starter lessons: ' + result.starters + '/' + result.headings);
console.log('Outcome-expanded headings:   ' + result.expandedTopics + '/' + result.headings);
console.log('Authored individual outcomes: ' + result.outcomes);
console.log('Additional worked examples:  ' + result.worked);
console.log('Shared guide mappings:       ' + result.shared + ' across ' + result.chapters + ' chapters');
for (const [p, v, total, starter, detailed] of result.perPaper) {
  console.log(p.padEnd(4) + ' (' + v + '): starter ' + starter + '/' + total + ', outcome-expanded ' + detailed + '/' + total);
}
result.failures.forEach(msg => console.error('FAIL: ' + msg));
result.caution.forEach(msg => console.warn('REVIEW: ' + msg));
console.log(result.note);
if (result.failures.length) process.exitCode = 1;
if (process.argv.includes('--strict') && result.expandedTopics < result.headings) {
  console.error('STRICT FAIL: individual-outcome coverage is incomplete. This is expected until the notes are fully authored and externally verified.');
  process.exitCode = 2;
}
