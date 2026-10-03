const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('======================================================================');
console.log('TEST SUITE: DESKTOP LANDING MIC & SEND BUTTON ICON IMPROVEMENT');
console.log('======================================================================\n');

const desktopHtml = fs.readFileSync(path.join(__dirname, '..', 'desktop landing page.html'), 'utf8');
const landingCodeHtml = fs.readFileSync(path.join(__dirname, '..', 'landing-page', 'code.html'), 'utf8');
const landingPage2Html = fs.readFileSync(path.join(__dirname, '..', 'landing page 2.html'), 'utf8');

console.log('TEST 1: Send Button Icon Improvement');
[desktopHtml, landingCodeHtml, landingPage2Html].forEach((html, idx) => {
  const name = ['desktop landing page.html', 'landing-page/code.html', 'landing page 2.html'][idx];
  
  // Verify crooked rotate-45 paper plane is removed from desktop-btn-send
  const sendBtnMatch = html.match(/<button[^>]*id="desktop-btn-send"[^>]*>([\s\S]*?)<\/button>/);
  assert(sendBtnMatch, `${name} must contain #desktop-btn-send`);
  const sendBtnContent = sendBtnMatch[1];
  
  assert(!sendBtnContent.includes('rotate-45'), `${name}: send button must not use deformed rotate-45 SVG`);
  assert(!sendBtnContent.includes('-ml-0.5'), `${name}: send button must not use deformed -ml-0.5 offset`);
  assert(sendBtnContent.includes('polyline points="5 12 12 5 19 12"'), `${name}: send button must feature crisp modern upward send arrow`);
  assert(sendBtnContent.includes('<line x1="12" y1="19" x2="12" y2="5">'), `${name}: send button must have vertical line for upward arrow`);
  console.log(`  ✓ PASS: ${name} has improved, modern, crisp send button icon`);
});

console.log('\nTEST 2: Continuous Voice Recognition & Anti-Cutoff Protection in Desktop Landing');
[desktopHtml, landingCodeHtml, landingPage2Html].forEach((html, idx) => {
  const name = ['desktop landing page.html', 'landing-page/code.html', 'landing page 2.html'][idx];

  // Verify voice elements & IDs
  assert(html.includes('id="desktop-btn-voice"'), `${name} must have #desktop-btn-voice`);
  assert(html.includes('id="desktop-voice-modal"'), `${name} must have #desktop-voice-modal`);
  assert(html.includes('id="desktop-voice-status"'), `${name} must have #desktop-voice-status`);
  assert(html.includes('id="desktop-voice-transcript"'), `${name} must have #desktop-voice-transcript`);
  assert(html.includes('id="desktop-voice-mic-trigger"'), `${name} must have #desktop-voice-mic-trigger`);
  assert(html.includes('id="desktop-close-voice"'), `${name} must have #desktop-close-voice`);
  assert(html.includes('id="desktop-voice-search-btn"'), `${name} must have #desktop-voice-search-btn for explicit immediate submission`);

  // Verify inline fallback handlers for resilience against template cloning
  assert(html.includes('onclick="if(window.openDesktopVoiceModal) window.openDesktopVoiceModal();"'), `${name} must have inline openDesktopVoiceModal on voice button`);
  assert(html.includes('onclick="if(window.closeDesktopVoiceModal) window.closeDesktopVoiceModal();"'), `${name} must have inline closeDesktopVoiceModal on close button`);
  assert(html.includes('onclick="if(window.toggleDesktopVoice) window.toggleDesktopVoice();"'), `${name} must have inline toggleDesktopVoice on mic trigger`);
  assert(html.includes('onclick="if(window.commitDesktopVoiceSearch) window.commitDesktopVoiceSearch();"'), `${name} must have inline commitDesktopVoiceSearch on voice search button`);

  // Verify continuous listening enabled so it listens to whole question
  assert(html.includes('recognition.continuous = true;'), `${name} must set recognition.continuous = true to listen to whole question without premature cut-off`);
  assert(html.includes('desktopVoiceSilenceTimer') || html.includes('silenceTimer'), `${name} must use silence timer to allow natural speech pauses`);

  // Verify real-time reflection into main search query input
  assert(html.includes('queryInput.value = combined'), `${name} must reflect live transcription into search box in real time`);

  // Verify no-speech event does NOT prematurely change status to "Tap Mic to Retry"
  assert(html.includes("e.error === 'no-speech'"), `${name} must handle no-speech without premature error display`);

  // Verify auto-restart loop uses fresh instance or clean start
  assert(html.includes('startDesktopVoice()'), `${name} must call startDesktopVoice() on silence pause restart rather than dead recognition.start()`);
  assert(html.includes('Date.now() - voiceStartTime < 15000') || html.includes('maxRestarts'), `${name} must keep listening if user pauses or hesitates before speaking`);

  // Verify double invocation protection
  assert(html.includes('if (isVoiceModalOpen && isDesktopVoiceActive)') || html.includes('if (this.isListening) return'), `${name} must guard against duplicate click activations`);

  // Verify speech recognition abort race-condition protection (callback unbinding before abort)
  assert((html.includes('recognition.onerror = null') && html.includes('recognition.onend = null')) || (html.includes('this.recognition.onerror = null') && html.includes('this.recognition.onend = null')), `${name} must unbind callbacks before abort to prevent spurious Tap Mic to Retry`);

  // Verify accumulation of all speech result segments
  assert(html.includes('for (let i = 0; i < e.results.length; ++i)') || html.includes('for (let i = 0; i < event.results.length; ++i)'), `${name} must iterate all speech results without dropping earlier phrases`);

  // Verify safe language fallback mappings preventing language-not-supported aborts
  assert((html.includes("'doi': 'hi-IN'") && html.includes("'kok': 'mr-IN'") && html.includes("'mai': 'hi-IN'")) || (html.includes('doi: \'hi-IN\'') && html.includes('kok: \'mr-IN\'') && html.includes('mai: \'hi-IN\'')), `${name} must map Indian languages cleanly to browser-compatible speech recognizer codes`);

  console.log(`  ✓ PASS: ${name} voice recognition is continuous, listens to the whole question, and prevents premature tap-to-retry`);
});

console.log('\nTEST 3: File Parity & Synchronization');
assert.strictEqual(landingCodeHtml, landingPage2Html, 'landing-page/code.html and landing page 2.html must be 100% byte-for-byte identical');
console.log('  ✓ PASS: landing-page/code.html and landing page 2.html are 100% synchronized\n');

console.log('======================================================================');
console.log('ALL DESKTOP MIC & SEND ICON TESTS PASSED SUCCESSFULLY!');
console.log('======================================================================');
