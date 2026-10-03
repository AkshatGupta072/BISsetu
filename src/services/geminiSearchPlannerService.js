/**
 * Gemini Search Planner & Agentic Retrieval Loop Service
 * 
 * Implements the Complete BIS Ecosystem Agentic Intelligence Architecture:
 * USER QUERY (English, Hindi, Hinglish, informal slang, product, or institutional)
 * → GEMINI UNDERSTANDS MEANING (Role A: Dynamic Intent, Entity, Domain, Legal Status)
 * → GEMINI CREATES STRUCTURED SEARCH PLAN (Multiple targeted search candidates across official BIS sources)
 * → MULTIPLE BIS SEARCHES (Local BIS repository + Official BIS Web portals: standards.bis.gov.in, manakonline.in, bis.gov.in, crsbis.in)
 * → RESULTS RETURN
 * → GEMINI ANALYZES RESULTS (Semantic evaluation: filter out spurious matches, discover formal BIS terms)
 * → GEMINI DECIDES WHETHER MORE SEARCH IS REQUIRED (Feedback loop: SEARCH_MORE / ENOUGH_EVIDENCE)
 * → REFINED BIS SEARCH (Execute discovered formal terms / specific queries)
 * → VERIFIED EVIDENCE COMPILATION
 * → INTERNAL SERVER-SIDE DEBUG LOGGING
 */

require('dotenv').config();
const { BIS_STANDARDS_DATABASE } = require('../data/bisStandardsDatabase');
const { BIS_ECOSYSTEM_DATABASE } = require('../data/bisEcosystemDatabase');
const { performAgentReachRetrieval } = require('./agentReachService');

// Priority model list with automatic failover (fastest & highest quota first)
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest'
];

/**
 * Invokes Gemini with JSON response guarantee and model failover
 */
async function callGeminiJSON(prompt, systemInstruction = '', timeoutMs = 4500) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    return null;
  }

  for (const model of CANDIDATE_MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        }),
        signal: AbortSignal.timeout(timeoutMs)
      });

      if (!res.ok) {
        continue;
      }

      const data = await res.json();
      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (txt) {
        try {
          const parsed = JSON.parse(txt);
          return { data: parsed, model };
        } catch (parseErr) {
          const jsonMatch = txt.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            return { data: JSON.parse(jsonMatch[1]), model };
          }
        }
      }
    } catch (err) {
      // Timeout or network error, continue to next model
    }
  }

  return null;
}

/**
 * STEP 2 & 3: GEMINI SEARCH PLANNER (ROLE A - SEARCH REASONING)
 * Dynamically understands user intent across the COMPLETE BIS ECOSYSTEM:
 * 1. Indian Standards (IS numbers, titles, scopes, revisions, amendments)
 * 2. Products (Any product category using semantic understanding)
 * 3. BIS Certification (Scheme I, process, documents, timeline)
 * 4. BIS Licences (CM/L numbers, grant, renewal, modification, verification)
 * 5. ISI Mark (Visual elements, BIS vs ISI distinction, verification)
 * 6. Quality Control Orders (QCOs, Section 16, mandatory compliance)
 * 7. Mandatory vs Voluntary Certification (Independent legal status)
 * 8. Compulsory Registration Scheme (CRS, electronic & IT goods, R-number)
 * 9. Hallmarking & HUID (Purity, 6-digit code, 3 mandatory marks, AHCs)
 * 10. Testing & Laboratories (Test requirements, Central & Regional labs, LRS network)
 * 11. Applications & Online Services (Manak Online, registration, submission, tracking)
 * 12. Fees & Charges (Application, licence, marking fee, MSME discounts)
 * 13. Consumer Complaints (BIS Care App, e-BIS, reporting fake marks, enforcement)
 * 14. BIS Regional & Branch Offices (Jaipur, Delhi, Mumbai, Kolkata, Chennai, contacts)
 * 15. BIS Laboratory Directory & Testing Facilities
 * 16. BIS Schemes & Flagship Programmes (Standards Clubs, Manak Rath, NITS)
 * 17. Notices, Circulars, Gazette Orders & Amendments
 * 18. General BIS FAQ (History, mandate, NSB of India, Manak Bhavan)
 * 19. Official Documents, Product Manuals, Guidelines & Publications
 * 20. Multimodal Image-Based Verification
 */
async function planSearch(rawQuery, options = {}) {
  const context = options.context || {};
  const activeEntity = context.active_entity || '';
  const activeTopic = context.active_topic || '';
  const previousQuestions = (context.previous_questions || []).slice(-3);
  const isFollowUp = !!options.isFollowUp;

  let contextDescription = '';
  if (activeEntity || isFollowUp) {
    contextDescription = `
Active Conversation Context:
- Active Topic / Entity: ${activeEntity || activeTopic || 'None'}
- Is Follow-up Question: ${isFollowUp ? 'YES' : 'NO'}
${previousQuestions.length > 0 ? `- Recent Questions: ${previousQuestions.map(q => `"${q}"`).join(', ')}` : ''}
`;
  }

  const systemInstruction = `You are the Search Planner for BISsetu, the authoritative Bureau of Indian Standards (BIS) AI assistant.
Your job is ROLE A: Search Reasoning, Language Understanding, Concept Disambiguation, and Official BIS Source Routing across the COMPLETE BIS ECOSYSTEM.

Core Operating Principles:
1. Handle ANY legitimate BIS-related question in English, Hindi, Hinglish, or informal language.
   - Do NOT restrict yourself to only product searches.
   - Understand questions about: Indian Standards, any Product, Certification, Licences (CM/L), ISI mark, QCOs, Mandatory vs Voluntary compliance, CRS, Hallmarking/HUID, Testing & Labs, Manak Online applications, Fees & Charges, Consumer Complaints, Regional/Branch Offices (Jaipur, etc.), Schemes, Circulars/Notices, and General BIS Information.
2. Dynamically identify:
   - User Intent (e.g., STANDARD_LOOKUP, PRODUCT_STANDARD, CERTIFICATION, LICENCE, ISI_MARK, CRS, HALLMARKING, HUID, QCO, MANDATORY_REQUIREMENT, TESTING, LABORATORY, APPLICATION, REGISTRATION, FEES, RENEWAL, COMPLAINT, OFFICE, CONTACT, SCHEME, NOTICE, GENERAL_BIS_INFORMATION)
   - Query Domain
   - Primary Entity / Topic
   - Whether Fresh Web Retrieval is Required (true for QCOs, latest notices, licences, fees, offices, contacts, laboratory locations)
   - Target Official BIS Sources (standards.bis.gov.in, manakonline.in, bis.gov.in, crsbis.in, services.bis.gov.in)
3. Generate 3-5 high-signal search queries targeted at official BIS sources.`;

  const prompt = `Analyze this user query and create a structured search plan for the complete BIS ecosystem.
User Query: "${rawQuery}"
${contextDescription}

Respond strictly with valid JSON with this schema:
{
  "intent": "STANDARD_LOOKUP" | "PRODUCT_STANDARD" | "CERTIFICATION" | "LICENCE" | "ISI_MARK" | "CRS" | "HALLMARKING" | "HUID" | "QCO" | "MANDATORY_REQUIREMENT" | "TESTING" | "LABORATORY" | "APPLICATION" | "REGISTRATION" | "FEES" | "RENEWAL" | "COMPLAINT" | "OFFICE" | "CONTACT" | "SCHEME" | "NOTICE" | "GENERAL_BIS_INFORMATION" | "DOCUMENT" | "IMAGE_VERIFICATION" | "OTHER_BIS_QUERY",
  "queryDomain": string,
  "primaryEntity": string,
  "product": string,
  "productType": string,
  "intendedUse": string,
  "domain": string,
  "ambiguity": "broad_family" | "specific_product" | "specific_topic" | "unclear",
  "requiresFreshWebRetrieval": boolean,
  "searchConcepts": string[],
  "searchQueries": string[],
  "preferredSources": string[],
  "needsClarification": boolean
}`;

  const result = await callGeminiJSON(prompt, systemInstruction, 4500);
  if (result && result.data && (result.data.primaryEntity || result.data.product || result.data.intent)) {
    // Ensure product is defined for backwards-compatibility
    if (!result.data.product) {
      result.data.product = result.data.primaryEntity || rawQuery;
    }
    if (!result.data.productType) {
      result.data.productType = result.data.queryDomain || 'BIS Ecosystem Domain';
    }
    return {
      plan: result.data,
      engine: result.model
    };
  }

  // Deterministic fallback if Gemini is offline
  return {
    plan: planSearchDeterministic(rawQuery, options),
    engine: 'deterministic-planner-fallback'
  };
}

/**
 * Resilient deterministic search planner fallback covering the complete BIS ecosystem
 */
function planSearchDeterministic(rawQuery, options = {}) {
  const qLower = (rawQuery || '').toLowerCase().trim();
  const context = options.context || {};
  const activeEntity = context.active_entity || '';

  const stopWords = new Set(['what', 'is', 'the', 'for', 'ka', 'ki', 'ke', 'ko', 'me', 'se', 'batao', 'tell', 'me', 'bis', 'standard', 'hai', 'hain', 'kya', 'uska', 'iski', 'indian', 'bhai', 'please']);
  const tokens = qLower.split(/[\s,?.!]+/).filter(w => w.length > 2 && !stopWords.has(w));
  const candidateEntity = activeEntity || tokens.join(' ') || rawQuery;

  let intent = 'PRODUCT_STANDARD';
  let queryDomain = 'Standards';
  let primaryEntity = candidateEntity;
  let ambiguity = 'specific_product';
  let productType = 'Product / Industrial Item';
  let intendedUse = 'General statutory compliance';
  let domain = 'Bureau of Indian Standards Repository';
  let requiresFreshWebRetrieval = false;
  let searchConcepts = [candidateEntity, `${candidateEntity} BIS Indian Standard`];
  let preferredSources = ['standards.bis.gov.in', 'bis.gov.in', 'services.bis.gov.in', 'manakonline.in'];

  // 1. Generic Standards Identification
  if (/\b(how\s+(can\s+i|to)\s+(identify|find|search|determine|know)\s+standard|which\s+standard\s+applies\s+to\s+a\s+product|kaise\s+pata\s+kare\s+standard)\b/i.test(qLower)) {
    intent = 'how_to_identify';
    queryDomain = 'Standards Identification';
    primaryEntity = 'Indian Standards Classification';
    productType = 'Standard Identification System';
    searchConcepts = ['how to identify indian standard', 'classification of indian standards', 'know your standards'];
    preferredSources = ['standards.bis.gov.in', 'services.bis.gov.in'];
  }
  // 2. Consumer Complaints
  else if (/\b(complaint|grievance|shikayat|fake\s+isi|report\s+fake|counterfeit|consumer\s+helpline)\b/i.test(qLower)) {
    intent = 'COMPLAINT';
    queryDomain = 'Consumer Services';
    primaryEntity = 'BIS Consumer Grievance';
    productType = 'Complaint Redressal Mechanism';
    searchConcepts = ['BIS Care App complaint', 'e-BIS consumer grievance', 'report fake ISI mark'];
    preferredSources = ['services.bis.gov.in', 'bis.gov.in', 'manakonline.in'];
    requiresFreshWebRetrieval = true;
  }
  // 3. Hallmarking & HUID
  else if (/\b(huid|hallmark|hallmarking|gold\s+purity|silver\s+purity|sona\s+purity|22k916|assaying)\b/i.test(qLower)) {
    intent = /huid/i.test(qLower) ? 'HUID' : 'HALLMARKING';
    queryDomain = 'Hallmarking';
    primaryEntity = 'Gold and Silver Hallmarking';
    productType = 'Precious Metals Purity Verification';
    searchConcepts = ['HUID hallmark unique identification', 'gold hallmarking rules', 'IS 1417', 'IS 15820', 'BIS Care App verify HUID'];
    preferredSources = ['bis.gov.in', 'services.bis.gov.in'];
  }
  // 4. CRS (Compulsory Registration Scheme)
  else if (/\b(crs|compulsory\s+registration|crsbis|r-number|r\s+number|electronic\s+product)\b/i.test(qLower)) {
    intent = 'CRS';
    queryDomain = 'Electronics & IT (CRS)';
    primaryEntity = 'Compulsory Registration Scheme';
    productType = 'Self-Declaration Conformity (Scheme II)';
    searchConcepts = ['CRS registration process', 'electronic products under CRS', 'crsbis portal', 'R-number verification'];
    preferredSources = ['crsbis.in', 'bis.gov.in'];
    requiresFreshWebRetrieval = true;
  }
  // 5. Fees & Charges
  else if (/\b(fees?|charges?|cost|pricing|marking\s+fee|application\s+fee|licence\s+fee|kitna\s+paisa|kharcha)\b/i.test(qLower)) {
    intent = 'FEES';
    queryDomain = 'Fee Schedules';
    primaryEntity = 'BIS Certification Fees';
    productType = 'Statutory Fee Structure';
    searchConcepts = ['BIS certification fee structure', 'minimum marking fee', 'licence application fee', 'MSME fee concession'];
    preferredSources = ['bis.gov.in', 'manakonline.in'];
    requiresFreshWebRetrieval = true;
  }
  // 6. BIS Offices (Jaipur, Regional, Branch Offices, Contacts)
  else if (/\b(bis\s+office|branch\s+office|regional\s+office|nearest\s+bis\s+office|office\s+jaipur|office\s+rajasthan|office\s+address|contact\s+bis)\b/i.test(qLower)) {
    intent = 'OFFICE';
    queryDomain = 'Offices & Administration';
    primaryEntity = /jaipur|rajasthan/i.test(qLower) ? 'BIS Jaipur Branch Office' : 'BIS Regional and Branch Offices';
    productType = 'Administrative & Surveillance Network';
    searchConcepts = ['BIS Jaipur Branch Office address contact', 'BIS regional branch offices directory', 'bis.gov.in offices'];
    preferredSources = ['bis.gov.in', 'services.bis.gov.in'];
    requiresFreshWebRetrieval = true;
  }
  // 7. Testing & Laboratories
  else if (/\b(where\s+can\s+i\s+test|test\s+my\s+product|bis\s+lab|bis\s+laboratory|recognized\s+lab|testing\s+facility|lab\s+jaipur)\b/i.test(qLower)) {
    intent = 'LABORATORY';
    queryDomain = 'Testing & Laboratories';
    primaryEntity = 'BIS Laboratory Network & LRS';
    productType = 'Conformity Assessment Testing';
    searchConcepts = ['BIS recognized testing laboratories', 'Central Laboratory Sahibabad', 'Laboratory Recognition Scheme LRS', 'product testing facilities'];
    preferredSources = ['bis.gov.in', 'services.bis.gov.in'];
    requiresFreshWebRetrieval = true;
  }
  // 8. Quality Control Orders (QCO)
  else if (/\b(what\s+is\s+(a\s+)?qco|qco\s+kya\s+hai|quality\s+control\s+order|qco\s+meaning|mandatory\s+qco|under\s+qco|latest\s+qco)\b/i.test(qLower)) {
    intent = 'QCO';
    queryDomain = 'Quality Control Orders';
    primaryEntity = 'Quality Control Orders (Section 16)';
    productType = 'Mandatory Statutory Regulation';
    searchConcepts = ['Quality Control Order QCO BIS Act 2016', 'products under mandatory QCO', 'DPIIT Ministry of Steel QCO notifications'];
    preferredSources = ['bis.gov.in', 'services.bis.gov.in'];
    requiresFreshWebRetrieval = true;
  }
  // 9. Mandatory vs Voluntary
  else if (/\b(is\s+(bis|isi|certification)\s+(mandatory|compulsory)|do\s+i\s+need\s+bis|can\s+i\s+sell\s+without\s+bis|voluntary\s+standard|anivarye\s+hai\s+kya)\b/i.test(qLower)) {
    intent = 'MANDATORY_REQUIREMENT';
    queryDomain = 'Regulatory Compliance';
    primaryEntity = candidateEntity || 'BIS Mandatory Certification';
    productType = 'Regulatory Obligation';
    searchConcepts = ['mandatory vs voluntary BIS certification', 'compulsory certification under QCO', 'BIS Act Section 16 compliance'];
    preferredSources = ['bis.gov.in', 'standards.bis.gov.in'];
  }
  // 10. BIS Licence & CM/L Number
  else if (/\b(bis\s+licence|bis\s+license|licence\s+kya\s+hota\s+hai|how\s+to\s+apply\s+for\s+bis\s+licence|licence\s+renewal|cml\s+number|cm\/l\s+number|verify\s+(a\s+)?bis\s+licence)\b/i.test(qLower)) {
    intent = /renew/i.test(qLower) ? 'RENEWAL' : 'LICENCE';
    queryDomain = 'Licensing & Conformity';
    primaryEntity = 'BIS Licence and CM/L Number';
    productType = 'Conformity Marks Licence';
    searchConcepts = ['how to apply for BIS licence', 'CM/L number verification', 'licence renewal procedure Manak Online', 'licence modification'];
    preferredSources = ['manakonline.in', 'services.bis.gov.in', 'bis.gov.in'];
    requiresFreshWebRetrieval = true;
  }
  // 11. ISI Mark
  else if (/\b(what\s+is\s+(the\s+)?isi\s+mark|isi\s+mark\s+kya\s+hai|isi\s+logo|difference\s+between\s+bis\s+and\s+isi|isi\s+mark\s+kaise\s+milega)\b/i.test(qLower)) {
    intent = 'ISI_MARK';
    queryDomain = 'Certification Marks';
    primaryEntity = 'ISI Mark (Scheme I)';
    productType = 'Conformity Mark';
    searchConcepts = ['ISI mark meaning and visual elements', 'difference between BIS and ISI', 'CM/L number on ISI mark'];
    preferredSources = ['bis.gov.in', 'services.bis.gov.in'];
  }
  // 12. Applications & Online Services
  else if (/\b(manak\s*online|how\s+do\s+i\s+apply|where\s+do\s+i\s+apply|how\s+to\s+register|submit\s+bis\s+application|track\s+application)\b/i.test(qLower)) {
    intent = 'APPLICATION';
    queryDomain = 'Online Services';
    primaryEntity = 'Manak Online Portal Application';
    productType = 'Digital Governance Portal';
    searchConcepts = ['how to submit BIS application on Manak Online', 'documents required for BIS licence', 'track BIS application'];
    preferredSources = ['manakonline.in', 'services.bis.gov.in'];
    requiresFreshWebRetrieval = true;
  }
  // 13. General BIS Certification
  else if (/\b(what\s+is\s+bis\s+certification|how\s+can\s+i\s+get\s+bis\s+certification|certification\s+process|how\s+long\s+does\s+certification\s+take)\b/i.test(qLower)) {
    intent = 'CERTIFICATION';
    queryDomain = 'Product Certification';
    primaryEntity = 'BIS Certification Process';
    productType = 'Conformity Assessment Scheme I';
    searchConcepts = ['BIS certification process steps', 'how to get BIS certification', 'factory audit and testing for BIS'];
    preferredSources = ['bis.gov.in', 'manakonline.in'];
  }
  // 14. Notices, Circulars, Updates
  else if (/\b(latest\s+bis\s+notification|latest\s+bis\s+circular|bis\s+notice|new\s+bis\s+update|latest\s+amendment)\b/i.test(qLower)) {
    intent = 'NOTICE';
    queryDomain = 'Regulatory Updates';
    primaryEntity = 'BIS Notifications and Circulars';
    productType = 'Statutory Circulars';
    searchConcepts = ['latest BIS notifications and circulars', 'recent QCO implementation orders', 'draft standards wide circulation'];
    preferredSources = ['bis.gov.in', 'manakonline.in'];
    requiresFreshWebRetrieval = true;
  }
  // 15. Schemes & Programmes
  else if (/\b(standards?\s+clubs?|manak\s+rath|nits|bis\s+schemes?|awareness\s+programme)\b/i.test(qLower)) {
    intent = 'SCHEME';
    queryDomain = 'Programmes & Initiatives';
    primaryEntity = 'BIS Educational and Awareness Programmes';
    productType = 'Quality Outreach Initiatives';
    searchConcepts = ['BIS Standards Clubs in schools', 'Manak Rath mobile exhibition', 'National Institute of Training for Standardization NITS'];
    preferredSources = ['bis.gov.in', 'manakonline.in'];
  }
  // 16. General BIS Information
  else if (/\b(what\s+is\s+bis|what\s+does\s+bis\s+do|when\s+was\s+bis\s+established|role\s+of\s+bis)\b/i.test(qLower)) {
    intent = 'GENERAL_BIS_INFORMATION';
    queryDomain = 'General BIS';
    primaryEntity = 'Bureau of Indian Standards Overview';
    productType = 'National Standards Body of India';
    searchConcepts = ['Bureau of Indian Standards mandate and history', 'BIS Act 2016', 'functions of BIS'];
    preferredSources = ['bis.gov.in', 'standards.bis.gov.in'];
  }
  // 17. Product Standard Inquiries (Dynamic Product Handling)
  else {
    intent = 'PRODUCT_STANDARD';
    queryDomain = 'Product Standards';
    primaryEntity = candidateEntity;

    if (/oil|tel|sarson|mustard|cooking|khane|edible/i.test(qLower)) {
      ambiguity = /mustard|sarson/i.test(qLower) ? 'specific_product' : 'broad_family';
      productType = 'Edible / Vegetable Oil';
      intendedUse = 'Human consumption and culinary cooking';
      domain = 'Food and Agriculture Division (FAD)';
      searchConcepts = ['edible vegetable oil', 'mustard oil IS 546', 'cooking oil', 'vanaspati IS 10633'];
    } else if (/cold\s*drink|soft\s*drink|beverage|aerated/i.test(qLower)) {
      ambiguity = 'specific_product';
      productType = 'Carbonated Beverage / Soft Drink';
      intendedUse = 'Beverage consumption';
      domain = 'Food and Agriculture Division (FAD)';
      searchConcepts = ['carbonated beverages IS 2346', 'soft drinks standard', 'aerated water'];
    } else if (/pipe|pipes|piping/i.test(qLower)) {
      ambiguity = 'broad_family';
      productType = 'Fluid Conveyance Conduit';
      intendedUse = 'Water distribution, plumbing, irrigation';
      domain = 'Civil Engineering (CED) / Metallurgical Engineering (MTD)';
      searchConcepts = ['upvc pipe IS 4985', 'cpvc pipe IS 15778', 'gi pipe IS 1239', 'hdpe pipe IS 4984'];
    } else if (/pressure\s*cooker/i.test(qLower)) {
      ambiguity = 'specific_product';
      productType = 'Domestic Pressure Cooker';
      intendedUse = 'Household and commercial cooking';
      domain = 'Mechanical Engineering (MED)';
      searchConcepts = ['domestic pressure cooker IS 2347', 'pressure cooker QCO', 'pressure cooker safety'];
    } else if (/helmet/i.test(qLower)) {
      ambiguity = 'specific_product';
      productType = 'Protective Helmet';
      intendedUse = 'Cranial impact protection for two-wheeler riders';
      domain = 'Mechanical Engineering / Road Safety (MED)';
      searchConcepts = ['protective helmet IS 4151', 'two wheeler helmet mandatory QCO'];
    } else if (/cement/i.test(qLower)) {
      ambiguity = 'broad_family';
      productType = 'Hydraulic Cement';
      intendedUse = 'Building and infrastructure construction';
      domain = 'Civil Engineering (CED)';
      searchConcepts = ['ordinary portland cement IS 269', 'portland pozzolana cement IS 1489', 'portland slag cement IS 455'];
    } else if (/toy|toys/i.test(qLower)) {
      ambiguity = 'specific_product';
      productType = 'Toys and Children Products';
      intendedUse = 'Children play and recreation';
      domain = 'Consumer Products / Safety';
      searchConcepts = ['safety of toys IS 9873', 'toys mandatory QCO'];
    } else if (/steel|rebar|tmt/i.test(qLower)) {
      ambiguity = 'specific_product';
      productType = 'Steel Rebar for Concrete Reinforcement';
      intendedUse = 'Structural reinforcement';
      domain = 'Metallurgical Engineering (MTD)';
      searchConcepts = ['high strength deformed steel bars IS 1786', 'steel mandatory QCO'];
    } else if (/wire|cable|wiring/i.test(qLower)) {
      ambiguity = 'specific_product';
      productType = 'Insulated Cables and Wires';
      intendedUse = 'Electrical power distribution';
      domain = 'Electrotechnical (ETD)';
      searchConcepts = ['pvc insulated cables IS 694', 'electrical wires QCO'];
    } else if (/water|paani|peene|drinking\s*water/i.test(qLower)) {
      ambiguity = /bottle|packaged/i.test(qLower) ? 'specific_product' : 'specific_product';
      productType = 'Drinking Water / Potable Water';
      intendedUse = 'Drinking water intended for human consumption';
      domain = 'Food and Agriculture / Water Resources';
      searchConcepts = ['drinking water IS 10500', 'packaged drinking water IS 14543'];
    } else if (/led|bulb|lamp/i.test(qLower)) {
      ambiguity = 'specific_product';
      productType = 'Lighting / Self-Ballasted LED Lamp';
      intendedUse = 'General lighting service';
      domain = 'Electrotechnical (ETD)';
      searchConcepts = ['self-ballasted led lamps IS 16102', 'led bulb CRS scheme'];
    } else {
      searchConcepts = [candidateEntity, `${candidateEntity} BIS Indian Standard`, `${candidateEntity} specification`];
    }
  }

  const searchQueries = searchConcepts.map(c => `${c} BIS`);

  return {
    intent,
    queryDomain,
    primaryEntity,
    product: primaryEntity,
    productType,
    attributes: tokens,
    intendedUse,
    domain,
    ambiguity,
    requiresFreshWebRetrieval,
    searchConcepts,
    searchQueries,
    preferredSources,
    needsClarification: ambiguity === 'broad_family'
  };
}

/**
 * STEP 6 & 8: GEMINI SEARCH RESULT EVALUATOR & FEEDBACK LOOP
 * Inspects returned candidates from local repository and official portals:
 * - Checks if candidates genuinely match product concept, intended use, or ecosystem topic
 * - Rejects spurious keyword matches
 * - Identifies discovered formal BIS terminology
 * - Decides whether ENOUGH_EVIDENCE or SEARCH_MORE
 */
async function evaluateSearchResults(rawQuery, searchPlan, candidateResults, options = {}) {
  if (!candidateResults || candidateResults.length === 0) {
    return {
      status: 'NO_VERIFIED_RESULT',
      reason: 'No matching records found in official BIS repository.',
      relevantIndices: [],
      irrelevantIndices: [],
      discoveredFormalTerms: [],
      nextQueries: []
    };
  }

  const systemInstruction = `You are the Search Result Evaluator for BISsetu (Bureau of Indian Standards AI).
Your job is to inspect search results returned from official BIS sources.

Evaluation Rules:
1. STRICT SEMANTIC MATCHING:
   - For products: evaluate candidates using PRODUCT MEANING + INTENDED USE + SCOPE.
     Accept ONLY standards that specifically cover the requested product or its direct commercial subtypes.
     Reject unrelated items even if they share words (e.g. reject engine lubricating oil for cooking oil; reject water bottles for cold drinks).
   - For institutional/ecosystem queries (Licences, Certification, QCOs, Hallmarking, CRS, Complaints, Offices, Labs, Fees, Schemes, Notices):
     Accept official ecosystem records matching the institutional topic.
2. DISCOVERED FORMAL TERMINOLOGY:
   Identify official BIS standard titles, standard numbers (e.g. IS 10500, IS 4151, IS 1417), and formal category terms visible in the results.
3. DECIDE NEXT ACTION:
   - "ENOUGH_EVIDENCE": When the returned results contain verified official BIS evidence covering the user's question.
   - "SEARCH_MORE": When the returned results show a promising term or standard number requiring further confirmation.
   - "NEEDS_CLARIFICATION": When a product inquiry covers multiple distinct commercial types and all primary standards have been identified.`;

  const summarizedCandidates = candidateResults.slice(0, 10).map((r, i) => ({
    index: i + 1,
    standard_number: r.standard_number || r.id,
    title: r.title,
    scope: (r.scope || r.summary || '').substring(0, 160),
    category: r.product_category || r.category || '',
    is_ecosystem: !!r.is_ecosystem
  }));

  const prompt = `Inspect these retrieved search results for the user's query:
User Query: "${rawQuery}"
Intent: "${searchPlan.intent}"
Primary Entity: "${searchPlan.primaryEntity || searchPlan.product}" (${searchPlan.productType})
Domain: "${searchPlan.domain || searchPlan.queryDomain}"

Candidate Results:
${JSON.stringify(summarizedCandidates, null, 2)}

Respond strictly with valid JSON with this schema:
{
  "status": "ENOUGH_EVIDENCE" | "SEARCH_MORE" | "NEEDS_CLARIFICATION" | "NO_VERIFIED_RESULT",
  "reason": string,
  "relevantIndices": number[],
  "irrelevantIndices": number[],
  "discoveredFormalTerms": string[],
  "nextQueries": string[]
}`;

  const result = await callGeminiJSON(prompt, systemInstruction, 4500);
  if (result && result.data && Array.isArray(result.data.relevantIndices) && result.data.relevantIndices.length > 0) {
    // If query is about gold hallmarking / HUID, ensure governing standards IS 1417 and IS 15820 are preserved
    if (searchPlan.intent === 'HUID' || searchPlan.intent === 'HALLMARKING' || /hallmark|huid|gold/i.test(rawQuery)) {
      candidateResults.forEach((cand, idx) => {
        if ((cand.base_number === '1417' || cand.base_number === '15820') && !result.data.relevantIndices.includes(idx + 1)) {
          result.data.relevantIndices.push(idx + 1);
        }
      });
    }
    return result.data;
  }

  // Deterministic evaluation fallback
  return evaluateSearchResultsDeterministic(searchPlan, candidateResults);
}

/**
 * Resilient deterministic evaluation fallback
 */
function evaluateSearchResultsDeterministic(searchPlan, candidateResults) {
  const isEcosystemIntent = [
    'how_to_identify', 'COMPLAINT', 'HUID', 'HALLMARKING', 'CRS', 'FEES',
    'OFFICE', 'CONTACT', 'LABORATORY', 'TESTING', 'QCO', 'MANDATORY_REQUIREMENT',
    'LICENCE', 'RENEWAL', 'ISI_MARK', 'APPLICATION', 'REGISTRATION', 'CERTIFICATION',
    'NOTICE', 'SCHEME', 'DOCUMENT', 'GENERAL_BIS_INFORMATION', 'IMAGE_VERIFICATION'
  ].includes(searchPlan.intent);

  const relevantIndices = [];
  const irrelevantIndices = [];
  const discoveredTerms = [];

  const prodTokens = `${searchPlan.primaryEntity || searchPlan.product} ${searchPlan.productType} ${(searchPlan.searchConcepts || []).join(' ')}`.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['and', 'for', 'the', 'bis', 'standard', 'division', 'specifications'].includes(w));

  candidateResults.forEach((r, idx) => {
    // If the candidate is an official ecosystem record matching an ecosystem intent
    if (r.is_ecosystem && isEcosystemIntent) {
      relevantIndices.push(idx + 1);
      discoveredTerms.push(r.title);
      return;
    }

    // Preserve governing standards for hallmarking
    if ((searchPlan.intent === 'HUID' || searchPlan.intent === 'HALLMARKING') && (r.base_number === '1417' || r.base_number === '15820')) {
      relevantIndices.push(idx + 1);
      discoveredTerms.push(r.standard_number || r.title);
      return;
    }

    const text = `${r.standard_number || ''} ${r.title} ${r.scope || ''}`.toLowerCase();
    
    // Spurious match filter for edible oils
    if (/edible|cooking|food|culinary|sarson|mustard|tel|oil/i.test(searchPlan.intendedUse || searchPlan.product)) {
      if (/crankcase|lubricat|automotive|engine oil|transformer|drinking water|mineral water/i.test(text)) {
        irrelevantIndices.push(idx + 1);
        return;
      }
      if (!/oil|vanaspati|fats/i.test(text)) {
        irrelevantIndices.push(idx + 1);
        return;
      }
    }

    // Filter for cold drinks
    if (/cold\s*drink|soft\s*drink|beverage|aerated/i.test(searchPlan.product || searchPlan.productType)) {
      if (/water bottle|drinking water|crankcase|lubricat/i.test(text) && !/carbonated|beverage/i.test(text)) {
        irrelevantIndices.push(idx + 1);
        return;
      }
    }

    // Filter for pipes
    if (/pipe/i.test(searchPlan.product)) {
      if (!/pipe|tube|tubing|piping/i.test(text)) {
        irrelevantIndices.push(idx + 1);
        return;
      }
    }

    // Check meaningful token match
    const hasMatch = prodTokens.some(t => text.includes(t));
    if (hasMatch) {
      relevantIndices.push(idx + 1);
      discoveredTerms.push(r.standard_number || r.title);
    } else {
      irrelevantIndices.push(idx + 1);
    }
  });

  return {
    status: relevantIndices.length > 0 ? 'ENOUGH_EVIDENCE' : 'NO_VERIFIED_RESULT',
    reason: relevantIndices.length > 0 
      ? `Evaluated ${relevantIndices.length} relevant official standard(s) or record(s).` 
      : 'No matching records found in official BIS repository.',
    relevantIndices,
    irrelevantIndices,
    discoveredFormalTerms: discoveredTerms,
    nextQueries: []
  };
}

/**
 * Searches the local authoritative BIS repository across standards and ecosystem databases
 */
function searchLocalRepository(searchPlan, explicitIsNumber = null, analysis = null) {
  const candidateMap = new Map();

  // 1. Direct explicit IS number check
  if (explicitIsNumber) {
    const directMatches = BIS_STANDARDS_DATABASE.filter(item => {
      return item.base_number === explicitIsNumber || item.standard_number.toLowerCase().includes(explicitIsNumber.toLowerCase());
    });
    for (const dm of directMatches) {
      candidateMap.set(dm.base_number, { ...dm, _score: 100 });
    }
    return Array.from(candidateMap.values());
  }

  // 2. Map ecosystem topics from BIS_ECOSYSTEM_DATABASE
  const ecoCategoryMap = {
    'standards_identification_generic': 'how_to_identify_standards',
    'product_certification': 'product_certification_scheme1',
    'bis_licence': 'bis_licence_and_cml',
    'isi_mark': 'what_is_isi_mark',
    'qco_compliance': 'what_is_a_qco',
    'mandatory_vs_voluntary': 'mandatory_vs_voluntary_certification',
    'crs_scheme': 'compulsory_registration_scheme_crs',
    'hallmarking_huid': 'huid_hallmarking_overview',
    'testing_and_laboratories': 'testing_and_laboratories',
    'online_services': 'applications_and_online_services',
    'fees_and_charges': 'fees_and_charges',
    'consumer_complaints': 'consumer_complaint_procedure',
    'regional_offices': 'regional_offices_role',
    'bis_offices': 'bis_offices_directory',
    'bis_laboratories': 'bis_laboratories_directory',
    'bis_departments_schemes': 'bis_departments_and_schemes',
    'notices_circulars': 'notices_circulars_updates',
    'general_bis': 'general_bis_information_faq',
    'documents_publications': 'documents_manuals_publications',
    'image_verification': 'image_verification_guide'
  };

  const detectedCategory = analysis ? analysis.category : null;
  const directEcoId = detectedCategory && ecoCategoryMap[detectedCategory] ? ecoCategoryMap[detectedCategory] : null;

  if (directEcoId) {
    const ecoItem = BIS_ECOSYSTEM_DATABASE.find(e => e.id === directEcoId);
    if (ecoItem) {
      candidateMap.set(ecoItem.id, { ...ecoItem, is_ecosystem: true, _score: 100 });
    }
    // Also include secondary relevant ecosystem items
    if (detectedCategory === 'bis_offices') {
      const regOffice = BIS_ECOSYSTEM_DATABASE.find(e => e.id === 'regional_offices_role');
      if (regOffice) candidateMap.set(regOffice.id, { ...regOffice, is_ecosystem: true, _score: 90 });
    }
    if (detectedCategory === 'hallmarking_huid') {
      const g1 = BIS_STANDARDS_DATABASE.find(s => s.base_number === '15820');
      const g2 = BIS_STANDARDS_DATABASE.find(s => s.base_number === '1417');
      if (g1) candidateMap.set(g1.base_number, { ...g1, _score: 95 });
      if (g2) candidateMap.set(g2.base_number, { ...g2, _score: 90 });
    }
  }

  // Also full-text scan BIS_ECOSYSTEM_DATABASE for relevant terms
  const searchTerms = [
    ...(searchPlan.searchConcepts || []),
    ...(searchPlan.searchQueries || []),
    searchPlan.primaryEntity,
    searchPlan.product
  ].filter(Boolean);

  for (const eco of BIS_ECOSYSTEM_DATABASE) {
    const ecoText = `${eco.id} ${eco.title} ${eco.summary} ${eco.category} ${(eco.key_points || []).join(' ')}`.toLowerCase();
    for (const term of searchTerms) {
      const tLower = term.toLowerCase().trim();
      if (tLower.length > 3 && ecoText.includes(tLower)) {
        if (!candidateMap.has(eco.id)) {
          candidateMap.set(eco.id, { ...eco, is_ecosystem: true, _score: 85 });
        }
      }
    }
  }

  // 3. Search BIS_STANDARDS_DATABASE across all concepts & queries
  const allSearchTerms = [
    ...(searchPlan.searchConcepts || []),
    ...(searchPlan.searchQueries || []),
    searchPlan.primaryEntity,
    searchPlan.product,
    searchPlan.productType !== 'Product / Industrial Item' ? searchPlan.productType : null
  ].filter(Boolean);

  const regulatoryStopWords = new Set([
    'bis', 'standard', 'standards', 'indian', 'for', 'the', 'order', 'scheme',
    'specification', 'specifications', 'requirements', 'division', 'food', 'agriculture',
    'product', 'products', 'department', 'bureau', 'india', 'non', 'code', 'part', 'type',
    'item', 'items', 'industrial', 'general', 'statutory', 'compliance', 'repository'
  ]);

  for (const item of BIS_STANDARDS_DATABASE) {
    const fullText = `${item.standard_number} ${item.title} ${item.scope} ${item.product_category}`.toLowerCase();
    const titleScopeText = `${item.title} ${item.scope}`.toLowerCase();
    let score = 0;
    let keywordHits = 0;

    // Check explicit base number match
    if (allSearchTerms.some(term => term.includes(item.base_number))) {
      score += 50;
      keywordHits++;
    }

    // Check title / scope matches
    for (const term of allSearchTerms) {
      const cleanTerm = term.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
      if (!cleanTerm) continue;

      if (titleScopeText.includes(cleanTerm)) {
        score += 30;
        keywordHits++;
      }

      const words = cleanTerm.split(/\s+/).filter(w => w.length > 2 && !regulatoryStopWords.has(w));
      for (const w of words) {
        if (new RegExp(`\\b${w}\\b`, 'i').test(titleScopeText)) {
          score += 10;
          keywordHits++;
        }
      }
    }

    if (keywordHits > 0) {
      if (searchPlan.domain && item.product_category.toLowerCase().includes(searchPlan.domain.toLowerCase().substring(0, 8))) {
        score += 10;
      }
      if (searchPlan.intendedUse && searchPlan.intendedUse.split(/\s+/).some(w => w.length > 3 && fullText.includes(w.toLowerCase()))) {
        score += 5;
      }

      const existing = candidateMap.get(item.base_number);
      if (!existing || existing._score < score) {
        candidateMap.set(item.base_number, { ...item, _score: score });
      }
    }
  }

  const results = Array.from(candidateMap.values());
  results.sort((a, b) => (b._score || 0) - (a._score || 0));
  return results;
}

/**
 * THE COMPLETE AGENTIC RETRIEVAL ORCHESTRATION LOOP
 */
async function executeIntelligentRetrievalLoop(rawQuery, options = {}) {
  const requestId = options.requestId || 'req-' + Date.now();
  const startTime = Date.now();
  const now = new Date().toISOString();

  // Detect explicit IS number in query if any
  const isMatch = (rawQuery || '').match(/\bIS(?:\/ISO)?\s*[-:]?\s*(\d{2,5})(?:\s*[-:]\s*(\d+))?(?::(\d{4}))?\b/i);
  const explicitIsBase = isMatch && !/BIS\s+Act\s+2016/i.test(rawQuery) ? isMatch[1] : null;

  // -------------------------------------------------------------------------
  // STEP 1: GEMINI SEARCH PLANNER (Role A)
  // -------------------------------------------------------------------------
  const { plan: searchPlan, engine: plannerEngine } = await planSearch(rawQuery, options);

  // -------------------------------------------------------------------------
  // STEP 2: MULTI-QUERY SEARCH EXECUTION ACROSS AUTHORITATIVE SOURCES
  // -------------------------------------------------------------------------
  let candidatePool = searchLocalRepository(searchPlan, explicitIsBase, options.analysis);

  // Live Web Verification via Agent Reach when needed
  let webSources = [];
  let agentReachPerformed = false;

  const requiresWeb = candidatePool.length === 0 || searchPlan.requiresFreshWebRetrieval;

  if (requiresWeb) {
    const webResult = await performAgentReachRetrieval(rawQuery, options.analysis, candidatePool, {
      requestId,
      expandedQueries: searchPlan.searchQueries,
      requiresFreshWebRetrieval: searchPlan.requiresFreshWebRetrieval
    });

    agentReachPerformed = webResult.performed;
    webSources = webResult.sources || [];
    
    // Add official BIS web findings to candidate pool
    for (const ws of webSources) {
      if (ws.isOfficialBIS) {
        candidatePool.push({
          id: 'web_' + Math.random().toString(36).substring(2, 7),
          title: ws.title,
          source_url: ws.url,
          official_source_name: ws.title,
          summary: ws.content,
          scope: ws.content,
          key_points: [ws.content],
          is_ecosystem: true,
          isOfficialBIS: true,
          _score: 60
        });
      }
    }
  }

  // -------------------------------------------------------------------------
  // STEP 3: GEMINI SEARCH RESULT FEEDBACK LOOP (Role A Evaluator)
  // -------------------------------------------------------------------------
  let evaluation = await evaluateSearchResults(rawQuery, searchPlan, candidatePool, options);

  // -------------------------------------------------------------------------
  // STEP 4: REFINEMENT SEARCH (If Gemini decides SEARCH_MORE)
  // -------------------------------------------------------------------------
  let refinedQueriesRun = [];
  if (evaluation.status === 'SEARCH_MORE' && Array.isArray(evaluation.nextQueries) && evaluation.nextQueries.length > 0) {
    refinedQueriesRun = evaluation.nextQueries.slice(0, 3);
    for (const refQ of refinedQueriesRun) {
      const refinedPlan = {
        ...searchPlan,
        searchConcepts: [...(searchPlan.searchConcepts || []), refQ],
        searchQueries: [refQ]
      };
      const extraCandidates = searchLocalRepository(refinedPlan);
      for (const ec of extraCandidates) {
        if (!candidatePool.some(c => (c.base_number && c.base_number === ec.base_number) || c.id === ec.id)) {
          candidatePool.push(ec);
        }
      }
    }

    evaluation = await evaluateSearchResults(rawQuery, searchPlan, candidatePool, options);
  }

  // -------------------------------------------------------------------------
  // STEP 5: FILTER RELEVANT VERIFIED RESULTS
  // -------------------------------------------------------------------------
  const relevantSet = new Set(evaluation.relevantIndices || []);
  let verifiedCandidates = candidatePool.filter((_, idx) => relevantSet.has(idx + 1));

  if (verifiedCandidates.length === 0 && candidatePool.length > 0 && evaluation.status !== 'NO_VERIFIED_RESULT') {
    verifiedCandidates = candidatePool.slice(0, 4);
  }

  // Follow-up context reuse: carry forward previous evidence if user is asking a follow-up
  if (options.isFollowUp && options.context && Array.isArray(options.context.retrievedEvidence) && options.context.retrievedEvidence.length > 0) {
    if (verifiedCandidates.length === 0) {
      verifiedCandidates = [...options.context.retrievedEvidence];
    } else {
      for (const prev of options.context.retrievedEvidence) {
        const exists = verifiedCandidates.some(m => (m.standard_number && m.standard_number === prev.standard_number) || (m.id && m.id === prev.id));
        if (!exists) {
          verifiedCandidates.unshift(prev);
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // STEP 6: COMPILE STRUCTURED RESULTS & DISAMBIGUATION METADATA
  // -------------------------------------------------------------------------
  const structuredResults = verifiedCandidates.map(item => {
    if (item.is_ecosystem) {
      return {
        id: item.id,
        category: item.category || 'official_bis_ecosystem',
        title: item.title,
        official_source_name: item.official_source_name || 'Bureau of Indian Standards',
        source_url: item.source_url || 'https://www.bis.gov.in/',
        secondary_url: item.secondary_url,
        summary: item.summary,
        key_points: item.key_points || [],
        procedure_steps: item.procedure_steps || [],
        is_ecosystem: true,
        isOfficialBIS: true,
        retrieved_at: now
      };
    }

    return {
      standard_number: item.standard_number,
      base_number: item.base_number,
      title: item.title,
      scope: item.scope,
      status: item.status,
      edition: item.edition,
      publication_year: item.publication_year,
      amendments: item.amendments,
      mandatory_status: item.mandatory_status,
      certification_scheme: item.certification_scheme,
      product_category: item.product_category,
      key_parameters: item.key_parameters || [],
      source_url: item.source_url || `https://standards.bis.gov.in/gemini/browse-standards?is=${item.base_number}`,
      gazette_link: item.gazette_link || `https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/${item.base_number}`,
      is_ecosystem: false,
      isOfficialBIS: true,
      retrieved_at: now
    };
  });

  // Construct Disambiguation Options for Broad Product Families
  let disambiguationData = null;
  const isBroadFamily = searchPlan.ambiguity === 'broad_family' || structuredResults.length >= 2;
  if (isBroadFamily && structuredResults.length >= 2 && !explicitIsBase) {
    disambiguationData = {
      product: searchPlan.primaryEntity || searchPlan.product,
      ambiguityLevel: searchPlan.ambiguity,
      options: structuredResults.map(r => ({
        name: (r.title || '').split('—')[0].split('-')[0].trim(),
        standardNumber: r.standard_number || r.id,
        desc: r.scope ? (r.scope.length > 120 ? r.scope.substring(0, 120) + '...' : r.scope) : r.title
      }))
    };
  }

  // Format Grounded Evidence Text for Final Answer Generation (Role B)
  let evidenceText = '';
  if (structuredResults.length === 0) {
    evidenceText = `NO_MATCHING_RECORD_FOUND: The available official BIS database and portals do not contain an indexed record matching "${rawQuery}".`;
  } else {
    evidenceText = structuredResults.map((r, index) => {
      if (r.is_ecosystem) {
        return `[OFFICIAL BIS ECOSYSTEM RECORD ${index + 1}]
  Topic: ${r.title}
  Category: ${r.category}
  Summary: ${r.summary}
  Official Sources: ${r.official_source_name} (${r.source_url}${r.secondary_url ? ', ' + r.secondary_url : ''})
  Key Official Details:
${(r.key_points || []).map(kp => `    • ${kp}`).join('\n')}
${r.procedure_steps && r.procedure_steps.length > 0 ? `  Official Procedure Steps:\n${r.procedure_steps.map((ps, pi) => `    ${pi + 1}. ${ps}`).join('\n')}` : ''}`;
      }

      let paramsText = '';
      if (r.key_parameters && r.key_parameters.length > 0) {
        paramsText = '\n  Key Parameters:\n' + r.key_parameters.map(p => 
          p.parameter ? `    - ${p.parameter}: ${p.acceptable_limit ? `Acceptable: ${p.acceptable_limit}, Permissible: ${p.permissible_limit}` : p.requirement}` : ''
        ).join('\n');
      }

      return `[OFFICIAL BIS STANDARD RECORD ${index + 1}]
  Standard Number: ${r.standard_number}
  Title: ${r.title}
  Scope: ${r.scope}
  Status: ${r.status} (${r.edition})
  Amendments: ${r.amendments}
  Certification / QCO Status: ${r.mandatory_status}
  Scheme: ${r.certification_scheme}
  Category: ${r.product_category}${paramsText}
  Official BIS Source URL: ${r.source_url}
  Official BIS Portal Link: ${r.gazette_link || 'https://standards.bis.gov.in/'}`;
    }).join('\n\n');

    if (disambiguationData && Array.isArray(disambiguationData.options)) {
      const disambiguationHeader = `[PRODUCT CATEGORY DISAMBIGUATION NOTICE]
Category "${disambiguationData.product}" encompasses multiple distinct commercial varieties with individual official standards:
${disambiguationData.options.map(opt => `  • ${opt.name} (${opt.standardNumber}): ${opt.desc}`).join('\n')}
The response MUST clearly present and explain these primary categories/standards rather than silently selecting only one.`;
      evidenceText = `${disambiguationHeader}\n\n${evidenceText}`;
    }
  }

  // -------------------------------------------------------------------------
  // STEP 18: INTERNAL SERVER-SIDE DEBUG LOGGING REQUIREMENT
  // -------------------------------------------------------------------------
  const selectedSourcesTitles = structuredResults.map(r => r.standard_number || r.title);
  const durationMs = Date.now() - startTime;

  console.log(`\n================== [INTERNAL BIS SEARCH PIPELINE DEBUG] ==================`);
  console.log(`REQUEST ID:              ${requestId} (${durationMs}ms)`);
  console.log(`USER QUERY:              "${rawQuery}"`);
  console.log(`INTENT & DOMAIN:         ${searchPlan.intent} | ${searchPlan.queryDomain || searchPlan.domain}`);
  console.log(`SEMANTIC TOPIC/ENTITY:   ${searchPlan.primaryEntity || searchPlan.product} (${searchPlan.productType})`);
  console.log(`GENERATED SEARCH QUERIES:[${(searchPlan.searchQueries || []).join(' | ')}]`);
  console.log(`SOURCE SELECTED:         ${selectedSourcesTitles.join(', ') || 'None'}`);
  console.log(`RESULT COUNT:            ${structuredResults.length}`);
  console.log(`RESULT TITLES:           ${structuredResults.map(r => r.title).join(' ; ') || 'None'}`);
  console.log(`GEMINI SEARCH DECISION:  ${evaluation.status} - ${evaluation.reason}`);
  console.log(`REFINED QUERIES:         [${(refinedQueriesRun.length > 0 ? refinedQueriesRun : evaluation.nextQueries || []).join(' | ') || 'None'}]`);
  console.log(`FINAL EVIDENCE:          ${structuredResults.length > 0 ? structuredResults.map(r => `${r.standard_number || r.id}: ${r.title}`).join(' | ') : 'No verified evidence'}`);
  console.log(`PLANNER ENGINE:          ${plannerEngine}`);
  console.log(`==========================================================================\n`);

  return {
    query: rawQuery,
    requestId,
    analysis: {
      rawQuery,
      normalizedQuery: rawQuery.trim(),
      category: options.analysis?.category || (searchPlan.intent === 'PRODUCT_STANDARD' ? 'standards' : 'ecosystem'),
      intent: options.analysis?.intent || searchPlan.intent,
      languageHint: options.analysis?.languageHint || 'en',
      isBaseNumber: explicitIsBase || options.analysis?.isBaseNumber || null,
      isNumber: explicitIsBase || options.analysis?.isNumber || null,
      isGenericStandardQuery: options.analysis?.isGenericStandardQuery || false
    },
    searchPlan,
    evaluation,
    normalizedProduct: {
      rawProduct: searchPlan.primaryEntity || searchPlan.product,
      normalizedProduct: (searchPlan.productType || searchPlan.product || '').toLowerCase(),
      industry: searchPlan.domain || searchPlan.queryDomain,
      ambiguityLevel: searchPlan.ambiguity,
      intendedUse: searchPlan.intendedUse
    },
    disambiguation: disambiguationData,
    results: structuredResults,
    webSources,
    agentReachPerformed,
    evidenceText,
    sourceCategory: options.analysis?.category || (searchPlan.intent === 'PRODUCT_STANDARD' ? 'standards' : 'ecosystem'),
    isAmbiguous: isBroadFamily || explicitIsBase === '302' || options.analysis?.isBaseNumber === '302',
    retrievedAt: now
  };
}

module.exports = {
  CANDIDATE_MODELS,
  callGeminiJSON,
  planSearch,
  planSearchDeterministic,
  evaluateSearchResults,
  searchLocalRepository,
  executeIntelligentRetrievalLoop
};
