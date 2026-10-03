const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('==================================================');
console.log('Verifying Premium Consumer-Friendly AI Response UI');
console.log('==================================================\n');

const searchHtml = fs.readFileSync(path.join(__dirname, '..', 'search-page', 'code.html'), 'utf-8');

// Test 1: "Manak Sathi AI" is removed from AI response headers
console.log('Test 1: "Manak Sathi AI" label removed from search page');
const manakMatches = (searchHtml.match(/Manak Sathi AI/g) || []).length;
console.log('  Found occurrences of "Manak Sathi AI":', manakMatches);
assert.strictEqual(manakMatches, 0, 'No "Manak Sathi AI" tags in search page');
console.log('  ✓ PASS: "Manak Sathi AI" removed completely.\n');

// Test 2: "Verified" tag is removed
console.log('Test 2: "Verified" tag removed from AI responses');
const verifiedMatches = (searchHtml.match(/>Verified</g) || []).length;
console.log('  Found occurrences of ">Verified<":', verifiedMatches);
assert.strictEqual(verifiedMatches, 0, 'No ">Verified<" tags in search page');
console.log('  ✓ PASS: "Verified" tag removed completely.\n');

// Test 3: Bottom action row contains Copy, Listen, and Sources
console.log('Test 3: Bottom action row layout (Copy, Listen, Sources)');
assert.ok(searchHtml.includes('ai-bottom-actions'), 'Found .ai-bottom-actions container');
assert.ok(searchHtml.includes('copy-answer-btn'), 'Found .copy-answer-btn');
assert.ok(searchHtml.includes('tts-btn'), 'Found .tts-btn');
assert.ok(searchHtml.includes('ai-sources-slot'), 'Found .ai-sources-slot');
console.log('  ✓ PASS: Subtle bottom action row verified with Copy, Listen, and Sources.\n');

// Test 4: Copy button text sanitization (cleanMarkdownForClipboard)
console.log('Test 4: Clean plain text copying without raw markdown symbols');
const fnMatch = searchHtml.match(/function cleanMarkdownForClipboard\([\s\S]*?\n  \}/);
assert.ok(fnMatch, 'Found cleanMarkdownForClipboard function in search-page/code.html');

eval(fnMatch[0]);

const sampleMarkdown = [
  '### Key Points',
  '• **Applicable Standard:** IS 15410:2025 (*Water Containers*)',
  '• Water bottles must have a valid **ISI Mark**.',
  '• Use `IS 10500` for testing parameter check.',
  '• Visit [BIS Portal](https://standards.bis.gov.in) for details.',
  '> Notice: Mandatory certification is enforced.'
].join('\n');

const cleaned = cleanMarkdownForClipboard(sampleMarkdown);
console.log('  Original Markdown Sample:\n' + sampleMarkdown + '\n');
console.log('  Cleaned Text for Clipboard:\n' + cleaned + '\n');

assert.ok(!cleaned.includes('**'), 'No raw ** in copied text');
assert.ok(!cleaned.includes('###'), 'No raw ### in copied text');
assert.ok(!cleaned.includes('`'), 'No raw backticks in copied text');
assert.ok(!cleaned.includes('(') || !cleaned.includes('https://standards.bis.gov.in'), 'No raw markdown link syntax');
assert.ok(cleaned.includes('Applicable Standard: IS 15410:2025 (Water Containers)'), 'Text preserved cleanly');
assert.ok(cleaned.includes('Water bottles must have a valid ISI Mark.'), 'Bold text stripped to plain text');
console.log('  ✓ PASS: Markdown symbols (** , * , ### , ` ) completely stripped for clean clipboard copying.\n');

console.log('==================================================');
console.log('All Premium UI Refinement Tests Passed Perfectly!');
console.log('==================================================');
