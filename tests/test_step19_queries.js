/**
 * Step 19 Verification Suite: 10 Target Queries
 * Tests the 10 specific product queries required in Step 19 of the specification:
 * 1. "bis for cold drink"
 * 2. "tell me bis for edible oil"
 * 3. "bis for cooking oil"
 * 4. "mustard oil ka BIS"
 * 5. "khane wale tel ka BIS"
 * 6. "plastic pani bottle ka BIS"
 * 7. "bike helmet ka BIS"
 * 8. "phone charger ka BIS"
 * 9. "LED bulb ka BIS"
 * 10. "pipe ka BIS"
 */

require('dotenv').config();
const { retrieveBisEvidence } = require('../src/services/bisRetrievalService');
const { generateAnswer } = require('../src/services/geminiService');
const { validateAnswer } = require('../src/services/answerValidationService');

const queries = [
  { id: 1, q: "bis for cold drink", expectedKey: "2346", label: "Cold drink -> Carbonated Beverage IS 2346" },
  { id: 2, q: "tell me bis for edible oil", expectedKey: "oil", isBroad: true, label: "Edible oil -> Multi-standard edible oil category" },
  { id: 3, q: "bis for cooking oil", expectedKey: "oil", isBroad: true, label: "Cooking oil -> Edible vegetable oil standards" },
  { id: 4, q: "mustard oil ka BIS", expectedKey: "546", label: "Mustard oil ka BIS -> IS 546" },
  { id: 5, q: "khane wale tel ka BIS", expectedKey: "oil", isBroad: true, label: "Khane wale tel -> Edible oil category disambiguation" },
  { id: 6, q: "plastic pani bottle ka BIS", expectedKey: "15410", label: "Plastic pani bottle -> Containers for water IS 15410 / IS 17526" },
  { id: 7, q: "bike helmet ka BIS", expectedKey: "4151", label: "Bike helmet ka BIS -> Two-wheeler helmet IS 4151" },
  { id: 8, q: "phone charger ka BIS", expectedKey: "13252", label: "Phone charger ka BIS -> IT equipment safety IS 13252 (CRS)" },
  { id: 9, q: "LED bulb ka BIS", expectedKey: "16102", label: "LED bulb ka BIS -> Self-ballasted LED lamps IS 16102" },
  { id: 10, q: "pipe ka BIS", expectedKey: "pipe", isBroad: true, label: "Pipe ka BIS -> Disambiguation for UPVC/CPVC/GI/HDPE" }
];

async function runStep19Tests() {
  console.log('================================================================');
  console.log('STEP 19 VERIFICATION: 10 MANDATORY PRODUCT QUERIES');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  for (const item of queries) {
    console.log(`\n>>> [QUERY ${item.id}/10]: "${item.q}" (${item.label})`);
    try {
      const evidence = await retrieveBisEvidence(item.q, { requestId: `step19-${item.id}` });
      
      if (!evidence.results || evidence.results.length === 0) {
        console.error(`  ✗ FAIL: No results retrieved for "${item.q}"`);
        failed++;
        continue;
      }

      console.log(`  ✓ Retrieved ${evidence.results.length} official BIS result(s):`);
      evidence.results.forEach(r => {
        console.log(`    - ${r.standard_number}: ${r.title}`);
      });

      if (item.isBroad) {
        if (evidence.disambiguation && evidence.disambiguation.options && evidence.disambiguation.options.length > 0) {
          console.log(`  ✓ Disambiguation options generated (${evidence.disambiguation.options.length} categories):`);
          evidence.disambiguation.options.forEach(o => console.log(`      * ${o.name} (${o.standardNumber})`));
        } else {
          console.log(`  ! Notice: Broad query returned direct candidate list without explicit disambiguation struct`);
        }
      }

      // Generate answer
      const gen = await generateAnswer(item.q, evidence, { requestId: `step19-${item.id}` });
      const val = validateAnswer(gen.answer, item.q, evidence, { requestId: `step19-${item.id}` });

      if (val.isValid) {
        console.log(`  ✓ Validation PASSED. Answer Preview:\n    ${val.validatedAnswer.substring(0, 180).replace(/\n/g, ' ')}...`);
        passed++;
      } else {
        console.error(`  ✗ Validation FAILED: ${val.reason}`);
        failed++;
      }
    } catch (err) {
      console.error(`  ✗ Error processing query ${item.id}:`, err);
      failed++;
    }
  }

  console.log('\n================================================================');
  console.log(`STEP 19 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStep19Tests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
