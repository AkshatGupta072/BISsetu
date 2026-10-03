/**
 * Test Suite: Agent Reach Web Retrieval Integration & Architecture Verification
 * Tests the 5 queries required by the user:
 * 1. "How can a consumer file a complaint with BIS?"
 * 2. "What is HUID?"
 * 3. "What is the role of BIS regional offices?"
 * 4. "What is a QCO?"
 * 5. "How can I identify the applicable Indian Standard for a product?"
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

async function testQuery(query, assertions = []) {
  console.log(`\nTesting Query: "${query}"`);
  const reqId = 'agentreach-' + Math.random().toString(36).substring(2, 8);

  const res = await fetch('http://localhost:3000/api/search', {
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
  check(typeof data.answer === 'string' && data.answer.length > 50, `Returns substantive answer (length: ${data.answer.length})`);
  check(Array.isArray(data.sources) && data.sources.length > 0, `Provides official BIS sources (${data.sources.length} sources)`);
  check(Array.isArray(data.webSources), `Provides webSources array`);

  // Conversational opening check
  const startsConversational = /^(Yes|Sure|Hi|This|हाँ|नमस्ते)/i.test(data.answer.trim());
  check(startsConversational, `Begins with a natural conversational opening (preview: "${data.answer.substring(0, 60)}...")`);

  // Universal Check: Must NOT command user to manually search external portals
  const tellsUserToSearch = /visit\s+(the\s+)?(official\s+)?(bis\s+)?(website|portal)\s+(at\s+https?:\/\/\S+\s+)?to\s+search|search\s+the\s+official\s+bis\s+(standards\s+)?portal\s+at|please\s+search\s+the\s+bis\s+website\s+yourself|confirm\s+the\s+specific\s+indian\s+standard\s+using/i.test(data.answer);
  check(!tellsUserToSearch, `Does NOT tell the user to manually browse or search BIS websites`);

  for (const fn of assertions) {
    fn(data);
  }
}

async function run() {
  console.log('================================================================');
  console.log('Testing Agent Reach Integration across 5 Mandatory Queries');
  console.log('================================================================');

  // Query 1: How can a consumer file a complaint with BIS?
  await testQuery(
    'How can a consumer file a complaint with BIS?',
    [
      (d) => check(d.agentReachPerformed === true, 'Agent Reach search was performed for consumer complaint'),
      (d) => check(/BIS CARE|e-BIS|Complaints Management|Consumer Affairs|CAD/i.test(d.answer), 'Details official complaint channels and department'),
      (d) => check(/CM\/L|HUID|bill|invoice|evidence|photo/i.test(d.answer), 'Outlines required details for filing'),
      (d) => check(/investigat|testing|enforcement|action|refund|replacement/i.test(d.answer), 'Explains statutory redressal and investigation'),
      (d) => check(d.sources.some(s => s.url.includes('bis.gov.in')), 'Includes official bis.gov.in complaint source')
    ]
  );

  // Query 2: What is HUID?
  await testQuery(
    'What is HUID?',
    [
      (d) => check(/6-digit|six-digit|alphanumeric/i.test(d.answer), 'Explains 6-digit alphanumeric code definition'),
      (d) => check(/hallmark|gold|jeweller|Assaying/i.test(d.answer), 'Explains hallmarking and precious metals traceability'),
      (d) => check(/BIS Care|Verify HUID/i.test(d.answer), 'Explains consumer verification on BIS Care App')
    ]
  );

  // Query 3: What is the role of BIS regional offices?
  await testQuery(
    'What is the role of BIS regional offices?',
    [
      (d) => check(/5 Regional|Northern|Western|Southern|Eastern|Central|ROs/i.test(d.answer), 'Explains Regional Offices network structure'),
      (d) => check(/licens|surveillance|audit|enforcement|laborator/i.test(d.answer), 'Details statutory functions (licensing, surveillance, labs, enforcement)')
    ]
  );

  // Query 4: What is a QCO?
  await testQuery(
    'What is a QCO?',
    [
      (d) => check(/Quality Control Order/i.test(d.answer), 'Identifies Quality Control Order full title'),
      (d) => check(/Section 16|BIS Act|mandatory|compulsory/i.test(d.answer), 'Explains statutory authority under Section 16 BIS Act'),
      (d) => check(/penalt|imprisonment|fine|prohibit/i.test(d.answer), 'Mentions legal enforcement and penalties under Section 29')
    ]
  );

  // Query 5: How can I identify the applicable Indian Standard for a product?
  await testQuery(
    'How can I identify the applicable Indian Standard for a product?',
    [
      (d) => check(!d.answer.includes('Drinking Water — Specification'), 'DOES NOT randomly pick or assign IS 10500 to generic query'),
      (d) => check(/Division Councils|Sectional Committees|Product Manual|QCO/i.test(d.answer), 'Explains the official BIS identification and classification process'),
      (d) => check(/Bureau of Indian Standards/i.test(d.answer), 'References Bureau of Indian Standards')
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
  console.error('Fatal Error:', err);
  process.exit(1);
});
