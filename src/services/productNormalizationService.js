/**
 * Product Normalization Engine for BISsetu Assistant
 * 
 * Responsibilities:
 * 1. Analyzes user queries in English, Hindi, and Hinglish.
 * 2. Extracts structured product characteristics:
 *    - rawProduct
 *    - normalizedProduct
 *    - productType
 *    - productSubType
 *    - intendedUse
 *    - material
 *    - industry / domain
 *    - possibleSynonyms
 *    - possibleTechnicalTerms
 *    - possibleBISCategoryTerms
 *    - ambiguityLevel ('low', 'medium', 'high', 'unknown')
 *    - disambiguationOptions (for products with multiple distinct standards like pipe, cement, oil)
 * 3. Never treats candidate terms as authoritative facts; provides them as search expansion candidates.
 */

// Comprehensive domain & category taxonomy aligned with BIS Sectional Committees (FADC, CED, ETD, MTD, PCD, TXD, MED)
const PRODUCT_TAXONOMY = [
  // 1. Edible Oils, Cooking Oils & Fats
  {
    identifiers: [
      'edible oil', 'edible oils', 'cooking oil', 'cooking oils', 'vegetable oil', 'vegetable oils',
      'edible vegetable oil', 'food oil', 'tel', 'khane ka tel', 'khane wala tel', 'pakane ka tel'
    ],
    normalizedProduct: 'edible vegetable oil',
    productType: 'Food & Culinary Product',
    productSubType: 'Edible Oils & Fats',
    intendedUse: 'Human consumption and food preparation',
    material: 'Plant seeds, nuts, and vegetable lipids',
    industry: 'Food and Agriculture Division (FADC)',
    possibleSynonyms: [
      'edible oil', 'cooking oil', 'vegetable oil', 'edible vegetable oil', 'refined oil', 'fats and oils'
    ],
    possibleTechnicalTerms: [
      'edible vegetable oils', 'refined vegetable oil', 'vanaspati', 'hydrogenated vegetable oil',
      'blended edible vegetable oil', 'acid value', 'iodine value', 'refractive index'
    ],
    possibleBISCategoryTerms: [
      'FAD 44 (Oils and Oilseeds)', 'Food and Agriculture', 'Edible Oils and Fats', 'Vegetable Oil Products'
    ],
    ambiguityLevel: 'medium',
    disambiguationOptions: [
      { name: 'Mustard Oil', standardNumber: 'IS 546:1975', desc: 'Raw, refined and filtered mustard seed oil' },
      { name: 'Vanaspati (Hydrogenated Vegetable Oil)', standardNumber: 'IS 10633:2017', desc: 'Mandatory certification under Vegetable Oil Products order' },
      { name: 'Groundnut Oil', standardNumber: 'IS 544:2014', desc: 'Refined and filtered groundnut / peanut oil' },
      { name: 'Soybean Oil', standardNumber: 'IS 4276:2014', desc: 'Edible grade solvent extracted / refined soybean oil' },
      { name: 'Blended Edible Vegetable Oils', standardNumber: 'IS 8881:2014', desc: 'Admixture of two edible vegetable oils' }
    ]
  },
  // 2. Mustard Oil (Specific Edible Oil)
  {
    identifiers: [
      'mustard oil', 'sarson ka tel', 'sarson tel', 'sarson oil', 'kachi ghani', 'kacchi ghani mustard oil'
    ],
    normalizedProduct: 'mustard oil',
    productType: 'Specific Edible Vegetable Oil',
    productSubType: 'Brassica Seed Oil',
    intendedUse: 'Cooking, frying, and food seasoning',
    material: 'Mustard seeds (Brassica compestris / juncea)',
    industry: 'Food and Agriculture Division (FADC)',
    possibleSynonyms: [
      'mustard oil', 'sarson ka tel', 'kachi ghani oil', 'mustard seed oil', 'sarson oil'
    ],
    possibleTechnicalTerms: [
      'Mustard Oil - Specification', 'Brassica oil', 'allyl isothiocyanate', 'Bellier turbidity test', 'acid value'
    ],
    possibleBISCategoryTerms: [
      'IS 546', 'FAD 44', 'Food and Agriculture', 'Edible Oils and Fats'
    ],
    ambiguityLevel: 'low',
    targetStandard: 'IS 546:1975'
  },
  // 3. Cold Drink / Carbonated Beverages / Soft Drinks
  {
    identifiers: [
      'cold drink', 'cold drinks', 'soft drink', 'soft drinks', 'carbonated drink', 'carbonated drinks',
      'carbonated beverage', 'carbonated beverages', 'aerated drink', 'aerated water', 'soda', 'peene ki cold drink'
    ],
    normalizedProduct: 'carbonated beverage / soft drink',
    productType: 'Non-Alcoholic Beverage',
    productSubType: 'Carbonated Water and Soft Drinks',
    intendedUse: 'Refreshing potable beverage consumption',
    material: 'Potable water, carbon dioxide, permitted nutritive sweeteners, and flavorings',
    industry: 'Food and Agriculture Division (FADC)',
    possibleSynonyms: [
      'cold drink', 'soft drink', 'carbonated drink', 'aerated drink', 'aerated beverage', 'carbonated water'
    ],
    possibleTechnicalTerms: [
      'Carbonated Beverages - Specification', 'carbonated water', 'gas volume', 'microbiological safety', 'IS 2346'
    ],
    possibleBISCategoryTerms: [
      'IS 2346', 'FAD 14 (Drinks and Carbonated Beverages)', 'Food and Agriculture', 'Beverages'
    ],
    ambiguityLevel: 'low',
    targetStandard: 'IS 2346:1992'
  },
  // 4. Pipes & Tubing
  {
    identifiers: [
      'pipe', 'pipes', 'piping', 'paani ka pipe', 'plumbing pipe', 'nal ka pipe', 'drainage pipe'
    ],
    normalizedProduct: 'pipe and piping systems',
    productType: 'Fluid Conveyance Conduits',
    productSubType: 'Polymer, Metal, or Composite Pipes',
    intendedUse: 'Potable water distribution, plumbing, irrigation, sewage, and industrial piping',
    material: 'UPVC, CPVC, Galvanized Steel (GI), HDPE, or Ductile Iron',
    industry: 'Civil Engineering (CED) / Metallurgical Engineering (MTD)',
    possibleSynonyms: [
      'pipe', 'pipes', 'water pipe', 'plumbing pipe', 'conduit', 'tubing'
    ],
    possibleTechnicalTerms: [
      'UPVC pipes for potable water', 'CPVC pipes for hot and cold water', 'mild steel tubes', 'galvanized steel pipe', 'HDPE pipes'
    ],
    possibleBISCategoryTerms: [
      'CED 50 (Plastic Piping System)', 'MTD 19 (Steel Tubes)', 'Civil Engineering', 'Plumbing Materials'
    ],
    ambiguityLevel: 'high',
    disambiguationOptions: [
      { name: 'Unplasticized PVC (UPVC) Pipes for Potable Water Supplies', standardNumber: 'IS 4985:2021', desc: 'Cold water distribution, plumbing, irrigation (Mandatory ISI Mark under QCO)' },
      { name: 'Chlorinated Polyvinyl Chloride (CPVC) Pipes', standardNumber: 'IS 15778:2007', desc: 'Hot and cold water distribution systems in residential/commercial plumbing' },
      { name: 'Galvanized Steel Tubes / GI Pipes', standardNumber: 'IS 1239 (Part 1):2004', desc: 'Mild steel tubes for water, gas, steam and general plumbing (Mandatory QCO)' },
      { name: 'High Density Polyethylene (HDPE) Pipes for Water Supply', standardNumber: 'IS 4984:2016', desc: 'Potable water supply, municipal drainage and agricultural conveyance' }
    ]
  },
  // 5. Cement
  {
    identifiers: [
      'cement', 'simant', 'cements', 'construction cement', 'building cement'
    ],
    normalizedProduct: 'cement',
    productType: 'Hydraulic Binder',
    productSubType: 'Portland and Blended Cements',
    intendedUse: 'Concrete manufacturing, mortar, masonry, and structural civil construction',
    material: 'Calcareous and argillaceous raw materials, gypsum, pozzolana, or blast furnace slag',
    industry: 'Civil Engineering Division (CED)',
    possibleSynonyms: [
      'cement', 'portland cement', 'construction cement', 'hydraulic cement'
    ],
    possibleTechnicalTerms: [
      'Ordinary Portland Cement', 'Portland Pozzolana Cement', 'Portland Slag Cement', 'compressive strength', 'setting time'
    ],
    possibleBISCategoryTerms: [
      'CED 2 (Cement and Concrete)', 'Civil Engineering', 'Cement Quality Control Order'
    ],
    ambiguityLevel: 'high',
    disambiguationOptions: [
      { name: 'Ordinary Portland Cement (OPC - 33, 43, 53 Grade)', standardNumber: 'IS 269:2015', desc: 'Standard high-strength structural binder (Mandatory ISI Mark under Cement QCO)' },
      { name: 'Portland Pozzolana Cement (PPC - Fly Ash based & Calcined Clay based)', standardNumber: 'IS 1489 (Part 1 & 2):2015', desc: 'Widespread commercial & residential masonry construction' },
      { name: 'Portland Slag Cement (PSC)', standardNumber: 'IS 455:2015', desc: 'Marine structures, sewage treatment plants, and coastal construction' }
    ]
  },
  // 6. LED Bulb / Lamps / Lighting
  {
    identifiers: [
      'led bulb', 'led bulbs', 'led lamp', 'led lamps', 'led light', 'led lights', 'led lighting',
      'led', 'bulb', 'bulbs', 'lighting bulb'
    ],
    normalizedProduct: 'self-ballasted LED bulb / lamp',
    productType: 'Electrical Lighting Appliance',
    productSubType: 'Solid-State Lighting Source',
    intendedUse: 'Domestic and commercial general illumination',
    material: 'LED chips, driver electronics, polycarbonate / glass diffuser, and metal heatsink',
    industry: 'Electrotechnical Division (ETD)',
    possibleSynonyms: [
      'LED bulb', 'LED lamp', 'LED light', 'self-ballasted LED lamp', 'solid state lighting'
    ],
    possibleTechnicalTerms: [
      'Self-Ballasted LED Lamps for General Lighting Services', 'IS 16102 Part 1 (Safety)', 'IS 16102 Part 2 (Performance)', 'CRS mandatory registration'
    ],
    possibleBISCategoryTerms: [
      'ETD 23 (Electric Lamps and Luminaires)', 'Compulsory Registration Scheme (CRS)', 'Electronics and IT Goods (CRO)'
    ],
    ambiguityLevel: 'low',
    targetStandard: 'IS 16102 (Part 1):2012'
  },
  // 7. Packaged Drinking Water & Mineral Water
  {
    identifiers: [
      'packaged drinking water', 'packaged water', 'mineral water', 'bottled water', 'natural mineral water',
      'drinking water bottle', 'bisleri', 'aquafina', 'kinley', 'packaged water bottle'
    ],
    normalizedProduct: 'packaged drinking water',
    productType: 'Packaged Beverage Product',
    productSubType: 'Treated Water / Natural Mineral Water in Hermetically Sealed Containers',
    intendedUse: 'Safe human hydration and consumption',
    material: 'Treated groundwater / surface water / natural mineral spring water',
    industry: 'Food and Agriculture Division (FADC)',
    possibleSynonyms: [
      'packaged drinking water', 'mineral water', 'bottled drinking water', 'packaged water'
    ],
    possibleTechnicalTerms: [
      'Packaged Drinking Water (Other than Natural Mineral Water) - Specification',
      'Packaged Natural Mineral Water - Specification',
      'IS 14543', 'IS 13428', 'FSSAI mandatory certification'
    ],
    possibleBISCategoryTerms: [
      'FAD 14 (Drinks and Carbonated Beverages)', 'Food and Agriculture', 'Mandatory Certification Scheme I'
    ],
    ambiguityLevel: 'low',
    disambiguationOptions: [
      { name: 'Packaged Drinking Water (Other than Natural Mineral Water)', standardNumber: 'IS 14543:2016', desc: 'Commercially treated & sealed drinking water (Mandatory ISI Mark)' },
      { name: 'Packaged Natural Mineral Water', standardNumber: 'IS 13428:2005', desc: 'Direct subterranean source spring/well water (Mandatory ISI Mark)' }
    ]
  },
  // 8. Drinking Water (Potable / Tap Water)
  {
    identifiers: [
      'drinking water', 'tap water', 'potable water', 'peene ka paani', 'peene ke paani', 'paani ka standard', 'jal'
    ],
    normalizedProduct: 'drinking water (potable supply)',
    productType: 'Municipal & Public Water Supply',
    productSubType: 'Piped Potable Water Specification',
    intendedUse: 'Human drinking and domestic domestic consumption',
    material: 'Surface / groundwater treated for public distribution',
    industry: 'Food and Agriculture Division (FADC) / Water Resources',
    possibleSynonyms: [
      'drinking water', 'tap water', 'potable water', 'peene ka paani', 'water supply'
    ],
    possibleTechnicalTerms: [
      'Drinking Water - Specification', 'IS 10500', 'TDS limit', 'acceptable limit', 'permissible limit'
    ],
    possibleBISCategoryTerms: [
      'FAD 25 (Drinking Water)', 'IS 10500:2012', 'Public Health Engineering'
    ],
    ambiguityLevel: 'low',
    targetStandard: 'IS 10500:2012'
  },
  // 9. Two-Wheeler Protective Helmet
  {
    identifiers: [
      'helmet', 'helmets', 'bike helmet', 'motorcycle helmet', 'two wheeler helmet'
    ],
    normalizedProduct: 'protective helmet for two-wheeler riders',
    productType: 'Personal Protective Equipment (PPE)',
    productSubType: 'Head Protection',
    intendedUse: 'Protection of head against impact in vehicular accidents',
    material: 'Fiberglass / polycarbonate outer shell, EPS liner, and retention straps',
    industry: 'Mechanical Engineering Division (MED)',
    possibleSynonyms: [
      'helmet', 'bike helmet', 'motorcycle helmet', 'protective headgear'
    ],
    possibleTechnicalTerms: [
      'Protective Helmets for Two-Wheeler Riders - Specification', 'IS 4151', 'impact attenuation test', 'retention test'
    ],
    possibleBISCategoryTerms: [
      'MED 4 (Personal Protective Equipment)', 'Mandatory Quality Control Order', 'Motor Vehicles Act'
    ],
    ambiguityLevel: 'low',
    targetStandard: 'IS 4151:2020'
  },
  // 10. Secondary Battery & Cells
  {
    identifiers: [
      'battery', 'batteries', 'mobile battery', 'lithium ion battery', 'lithium battery', 'power bank', 'cell'
    ],
    normalizedProduct: 'secondary cells and batteries',
    productType: 'Electrochemical Energy Storage',
    productSubType: 'Rechargeable Lithium-ion / Nickel Cells',
    intendedUse: 'Powering portable electronics, mobile phones, and electric devices',
    material: 'Lithium cobalt/phosphate, graphite, electrolyte, and separator',
    industry: 'Electrotechnical Division (ETD)',
    possibleSynonyms: [
      'battery', 'cell', 'lithium ion battery', 'mobile battery', 'power bank'
    ],
    possibleTechnicalTerms: [
      'Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes', 'IS 16046', 'IEC 62133', 'CRS Scheme'
    ],
    possibleBISCategoryTerms: [
      'ETD 11 (Secondary Cells and Batteries)', 'Electronics and IT Goods (CRO)', 'Compulsory Registration Scheme'
    ],
    ambiguityLevel: 'medium',
    disambiguationOptions: [
      { name: 'Secondary Lithium Cells/Batteries for Portable Applications', standardNumber: 'IS 16046 (Part 1):2018', desc: 'Nickel systems & lithium systems under Compulsory Registration Scheme (CRS)' },
      { name: 'Lead-Acid Storage Batteries for Motor Vehicles', standardNumber: 'IS 14257:1995', desc: 'Automotive starting, lighting and ignition batteries' }
    ]
  },
  // 11. Steel Reinforcement Bars (TMT / Rebar)
  {
    identifiers: [
      'steel', 'tmt', 'tmt bar', 'rebar', 'sariya', 'iron bar', 'reinforcement bar'
    ],
    normalizedProduct: 'high strength deformed steel bars (TMT)',
    productType: 'Ferrous Structural Metal',
    productSubType: 'Thermo-Mechanically Treated Rebars',
    intendedUse: 'Concrete reinforcement in building, bridges, and civil structures',
    material: 'Low carbon / micro-alloyed steel',
    industry: 'Metallurgical Engineering Division (MTD)',
    possibleSynonyms: [
      'TMT bars', 'sariya', 'steel bars', 'reinforcement steel', 'rebar'
    ],
    possibleTechnicalTerms: [
      'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement', 'IS 1786', 'Fe 415', 'Fe 500D', 'Fe 550D'
    ],
    possibleBISCategoryTerms: [
      'MTD 4 (Wrought Steel Products)', 'Steel and Steel Products (Quality Control) Order', 'Mandatory ISI Certification'
    ],
    ambiguityLevel: 'low',
    targetStandard: 'IS 1786:2008'
  },
  // 12. PVC Insulated Electric Wires & Cables
  {
    identifiers: [
      'wire', 'wires', 'cable', 'cables', 'electric wire', 'electric cable', 'taar', 'pvc wire'
    ],
    normalizedProduct: 'PVC insulated electric cables and wires',
    productType: 'Electrical Conductor Assembly',
    productSubType: 'Single / Multi-core Flexible Cables',
    intendedUse: 'Domestic and commercial electrical power wiring up to 1100V',
    material: 'Copper / aluminium conductors with PVC insulation and sheathing',
    industry: 'Electrotechnical Division (ETD)',
    possibleSynonyms: [
      'electric wire', 'cable', 'PVC cable', 'taar', 'house wire'
    ],
    possibleTechnicalTerms: [
      'PVC Insulated Cables for Working Voltages up to and Including 1100 V', 'IS 694', 'flame retardant', 'conductor resistance'
    ],
    possibleBISCategoryTerms: [
      'ETD 9 (Power Cables)', 'Electrical Wires and Cables QCO', 'Mandatory ISI Mark'
    ],
    ambiguityLevel: 'low',
    targetStandard: 'IS 694:2010'
  }
];

/**
 * Strips conversational filler, question framing, and stops words to isolate raw product tokens
 */
function extractProductFromSentence(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return '';
  const lower = rawQuery.toLowerCase().trim();

  // Remove common question prefixes / framing
  const cleaned = lower
    .replace(/\b(tell\s+me|can\s+you\s+tell|what\s+is|what\s+are|which\s+is|how\s+to|where\s+can\s+i|please\s+give\s+me|find|search|lookup)\b/gi, '')
    .replace(/\b(bis\s+standard\s+for|bis\s+for|is\s+standard\s+for|standard\s+for|standards\s+for|requirements\s+for|specification\s+for|specifications\s+for)\b/gi, '')
    .replace(/\b(ka\s+bis|ki\s+bis|ke\s+liye\s+bis|ka\s+standard|ki\s+specification|batao|bataiye|chahiye|hoga|kya\s+hai)\b/gi, '')
    .replace(/[?!.,;:'"()]/g, '')
    .trim();

  return cleaned;
}

/**
 * Normalizes a product query into structured normalization attributes
 */
function normalizeProductQuery(rawQuery) {
  const extractedProduct = extractProductFromSentence(rawQuery);
  const qLower = (rawQuery || '').toLowerCase().trim();
  const prodLower = extractedProduct.toLowerCase();

  // Search taxonomy for an identifier match
  let matchedTaxonomy = null;
  let bestMatchLen = 0;

  for (const item of PRODUCT_TAXONOMY) {
    for (const id of item.identifiers) {
      const regex = new RegExp(`\\b${id}\\b`, 'i');
      if (regex.test(qLower) || regex.test(prodLower)) {
        if (id.length > bestMatchLen) {
          bestMatchLen = id.length;
          matchedTaxonomy = item;
        }
      }
    }
  }

  if (matchedTaxonomy) {
    return {
      rawProduct: extractedProduct || matchedTaxonomy.normalizedProduct,
      normalizedProduct: matchedTaxonomy.normalizedProduct,
      productType: matchedTaxonomy.productType,
      productSubType: matchedTaxonomy.productSubType,
      intendedUse: matchedTaxonomy.intendedUse,
      material: matchedTaxonomy.material,
      industry: matchedTaxonomy.industry,
      possibleSynonyms: matchedTaxonomy.possibleSynonyms || [],
      possibleTechnicalTerms: matchedTaxonomy.possibleTechnicalTerms || [],
      possibleBISCategoryTerms: matchedTaxonomy.possibleBISCategoryTerms || [],
      ambiguityLevel: matchedTaxonomy.ambiguityLevel || 'low',
      disambiguationOptions: matchedTaxonomy.disambiguationOptions || null,
      targetStandard: matchedTaxonomy.targetStandard || null,
      isIdentified: true
    };
  }

  // Fallback for unknown / generic products (e.g. "xyz123 product")
  const genericTokens = extractedProduct.split(/\s+/).filter(w => w.length > 2);
  const cleanedRaw = genericTokens.join(' ') || extractedProduct || rawQuery.trim();

  return {
    rawProduct: cleanedRaw,
    normalizedProduct: cleanedRaw,
    productType: 'General Product Inquiry',
    productSubType: 'Unclassified Product',
    intendedUse: 'General commercial or industrial application',
    material: 'Unspecified',
    industry: 'Bureau of Indian Standards Repository',
    possibleSynonyms: [cleanedRaw],
    possibleTechnicalTerms: [`${cleanedRaw} - Specification`, `${cleanedRaw} requirements`],
    possibleBISCategoryTerms: [`${cleanedRaw} Indian Standard`, `BIS ${cleanedRaw}`],
    ambiguityLevel: 'unknown',
    disambiguationOptions: null,
    targetStandard: null,
    isIdentified: false
  };
}

module.exports = {
  PRODUCT_TAXONOMY,
  normalizeProductQuery,
  extractProductFromSentence
};
