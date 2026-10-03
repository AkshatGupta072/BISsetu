/**
 * BISsetu Search Architecture Test Suite
 * Validates the 10 Mandatory Search Architecture Test Cases:
 * 1. "bis for cold drink" -> Carbonated Beverage IS 2346:1992
 * 2. "bis for edible oil" -> Multi-standard edible oil category (IS 546, IS 10633, etc.)
 * 3. "bis for mustard oil" -> IS 546:1975
 * 4. "bis for cooking oil" -> Normalizes cooking oil to edible vegetable oil concepts
 * 5. "bis for LED bulb" -> Self-ballasted LED lamps IS 16102 Part 1
 * 6. "what is BIS for pipe" -> Disambiguates UPVC, CPVC, GI, HDPE
 * 7. "what is BIS for cement" -> Disambiguates OPC, PPC, PSC
 * 8. "what is BIS for packaged drinking water" -> IS 14543:2016 / IS 13428:2005
 * 9. Multi-turn follow-up: "what is BIS for packaged drinking water?" -> "is certification mandatory?"
 * 10. Unknown product: "bis for xyz123 product" -> Honest no-result without hallucination
 */

require('dotenv').config();
const { retrieveBisEvidence } = require('../src/services/bisRetrievalService');
const { generateAnswer } = require('../src/services/geminiService');
const { validateAnswer } = require('../src/services/answerValidationService');
const { buildOrUpdateContext } = require('../src/services/conversationContextService');

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

async function runSearchArchitectureTests() {
  console.log('================================================================');
  console.log('Running BISsetu 10 Mandatory Search Architecture Tests');
  console.log('================================================================\n');

  // Test Case 1: "bis for cold drink"
  console.log('Test 1: "bis for cold drink" (Terminology expansion to carbonated beverage)');
  const q1 = 'bis for cold drink';
  const ev1 = await retrieveBisEvidence(q1);
  assert(ev1.results.length > 0, 'Retrieves matching standard for cold drink');
  assert(ev1.results.some(r => r.base_number === '2346'), 'Resolves to IS 2346 (Carbonated Beverages)');
  const gen1 = await generateAnswer(q1, ev1);
  const val1 = validateAnswer(gen1.answer, q1, ev1);
  assert(val1.isValid, 'Cold drink response passes validation');
  assert(val1.validatedAnswer.includes('2346'), 'Answer mentions IS 2346');
  console.log();

  // Test Case 2: "bis for edible oil"
  console.log('Test 2: "bis for edible oil" (Broad category multi-standard breakdown)');
  const q2 = 'bis for edible oil';
  const ev2 = await retrieveBisEvidence(q2);
  assert(ev2.results.length > 0, 'Retrieves edible oil standards');
  assert(ev2.disambiguation !== null && Array.isArray(ev2.disambiguation.options), 'Generates disambiguation options for edible oils');
  const gen2 = await generateAnswer(q2, ev2);
  const val2 = validateAnswer(gen2.answer, q2, ev2);
  assert(val2.isValid, 'Edible oil answer passes validation');
  assert(val2.validatedAnswer.includes('546') || val2.validatedAnswer.includes('Mustard'), 'Answer covers key edible oil varieties');
  console.log();

  // Test Case 3: "bis for mustard oil"
  console.log('Test 3: "bis for mustard oil" (Specific edible oil standard)');
  const q3 = 'bis for mustard oil';
  const ev3 = await retrieveBisEvidence(q3);
  assert(ev3.results.length > 0, 'Retrieves mustard oil standard');
  assert(ev3.results[0].base_number === '546', 'Top result is IS 546:1975');
  const gen3 = await generateAnswer(q3, ev3);
  const val3 = validateAnswer(gen3.answer, q3, ev3);
  assert(val3.isValid, 'Mustard oil answer passes validation');
  assert(val3.validatedAnswer.includes('546'), 'Answer references IS 546');
  console.log();

  // Test Case 4: "bis for cooking oil"
  console.log('Test 4: "bis for cooking oil" (Normalization of cooking oil to edible vegetable oil)');
  const q4 = 'bis for cooking oil';
  const ev4 = await retrieveBisEvidence(q4);
  assert(ev4.results.length > 0, 'Retrieves results for cooking oil');
  assert(ev4.normalizedProduct && ev4.normalizedProduct.normalizedProduct.includes('edible vegetable oil'), 'Normalizes cooking oil to edible vegetable oil');
  const gen4 = await generateAnswer(q4, ev4);
  const val4 = validateAnswer(gen4.answer, q4, ev4);
  assert(val4.isValid, 'Cooking oil response passes validation');
  console.log();

  // Test Case 5: "bis for LED bulb"
  console.log('Test 5: "bis for LED bulb" (Self-ballasted LED lamps IS 16102 Part 1)');
  const q5 = 'bis for LED bulb';
  const ev5 = await retrieveBisEvidence(q5);
  assert(ev5.results.length > 0, 'Retrieves LED bulb standard');
  assert(ev5.results.some(r => r.base_number === '16102'), 'Resolves to IS 16102');
  const gen5 = await generateAnswer(q5, ev5);
  const val5 = validateAnswer(gen5.answer, q5, ev5);
  assert(val5.isValid, 'LED bulb response passes validation');
  assert(val5.validatedAnswer.includes('16102'), 'Answer contains IS 16102');
  console.log();

  // Test Case 6: "what is BIS for pipe"
  console.log('Test 6: "what is BIS for pipe" (Broad product disambiguation: UPVC, CPVC, GI, HDPE)');
  const q6 = 'what is BIS for pipe';
  const ev6 = await retrieveBisEvidence(q6);
  assert(ev6.disambiguation !== null, 'Identifies pipe as broad ambiguous product requiring disambiguation');
  assert(ev6.disambiguation.options.length >= 3, 'Provides at least 3 distinct piping options (UPVC, CPVC, GI)');
  const gen6 = await generateAnswer(q6, ev6);
  const val6 = validateAnswer(gen6.answer, q6, ev6);
  assert(val6.isValid, 'Pipe answer passes validation');
  assert(val6.validatedAnswer.includes('4985') && val6.validatedAnswer.includes('15778'), 'Answer lists multiple pipe standards without picking only one');
  console.log();

  // Test Case 7: "what is BIS for cement"
  console.log('Test 7: "what is BIS for cement" (Broad product disambiguation: OPC, PPC, PSC)');
  const q7 = 'what is BIS for cement';
  const ev7 = await retrieveBisEvidence(q7);
  assert(ev7.disambiguation !== null, 'Identifies cement as broad ambiguous product requiring disambiguation');
  assert(ev7.disambiguation.options.some(o => o.standardNumber.includes('269')), 'Contains OPC IS 269');
  assert(ev7.disambiguation.options.some(o => o.standardNumber.includes('1489')), 'Contains PPC IS 1489');
  const gen7 = await generateAnswer(q7, ev7);
  const val7 = validateAnswer(gen7.answer, q7, ev7);
  assert(val7.isValid, 'Cement answer passes validation');
  assert(val7.validatedAnswer.includes('269') && val7.validatedAnswer.includes('1489'), 'Answer breaks down OPC and PPC');
  console.log();

  // Test Case 8: "what is BIS for packaged drinking water"
  console.log('Test 8: "what is BIS for packaged drinking water" (IS 14543 / IS 13428 mandatory ISI mark)');
  const q8 = 'what is BIS for packaged drinking water';
  const ev8 = await retrieveBisEvidence(q8);
  assert(ev8.results.length > 0, 'Retrieves packaged drinking water standard');
  assert(ev8.results.some(r => r.base_number === '14543'), 'Resolves to IS 14543');
  const gen8 = await generateAnswer(q8, ev8);
  const val8 = validateAnswer(gen8.answer, q8, ev8);
  assert(val8.isValid, 'Packaged drinking water answer passes validation');
  assert(val8.validatedAnswer.includes('14543'), 'Answer includes IS 14543');
  console.log();

  // Test Case 9: Multi-Turn Context Follow-Up
  console.log('Test 9: Multi-Turn Follow-Up ("what is BIS for packaged drinking water" -> "is certification mandatory?")');
  // Turn 1
  const t1Query = 'what is BIS for packaged drinking water';
  const t1Context = buildOrUpdateContext(t1Query, [], null);
  const t1Ev = await retrieveBisEvidence(t1Query);
  const t1Gen = await generateAnswer(t1Query, t1Ev);
  t1Context.context.retrievedEvidence = t1Ev.results;
  assert(t1Context.context.active_standard === 'IS 14543:2016' || t1Context.context.active_entity.includes('water'), 'Context tracks active product / standard');

  // Turn 2
  const t2Query = 'is certification mandatory?';
  const t2Context = buildOrUpdateContext(t2Query, [
    { role: 'user', content: t1Query },
    { role: 'assistant', content: t1Gen.answer }
  ], t1Context.context);
  assert(t2Context.isFollowUp === true, 'Correctly detects follow-up query');
  assert(t2Context.rewrittenQuery.toLowerCase().includes('water') || t2Context.context.active_standard.includes('14543'), 'Resolves context with previous standard/product');

  const t2Ev = await retrieveBisEvidence(t2Context.rewrittenQuery, {
    isFollowUp: true,
    context: t2Context.context
  });
  assert(t2Ev.results.length > 0, 'Retrieves evidence based on retained conversational context');
  const t2Gen = await generateAnswer(t2Context.rewrittenQuery, t2Ev, {
    isFollowUp: true,
    context: t2Context.context
  });
  const t2Val = validateAnswer(t2Gen.answer, t2Context.rewrittenQuery, t2Ev);
  assert(t2Val.isValid, 'Follow-up answer passes validation');
  assert(/mandatory|अनिवार्य/i.test(t2Val.validatedAnswer), 'Correctly answers that certification is mandatory');
  console.log();

  // Test Case 10: Unknown product honestly returns no-result without hallucination
  console.log('Test 10: Unknown Product ("bis for xyz123 product")');
  const q10 = 'bis for xyz123 product';
  const ev10 = await retrieveBisEvidence(q10);
  assert(ev10.results.length === 0, 'Returns 0 results for non-existent product');
  const gen10 = await generateAnswer(q10, ev10);
  const val10 = validateAnswer(gen10.answer, q10, ev10);
  assert(val10.isValid, 'No-result answer passes validation');
  assert(val10.validatedAnswer.includes("couldn't find") || val10.validatedAnswer.includes("not found") || val10.validatedAnswer.includes("नहीं मिला"), 'Honestly states no matching record found');
  assert(!/applicable\s+standard\s+is\s+IS|for\s+xyz123\s+(is\s+)?IS/i.test(val10.validatedAnswer), 'Does NOT claim an ungrounded standard applies to xyz123');
  console.log();

  // Summary
  console.log('================================================================');
  console.log(`Results: ${passedTests} passed, ${failedTests} failed.`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSearchArchitectureTests().catch(err => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
