/**
 * BISsetu Automated Test Suite
 * Tests Section 14, 15, 17 of BISsetu AI Instruction Specification:
 * - 1. IS-number queries (IS 10500, IS 456)
 * - 2. Keyword queries (helmet, gold hallmarking, packaged water)
 * - 3. Hindi / Hinglish queries ("peene ka paani", "kya mandatory hai")
 * - 4. No-result cases (unmatched standard / queries)
 * - 5. Unsupported detail queries (Clause 7 limit check)
 * - 6. Ambiguous queries (IS 302 variants)
 * - 7. Backend /api/search integration contract check
 */

require('dotenv').config();
const { retrieveBisEvidence, analyzeQuery } = require('../src/services/bisRetrievalService');
const { generateAnswer } = require('../src/services/geminiService');
const { validateAnswer } = require('../src/services/answerValidationService');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('==================================================');
  console.log('Running BISsetu Verification Test Suite');
  console.log('==================================================\n');

  // Test 1: IS Number Query - IS 10500
  console.log('Test 1: IS-Number Lookup (IS 10500)');
  const q1 = 'IS 10500 kya hai?';
  const ev1 = await retrieveBisEvidence(q1);
  assert(ev1.results.length > 0, 'Retrieves at least one record for IS 10500');
  assert(ev1.results[0].standard_number.includes('10500'), 'Standard number matches IS 10500');
  assert(ev1.results[0].title.includes('Drinking Water'), 'Title includes Drinking Water');
  
  const gen1 = await generateAnswer(q1, ev1);
  const val1 = validateAnswer(gen1.answer, q1, ev1);
  assert(val1.isValid, 'Answer passes grounding validation');
  assert(val1.validatedAnswer.includes('Answer:'), 'Answer contains "Answer:" section header');
  assert(val1.validatedAnswer.includes('Key points:'), 'Answer contains "Key points:" section');
  assert(val1.validatedAnswer.includes('Source:'), 'Answer contains "Source:" section');
  console.log();

  // Test 2: IS Number Lookup - IS 456
  console.log('Test 2: IS-Number Lookup (IS 456)');
  const q2 = 'IS 456 concrete standard';
  const ev2 = await retrieveBisEvidence(q2);
  assert(ev2.results.length > 0, 'Retrieves IS 456');
  assert(ev2.results[0].standard_number.includes('456'), 'Standard is IS 456');
  assert(ev2.results[0].title.includes('Concrete'), 'Title refers to Concrete');
  console.log();

  // Test 3: Keyword Search - Helmet
  console.log('Test 3: Keyword / Product Lookup (Helmet)');
  const q3 = 'helmet ka BIS standard kya hai?';
  const ev3 = await retrieveBisEvidence(q3);
  assert(ev3.results.length > 0, 'Finds helmet standard');
  assert(ev3.results[0].standard_number.includes('4151'), 'Resolves to IS 4151');
  assert(ev3.results[0].mandatory_status.includes('Mandatory'), 'Accurately reports QCO mandatory status');
  console.log();

  // Test 4: Keyword Search - Gold Hallmarking (HUID)
  console.log('Test 4: Keyword Search (Gold Hallmark / HUID)');
  const q4 = 'how to verify gold hallmark HUID in India?';
  const ev4 = await retrieveBisEvidence(q4);
  assert(ev4.results.length > 0, 'Finds gold hallmark standard');
  assert(ev4.results.some(r => r.base_number === '15820' || r.base_number === '1417'), 'Resolves to IS 15820 or IS 1417');
  console.log();

  // Test 5: Hindi / Hinglish Query
  console.log('Test 5: Hindi / Hinglish Query Processing');
  const q5 = 'peene ke paani ka standard batao';
  const analysis5 = analyzeQuery(q5);
  assert(analysis5.languageHint === 'hinglish' || analysis5.languageHint === 'hi', 'Correctly detects Hinglish language hint');
  const ev5 = await retrieveBisEvidence(q5);
  assert(ev5.results.some(r => r.base_number === '10500'), 'Maps "peene ke paani" to IS 10500');
  console.log();

  // Test 6: No Result Handling (PDF Section 8)
  console.log('Test 6: No Result Case Handling');
  const q6 = 'IS 99999999 non-existent standard';
  const ev6 = await retrieveBisEvidence(q6);
  assert(ev6.results.length === 0, 'Returns zero results for non-existent standard');
  const gen6 = await generateAnswer(q6, ev6);
  const val6 = validateAnswer(gen6.answer, q6, ev6);
  assert(val6.validatedAnswer.includes("couldn't find") || val6.validatedAnswer.includes('नहीं मिला'), 'Returns explicit "could not find" message per Section 8');
  console.log();

  // Test 7: Ambiguous Query (IS 302 - PDF Section 14 Example D)
  console.log('Test 7: Ambiguous Query Clarification (IS 302)');
  const q7 = 'IS 302';
  const ev7 = await retrieveBisEvidence(q7);
  assert(ev7.isAmbiguous === true, 'Marks IS 302 as ambiguous requiring clarification');
  const gen7 = await generateAnswer(q7, ev7);
  assert(gen7.answer.includes('Part 1') || gen7.answer.includes('specify'), 'Provides clarification of multiple parts rather than silently picking one');
  console.log();

  // Test 8: Unsupported Detail (PDF Section 14 Example C)
  console.log('Test 8: Unsupported Clause Detail (Clause 7 Limit)');
  const q8 = 'IS 10500 me exact clause 7 ka limit kya hai?';
  const ev8 = await retrieveBisEvidence(q8);
  const gen8 = await generateAnswer(q8, ev8);
  assert((gen8.answer.includes('clause 7') || gen8.answer.includes('क्लॉज 7') || gen8.answer.includes('clause')) && (gen8.answer.includes('not present') || gen8.answer.includes('सम्मिलित नहीं')), 'States that clause 7 is not present in retrieved evidence per Section 14');
  console.log();

  // Test Summary
  console.log('==================================================');
  console.log(`Results: ${passedTests} passed, ${failedTests} failed.`);
  console.log('==================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
