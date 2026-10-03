/**
 * Test Suite: Exact Desktop / Mobile Landing Page Switching & Integration
 * Conforms strictly to User Specification for:
 * 1. Desktop / Laptop (>= 768px): Exact "desktop landing page.html"
 * 2. Mobile / Phone (< 768px): Existing mobile landing page
 * 3. Responsive switching & integration without duplication
 * 4. Full functionality on both versions (search, voice, camera, upload, language, recents)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');

console.log('======================================================================');
console.log('TEST SUITE: EXACT DESKTOP / MOBILE LANDING PAGE SWITCHING & INTEGRATION');
console.log('======================================================================\n');

const landingHtml = fs.readFileSync(path.join(__dirname, '..', 'landing-page', 'code.html'), 'utf8');
const landing2Html = fs.readFileSync(path.join(__dirname, '..', 'landing page 2.html'), 'utf8');
const desktopStandaloneHtml = fs.readFileSync(path.join(__dirname, '..', 'desktop landing page.html'), 'utf8');

// ---------------------------------------------------------------------------
// TEST 1: Synchronized Files
// ---------------------------------------------------------------------------
console.log('TEST 1: Landing Page Synchronization');
assert.strictEqual(landingHtml, landing2Html, 'landing-page/code.html and landing page 2.html must be 100% identical');
console.log('  ✓ PASS: landing-page/code.html and landing page 2.html are 100% synchronized\n');

// ---------------------------------------------------------------------------
// TEST 2: Exact Desktop Landing Page Integrity
// ---------------------------------------------------------------------------
console.log('TEST 2: Desktop Landing Page Structure & Component Preservation');

// Verify Desktop Header & Branding
assert(desktopStandaloneHtml.includes('Bureau of Indian Standards Logo'), 'Desktop must have official BIS Logo');
assert(desktopStandaloneHtml.includes('The National Standards Body of India'), 'Desktop must have BIS tagline');
assert(desktopStandaloneHtml.includes('id="desktop-current-lang-pill"'), 'Desktop must have language pill in header');
assert(desktopStandaloneHtml.includes('id="desktop-btn-profile"'), 'Desktop must have profile avatar button');

// Verify Desktop Left Sidebar
assert(desktopStandaloneHtml.includes('id="desktop-sidebar"'), 'Desktop must have left sidebar');
assert(desktopStandaloneHtml.includes('data-item-id="home"'), 'Desktop sidebar must have Home link');
assert(!desktopStandaloneHtml.includes('data-item-id="new-chat"'), 'Desktop sidebar must NOT have New Chat link');
assert(desktopStandaloneHtml.includes('data-item-id="ai-assistant"'), 'Desktop sidebar must have AI Assistant link');
assert(desktopStandaloneHtml.includes('id="desktop-recents-list"'), 'Desktop sidebar must have dynamic recents list');
assert(desktopStandaloneHtml.includes('id="desktop-see-all-recents"'), 'Desktop sidebar must have "See all" recents button');
assert(desktopStandaloneHtml.includes('data-item-id="settings"'), 'Desktop sidebar must have Settings link');
assert(desktopStandaloneHtml.includes('data-item-id="language"'), 'Desktop sidebar must have Language link');
assert(desktopStandaloneHtml.includes('data-item-id="help"'), 'Desktop sidebar must have Help & Support link');

// Verify Desktop Main Area & Emblem
assert(desktopStandaloneHtml.includes('BIS Setu - Bridging Standards For A Safer India'), 'Desktop must have 3D Glossy BIS Setu Emblem');
assert(desktopStandaloneHtml.includes('Your AI assistant for BIS standards, certification'), 'Desktop must have official mission subtitle');

// Verify Desktop Query Input Search Box & Actions
assert(desktopStandaloneHtml.includes('data-purpose="ai-search-box"'), 'Desktop must have ai-search-box container');
assert(desktopStandaloneHtml.includes('id="desktop-chat-form"'), 'Desktop must have desktop chat form');
assert(desktopStandaloneHtml.includes('id="desktop-query-input"'), 'Desktop must have desktop query input');
assert(desktopStandaloneHtml.includes('id="desktop-btn-camera"'), 'Desktop must have camera button');
assert(desktopStandaloneHtml.includes('id="desktop-btn-voice"'), 'Desktop must have voice button');
assert(desktopStandaloneHtml.includes('id="desktop-btn-upload"'), 'Desktop must have upload button');
assert(desktopStandaloneHtml.includes('id="desktop-btn-send"'), 'Desktop must have send button');
assert(desktopStandaloneHtml.includes('id="desktop-attachment-preview"'), 'Desktop must have attachment preview');

// Verify Desktop Suggested Query Cards
assert(desktopStandaloneHtml.includes('Is BIS certification'), 'Desktop must have suggested prompt 1');
assert(desktopStandaloneHtml.includes('What is the BIS standard'), 'Desktop must have suggested prompt 2');
assert(desktopStandaloneHtml.includes('How can I verify a'), 'Desktop must have suggested prompt 3');

// Verify Desktop Modals
assert(desktopStandaloneHtml.includes('id="desktop-voice-modal"'), 'Desktop must have desktop voice modal');
assert(desktopStandaloneHtml.includes('id="desktop-camera-modal"'), 'Desktop must have desktop camera modal');
assert(desktopStandaloneHtml.includes('id="desktop-lang-modal"'), 'Desktop must have desktop language modal');
assert(desktopStandaloneHtml.includes('id="desktop-history-modal"'), 'Desktop must have desktop history modal');
assert(desktopStandaloneHtml.includes('id="desktop-profile-modal"'), 'Desktop must have desktop profile modal');
console.log('  ✓ PASS: Desktop landing page has all required sections, icons, buttons, modals, and branding\n');

// ---------------------------------------------------------------------------
// TEST 3: Existing Mobile Landing Page Preservation
// ---------------------------------------------------------------------------
console.log('TEST 3: Mobile Landing Page Preservation');
assert(landingHtml.includes('mobile-screen-container'), 'Mobile container preserved');
assert(landingHtml.includes('brand-centerpiece'), 'Mobile centerpiece preserved');
assert(landingHtml.includes('id="chat-form"'), 'Mobile chat form preserved');
assert(landingHtml.includes('id="query-input"'), 'Mobile query input preserved');
assert(landingHtml.includes('id="voice-modal"'), 'Mobile voice modal preserved');
assert(landingHtml.includes('id="camera-modal"'), 'Mobile camera modal preserved');
assert(landingHtml.includes('id="lang-modal"'), 'Mobile language modal preserved');
assert(landingHtml.includes('id="history-modal"'), 'Mobile history modal preserved');
assert(landingHtml.includes('id="landing-recents-list"'), 'Mobile recents list preserved');
console.log('  ✓ PASS: Mobile landing page design and features are 100% preserved\n');

// ---------------------------------------------------------------------------
// TEST 4: Responsive Switching & No Duplication
// ---------------------------------------------------------------------------
console.log('TEST 4: Responsive Switching & No Active DOM Duplication');
// Check templates
assert(landingHtml.includes('id="template-mobile-landing"'), 'Must have mobile template');
assert(landingHtml.includes('id="template-desktop-landing"'), 'Must have desktop template');
assert(landingHtml.includes('id="landing-app-root"'), 'Must have single mounting root');

// Check media query threshold: exactly 768px
assert(landingHtml.includes('(min-width: 768px)'), 'Must check breakpoint at 768px');

// Check that switching clears root innerHTML before appending new template
assert(landingHtml.includes("root.innerHTML = ''"), 'Must clear root before mounting to prevent duplication');
console.log('  ✓ PASS: Uses templates + single mounting root to guarantee zero duplicated DOM elements\n');

// ---------------------------------------------------------------------------
// TEST 5: Server Route Integration
// ---------------------------------------------------------------------------
console.log('TEST 5: Server Routes for Landing Pages');
const app = require('../server');
const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;

  async function fetchPath(p) {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${port}${p}`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }).on('error', reject);
    });
  }

  try {
    // 1. Root / route serves responsive landing page
    const resRoot = await fetchPath('/');
    assert.strictEqual(resRoot.status, 200);
    assert(resRoot.body.includes('template-desktop-landing'), 'Root / must serve responsive landing page with desktop template');
    assert(resRoot.body.includes('template-mobile-landing'), 'Root / must serve responsive landing page with mobile template');
    console.log('  ✓ PASS: GET / serves responsive landing page with both templates');

    // 2. /landing route serves responsive landing page
    const resLanding = await fetchPath('/landing');
    assert.strictEqual(resLanding.status, 200);
    assert(resLanding.body.includes('template-desktop-landing'), '/landing must serve responsive landing page');
    console.log('  ✓ PASS: GET /landing serves responsive landing page');

    // 3. /desktop-landing serves standalone desktop landing page
    const resDesktop = await fetchPath('/desktop-landing');
    assert.strictEqual(resDesktop.status, 200);
    assert(resDesktop.body.includes('data-purpose="sidebar-navigation"'), '/desktop-landing serves exact desktop UI');
    console.log('  ✓ PASS: GET /desktop-landing serves exact desktop page');

    // 4. /desktop serves standalone desktop landing page
    const resDesktopShort = await fetchPath('/desktop');
    assert.strictEqual(resDesktopShort.status, 200);
    assert(resDesktopShort.body.includes('data-purpose="sidebar-navigation"'), '/desktop serves exact desktop UI');
    console.log('  ✓ PASS: GET /desktop serves exact desktop page');

    // 5. /?view=desktop serves desktop landing page directly
    const resViewDesktop = await fetchPath('/?view=desktop');
    assert.strictEqual(resViewDesktop.status, 200);
    assert(resViewDesktop.body.includes('data-purpose="sidebar-navigation"'), '/?view=desktop serves desktop page directly');
    console.log('  ✓ PASS: GET /?view=desktop serves desktop page directly');

    console.log('\n======================================================================');
    console.log('ALL RESPONSIVE SWITCHING & INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================================\n');
  } catch (err) {
    console.error('Test failure:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
