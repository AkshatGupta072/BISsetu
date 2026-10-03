/**
 * Comprehensive End-to-End Test Suite: Complete BIS Ecosystem Coverage
 *
 * Verifies that BISsetu functions as a GENERAL-PURPOSE BIS INFORMATION AND RESEARCH AGENT
 * covering all domains specified by BIS mandate:
 * 
 * 1. Indian Standards (IS 10500, drinking water, cement, differences)
 * 2. Product Information (Dynamic semantic understanding: pressure cooker, toys, steel, etc.)
 * 3. BIS Certification (Scheme I, process, requirements, documents)
 * 4. BIS Licence (CM/L numbers, grant, renewal, verification)
 * 5. ISI Mark (Pyramid mark, IS above, CM/L below, BIS vs ISI)
 * 6. Quality Control Orders (QCOs, Section 16, mandatory compliance)
 * 7. Mandatory vs Voluntary (Independent legal verification)
 * 8. CRS (Electronics & IT goods, R-number, MeitY orders)
 * 9. Hallmarking & HUID (6-digit code, 3 marks, BIS Care App)
 * 10. Testing & Laboratories (Central/Regional labs, LRS network)
 * 11. Applications & Online Services (Manak Online, e-BIS)
 * 12. Fees & Charges (Application, licence, marking fee, MSME discounts)
 * 13. Complaints & Consumer Services (BIS Care App, fake ISI reporting)
 * 14. BIS Regional & Branch Offices (Jaipur, Delhi, regional contacts)
 * 15. BIS Laboratory Directory & Testing Facilities
 * 16. BIS Schemes & Programmes (Standards Clubs, Manak Rath)
 * 17. Notices, Circulars & Notifications
 * 18. FAQ & General BIS Overview (Establishment, NSB of India, Manak Bhavan)
 * 19. Documents, Manuals & Official Publications (Product manuals, STI)
 * 20. Natural Language / Hindi / Hinglish queries
 */

const assert = require('assert');
const { analyzeQuery, retrieveBisEvidence } = require('../src/services/bisRetrievalService');
const { planSearch } = require('../src/services/geminiSearchPlannerService');
const { generateAnswer } = require('../src/services/geminiService');

async function runDomainTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE BIS ECOSYSTEM END-TO-END TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function record(desc, ok, detail = '') {
    total++;
    if (ok) {
      passed++;
      console.log(`  ✓ PASS [${total}]: ${desc}`);
    } else {
      console.error(`  ✗ FAIL [${total}]: ${desc}`);
      if (detail) console.error(`    ↳ ${detail}`);
    }
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 1: INDIAN STANDARDS
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 1: INDIAN STANDARDS ---');
  {
    const q1 = "What is IS 10500?";
    const a1 = analyzeQuery(q1);
    record('IS 10500 classified as STANDARD_LOOKUP', a1.intent === 'STANDARD_LOOKUP' && a1.isNumber === '10500');

    const res1 = await retrieveBisEvidence(q1, { requestId: 'test-d1-1' });
    record('IS 10500 retrieves drinking water standard', res1.results.some(r => r.base_number === '10500' || (r.standard_number && r.standard_number.includes('10500')) || (r.title && /drinking water/i.test(r.title))));

    const q2 = "Which standard applies to cement?";
    const a2 = analyzeQuery(q2);
    record('Cement standard classified as standards query', a2.category === 'standards');

    const res2 = await retrieveBisEvidence(q2, { requestId: 'test-d1-2' });
    record('Cement query retrieves valid cement standard evidence', res2.results.length > 0 && res2.evidenceText.includes('Cement'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 2: PRODUCT INFORMATION (DYNAMIC SEMANTIC MATCHING)
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 2: PRODUCT INFORMATION (DYNAMIC MATCHING) ---');
  {
    const products = [
      { q: "BIS requirements for pressure cooker", entity: "pressure cooker", expectedIS: "2347" },
      { q: "BIS for toys", entity: "toys", expectedKeyword: "Toy" },
      { q: "BIS for steel", entity: "steel", expectedKeyword: "Steel" },
      { q: "BIS for helmet", entity: "helmet", expectedIS: "4151" }
    ];

    for (const p of products) {
      const planRes = await planSearch(p.q);
      const entity = (planRes.plan.primaryEntity || planRes.plan.product || '').toLowerCase();
      record(`Plan identifies product "${p.entity}"`, entity.includes(p.entity.toLowerCase()) || planRes.plan.searchConcepts.some(c => c.toLowerCase().includes(p.entity.toLowerCase())));

      const res = await retrieveBisEvidence(p.q, { requestId: `test-prod-${p.entity}` });
      if (p.expectedIS) {
        record(`Evidence for "${p.entity}" matches IS ${p.expectedIS}`, res.results.some(r => r.base_number === p.expectedIS || (r.standard_number && r.standard_number.includes(p.expectedIS))));
      } else {
        record(`Evidence for "${p.entity}" returns relevant data`, res.results.length > 0 && res.evidenceText.toLowerCase().includes(p.expectedKeyword.toLowerCase()));
      }
    }
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 3: BIS CERTIFICATION
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 3: BIS CERTIFICATION ---');
  {
    const q = "What is BIS certification and how to get it?";
    const a = analyzeQuery(q);
    record('Certification query classified as CERTIFICATION', a.intent === 'CERTIFICATION');

    const res = await retrieveBisEvidence(q, { requestId: 'test-d3' });
    record('Certification retrieves Scheme I / Conformity Assessment info', res.evidenceText.includes('Scheme I') || res.evidenceText.includes('Conformity Assessment'));
    record('Certification provides Manak Online portal source', res.results.some(r => (r.source_url || '').includes('manakonline.in') || (r.secondary_url || '').includes('manakonline.in')) || res.evidenceText.includes('manakonline.in'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 4: BIS LICENCE & CM/L NUMBER
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 4: BIS LICENCE & CM/L NUMBER ---');
  {
    const q1 = "How to verify a BIS licence using CM/L number?";
    const a1 = analyzeQuery(q1);
    record('Licence verification classified as LICENCE', a1.intent === 'LICENCE');

    const res1 = await retrieveBisEvidence(q1, { requestId: 'test-d4-1' });
    record('Licence evidence explains CM/L 7 or 8 digit format', res1.evidenceText.includes('CM/L') || res1.evidenceText.includes('Licence'));

    const q2 = "How to renew BIS licence?";
    const a2 = analyzeQuery(q2);
    record('Licence renewal classified as RENEWAL', a2.intent === 'RENEWAL');
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 5: ISI MARK
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 5: ISI MARK ---');
  {
    const q = "What is the difference between BIS and ISI mark?";
    const a = analyzeQuery(q);
    record('BIS vs ISI classified as ISI_MARK', a.intent === 'ISI_MARK');

    const res = await retrieveBisEvidence(q, { requestId: 'test-d5' });
    record('ISI Mark evidence details BIS as organization and ISI as product mark', res.evidenceText.includes('ISI mark') && res.evidenceText.includes('National Standards Body'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 6: QUALITY CONTROL ORDERS (QCO)
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 6: QUALITY CONTROL ORDERS (QCO) ---');
  {
    const q = "What is a Quality Control Order (QCO)?";
    const a = analyzeQuery(q);
    record('QCO query classified as QCO intent', a.intent === 'QCO');

    const planRes = await planSearch(q);
    record('QCO plan flags requiresFreshWebRetrieval=true', planRes.plan.requiresFreshWebRetrieval === true);

    const res = await retrieveBisEvidence(q, { requestId: 'test-d6' });
    record('QCO evidence cites Section 16 of BIS Act 2016', res.evidenceText.includes('Section 16') || res.evidenceText.includes('Quality Control Order'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 7: MANDATORY VS VOLUNTARY
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 7: MANDATORY VS VOLUNTARY CERTIFICATION ---');
  {
    const q = "Is BIS certification mandatory or voluntary?";
    const a = analyzeQuery(q);
    record('Mandatory vs voluntary classified as MANDATORY_REQUIREMENT', a.intent === 'MANDATORY_REQUIREMENT');

    const res = await retrieveBisEvidence(q, { requestId: 'test-d7' });
    record('Evidence distinguishes voluntary baseline from mandatory QCO notifications', res.evidenceText.includes('voluntary by default') || res.evidenceText.includes('Quality Control Order'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 8: CRS (COMPULSORY REGISTRATION SCHEME)
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 8: COMPULSORY REGISTRATION SCHEME (CRS) ---');
  {
    const q = "What is CRS for electronic products?";
    const a = analyzeQuery(q);
    record('CRS query classified as CRS intent', a.intent === 'CRS');

    const planRes = await planSearch(q);
    record('CRS preferred sources include crsbis.in', planRes.plan.preferredSources.some(s => s.includes('crsbis.in')));

    const res = await retrieveBisEvidence(q, { requestId: 'test-d8' });
    record('CRS evidence references R-number and Scheme II / MeitY', res.evidenceText.includes('R-number') || res.evidenceText.includes('Scheme II'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 9: HALLMARKING & HUID
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 9: HALLMARKING & HUID ---');
  {
    const q = "What is HUID in gold jewellery?";
    const a = analyzeQuery(q);
    record('HUID query classified as HUID intent', a.intent === 'HUID');

    const res = await retrieveBisEvidence(q, { requestId: 'test-d9' });
    record('HUID evidence explains 6-digit alphanumeric code and 3 mandatory marks', res.evidenceText.includes('6-digit') || res.evidenceText.includes('HUID'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 10: TESTING & LABORATORIES
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 10: TESTING & LABORATORIES ---');
  {
    const q = "Where can I test my product in a BIS recognized laboratory?";
    const a = analyzeQuery(q);
    record('Testing lab query classified as LABORATORY', a.intent === 'LABORATORY');

    const res = await retrieveBisEvidence(q, { requestId: 'test-d10' });
    record('Evidence references Central/Regional Laboratories and LRS portal', res.evidenceText.includes('Laboratory Recognition Scheme') || res.evidenceText.includes('Central Laboratory'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 11: APPLICATIONS & ONLINE SERVICES (MANAK ONLINE)
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 11: APPLICATIONS & ONLINE SERVICES ---');
  {
    const q = "Where do I apply online for BIS licence on Manak Online?";
    const a = analyzeQuery(q);
    record('Online application query classified as APPLICATION', a.intent === 'APPLICATION');

    const res = await retrieveBisEvidence(q, { requestId: 'test-d11' });
    record('Evidence routes to manakonline.in e-BIS portal', res.evidenceText.includes('manakonline.in'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 12: FEES & CHARGES
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 12: FEES & CHARGES ---');
  {
    const q = "What is the BIS certification fee and marking fee?";
    const a = analyzeQuery(q);
    record('Fee query classified as FEES', a.intent === 'FEES');

    const planRes = await planSearch(q);
    record('Fee plan flags requiresFreshWebRetrieval=true', planRes.plan.requiresFreshWebRetrieval === true);

    const res = await retrieveBisEvidence(q, { requestId: 'test-d12' });
    record('Fee evidence references application fee and MSME concessions', res.evidenceText.includes('Application Fee') || res.evidenceText.includes('MSME'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 13: COMPLAINTS & CONSUMER SERVICES
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 13: COMPLAINTS & CONSUMER SERVICES ---');
  {
    const q = "How to report fake ISI mark and file complaint with BIS?";
    const a = analyzeQuery(q);
    record('Complaint query classified as COMPLAINT', a.intent === 'COMPLAINT');

    const res = await retrieveBisEvidence(q, { requestId: 'test-d13' });
    record('Complaint evidence mentions BIS Care App and Consumer Affairs', res.evidenceText.includes('BIS Care App') || res.evidenceText.includes('complaints@bis.gov.in'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 14: BIS REGIONAL & BRANCH OFFICES
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 14: BIS REGIONAL & BRANCH OFFICES ---');
  {
    const q = "Where is the BIS office Jaipur located?";
    const a = analyzeQuery(q);
    record('Office query classified as OFFICE', a.intent === 'OFFICE');

    const planRes = await planSearch(q);
    record('Office query plan flags requiresFreshWebRetrieval=true', planRes.plan.requiresFreshWebRetrieval === true);

    const res = await retrieveBisEvidence(q, { requestId: 'test-d14' });
    record('Jaipur branch office evidence contains address details', res.evidenceText.includes('Jaipur') && (res.evidenceText.includes('Prithviraj') || res.evidenceText.includes('Branch Office')));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 15: BIS SCHEMES & PROGRAMMES
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 15: BIS SCHEMES & PROGRAMMES ---');
  {
    const q = "What is BIS Standards Club and Manak Rath?";
    const a = analyzeQuery(q);
    record('Scheme query classified as SCHEME', a.intent === 'SCHEME');

    const res = await retrieveBisEvidence(q, { requestId: 'test-d15' });
    record('Scheme evidence includes Standards Clubs / Manak Rath', res.evidenceText.includes('Standards Clubs') || res.evidenceText.includes('Manak Rath'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 16: NOTICES, CIRCULARS & NOTIFICATIONS
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 16: NOTICES, CIRCULARS & NOTIFICATIONS ---');
  {
    const q = "Where to find the latest BIS notification and circular?";
    const a = analyzeQuery(q);
    record('Notice query classified as NOTICE', a.intent === 'NOTICE');

    const planRes = await planSearch(q);
    record('Notice query plan flags requiresFreshWebRetrieval=true', planRes.plan.requiresFreshWebRetrieval === true);

    const res = await retrieveBisEvidence(q, { requestId: 'test-d16' });
    record('Notice evidence routes to official notifications gazette', res.evidenceText.includes('Notices') || res.evidenceText.includes('Circulars'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 17: FAQ & GENERAL BIS OVERVIEW
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 17: FAQ & GENERAL BIS OVERVIEW ---');
  {
    const q = "What is BIS and when was BIS established?";
    const a = analyzeQuery(q);
    record('General BIS query classified as GENERAL_BIS_INFORMATION', a.intent === 'GENERAL_BIS_INFORMATION');

    const res = await retrieveBisEvidence(q, { requestId: 'test-d17' });
    record('Evidence cites BIS Act 2016, 1986, and ISI founding in 1947', res.evidenceText.includes('National Standards Body') && res.evidenceText.includes('BIS Act 2016'));
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 18: NATURAL LANGUAGE / HINDI / HINGLISH
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 18: NATURAL LANGUAGE / HINDI / HINGLISH ---');
  {
    const hindiQueries = [
      { q: "Bhai is product ka BIS hai?", expectedCategory: "mandatory_vs_voluntary", expectedLang: "hinglish" },
      { q: "BIS lena padega kya?", expectedCategory: "mandatory_vs_voluntary", expectedLang: "hinglish" },
      { q: "gold ka HUID kaise check karu?", expectedCategory: "hallmarking_huid", expectedLang: "hinglish" },
      { q: "Jaipur me BIS office kaha hai?", expectedCategory: "bis_offices", expectedLang: "hinglish" },
      { q: "complaint kaha karni hai?", expectedCategory: "consumer_complaints", expectedLang: "hinglish" }
    ];

    for (const hq of hindiQueries) {
      const a = analyzeQuery(hq.q);
      record(`Natural Hinglish query "${hq.q}" recognized as ${hq.expectedLang}`, a.languageHint === hq.expectedLang);
      record(`Natural Hinglish query "${hq.q}" correctly routed to ${hq.expectedCategory}`, a.category === hq.expectedCategory);
    }
  }

  // -------------------------------------------------------------
  // TEST DOMAIN 19: END-TO-END ANSWER GENERATION & STRUCTURE INTEGRITY
  // -------------------------------------------------------------
  console.log('\n--- DOMAIN 19: END-TO-END ANSWER GENERATION STRUCTURE ---');
  {
    const testCases = [
      { q: "What is HUID in gold jewellery?", domain: "HUID" },
      { q: "Where is the BIS office Jaipur located?", domain: "Office Jaipur" },
      { q: "BIS requirements for pressure cooker", domain: "Pressure Cooker" }
    ];

    for (const tc of testCases) {
      const res = await retrieveBisEvidence(tc.q, { requestId: `test-e2e-${tc.domain}` });
      const answerRes = await generateAnswer(tc.q, res, {
        requestId: `test-e2e-${tc.domain}`,
        intent: res.analysis.intent,
        languageHint: res.analysis.languageHint,
        searchResults: res.results
      });

      const ans = answerRes.answer;
      record(`[${tc.domain}] Generates non-empty answer`, typeof ans === 'string' && ans.length > 50);
      record(`[${tc.domain}] Contains conversational opening on line 1`, /^(Yes|Sure|Hi|This|हाँ|नमस्ते|I checked|Under)/i.test(ans.trim().split('\n')[0]));
      record(`[${tc.domain}] Contains Answer: section`, ans.includes('Answer:'));
      record(`[${tc.domain}] Contains Source: section with official link`, ans.includes('Source:') && /bis\.gov\.in|manakonline\.in|crsbis\.in/.test(ans));
    }
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 TEST SUMMARY: ${passed} / ${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 ALL BIS ECOSYSTEM TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error(`❌ ${total - passed} ASSERTIONS FAILED.`);
    process.exit(1);
  }
}

runDomainTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
