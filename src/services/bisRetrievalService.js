/**
 * BIS Retrieval Service
 * Implements Intent-First Topic-Aware Routing across the complete official BIS ecosystem:
 * 1. Indian Standards (IS numbers, product standards, scopes, amendments, catalogue)
 * 2. Product Compliance & Standards (Dynamic semantic matching for any legitimate product)
 * 3. BIS Certification (Scheme I, process, requirements, audit, timeline)
 * 4. BIS Licence (Grant, CM/L number, renewal, endorsement, verification)
 * 5. ISI Mark (Pyramid mark, IS above, CM/L below, BIS vs ISI distinction)
 * 6. Quality Control Orders (QCO) & Regulatory Mandate (Section 16, Gazette orders)
 * 7. Mandatory vs Voluntary Certification (Independent legal distinction)
 * 8. Compulsory Registration Scheme (CRS) for Electronics & IT goods
 * 9. Hallmarking & HUID (6-digit code, 3 marks, BIS Care App)
 * 10. Testing & Laboratory Network (LRS, Central & Regional Labs, test charges)
 * 11. Applications & Online Services (Manak Online, registration, submission, tracking)
 * 12. Fees & Charges (Application, licence, marking fee, MSME discounts)
 * 13. Consumer Complaints & Grievance Redressal (BIS Care App, e-BIS, CAD, fake mark reporting)
 * 14. BIS Regional & Branch Offices (Jaipur, Delhi, Mumbai, Kolkata, Chennai, etc.)
 * 15. BIS Laboratory Directory & Testing Facilities
 * 16. BIS Schemes & Flagship Programmes (Standards Clubs, Manak Rath, NITS, FMCS)
 * 17. Notices, Circulars, Gazette Updates & Amendments
 * 18. General BIS Overview, FAQ, History & Statutory Mandate
 * 19. Official Documents, Product Manuals, Guidelines & Publications
 * 20. Multimodal Image-Based Verification
 */

const { BIS_STANDARDS_DATABASE } = require('../data/bisStandardsDatabase');
const { BIS_ECOSYSTEM_DATABASE } = require('../data/bisEcosystemDatabase');
const { executeIntelligentRetrievalLoop } = require('./geminiSearchPlannerService');

/**
 * Normalizes query string and classifies user intent dynamically
 */
function analyzeQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return {
      rawQuery: '',
      normalizedQuery: '',
      isNumber: null,
      isBaseNumber: null,
      category: 'empty',
      intent: 'empty',
      languageHint: 'en',
      isGenericStandardQuery: false
    };
  }

  const trimmed = rawQuery.trim();

  // Detect language cues (Hindi / Hinglish / English)
  const hindiRegex = /[\u0900-\u097F]/;
  const hinglishCues = /\b(kya|hai|hain|batao|bhai|kaise|kaha|kahan|iska|uski|isko|iske|anivarye|paani|peene|sona|chandi|shudhata|pramanik|suraksha|kitna|hona|chahiye|shikayat|kare|karte|lena|padega|milega|dastavej|kagaz|kharcha)\b/i;
  
  let languageHint = 'en';
  if (hindiRegex.test(trimmed)) {
    languageHint = 'hi';
  } else if (hinglishCues.test(trimmed)) {
    languageHint = 'hinglish';
  }

  // Detect explicit IS numbers (e.g. "IS 10500", "IS-10500", "IS 4151", "IS 15820:2009", "IS/ISO 9001")
  const isMatch = trimmed.match(/\bIS(?:\/ISO)?\s*[-:]?\s*(\d{2,5})(?:\s*[-:]\s*(\d+))?(?::(\d{4}))?\b/i);
  let isNumber = null;
  let isBaseNumber = null;
  let isPart = null;

  if (isMatch && !/BIS\s+Act\s+2016/i.test(trimmed)) {
    isBaseNumber = isMatch[1];
    isPart = isMatch[2] || null;
    isNumber = isPart ? `${isBaseNumber}-${isPart}` : isBaseNumber;
  }

  const lower = trimmed.toLowerCase();

  // --- INTENT-FIRST DYNAMIC CLASSIFICATION ---
  let category = 'standards';
  let intent = 'STANDARD_LOOKUP';
  let isGenericStandardQuery = false;

  // 1. Generic Standard Identification: "How can I identify the applicable Indian Standard for a product?", "How to find IS standard"
  if (
    /\b(how\s+(can\s+i|to)\s+(identify|find|search|determine|know|locate|get)\s+(the\s+)?(applicable\s+)?(indian\s+standard|is\s+standard|bis\s+standard|standard)\b)/i.test(lower) ||
    /\b(which\s+standard\s+applies\s+to\s+(a|any)\s+product)\b/i.test(lower) ||
    /\b(how\s+to\s+know\s+standard\s+for\s+(a|any)\s+product)\b/i.test(lower) ||
    /\b(kaise\s+(pata\s+kare|jane|dhoondhe)\s+(standard|manak))\b/i.test(lower)
  ) {
    category = 'standards_identification_generic';
    intent = 'how_to_identify';
    isGenericStandardQuery = true;
  }
  // 2. Consumer Complaint / Grievance Redressal / Fake ISI Reporting
  else if (
    /\b(complaint|grievance|shikayat|report\s+fake|fake\s+isi|fake\s+bis|counterfeit|cheated|bad\s+quality|consumer\s+forum|consumer\s+service|consumer\s+helpline|complaints@bis\.gov\.in|complaint\s+kaha|shikayat\s+kaha)\b/i.test(lower)
  ) {
    category = 'consumer_complaints';
    intent = 'COMPLAINT';
  }
  // 3. Hallmarking & HUID (Precious metals)
  else if (
    /\b(huid|hallmark|hallmarking|gold\s+purity|silver\s+purity|sona\s+purity|22k916|24k999|assaying|ahc|gold\s+jewellery\s+mark)\b/i.test(lower) &&
    !isNumber
  ) {
    category = 'hallmarking_huid';
    intent = /huid/i.test(lower) ? 'HUID' : 'HALLMARKING';
  }
  // 4. CRS (Compulsory Registration Scheme for Electronics & IT Goods)
  else if (
    /\b(crs|compulsory\s+registration\s+scheme|crsbis|crs\s+registration|r-number|r\s+number|electronic\s+product\s+under\s+crs)\b/i.test(lower)
  ) {
    category = 'crs_scheme';
    intent = 'CRS';
  }
  // 5. Fees & Charges
  else if (
    /\b(fees?|charges?|cost|pricing|marking\s+fee|application\s+fee|renewal\s+fee|testing\s+fee|hallmarking\s+fee|licence\s+fee|kitna\s+paisa|kharcha)\b/i.test(lower) &&
    !isNumber
  ) {
    category = 'fees_and_charges';
    intent = 'FEES';
  }
  // 6. BIS Offices (Jaipur, Regional Offices, Branch Offices, Contacts)
  else if (
    /\b(bis\s+office|branch\s+office|regional\s+office|zonal\s+office|nearest\s+bis\s+office|office\s+jaipur|office\s+rajasthan|office\s+delhi|office\s+mumbai|office\s+address|office\s+phone|office\s+email|contact\s+bis|bis\s+office\s+kaha)\b/i.test(lower)
  ) {
    category = 'bis_offices';
    intent = 'OFFICE';
  }
  // 7. Testing & Laboratories (Testing facilities, recognized labs, Central lab)
  else if (
    /\b(where\s+can\s+i\s+test|test\s+my\s+product|bis\s+lab|bis\s+laboratory|recognized\s+lab|recognized\s+laboratory|testing\s+requirements|testing\s+facility|lab\s+jaipur|laboratory\s+rajasthan|how\s+does\s+bis\s+testing\s+work|which\s+lab\s+can\s+test)\b/i.test(lower)
  ) {
    category = 'testing_and_laboratories';
    intent = 'LABORATORY';
  }
  // 8. Quality Control Orders (QCO)
  else if (
    /\b(what\s+is\s+(a\s+)?qco|qco\s+kya\s+hai|quality\s+control\s+order|qco\s+meaning|explain\s+qco|mandatory\s+qco|under\s+qco|qco\s+applicable|new\s+qco|latest\s+qco|ye\s+qco\s+me\s+aata\s+hai|qco\s+me\s+aata\s+hai)\b/i.test(lower) &&
    !isNumber
  ) {
    category = 'qco_compliance';
    intent = 'QCO';
  }
  // 9. Mandatory vs Voluntary Certification
  else if (
    /\b(is\s+(bis|isi|certification)\s+(mandatory|compulsory)|do\s+i\s+need\s+bis|can\s+i\s+sell\s+without\s+bis|is\s+this\s+standard\s+voluntary|is\s+it\s+voluntary|anivarye\s+hai\s+kya|zaruri\s+hai\s+kya|bis\s+lena\s+padega\s+kya|bis\s+lena\s+padega|ispe\s+isi\s+compulsory\s+hai|is\s+product\s+ka\s+bis\s+hai|ye\s+bis\s+certified\s+hai)\b/i.test(lower) &&
    !isNumber
  ) {
    category = 'mandatory_vs_voluntary';
    intent = 'MANDATORY_REQUIREMENT';
  }
  // 10. BIS Licence & CM/L Number
  else if (
    /\b(bis\s+licence|bis\s+license|licence\s+kya\s+hota\s+hai|how\s+to\s+apply\s+for\s+bis\s+licence|licence\s+renewal|licence\s+modification|licence\s+status|cml\s+number|cm\/l\s+number|verify\s+(a\s+)?bis\s+licence|grant\s+of\s+licence|licence\s+requirements|licence\s+kaise\s+milega|iska\s+licence\s+kaise\s+milega)\b/i.test(lower) &&
    !isNumber
  ) {
    category = 'bis_licence';
    intent = /renew/i.test(lower) ? 'RENEWAL' : 'LICENCE';
  }
  // 11. ISI Mark (General concept, elements, BIS vs ISI)
  else if (
    /\b(what\s+is\s+(the\s+)?isi\s+mark|isi\s+mark\s+kya\s+hai|isi\s+logo|meaning\s+of\s+isi\s+mark|difference\s+between\s+bis\s+and\s+isi|bis\s+aur\s+isi\s+me\s+kya\s+antar|isi\s+mark\s+kaise\s+milega|can\s+this\s+product\s+use\s+isi)\b/i.test(lower) &&
    !isNumber
  ) {
    category = 'isi_mark';
    intent = 'ISI_MARK';
  }
  // 12. Applications & Online Services / Manak Online
  else if (
    /\b(manak\s*online|how\s+do\s+i\s+apply|where\s+do\s+i\s+apply|how\s+to\s+register|submit\s+bis\s+application|track\s+application|what\s+documents\s+do\s+i\s+need|how\s+to\s+pay|how\s+to\s+renew|how\s+to\s+modify\s+application)\b/i.test(lower) &&
    !isNumber
  ) {
    category = 'online_services';
    intent = 'APPLICATION';
  }
  // 13. General BIS Certification
  else if (
    /\b(what\s+is\s+bis\s+certification|how\s+can\s+i\s+get\s+bis\s+certification|certification\s+process|how\s+long\s+does\s+certification\s+take|what\s+is\s+conformity\s+assessment|product\s+certification)\b/i.test(lower) &&
    !isNumber
  ) {
    category = 'product_certification';
    intent = 'CERTIFICATION';
  }
  // 14. Notices, Circulars, Notifications & Updates
  else if (
    /\b(latest\s+bis\s+notification|latest\s+bis\s+circular|bis\s+notice|new\s+bis\s+update|latest\s+amendment|recent\s+bis\s+notification|circulars?|notifications?|latest\s+bis\s+rule|naya\s+rule)\b/i.test(lower) &&
    !isNumber
  ) {
    category = 'notices_circulars';
    intent = 'NOTICE';
  }
  // 15. BIS Schemes & Programmes (Standards Clubs, Manak Rath, NITS)
  else if (
    /\b(standards?\s+clubs?|manak\s+rath|nits|awareness\s+programme|bis\s+schemes?|special\s+bis\s+initiatives?)\b/i.test(lower)
  ) {
    category = 'bis_departments_schemes';
    intent = 'SCHEME';
  }
  // 16. Documents, Manuals & Official Publications
  else if (
    /\b(product\s+manual|scheme\s+of\s+testing|sti|guidelines\s+for\s+grant|official\s+pdf|standards\s+catalogue|gazette\s+copy)\b/i.test(lower)
  ) {
    category = 'documents_publications';
    intent = 'DOCUMENT';
  }
  // 17. General BIS FAQ / About BIS
  else if (
    /\b(what\s+is\s+bis|what\s+does\s+bis\s+do|when\s+was\s+bis\s+established|role\s+of\s+bis|what\s+services\s+does\s+bis\s+provide|who\s+can\s+apply\s+for\s+bis)\b/i.test(lower) &&
    !isNumber
  ) {
    category = 'general_bis';
    intent = 'GENERAL_BIS_INFORMATION';
  }
  // 18. Specific IS Number Lookup
  else if (isNumber) {
    category = 'standards';
    intent = 'STANDARD_LOOKUP';
    if (/\b(mandatory|compulsory|anivarye|zaruri|fine|legal)\b/i.test(lower)) {
      intent = 'MANDATORY_REQUIREMENT';
    } else if (/\b(limit|permissible|acceptable|parameter|value|clause|matra)\b/i.test(lower)) {
      intent = 'specification_check';
    }
  }
  // 19. Product Standard / Compliance Query (Dynamic - covers ANY product)
  else {
    category = 'standards';
    intent = 'PRODUCT_STANDARD';
  }

  return {
    rawQuery: trimmed,
    normalizedQuery: trimmed.replace(/\s+/g, ' '),
    isNumber,
    isBaseNumber,
    isPart,
    category,
    intent,
    languageHint,
    isGenericStandardQuery
  };
}

/**
 * Searches the authoritative BIS ecosystem and standards databases
 */
async function retrieveBisEvidence(rawQuery, options = {}) {
  const requestId = options.requestId || 'req-' + Date.now();
  const analysis = analyzeQuery(rawQuery);
  const now = new Date().toISOString();

  console.log(`[REQUEST START] requestId: ${requestId} | query: "${analysis.rawQuery}"`);
  console.log(`[CLASSIFICATION] requestId: ${requestId} | category: ${analysis.category} | intent: ${analysis.intent} | lang: ${analysis.languageHint}`);

  if (!analysis.normalizedQuery) {
    return {
      query: rawQuery,
      requestId,
      analysis,
      results: [],
      evidenceText: 'No query provided.',
      sourceCategory: 'empty',
      isAmbiguous: false,
      retrievedAt: now
    };
  }

  // Execute Agentic Gemini Search Planner & Retrieval Feedback Loop across complete ecosystem
  return await executeIntelligentRetrievalLoop(rawQuery, {
    ...options,
    requestId,
    analysis
  });
}

module.exports = {
  analyzeQuery,
  retrieveBisEvidence
};
