const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('==================================================');
console.log('Verifying Image Flow & Separation of Actions');
console.log('==================================================\n');

const landingHtml = fs.readFileSync(path.join(__dirname, '..', 'landing-page', 'code.html'), 'utf-8');
const searchHtml = fs.readFileSync(path.join(__dirname, '..', 'search-page', 'code.html'), 'utf-8');

// Test 1: Landing page camera capture does NOT auto-generate questions
console.log('Test 1: Landing page camera capture does NOT invent queries');
assert.ok(!landingHtml.includes("window.navigateToSearch('Analyze this scanned product"), 'Landing camera capture does not auto-generate query');
assert.ok(!landingHtml.includes("window.navigateToSearch(`Analyze uploaded"), 'Landing gallery upload does not auto-generate query');
assert.ok(!landingHtml.includes("window.navigateToSearch(`Examine uploaded"), 'Landing file upload does not auto-generate query');
console.log('  ✓ PASS: Landing page camera & upload attach image without auto-generating questions.\n');

// Test 2: Search page DOMContentLoaded does NOT auto-submit attached image
console.log('Test 2: Search page DOMContentLoaded does NOT auto-submit image');
assert.ok(!searchHtml.includes("submitQuery('Analyze this image for Indian Standards and BIS compliance')"), 'Search page does not auto-submit image on load');
console.log('  ✓ PASS: Search page page-load never auto-submits images.\n');

// Test 3: Search page submitQuery requires question and does NOT auto-invent queries
console.log('Test 3: Search page submitQuery requires question and does not invent queries');
assert.ok(!searchHtml.includes("query || (currentAttachedImage ? 'Examine this image for Indian Standards compliance' : '')"), 'submitQuery does not invent default question');
assert.ok(searchHtml.includes("showValidationHint('Please enter a question about the image.')"), 'submitQuery prompts user when question is missing');
console.log('  ✓ PASS: Empty question with image prompts user without auto-submitting.\n');

// Test 4: Image preview card and subtle validation hint present in markup
console.log('Test 4: Image preview card and validation hint UI present');
assert.ok(searchHtml.includes('id="attachmentPreviewContainer"'), 'attachmentPreviewContainer present');
assert.ok(searchHtml.includes('id="attachmentImgPreview"'), 'attachmentImgPreview thumbnail present');
assert.ok(searchHtml.includes('id="btnRemoveAttachment"'), 'btnRemoveAttachment remove button present');
assert.ok(searchHtml.includes('id="imageHintMessage"'), 'imageHintMessage present');
console.log('  ✓ PASS: Clean thumbnail preview, dismiss button, and validation hint verified in markup.\n');

// Test 5: Typing clears validation hint
console.log('Test 5: User input clears validation hint');
assert.ok(searchHtml.includes("input', () => {\n    hideValidationHint();"), 'Input event listener calls hideValidationHint');
console.log('  ✓ PASS: User typing automatically dismisses validation hint.\n');

console.log('==================================================');
console.log('All Image Flow & Separation Verification Tests Passed!');
console.log('==================================================');
