/**
 * Test Suite for Markdown Rendering, Streaming, and Typography
 * Tests Requirement 13 of User Specification
 */

const { marked } = require('marked');
const { generateAnswer, generateAnswerStream } = require('../src/services/geminiService');
const { retrieveBisEvidence } = require('../src/services/bisRetrievalService');

// Setup same marked renderer as client
const renderer = new marked.Renderer();
renderer.link = function({ href, title, text }) {
  const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
  const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}"${targetAttr}${titleAttr} class="text-[#0D3B66] underline">${text}</a>`;
};
renderer.code = function({ text, lang }) {
  return `<div class="ai-code-wrapper"><pre><code>${text}</code></pre></div>`;
};
marked.use({ renderer, gfm: true, breaks: true });

function renderMarkdown(rawText) {
  if (!rawText) return '';
  let prepared = rawText
    .replace(/^(\*{0,2}|#{1,6}\s*)Answer:?\*{0,2}\s*$/gmi, '### Answer')
    .replace(/^(\*{0,2}|#{1,6}\s*)Key points:?\*{0,2}\s*$/gmi, '### Key points')
    .replace(/^(\*{0,2}|#{1,6}\s*)Source:?\*{0,2}\s*$/gmi, '### Source');
  let html = marked.parse(prepared);
  html = html.replace(/<table(\s|>)/gi, '<div class="overflow-x-auto my-3 border border-slate-200 rounded-lg shadow-2xs bg-white"><table class="w-full text-xs text-left border-collapse"$1').replace(/<\/table>/gi, '</table></div>');
  return html;
}

function runMarkdownTests() {
  console.log('==================================================');
  console.log('Running Markdown & Typography Test Suite (Req 13)');
  console.log('==================================================\n');

  // Test 1: Normal Paragraph
  const t1 = renderMarkdown('Bureau of Indian Standards is the national standards body of India.');
  console.log('Test 1: Normal Paragraph');
  console.log('  Rendered:', t1.trim());
  if (t1.includes('<p>') && t1.includes('Bureau of Indian Standards')) {
    console.log('  ✓ PASS: Normal paragraph wrapped in HTML <p>\n');
  } else {
    console.error('  ✗ FAIL: Normal paragraph\n');
  }

  // Test 2: Bold Text
  const t2 = renderMarkdown('**Important:** BIS is an organization.');
  console.log('Test 2: Bold Text');
  console.log('  Rendered:', t2.trim());
  if (t2.includes('<strong>Important:</strong>') && !t2.includes('**')) {
    console.log('  ✓ PASS: Bold text rendered as <strong> and raw ** removed completely\n');
  } else {
    console.error('  ✗ FAIL: Raw ** appeared\n');
  }

  // Test 3: Italic Text
  const t3 = renderMarkdown('Drinking water must be *safe and wholesome*.');
  console.log('Test 3: Italic Text');
  console.log('  Rendered:', t3.trim());
  if (t3.includes('<em>safe and wholesome</em>') && !t3.includes('*safe')) {
    console.log('  ✓ PASS: Italic text rendered as <em> and raw * removed\n');
  } else {
    console.error('  ✗ FAIL: Raw * appeared\n');
  }

  // Test 4: Headings
  const t4 = renderMarkdown('### Key Requirements for Water Quality');
  console.log('Test 4: Headings');
  console.log('  Rendered:', t4.trim());
  if (t4.includes('<h3>Key Requirements for Water Quality</h3>') && !t4.includes('###')) {
    console.log('  ✓ PASS: Headings rendered as <h3> and raw ### removed\n');
  } else {
    console.error('  ✗ FAIL: Raw ### appeared\n');
  }

  // Test 5: Bullet Points
  const t5 = renderMarkdown('* Permissible TDS limit is 2000 mg/L\n* pH value should be between 6.5 and 8.5');
  console.log('Test 5: Bullet Points');
  console.log('  Rendered:', t5.trim());
  if (t5.includes('<ul>') && t5.includes('<li>') && !t5.includes('* Permissible')) {
    console.log('  ✓ PASS: Bullet points rendered as <ul><li> and raw * removed\n');
  } else {
    console.error('  ✗ FAIL: Raw bullet symbol appeared\n');
  }

  // Test 6: Numbered Lists
  const t6 = renderMarkdown('1. Locate the ISI mark on the product.\n2. Note down the CM/L number below the mark.\n3. Verify on BIS Care App.');
  console.log('Test 6: Numbered Lists');
  console.log('  Rendered:', t6.trim());
  if (t6.includes('<ol>') && t6.includes('<li>Locate the ISI mark')) {
    console.log('  ✓ PASS: Numbered lists rendered as <ol><li>\n');
  } else {
    console.error('  ✗ FAIL: Numbered list failed\n');
  }

  // Test 7: Code Blocks & Inline Code
  const t7 = renderMarkdown('Use `IS 10500` for testing.\n```js\nconst status = "Active";\n```');
  console.log('Test 7: Code Blocks');
  console.log('  Rendered:', t7.trim());
  if (t7.includes('<code>IS 10500</code>') && t7.includes('ai-code-wrapper') && !t7.includes('```')) {
    console.log('  ✓ PASS: Inline code and fenced code block rendered with wrapper and no raw backticks\n');
  } else {
    console.error('  ✗ FAIL: Raw backticks appeared\n');
  }

  // Test 8: Links
  const t8 = renderMarkdown('Visit the [Official BIS Portal](https://standards.bis.gov.in/) for gazette copies.');
  console.log('Test 8: Links');
  console.log('  Rendered:', t8.trim());
  if (t8.includes('<a href="https://standards.bis.gov.in/" target="_blank"') && t8.includes('Official BIS Portal</a>')) {
    console.log('  ✓ PASS: Markdown links rendered with safe target and styling\n');
  } else {
    console.error('  ✗ FAIL: Link rendering failed\n');
  }

  // Test 9: Tables
  const t9 = renderMarkdown('| Characteristic | Acceptable Limit | Permissible Limit |\n| --- | --- | --- |\n| TDS | 500 mg/l | 2000 mg/l |');
  console.log('Test 9: Tables');
  console.log('  Rendered:', t9.trim());
  if (t9.includes('<table') && t9.includes('<th>Characteristic</th>') && t9.includes('<td>TDS</td>')) {
    console.log('  ✓ PASS: Tables rendered cleanly in responsive wrapper\n');
  } else {
    console.error('  ✗ FAIL: Table rendering failed\n');
  }

  // Test 10: Hindi + English Mixed Text
  const t10 = renderMarkdown('**IS 10500:2012** पीने के पानी (Drinking Water) का आधिकारिक मानक है। इसके तहत **TDS** की स्वीकार्य सीमा `500 mg/L` है।');
  console.log('Test 10: Hindi + English Mixed Text');
  console.log('  Rendered:', t10.trim());
  if (t10.includes('<strong>IS 10500:2012</strong>') && t10.includes('पीने के पानी') && t10.includes('<code>500 mg/L</code>')) {
    console.log('  ✓ PASS: Multilingual Hindi + English rendered cleanly with bold and inline code\n');
  } else {
    console.error('  ✗ FAIL: Multilingual text failed\n');
  }

  // Test 11: Specific Complex Key Points Markdown (User Prompt Requirement 15)
  const userSnippet = [
    '**Key points:**',
    '',
    '- **Applicable Standards:**',
    '- **IS 14543:2016:** *Packaged Drinking Water (Other than Packaged Natural Mineral Water) — Specification*',
    '- **IS 13428:2005:** *Packaged Natural Mineral Water — Specification*',
    '- **Safety & Microbiological Criteria:** Under IS 14543, water must meet strict microbiological limits.',
    '- **Mandatory Certification:** Certification is strictly mandatory.'
  ].join('\n');

  console.log('Test 11: Specific Complex Key Points Markdown (User Req 15)');
  const t11 = renderMarkdown(userSnippet);
  console.log('  Rendered preview:\n' + t11.trim());

  const hasH3 = t11.includes('<h3>Key points</h3>');
  const hasUl = t11.includes('<ul>') && t11.includes('<li>');
  const hasStrong = t11.includes('<strong>IS 14543:2016:</strong>');
  const hasEm = t11.includes('<em>Packaged Drinking Water');
  const noRawAsterisks = !t11.includes('**') && !t11.includes('*Packaged');

  if (hasH3 && hasUl && hasStrong && hasEm && noRawAsterisks) {
    console.log('  ✓ PASS: Key points, bullets, bold, and italics all rendered without raw * or ** symbols!\n');
  } else {
    console.error('  ✗ FAIL: User snippet failed rendering\n');
  }
}

async function testStreamingIntegration() {
  console.log('==================================================');
  console.log('Testing Real Stream Generation');
  console.log('==================================================\n');

  const evidence = await retrieveBisEvidence('IS 10500');
  let chunkCount = 0;
  let fullStreamText = '';

  for await (const { chunk, engine } of generateAnswerStream('What is IS 10500?', evidence)) {
    chunkCount++;
    fullStreamText += chunk;
  }

  console.log('Stream completed.');
  console.log('  Total Chunks Received:', chunkCount);
  console.log('  Full Stream Length:', fullStreamText.length);
  console.log('  Has Answer Header:', fullStreamText.includes('Answer:'));
  console.log('  Has Key Points:', fullStreamText.includes('Key points:'));
  console.log('  Has Source:', fullStreamText.includes('Source:'));

  const html = renderMarkdown(fullStreamText);
  console.log('  Rendered HTML Length:', html.length);
  console.log('  Contains <h3>:', html.includes('<h3>'));
  console.log('  Contains <li> or <p>:', html.includes('<li>') || html.includes('<p>'));
  console.log('  Contains <strong>:', html.includes('<strong>'));
  console.log('  No unrendered **:', !html.includes('**'));

  if (chunkCount > 0 && !html.includes('**')) {
    console.log('\n  ✓ PASS: Stream chunks generated and parsed cleanly into HTML without raw markdown symbols!\n');
  } else {
    console.error('\n  ✗ FAIL: Stream generation issue\n');
  }
}

async function main() {
  runMarkdownTests();
  await testStreamingIntegration();
}

main().catch(console.error);
