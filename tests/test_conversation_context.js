const assert = require('assert');
const {
  buildOrUpdateContext,
  KNOWN_ENTITIES,
  classifyFollowUpIntent,
  rewriteFollowUpQuery
} = require('../src/services/conversationContextService');
const { retrieveBisEvidence } = require('../src/services/bisRetrievalService');

console.log('==================================================');
console.log('Testing Real Conversation Context & Follow-Up Memory');
console.log('==================================================\n');

let currentContext = null;

// Turn 1
console.log('Turn 1: "What BIS standard applies to a water bottle?"');
const t1 = buildOrUpdateContext('What BIS standard applies to a water bottle?', [], currentContext);
currentContext = t1.context;
console.log('  Active Entity:', currentContext.active_entity);
console.log('  Active Standard:', currentContext.active_standard);
console.log('  Is Follow-up:', t1.isFollowUp);
assert.strictEqual(currentContext.active_entity, 'water bottle');
assert.strictEqual(currentContext.active_standard, 'IS 15410:2025');
assert.strictEqual(t1.isFollowUp, false);
console.log('  ✓ PASS: Initial product and standard recognized.\n');

// Turn 2
console.log('Turn 2: "Is certification required?"');
const t2 = buildOrUpdateContext('Is certification required?', [], currentContext);
currentContext = t2.context;
console.log('  Active Entity:', currentContext.active_entity);
console.log('  Rewritten Query:', t2.rewrittenQuery);
console.log('  Is Follow-up:', t2.isFollowUp);
assert.strictEqual(currentContext.active_entity, 'water bottle');
assert.strictEqual(t2.isFollowUp, true);
assert.ok(t2.rewrittenQuery.toLowerCase().includes('water bottle'));
assert.ok(t2.rewrittenQuery.toLowerCase().includes('mandatory') || t2.rewrittenQuery.toLowerCase().includes('certification'));
console.log('  ✓ PASS: Follow-up resolved to water bottle certification.\n');

// Turn 3
console.log('Turn 3: "What documents are required?"');
const t3 = buildOrUpdateContext('What documents are required?', [], currentContext);
currentContext = t3.context;
console.log('  Active Entity:', currentContext.active_entity);
console.log('  Rewritten Query:', t3.rewrittenQuery);
console.log('  Is Follow-up:', t3.isFollowUp);
assert.strictEqual(currentContext.active_entity, 'water bottle');
assert.strictEqual(t3.isFollowUp, true);
assert.ok(t3.rewrittenQuery.toLowerCase().includes('documents'));
assert.ok(t3.rewrittenQuery.toLowerCase().includes('water bottle'));
console.log('  ✓ PASS: Documents inquiry resolved to water bottle.\n');

// Turn 4
console.log('Turn 4: "How much does it cost?"');
const t4 = buildOrUpdateContext('How much does it cost?', [], currentContext);
currentContext = t4.context;
console.log('  Active Entity:', currentContext.active_entity);
console.log('  Rewritten Query:', t4.rewrittenQuery);
console.log('  Is Follow-up:', t4.isFollowUp);
assert.strictEqual(currentContext.active_entity, 'water bottle');
assert.strictEqual(t4.isFollowUp, true);
assert.ok(t4.rewrittenQuery.toLowerCase().includes('cost') || t4.rewrittenQuery.toLowerCase().includes('fee'));
assert.ok(t4.rewrittenQuery.toLowerCase().includes('water bottle'));
console.log('  ✓ PASS: Cost inquiry resolved to water bottle.\n');

// Turn 5: Topic switch to helmets
console.log('Turn 5: "Now tell me about helmets."');
const t5 = buildOrUpdateContext('Now tell me about helmets.', [], currentContext);
currentContext = t5.context;
console.log('  Active Entity:', currentContext.active_entity);
console.log('  Active Standard:', currentContext.active_standard);
console.log('  Is Follow-up:', t5.isFollowUp);
assert.strictEqual(currentContext.active_entity, 'helmet');
assert.strictEqual(currentContext.active_standard, 'IS 4151:2020');
assert.strictEqual(t5.isFollowUp, false);
console.log('  ✓ PASS: Topic successfully switched to helmet.\n');

// Turn 6: Follow-up on new entity (helmet)
console.log('Turn 6: "Is certification required?" (after helmets)');
const t6 = buildOrUpdateContext('Is certification required?', [], currentContext);
currentContext = t6.context;
console.log('  Active Entity:', currentContext.active_entity);
console.log('  Rewritten Query:', t6.rewrittenQuery);
console.log('  Is Follow-up:', t6.isFollowUp);
assert.strictEqual(currentContext.active_entity, 'helmet');
assert.strictEqual(t6.isFollowUp, true);
assert.ok(t6.rewrittenQuery.toLowerCase().includes('helmet'));
assert.ok(!t6.rewrittenQuery.toLowerCase().includes('water bottle'));
console.log('  ✓ PASS: Follow-up correctly refers to helmet, NOT water bottle!\n');

// Test RAG Retrieval with rewritten queries
console.log('Testing RAG Retrieval using rewritten follow-up queries...');
(async () => {
  // Query 2 retrieval with rewritten query
  const evWaterCert = await retrieveBisEvidence(t2.rewrittenQuery);
  assert.ok(evWaterCert.results.length > 0);
  assert.strictEqual(evWaterCert.results[0].base_number, '15410');
  console.log('  ✓ PASS: RAG retrieved IS 15410 for rewritten water bottle certification query.');

  // Query 6 retrieval with rewritten query
  const evHelmetCert = await retrieveBisEvidence(t6.rewrittenQuery);
  assert.ok(evHelmetCert.results.length > 0);
  assert.strictEqual(evHelmetCert.results[0].base_number, '4151');
  console.log('  ✓ PASS: RAG retrieved IS 4151 for rewritten helmet certification query.');

  // Multilingual Hinglish follow-up
  const tHindi = buildOrUpdateContext('kya ye anivarye hai?', [], currentContext);
  console.log('  Hindi follow-up rewritten:', tHindi.rewrittenQuery);
  assert.strictEqual(tHindi.isFollowUp, true);
  assert.ok(tHindi.rewrittenQuery.toLowerCase().includes('helmet'));
  console.log('  ✓ PASS: Multilingual follow-up ("kya ye anivarye hai?") resolved to helmet.');

  console.log('\n==================================================');
  console.log('All Conversation Context & Follow-Up Memory Tests Passed!');
  console.log('==================================================');
})();
