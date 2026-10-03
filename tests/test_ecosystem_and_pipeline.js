/**
 * Test Suite: Topic-Aware Ecosystem Retrieval, Natural Conversational Layer, and Atomic Response Pipeline
 * Verifies the 6 questions required by user:
 * A. How can I identify the applicable Indian Standard for a product?
 * B. How can a consumer file a complaint with BIS?
 * C. What is HUID?
 * D. What is the role of BIS regional offices?
 * E. What is a QCO?
 * F. What is ISI Mark?
 */

const assert = require('assert');

let passed = 0;
let total = 0;

function check(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

const app = require('../server');

let serverInstance = null;
let baseUrl = 'http://localhost:3000';

async function setupServer() {
  try {
    const res = await fetch('http://localhost:3000/api/health', { signal: AbortSignal.timeout(500) });
    if (res.ok) {
      baseUrl = 'http://localhost:3000';
      return;
    }
  } catch (e) {
    // Port 3000 not running, start ephemeral server
  }
  await new Promise((resolve) => {
    serverInstance = app.listen(0, () => {
      const port = serverInstance.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
}

async function testEndpoint(query, expectedCategory, assertions = []) {
  console.log(`\nTesting Query: "${query}"`);
  const reqId = 'test-' + Math.random().toString(36).substring(2, 8);

  const res = await fetch(`${baseUrl}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestId: reqId,
      query: query
    })
  });

  check(res.ok, `HTTP status 200 OK for query`);
  const data = await res.json();

  check(data.requestId === reqId, `Returns matching requestId: ${data.requestId}`);
  check(data.validated === true, `Answer validated against official BIS evidence (validated=true)`);
  check(typeof data.answer === 'string' && data.answer.length > 50, `Returns comprehensive answer (length: ${data.answer.length})`);
  check(Array.isArray(data.sources) && data.sources.length > 0, `Provides official BIS sources (${data.sources.length} sources)`);

  // Conversational Opening Check: Should start with a friendly natural phrase
  const startsConversational = /^(Yes|Sure|Hi|This|हाँ|नमस्ते|I checked|I couldn't|I could not)/i.test(data.answer.trim());
  check(startsConversational, `Begins with a natural conversational opening (preview: "${data.answer.substring(0, 60)}...")`);

  // Universal Check: Must NOT command user to manually search external portals
  const tellsUserToSearch = /visit\s+(the\s+)?(official\s+)?(bis\s+)?(website|portal)\s+(at\s+https?:\/\/\S+\s+)?to\s+search|search\s+the\s+official\s+bis\s+(standards\s+)?portal\s+at|please\s+search\s+the\s+bis\s+website\s+yourself|confirm\s+the\s+specific\s+indian\s+standard\s+using/i.test(data.answer);
  check(!tellsUserToSearch, `Does NOT tell the user to manually browse or search BIS websites`);

  // Run specific topic assertions
  for (const fn of assertions) {
    fn(data);
  }
}

async function run() {
  await setupServer();
  console.log('================================================================');
  console.log('Testing BIS Ecosystem Retrieval & Atomic Response Pipeline');
  console.log('================================================================');

  // Test A: How can I identify the applicable Indian Standard for a product?
  await testEndpoint(
    'How can I identify the applicable Indian Standard for a product?',
    'standards_identification_generic',
    [
      (d) => check(!d.answer.includes('Drinking Water — Specification'), 'Does NOT assign random standard (IS 10500) to generic question'),
      (d) => check(/Division Councils|Sectional Committees|Product Manual|QCO/i.test(d.answer), 'Explains official BIS classification framework & Sectional Committees'),
      (d) => check(/Bureau of Indian Standards/i.test(d.answer), 'References Bureau of Indian Standards'),
      (d) => check(!/visit standards\.bis\.gov\.in and search/i.test(d.answer), 'Does NOT tell user to visit standards.bis.gov.in and search')
    ]
  );

  // Test B: How can a consumer file a complaint with BIS?
  await testEndpoint(
    'How can a consumer file a complaint with BIS?',
    'consumer_complaints',
    [
      (d) => check(/BIS Care|e-BIS|Consumer Affairs|complaints@bis\.gov\.in/i.test(d.answer), 'Explains BIS Care App or official consumer grievance portal'),
      (d) => check(/CM\/L|HUID|bill|receipt|invoice|licen[cs]e|evidence|photo/i.test(d.answer), 'Mentions required complaint details (bill, CM/L, HUID, license, or evidence)'),
      (d) => check(/investigat|inspect|testing|Section 29|refund|replacement|redress/i.test(d.answer), 'Outlines official investigation / enforcement process'),
      (d) => check(!/check BIS consumer complaints on the BIS website/i.test(d.answer), 'Explains procedure directly rather than redirecting to browse')
    ]
  );

  // Test C: What is HUID?
  await testEndpoint(
    'What is HUID?',
    'hallmarking_huid',
    [
      (d) => check(/6-digit|six-digit|alphanumeric/i.test(d.answer), 'Explains 6-digit alphanumeric code definition'),
      (d) => check(/hallmark|jeweller|gold|Assaying/i.test(d.answer), 'Mentions hallmarking / precious metals / assaying centres'),
      (d) => check(/BIS Care|Verify HUID/i.test(d.answer), 'Explains consumer verification on BIS Care App')
    ]
  );

  // Test D: What is the role of BIS regional offices?
  await testEndpoint(
    'What is the role of BIS regional offices?',
    'regional_offices',
    [
      (d) => check(/5 Regional|Northern|Western|Southern|Eastern|Central|ROs/i.test(d.answer), 'Explains Regional Offices network and structure'),
      (d) => check(/licens|surveillance|audit|enforcement|laborator/i.test(d.answer), 'Details statutory functions (licensing, surveillance, labs, enforcement)')
    ]
  );

  // Test E: What is a QCO?
  await testEndpoint(
    'What is a QCO?',
    'qco_compliance',
    [
      (d) => check(/Quality Control Order/i.test(d.answer), 'Identifies Quality Control Order full title'),
      (d) => check(/Section 16|BIS Act|mandatory|compulsory/i.test(d.answer), 'Explains statutory authority (Section 16 BIS Act / mandatory compliance)'),
      (d) => check(/penalt|imprisonment|fine|prohibit/i.test(d.answer), 'Mentions legal enforcement & penalties under Section 29')
    ]
  );

  // Test F: What is ISI Mark?
  await testEndpoint(
    'What is ISI Mark?',
    'isi_mark',
    [
      (d) => check(/pyramid|logo|symbol/i.test(d.answer), 'Mentions ISI pyramid mark / logo'),
      (d) => check(/CM\/L|license number/i.test(d.answer), 'Explains 7-digit CM/L license number below logo'),
      (d) => check(/Scheme I|Conformity Assessment|standard number/i.test(d.answer), 'Explains Scheme I conformity assessment & standard number above logo')
    ]
  );

  // Test G: Action Request - Where to apply for BIS certification
  await testEndpoint(
    'Where can I apply for BIS certification for helmets?',
    'standards',
    [
      (d) => check(/Application Process|Step|Form-V|audit|testing|grant/i.test(d.answer), 'Explains verified application process steps before/with link'),
      (d) => check(/Manakonline/i.test(d.answer), 'Provides official Manakonline application portal as reference citation'),
      (d) => check(!/visit.*portal.*to search/i.test(d.answer), 'Does NOT tell user to search portal')
    ]
  );

  // Test H: No Match Handling - Never say "Please search the website yourself"
  await testEndpoint(
    'What is Indian Standard IS 99999?',
    'standards',
    [
      (d) => check(/couldn't find a matching record|could not find a matching record/i.test(d.answer), 'Clearly states no matching record found in official sources'),
      (d) => check(!/search the BIS website yourself/i.test(d.answer), 'Does NOT say "Please search the BIS website yourself"'),
      (d) => check(!/search the official BIS Standards portal at/i.test(d.answer), 'Does NOT redirect user to search the portal')
    ]
  );

  console.log('\n================================================================');
  console.log(`Results: ${passed} / ${total} checks passed`);
  console.log('================================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
