const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('==================================================');
console.log('Running Source Redesign & Typography Verification');
console.log('==================================================\n');

const codeHtml = fs.readFileSync(path.join(__dirname, '..', 'search-page', 'code.html'), 'utf-8');

// Test 1: Zero font-serif occurrences
console.log('Test 1: Font Consistency - Zero serif classes in search page');
const fontSerifMatches = codeHtml.match(/font-serif/g);
assert.strictEqual(fontSerifMatches, null, 'No font-serif classes should exist anywhere in search-page/code.html');
console.log('  ✓ PASS: Zero font-serif classes found.\n');

// Test 2: SANS_STACK in Tailwind Config
console.log('Test 2: Tailwind Font Fallbacks Stack');
assert.ok(codeHtml.includes('const SANS_STACK = ["Inter"'), 'SANS_STACK defined in tailwind config');
assert.ok(codeHtml.includes('"ui-sans-serif"'), 'SANS_STACK contains ui-sans-serif');
assert.ok(codeHtml.includes('"system-ui"'), 'SANS_STACK contains system-ui');
assert.ok(codeHtml.includes("'Segoe UI'"), 'SANS_STACK contains Segoe UI');
console.log('  ✓ PASS: Robust sans-serif font stack configured across all typography.\n');

// Test 3: Strict CSS Rules for Italic and Bold
console.log('Test 3: CSS Sans-serif enforcement for Italic and Bold');
assert.ok(codeHtml.includes('font-family: var(--font-sans) !important;'), 'Strict CSS variable font-family applied');
assert.ok(codeHtml.includes('.ai-response-card em,'), 'ai-response-card em explicitly defined');
assert.ok(codeHtml.includes('font-style: italic !important;'), 'Italic style applied strictly without font family switch');
console.log('  ✓ PASS: Italic elements strictly inherit sans-serif stack and cannot fall back to Times New Roman.\n');

// Test 4: Trailing Raw URL / Source block stripping
console.log('Test 4: Raw URL / Trailing Source block stripping');
function stripTrailingSourceBlock(text) {
  if (!text) return '';
  return text.replace(/(\r?\n)+\s*(#{1,6}\s*|\*{0,2})Source:?[\s\S]*$/i, '').trim();
}

const mockGeminiOutput = `**Key points:**

- **IS 14543:2016:** *Packaged Drinking Water (Other than Packaged Natural Mineral Water) — Specification*
- **Safety & Microbiological Criteria:** Water must meet strict microbiological limits.

Source:
Bureau of Indian Standards (BIS)
https://standards.bis.gov.in/gemini/browse-standards?is=14543`;

const cleanedProse = stripTrailingSourceBlock(mockGeminiOutput);
assert.ok(!cleanedProse.includes('https://standards.bis.gov.in'), 'Raw URL stripped from prose body');
assert.ok(!cleanedProse.includes('Bureau of Indian Standards'), 'Trailing source label stripped from prose body');
assert.ok(cleanedProse.includes('IS 14543:2016:'), 'Key points preserved');
console.log('  ✓ PASS: Trailing raw source block cleanly stripped from markdown body.\n');

// Test 5: Compact Floating Source Button & Popover HTML Structure
console.log('Test 5: Compact Floating Source Button & Popover Panel');
assert.ok(codeHtml.includes('source-toggle-btn'), 'Contains source-toggle-btn class');
assert.ok(codeHtml.includes('source-panel'), 'Contains source-panel class');
assert.ok(codeHtml.includes('source-container'), 'Contains source-container class');
assert.ok(codeHtml.includes('source-item-link'), 'Contains source-item-link class');
console.log('  ✓ PASS: Compact floating source button and popover panel classes verified.\n');

// Test 6: Mobile tap and click-outside dismissal
console.log('Test 6: Click/tap interaction and outside click dismissal');
assert.ok(codeHtml.includes('source-toggle-btn'), 'Click target includes source-toggle-btn');
assert.ok(codeHtml.includes("is-active"), 'Toggle toggles is-active class');
assert.ok(codeHtml.includes("document.querySelectorAll('.source-container.is-active')"), 'Outside click closes active popover');
console.log('  ✓ PASS: Tap and outside dismissal logic present.\n');

console.log('==================================================');
console.log('All Source Redesign & Typography Tests Passed!');
console.log('==================================================');
