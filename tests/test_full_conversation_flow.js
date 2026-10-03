const assert = require('assert');
const http = require('http');

function postApi(endpoint, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runEndToEndDialogueTest() {
  console.log('==================================================');
  console.log('Running End-to-End Dialogue & Follow-up Memory Test');
  console.log('==================================================\n');

  let history = [];
  let context = null;

  // Turn 1
  console.log('Turn 1: "What BIS standard applies to a water bottle?"');
  const res1 = await postApi('/api/search', {
    query: 'What BIS standard applies to a water bottle?',
    history,
    context
  });
  assert.strictEqual(res1.status, 200);
  console.log('  Engine:', res1.data.engine);
  console.log('  Resolved Query:', res1.data.resolvedQuery);
  console.log('  Active Entity:', res1.data.context.active_entity);
  console.log('  Identified Standard:', res1.data.context.active_standard);
  console.log('  Answer Snippet:', res1.data.answer.substring(0, 120).replace(/\n/g, ' '));
  assert.strictEqual(res1.data.context.active_entity, 'water bottle');
  assert.ok(res1.data.answer.includes('15410') || res1.data.answer.includes('water bottle'));
  
  context = res1.data.context;
  history.push({ role: 'user', content: 'What BIS standard applies to a water bottle?' });
  history.push({ role: 'model', content: res1.data.answer });
  console.log('  ✓ PASS: Turn 1 established water bottle context.\n');

  // Turn 2
  console.log('Turn 2: "Is certification required?"');
  const res2 = await postApi('/api/search', {
    query: 'Is certification required?',
    history,
    context
  });
  assert.strictEqual(res2.status, 200);
  console.log('  Engine:', res2.data.engine);
  console.log('  Is Follow-up:', res2.data.isFollowUp);
  console.log('  Resolved Query:', res2.data.resolvedQuery);
  console.log('  Active Entity:', res2.data.context.active_entity);
  console.log('  Answer Snippet:', res2.data.answer.substring(0, 140).replace(/\n/g, ' '));
  assert.strictEqual(res2.data.isFollowUp, true);
  assert.strictEqual(res2.data.context.active_entity, 'water bottle');
  assert.ok(res2.data.resolvedQuery.toLowerCase().includes('water bottle'));
  assert.ok(res2.data.answer.toLowerCase().includes('water bottle') || res2.data.answer.toLowerCase().includes('15410'));
  assert.ok(res2.data.answer.toLowerCase().includes('mandatory') || res2.data.answer.toLowerCase().includes('required') || res2.data.answer.toLowerCase().includes('yes'));

  context = res2.data.context;
  history.push({ role: 'user', content: 'Is certification required?' });
  history.push({ role: 'model', content: res2.data.answer });
  console.log('  ✓ PASS: Turn 2 understood water bottle certification inquiry.\n');

  // Turn 3
  console.log('Turn 3: "What documents are required?"');
  const res3 = await postApi('/api/search', {
    query: 'What documents are required?',
    history,
    context
  });
  assert.strictEqual(res3.status, 200);
  console.log('  Engine:', res3.data.engine);
  console.log('  Is Follow-up:', res3.data.isFollowUp);
  console.log('  Resolved Query:', res3.data.resolvedQuery);
  console.log('  Active Entity:', res3.data.context.active_entity);
  console.log('  Answer Snippet:', res3.data.answer.substring(0, 140).replace(/\n/g, ' '));
  assert.strictEqual(res3.data.isFollowUp, true);
  assert.strictEqual(res3.data.context.active_entity, 'water bottle');
  assert.ok(res3.data.resolvedQuery.toLowerCase().includes('water bottle'));
  assert.ok(res3.data.answer.toLowerCase().includes('document') || res3.data.answer.toLowerCase().includes('machinery') || res3.data.answer.toLowerCase().includes('factory'));

  context = res3.data.context;
  history.push({ role: 'user', content: 'What documents are required?' });
  history.push({ role: 'model', content: res3.data.answer });
  console.log('  ✓ PASS: Turn 3 understood water bottle document requirements.\n');

  // Turn 4
  console.log('Turn 4: "How much does it cost?"');
  const res4 = await postApi('/api/search', {
    query: 'How much does it cost?',
    history,
    context
  });
  assert.strictEqual(res4.status, 200);
  console.log('  Engine:', res4.data.engine);
  console.log('  Is Follow-up:', res4.data.isFollowUp);
  console.log('  Resolved Query:', res4.data.resolvedQuery);
  console.log('  Active Entity:', res4.data.context.active_entity);
  console.log('  Answer Snippet:', res4.data.answer.substring(0, 140).replace(/\n/g, ' '));
  assert.strictEqual(res4.data.isFollowUp, true);
  assert.strictEqual(res4.data.context.active_entity, 'water bottle');
  assert.ok(res4.data.resolvedQuery.toLowerCase().includes('water bottle'));
  assert.ok(res4.data.answer.includes('₹') || res4.data.answer.toLowerCase().includes('fee') || res4.data.answer.toLowerCase().includes('cost'));

  context = res4.data.context;
  history.push({ role: 'user', content: 'How much does it cost?' });
  history.push({ role: 'model', content: res4.data.answer });
  console.log('  ✓ PASS: Turn 4 understood water bottle cost and fees.\n');

  // Turn 5: Topic switch to helmets
  console.log('Turn 5: "Now tell me about helmets."');
  const res5 = await postApi('/api/search', {
    query: 'Now tell me about helmets.',
    history,
    context
  });
  assert.strictEqual(res5.status, 200);
  console.log('  Engine:', res5.data.engine);
  console.log('  Is Follow-up:', res5.data.isFollowUp);
  console.log('  Active Entity:', res5.data.context.active_entity);
  console.log('  Active Standard:', res5.data.context.active_standard);
  console.log('  Answer Snippet:', res5.data.answer.substring(0, 140).replace(/\n/g, ' '));
  assert.strictEqual(res5.data.context.active_entity, 'helmet');
  assert.strictEqual(res5.data.context.active_standard, 'IS 4151:2020');
  assert.strictEqual(res5.data.isFollowUp, false);

  context = res5.data.context;
  history.push({ role: 'user', content: 'Now tell me about helmets.' });
  history.push({ role: 'model', content: res5.data.answer });
  console.log('  ✓ PASS: Turn 5 switched context to helmets (IS 4151:2020).\n');

  // Turn 6: Follow-up on new entity (helmet)
  console.log('Turn 6: "Is certification required?" (after helmets)');
  const res6 = await postApi('/api/search', {
    query: 'Is certification required?',
    history,
    context
  });
  assert.strictEqual(res6.status, 200);
  console.log('  Engine:', res6.data.engine);
  console.log('  Is Follow-up:', res6.data.isFollowUp);
  console.log('  Resolved Query:', res6.data.resolvedQuery);
  console.log('  Active Entity:', res6.data.context.active_entity);
  console.log('  Answer Snippet:', res6.data.answer.substring(0, 140).replace(/\n/g, ' '));
  assert.strictEqual(res6.data.isFollowUp, true);
  assert.strictEqual(res6.data.context.active_entity, 'helmet');
  assert.ok(res6.data.resolvedQuery.toLowerCase().includes('helmet'));
  assert.ok(!res6.data.resolvedQuery.toLowerCase().includes('water bottle'));
  assert.ok(res6.data.answer.toLowerCase().includes('helmet') || res6.data.answer.includes('4151'));
  console.log('  ✓ PASS: Turn 6 follow-up refers to helmet, NOT water bottle!\n');

  console.log('==================================================');
  console.log('All End-to-End Dialogue & Memory Tests Passed Perfectly!');
  console.log('==================================================');
}

runEndToEndDialogueTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
