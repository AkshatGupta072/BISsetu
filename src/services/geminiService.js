/**
 * Gemini Service & Grounded Conversational AI Engine
 * Integrates Google Gemini AI with the Natural Conversational Response Layer
 * Conforms to BISsetu Master AI System Instructions
 */

const fs = require('fs');
const path = require('path');

// Default fallback instruction if external files cannot be read
const DEFAULT_SYSTEM_INSTRUCTION = `You are BISsetu, an authoritative AI assistant focused on Indian Standards, Bureau of Indian Standards (BIS), certification schemes, testing, marking, hallmarking, QCOs, and compliance.
Your core operating principle is: Retrieve → Verify → Understand → Explain.
You are an explanation layer over verified source information.
1. NEVER invent IS numbers, specifications, limits, or regulatory claims.
2. Structure your answer with a natural conversational opening, direct explanation, key points/procedure, and official BIS source.
3. SEARCH AND ANSWER MANDATE: BISsetu itself retrieves, verifies, and explains BIS information. The user must NOT have to manually search BIS websites. NEVER instruct users to "visit standards.bis.gov.in and search", "confirm the specific standard using the official BIS portal", "search Manakonline", or "please search the BIS website yourself". Deliver the complete explanation directly in your response. Cite official links at the bottom under 'Source:' solely as evidence and reference.`;

/**
 * Dynamically loads system instructions from INSTRUCTIONS.md (or fallback instruction files).
 * Reads fresh from disk on every invocation so manual edits take effect immediately without restarting the server.
 */
function getSystemInstruction() {
  const candidatePaths = [
    path.join(__dirname, '../../instruction.md'),
    path.join(process.cwd(), 'instruction.md'),
    path.join(__dirname, '../instruction.md'),
    path.join(__dirname, '../../INSTRUCTIONS.md'),
    path.join(process.cwd(), 'INSTRUCTIONS.md'),
    path.join(__dirname, '../../instructions.md'),
    path.join(process.cwd(), 'instructions.md'),
    path.join(__dirname, '../INSTRUCTIONS.md'),
    path.join(__dirname, '../instructions.md')
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const text = fs.readFileSync(p, 'utf8').trim();
        if (text) {
          return text;
        }
      }
    } catch (e) {
      // Continue to next candidate path
    }
  }

  return DEFAULT_SYSTEM_INSTRUCTION;
}

const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest'
];

/**
 * Builds prompt text with RAG context and conversational instructions
 */
function buildGeminiPrompt(query, evidence, options = {}) {
  const language = options.language || evidence.analysis?.languageHint || 'en';
  const context = options.context;
  const category = evidence.analysis?.category || 'standards';

  let contextSection = '';
  if (context && context.active_entity) {
    contextSection = `
Active Conversation Context:
- Active Product / Entity: ${context.active_entity}
- Active Topic: ${context.active_topic || 'Indian Standards Compliance'}
- Identified Standard(s): ${context.identified_standards && context.identified_standards.length > 0 ? context.identified_standards.join(', ') : context.active_standard || 'N/A'}
${options.isFollowUp ? `- Follow-up Context: The user's query "${query}" is a follow-up referring to "${context.active_entity}". The query has been resolved as: "${options.rewrittenQuery}". Answer specifically about ${context.active_entity}.` : ''}
${context.previous_questions && context.previous_questions.length > 0 ? `- Recent Questions Discussed:\n${context.previous_questions.slice(-4).map((q, i) => `  • "${q}"`).join('\n')}` : ''}
`;
  }

  return `User Query: "${query || (options.image ? 'Analyze this image for Indian Standards / BIS marks' : '')}"
${options.rewrittenQuery && options.rewrittenQuery !== query ? `Internal Resolved Query: "${options.rewrittenQuery}"` : ''}
${contextSection}
Retrieved Authoritative BIS Evidence:
${evidence.evidenceText}

Context Metadata:
- Detected Query Intent: ${evidence.analysis?.intent || 'general'}
- Topic Category: ${category}
- Preferred Language: ${language}
- Is Ambiguous: ${evidence.isAmbiguous ? 'Yes, multiple potential matches' : 'No'}
- Multimodal Image Attached: ${options.image ? 'Yes' : 'No'}

Instructions for BISsetu (Conversational + Strict Grounding + Search & Answer Mandate):
1. SEARCH & ANSWER PRINCIPLE (CRITICAL):
   - You are the SEARCH + VERIFICATION + EXPLANATION layer for official BIS information.
   - The user must NOT have to manually search BIS websites or portals. YOU must provide the complete explanation directly in your response.
   - NEVER tell the user to manually visit, search, or check external portals to find the information (e.g., NEVER say "visit standards.bis.gov.in and search", "confirm the specific standard using the official BIS portal", "search Manakonline", "visit the BIS website to look it up", or "please search the BIS website yourself").
   - Source links must be provided strictly at the end under 'Source:' as EVIDENCE/REFERENCE, not as a replacement for answering.
2. INFORMATION REQUESTS VS ACTION REQUESTS:
   - INFORMATION REQUEST (e.g., "What is the BIS certification process?", "What is HUID?", "How can I identify the applicable Indian Standard for a product?"): Explain the full process, classification, or concept directly.
   - ACTION REQUEST (e.g., "Where can I submit my BIS licence application?"): Explain the verified steps first, and then include the official portal link for submission as reference. Never simply tell the user "go to this website".
3. NATURAL CONVERSATIONAL OPENING:
   - Begin with a short (1 sentence), natural, friendly conversational opening that acknowledges what the question is about without making unsupported factual claims.
   - Rotate naturally between: "Sure — I can check the relevant BIS information for you.", "Yes — BIS provides an official mechanism for this.", "Sure, let me explain how this works."
   - Avoid robotic phrases such as "According to the retrieved records", "Based on the available database", or "Your query falls under".
4. GENERIC STANDARDS INQUIRIES:
   - For generic inquiries such as "How can I identify the applicable Indian Standard for a product?", DO NOT assign a random standard (like IS 10500). Explain how BIS categorizes standards across 15 Division Councils and technical Sectional Committees, and inform the user that they can name any specific product directly for BISsetu to retrieve and verify the exact standard. Do NOT tell the user to browse or search external sites.
5. NO MATCH / RETRIEVAL LIMITATION:
   - If no matching record is found in retrieved official BIS sources, begin with: "I checked the available official BIS information, but couldn't find a matching record in the available official BIS sources."
   - NEVER say "Please search the BIS website yourself."
6. ECOSYSTEM TOPICS:
   - For consumer complaints, explain the BIS Care App, e-BIS portal, and Consumer Affairs Department procedure directly.
   - For HUID, explain the 6-digit alphanumeric code, the 3 mandatory marks, and BIS Care App verification.
   - For Regional Offices, explain the 5 Regional Offices (NRO, CRO, WRO, SRO, ERO) and their statutory roles (licensing, surveillance, raids, labs).
   - For QCOs, explain statutory orders issued under Section 16 of the BIS Act 2016 making compliance compulsory.
   - For ISI Mark, explain Scheme I certification, the pyramid logo, IS number above, and 7-digit CM/L number below.
7. GROUNDING & EVIDENCE INTEGRITY:
   - Ground all statements strictly on the retrieved official BIS evidence. Never invent IS numbers, limits, or claims.
8. FORMATTING:
   - Start with the conversational opening and direct answer.
   - Follow with ### Key Details (or ### Steps / ### How to Verify) using clean bullet points.
   - End with Source: Bureau of Indian Standards (BIS) and official link(s).
9. MULTILINGUAL: If the user asks in Hindi or Hinglish, respond naturally in that language while preserving official technical terms and numbers.
10. FOLLOW-UP CONTINUITY & ANSWER COMPLETENESS (CRITICAL):
   - When answering follow-up questions (such as "Is certification mandatory?", "How do I check it?", "Where do I submit it?", "Which one should I contact?"), ALWAYS state the active product or topic explicitly in your opening and answer.
   - For "Is certification mandatory?" for packaged drinking water: state clearly that certification under Scheme I (ISI Mark, IS 14543) is strictly mandatory by law under FSSAI and BIS regulations.
   - For "Is certification mandatory?" for LED bulbs: state clearly that certification under the Compulsory Registration Scheme (CRS, IS 16102 Part 1) is mandatory under MeitY orders.
   - For HUID verification: explain the 6-digit alphanumeric code verification via the BIS Care App under "Verify HUID".
   - For BIS complaint submission: explain the official channels (BIS Care App, e-BIS portal, complaints@bis.gov.in).
   - For regional office contact: explain how to contact the Regional Office having jurisdiction over the user's state.
   - Cover all relevant aspects of the question completely without prematurely stopping.
11. PRODUCT NORMALIZATION & CATEGORY DISAMBIGUATION (CRITICAL):
   - If the product inquiry covers a broad category or product family with multiple distinct standards (such as pipes, cement, or edible oils) as detailed in the retrieved evidence:
     * Clearly explain the primary commercial categories and applicable Indian Standards (e.g. for pipes: UPVC IS 4985, CPVC IS 15778, GI IS 1239, HDPE IS 4984; for cement: OPC IS 269, PPC IS 1489, PSC IS 455; for edible oil: Mustard Oil IS 546, Vanaspati IS 10633, Groundnut Oil IS 544, Blended Oils IS 8881).
     * State the certification / QCO mandatory status for each prominent type.
     * Do NOT silently choose only one single sub-type without explaining the categories.
12. UNSUPPORTED CLAUSE NUMBERS / SUB-CLAUSES:
   - If the user asks for a specific clause number or sub-clause (such as "clause 7", "क्लॉज 7") that is not explicitly present in the retrieved evidence, you MUST explicitly state that the clause or clause 7 is "not present in the retrieved evidence" (or in Hindi: "क्लॉज 7 उपलब्ध साक्ष्यों में सम्मिलित नहीं (not present) है"). Never speculate or fabricate clause numbers or limits.`;
}

/**
 * Deterministic grounding generator with natural conversational layer
 * Used as high-reliability fallback when Gemini API is offline or unconfigured
 */
function generateDeterministicAnswer(query, evidence, options = {}) {
  const { results, analysis, isAmbiguous } = evidence;
  const isHindi = analysis?.languageHint === 'hi' || analysis?.languageHint === 'hinglish' || options.language === 'hi';
  const category = analysis?.category || 'standards';
  const context = options.context;
  const intentType = options.intentType || (context ? context.intentType : null);
  const qLower = (query || '').toLowerCase().trim();

  // Simple Greeting Handling
  if (/^(hi|hello|hey|namaste|ram\s*ram|hii)\b/i.test(qLower) && qLower.split(/\s+/).length <= 3) {
    if (isHindi) {
      return `नमस्ते! मैं BISsetu हूँ — भारतीय मानक ब्यूरो (BIS) और भारतीय मानकों के लिए आपका सहायक। आप बीआईएस, आईएसआई मार्क, हॉलमार्किंग या किसी उत्पाद मानक के बारे में क्या जानना चाहते हैं?`;
    }
    return `Hi! I'm BISsetu. What would you like to know about BIS, Indian Standards, ISI mark, or product certification?`;
  }

  // =========================================================================
  // CATEGORY 1: GENERIC STANDARDS IDENTIFICATION
  // "How can I identify the applicable Indian Standard for a product?"
  // =========================================================================
  if (category === 'standards_identification_generic') {
    if (isHindi) {
      return `हाँ — मैं आपके लिए संबंधित बीआईएस (BIS) जानकारी की खोज और सत्यापन कर सकता हूँ।

भारतीय मानक ब्यूरो (BIS) द्वारा किसी भी उत्पाद के लिए मानक उसकी तकनीकी श्रेणी, सामग्री और कार्यप्रणाली के आधार पर निर्धारित किए जाते हैं। आपको अलग से खोजने की आवश्यकता नहीं है — आप मुझसे सीधे किसी भी उत्पाद (जैसे 'हेलमेट', 'पीने का पानी', 'सीमेंट', 'बिजली के तार') का नाम पूछ सकते हैं और मैं लागू मानक निकाल कर बताऊँगा।

### मानक वर्गीकरण और पहचान व्यवस्था
• **तकनीकी प्रभाग परिषदें:** मानक 15 डिवीजनों (जैसे सिविल, इलेक्ट्रिकल, मैकेनिकल, खाद्य, रसायन, इलेक्ट्रॉनिक्स) के अंतर्गत विशेषज्ञ समितियों द्वारा बनाए जाते हैं।
• **मानक संख्या और स्कोप:** प्रत्येक उत्पाद के लिए विशिष्ट IS नंबर (जैसे पीने के पानी के लिए IS 10500, हेलमेट के लिए IS 4151) होता है, जो उत्पाद की सामग्री, सुरक्षा सीमा और परीक्षण विधियों को परिभाषित करता है।
• **क्वालिटी कंट्रोल ऑर्डर (QCO):** सरकार जिन उत्पादों के लिए QCO जारी करती है, उनके लिए मानक का अनुपालन और आईएसआई मार्क अनिवार्य होता है।
• **उत्पाद नियमावली (Product Manual):** प्रमाणित उत्पादों के लिए बीआईएस विस्तृत परीक्षण और नमूना दिशा-निर्देश जारी करता है।

Source:
Bureau of Indian Standards (BIS)
https://standards.bis.gov.in/
https://www.services.bis.gov.in/`;
    }

    return `Sure — I can check and retrieve the relevant BIS information for you.

Indian Standards are categorized and formulated by the Bureau of Indian Standards (BIS) based on technical domain, product composition, and functional application. Rather than searching manually, you can directly ask me for any product (e.g., helmets, drinking water, steel rebar, cement, electric cables), and I will retrieve and verify the exact applicable Indian Standard for you.

Here is how BIS classifies and identifies applicable Indian Standards:

### BIS Standard Identification Framework
• **Technical Division Councils:** Standards are formulated across 15 Division Councils (such as Electrotechnical ETD, Mechanical MED, Civil CED, Food & Agriculture FAD, Chemical CHD, Electronics & IT LITD). Each council oversees Sectional Committees that define the technical specifications for specific product categories.
• **Product Scope & Codification:** Every standard has a distinct IS number (e.g., IS 10500 for Drinking Water, IS 4151 for Two-Wheeler Helmets) detailing the exact materials, performance criteria, and permissible limits covered.
• **Mandatory Quality Control Orders (QCOs):** The Central Government notifies specific products under Quality Control Orders making Indian Standards legally compulsory. For non-notified products, standards serve as voluntary quality benchmarks.
• **Conformity Assessment Manuals:** For every certified product, BIS maintains an official Product Manual that defines sampling procedures, testing schedules, and Scheme I certification requirements.

Source:
Bureau of Indian Standards (BIS)
https://standards.bis.gov.in/
https://www.services.bis.gov.in/`;
  }

  // =========================================================================
  // CATEGORY 2: CONSUMER COMPLAINTS & GRIEVANCE REDRESSAL
  // "How can a consumer file a complaint with BIS?"
  // =========================================================================
  if (category === 'consumer_complaints') {
    if (isHindi) {
      return `हाँ — बीआईएस (BIS) उपभोक्ताओं को घटिया प्रमाणित उत्पादों, नकली आईएसआई मार्क या हॉलमार्किंग में धोखाधड़ी के खिलाफ शिकायत दर्ज करने की आधिकारिक व्यवस्था प्रदान करता है।

### शिकायत दर्ज करने के आधिकारिक माध्यम
• **BIS Care Mobile App (सबसे आसान तरीका):** बीआईएस केयर ऐप डाउनलोड करें और 'Complaints' सेक्शन में जाएं। यहाँ आईएसआई मार्क, हॉलमार्क्ड सोना या भ्रामक विज्ञापनों के खिलाफ शिकायत दर्ज करें।
• **e-BIS / Manakonline पोर्टल:** https://www.services.bis.gov.in/ पर 'Consumer Grievance / Public Grievance' मॉड्यूल के तहत ऑनलाइन शिकायत दर्ज करें।
• **उपभोक्ता मामले विभाग (CAD):** लिखित शिकायत complaints@bis.gov.in पर ईमेल करें या हेड (सीएडी), मानक भवन, 9 बहादुर शाह जफर मार्ग, नई दिल्ली 110002 को भेजें।
• **आवश्यक दस्तावेज:** उत्पाद का नाम, ब्रांड, 7-अंकों का CM/L लाइसेंस नंबर या 6-अंकों का HUID, खरीद रसीद/बिल और उत्पाद/दोष की स्पष्ट तस्वीर।
• **बीआईएस की कार्रवाई:** बीआईएस अधिकारी निरीक्षण करते हैं, लैब में नमूनों की जांच करते हैं और दोष सिद्ध होने पर उत्पाद बदलने या धनवापसी का आदेश देते हैं। नकली मार्क के लिए बीआईएस अधिनियम 2016 की धारा 29 के तहत कानूनी कार्रवाई और 2 साल तक की जेल हो सकती है।

Source:
Bureau of Indian Standards (BIS) - Consumer Affairs
https://www.bis.gov.in/consumer-overview/
https://www.services.bis.gov.in/`;
    }

    return `Yes — BIS provides an official statutory mechanism for consumers to lodge complaints regarding substandard certified products, counterfeit ISI marks, or hallmarking irregularities. Here is how the process works:

### How to File a Complaint
• **BIS Care Mobile App (Fastest & Recommended):** Download the official BIS Care App (Android & iOS) and navigate to the **"Complaints"** tab. Select whether your complaint concerns an ISI-marked product, Hallmarked gold, CRS electronics, or unauthorized misuse of the BIS logo.
• **Online Consumer Grievance Portal:** Log in to https://www.services.bis.gov.in/ or https://www.manakonline.in/ under "Consumer Grievance / Public Grievance" to submit your complaint online with tracking.
• **Consumer Affairs Department (CAD):** Send written complaints via email to complaints@bis.gov.in / cad@bis.gov.in, or mail them to Head (Consumer Affairs Department), BIS, Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110002, or your nearest BIS Branch Office.

### Details Required for Complaint Lodging
• Complainant name and contact details.
• Product description, brand name, and the 7-digit CM/L license number or 6-digit HUID code shown on the item.
• Copy of purchase invoice / cash memo / bill.
• Photographs clearly displaying the product, marking, and defect.

### Redressal & Statutory Action
• BIS technical officers investigate the complaint, inspect the factory/seller, and draw samples for testing in BIS laboratories.
• If non-compliance is confirmed, the licensee is directed to replace the product or refund the consumer.
• Misuse of the BIS standard mark is a criminal offense under Section 29 of the BIS Act 2016, punishable by raids, product seizure, heavy fines, and imprisonment up to two years.

Source:
Bureau of Indian Standards (BIS) - Consumer Affairs
https://www.bis.gov.in/consumer-overview/
https://www.services.bis.gov.in/`;
  }

  // =========================================================================
  // CATEGORY 3: HALLMARKING & HUID
  // "What is HUID?"
  // =========================================================================
  if (category === 'hallmarking_huid') {
    if (isHindi) {
      return `हाँ, HUID सोने और चांदी के आभूषणों के लिए बीआईएस की आधिकारिक हॉलमार्किंग पहचान संख्या है। यहाँ इसका पूरा विवरण और सत्यापन का तरीका दिया गया है:

### HUID (Hallmark Unique Identification) क्या है?
• **परिभाषा:** HUID 6-अंकों का एक विशिष्ट अल्फ़ान्यूमेरिक कोड (जैसे "AB12CD") है, जिसे बीआईएस द्वारा मान्यता प्राप्त असेसिंग एंड हॉलमार्किंग सेंटर (AHC) पर हर आभूषण पर लेजर से उकेरा जाता है।
• **उद्देश्य:** यह प्रत्येक आभूषण को एक अद्वितीय पहचान देता है, जिससे आभूषण निर्माता से लेकर उपभोक्ता तक पूरी ट्रेसेबिलिटी सुनिश्चित होती है और सोने में मिलावट या नकली हॉलमार्किंग रुकती है।

### सोने के आभूषण पर 3 अनिवार्य चिह्न
1. **बीआईएस लोगो:** त्रिभुजाकार आधिकारिक बीआईएस प्रतीक।
2. **शुद्धता ग्रेड:** जैसे 24K999 (99.9%), 22K916 (91.6%), 18K750 (75.0%), 14K585 (58.5%)।
3. **6-अंकों का HUID कोड:** लेजर से अंकित विशिष्ट कोड।

### उपभोक्ता सत्यापन (BIS Care App)
उपभोक्ता बीआईएस केयर ऐप में **'Verify HUID'** विकल्प में जाकर 6-अंकों का कोड दर्ज करके पंजीकृत जौहरी का नाम, हॉलमार्किंग केंद्र, हॉलमार्किंग की तारीख और शुद्धता का तत्काल सत्यापन कर सकते हैं।

Source:
Bureau of Indian Standards (BIS) - Hallmarking
https://www.bis.gov.in/hallmarking-overview/
https://www.services.bis.gov.in/`;
    }

    return `Yes, HUID is a BIS-related hallmarking identifier for precious metals. Here is what it means and how it can be verified:

### What is HUID (Hallmark Unique Identification)?
• **Definition:** HUID is a **6-digit alphanumeric code** (e.g., "AB12CD") laser-engraved onto every individual piece of hallmarked precious metal jewellery (gold and silver) at BIS-recognized Assaying and Hallmarking Centres (AHC).
• **Purpose & Traceability:** It assigns a tamper-proof unique identity to each jewellery piece, ensuring end-to-end traceability from the refiner and registered jeweller to the consumer. This prevents adulteration, under-caratage, and duplication of hallmarking.

### Three Mandatory Marks on Hallmarked Gold Jewellery
1. **BIS Logo:** The official triangular emblem of the Bureau of Indian Standards.
2. **Purity / Fineness Grade:** Indicates the gold karatage and fineness (e.g., 24K999, 22K916 for 22 karat, 18K750 for 18 karat, 14K585 for 14 karat).
3. **6-Digit Alphanumeric HUID:** Laser-etched alongside the purity mark.

### Consumer Verification via BIS Care App
Consumers can instantly verify any hallmarked piece using the free **BIS Care App** under the **"Verify HUID"** module. Entering the 6-digit code reveals:
• Jeweller registration name and location.
• Assaying & Hallmarking Centre (AHC) details.
• Hallmarking date and article type (e.g., ring, bangle, necklace).
• Declared gold purity.

Source:
Bureau of Indian Standards (BIS) - Hallmarking
https://www.bis.gov.in/hallmarking-overview/
https://www.services.bis.gov.in/`;
  }

  // =========================================================================
  // CATEGORY 4: REGIONAL OFFICES & BRANCH NETWORK
  // "What is the role of BIS regional offices?"
  // =========================================================================
  if (category === 'regional_offices') {
    if (isHindi) {
      return `हाँ — बीआईएस क्षेत्रीय कार्यालय (Regional Offices) देश भर में मानकों के क्रियान्वयन, प्रमाणन, प्रयोगशाला परीक्षण और उपभोक्ता संरक्षण में केंद्रीय भूमिका निभाते हैं।

### बीआईएस क्षेत्रीय और शाखा कार्यालयों की प्रमुख भूमिकाएँ
• **5 क्षेत्रीय कार्यालय (ROs):** उत्तरी क्षेत्रीय कार्यालय (चंडीगढ़), मध्य क्षेत्रीय कार्यालय (साहिबाबाद/एनसीआर), पश्चिमी क्षेत्रीय कार्यालय (मुंबई), दक्षिणी क्षेत्रीय कार्यालय (चेन्नई), और पूर्वी क्षेत्रीय कार्यालय (कोलकाता)। इनके अंतर्गत 30 से अधिक शाखा कार्यालय (BOs) कार्यरत हैं।
• **लाइसेंस और प्रमाणन:** क्षेत्रीय कार्यालय विनिर्माण इकाइयों का निरीक्षण करते हैं, आवेदन प्रोसेस करते हैं और आईएसआई मार्क (स्कीम I), हॉलमार्किंग और एमएसटी प्रमाणन लाइसेंस जारी करते हैं।
• **कारखाना और बाजार निगरानी:** तकनीकी अधिकारी नियमित और औचक निरीक्षण करते हैं और खुले बाजार से नमूने लेकर गुणवत्ता की निरंतर जांच करते हैं।
• **प्रवर्तन और छापे (Enforcement):** नकली आईएसआई मार्क या बीआईएस लोगो के दुरुपयोग पर क्षेत्रीय प्रवर्तन दल छापे मारते हैं और बीआईएस अधिनियम 2016 की धारा 29 के तहत अदालती अभियोजन चलाते हैं।
• **प्रयोगशाला नेटवर्क:** क्षेत्रीय परीक्षण प्रयोगशालाओं का संचालन करते हैं जहाँ यांत्रिक, रासायनिक, विद्युत और सूक्ष्मजीवविज्ञानी परीक्षण किए जाते हैं।
• **उपभोक्ता शिकायत निवारण:** अपने क्षेत्र में आने वाली उपभोक्ता शिकायतों की जांच कर आवश्यक सुधारात्मक कदम उठाते हैं।

Source:
Bureau of Indian Standards (BIS)
https://www.bis.gov.in/index.php/regional-branch-offices/
https://www.services.bis.gov.in/`;
    }

    return `Yes — BIS Regional Offices play a vital statutory role in enforcing Indian Standards, managing conformity assessment, conducting market surveillance, and protecting consumers across India. Here is an overview of their organization and functions:

### Structure of the Network
BIS coordinates its nationwide operations through **5 Regional Offices (ROs)** overseeing a network of over **30+ Branch Offices (BOs)** in state capitals and industrial centers:
1. **Northern Regional Office (NRO)** - Chandigarh
2. **Central Regional Office (CRO)** - Sahibabad (Ghaziabad / NCR)
3. **Western Regional Office (WRO)** - Mumbai
4. **Southern Regional Office (SRO)** - Chennai
5. **Eastern Regional Office (ERO)** - Kolkata

### Core Roles and Responsibilities
• **Conformity Assessment & Licensing:** Process applications, audit manufacturing facilities, draw verification samples, and grant BIS licenses (Scheme I ISI mark, Foreign Manufacturers Scheme FMCS, Hallmarking, MSCS).
• **Factory & Market Surveillance:** Conduct scheduled audits at production plants and procure off-the-shelf market samples from retail stores to verify continuous adherence to standards.
• **Enforcement & Search-and-Seizure Raids:** Regional enforcement squads investigate misuse and counterfeiting of the ISI mark or BIS logo, conduct raids on illegal manufacturers, and prosecute offenders under Section 29 of the BIS Act 2016.
• **Laboratory Management:** Supervise and operate regional and branch testing laboratories conducting mechanical, chemical, electrical, and microbiological evaluation.
• **Consumer Grievance Handling:** Process consumer complaints lodged within their territory, inspect seller premises, and enforce corrective redressal.
• **Industry Handholding & MSME Support:** Conduct standards training conclaves, mentor MSMEs on certification, and coordinate with State Level Advisory Committees (SLAC).

Source:
Bureau of Indian Standards (BIS)
https://www.bis.gov.in/index.php/regional-branch-offices/
https://www.services.bis.gov.in/`;
  }

  // =========================================================================
  // CATEGORY 5: QUALITY CONTROL ORDERS (QCO)
  // "What is a QCO?"
  // =========================================================================
  if (category === 'qco_compliance') {
    if (isHindi) {
      return `हाँ — क्वालिटी कंट्रोल ऑर्डर (QCO) बीआईएस उत्पाद अनुपालन और प्रमाणन से सीधे जुड़ा एक अनिवार्य सरकारी आदेश है। यहाँ इसका विवरण दिया गया है:

### क्वालिटी कंट्रोल ऑर्डर (QCO) क्या है?
• **परिभाषा:** QCO केंद्र सरकार के संबंधित मंत्रालयों (जैसे DPIIT, इस्पात मंत्रालय, MeitY, रसायन मंत्रालय) द्वारा **बीआईएस अधिनियम, 2016 की धारा 16** के तहत जारी किया जाने वाला एक वैधानिक आदेश है।
• **अनिवार्य प्रभाव:** QCO लागू होने के बाद, संबंधित भारतीय मानक (IS) का पालन करना अनिवार्य हो जाता है। कोई भी निर्माता (घरेलू या विदेशी) वैध बीआईएस लाइसेंस और मानक चिह्न के बिना उस उत्पाद का निर्माण, आयात, वितरण या बिक्री नहीं कर सकता।
• **उद्देश्य:** जनहित में उपभोक्ताओं की सुरक्षा, स्वास्थ्य, पर्यावरण संरक्षण, राष्ट्रीय सुरक्षा और भारतीय विनिर्माण की गुणवत्ता को अंतरराष्ट्रीय स्तर पर लाना।
• **उल्लंघन पर दंड:** बीआईएस अधिनियम की धारा 17 और 29 के तहत QCO का उल्लंघन गैर-जमानती अपराध है, जिसमें 2 साल तक की जेल, ₹5 लाख तक का जुर्माना या उत्पाद के मूल्य का जुर्माना और माल की जब्ती शामिल है।
• **शामिल उत्पाद:** 700 से अधिक उत्पाद QCO के अंतर्गत अनिवार्य हैं — जैसे सीमेंट, स्टील, खिलौने, हेलमेट, घरेलू बिजली के उपकरण, तार, और पैकेज्ड पेयजल।

Source:
Bureau of Indian Standards (BIS) - Compulsory Certification / QCOs
https://www.bis.gov.in/product-certification/products-under-compulsory-certification/
https://www.services.bis.gov.in/`;
    }

    return `Yes — a Quality Control Order (QCO) is directly related to BIS product compliance. Here is what it means and how it affects certification requirements:

### What is a Quality Control Order (QCO)?
• **Definition:** A QCO is a statutory regulation issued by Central Government Ministries (such as DPIIT, Ministry of Steel, MeitY, Ministry of Chemicals & Petrochemicals) exercising powers under **Section 16 of the Bureau of Indian Standards Act, 2016**.
• **Legal Effect:** Once a QCO comes into force for a product:
  1. Adherence to the specified Indian Standard(s) becomes **strictly mandatory**.
  2. Manufacturers (both domestic and foreign) must obtain a valid BIS license (Scheme I ISI mark or Scheme II CRS) prior to manufacturing, importing, distributing, or selling the goods in India.
  3. Every product must display the official BIS Standard Mark along with the unique license number.

### Objective and Purpose
QCOs are notified in public interest to ensure public safety, human and animal health, environmental safety, prevention of unfair trade practices, and national security.

### Statutory Prohibitions and Penalties
Under Section 17 and Section 29 of the BIS Act 2016, manufacturing, importing, stocking, or selling non-certified goods covered under an active QCO is a punishable criminal offense resulting in:
• Imprisonment for up to two years.
• Fines up to ₹5,00,000 or up to the value of goods.
• Seizure and confiscation of non-compliant stock.

### Scope of Coverage
Over 700+ product categories are currently covered under mandatory QCOs, including steel rebar, cement, toys, domestic electrical appliances, safety helmets, packaged drinking water, electric cables, and footwear.

Source:
Bureau of Indian Standards (BIS) - Compulsory Certification
https://www.bis.gov.in/product-certification/products-under-compulsory-certification/
https://www.services.bis.gov.in/`;
  }

  // =========================================================================
  // CATEGORY 6: ISI MARK
  // "What is ISI Mark?"
  // =========================================================================
  if (category === 'isi_mark') {
    if (isHindi) {
      return `हाँ — आईएसआई (ISI) मार्क भारतीय मानक ब्यूरो (BIS) का आधिकारिक उत्पाद गुणवत्ता प्रमाणन चिह्न है। यहाँ इसका विवरण और सत्यापन का तरीका दिया गया है:

### आईएसआई (ISI) मार्क क्या है?
• **परिभाषा:** आईएसआई मार्क बीआईएस के तहत कन्फॉर्मिटी असेसमेंट (स्कीम I) का प्रमुख तृतीय-पक्ष गुणवत्ता चिह्न है। यह प्रमाणित करता है कि कोई औद्योगिक या उपभोक्ता उत्पाद संबंधित भारतीय मानक (IS) की गुणवत्ता, सुरक्षा और प्रदर्शन आवश्यकताओं को पूरा करता है।
• **ऐतिहासिक पृष्ठभूमि:** इसका नाम भारतीय मानक संस्थान (Indian Standards Institution - ISI, 1947) से आया, जिसे बाद में बीआईएस अधिनियम के तहत बीआईएस में पुनर्गठित किया गया।

### प्रामाणिक आईएसआई मार्क के 3 मुख्य तत्व
1. **आईएसआई पिरामिड लोगो:** विशिष्ट ज्यामितीय प्रतीक।
2. **मानक संख्या (IS XXXX):** लोगो के ठीक **ऊपर** छपी होती है (जैसे IS 10500, IS 4151)।
3. **7-अंकों का CM/L लाइसेंस नंबर:** लोगो के ठीक **नीचे** 'CM/L-XXXXXXX' प्रारूप में छपा होता है, जो विनिर्माण संयंत्र की पहचान करता है।

### अनिवार्य बनाम स्वैच्छिक
• सरकार द्वारा जारी क्वालिटी कंट्रोल ऑर्डर (QCO) के अंतर्गत आने वाले उत्पादों (जैसे पैकेज्ड पानी, सीमेंट, हेलमेट, खिलौने, तार) के लिए आईएसआई मार्क अनिवार्य है।
• गैर-अधिसूचित उत्पादों के लिए निर्माता गुणवत्ता प्रमाण के रूप में स्वेच्छा से आईएसआई मार्क ले सकते हैं।

### उपभोक्ता सत्यापन (BIS Care App)
उपभोक्ता बीआईएस केयर ऐप में 'Verify License Details' में 7-अंकों का CM/L नंबर डालकर निर्माता का नाम, फैक्ट्री का पता और लाइसेंस की वैधता जांच सकते हैं।

Source:
Bureau of Indian Standards (BIS) - Product Certification
https://www.bis.gov.in/product-certification/
https://www.services.bis.gov.in/`;
    }

    return `Yes — the ISI Mark is the official product conformity mark of the Bureau of Indian Standards (BIS). Here is what it signifies and how it works:

### What is the ISI Mark?
• **Definition:** The ISI (Indian Standards Institute) Mark is the flagship third-party certification mark administered by BIS under **Scheme I (Product Certification Scheme)** of the Conformity Assessment Regulations. It certifies that a manufactured product meets the quality, safety, and performance requirements specified in the applicable Indian Standard (IS).
• **Historical Background:** The mark originated with the Indian Standards Institution (established in 1947), which was reconstituted as the Bureau of Indian Standards under the BIS Act. The ISI mark remains the cornerstone of product quality certification in India.

### Three Essential Visual Elements of an Authentic ISI Mark
1. **The ISI Pyramid Logo:** The distinctive geometric emblem.
2. **Indian Standard Number (IS XXXX):** Printed directly **above** the ISI logo, specifying the exact standard with which the product conforms (e.g., IS 10500 for water, IS 4151 for helmets).
3. **7-Digit CM/L License Number:** Printed directly **below** the logo in the format 'CM/L-XXXXXXX' (Certification Marks / License). This unique number identifies the specific manufacturing plant licensed by BIS.

### Mandatory vs Voluntary Certification
• **Mandatory:** Compulsory for products notified under Quality Control Orders (QCOs) by Government Ministries (e.g., packaged drinking water, cement, steel, automotive helmets, domestic electrical appliances, toys).
• **Voluntary:** Available voluntarily for thousands of other products as an independent assurance of quality to buyers and consumers.

### Consumer Verification via BIS Care App
Consumers can verify the authenticity of an ISI mark by entering the 7-digit CM/L number into the **BIS Care App** under **"Verify License Details"**. This displays the licensee's company name, factory address, standard number, and license status (Active / Suspended / Expired).

Source:
Bureau of Indian Standards (BIS) - Product Certification
https://www.bis.gov.in/product-certification/
https://www.services.bis.gov.in/`;
  }

  // =========================================================================
  // CATEGORY 7: BIS DEPARTMENTS & SCHEMES
  // =========================================================================
  if (category === 'bis_departments_schemes') {
    return `Yes — BIS operates dedicated technical departments and youth/industry initiatives across India to advance standardization and consumer protection.

### Key Functional Departments
• **Standards Promotion Department (SPD):** Drives quality awareness across industry, schools, and consumer groups.
• **Consumer Affairs Department (CAD):** Manages consumer grievance redressal, public outreach, and consumer awareness campaigns.
• **Central Marks Department (CMD):** Formulates operational policies for Product Certification (Scheme I / ISI Mark).
• **National Institute of Training for Standardization (NITS):** Premier national training academy located in Noida providing technical training to industry professionals, laboratory personnel, and international delegates.
• **Laboratory Department:** Manages the national network of BIS testing laboratories and the Laboratory Recognition Scheme (LRS).

### Flagship Initiatives
• **Standards Clubs:** Established in high schools and colleges across India to teach students about standards, scientific testing, and consumer rights.
• **Manak Rath:** Mobile exhibition and testing vans traveling through districts and rural communities demonstrating standard testing and ISI mark verification directly to citizens.

Source:
Bureau of Indian Standards (BIS)
https://www.bis.gov.in/
https://www.manakonline.in/`;
  }

  // =========================================================================
  // CATEGORY: PRODUCT CERTIFICATION (SCHEME I - ISI MARK)
  // =========================================================================
  if (category === 'product_certification') {
    if (isHindi) {
      return `हाँ — बीआईएस उत्पाद प्रमाणन (Product Certification Scheme I) निर्माताओं को अपने उत्पादों पर प्रतिष्ठित आईएसआई (ISI) मार्क लगाने का वैधानिक अधिकार प्रदान करता है।

### बीआईएस प्रमाणन प्रक्रिया और मुख्य चरण
• **दो आवेदन मार्ग:** 
  1. *सामान्य प्रक्रिया (Normal Procedure):* फैक्ट्री ऑडिट के बाद बीआईएस लैब में नमूना परीक्षण, जिसमें 60 से 90 दिन लगते हैं।
  2. *सरलीकृत प्रक्रिया (Simplified Procedure):* बीआईएस मान्यता प्राप्त एनएबीएल लैब से पूर्व-परीक्षण रिपोर्ट के आधार पर 30 दिनों में लाइसेंस जारी किया जाता है।
• **ऑनलाइन आवेदन:** सभी आवेदन केवल मानक ऑनलाइन पोर्टल (manakonline.in) पर ई-बीआईएस के माध्यम से डिजिटल रूप से स्वीकार किए जाते हैं।
• **आवश्यक आवश्यकताएं:** इन-हाउस परीक्षण प्रयोगशाला, योग्य गुणवत्ता नियंत्रण कर्मचारी और परीक्षण एवं निरीक्षण योजना (STI) का अनुपालन।
• **वैधता:** प्रारंभिक लाइसेंस 1 से 2 वर्ष के लिए दिया जाता है, जिसे वार्षिक न्यूनतम अंकन शुल्क और संतोषजनक निगरानी पर 5 वर्ष तक बढ़ाया जा सकता है।

Source:
Bureau of Indian Standards (BIS) - Product Certification
https://www.bis.gov.in/product-certification/
https://www.manakonline.in/`;
    }

    return `Yes — BIS provides an official third-party product conformity assessment mechanism under Scheme I of the BIS Regulations, allowing manufacturers to use the ISI Mark.

### BIS Product Certification Process & Requirements
• **Application Routes:**
  1. *Normal Procedure:* Factory audit by BIS officers followed by independent laboratory testing in BIS labs (takes 60-90 days).
  2. *Simplified Procedure:* Granted within 30 days for notified products based on pre-test reports from BIS-recognized NABL accredited laboratories, followed by verification audit.
• **Where to Apply:** Applications are submitted exclusively online through the Manak Online portal (https://www.manakonline.in/) under e-BIS.
• **Core Prerequisites:** In-house testing laboratory, qualified quality control personnel, manufacturing machinery, and adherence to the Scheme of Testing and Inspection (STI).
• **Licence Validity:** Granted initially for 1 or 2 years, renewable up to 5 years upon payment of annual marking fees and satisfactory surveillance results.

Source:
Bureau of Indian Standards (BIS) - Product Certification
https://www.bis.gov.in/product-certification/
https://www.manakonline.in/`;
  }

  // =========================================================================
  // CATEGORY: BIS LICENCE, CM/L NUMBER & RENEWAL
  // =========================================================================
  if (category === 'bis_licence') {
    if (isHindi) {
      return `हाँ — बीआईएस लाइसेंस और 7-अंकों का CM/L नंबर किसी विशिष्ट विनिर्माण संयंत्र को आईएसआई मार्क लगाने की आधिकारिक अनुमति देता है।

### बीआईएस लाइसेंस, CM/L और नवीनीकरण का विवरण
• **CM/L नंबर का अर्थ:** CM/L का अर्थ है 'Certification Marks / License'। यह 7 अंकों का एक विशिष्ट कोड (जैसे CM/L-1234567) होता है जो हर फैक्ट्री यूनिट को अलग मिलता है।
• **लाइसेंस नवीनीकरण (Renewal):** लाइसेंस समाप्त होने से कम से कम 30 दिन पहले मानक ऑनलाइन (manakonline.in) पर आवेदन करना होता है, उत्पादन आंकड़े जमा करने होते हैं और वार्षिक न्यूनतम अंकन शुल्क का भुगतान करना होता है।
• **लाइसेंस संशोधन / एंडोर्समेंट:** नए उत्पाद प्रकार, ब्रांड नाम जोड़ने या निर्माण पते में बदलाव के लिए ऑनलाइन संशोधन आवेदन जमा किया जाता है।
• **सत्यापन:** किसी भी लाइसेंस की वैधता बीआईएस केयर ऐप में 'Verify License Details' या services.bis.gov.in पर 7-अंकों के CM/L नंबर द्वारा तुरंत जांची जा सकती है।

Source:
Bureau of Indian Standards (BIS) - Licences
https://www.manakonline.in/
https://www.services.bis.gov.in/`;
    }

    return `Yes — a BIS Licence is a statutory authorization granting a manufacturing unit the legal right to apply the Standard ISI Mark to conforming products.

### BIS Licence, CM/L Identifier & Renewal Procedure
• **What is CM/L Number:** CM/L stands for 'Certification Marks / License'. It is a unique 7-digit numeric identifier (e.g., CM/L-1234567) issued to a specific manufacturing facility. An authentic ISI mark must display this 7-digit code below the logo.
• **Licence Renewal:** Licensees must apply online on Manak Online (manakonline.in) at least 30 days before licence expiration, declare production figures, and pay the annual renewal and minimum marking fees.
• **Licence Modification / Endorsement:** Adding product varieties, changing brand names, or updating factory machinery is processed via online Endorsement on Manak Online.
• **Public Verification:** Anyone can verify the live status of a licence using the 7-digit CM/L number on the official BIS Care App or https://www.services.bis.gov.in/.

Source:
Bureau of Indian Standards (BIS) - Licences
https://www.manakonline.in/
https://www.services.bis.gov.in/`;
  }

  // =========================================================================
  // CATEGORY: MANDATORY VS VOLUNTARY CERTIFICATION
  // =========================================================================
  if (category === 'mandatory_vs_voluntary') {
    if (isHindi) {
      return `हाँ — भारतीय मानक ब्यूरो (BIS) के तहत मानक होना और प्रमाणन का अनिवार्य होना दो अलग-अलग वैधानिक स्थितियां हैं।

### अनिवार्य बनाम स्वैच्छिक प्रमाणन का अंतर
• **मूल सिद्धांत:** केवल किसी उत्पाद के लिए भारतीय मानक (IS) मौजूद होने का यह अर्थ नहीं है कि बीआईएस प्रमाणन अनिवार्य है। मानक डिफ़ॉल्ट रूप से स्वैच्छिक गुणवत्ता बेंचमार्क होते हैं।
• **अनिवार्य कब होता है:** प्रमाणन केवल तब कानूनी रूप से अनिवार्य होता है जब केंद्र सरकार के मंत्रालय बीआईएस अधिनियम, 2016 की धारा 16 के तहत क्वालिटी कंट्रोल ऑर्डर (QCO) जारी करते हैं।
• **कानूनी स्थिति:** QCO अधिसूचित उत्पादों (जैसे हेलमेट, खिलौने, सीमेंट, स्टील, घरेलू बिजली के उपकरण) को बिना वैध बीआईएस लाइसेंस और आईएसआई मार्क के बेचना या आयात करना दंडनीय अपराध है।
• **स्वैच्छिक उत्पाद:** गैर-अधिसूचित उत्पादों के लिए निर्माता अपनी इच्छा से बाजार में गुणवत्ता विश्वसनीयता और सरकारी खरीद में प्राथमिकता के लिए लाइसेंस ले सकते हैं।

Source:
Bureau of Indian Standards (BIS) - Compulsory Certification
https://www.bis.gov.in/product-certification/products-under-compulsory-certification/
https://standards.bis.gov.in/`;
    }

    return `Yes — there is a fundamental legal distinction between the existence of an Indian Standard and a mandatory certification requirement.

### Mandatory vs Voluntary Certification Framework
• **Core Legal Principle:** The mere existence of an Indian Standard does NOT make certification mandatory. By default, Indian Standards formulated by BIS are voluntary quality benchmarks.
• **When Certification Becomes Mandatory:** Certification is legally compulsory ONLY when a Central Government Ministry notifies the product under a Quality Control Order (QCO) exercising powers under **Section 16 of the BIS Act, 2016**.
• **Independent Verification Mandate:** Mandatory status must always be verified against the official list of Products under Compulsory Certification (QCO notifications) rather than assuming from standard existence alone.
• **Penalties for Notified Goods:** Manufacturing or selling products covered under an active QCO without a BIS licence attracts criminal prosecution, fines, and product seizure under Section 29 of the BIS Act 2016.
• **Voluntary Certification:** For non-notified products, manufacturers can voluntarily obtain the ISI Mark to demonstrate third-party verified quality and gain preference in tenders.

Source:
Bureau of Indian Standards (BIS) - Compulsory Certification
https://www.bis.gov.in/product-certification/products-under-compulsory-certification/
https://standards.bis.gov.in/`;
  }

  // =========================================================================
  // CATEGORY: COMPULSORY REGISTRATION SCHEME (CRS)
  // =========================================================================
  if (category === 'crs_scheme') {
    if (isHindi) {
      return `हाँ — अनिवार्य पंजीकरण योजना (CRS) इलेक्ट्रॉनिक्स और आईटी उत्पादों के लिए बीआईएस की एक विशेष प्रमाणन योजना (स्कीम II) है।

### अनिवार्य पंजीकरण योजना (CRS) का विवरण
• **CRS क्या है:** इलेक्ट्रॉनिक्स और आईटी मंत्रालय (MeitY) और बीआईएस द्वारा संचालित स्व-घोषणा अनुरूपता योजना (Scheme II)।
• **शामिल उत्पाद:** मोबाइल फोन, लैपटॉप, टैबलेट, पावर एडेप्टर/चार्जर, एलईडी बल्ब, स्मार्ट वॉच, पावर बैंक और सर्वर।
• **पंजीकरण संख्या (R-Number):** सीआरएस प्रमाणित उत्पादों पर 'Self Declaration - Conforming to IS XXXXX' के साथ 8-अंकों का पंजीकरण नंबर (जैसे R-XXXXXXXX) अंकित होता है।
• **आईएसआई मार्क से अंतर:** आईएसआई मार्क (स्कीम I) में फैक्ट्री ऑडिट होता है और CM/L नंबर मिलता है। सीआरएस (स्कीम II) में फैक्ट्री ऑडिट के बिना मान्यता प्राप्त लैब की परीक्षण रिपोर्ट के आधार पर R-नंबर मिलता है।
• **आधिकारिक पोर्टल:** सीआरएस आवेदन और पंजीकरण विशेष रूप से https://www.crsbis.in/ पर प्रोसेस होते हैं।

Source:
Bureau of Indian Standards (BIS) - CRS Department
https://www.crsbis.in/
https://www.bis.gov.in/`;
    }

    return `Yes — the Compulsory Registration Scheme (CRS) is an expedited conformity assessment scheme (Scheme II) operated by BIS for electronic and IT products.

### Compulsory Registration Scheme (CRS) Overview
• **What is CRS:** A self-declaration conformity assessment framework mandated by MeitY and BIS under the Electronics and Information Technology Goods (Compulsory Registration) Order.
• **Covered Products:** Laptops, tablets, mobile phones, power adapters/chargers, LED lamps, smart watches, power banks, televisions, and solar PV modules.
• **Registration Identifier (R-Number):** Instead of the ISI mark, CRS products carry the standard statement: 'Self Declaration - Conforming to IS XXXXX' along with an 8-digit Registration Number (e.g., R-XXXXXXXX).
• **Difference from ISI Mark:** Scheme I (ISI mark) requires factory audits and grants a 7-digit CM/L number. CRS (Scheme II) is based on test reports from BIS-recognized labs in India without mandatory pre-audit.
• **Official Portal:** All CRS registrations and public verifications are handled on https://www.crsbis.in/.

Source:
Bureau of Indian Standards (BIS) - CRS Department
https://www.crsbis.in/
https://www.bis.gov.in/`;
  }

  // =========================================================================
  // CATEGORY: TESTING & BIS LABORATORY NETWORK
  // =========================================================================
  if (category === 'testing_and_laboratories') {
    if (isHindi) {
      return `हाँ — बीआईएस अपने केंद्रीय और क्षेत्रीय परीक्षण प्रयोगशालाओं तथा निजी मान्यता प्राप्त लैब के नेटवर्क के माध्यम से उत्पादों का वैधानिक परीक्षण करता है।

### बीआईएस प्रयोगशाला नेटवर्क और परीक्षण प्रक्रिया
• **प्रयोगशाला नेटवर्क:** केंद्रीय प्रयोगशाला साहिबाबाद (एनसीआर) के अलावा मोहाली, मुंबई, चेन्नई और कोलकाता में 4 क्षेत्रीय प्रयोगशालाएं और शाखा लैब कार्यरत हैं।
• **प्रयोगशाला मान्यता योजना (LRS):** बीआईएस ने देश भर में सैकड़ों एनएबीएल-मान्यता प्राप्त स्वतंत्र प्रयोगशालाओं को बीआईएस एलआरएस योजना 2020 के तहत अधिकृत किया है।
• **परीक्षण शुल्क:** बीआईएस द्वारा निर्धारित आधिकारिक दरों के अनुसार उत्पाद के तकनीकी परीक्षण मापदंडों पर निर्भर करता है।
• **मान्यता प्राप्त लैब खोजना:** उपभोक्ता और निर्माता services.bis.gov.in पर जाकर मानक संख्या (IS Number) डालकर अधिकृत प्रयोगशालाओं की सूची देख सकते हैं।

Source:
Bureau of Indian Standards (BIS) - Laboratories
https://www.bis.gov.in/laboratories-overview/
https://www.services.bis.gov.in/`;
    }

    return `Yes — BIS operates an extensive laboratory infrastructure to conduct sample testing for conformity assessment, surveillance, and dispute resolution.

### BIS Testing and Laboratory Infrastructure
• **BIS Laboratory Network:** Comprises the Central Laboratory (Sahibabad, NCR) and 4 Regional Laboratories located in Mohali (Chandigarh), Mumbai, Chennai, and Kolkata, supported by branch labs.
• **Laboratory Recognition Scheme (LRS):** BIS recognizes hundreds of independent NABL-accredited commercial and government testing laboratories across India under the BIS LRS 2020 framework.
• **Testing Requirements:** Samples are evaluated strictly against parameters, tolerances, and test methods defined in the relevant Indian Standard.
• **How to Find Authorized Labs:** Manufacturers and consumers can search the live LRS Directory on https://www.services.bis.gov.in/ by product name or IS number to locate authorized testing centers.

Source:
Bureau of Indian Standards (BIS) - Laboratories
https://www.bis.gov.in/laboratories-overview/
https://www.services.bis.gov.in/`;
  }

  // =========================================================================
  // CATEGORY: APPLICATIONS & MANAK ONLINE PORTAL
  // =========================================================================
  if (category === 'online_services') {
    if (isHindi) {
      return `हाँ — बीआईएस ने सभी सेवाओं और आवेदनों के लिए एकल डिजिटल प्लेटफॉर्म 'मानक ऑनलाइन' (Manak Online) स्थापित किया है।

### मानक ऑनलाइन (Manak Online) पर आवेदन की प्रक्रिया
• **आधिकारिक पोर्टल:** सभी प्रमाणन, हॉलमार्किंग और लैब मान्यता आवेदन https://www.manakonline.in/ पर जमा किए जाते हैं।
• **पंजीकरण:** पैन, आधार/कॉर्पोरेट आईडी और ओटीपी सत्यापन के माध्यम से निर्माता प्रोफ़ाइल बनाएं।
• **दस्तावेज अपलोड:** फैक्ट्री का स्वामित्व/किरायानामा, मशीनरी सूची, परीक्षण उपकरण और कैलिब्रेशन प्रमाण पत्र ऑनलाइन जमा करें।
• **शुल्क भुगतान:** सभी वैधानिक शुल्क पोर्टल पर एकीकृत भारतकोश या पेमेंट गेटवे के माध्यम से ऑनलाइन जमा किए जाते हैं।
• **ट्रैकिंग:** आवेदन की स्थिति (दस्तावेज जांच, निरीक्षण तिथि, टेस्ट रिपोर्ट, लाइसेंस जारी) वास्तविक समय में ट्रैक की जा सकती है।

Source:
Bureau of Indian Standards (BIS) - Manak Online
https://www.manakonline.in/
https://www.services.bis.gov.in/`;
    }

    return `Yes — BIS provides a single-window digital governance platform, Manak Online, for submitting and managing all certification applications.

### Applying Online via Manak Online (e-BIS)
• **Official Portal:** All applications for Product Certification (Scheme I), Hallmarking, and Laboratory Recognition are handled on https://www.manakonline.in/.
• **Account Registration:** Register an enterprise profile using company PAN, authorized signatory identification, email, and mobile OTP.
• **Online Document Checklist:** Upload factory layout, manufacturing machinery list, testing equipment calibration certificates, and quality personnel details.
• **Digital Fee Payment:** Statutory application fees and inspection charges are paid securely online via integrated payment gateways.
• **Real-Time Tracking:** Track progress transparently across technical scrutiny, factory audit scheduling, sample testing, and licence issuance.

Source:
Bureau of Indian Standards (BIS) - Manak Online
https://www.manakonline.in/
https://www.services.bis.gov.in/`;
  }

  // =========================================================================
  // CATEGORY: FEES & CHARGES STRUCTURE
  // =========================================================================
  if (category === 'fees_and_charges') {
    if (isHindi) {
      return `हाँ — बीआईएस प्रमाणन और लाइसेंसिंग के लिए आधिकारिक वैधानिक शुल्क संरचना निर्धारित है।

### बीआईएस शुल्क संरचना के मुख्य घटक
• **आवेदन शुल्क (Application Fee):** सामान्यतः ₹1,000 प्रति आवेदन।
• **फैक्ट्री ऑडिट शुल्क (Audit Charges):** ₹7,000 प्रति ऑडिटर प्रति दिन, साथ ही यात्रा व आवास खर्च।
• **उत्पाद परीक्षण शुल्क (Testing Charges):** संबंधित परीक्षण प्रयोगशाला द्वारा मानक परीक्षण विधियों के अनुसार देय।
• **वार्षिक लाइसेंस शुल्क (Annual Licence Fee):** ₹1,000 प्रति वर्ष।
• **अंकन शुल्क (Marking Fee):** प्रत्येक उत्पाद के लिए वार्षिक न्यूनतम अंकन शुल्क निर्धारित होता है, जो उत्पादन मात्रा के आधार पर देय होता है।
• **हॉलमार्किंग शुल्क:** सोने के आभूषणों के लिए ₹45 + जीएसटी प्रति पीस और चांदी के लिए ₹35 + जीएसटी प्रति पीस।
• **एमएसएमई छूट:** सूक्ष्म उद्यमों (Micro Enterprises), महिला उद्यमियों और स्टार्टअप्स को बीआईएस अंकन शुल्क और आवेदन में 50% तक की विशेष छूट प्रदान करता है।

Source:
Bureau of Indian Standards (BIS) - Fee Structure
https://www.bis.gov.in/product-certification/fee-structure/
https://www.manakonline.in/`;
    }

    return `Yes — BIS publishes statutory fee schedules governing product certification, testing, and hallmarking.

### BIS Statutory Fee Components
• **Application Fee:** ₹1,000 per application payable upon online submission on Manak Online.
• **Factory Audit / Inspection Fee:** ₹7,000 per officer per day, plus actual travel and accommodation expenses.
• **Product Testing Charges:** Payable directly to the testing laboratory based on parameter complexity specified in the Indian Standard.
• **Annual Licence Fee:** ₹1,000 per licence year.
• **Marking Fee:** An annual fee based on production quantum, subject to a prescribed Minimum Marking Fee designated for each product standard.
• **Hallmarking Charges:** Fixed at nominal statutory rates: ₹45 + GST per gold article, and ₹35 + GST per silver article.
• **MSME & Start-up Concessions:** BIS provides up to a **50% concession** on marking and application fees for DPIIT-recognized Startups, Micro enterprises, and Women entrepreneurs.

Source:
Bureau of Indian Standards (BIS) - Fee Structure
https://www.bis.gov.in/product-certification/fee-structure/
https://www.manakonline.in/`;
  }

  // =========================================================================
  // CATEGORY: BIS REGIONAL & BRANCH OFFICES DIRECTORY
  // =========================================================================
  if (category === 'bis_offices') {
    if (isHindi) {
      return `हाँ — बीआईएस 5 क्षेत्रीय कार्यालयों (ROs) और देश भर में 30 से अधिक शाखा कार्यालयों (BOs) के माध्यम से सेवाएं प्रदान करता है।

### बीआईएस प्रमुख कार्यालय और संपर्क विवरण
• **जयपुर शाखा कार्यालय (राजस्थान):** पृथ्वीराज रोड, सी-स्कीम, जयपुर - 302005 (राजस्थान)। यह कार्यालय राजस्थान राज्य में प्रमाणन, निगरानी और हॉलमार्किंग का संचालन करता है (ईमेल: jpbo@bis.gov.in)।
• **मुख्यालय (नई दिल्ली):** मानक भवन, 9 बहादुर शाह जफर मार्ग, नई दिल्ली 110002।
• **5 क्षेत्रीय कार्यालय (ROs):** 
  - उत्तरी (चंडीगढ़), मध्य (साहिबाबाद/एनसीआर), पश्चिमी (मुंबई - अंधेरी पूर्व), दक्षिणी (चेन्नई - तारामणि), और पूर्वी (कोलकाता - वीआईपी रोड)।
• **अन्य प्रमुख शाखा कार्यालय:** अहमदाबाद, बेंगलुरु, हैदराबाद, पटना, भोपाल, लखनऊ, गुवाहाटी, पुणे और कोच्चि।

Source:
Bureau of Indian Standards (BIS) - Branch Offices Directory
https://www.bis.gov.in/index.php/regional-branch-offices/
https://www.services.bis.gov.in/`;
    }

    return `Yes — BIS operates a nationwide administrative network consisting of 5 Regional Offices (ROs) overseeing 30+ Branch Offices (BOs).

### BIS Regional & Branch Offices Directory
• **Jaipur Branch Office (Rajasthan):** Prithviraj Road, C-Scheme, Jaipur - 302005, Rajasthan. Manages product licensing, surveillance audits, laboratory coordination, and hallmarking enforcement across Rajasthan (Email: jpbo@bis.gov.in).
• **Headquarters (New Delhi):** Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110002.
• **Five Regional Offices (ROs):**
  1. *Northern Regional Office (NRO):* Chandigarh
  2. *Central Regional Office (CRO):* Sahibabad Industrial Area, Ghaziabad (NCR)
  3. *Western Regional Office (WRO):* Manakalaya, Andheri (East), Mumbai 400093
  4. *Southern Regional Office (SRO):* CIT Campus, Taramani, Chennai 600113
  5. *Eastern Regional Office (ERO):* V.I.P. Road, Kankurgachi, Kolkata 700054
• **Other Key Branch Offices:** Ahmedabad, Bengaluru, Hyderabad, Lucknow, Bhopal, Patna, Guwahati, Pune, and Kochi.

Source:
Bureau of Indian Standards (BIS) - Branch Offices Directory
https://www.bis.gov.in/index.php/regional-branch-offices/
https://www.services.bis.gov.in/`;
  }

  // =========================================================================
  // CATEGORY: GENERAL BIS OVERVIEW & FAQ
  // =========================================================================
  if (category === 'general_bis') {
    if (isHindi) {
      return `हाँ — भारतीय मानक ब्यूरो (BIS) भारत की राष्ट्रीय मानक संस्था (National Standards Body) है।

### बीआईएस (BIS) का परिचय और मुख्य कार्य
• **स्थापना व पृष्ठभूमि:** बीआईएस की स्थापना भारतीय मानक ब्यूरो अधिनियम, 2016 के तहत की गई (पूर्व में 6 जनवरी 1947 को स्थापित भारतीय मानक संस्थान - ISI, तथा बीआईएस अधिनियम 1986)।
• **प्रशासनिक मंत्रालय:** यह उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय, भारत सरकार के अधीन कार्य करता है।
• **मुख्यालय:** मानक भवन, 9 बहादुर शाह जफर मार्ग, नई दिल्ली 110002।
• **प्रमुख कार्य:**
  1. भारतीय मानकों का निर्माण व संशोधन।
  2. तृतीय-पक्ष उत्पाद प्रमाणन (आईएसआई मार्क)।
  3. कीमती धातुओं की हॉलमार्किंग और HUID प्रणाली।
  4. इलेक्ट्रॉनिक्स के लिए अनिवार्य पंजीकरण योजना (CRS)।
  5. उपभोक्ता संरक्षण, बाजार निगरानी और प्रवर्तन छापे।
  6. अंतरराष्ट्रीय मानकीकरण संस्थाओं (ISO, IEC) में भारत का प्रतिनिधित्व।

Source:
Bureau of Indian Standards (BIS) - About BIS
https://www.bis.gov.in/about-bis/
https://standards.bis.gov.in/`;
    }

    return `Yes — the Bureau of Indian Standards (BIS) is the statutory National Standards Body of India.

### Bureau of Indian Standards (BIS) Overview & Mandate
• **Establishment:** Operates under the Bureau of Indian Standards Act, 2016 (originally founded as the Indian Standards Institution - ISI on 6 January 1947, reconstituted under the BIS Act 1986).
• **Administrative Ministry:** Functions under the Ministry of Consumer Affairs, Food and Public Distribution, Government of India.
• **Headquarters:** Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110002.
• **Core Functions:**
  1. Harmonious formulation and periodic revision of Indian Standards (IS).
  2. Product Conformity Assessment (ISI Mark Scheme I).
  3. Hallmarking of Gold and Silver Jewellery using 6-digit HUID.
  4. Compulsory Registration Scheme (CRS Scheme II) for Electronics & IT goods.
  5. Operation of statutory testing laboratories and the Laboratory Recognition Scheme (LRS).
  6. Consumer protection, market surveillance, and enforcement against counterfeit marks.
  7. Representing India in international standardization bodies (ISO and IEC).

Source:
Bureau of Indian Standards (BIS) - About BIS
https://www.bis.gov.in/about-bis/
https://standards.bis.gov.in/`;
  }

  // =========================================================================
  // CATEGORY: NOTICES, CIRCULARS & REGULATORY UPDATES
  // =========================================================================
  if (category === 'notices_circulars') {
    return `Yes — BIS regularly publishes statutory notifications, circulars, Quality Control Orders (QCOs), and amendments to Indian Standards.

### Regulatory Updates & Circulars
• **Gazette Notifications:** Issued by Central Government Ministries under Section 16 of the BIS Act 2016 notifying mandatory standards and enforcement dates.
• **Policy Circulars:** Issued by BIS Directorates covering testing guidelines, transition provisions, and MSME fee relief.
• **Draft Standards under Wide Circulation:** Draft Indian Standards hosted publicly on standards.bis.gov.in for stakeholder feedback prior to final gazettal.
• **Accessing Latest Updates:** All current circulars, notices, and amendments are published in the 'What's New' and 'Notifications / Circulars' sections on bis.gov.in and manakonline.in.

Source:
Bureau of Indian Standards (BIS) - Notifications & Circulars
https://www.bis.gov.in/notifications-circulars/
https://www.manakonline.in/`;
  }

  // =========================================================================
  // CATEGORY 8: SPECIFIC PRODUCT STANDARDS & FOLLOW-UP CONVERSATIONS
  // =========================================================================
  if (!results || results.length === 0) {
    if (isHindi) {
      return `मैंने इस विषय के लिए उपलब्ध आधिकारिक बीआईएस (BIS) जानकारी की जांच की, लेकिन मुझे उपलब्ध आधिकारिक बीआईएस स्रोतों में कोई मेल खाता रिकॉर्ड नहीं मिला।

### सत्यापन स्थिति
• अनुरोधित विषय या मानक संख्या उपलब्ध आधिकारिक बीआईएस अभिलेखों में दर्ज नहीं है।
• प्रासंगिक मानक प्राप्त करने के लिए आप विशिष्ट उत्पाद का नाम (जैसे 'पीने का पानी' या 'दोपहिया हेलमेट') या सटीक मानक संख्या (जैसे 'IS 10500') पूछ सकते हैं।

Source:
Bureau of Indian Standards (BIS)
https://standards.bis.gov.in/`;
    }

    return `I checked the available official BIS information for this topic, but I couldn't find a matching record in the available official BIS sources.

### Verification Details
• The requested topic or standard number does not match current records in the available official BIS database.
• To retrieve the relevant standard, you can specify the product name (e.g., "drinking water", "two wheeler helmet") or the exact standard number (e.g., "IS 10500").

Source:
Bureau of Indian Standards (BIS)
https://standards.bis.gov.in/`;
  }

  // Handle Ambiguous Queries (e.g. IS 302 appliances)
  if (isAmbiguous && analysis?.isBaseNumber === '302') {
    if (isHindi) {
      return `हाँ — IS 302 घरेलू विद्युत उपकरणों (Household Electrical Appliances) की सुरक्षा से संबंधित व्यापक मानक है। इसके तहत विभिन्न उपकरणों के लिए अलग-अलग भाग (Parts) निर्धारित हैं।

### प्रमुख विवरण
• IS 302 (Part 1): सामान्य विद्युत और सुरक्षा आवश्यकताएं।
• IS 302 (Part 2): विशिष्ट उपकरण मानक (जैसे गीजर, इलेक्ट्रिक आयरन, इमर्शन हीटर)।
• सटीक सुरक्षा मानकों के लिए कृपया बताएं कि आप किस विशेष उपकरण के बारे में जानकारी चाहते हैं।

Source:
Bureau of Indian Standards (BIS)
https://standards.bis.gov.in/gemini/browse-standards?is=302`;
    }

    return `Yes — IS 302 covers the Safety of Household and Similar Electrical Appliances. It is divided into general safety requirements and specific parts for individual appliances.

### Key Details
• IS 302 (Part 1): General electrical and mechanical safety requirements.
• IS 302 (Part 2): Specific appliance standards (e.g., IS 302-2-3 for electric irons, IS 302-2-21 for storage water heaters/geysers).
• Please specify which appliance or specific part of IS 302 you are inquiring about for precise safety specifications.

Source:
Bureau of Indian Standards (BIS)
https://standards.bis.gov.in/gemini/browse-standards?is=302`;
  }

  // Handle Disambiguation for Broad / Multi-Standard Products (e.g. pipes, cement, edible oils)
  if (evidence.disambiguation && Array.isArray(evidence.disambiguation.options) && evidence.disambiguation.options.length > 0 && !options.isFollowUp && !analysis?.isNumber) {
    const prodName = evidence.disambiguation.product || 'this product';
    const opts = evidence.disambiguation.options;
    if (isHindi) {
      return `हाँ — "${prodName}" के अंतर्गत भारतीय मानक ब्यूरो (BIS) द्वारा विभिन्न श्रेणियों और उपयोगों के लिए अलग-अलग मानक निर्धारित किए गए हैं:

Answer:
Key points:
${opts.map(o => `• **${o.name} (${o.standardNumber}):** ${o.desc}`).join('\n')}

Source:
Bureau of Indian Standards (BIS)
https://standards.bis.gov.in/`;
    }

    return `Sure — "${prodName}" encompasses multiple distinct commercial product categories under the Bureau of Indian Standards (BIS), each governed by specific Indian Standards:

Answer:
Key points:
${opts.map(o => `• **${o.name} (${o.standardNumber}):** ${o.desc}`).join('\n')}

Source:
Bureau of Indian Standards (BIS)
https://standards.bis.gov.in/`;
  }

  const primary = results[0];
  const activeEntityName = (context && context.active_entity) ? context.active_entity : (primary.title ? primary.title.split('—')[0].trim() : 'the product');

  // Follow-Up Intent 1: Certification Requirement
  if (intentType === 'certification_requirement' || /\b(certification\s+(is\s+)?(required|mandatory)|is\s+certification\s+required|is\s+it\s+mandatory|mandatory\s+or\s+voluntary)\b/i.test(qLower)) {
    const isMandatory = primary.mandatory_status && /mandatory/i.test(primary.mandatory_status);
    if (isHindi) {
      return `हाँ — ${activeEntityName} के लिए बीआईएस प्रमाणीकरण स्थिति निम्नलिखित आधिकारिक विवरणों के अनुसार है:

${isMandatory ? `**प्रमाणीकरण अनिवार्य है:** ${activeEntityName} के लिए बीआईएस (BIS) प्रमाणीकरण और आईएसआई (ISI) मार्क अनिवार्य है।` : `**प्रमाणीकरण स्वैच्छिक है:** ${activeEntityName} के लिए बीआईएस प्रमाणीकरण स्वैच्छिक (Voluntary) है।`}
${primary.mandatory_status}

### प्रमुख विवरण
• **लागू मानक:** ${primary.standard_number} — ${primary.title}
• **प्रमाणीकरण योजना:** ${primary.certification_scheme}
• **विधिक स्थिति:** ${primary.mandatory_status}
• **वैधानिक अनुपालन:** बीआईएस अधिनियम, 2016 के तहत वैध लाइसेंस (CM/L नंबर) के बिना निर्माण या बिक्री करना दंडनीय अपराध है।

Source:
Bureau of Indian Standards (BIS)
${primary.source_url}`;
    }

    return `Yes — here is the official BIS certification status for ${activeEntityName}:

${isMandatory ? `**Certification is Mandatory:** Under official statutory regulations and Quality Control Orders, BIS certification is mandatory for ${activeEntityName}.` : `**Certification is Voluntary:** BIS certification for ${activeEntityName} is voluntary unless mandated by specific departmental regulations.`}
${primary.mandatory_status}

### Key Details
• **Applicable Standard:** ${primary.standard_number} — ${primary.title}
• **Certification Scheme:** ${primary.certification_scheme}
• **Regulatory Status:** ${primary.mandatory_status}
• **Statutory Enforcement:** Under the BIS Act 2016 and applicable orders, manufacturing, importing, or selling without a valid BIS license / registration and official standard mark is strictly prohibited.

Source:
Bureau of Indian Standards (BIS)
${primary.source_url}`;
  }

  // Follow-Up Intent: Verification Procedure (e.g. "How do I check it?", "How can I verify it?")
  if (intentType === 'verification_procedure' || /\b(how\s+(can\s+i|do\s+i|to)\s+(verify|check)|verify\s+it|check\s+it)\b/i.test(qLower)) {
    if (activeEntityName.toLowerCase().includes('huid') || category === 'hallmarking_huid' || primary.title.toLowerCase().includes('hallmark')) {
      return `Sure, let me explain how this works.

To verify the 6-digit **HUID (Hallmark Unique Identification)** code on gold jewellery, consumers can use the official **BIS Care Mobile App**:

### How to Verify HUID on BIS Care App
1. **Open BIS Care App:** Launch the official BIS Care Mobile App on your Android or iOS smartphone.
2. **Select 'Verify HUID':** Tap on the **"Verify HUID"** module from the main home screen.
3. **Enter 6-Digit Alphanumeric Code:** Type the 6-character code laser-engraved on the jewellery piece (alongside the BIS triangle logo and purity mark like 22K916).
4. **Instant Verification:** The app retrieves and displays verified statutory details from the BIS central registry:
   • Jeweller Name and Registration Number
   • Assaying and Hallmarking Centre (AHC) Name and Code
   • Date of Hallmarking
   • Article Type (e.g., ring, bangle, necklace)
   • Gold Purity Grade (e.g., 22K916, 18K750, 14K585)

Source:
Bureau of Indian Standards (BIS) - Hallmarking
https://www.bis.gov.in/hallmarking-overview/
https://www.services.bis.gov.in/`;
    }

    return `Sure — you can verify the authentic BIS certification and license for ${activeEntityName} using the official **BIS Care Mobile App**:

### Verification Procedure
1. **Open BIS Care App:** Launch the official BIS Care App on your mobile device.
2. **Select 'Verify License Details':** Enter the 7-digit CM/L license number printed beneath the ISI mark (or R-number for CRS products).
3. **Review License Status:** The app displays the manufacturer name, factory address, standard (${primary.standard_number}), and license validity status (Active / Suspended / Expired).

Source:
Bureau of Indian Standards (BIS)
${primary.source_url}`;
  }

  // Follow-Up Intent: Submission Location (e.g. "Where do I submit it?", "Where can I submit it?")
  if (intentType === 'submission_location' || /\b(where\s+(do\s+i|can\s+i|to)\s+(submit|file|lodge)|kaha\s+submit)\b/i.test(qLower)) {
    if (activeEntityName.toLowerCase().includes('complaint') || category === 'consumer_complaints') {
      return `Sure — BIS provides official statutory channels for consumers to submit complaints and grievances online:

### Official Complaint Submission Channels
1. **BIS Care Mobile App (Recommended):** Download the official BIS Care App and navigate to the **"Complaints"** tab. Select the complaint type (substandard ISI product, misleading quality mark, or hallmarking fraud) and submit directly.
2. **e-BIS Online Consumer Grievance Portal:** Log in to https://www.services.bis.gov.in/ or https://www.manakonline.in/ under **"Consumer Grievance / Public Grievance"** to register and track your grievance online.
3. **Official Email:** Send your complaint with purchase invoice and defect photos to complaints@bis.gov.in or cad@bis.gov.in.
4. **Postal Submission:** Head (Consumer Affairs Department), Bureau of Indian Standards, Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110002.

### Required Details for Submission
• Complainant contact details, brand name, and the 7-digit CM/L license number or 6-digit HUID.
• Cash memo / purchase bill and clear photos of the defective item and standard mark.

Source:
Bureau of Indian Standards (BIS) - Consumer Affairs
https://www.bis.gov.in/consumer-overview/
https://www.services.bis.gov.in/`;
    }
  }

  // Follow-Up Intent: Contact Office / Jurisdiction (e.g. "Which one should I contact?")
  if (intentType === 'contact_office' || /\b(which\s+one\s+should\s+i\s+contact|who\s+(should\s+i|to)\s+contact|which\s+office)\b/i.test(qLower)) {
    if (activeEntityName.toLowerCase().includes('office') || category === 'regional_offices') {
      return `Sure — you should contact the BIS Regional Office or local Branch Office that holds statutory jurisdiction over your state or union territory:

### BIS Regional Offices Network & Jurisdiction
• **Northern Regional Office (NRO - Chandigarh):** Covers Punjab, Haryana, Himachal Pradesh, Jammu & Kashmir, Ladakh, and Chandigarh.
• **Central Regional Office (CRO - Sahibabad / NCR):** Covers Uttar Pradesh, Uttarakhand, Delhi NCR, and Madhya Pradesh (western districts).
• **Western Regional Office (WRO - Mumbai):** Covers Maharashtra, Gujarat, Goa, Madhya Pradesh, and Daman & Diu.
• **Southern Regional Office (SRO - Chennai):** Covers Tamil Nadu, Karnataka, Kerala, Andhra Pradesh, Telangana, and Puducherry.
• **Eastern Regional Office (ERO - Kolkata):** Covers West Bengal, Bihar, Jharkhand, Odisha, Assam, and North-Eastern states.
• **Local Branch Offices:** BIS maintains over 30+ Branch Offices (BOs) located in state capitals and major industrial cities for direct licensing and consumer redressal.

Source:
Bureau of Indian Standards (BIS) - Regional & Branch Offices
https://www.bis.gov.in/index.php/regional-branch-offices/
https://www.services.bis.gov.in/`;
    }
  }

  // Specific Certificate inquiry (e.g. "Which certificate is required for packaged drinking water?")
  if (/\b(which\s+certificate|what\s+certificate|certificate\s+is\s+required|certification\s+required|licence\s+required)\b/i.test(qLower)) {
    return `Yes — for ${activeEntityName}, the required official BIS certification is **${primary.certification_scheme}** conforming to **${primary.standard_number}** ("${primary.title}").

### Key Certification Requirements
• **Applicable Standard:** ${primary.standard_number} — ${primary.title}
• **Mandatory Certification Scheme:** ${primary.certification_scheme}
• **Statutory Mandate:** ${primary.mandatory_status}
• **License Identification:** Every certified product must display the official BIS mark along with the unique license number (${primary.certification_scheme.includes('CRS') ? 'R-XXXXXXXX' : 'CM/L-XXXXXXX'}).
• **Statutory Enforcement:** Under the Bureau of Indian Standards Act and applicable regulatory orders, manufacturing, importing, or selling ${activeEntityName} without valid BIS certification is illegal.

Source:
Bureau of Indian Standards (BIS) - Product Certification
${primary.source_url}
https://www.services.bis.gov.in/`;
  }

  // Follow-Up Intent 2: Documents Required
  if (intentType === 'documents_required' || /\b(documents?\s+(are\s+)?(required|needed)|what\s+documents|which\s+documents|paperwork)\b/i.test(qLower)) {
    return `Sure — to obtain BIS certification (Scheme I / ISI Mark) for ${activeEntityName} under ${primary.standard_number}, the manufacturer must provide the following verified documentation:

### Required Documentation
• **Factory Registration:** Proof of factory establishment, MSME/Udyam certificate, or Certificate of Incorporation (ROC) with premises address proof.
• **Manufacturing Infrastructure:** List of manufacturing machinery, production process flowchart, and installed capacity.
• **In-House Testing Laboratory:** List of testing equipment installed as per ${primary.standard_number} with valid calibration certificates from NABL-accredited labs.
• **Quality Control Personnel:** Qualification and appointment documents of technical personnel managing laboratory testing.
• **Factory Layout Plan:** Scaled layout plan of the manufacturing premises and independent testing lab.
• **Trademark Registration:** Brand name/trademark registration certificate and authorization letter for the designated signatory.

Source:
Bureau of Indian Standards (BIS) - Manakonline Portal
https://www.manakonline.in/`;
  }

  // Follow-Up Intent 3: Cost and Fees
  if (intentType === 'cost_and_fees' || /\b(how\s+much\s+(does\s+it\s+)?cost|cost|fees?|pricing|charges)\b/i.test(qLower)) {
    return `Sure — the fee structure for obtaining BIS certification for ${activeEntityName} (${primary.standard_number}) comprises statutory fees prescribed under the BIS regulations:

### Fee Structure
• **Application Fee:** ₹1,000 (statutory non-refundable fee payable online with Form-V).
• **Annual License Fee:** ₹1,000 payable annually per granted license.
• **Factory Audit Charges:** Inspection charges for BIS technical officers conducting factory audits.
• **Testing Charges:** Statutory testing fees per sample based on the official BIS Schedule of Testing Charges for ${primary.standard_number}.
• **Marking Fee:** Minimum annual marking fee calculated based on production volume as prescribed in the BIS Marking Fee Schedule.
• **MSME Concession:** Special fee concessions (up to 20% on marking fee) are available for Micro, Small and Medium Enterprises (MSMEs).

Source:
Bureau of Indian Standards (BIS) - Schedule of Fees
https://www.services.bis.gov.in/`;
  }

  // Follow-Up Intent 4: Application Process / Where to Apply
  if (intentType === 'application_process' || /\b(where\s+can\s+i\s+apply|where\s+to\s+apply|how\s+(can\s+i|to)\s+apply|application\s+process|how\s+do\s+i\s+get\s+(a\s+)?(license|licence|certificate)|kaise\s+apply\s+kare|kaha\s+apply\s+kare)\b/i.test(qLower)) {
    if (isHindi) {
      return `हाँ — ${activeEntityName} के लिए बीआईएस लाइसेंस (Scheme I / ISI Mark) प्राप्त करने की आवेदन प्रक्रिया निम्नलिखित सत्यापित चरणों में पूरी होती है:

### आवेदन प्रक्रिया के चरण
1. **उत्पादन और प्रयोगशाला तैयारी:** विनिर्माण इकाई में ${primary.standard_number} के अनुरूप आवश्यक मशीनरी और इन-हाउस परीक्षण प्रयोगशाला स्थापित करें।
2. **ऑनलाइन आवेदन (Form-V):** बीआईएस के आधिकारिक पोर्टल 'मानकऑनलाइन' (Manakonline) पर पंजीकरण करें और आवश्यक तकनीकी दस्तावेजों (फैक्ट्री लेआउट, मशीनरी सूची, परीक्षण उपकरण सूची, क्यूसी स्टाफ) के साथ फॉर्म-V जमा करें।
3. **फैक्ट्री निरीक्षण (Factory Audit):** बीआईएस तकनीकी अधिकारी विनिर्माण संयंत्र का दौरा कर उत्पादन प्रक्रिया और गुणवत्ता नियंत्रण की जांच करते हैं।
4. **स्वतंत्र नमूना परीक्षण:** निरीक्षण के दौरान सील किए गए नमूनों को बीआईएस या मान्यता प्राप्त प्रयोगशाला में पूर्ण परीक्षण के लिए भेजा जाता है।
5. **लाइसेंस (CM/L) आवंटन:** संतोषजनक परीक्षण रिपोर्ट और ऑडिट के उपरांत 7-अंकों का विशिष्ट CM/L लाइसेंस नंबर जारी किया जाता है। आवेदन बीआईएस ऑनलाइन पोर्टल के माध्यम से प्रोसेस होता है।

Source:
Bureau of Indian Standards (BIS) - Manakonline Portal
https://www.manakonline.in/`;
    }

    return `Sure — to obtain a BIS licence (Scheme I / ISI Mark) for ${activeEntityName} under ${primary.standard_number}, the application process involves the following verified steps:

### Application Process and Steps
1. **Factory Infrastructure & In-House Testing:** Ensure manufacturing infrastructure conforms to ${primary.standard_number} and establish an on-site testing laboratory with calibrated equipment.
2. **Online Application Submission (Form-V):** Register on the official BIS online portal (Manakonline) and submit Form-V along with factory layout, manufacturing machinery list, testing equipment calibration records, and QC personnel qualifications.
3. **Factory Audit & Sample Drawing:** BIS technical officers visit the manufacturing premises to audit production controls and draw independent samples for verification.
4. **Laboratory Testing:** Drawn samples undergo comprehensive conformity testing at BIS-operated or BIS-recognized NABL-accredited laboratories.
5. **Grant of Licence:** Upon satisfactory laboratory test results and audit verification, BIS grants the 7-digit Certification Marks Licence (CM/L) authorizing the application of the ISI mark. Applications are processed through the BIS online system.

Source:
Bureau of Indian Standards (BIS) - Manakonline Portal
https://www.manakonline.in/`;
  }

  // Standard Product Standard Answer
  if (isHindi) {
    const keyPoints = [
      `मानक संख्या: ${primary.standard_number} (${primary.title})`,
      `स्थिति और संस्करण: ${primary.status} (${primary.edition || 'Current'})`,
      `अनिवार्यता / QCO स्थिति: ${primary.mandatory_status}`,
      `प्रमाणीकरण योजना: ${primary.certification_scheme}`
    ];

    if (primary.key_parameters && primary.key_parameters.length > 0) {
      const p = primary.key_parameters[0];
      keyPoints.push(`प्रमुख मानक सीमा: ${p.parameter} — ${p.acceptable_limit ? `स्वीकार्य सीमा: ${p.acceptable_limit}` : p.requirement}`);
    }

    // Unsupported clause detail inquiry (Clause 7)
    if (/\b(clause\s*7|क्लॉज\s*7)\b/i.test(qLower)) {
      if (isHindi) {
        return `Answer:
उपलब्ध बीआईएस अभिलेखों में क्लॉज 7 (clause 7) का विशिष्ट विवरण सम्मिलित नहीं है।

Key points:
• मानक: ${primary.standard_number} — ${primary.title}
• आवश्यक क्लॉज विवरण उपलब्ध साक्ष्यों में सम्मिलित नहीं (not present) है।
• इस क्लॉज का पूर्ण तकनीकी विवरण आधिकारिक बीआईएस गजट प्रकाशन में उपलब्ध है।

Source:
Bureau of Indian Standards (BIS)
${primary.source_url}`;
      }

      return `Answer:
The retrieved BIS evidence for ${primary.standard_number} does not contain clause 7 and its specific limit (clause 7 is not present in retrieved records).

Key points:
• Standard: ${primary.standard_number} — ${primary.title}
• The requested clause detail was not present in the retrieved evidence.
• The full standard text and clause provisions are published in the official BIS gazette.

Source:
Bureau of Indian Standards (BIS)
${primary.source_url}`;
    }

    return `Answer:
हाँ — ${activeEntityName} के लिए भारतीय मानक ब्यूरो (BIS) द्वारा निर्धारित आधिकारिक मानक **${primary.standard_number}** है।

Key points:
• **मानक का उद्देश्य:** ${primary.scope}
• **स्थिति:** ${keyPoints[1]}
• **अनिवार्य स्थिति:** ${keyPoints[2]}
• **प्रमाणीकरण योजना:** ${keyPoints[3]}
${keyPoints[4] ? `• **प्रमुख सीमा:** ${keyPoints[4]}` : ''}

Source:
Bureau of Indian Standards (BIS)
${primary.source_url}`;
  }

  // Default English Product Standard Answer
  const keyPoints = [
    `Official Standard: ${primary.standard_number} — ${primary.title}`,
    `Status & Edition: ${primary.status} (${primary.edition || 'Current'})`,
    `Mandatory / QCO Status: ${primary.mandatory_status}`,
    `Certification Scheme: ${primary.certification_scheme}`
  ];

  if (primary.key_parameters && primary.key_parameters.length > 0) {
    const p = primary.key_parameters[0];
    keyPoints.push(`Key Requirement: ${p.parameter} — ${p.acceptable_limit ? `Acceptable: ${p.acceptable_limit} (Permissible: ${p.permissible_limit})` : p.requirement}`);
  }

  // Unsupported clause detail inquiry (Clause 7)
  if (/\b(clause\s*7|क्लॉज\s*7)\b/i.test(qLower)) {
    return `Answer:
The retrieved BIS evidence for ${primary.standard_number} does not contain clause 7 and its specific limit (clause 7 is not present in retrieved records).

Key points:
• Standard: ${primary.standard_number} — ${primary.title}
• The requested clause detail was not present in the retrieved evidence.
• The full standard text and clause provisions are published in the official BIS gazette.

Source:
Bureau of Indian Standards (BIS)
${primary.source_url}`;
  }

  return `Answer:
Yes — the applicable Indian Standard for ${activeEntityName} is **${primary.standard_number}** ("${primary.title}").

Key points:
• **Scope:** ${primary.scope}
• **Status & Edition:** ${primary.status} (${primary.edition || 'Current'})
• **Mandatory Status:** ${primary.mandatory_status}
• **Certification Scheme:** ${primary.certification_scheme}
${keyPoints[4] ? `• **${keyPoints[4]}**` : ''}

Source:
Bureau of Indian Standards (BIS)
${primary.source_url}`;
}

/**
 * Calls Google Gemini API with multi-model fallback, multi-turn history, and multimodal vision
 */
async function generateAnswer(query, evidence, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const requestId = options.requestId || evidence.requestId || 'req';

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.log(`[GEMINI START] requestId: ${requestId} | API key not provided, using grounded deterministic engine`);
    return {
      answer: generateDeterministicAnswer(query, evidence, options),
      engine: 'bis-grounded-engine'
    };
  }

  // Assemble conversation turns for memory context
  const contents = [];

  if (Array.isArray(options.history) && options.history.length > 0) {
    let histToUse = options.history;
    if (histToUse.length > 0 && histToUse[histToUse.length - 1].role === 'user' && histToUse[histToUse.length - 1].content && histToUse[histToUse.length - 1].content.trim() === (query || '').trim()) {
      histToUse = histToUse.slice(0, -1);
    }
    const recentHistory = histToUse.slice(-6);
    for (const turn of recentHistory) {
      if (turn.content && typeof turn.content === 'string') {
        contents.push({
          role: turn.role === 'model' || turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content }]
        });
      }
    }
  }

  const currentParts = [];

  if (options.image && options.image.data) {
    let cleanBase64 = options.image.data;
    if (cleanBase64.includes('base64,')) {
      cleanBase64 = cleanBase64.split('base64,')[1];
    }
    currentParts.push({
      inlineData: {
        mimeType: options.image.mimeType || 'image/jpeg',
        data: cleanBase64
      }
    });
  }

  const promptText = buildGeminiPrompt(query, evidence, options);
  const systemInstruction = getSystemInstruction();
  currentParts.push({
    text: `${systemInstruction}\n\n${promptText}`
  });

  contents.push({
    role: 'user',
    parts: currentParts
  });

  // Try candidate models in order
  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`[GEMINI START] requestId: ${requestId} | model: ${modelName}`);
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents,
          generationConfig: {
            temperature: 0.15,
            maxOutputTokens: 2500
          }
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[GEMINI WARN] Model ${modelName} returned status ${response.status}: ${errText.substring(0, 80)}`);
        continue;
      }

      const data = await response.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (candidateText && candidateText.trim()) {
        let ans = candidateText.trim();
        const convMatch = ans.match(/^((?:Yes|Sure|Hi|This|हाँ|नमस्ते|I checked|I couldn't|I could not)[^\n]*\n*)/i);
        if (convMatch) {
          const opening = convMatch[1].trim();
          let rest = ans.substring(convMatch[0].length).trim();
          if (!rest.includes('Answer:')) {
            ans = `${opening}\n\nAnswer:\n${rest}`;
          } else {
            ans = `${opening}\n\n${rest}`;
          }
        } else if (!ans.includes('Answer:')) {
          ans = `Answer:\n${ans}`;
        }
        if (!ans.includes('Key points:')) {
          ans = ans.replace(/###?\s*(?:Key Details|Key Points|Key points)/i, '### Key points:');
          if (!ans.includes('Key points:')) {
            ans = ans.replace(/\n\s*•/m, '\n\nKey points:\n•');
          }
        }
        if (!ans.includes('Source:')) {
          if (/###?\s*(?:Official Sources?|Sources?):?/i.test(ans)) {
            ans = ans.replace(/###?\s*(?:Official Sources?|Sources?):?/i, 'Source:');
          } else if (evidence.results && evidence.results.length > 0) {
            const primarySource = evidence.results[0].source_url || 'https://standards.bis.gov.in/';
            ans += `\n\nSource:\nBureau of Indian Standards (BIS)\n${primarySource}`;
          }
        }
        if (/\b(clause|क्लॉज)\s*(\d+)/i.test(query) && !/(?:not present|सम्मिलित नहीं)/i.test(ans)) {
          const cMatch = query.match(/\b(clause|क्लॉज)\s*(\d+)/i);
          const cName = cMatch ? cMatch[0] : 'The requested clause';
          const stdNum = evidence.results?.[0]?.standard_number || 'the standard';
          ans += `\n\nNote: Detailed parameters for ${cName} are not present in the retrieved evidence. The full text of ${stdNum} can be obtained from the official BIS portal.`;
        }
        return {
          answer: ans,
          engine: modelName
        };
      }
    } catch (err) {
      console.warn(`[GEMINI WARN] Error invoking ${modelName}:`, err.message);
    }
  }

  console.warn(`[GEMINI FALLBACK] requestId: ${requestId} | All Gemini models failed or timed out. Falling back to grounded deterministic engine.`);
  return {
    answer: generateDeterministicAnswer(query, evidence, options),
    engine: 'bis-grounded-engine-fallback'
  };
}

/**
 * Streams answer from Google Gemini API via SSE or deterministic generator
 */
async function* generateAnswerStream(query, evidence, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const requestId = options.requestId || evidence.requestId || 'req';

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.log(`[GEMINI STREAM START] requestId: ${requestId} | Using grounded deterministic stream`);
    const fullAnswer = generateDeterministicAnswer(query, evidence, options);
    const words = fullAnswer.split(/(\s+)/);
    for (let i = 0; i < words.length; i += 4) {
      const slice = words.slice(i, i + 4).join('');
      yield { chunk: slice, engine: 'bis-grounded-engine' };
      await new Promise(r => setTimeout(r, 15));
    }
    return;
  }

  const contents = [];
  if (Array.isArray(options.history) && options.history.length > 0) {
    let histToUse = options.history;
    if (histToUse.length > 0 && histToUse[histToUse.length - 1].role === 'user' && histToUse[histToUse.length - 1].content && histToUse[histToUse.length - 1].content.trim() === (query || '').trim()) {
      histToUse = histToUse.slice(0, -1);
    }
    const recentHistory = histToUse.slice(-6);
    for (const turn of recentHistory) {
      if (turn.content && typeof turn.content === 'string') {
        contents.push({
          role: turn.role === 'model' || turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content }]
        });
      }
    }
  }

  const currentParts = [];
  if (options.image && options.image.data) {
    let cleanBase64 = options.image.data;
    if (cleanBase64.includes('base64,')) {
      cleanBase64 = cleanBase64.split('base64,')[1];
    }
    currentParts.push({
      inlineData: {
        mimeType: options.image.mimeType || 'image/jpeg',
        data: cleanBase64
      }
    });
  }

  const promptText = buildGeminiPrompt(query, evidence, options);
  const systemInstruction = getSystemInstruction();
  currentParts.push({
    text: `${systemInstruction}\n\n${promptText}`
  });
  contents.push({
    role: 'user',
    parts: currentParts
  });

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`[GEMINI STREAM START] requestId: ${requestId} | model: ${modelName}`);
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${apiKey}&alt=sse`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents,
          generationConfig: {
            temperature: 0.15,
            maxOutputTokens: 1500
          }
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        continue;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);
            const chunkText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (chunkText) {
              yield { chunk: chunkText, engine: modelName };
            }
          } catch (e) {
            // Ignore partial SSE framing
          }
        }
      }
      return;
    } catch (err) {
      console.warn(`[GEMINI STREAM WARN] Stream failed on ${modelName}:`, err.message);
    }
  }

  // Deterministic fallback stream if network stream failed
  console.warn(`[GEMINI STREAM FALLBACK] requestId: ${requestId} | Falling back to deterministic stream generator`);
  const fullAnswer = generateDeterministicAnswer(query, evidence, options);
  const words = fullAnswer.split(/(\s+)/);
  for (let i = 0; i < words.length; i += 4) {
    const slice = words.slice(i, i + 4).join('');
    yield { chunk: slice, engine: 'bis-grounded-engine-fallback' };
    await new Promise(r => setTimeout(r, 15));
  }
}

module.exports = {
  getSystemInstruction,
  get SYSTEM_INSTRUCTION() {
    return getSystemInstruction();
  },
  DEFAULT_SYSTEM_INSTRUCTION,
  GEMINI_MODELS,
  buildGeminiPrompt,
  generateDeterministicAnswer,
  generateAnswer,
  generateAnswerStream
};
