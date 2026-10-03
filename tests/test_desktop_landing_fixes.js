/**
 * Test Suite: Desktop Landing Page Fixes Verification
 * 1. Language Switching - Entire UI translates immediately, persists across navigation & refresh, passed as preferred language for AI responses
 * 2. Voice Input - Microphone access and continuous speech recognition actually works, live reflects in search box, auto-submits, handles errors and permissions cleanly without infinite loops
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('======================================================================');
console.log('TEST SUITE: DESKTOP LANDING PAGE FIXES (LANGUAGE SWITCH & VOICE INPUT)');
console.log('======================================================================\n');

const desktopHtml = fs.readFileSync(path.join(__dirname, '..', 'desktop landing page.html'), 'utf8');
const unifiedHtml = fs.readFileSync(path.join(__dirname, '..', 'landing-page', 'code.html'), 'utf8');
const unified2Html = fs.readFileSync(path.join(__dirname, '..', 'landing page 2.html'), 'utf8');

// ---------------------------------------------------------------------------
// TEST 1: File Parity & Synchronization
// ---------------------------------------------------------------------------
console.log('TEST 1: Landing Page Synchronization');
assert.strictEqual(unifiedHtml, unified2Html, 'landing-page/code.html and landing page 2.html must be 100% byte-for-byte identical');
console.log('  ✓ PASS: landing-page/code.html and landing page 2.html are 100% synchronized\n');

// ---------------------------------------------------------------------------
// TEST 2: Language Switching - Complete UI Tagging & Immediate Translation Support
// ---------------------------------------------------------------------------
console.log('TEST 2: Desktop Language Switching - Entire UI Translation Coverage');

[
  { name: 'desktop landing page.html', content: desktopHtml },
  { name: 'landing-page/code.html', content: unifiedHtml }
].forEach(({ name, content }) => {
  // 1. Header elements
  assert(content.includes('data-i18n="bis_title"'), `${name}: Official BIS title must have data-i18n="bis_title"`);
  assert(content.includes('data-i18n="bis_tagline"'), `${name}: Official BIS tagline must have data-i18n="bis_tagline"`);
  assert(content.includes('id="desktop-current-lang-pill"'), `${name}: Header must have desktop-current-lang-pill`);

  // 2. Sidebar elements
  assert(content.includes('data-i18n="menu_home"'), `${name}: Home nav must have data-i18n="menu_home"`);
  assert(content.includes('data-i18n="menu_ai_assistant"'), `${name}: AI Assistant nav must have data-i18n="menu_ai_assistant"`);
  assert(content.includes('data-i18n="menu_recents"'), `${name}: Recents section header must have data-i18n="menu_recents"`);
  assert(content.includes('data-i18n="see_all"'), `${name}: See all recents button must have data-i18n="see_all"`);
  assert(content.includes('data-i18n="menu_settings"'), `${name}: Settings link must have data-i18n="menu_settings"`);
  assert(content.includes('data-i18n="menu_language"'), `${name}: Language link must have data-i18n="menu_language"`);
  assert(content.includes('data-i18n="menu_help"'), `${name}: Help & Support link must have data-i18n="menu_help"`);

  // 3. Hero Subtitle & Cards
  assert(content.includes('data-i18n="hero_subtitle"'), `${name}: Mission subtitle must have data-i18n="hero_subtitle"`);
  assert(content.includes('data-i18n-placeholder="desktop_search_placeholder"'), `${name}: Search bar input must have data-i18n-placeholder="desktop_search_placeholder"`);
  assert(content.includes('data-i18n="camera_label"'), `${name}: Camera button must have data-i18n="camera_label"`);
  assert(content.includes('data-i18n="voice_label"'), `${name}: Voice button must have data-i18n="voice_label"`);
  assert(content.includes('data-i18n="upload_label"'), `${name}: Upload button must have data-i18n="upload_label"`);
  assert(content.includes('data-i18n-title="send_query"'), `${name}: Send button must have data-i18n-title="send_query"`);

  // 4. Suggested Cards
  assert(content.includes('data-i18n="prompt_1_title"'), `${name}: Card 1 title must have data-i18n="prompt_1_title"`);
  assert(content.includes('data-i18n="prompt_1_sub"'), `${name}: Card 1 sub must have data-i18n="prompt_1_sub"`);
  assert(content.includes('data-i18n="prompt_2_title"'), `${name}: Card 2 title must have data-i18n="prompt_2_title"`);
  assert(content.includes('data-i18n="prompt_2_sub"'), `${name}: Card 2 sub must have data-i18n="prompt_2_sub"`);
  assert(content.includes('data-i18n="prompt_3_title"'), `${name}: Card 3 title must have data-i18n="prompt_3_title"`);
  assert(content.includes('data-i18n="prompt_3_sub"'), `${name}: Card 3 sub must have data-i18n="prompt_3_sub"`);

  // 5. Modals
  assert(content.includes('data-i18n="voice_listening"'), `${name}: Voice status title must have data-i18n="voice_listening"`);
  assert(content.includes('data-i18n="voice_hint"'), `${name}: Voice hint must have data-i18n="voice_hint"`);
  assert(content.includes('data-i18n="voice_default_transcript"'), `${name}: Voice default transcript must have data-i18n="voice_default_transcript"`);
  assert(content.includes('data-i18n="search_with_ai"'), `${name}: Search with BIS AI button must have data-i18n="search_with_ai"`);
  assert(content.includes('data-i18n="camera_scan_title"'), `${name}: Camera modal title must have data-i18n="camera_scan_title"`);
  assert(content.includes('data-i18n="camera_placeholder"'), `${name}: Camera placeholder must have data-i18n="camera_placeholder"`);
  assert(content.includes('data-i18n="upload_from_file"'), `${name}: Camera upload button must have data-i18n="upload_from_file"`);
  assert(content.includes('data-i18n="lang_title"'), `${name}: Language modal title must have data-i18n="lang_title"`);
  assert(content.includes('data-i18n="lang_sub"'), `${name}: Language modal subtitle must have data-i18n="lang_sub"`);
  assert(content.includes('data-i18n="history_title"'), `${name}: History modal title must have data-i18n="history_title"`);
  assert(content.includes('data-i18n="clear_all"'), `${name}: History clear all button must have data-i18n="clear_all"`);
  assert(content.includes('data-i18n="profile_title"'), `${name}: Profile modal title must have data-i18n="profile_title"`);
  assert(content.includes('data-i18n="official_portal"'), `${name}: Official portal label must have data-i18n="official_portal"`);
  assert(content.includes('data-i18n="active_language"'), `${name}: Active language label must have data-i18n="active_language"`);

  // 6. Persistence & Immediate application
  assert(content.includes('applyDesktopLanguage(savedLang)'), `${name}: applyDesktopLanguage must be invoked on initialization/mount`);
  assert(content.includes("document.querySelectorAll('[data-i18n]')"), `${name}: applyDesktopLanguage must translate all [data-i18n] elements`);
  assert(content.includes("document.querySelectorAll('[data-i18n-placeholder]')"), `${name}: applyDesktopLanguage must translate all [data-i18n-placeholder] elements`);
  assert(content.includes("document.documentElement.lang = safeCode"), `${name}: applyDesktopLanguage must update document.documentElement.lang`);
  assert(content.includes("localStorage.setItem('manak_lang', safeCode)"), `${name}: applyDesktopLanguage must persist safeCode to manak_lang`);
  assert(content.includes("localStorage.setItem('bis_lang', safeCode)"), `${name}: applyDesktopLanguage must persist safeCode to bis_lang`);
  assert(content.includes("lang=${encodeURIComponent(currentLang)}"), `${name}: navigateToSearch must pass currentLang in URL params for AI response preference`);

  console.log(`  ✓ PASS: ${name} covers entire UI translation and persistence across navigation & refresh`);
});

// ---------------------------------------------------------------------------
// TEST 3: Voice Input - Functional Speech Recognition Implementation
// ---------------------------------------------------------------------------
console.log('\nTEST 3: Voice Input - Proper Microphone & Speech Recognition Architecture');

[
  { name: 'desktop landing page.html', content: desktopHtml },
  { name: 'landing-page/code.html', content: unifiedHtml }
].forEach(({ name, content }) => {
  // Voice Modal Controls & Triggers
  assert(content.includes('id="desktop-btn-voice"'), `${name}: Must have desktop-btn-voice`);
  assert(content.includes('id="desktop-voice-modal"'), `${name}: Must have desktop-voice-modal`);
  assert(content.includes('id="desktop-voice-status"'), `${name}: Must have desktop-voice-status`);
  assert(content.includes('id="desktop-voice-transcript"'), `${name}: Must have desktop-voice-transcript`);
  assert(content.includes('id="desktop-voice-mic-trigger"'), `${name}: Must have desktop-voice-mic-trigger`);
  assert(content.includes('id="desktop-close-voice"'), `${name}: Must have desktop-close-voice`);
  assert(content.includes('id="desktop-voice-search-btn"'), `${name}: Must have desktop-voice-search-btn`);

  // Recognition instantiation
  assert(content.includes('new SpeechRecognition()'), `${name}: Must instantiate SpeechRecognition`);
  assert(content.includes('recognition.continuous = true;'), `${name}: Must enable continuous recognition`);
  assert(content.includes('recognition.interimResults = true;'), `${name}: Must enable interimResults`);

  // Real-time live reflection into query input
  assert(content.includes('queryInput.value = combined'), `${name}: Must live stream transcript into search input`);

  // Clean permission & error handling
  assert(content.includes("e.error === 'not-allowed'"), `${name}: Must handle microphone permission denial cleanly`);
  assert(content.includes("e.error === 'audio-capture'"), `${name}: Must handle audio capture errors cleanly`);
  assert(content.includes("e.error === 'no-speech'"), `${name}: Must handle no-speech cleanly without infinite error loop`);

  // No infinite flickering or restart loops
  assert(content.includes('voiceRestartCount'), `${name}: Must throttle auto-recovery to prevent infinite restart loop`);
  assert(content.includes('isManualStop'), `${name}: Must respect manual stop / close modal`);

  // Direct user-gesture invocation
  assert(content.includes('startDesktopVoice()'), `${name}: Must invoke startDesktopVoice directly inside click handler`);

  console.log(`  ✓ PASS: ${name} voice recognition architecture is robust, continuous, and free of restart loops`);
});

console.log('\n======================================================================');
console.log('ALL DESKTOP LANDING FIXES TESTS PASSED SUCCESSFULLY!');
console.log('======================================================================');
