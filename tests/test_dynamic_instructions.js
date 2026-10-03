/**
 * Automated Verification: Dynamic AI Instruction File Loading
 * Tests that editing AI_INSTRUCTIONS.md is immediately and automatically followed by the AI service.
 */

const fs = require('fs');
const path = require('path');
const geminiService = require('../src/services/geminiService');

const instructionsPath = path.join(__dirname, '../instruction.md');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function run() {
  console.log('==================================================');
  console.log('Testing Dynamic AI Instructions File System');
  console.log('==================================================\n');

  // Test 1: Baseline reading from AI_INSTRUCTIONS.md
  console.log('Test 1: Read initial AI_INSTRUCTIONS.md');
  const initial = geminiService.getSystemInstruction();
  assert(initial.includes('BISsetu') || initial.includes('Manak Sathi'), 'Reads BISsetu persona from AI_INSTRUCTIONS.md');
  assert(initial.toLowerCase().includes('primary source of truth'), 'Reads primary source of truth section');
  assert(initial.includes('ANTI-HALLUCINATION RULE'), 'Reads anti-hallucination rules');
  console.log();

  // Test 2: Dynamic hot-reloading when user edits the file
  console.log('Test 2: Dynamic Live Update on Manual Edit');
  const originalFileContent = fs.readFileSync(instructionsPath, 'utf8');
  const customTestRule = '\n\n## Custom Test Directive\nAlways end answers with a special test verification marker: [TEST-HOT-RELOAD-VERIFIED].';

  try {
    // Simulate user editing the file manually
    fs.writeFileSync(instructionsPath, originalFileContent + customTestRule, 'utf8');

    const updated = geminiService.getSystemInstruction();
    assert(updated.includes('[TEST-HOT-RELOAD-VERIFIED]'), 'getSystemInstruction() instantly detects manual edits without server restart');
    assert(geminiService.SYSTEM_INSTRUCTION.includes('[TEST-HOT-RELOAD-VERIFIED]'), 'Getter geminiService.SYSTEM_INSTRUCTION reflects latest file changes dynamically');
  } finally {
    // Revert file back to original pristine state
    fs.writeFileSync(instructionsPath, originalFileContent, 'utf8');
  }
  console.log();

  // Test 3: Verifying file reverted cleanly
  console.log('Test 3: Reversion to Original State');
  const reverted = geminiService.getSystemInstruction();
  assert(!reverted.includes('[TEST-HOT-RELOAD-VERIFIED]'), 'Dynamic loader reflects reversion cleanly');
  assert(reverted.includes('BISsetu') || reverted.includes('Manak Sathi'), 'Pristine instructions intact');
  console.log();

  console.log('==================================================');
  console.log(`Results: ${passed} / ${total} passed`);
  console.log('==================================================');

  process.exit(passed === total ? 0 : 1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
