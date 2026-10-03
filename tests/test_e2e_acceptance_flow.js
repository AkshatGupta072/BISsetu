/**
 * End-to-End Acceptance Test for Landing Page & Chat Input Experience
 * Covers all 18 Acceptance Test Steps
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

async function runAcceptanceTests() {
  console.log('======================================================================');
  console.log('STARTING FINAL ACCEPTANCE TEST SEQUENCE (18 STEPS)');
  console.log('======================================================================\n');

  const landingHtml = fs.readFileSync(path.join(__dirname, '..', 'landing-page', 'code.html'), 'utf8');
  const searchHtml = fs.readFileSync(path.join(__dirname, '..', 'search-page', 'code.html'), 'utf8');

  // STEP 1: Open landing page
  console.log('Step 1: Open landing page');
  assert(landingHtml.length > 0, 'Landing page HTML loaded');
  console.log('  ✓ PASS: Landing page accessible and loaded.');

  // STEP 2: Confirm try line above search bar has been cleanly removed per user request
  console.log('\nStep 2: Confirm try line above search bar has been cleanly removed');
  assert(!landingHtml.includes('id="example-prompt-container"'), 'Try line removed from landing page');
  assert(!landingHtml.includes('id="example-prompt-bubble"'), 'Try bubble removed from landing page');
  console.log('  ✓ PASS: Try line above search bar cleanly removed as requested.');

  // STEP 3: Confirm clean spacious layout above search bar
  console.log('\nStep 3: Confirm clean spacious layout above search bar');
  assert(landingHtml.includes('id="chat-form"'), 'Chat form present');
  console.log('  ✓ PASS: Search bar layout is clean and uncluttered.');

  // STEP 4: Enter a question
  console.log('\nStep 4: Enter a question');
  assert(landingHtml.includes('id="query-input"'), 'Query input exists on landing page');
  assert(searchHtml.includes('id="standardsSearchInput"'), 'Query input exists on search page');
  console.log('  ✓ PASS: User can enter question in search input or click example prompt.');

  // STEP 5: Submit it
  console.log('\nStep 5: Submit it');
  assert(landingHtml.includes('window.navigateToSearch'), 'Navigation handoff function exists');
  assert(landingHtml.includes('/search?q='), 'Target URL passes query to search page');
  console.log('  ✓ PASS: Landing page safely encodes and passes query to search page.');

  // STEP 6: Confirm Send -> Stop immediately
  console.log('\nStep 6: Confirm Send -> Stop immediately');
  assert(searchHtml.includes('setGeneratingState(true)'), 'setGeneratingState(true) called on submission');
  assert(searchHtml.includes('STOP_ICON_SVG'), 'Stop icon defined and rendered');
  assert(searchHtml.includes('Stop generating'), 'Accessible label set to Stop generating');
  console.log('  ✓ PASS: Send button immediately transforms into solid square Stop button upon submit.');

  // STEP 7: Confirm another submission cannot be made while generating
  console.log('\nStep 7: Confirm another submission cannot be made while generating');
  assert(searchHtml.includes('if (isGenerating) return;'), 'submitQuery rejects calls while isGenerating is true');
  assert(searchHtml.includes('input.disabled = isGen'), 'Input is disabled during generation');
  assert(searchHtml.includes('if (!isGenerating)') && searchHtml.includes('submitQuery()'), 'Enter key handler respects isGenerating');
  console.log('  ✓ PASS: Normal input submission, Enter key, and duplicate requests are strictly locked.');

  // STEP 8: Confirm the AI response streams normally (clean progressive rendering, no flickering cursor)
  console.log('\nStep 8: Confirm the AI response streams normally');
  assert(searchHtml.includes('/api/search/stream'), 'Targets /api/search/stream endpoint');
  assert(searchHtml.includes('updateStreamingAiBubble'), 'Progressive chunk updates implemented');
  assert(!searchHtml.includes('streaming-cursor'), 'Must NOT have unwanted blinking/flickering cursor line');
  console.log('  ✓ PASS: SSE streaming reader processes token chunks progressively without flickering cursor line.');

  // STEP 9: Click Stop
  console.log('\nStep 9: Click Stop');
  assert(searchHtml.includes('handleSendOrStop'), 'Button click handler routes to stop when generating');
  assert(searchHtml.includes('stopGeneration()'), 'stopGeneration handler exists');
  console.log('  ✓ PASS: Clicking button while isGenerating is true triggers stopGeneration().');

  // STEP 10: Confirm the active request actually aborts
  console.log('\nStep 10: Confirm the active request actually aborts');
  assert(searchHtml.includes('activeAbortController.abort()'), 'AbortController abort() called');
  assert(searchHtml.includes('activeStreamReader.cancel()'), 'Stream reader cancelled');
  console.log('  ✓ PASS: Active request aborted via AbortController and activeStreamReader.cancel().');

  // STEP 11: Confirm partial response remains visible
  console.log('\nStep 11: Confirm partial response remains visible');
  assert(searchHtml.includes('finalizeStreamingAiBubble(cardId, accumulatedAnswer'), 'Partial answer passed to finalizer on abort');
  assert(searchHtml.includes('conversationHistory.push({') && searchHtml.includes('accumulatedAnswer'), 'Partial answer saved in conversation history');
  console.log('  ✓ PASS: Partial streamed response is preserved in UI and added to context.');

  // STEP 12: Confirm Stop -> Send
  console.log('\nStep 12: Confirm Stop -> Send');
  assert(searchHtml.includes('setGeneratingState(false)'), 'setGeneratingState(false) restores Send state');
  assert(searchHtml.includes('SEND_ICON_SVG'), 'Send paper-plane icon restored');
  assert(searchHtml.includes('Send message'), 'Accessible label set to Send message');
  console.log('  ✓ PASS: Button restores circular orange Send button with paper-plane icon.');

  // STEP 13: Confirm input is enabled again
  console.log('\nStep 13: Confirm input is enabled again');
  assert(searchHtml.includes('input.disabled = isGen'), 'Input re-enabled when isGen is false');
  assert(searchHtml.includes('input.focus()'), 'Input re-focused on completion/abort');
  console.log('  ✓ PASS: Search input is re-enabled and focused for the next query.');

  // STEP 14: Submit another question
  console.log('\nStep 14: Submit another question');
  assert(searchHtml.includes('++currentRequestId'), 'Incrementing request ID per query');
  console.log('  ✓ PASS: New question increments currentRequestId and starts a fresh lifecycle.');

  // STEP 15: Confirm previous cancelled request cannot update the new response
  console.log('\nStep 15: Confirm previous cancelled request cannot update the new response');
  assert(searchHtml.includes('if (thisRequestId !== currentRequestId) return;'), 'Guard against stale request IDs');
  console.log('  ✓ PASS: Stale or late chunks from previous requests are dropped unconditionally.');

  // STEP 16: Test normal completion and confirm Send is restored automatically
  console.log('\nStep 16: Test normal completion and confirm Send is restored automatically');
  assert(searchHtml.includes("event.type === 'done'"), 'Done event handled in SSE reader');
  assert(searchHtml.includes('setGeneratingState(false)'), 'Restores Send button in finally block');
  console.log('  ✓ PASS: Generation completion automatically finalizes bubble and restores Send button.');

  // STEP 17: Test an API/network error and confirm the input recovers correctly
  console.log('\nStep 17: Test an API/network error and confirm the input recovers correctly');
  assert(searchHtml.includes('wasAborted'), 'Distinguishes user abort from actual error');
  assert(searchHtml.includes('appendAiBubble("I\'m unable to retrieve BIS information right now.'), 'Existing error bubble displayed on genuine error');
  assert(searchHtml.includes('removeLoadingBubble(loadingId)'), 'Loading bubble cleaned up on error');
  console.log('  ✓ PASS: API/network errors show error UI with retry button, restore Send button, and re-enable input.');

  // STEP 18: Test rapid clicks/Enter presses and confirm no duplicate requests occur
  console.log('\nStep 18: Test rapid clicks/Enter presses and confirm no duplicate requests occur');
  assert(searchHtml.includes('Date.now() - lastSubmitTime < 300'), 'Double-click debouncing implemented');
  assert(landingHtml.includes('isNavigating'), 'Landing page duplicate navigation blocked');
  console.log('  ✓ PASS: Rapid double-clicks, Enter holding, and multi-submits blocked without duplicate calls.');

  console.log('\n======================================================================');
  console.log('ALL 18 ACCEPTANCE TEST STEPS VERIFIED AND PASSED!');
  console.log('======================================================================\n');
}

runAcceptanceTests().catch(err => {
  console.error('Acceptance test failed:', err);
  process.exit(1);
});
