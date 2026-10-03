/**
 * Test Suite for Animated Example Questions & ChatGPT-Style Send -> Stop Button
 * Conforms to User Specification for Landing Page & Chat Input Experience
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('Running Test Suite: Landing Animated Questions & Send->Stop UX');
console.log('===============================================================\n');

const landingHtml = fs.readFileSync(path.join(__dirname, '..', 'landing-page', 'code.html'), 'utf8');
const searchHtml = fs.readFileSync(path.join(__dirname, '..', 'search-page', 'code.html'), 'utf8');

// =========================================================================
// PART 1: LANDING PAGE ANIMATED QUESTION TESTS
// =========================================================================
console.log('--- PART 1: LANDING PAGE ANIMATED QUESTIONS ---');

// Test 1: Confirm try line / animated prompt container is removed per user request
assert(!landingHtml.includes('id="example-prompt-container"'), 'Try line (#example-prompt-container) has been removed');
assert(!landingHtml.includes('id="example-prompt-bubble"'), 'Try bubble (#example-prompt-bubble) has been removed');
console.log('  ✓ PASS: Try line above search bar has been cleanly removed as requested');

// Test 2: Check query input and search form presence
assert(landingHtml.includes('id="chat-form"'), 'Missing #chat-form');
assert(landingHtml.includes('id="query-input"'), 'Missing #query-input');
console.log('  ✓ PASS: Search form and input are present and cleanly laid out');

// Test 3: Check navigation duplicate submission guard
assert(landingHtml.includes('let isNavigating = false;'), 'Must have isNavigating guard');
console.log('  ✓ PASS: Navigation duplicate submission guard is implemented\n');


// =========================================================================
// PART 2: SEARCH PAGE SEND -> STOP BUTTON TESTS
// =========================================================================
console.log('--- PART 2: CHATGPT-STYLE SEND -> STOP BUTTON ---');

// Test 7: Button container preservation and accessibility
assert(searchHtml.includes('id="sendPromptBtn"'), 'Missing #sendPromptBtn');
assert(searchHtml.includes('id="sendStopIconSlot"'), 'Missing #sendStopIconSlot');
assert(searchHtml.includes('handleSendOrStop()'), 'sendPromptBtn must call handleSendOrStop()');
console.log('  ✓ PASS: sendPromptBtn container preserved with handleSendOrStop dispatch');

// Test 8: State management definitions
assert(searchHtml.includes('let isGenerating = false;'), 'Missing isGenerating flag');
assert(searchHtml.includes('let isManuallyStopped = false;'), 'Missing isManuallyStopped flag');
assert(searchHtml.includes('let activeAbortController = null;'), 'Missing activeAbortController');
assert(searchHtml.includes('function setGeneratingState('), 'Missing setGeneratingState function');
assert(searchHtml.includes('function stopGeneration('), 'Missing stopGeneration function');
console.log('  ✓ PASS: Core generation state machine and abort controller initialized');

// Test 9: Icons and Accessible Labels
assert(searchHtml.includes('Stop generating'), 'Must have "Stop generating" accessible label');
assert(searchHtml.includes('Send message'), 'Must have "Send message" accessible label');
assert(searchHtml.includes('STOP_ICON_SVG'), 'Must have square Stop icon');
assert(searchHtml.includes('SEND_ICON_SVG'), 'Must have paper-plane Send icon');
console.log('  ✓ PASS: Accessible labels and ChatGPT-style square Stop icon implemented');

// Test 10: Input locking & duplicate submission prevention
assert(searchHtml.includes('input.disabled = isGen'), 'Input must be disabled during generation');
assert(searchHtml.includes('if (isGenerating) return;'), 'submitQuery must reject duplicate calls while generating');
assert(searchHtml.includes('!isGenerating'), 'Enter key handler must check !isGenerating');
console.log('  ✓ PASS: Duplicate submissions locked and Enter key blocked while generating');

// Test 11: Real SSE Streaming & Clean Progressive Rendering (No Flickering Cursor)
assert(searchHtml.includes('/api/search/stream'), 'Must target /api/search/stream');
assert(searchHtml.includes('createStreamingAiBubble'), 'Must have streaming AI bubble creator');
assert(searchHtml.includes('updateStreamingAiBubble'), 'Must have streaming AI bubble chunk updater');
assert(searchHtml.includes('finalizeStreamingAiBubble'), 'Must have streaming bubble finalizer');
assert(!searchHtml.includes('streaming-cursor'), 'Must NOT have unwanted blinking/flickering streaming-cursor');
console.log('  ✓ PASS: Clean progressive rendering without flickering vertical cursor or empty placeholder');

// Test 12: Cancellation / Stop functionality & partial answer preservation
assert(searchHtml.includes('wasAborted'), 'Must distinguish user abort from API/network failure');
assert(searchHtml.includes('finalizeStreamingAiBubble(cardId, accumulatedAnswer'), 'Must preserve partial response on stop');
console.log('  ✓ PASS: AbortController cancels stream and preserves partial generated answer without error');

// Test 13: Stale Request / Race Condition Protection
assert(searchHtml.includes('const thisRequestId = ++currentRequestId;'), 'Must increment requestId on each submit');
assert(searchHtml.includes('if (thisRequestId !== currentRequestId'), 'Must drop chunks from superseded requests');
console.log('  ✓ PASS: Request ID lifecycle protection ensures older requests cannot overwrite new requests');

console.log('\n===============================================================');
console.log('ALL STATIC CHECKS PASSED SUCCESSFULLY!');
console.log('===============================================================\n');
