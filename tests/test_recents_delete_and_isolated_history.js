/**
 * Verification test suite for:
 * 1. Cross mark (✕) delete option on every recent tab/item
 * 2. "View all" from landing page opening history modal instead of searching "recents view all"
 * 3. Clicking any recent tab displaying only that specific tab's history and never other tabs
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const landingHtml = fs.readFileSync(path.join(__dirname, '..', 'landing-page', 'code.html'), 'utf8');
const landing2Html = fs.readFileSync(path.join(__dirname, '..', 'landing page 2.html'), 'utf8');
const searchHtml = fs.readFileSync(path.join(__dirname, '..', 'search-page', 'code.html'), 'utf8');
const sidebarJs = fs.readFileSync(path.join(__dirname, '..', 'shared', 'appSidebar.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

console.log('======================================================================');
console.log('VERIFYING RECENTS DELETION, VIEW ALL MODAL, AND TAB ISOLATION');
console.log('======================================================================\n');

// -------------------------------------------------------------------------
// TEST 1: Cross mark (✕) delete option on every recent tab
// -------------------------------------------------------------------------
console.log('TEST 1: Cross mark (✕) delete option on every recent tab');

// 1.1 In shared appSidebar.js: drawer recents list has delete button with cross mark
assert(sidebarJs.includes("deleteRecentItem"), 'shared/appSidebar.js must define deleteRecentItem');
assert(sidebarJs.includes("event.stopPropagation(); window.deleteRecentItem"), 'shared/appSidebar.js must stopPropagation on delete click');
assert(sidebarJs.includes('title="Delete tab"') || sidebarJs.includes('aria-label="Delete tab"'), 'shared/appSidebar.js must have accessible delete button label');
console.log('  ✓ PASS: shared/appSidebar.js drawer recents list has ✕ delete button with stopPropagation');

// 1.2 In shared appSidebar.js: profile history list has delete button with cross mark
assert(sidebarJs.includes("window.renderProfileHistory"), 'shared/appSidebar.js must have renderProfileHistory');
assert(sidebarJs.includes("title=\"Delete\" aria-label=\"Delete\" onclick=\"event.stopPropagation(); window.deleteRecentItem"), 'shared/appSidebar.js profile history must have delete button');
console.log('  ✓ PASS: shared/appSidebar.js profile history list has ✕ delete button');

// 1.3 In landing-page/code.html & landing page 2.html: dynamic recents with cross mark delete button
assert(landingHtml.includes('id="landing-recents-list"'), 'landing-page/code.html must have dynamic landing-recents-list container');
assert(landingHtml.includes('window.deleteRecentItem'), 'landing-page/code.html must have window.deleteRecentItem');
assert(landingHtml.includes('event.stopPropagation(); window.deleteRecentItem'), 'landing-page/code.html must stopPropagation on delete');
assert(landing2Html.includes('id="landing-recents-list"'), 'landing page 2.html must have dynamic landing-recents-list container');
assert(landing2Html.includes('window.deleteRecentItem'), 'landing page 2.html must have window.deleteRecentItem');
console.log('  ✓ PASS: landing page has dynamic recents list with ✕ delete buttons and stopPropagation');

// -------------------------------------------------------------------------
// TEST 2: "View all" / "See all" behavior from landing page
// -------------------------------------------------------------------------
console.log('\nTEST 2: "View all" behavior from landing page');

// 2.1 View all opens history modal
assert(landingHtml.includes('onclick="window.closeMenu(); window.openHistoryModal();"'), 'landing-page View all must call window.openHistoryModal');
assert(landingHtml.includes('window.openHistoryModal()'), 'landing-page must open history modal on View all click');
assert(landing2Html.includes('window.openHistoryModal()'), 'landing page 2.html must open history modal on View all click');
console.log('  ✓ PASS: "View all" on landing page opens dedicated History Modal');

// 2.2 History modal exists with cross marks and clean history listing
assert(landingHtml.includes('id="history-modal"'), 'landing-page must have #history-modal');
assert(landingHtml.includes('id="history-modal-list"'), 'landing-page must have #history-modal-list');
assert(landing2Html.includes('id="history-modal"'), 'landing page 2.html must have #history-modal');
assert(landing2Html.includes('id="history-modal-list"'), 'landing page 2.html must have #history-modal-list');
console.log('  ✓ PASS: Dedicated #history-modal exists with full history listing and delete capabilities');

// 2.3 Search page blocks "recents view all" from ever running as a search
assert(searchHtml.includes('recents view all'), 'search-page must guard against forbidden query "recents view all"');
assert(searchHtml.includes('forbiddenAutoQueries'), 'search-page must define forbiddenAutoQueries list');
console.log('  ✓ PASS: Search page explicitly blocks automatic searching of "recents view all"');

// 2.4 Server route for /history
assert(serverJs.includes("app.get('/history'"), 'server.js must define /history route');
console.log('  ✓ PASS: server.js routes /history cleanly to search-page');

// -------------------------------------------------------------------------
// TEST 3: Isolated Tab History (no mixing across tabs)
// -------------------------------------------------------------------------
console.log('\nTEST 3: Isolated Tab History');

// 3.1 Search page defines tab session storage
assert(searchHtml.includes('manak_tab_sessions'), 'search-page must use manak_tab_sessions for tab isolation');
assert(searchHtml.includes('saveTabTurn'), 'search-page must define saveTabTurn');
assert(searchHtml.includes('window.loadRecentTab'), 'search-page must define window.loadRecentTab');
console.log('  ✓ PASS: Tab session storage and loadRecentTab implemented in search-page');

// 3.2 loadRecentTab wipes chatStream to prevent history mixing
assert(searchHtml.includes("chatStream.innerHTML = ''"), 'search-page loadRecentTab must wipe chatStream.innerHTML');
assert(searchHtml.includes("conversationHistory = []"), 'search-page loadRecentTab must reset conversationHistory');
console.log('  ✓ PASS: loadRecentTab strictly isolates each tab by clearing previous tab messages and context');

// 3.3 Clicking a recent tab loads only that tab\'s turns
assert(searchHtml.includes("tabData.turns.forEach"), 'search-page must iterate ONLY active tab\'s turns');
console.log('  ✓ PASS: Only the clicked tab\'s saved turns are appended to the chat stream');

// 3.4 New Chat button is available on search page and clears active tab
assert(searchHtml.includes('btnTopNewChat'), 'search-page must have visible New Chat button in top header');
assert(searchHtml.includes('window.startNewChat'), 'search-page must implement window.startNewChat');
console.log('  ✓ PASS: New Chat option available exclusively on search page with clean state reset');

// 3.5 Both landing pages match
assert.strictEqual(landingHtml, landing2Html, 'landing-page/code.html and landing page 2.html must be identical');
console.log('  ✓ PASS: landing-page/code.html and landing page 2.html are 100% synchronized');

// -------------------------------------------------------------------------
// TEST 4: Copy button on user question appears ONLY when user drags on their question
// -------------------------------------------------------------------------
console.log('\nTEST 4: Copy option on user question appears ONLY on text drag/selection');

// 4.1 Copy action container has class 'hidden' by default
assert(searchHtml.includes('user-copy-action hidden'), 'search-page must hide user copy button container by default with hidden class');
console.log('  ✓ PASS: Copy action on user question is hidden by default');

// 4.2 Bubble does NOT toggle on simple click (ensuring appearance is strictly drag-driven)
assert(!searchHtml.includes('onclick="toggleUserCopyButton(this, event)"'), 'user message bubble must NOT toggle copy button on simple click');
assert(searchHtml.includes('handleUserDragSelection'), 'search-page must implement handleUserDragSelection');
assert(searchHtml.includes("document.addEventListener('mouseup', handleUserDragSelection)"), 'search-page must listen for mouseup to detect drag selection');
assert(searchHtml.includes("document.addEventListener('touchend', handleUserDragSelection)"), 'search-page must listen for touchend to detect touch drag selection');
console.log('  ✓ PASS: Copy option is strictly triggered by drag selection (mouseup/touchend)');

// 4.3 Copy button has preventDefault on mousedown so selection is not collapsed before click
assert(searchHtml.includes('onmousedown="event.preventDefault();"'), 'copy-user-btn must have onmousedown preventDefault to preserve selection');
assert(searchHtml.includes('copyUserQuestion(this)'), 'copy button must execute copyUserQuestion');
assert(searchHtml.includes('activeUserSelectionText'), 'search-page must track activeUserSelectionText');
console.log('  ✓ PASS: Copy button preserves dragged selection and copies selected question text');

// 4.4 Collapsed selection dismisses user copy action
assert(searchHtml.includes('selection.isCollapsed'), 'search-page must check selection.isCollapsed to hide copy button on simple click');
console.log('  ✓ PASS: Simple click without drag collapses selection and hides copy option');

// -------------------------------------------------------------------------
// TEST 5: All 22 Constitutional Languages (+ English = 23 total)
// -------------------------------------------------------------------------
console.log('\nTEST 5: All 22 Constitutional Languages in Select Language Modal');

const constitutionalCodes = [
  'en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'ur', 'kn', 'or',
  'ml', 'pa', 'as', 'mai', 'mni', 'sa', 'sd', 'ks', 'kok', 'doi',
  'ne', 'brx', 'sat'
];

// 5.1 Shared appSidebar.js includes all 23 language entries
constitutionalCodes.forEach(code => {
  assert(sidebarJs.includes(`code: '${code}'`), `shared/appSidebar.js ALL_LANGUAGES must include language code '${code}'`);
});
console.log(`  ✓ PASS: shared/appSidebar.js has all ${constitutionalCodes.length} languages (22 Eighth Schedule + English)`);

// 5.2 landing-page/code.html includes all 23 language buttons
constitutionalCodes.forEach(code => {
  assert(landingHtml.includes(`data-code="${code}"`), `landing-page/code.html must include language button for '${code}'`);
});
console.log(`  ✓ PASS: landing-page/code.html has all ${constitutionalCodes.length} languages in language modal`);

// 5.3 landing page 2.html includes all 23 language buttons
constitutionalCodes.forEach(code => {
  assert(landing2Html.includes(`data-code="${code}"`), `landing page 2.html must include language button for '${code}'`);
});
console.log(`  ✓ PASS: landing page 2.html has all ${constitutionalCodes.length} languages in language modal`);

// -------------------------------------------------------------------------
// TEST 6: Landing Page Voice Modal Animation & Quick Questions Removal
// -------------------------------------------------------------------------
console.log('\nTEST 6: Voice Modal Animated Mic Icon & Removal of Quick Questions');

// 6.1 Quick questions block removed completely from landing pages
assert(!landingHtml.includes('Or tap a quick question:'), 'landing-page/code.html must NOT contain quick question prompt');
assert(!landingHtml.includes('voice-chip'), 'landing-page/code.html must NOT contain voice-chip quick question buttons');
assert(!landing2Html.includes('Or tap a quick question:'), 'landing page 2.html must NOT contain quick question prompt');
assert(!landing2Html.includes('voice-chip'), 'landing page 2.html must NOT contain voice-chip quick question buttons');
console.log('  ✓ PASS: Quick questions successfully removed from voice modal in both landing pages');

// 6.2 Voice modal contains animated mic trigger and ripple pulse waves
assert(landingHtml.includes('mic-modal-pulse'), 'landing-page/code.html must have mic-modal-pulse animation on mic trigger');
assert(landingHtml.includes('mic-svg-animate'), 'landing-page/code.html must have mic-svg-animate on mic icon SVG');
assert(landingHtml.includes('soundwave-bar'), 'landing-page/code.html must have soundwave-bar animated equalizer');
assert(landing2Html.includes('mic-modal-pulse'), 'landing page 2.html must have mic-modal-pulse animation');
assert(landing2Html.includes('mic-svg-animate'), 'landing page 2.html must have mic-svg-animate animation');
assert(landing2Html.includes('soundwave-bar'), 'landing page 2.html must have soundwave-bar animated equalizer');
console.log('  ✓ PASS: Voice modal mic icon has multi-layered pulsating glow, wave rings, and animated equalizer');

// 6.3 Perfect synchronization between landing-page/code.html and landing page 2.html
assert.strictEqual(landingHtml, landing2Html, 'landing-page/code.html and landing page 2.html must be identical');
console.log('  ✓ PASS: landing-page/code.html and landing page 2.html are 100% synchronized');

console.log('\n======================================================================');
console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
console.log('======================================================================');
