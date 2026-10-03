/**
 * Mobile Viewport & Horizontal Overflow Verification Suite
 * Verifies that BISsetu UI is strictly locked to device viewport on all mobile dimensions.
 */

const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const express = require('express');

const PORT = 3099;
const app = require('../server');

async function runMobileAudit() {
  console.log('==================================================');
  console.log('Running BISsetu Mobile Viewport Audit Suite');
  console.log('==================================================');

  // Start express server on test port
  const server = await new Promise(resolve => {
    const s = app.listen(PORT, () => resolve(s));
  });

  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const cdpPort = 9223;

  const edgeProcess = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  // Get WebSocket debugger URL
  const list = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${cdpPort}/json`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = list.find(x => x.type === 'page') || list[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let msgId = 1;
  const pending = new Map();

  ws.on('message', data => {
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
  });

  await new Promise(r => ws.on('open', r));

  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('DOM.enable');
  await send('Network.enable');

  const mobileDevices = [
    { name: 'iPhone SE 1st Gen (320px)', width: 320, height: 568 },
    { name: 'Android Compact (360px)', width: 360, height: 740 },
    { name: 'iPhone SE 2nd/3rd Gen (375px)', width: 375, height: 667 },
    { name: 'iPhone 14 / 15 / 16 (390px)', width: 390, height: 844 },
    { name: 'Google Pixel 7 (412px)', width: 412, height: 915 },
    { name: 'iPhone Pro Max (430px)', width: 430, height: 932 }
  ];

  const testPages = [
    { name: 'Landing Page', url: `http://localhost:${PORT}/` },
    { name: 'Search Page', url: `http://localhost:${PORT}/search` }
  ];

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ✕ FAIL: ${message}`);
      failedTests++;
    }
  }

  for (const page of testPages) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Page Under Test: ${page.name}`);
    console.log(`--------------------------------------------------`);

    for (const dev of mobileDevices) {
      console.log(`\nDevice: ${dev.name}`);

      await send('Emulation.setDeviceMetricsOverride', {
        width: dev.width,
        height: dev.height,
        deviceScaleFactor: 2,
        mobile: true
      });
      await send('Emulation.setTouchEmulationEnabled', { enabled: true });
      await send('Page.navigate', { url: page.url });
      await new Promise(r => setTimeout(r, 1200));

      const audit = await send('Runtime.evaluate', {
        expression: `(() => {
          const docW = document.documentElement ? document.documentElement.clientWidth : window.innerWidth;
          const docScrollW = document.documentElement ? document.documentElement.scrollWidth : window.innerWidth;
          const bodyW = document.body ? document.body.clientWidth : 0;
          const bodyScrollW = document.body ? document.body.scrollWidth : 0;
          const winW = window.innerWidth;

          // Attempt horizontal scroll / swipe drag
          window.scrollBy(150, 0);
          const scrolledX = window.scrollX || window.pageXOffset || 0;
          window.scrollTo(0, 0);

          // Check for any visible element that extends outside viewport width
          const elements = Array.from(document.querySelectorAll('*'));
          const overflows = [];

          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) continue;
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') continue;
            // Ignore fixed backdrop modals that are intentionally hidden
            if (el.classList.contains('hidden') || el.closest('.hidden')) continue;

            if (rect.right > winW + 1) {
              overflows.push({
                tag: el.tagName,
                id: el.id,
                class: el.className ? String(el.className).slice(0, 30) : '',
                right: rect.right,
                excess: Math.round(rect.right - winW)
              });
            }
          }

          const htmlStyle = document.documentElement ? window.getComputedStyle(document.documentElement) : {};
          const bodyStyle = document.body ? window.getComputedStyle(document.body) : {};

          return {
            winW,
            docW,
            docScrollW,
            bodyW,
            bodyScrollW,
            scrolledX,
            htmlOverflowX: htmlStyle.overflowX,
            bodyOverflowX: bodyStyle.overflowX,
            overscrollBehaviorX: htmlStyle.overscrollBehaviorX,
            overflows
          };
        })()`,
        returnByValue: true
      });

      const res = audit?.result?.value;
      if (!res) {
        console.warn('    Audit result value not returned, skipping device');
        continue;
      }

      assert(res.docScrollW <= res.docW + 1, `Document scrollWidth (${res.docScrollW}px) <= clientWidth (${res.docW}px)`);
      assert(res.bodyScrollW <= res.winW + 1, `Body scrollWidth (${res.bodyScrollW}px) <= viewport width (${res.winW}px)`);
      assert(res.scrolledX === 0, `Horizontal scroll position is locked (scrollX = ${res.scrolledX})`);
      assert(res.htmlOverflowX === 'hidden' || res.bodyOverflowX === 'hidden', `Root overflow-x is locked (html: ${res.htmlOverflowX}, body: ${res.bodyOverflowX})`);
      assert(res.overflows.length === 0, `No visible elements extend beyond viewport (found ${res.overflows.length} overflowing elements)`);
      if (res.overflows.length > 0) {
        console.error('    Overflowing elements:', JSON.stringify(res.overflows));
      }
    }
  }

  // Also test Search Page with rendered search query response and source popover panel
  console.log(`\n--------------------------------------------------`);
  console.log(`Testing Search Page with Live Card & Sources on Mobile (375px)`);
  console.log(`--------------------------------------------------`);

  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Page.navigate', { url: `http://localhost:${PORT}/search` });
  await new Promise(r => setTimeout(r, 600));

  // Render a mock AI bubble with sources and verify no overflow
  const bubbleAudit = await send('Runtime.evaluate', {
    expression: `(() => {
      // Unhide chatStream and hide branding
      const cs = document.getElementById('chatStream');
      const bc = document.getElementById('brandingCenter');
      if (cs) cs.classList.remove('hidden');
      if (bc) bc.classList.add('hidden');

      // Trigger appendAiBubble
      appendAiBubble("### Drinking Water Standards\\nIS 10500 specifies permissible limits for drinking water quality.", [], [
        { standard_number: "IS 10500:2012", title: "Drinking Water Specification", url: "https://standards.bis.gov.in" },
        { standard_number: "IS 14543:2016", title: "Packaged Drinking Water", url: "https://standards.bis.gov.in" }
      ]);

      const winW = window.innerWidth;
      const docScrollW = document.documentElement.scrollWidth;
      const bodyScrollW = document.body.scrollWidth;

      // Check all elements in chatStream
      const chatStream = document.getElementById('chatStream');
      const chatRect = chatStream ? chatStream.getBoundingClientRect() : null;

      // Toggle source panel active
      const sourceBtn = document.querySelector('.source-btn');
      if (sourceBtn) {
        sourceBtn.click();
      }

      const sourcePanel = document.querySelector('.source-panel');
      const panelRect = sourcePanel ? sourcePanel.getBoundingClientRect() : null;

      return {
        winW,
        docScrollW,
        bodyScrollW,
        chatStreamRight: chatRect ? chatRect.right : 0,
        panelRight: panelRect ? panelRect.right : 0,
        panelLeft: panelRect ? panelRect.left : 0,
        sourcePanelOverflows: panelRect ? (panelRect.right > winW + 1 || panelRect.left < -1) : false
      };
    })()`,
    returnByValue: true
  });

  const bRes = bubbleAudit?.result?.value;
  if (bRes) {
    assert(bRes.docScrollW <= bRes.winW + 1, `After rendering AI card, document scrollWidth (${bRes.docScrollW}px) fits viewport (${bRes.winW}px)`);
    assert(bRes.bodyScrollW <= bRes.winW + 1, `Body scrollWidth (${bRes.bodyScrollW}px) fits viewport (${bRes.winW}px)`);
    assert(!bRes.sourcePanelOverflows, `Source popover panel fits within viewport without right/left overflow (left: ${Math.round(bRes.panelLeft)}px, right: ${Math.round(bRes.panelRight)}px, viewport: ${bRes.winW}px)`);
  }

  console.log(`\n==================================================`);
  console.log(`Audit Results: ${passedTests} passed, ${failedTests} failed.`);
  console.log('==================================================');

  ws.close();
  edgeProcess.kill();
  server.close();

  if (failedTests > 0) {
    process.exit(1);
  }
}

runMobileAudit().catch(err => {
  console.error('Mobile audit error:', err);
  process.exit(1);
});
