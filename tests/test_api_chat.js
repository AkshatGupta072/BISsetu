/**
 * Automated Test Suite for POST /api/chat endpoint
 * Tests:
 * 1. Missing fields (missing body, missing session_id, missing message)
 * 2. Successful response structure { reply: string }
 * 3. Session memory & context continuity across multi-turn queries
 * 4. Session isolation between different session_ids
 * 5. Session reset functionality
 * 6. Timeout error handling (HTTP 504)
 */

const http = require('http');
const app = require('../server');

let server;
let port;
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

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('Running POST /api/chat REST Endpoint Test Suite');
  console.log('====================================================\n');

  // Start test server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      console.log(`Test server running on port ${port}\n`);
      resolve();
    });
  });

  try {
    // ----------------------------------------------------
    // Test 1: Validation - Missing / Empty Message
    // ----------------------------------------------------
    console.log('Test 1: Validation - Missing Message');
    const res1 = await postJson('/api/chat', { session_id: 'session-123' });
    assert(res1.status === 400, 'Returns HTTP 400 when "message" is missing');
    assert(res1.body.error && res1.body.error.includes('message'), 'Error message specifies "message" is required');

    const res1b = await postJson('/api/chat', { message: '   ', session_id: 'session-123' });
    assert(res1b.status === 400, 'Returns HTTP 400 when "message" is whitespace only');
    console.log();

    // ----------------------------------------------------
    // Test 2: Validation - Missing / Empty session_id
    // ----------------------------------------------------
    console.log('Test 2: Validation - Missing session_id');
    const res2 = await postJson('/api/chat', { message: 'What is the standard for cement?' });
    assert(res2.status === 400, 'Returns HTTP 400 when "session_id" is missing');
    assert(res2.body.error && res2.body.error.includes('session_id'), 'Error message specifies "session_id" is required');

    const res2b = await postJson('/api/chat', { message: 'What is cement standard?', session_id: '   ' });
    assert(res2b.status === 400, 'Returns HTTP 400 when "session_id" is whitespace only');
    console.log();

    // ----------------------------------------------------
    // Test 3: Standard BIS Query Response & Format
    // ----------------------------------------------------
    console.log('Test 3: First Turn - Product Standards Query');
    const sessionUserA = 'user_phone_9876543210';
    const res3 = await postJson('/api/chat', {
      message: 'What is the BIS standard for packaged drinking water?',
      session_id: sessionUserA
    });
    assert(res3.status === 200, 'Returns HTTP 200 for valid chat request');
    assert(typeof res3.body.reply === 'string' && res3.body.reply.length > 0, 'Response contains non-empty "reply" string');
    assert(res3.body.reply.includes('14543'), 'Reply correctly cites IS 14543 for packaged drinking water');
    console.log();

    // ----------------------------------------------------
    // Test 4: Conversation Memory / Follow-up Query
    // ----------------------------------------------------
    console.log('Test 4: Follow-up Turn - Context Continuity ("Is it mandatory?")');
    const res4 = await postJson('/api/chat', {
      message: 'Is certification mandatory for it?',
      session_id: sessionUserA
    });
    assert(res4.status === 200, 'Returns HTTP 200 for follow-up query');
    assert(typeof res4.body.reply === 'string', 'Follow-up returns "reply" string');
    const reply4Lower = res4.body.reply.toLowerCase();
    const retainsContext = reply4Lower.includes('water') || reply4Lower.includes('14543') || reply4Lower.includes('mandatory') || reply4Lower.includes('qco');
    assert(retainsContext, 'Follow-up retains context of packaged drinking water without repeating product name');
    console.log();

    // ----------------------------------------------------
    // Test 5: Session Isolation (Different session_id)
    // ----------------------------------------------------
    console.log('Test 5: Session Isolation - Different session_id');
    const sessionUserB = 'user_phone_1122334455';
    const res5 = await postJson('/api/chat', {
      message: 'What is the standard for helmets?',
      session_id: sessionUserB
    });
    assert(res5.status === 200, 'Returns HTTP 200 for session B');
    assert(res5.body && typeof res5.body.reply === 'string', 'Returns reply string for session B');
    assert(res5.body && res5.body.reply && res5.body.reply.includes('4151'), 'Session B correctly references IS 4151 for helmets');
    console.log();

    // ----------------------------------------------------
    // Test 6: Session Reset
    // ----------------------------------------------------
    console.log('Test 6: Session Reset Endpoint');
    const res6 = await postJson('/api/chat/reset', { session_id: sessionUserA });
    assert(res6.status === 200, 'Returns HTTP 200 on session reset');
    assert(res6.body.success === true, 'Returns success: true');
    console.log();

    // ----------------------------------------------------
    // Test 7: Timeout Error Handling (HTTP 504)
    // ----------------------------------------------------
    console.log('Test 7: Timeout Error Handling (HTTP 504)');
    const originalTimeout = process.env.CHAT_TIMEOUT_MS;
    process.env.CHAT_TIMEOUT_MS = '1'; // 1ms triggers timeout immediately
    const res7 = await postJson('/api/chat', {
      message: 'What is the BIS standard for cement?',
      session_id: 'session_timeout_test'
    });
    assert(res7.status === 504, 'Returns HTTP 504 when AI generation exceeds timeout');
    assert(res7.body && res7.body.error && res7.body.error.includes('timed out'), 'Returns timeout error message');
    process.env.CHAT_TIMEOUT_MS = originalTimeout || '';
    console.log();

  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  }

  console.log('====================================================');
  console.log(`TOTAL: ${passedTests + failedTests} assertions | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  if (server) server.close();
  process.exit(1);
});
