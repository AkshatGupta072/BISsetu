/**
 * Conversation Context & Follow-Up Memory Service
 * Implements real conversational memory, entity continuity, and query rewriting
 * Conforms to BISsetu AI Conversation Specification
 *
 * Responsibilities:
 * 1. Maintain structured active context (activeTopic, activeProduct, activeStandard, activeCategory, retrievedEvidence, lastSources)
 * 2. Classify incoming query: Completely New Topic vs Follow-Up question
 * 3. Resolve pronouns ("it", "this", "that") and elliptical inquiries ("Is certification mandatory?", "How do I check it?", "Where do I submit it?")
 * 4. Rewrite follow-up questions into self-contained search queries for authoritative RAG retrieval
 * 5. Handle topic switches cleanly ("Now tell me about helmets" -> switches active entity to helmet)
 * 6. Efficient context window management (preserves verified evidence and recent turns)
 */

const { BIS_STANDARDS_DATABASE } = require('../data/bisStandardsDatabase');

// Entity Knowledge Base covering Products and Ecosystem Domains
const KNOWN_ENTITIES = [
  // 1. Packaged Drinking Water
  {
    entity: 'packaged drinking water',
    topic: 'BIS certification and mandatory requirements for packaged drinking water',
    standard: 'IS 14543:2016',
    category: 'standards',
    keywords: ['packaged water', 'packaged drinking water', 'mineral water', 'bottled water', 'natural mineral water', 'bisleri', 'aquafina', 'kinley', 'packaged water bottle'],
    defaultStandardNumber: 'IS 14543:2016'
  },
  // 2. LED Bulbs and Lighting
  {
    entity: 'LED bulbs',
    topic: 'BIS standards and Compulsory Registration Scheme (CRS) for LED bulbs and lamps',
    standard: 'IS 16102 (Part 1):2012',
    category: 'standards',
    keywords: ['led', 'led bulb', 'led bulbs', 'led lamp', 'led lamps', 'led light', 'led lights', 'led lighting', 'bulb', 'bulbs', 'led luminaire'],
    defaultStandardNumber: 'IS 16102 (Part 1):2012'
  },
  // 3. Hallmarking & HUID (Precious Metals)
  {
    entity: 'HUID',
    topic: 'BIS Hallmark Unique Identification (HUID) & Gold Hallmarking System',
    standard: 'IS 1417:2016',
    category: 'hallmarking_huid',
    keywords: ['huid', 'hallmark unique identification', 'hallmark', 'hallmarking', 'gold hallmark', 'gold purity', 'sona', '22k916', 'assaying centre', 'hallmarked jewellery'],
    defaultStandardNumber: 'IS 15820:2009'
  },
  // 4. BIS Consumer Complaints
  {
    entity: 'BIS complaint',
    topic: 'BIS Consumer Complaint & Grievance Redressal Mechanism',
    standard: null,
    category: 'consumer_complaints',
    keywords: ['complaint', 'complaints', 'grievance', 'grievances', 'shikayat', 'consumer complaint', 'file a complaint', 'lodge a complaint', 'bis complaint process', 'complaint process', 'report fraud'],
    defaultStandardNumber: null
  },
  // 5. BIS Regional Offices
  {
    entity: 'BIS regional offices',
    topic: 'Role, Functions and Geographic Jurisdiction of BIS Regional and Branch Offices',
    standard: null,
    category: 'regional_offices',
    keywords: ['regional office', 'regional offices', 'branch office', 'branch offices', 'bis offices', 'nro', 'wro', 'sro', 'ero', 'cro', 'bis regional offices', 'regional office role'],
    defaultStandardNumber: null
  },
  // 6. Quality Control Orders (QCO)
  {
    entity: 'QCO',
    topic: 'Quality Control Orders (QCO) & Mandatory BIS Compliance under Section 16',
    standard: null,
    category: 'qco_compliance',
    keywords: ['qco', 'quality control order', 'quality control orders', 'mandatory qco', 'compulsory certification order'],
    defaultStandardNumber: null
  },
  // 7. ISI Mark
  {
    entity: 'ISI Mark',
    topic: 'BIS ISI Mark & Product Certification Scheme (Scheme I, CM/L License)',
    standard: null,
    category: 'isi_mark',
    keywords: ['isi mark', 'isi logo', 'cml number', 'cml license', 'isi certification', 'scheme i'],
    defaultStandardNumber: null
  },
  // 8. Drinking Water (Potable / Tap Water)
  {
    entity: 'drinking water',
    topic: 'Drinking water quality specifications (IS 10500)',
    standard: 'IS 10500:2012',
    category: 'standards',
    keywords: ['drinking water', 'tap water', 'potable water', 'peene ka paani', 'paani', 'jal', 'water supply'],
    defaultStandardNumber: 'IS 10500:2012'
  },
  // 9. Water Bottles & Packaging
  {
    entity: 'water bottle',
    topic: 'BIS requirements for water bottles, PET containers, and vacuum flasks',
    standard: 'IS 15410:2025',
    category: 'standards',
    keywords: ['water bottle', 'plastic bottle', 'bottle', 'bottles', 'water container', 'pet bottle', 'vacuum flask', 'flask', 'bottled water container'],
    defaultStandardNumber: 'IS 15410:2025'
  },
  // 10. Protective Helmets
  {
    entity: 'helmet',
    topic: 'BIS requirements for protective helmets for two-wheelers',
    standard: 'IS 4151:2020',
    category: 'standards',
    keywords: ['helmet', 'helmets', 'two wheeler helmet', 'motorcycle helmet', 'bike helmet', 'protective helmet', 'rider helmet'],
    defaultStandardNumber: 'IS 4151:2020'
  },
  // 11. Cement
  {
    entity: 'cement',
    topic: 'BIS specifications for Ordinary Portland Cement (IS 269), PPC (IS 1489), and PSC (IS 455)',
    standard: 'IS 269:2015',
    category: 'standards',
    keywords: ['cement', 'opc', 'ppc', 'psc', 'portland cement', 'opc 43', 'opc 53', 'simant'],
    defaultStandardNumber: 'IS 269:2015'
  },
  // 11b. Cold Drink / Carbonated Beverages
  {
    entity: 'carbonated beverage / cold drink',
    topic: 'BIS specifications for carbonated beverages and soft drinks (IS 2346)',
    standard: 'IS 2346:1992',
    category: 'standards',
    keywords: ['cold drink', 'cold drinks', 'soft drink', 'soft drinks', 'carbonated drink', 'carbonated beverage', 'aerated drink', 'aerated water', 'soda'],
    defaultStandardNumber: 'IS 2346:1992'
  },
  // 11c. Edible Oil / Cooking Oil
  {
    entity: 'edible vegetable oil',
    topic: 'BIS standards and specifications for edible oils and fats',
    standard: 'IS 546:1975',
    category: 'standards',
    keywords: ['edible oil', 'edible oils', 'cooking oil', 'cooking oils', 'vegetable oil', 'vegetable oils', 'edible vegetable oil', 'food oil', 'tel', 'khane ka tel', 'khane wala tel'],
    defaultStandardNumber: 'IS 546:1975'
  },
  // 11d. Mustard Oil
  {
    entity: 'mustard oil',
    topic: 'BIS specifications for mustard oil (IS 546)',
    standard: 'IS 546:1975',
    category: 'standards',
    keywords: ['mustard oil', 'sarson ka tel', 'sarson oil', 'kachi ghani', 'kacchi ghani mustard oil'],
    defaultStandardNumber: 'IS 546:1975'
  },
  // 11e. Pipes and Piping Systems
  {
    entity: 'pipes and piping systems',
    topic: 'BIS standards and Quality Control Orders for water and plumbing pipes (UPVC, CPVC, GI, HDPE)',
    standard: 'IS 4985:2021',
    category: 'standards',
    keywords: ['pipe', 'pipes', 'piping', 'paani ka pipe', 'plumbing pipe', 'pvc pipe', 'cpvc pipe', 'gi pipe', 'hdpe pipe', 'nal ka pipe'],
    defaultStandardNumber: 'IS 4985:2021'
  },
  // 12. Concrete
  {
    entity: 'concrete',
    topic: 'Code of practice for plain and reinforced concrete',
    standard: 'IS 456:2000',
    category: 'standards',
    keywords: ['concrete', 'rcc', 'reinforced concrete', 'structural concrete'],
    defaultStandardNumber: 'IS 456:2000'
  },
  // 13. Steel Rebar
  {
    entity: 'steel rebar',
    topic: 'High strength deformed steel bars and wires',
    standard: 'IS 1786:2008',
    category: 'standards',
    keywords: ['steel', 'tmt', 'tmt bar', 'rebar', 'iron bar', 'sariya', 'fe 500', 'fe 550'],
    defaultStandardNumber: 'IS 1786:2008'
  },
  // 14. Plugs and Sockets
  {
    entity: 'plugs and socket-outlets',
    topic: 'Safety requirements for plugs and socket-outlets',
    standard: 'IS 1293:2019',
    category: 'standards',
    keywords: ['plug', 'socket', 'plugs', 'sockets', 'electrical switch', 'pin plug'],
    defaultStandardNumber: 'IS 1293:2019'
  },
  // 15. Batteries
  {
    entity: 'batteries',
    topic: 'Safety requirements for secondary cells and batteries',
    standard: 'IS 16046 (Part 1):2018',
    category: 'standards',
    keywords: ['battery', 'lithium battery', 'power bank', 'cells', 'mobile battery', 'lithium ion'],
    defaultStandardNumber: 'IS 16046 (Part 1):2018'
  },
  // 16. Toys
  {
    entity: 'toys',
    topic: 'Safety of toys (mechanical and physical properties)',
    standard: 'IS 9873 (Part 1):2019',
    category: 'standards',
    keywords: ['toy', 'toys', 'khilona', 'children toys', 'baby toys'],
    defaultStandardNumber: 'IS 9873 (Part 1):2019'
  },
  // 17. Cables and Wires
  {
    entity: 'cables and wires',
    topic: 'PVC insulated cables for working voltages up to 1100V',
    standard: 'IS 694:2010',
    category: 'standards',
    keywords: ['cable', 'wire', 'pvc cable', 'taar', 'wiring', 'electrical wire'],
    defaultStandardNumber: 'IS 694:2010'
  },
  // 18. Electrical Appliances
  {
    entity: 'electrical appliances',
    topic: 'Safety of household and similar electrical appliances',
    standard: 'IS 302 (Part 1):2008',
    category: 'standards',
    keywords: ['appliance', 'appliances', 'geyser', 'heater', 'electric iron', 'water heater'],
    defaultStandardNumber: 'IS 302 (Part 1):2008'
  },
  // 19. Water Purifier / RO
  {
    entity: 'water purifier / RO',
    topic: 'RO based point-of-use water treatment systems',
    standard: 'IS 16240:2015',
    category: 'standards',
    keywords: ['water purifier', 'reverse osmosis', 'ro system', 'ro filter', 'purifier'],
    defaultStandardNumber: 'IS 16240:2015'
  },
  // 20. Quality Management System
  {
    entity: 'quality management system',
    topic: 'Quality management systems certification (ISO 9001)',
    standard: 'IS/ISO 9001:2015',
    category: 'standards',
    keywords: ['iso 9001', 'qms', 'quality management'],
    defaultStandardNumber: 'IS/ISO 9001:2015'
  },
  // 21. Pressure Cooker
  {
    entity: 'pressure cooker',
    topic: 'BIS requirements and mandatory QCO for domestic pressure cookers (IS 2347)',
    standard: 'IS 2347:2017',
    category: 'standards',
    keywords: ['pressure cooker', 'cooker', 'pressure cookers', 'domestic pressure cooker'],
    defaultStandardNumber: 'IS 2347:2017'
  },
  // 22. Compulsory Registration Scheme (CRS)
  {
    entity: 'CRS scheme',
    topic: 'Compulsory Registration Scheme (CRS) for Electronics & IT Goods',
    standard: null,
    category: 'crs_scheme',
    keywords: ['crs', 'compulsory registration', 'crsbis', 'r-number', 'r number'],
    defaultStandardNumber: null
  },
  // 23. BIS Fees & Charges
  {
    entity: 'BIS fees',
    topic: 'BIS Certification, Marking and Testing Fee Structure',
    standard: null,
    category: 'fees_and_charges',
    keywords: ['fee', 'fees', 'charges', 'cost', 'marking fee', 'renewal fee', 'application fee'],
    defaultStandardNumber: null
  },
  // 24. BIS Jaipur Branch Office
  {
    entity: 'BIS Jaipur office',
    topic: 'BIS Jaipur Branch Office and Rajasthan Regional Jurisdiction',
    standard: null,
    category: 'bis_offices',
    keywords: ['jaipur office', 'rajasthan office', 'bis office jaipur', 'bis jaipur', 'jpbo'],
    defaultStandardNumber: null
  }
];

/**
 * Creates an empty structured conversation context
 */
function createInitialContext() {
  return {
    conversationId: 'conv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    active_topic: null,
    active_entity: null,
    active_product: null,
    active_standard: null,
    active_category: null,
    activeCertificationContext: false,
    retrievedEvidence: [],
    lastResolvedQuery: null,
    lastSources: [],
    previous_questions: [],
    identified_standards: [],
    turn_count: 0
  };
}

/**
 * Detects whether a query explicitly introduces a new entity or changes the topic
 */
function detectNewEntityInQuery(queryText) {
  if (!queryText || typeof queryText !== 'string') return null;
  const qLower = queryText.toLowerCase().trim();

  // 1. Check direct IS number mention first (e.g. "IS 4151", "IS 10500", "IS 16102", "IS 14543")
  const isMatch = qLower.match(/\bIS(?:\/ISO)?\s*[-:]?\s*(\d{2,5})(?:\s*[-:]\s*(\d+))?(?::(\d{4}))?\b/i);
  if (isMatch && !/BIS\s+Act\s+2016/i.test(queryText)) {
    const baseNum = isMatch[1];
    const dbRecord = BIS_STANDARDS_DATABASE.find(item => item.base_number === baseNum || item.standard_number.toLowerCase().includes(baseNum));
    if (dbRecord) {
      return {
        entity: dbRecord.title.split('—')[0].trim(),
        topic: `BIS requirements for ${dbRecord.title}`,
        standard: dbRecord.standard_number,
        category: 'standards',
        isExplicitIS: true
      };
    }
  }

  // 2. Check known entities ordered by specificity
  for (const entry of KNOWN_ENTITIES) {
    for (const kw of entry.keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(qLower)) {
        return {
          entity: entry.entity,
          topic: entry.topic,
          standard: entry.standard,
          category: entry.category,
          isExplicitIS: false
        };
      }
    }
  }

  // 3. Dynamic Product/Entity Pattern Extraction (e.g. "BIS requirements for solar inverter", "rules for footwear")
  const productPattern = /(?:standard\s+for|requirements?\s+for|bis\s+for|rules?\s+for|specifications?\s+for|kaise\s+milega|ka\s+standard|ke\s+liye)\s+([a-zA-Z0-9\s]{3,30})/i;
  const match = qLower.match(productPattern);
  if (match && match[1]) {
    const extracted = match[1].replace(/\b(kya|hai|batao|please|in\s+india|india)\b/gi, '').trim();
    if (extracted.length > 2 && !['this', 'that', 'it', 'them', 'these'].includes(extracted.toLowerCase())) {
      return {
        entity: extracted,
        topic: `BIS requirements for ${extracted}`,
        standard: null,
        category: 'standards',
        isExplicitIS: false
      };
    }
  }

  return null;
}

/**
 * Checks if query contains explicit topic-switching phrasing
 */
function hasTopicSwitchPhrasing(queryText) {
  if (!queryText) return false;
  const qLower = queryText.toLowerCase().trim();
  return /^(now\s+)?(tell\s+me\s+about|let's\s+talk\s+about|what\s+about|how\s+about|switch\s+to|move\s+on\s+to|what\s+can\s+you\s+tell\s+me\s+about|explain)\s+/i.test(qLower);
}

/**
 * Classifies whether the query is a follow-up referring to the active conversation
 */
function classifyFollowUpIntent(queryText, currentContext) {
  if (!queryText) return { isFollowUp: false, intentType: 'none' };
  const qLower = queryText.toLowerCase().trim();

  // 1. Mandatory certification / QCO queries
  // Examples: "Is certification mandatory?", "Is it mandatory?", "Is it compulsory?", "What about certification?", "Do I need certification?"
  if (/\b(certification\s+(is\s+)?(required|mandatory|needed)|is\s+certification\s+required|is\s+it\s+mandatory|is\s+it\s+compulsory|mandatory\s+or\s+voluntary|compulsory|anivarye|zaruri|what\s+about\s+certification|do\s+i\s+need\s+(a\s+)?(license|certification)|isi\s+mark\s+required|is\s+isi\s+mark\s+mandatory|certificate\s+required)\b/i.test(qLower)) {
    return { isFollowUp: true, intentType: 'certification_requirement' };
  }

  // 2. Verification / Checking procedure
  // Examples: "How do I check it?", "How can I verify it?", "How to verify it?", "Where can I check it?"
  if (/\b(how\s+(can\s+i|do\s+i|to)\s+(verify|check|track|validate)\s+(it|this|the\s+mark|the\s+code|the\s+number)|where\s+(can\s+i|do\s+i)\s+(verify|check)|verify\s+it|check\s+it)\b/i.test(qLower)) {
    return { isFollowUp: true, intentType: 'verification_procedure' };
  }

  // 3. Submission / Where to submit / apply
  // Examples: "Where do I submit it?", "Where can I submit it?", "Where to submit?", "Where do I file it?"
  if (/\b(where\s+(do\s+i|can\s+i|to)\s+(submit|file|lodge|register)\s+(it|this|the\s+complaint|application)|how\s+to\s+submit|kaha\s+jama\s+kare|kaha\s+submit)\b/i.test(qLower)) {
    return { isFollowUp: true, intentType: 'submission_location' };
  }

  // 4. Contact / Which office / jurisdiction
  // Examples: "Which one should I contact?", "Who should I contact?", "Which office should I contact?", "Whom to contact?"
  if (/\b(which\s+one\s+should\s+i\s+contact|who\s+(should\s+i|to)\s+contact|whom\s+should\s+i\s+contact|which\s+office\s+(should\s+i|to)\s+contact|kis\s+office\s+se\s+sampark\s+kare)\b/i.test(qLower)) {
    return { isFollowUp: true, intentType: 'contact_office' };
  }

  // 5. Document requirements
  if (/\b(documents?\s+(are\s+)?(required|needed)|what\s+documents|which\s+documents|paperwork|list\s+of\s+documents|dastavej|kagaz)\b/i.test(qLower)) {
    return { isFollowUp: true, intentType: 'documents_required' };
  }

  // 6. Cost / Fee inquiries
  if (/\b(how\s+much\s+(does\s+it\s+)?cost|cost|fees?|pricing|charges|how\s+much\s+fee|kharcha|kitna\s+paisa|government\s+fee)\b/i.test(qLower)) {
    return { isFollowUp: true, intentType: 'cost_and_fees' };
  }

  // 7. Issuing authority / Who issues
  if (/\b(who\s+issues\s+(it|the\s+certificate|the\s+license)|who\s+gives\s+it|issuing\s+authority|kaun\s+deta\s+hai|who\s+provides)\b/i.test(qLower)) {
    return { isFollowUp: true, intentType: 'who_issues' };
  }

  // 8. Application process / Where to apply
  if (/\b(where\s+can\s+i\s+apply|where\s+to\s+apply|how\s+(can\s+i|to)\s+apply|application\s+process|how\s+do\s+i\s+get|portal|manakonline|kaise\s+apply|kaha\s+apply)\b/i.test(qLower)) {
    return { isFollowUp: true, intentType: 'application_process' };
  }

  // 9. Validity / Duration
  if (/\b(how\s+long\s+(does\s+it\s+take|is\s+the\s+process|is\s+it\s+valid)|validity|renewal|how\s+many\s+days|timeline)\b/i.test(qLower)) {
    return { isFollowUp: true, intentType: 'timeline_and_validity' };
  }

  // 10. Penalties / Selling without it
  if (/\b(can\s+i\s+sell\s+without\s+(it|certification|license)|penalty|punishment|fine|illegal|offence|bina\s+iske)\b/i.test(qLower)) {
    return { isFollowUp: true, intentType: 'penalties' };
  }

  // 11. Testing / Lab procedures
  if (/\b(test(ing)?\s+(required|parameters?)|what\s+are\s+the\s+tests|which\s+lab|testing\s+procedure|factory\s+testing)\b/i.test(qLower)) {
    return { isFollowUp: true, intentType: 'testing_parameters' };
  }

  // 12. Pronouns and demonstratives ("it", "this", "that", "these", "those")
  if (/\b(it|this|that|these|those|its|the product|the standard|the certificate|the license|this rule|that rule)\b/i.test(qLower)) {
    return { isFollowUp: true, intentType: 'pronoun_reference' };
  }

  // 13. Short elliptical questions (< 6 words) when active context exists
  const words = qLower.split(/\s+/).filter(Boolean);
  if (words.length <= 6 && currentContext && (currentContext.active_entity || currentContext.active_topic)) {
    if (/^(what|which|how|is|are|can|does|why|who|where)\b/i.test(qLower)) {
      return { isFollowUp: true, intentType: 'elliptical_question' };
    }
  }

  return { isFollowUp: false, intentType: 'none' };
}

/**
 * Rewrites ambiguous follow-up queries into self-contained search queries for RAG
 */
function rewriteFollowUpQuery(queryText, intentType, context) {
  const entity = context.active_entity || context.active_product || 'the product';
  const standard = context.active_standard ? ` (${context.active_standard})` : '';
  const category = context.active_category || '';

  switch (intentType) {
    case 'certification_requirement':
      if (entity.toLowerCase().includes('packaged') || entity.toLowerCase().includes('water')) {
        return `Is BIS certification mandatory for packaged drinking water under Indian Standards (IS 14543:2016)?`;
      }
      if (entity.toLowerCase().includes('led')) {
        return `What BIS certification requirements and mandatory CRS standards apply to LED bulbs in India?`;
      }
      return `Is BIS certification mandatory for ${entity} under Indian Standards${standard}?`;

    case 'verification_procedure':
      if (entity.toLowerCase().includes('huid') || category === 'hallmarking_huid') {
        return `How can a consumer verify the 6-digit HUID code of jewellery on the official BIS Care Mobile App?`;
      }
      return `How can a consumer verify the official BIS certification, ISI Mark, or license for ${entity}${standard} on the BIS Care App?`;

    case 'submission_location':
      if (entity.toLowerCase().includes('complaint') || category === 'consumer_complaints') {
        return `Where can a consumer submit a BIS complaint or grievance online through official portals?`;
      }
      return `Where can an applicant submit an application for BIS certification of ${entity}${standard} on the Manakonline portal?`;

    case 'contact_office':
      if (entity.toLowerCase().includes('office') || category === 'regional_offices') {
        return `Which BIS regional office should I contact based on geographic jurisdiction?`;
      }
      return `Which official BIS office or department should I contact for ${entity}${standard}?`;

    case 'documents_required':
      return `Which documents and technical factory records are required for BIS certification of ${entity}${standard}?`;

    case 'cost_and_fees':
      return `What is the cost, government fee structure, and marking fee for obtaining BIS certification for ${entity}${standard}?`;

    case 'who_issues':
      return `Who is the issuing authority for BIS ISI mark certification of ${entity}${standard}?`;

    case 'application_process':
      return `What is the official application process and procedure for BIS certification for ${entity}${standard}?`;

    case 'timeline_and_validity':
      return `What is the processing timeline and validity period of BIS certification for ${entity}${standard}?`;

    case 'penalties':
      return `What are the legal consequences and penalties for selling ${entity}${standard} without mandatory BIS certification in India?`;

    case 'testing_parameters':
      return `What are the mandatory quality testing parameters and laboratory requirements for ${entity}${standard}?`;

    case 'pronoun_reference':
    case 'elliptical_question':
    default:
      if (queryText.toLowerCase().includes('verify') || queryText.toLowerCase().includes('check')) {
        if (entity.toLowerCase().includes('huid') || category === 'hallmarking_huid') {
          return `How can a consumer verify the 6-digit HUID of jewellery on the official BIS Care App?`;
        }
      }
      if (queryText.toLowerCase().includes('submit') || queryText.toLowerCase().includes('where')) {
        if (entity.toLowerCase().includes('complaint') || category === 'consumer_complaints') {
          return `Where can a consumer submit a BIS complaint through official channels?`;
        }
      }
      if (queryText.toLowerCase().includes('contact')) {
        if (entity.toLowerCase().includes('office') || category === 'regional_offices') {
          return `Which BIS regional office should I contact based on geographic jurisdiction?`;
        }
      }
      // Replace pronouns like 'it', 'this', 'that' with the entity
      let resolved = queryText.replace(/\b(it|this|that)\b/gi, `the ${entity}`);
      if (!resolved.toLowerCase().includes(entity.toLowerCase())) {
        resolved = `${resolved} for ${entity}${standard}`;
      }
      return resolved;
  }
}

/**
 * Reconstructs or updates conversation context from history and incoming query
 */
function buildOrUpdateContext(rawQuery, history = [], existingContext = null) {
  let context = existingContext && (existingContext.active_entity || existingContext.active_topic || existingContext.active_category)
    ? { ...existingContext }
    : createInitialContext();

  // If context is empty but history exists, bootstrap from history
  if (!context.active_entity && Array.isArray(history) && history.length > 0) {
    for (const turn of history) {
      if ((turn.role === 'user' || turn.role === 'human') && turn.content) {
        const found = detectNewEntityInQuery(turn.content);
        if (found) {
          context.active_entity = found.entity;
          context.active_product = found.entity;
          context.active_topic = found.topic;
          context.active_standard = found.standard;
          context.active_category = found.category;
          if (found.standard && !context.identified_standards.includes(found.standard)) {
            context.identified_standards.push(found.standard);
          }
        }
        if (!context.previous_questions.includes(turn.content)) {
          context.previous_questions.push(turn.content);
        }
      }
    }
  }

  const cleanQuery = (rawQuery || '').trim();
  const detectedNew = detectNewEntityInQuery(cleanQuery);
  const isTopicSwitch = hasTopicSwitchPhrasing(cleanQuery);

  let isFollowUp = false;
  let intentType = 'none';
  let rewrittenQuery = cleanQuery;

  if (detectedNew && (isTopicSwitch || !context.active_entity || detectedNew.entity !== context.active_entity)) {
    // Topic Change Detected or New Independent Subject Introduced
    context.active_entity = detectedNew.entity;
    context.active_product = detectedNew.entity;
    context.active_topic = detectedNew.topic;
    context.active_standard = detectedNew.standard;
    context.active_category = detectedNew.category;
    if (detectedNew.standard && !context.identified_standards.includes(detectedNew.standard)) {
      context.identified_standards.push(detectedNew.standard);
    }
    isFollowUp = false;
    rewrittenQuery = cleanQuery;
  } else if (context.active_entity || context.active_topic) {
    // Check if current query is a follow-up on the active entity/topic
    const followUpAnalysis = classifyFollowUpIntent(cleanQuery, context);
    if (followUpAnalysis.isFollowUp) {
      isFollowUp = true;
      intentType = followUpAnalysis.intentType;
      rewrittenQuery = rewriteFollowUpQuery(cleanQuery, intentType, context);
    } else {
      rewrittenQuery = cleanQuery;
    }
  } else if (detectedNew) {
    context.active_entity = detectedNew.entity;
    context.active_product = detectedNew.entity;
    context.active_topic = detectedNew.topic;
    context.active_standard = detectedNew.standard;
    context.active_category = detectedNew.category;
    if (detectedNew.standard && !context.identified_standards.includes(detectedNew.standard)) {
      context.identified_standards.push(detectedNew.standard);
    }
    rewrittenQuery = cleanQuery;
  }

  // Update previous questions (limit to 10 to avoid bloat)
  if (cleanQuery && !context.previous_questions.includes(cleanQuery)) {
    context.previous_questions.push(cleanQuery);
    if (context.previous_questions.length > 10) {
      context.previous_questions = context.previous_questions.slice(-10);
    }
  }

  context.turn_count = (context.turn_count || 0) + 1;
  context.lastResolvedQuery = rewrittenQuery;

  return {
    context,
    isFollowUp,
    intentType,
    rewrittenQuery
  };
}

module.exports = {
  KNOWN_ENTITIES,
  createInitialContext,
  detectNewEntityInQuery,
  hasTopicSwitchPhrasing,
  classifyFollowUpIntent,
  rewriteFollowUpQuery,
  buildOrUpdateContext
};
