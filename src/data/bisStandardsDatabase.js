/**
 * Authoritative Bureau of Indian Standards (BIS) Data Layer
 * Primary official source: BIS Standards portal — https://standards.bis.gov.in/
 * 
 * Fields captured per BISsetu AI Specification:
 * - standard_number: Official IS number with revision/year
 * - base_number: Normalized number (e.g., "10500", "456") for resilient lookup
 * - title: Official title of the standard
 * - scope: Authoritative scope defining the applicability and requirements
 * - status: Active / Under Revision / Withdrawn
 * - edition: Current edition details
 * - publication_year: Year of publication
 * - amendments: Official amendments issued
 * - mandatory_status: Whether covered under Quality Control Order (QCO) / Mandatory Certification
 * - certification_scheme: Scheme I (ISI Mark), Scheme II (CRS), Hallmarking, etc.
 * - product_category: Broad industrial/consumer category
 * - key_parameters: Verified statutory parameters/limits where officially specified
 * - source_url: Direct URL to the standard on BIS portal
 */

const BIS_STANDARDS_DATABASE = [
  {
    standard_number: "IS 10500:2012",
    base_number: "10500",
    title: "Drinking Water — Specification (Second Revision)",
    scope: "Prescribes the requirements and methods of sampling and test for drinking water intended for human consumption. It establishes acceptable limits and permissible limits in the absence of an alternate source for physical, chemical, toxic, and bacteriological parameters.",
    status: "Active",
    edition: "Second Revision (Reaffirmed 2023)",
    publication_year: "2012",
    amendments: "Amendment No. 1 (2015), Amendment No. 2 (2018), Amendment No. 3 (2021)",
    mandatory_status: "Mandatory for piped drinking water supply under standard regulatory directives; referenced across municipal and food safety authorities.",
    certification_scheme: "Scheme I (ISI Mark Scheme) for community water treatment / water supply utilities.",
    product_category: "Food and Agriculture / Water Resources",
    key_parameters: [
      { parameter: "pH Value", acceptable_limit: "6.5 to 8.5", permissible_limit: "No relaxation" },
      { parameter: "Total Dissolved Solids (TDS)", acceptable_limit: "500 mg/l", permissible_limit: "2000 mg/l" },
      { parameter: "Turbidity", acceptable_limit: "1 NTU", permissible_limit: "5 NTU" },
      { parameter: "Total Hardness (as CaCO3)", acceptable_limit: "200 mg/l", permissible_limit: "600 mg/l" },
      { parameter: "Total Coliform Bacteria", acceptable_limit: "Shall not be detectable in any 100 ml sample", permissible_limit: "Shall not be detectable" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=10500",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/10500"
  },
  {
    standard_number: "IS 14543:2016",
    base_number: "14543",
    title: "Packaged Drinking Water (Other than Packaged Natural Mineral Water) — Specification (Second Revision)",
    scope: "Prescribes the requirements, methods of sampling, microbiological criteria, packaging, and hygienic processing conditions for packaged drinking water other than packaged natural mineral water.",
    status: "Active",
    edition: "Second Revision (Reaffirmed 2021)",
    publication_year: "2016",
    amendments: "Amendment No. 1, 2, 3",
    mandatory_status: "Mandatory Certification under Food Safety and Standards Act (FSSAI) and BIS Act. Selling packaged drinking water without a valid BIS ISI mark is illegal.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Certification with CML/L license number printed).",
    product_category: "Food and Agriculture / Beverage Processing",
    key_parameters: [
      { parameter: "Microbiological Safety", requirement: "Zero E. coli, Coliforms, Faecal Streptococci, Pseudomonas aeruginosa in 250ml sample" },
      { parameter: "Packaging", requirement: "Food-grade tamper-proof containers complying with relevant Indian Standards (IS 15410/IS 12252)" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=14543",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/14543"
  },
  {
    standard_number: "IS 13428:2005",
    base_number: "13428",
    title: "Packaged Natural Mineral Water — Specification (First Revision)",
    scope: "Prescribes the requirements and methods of sampling and test for packaged natural mineral water obtained directly from natural subterranean sources such as springs, artesian wells, or boreholes.",
    status: "Active",
    edition: "First Revision (Reaffirmed 2020)",
    publication_year: "2005",
    amendments: "Amendments 1 to 5 incorporated",
    mandatory_status: "Mandatory Certification under FSSAI and BIS Act. Mandatory ISI certification required before sale.",
    certification_scheme: "Scheme I (Mandatory ISI Mark)",
    product_category: "Food and Agriculture / Mineral Water",
    key_parameters: [
      { parameter: "Origin", requirement: "Must originate from identified subterranean geological sources without chemical alteration." }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=13428",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/13428"
  },
  {
    standard_number: "IS 15820:2009",
    base_number: "15820",
    title: "General Requirements for Competence of Assaying and Hallmarking Centres",
    scope: "Specifies requirements for the competence, impartiality, and consistent operation of assaying and hallmarking centres for precious metals (Gold and Silver jewellery/artefacts). Sets procedures for XRF screening, fire assay testing, and applying the BIS Hallmark.",
    status: "Active",
    edition: "First Edition (Reaffirmed 2019)",
    publication_year: "2009",
    amendments: "Amendment No. 1 (2021) incorporating 6-digit alphanumeric HUID requirements",
    mandatory_status: "Mandatory for all BIS-recognized Assaying & Hallmarking Centres (AHC).",
    certification_scheme: "Hallmarking Scheme (BIS Hallmark Unique Identification - HUID)",
    product_category: "Precious Metals / Hallmarking",
    key_parameters: [
      { parameter: "Mandatory Hallmark Marks", requirement: "1. BIS Triangle Mark, 2. Purity grade (e.g., 22K916, 18K750, 14K585), 3. 6-digit alphanumeric HUID code" },
      { parameter: "Assay Method", requirement: "Fire Assay (cupellation) as primary reference method per IS 1418" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=15820",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/15820"
  },
  {
    standard_number: "IS 1417:2016",
    base_number: "1417",
    title: "Gold and Gold Alloys, Silver and Silver Alloys — Jewellery/Artefacts — Fineness and Marking (Fifth Revision)",
    scope: "Prescribes the fineness grades of gold and silver jewellery and artefacts, as well as the identification markings required on hallmarked articles.",
    status: "Active",
    edition: "Fifth Revision (Reaffirmed 2021)",
    publication_year: "2016",
    amendments: "Amendment No. 1 & 2",
    mandatory_status: "Mandatory under the Hallmarking of Gold Jewellery and Gold Artefacts Order issued by the Ministry of Consumer Affairs.",
    certification_scheme: "BIS Gold Hallmarking Scheme (HUID verification on BIS CARE App)",
    product_category: "Hallmarking / Consumer Protection",
    key_parameters: [
      { parameter: "Permitted Gold Purity Grades", requirement: "24K (995), 23K (958), 22K (916), 20K (833), 18K (750), 14K (585), 9K (375)" },
      { parameter: "HUID Verification", requirement: "Every hallmarked piece carries a unique 6-character laser-engraved code verifiable on the BIS CARE Mobile App." }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=1417",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/1417"
  },
  {
    standard_number: "IS 4151:2020",
    base_number: "4151",
    title: "Protective Helmets for Riders of Two-Wheeled Motor Vehicles — Specification (Fourth Revision)",
    scope: "Specifies requirements regarding materials, construction, finish, weight, and performance test methods for protective helmets designed to absorb impact energy and reduce head trauma for motorcyclists.",
    status: "Active",
    edition: "Fourth Revision (2020)",
    publication_year: "2020",
    amendments: "Amendment No. 1 (2021)",
    mandatory_status: "Mandatory under the Helmet Quality Control Order (QCO) issued by the Ministry of Road Transport and Highways (MoRTH). All two-wheeler helmets sold in India must carry the ISI Mark.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Certification with CML/L license)",
    product_category: "Mechanical Engineering / Road Safety / Consumer Protection",
    key_parameters: [
      { parameter: "Maximum Helmet Weight", requirement: "1.2 kg (1200 grams) maximum to prevent cervical spine fatigue" },
      { parameter: "Impact Attenuation Test", requirement: "Peak acceleration transmitted to the headform shall not exceed 300g" },
      { parameter: "Retention System", requirement: "Dynamic test with maximum displacement not exceeding specified limits; chin-strap width min 20mm" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=4151",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/4151"
  },
  {
    standard_number: "IS 456:2000",
    base_number: "456",
    title: "Plain and Reinforced Concrete — Code of Practice (Fourth Revision)",
    scope: "Deals with the general structural use of plain and reinforced concrete in buildings, structures, foundations, and civil engineering works. Covers materials, workmanship, design guidelines (limit state design), durability criteria, and testing.",
    status: "Active",
    edition: "Fourth Revision (Reaffirmed 2021)",
    publication_year: "2000",
    amendments: "Amendments 1 to 5 incorporated",
    mandatory_status: "Statutory structural code adopted by the National Building Code (NBC) of India, municipal corporations, CPWD, and structural engineering regulatory bodies.",
    certification_scheme: "National Technical Code of Practice / Standards Adoption",
    product_category: "Civil Engineering / Structural Engineering",
    key_parameters: [
      { parameter: "Design Philosophy", requirement: "Limit State Method (Limit state of collapse and limit state of serviceability)" },
      { parameter: "Minimum Concrete Grade for RCC", requirement: "M20 for moderate exposure conditions" },
      { parameter: "Nominal Maximum Size of Aggregate", requirement: "20 mm for most reinforced concrete work" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=456",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/456"
  },
  {
    standard_number: "IS 1786:2008",
    base_number: "1786",
    title: "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement — Specification (Fourth Revision)",
    scope: "Covers the requirements of deformed steel bars and wires for use as reinforcement in concrete in the strength grades Fe 415, Fe 415D, Fe 500, Fe 500D, Fe 550, Fe 550D, Fe 600, and Fe 650.",
    status: "Active",
    edition: "Fourth Revision (Reaffirmed 2018)",
    publication_year: "2008",
    amendments: "Amendments 1 to 4 incorporated",
    mandatory_status: "Mandatory under the Steel and Steel Products Quality Control Order (QCO) issued by the Ministry of Steel.",
    certification_scheme: "Scheme I (Mandatory ISI Mark with CML/L number stamped on every metre of bar)",
    product_category: "Metallurgical Engineering / Construction Materials",
    key_parameters: [
      { parameter: "Characteristic Yield Strength (Fe 500D)", requirement: "Minimum 500 N/mm²" },
      { parameter: "Elongation (Fe 500D)", requirement: "Minimum 16.0 percent (High ductility for seismic zones)" },
      { parameter: "Chemical Limits (S + P for Fe 500D)", requirement: "Total Sulphur + Phosphorus max 0.075%" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=1786",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/1786"
  },
  {
    standard_number: "IS 269:2015",
    base_number: "269",
    title: "Ordinary Portland Cement — Specification (Sixth Revision)",
    scope: "Covers manufacture, chemical and physical requirements, packaging, and sampling of Ordinary Portland Cement of 33 grade, 43 grade, and 53 grade.",
    status: "Active",
    edition: "Sixth Revision (Reaffirmed 2020)",
    publication_year: "2015",
    amendments: "Amendment No. 1 (2020)",
    mandatory_status: "Mandatory under the Cement Quality Control Order. Selling cement in India without BIS certification is prohibited.",
    certification_scheme: "Scheme I (Mandatory ISI Mark on every cement bag)",
    product_category: "Civil Engineering / Cement & Concrete",
    key_parameters: [
      { parameter: "Initial Setting Time", requirement: "Not less than 30 minutes" },
      { parameter: "Final Setting Time", requirement: "Not more than 600 minutes" },
      { parameter: "Compressive Strength (53 Grade)", requirement: "Minimum 53 MPa at 28 days" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=269",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/269"
  },
  {
    standard_number: "IS 1293:2019",
    base_number: "1293",
    title: "Plugs and Socket-Outlets of Rated Voltage up to and including 250 Volts and Rated Current up to and including 16 Amperes — Specification (Fourth Revision)",
    scope: "Applies to plugs and fixed or portable socket-outlets for a.c. only, with or without earthing contact, for domestic and similar electrical installations.",
    status: "Active",
    edition: "Fourth Revision (2019)",
    publication_year: "2019",
    amendments: "Amendment No. 1, 2",
    mandatory_status: "Mandatory under the Electrical Wires and Cables, Plugs and Socket-Outlets Quality Control Order issued by DPIIT.",
    certification_scheme: "Scheme I (Mandatory ISI Mark)",
    product_category: "Electrotechnical / Electrical Safety",
    key_parameters: [
      { parameter: "Rated Voltage & Current", requirement: "250V AC, ratings 6A and 16A configurations" },
      { parameter: "Safety Shutter", requirement: "Socket-outlets must provide child-safe shutter mechanism preventing single-pin insertion" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=1293",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/1293"
  },
  {
    standard_number: "IS 16046 (Part 1):2018 / IEC 62133-1:2017",
    base_number: "16046",
    title: "Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes — Safety Requirements (Part 1: Nickel Systems; Part 2: Lithium Systems)",
    scope: "Specifies requirements and tests for the safe operation of portable sealed secondary cells and batteries containing non-acid electrolytes under intended use and reasonably foreseeable misuse (e.g. smartphone batteries, power banks, laptop batteries).",
    status: "Active",
    edition: "Second Revision (2018)",
    publication_year: "2018",
    amendments: "Amendments up to 2021",
    mandatory_status: "Mandatory under the Compulsory Registration Scheme (CRS) administered by MeitY and BIS.",
    certification_scheme: "Scheme II (Compulsory Registration Scheme - CRS with 'R-XXXXXXXX' registration mark)",
    product_category: "Electronics and Information Technology / Batteries",
    key_parameters: [
      { parameter: "Safety Tests", requirement: "Continuous charging, external short circuit, free fall, thermal abuse, crush, over-charge, forced discharge" },
      { parameter: "Registration Mark", requirement: "BIS CRS Logo with R-number displayed on packaging and cell casing" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=16046",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/16046"
  },
  {
    standard_number: "IS 9873 (Part 1):2019 / ISO 8124-1:2018",
    base_number: "9873",
    title: "Safety of Toys — Part 1: Safety Aspects Related to Mechanical and Physical Properties",
    scope: "Applies to all toys intended for use in play by children under 14 years of age. Sets criteria for small parts, sharp points, edges, cords, projectiles, and drop test durability.",
    status: "Active",
    edition: "Second Revision",
    publication_year: "2019",
    amendments: "Amendment No. 1 (2020)",
    mandatory_status: "Mandatory under Toys (Quality Control) Order. No toys (electronic or non-electronic) can be imported or sold in India without the BIS ISI Mark.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Certification for Toy Manufacturers)",
    product_category: "Consumer Products / Child Safety",
    key_parameters: [
      { parameter: "Choking Hazard / Small Parts", requirement: "Toys for children under 36 months must not contain parts fitting within the small parts test cylinder" },
      { parameter: "Chemical Safety", requirement: "Comply with IS 9873 Part 3 for migration of heavy metals (lead, cadmium, mercury, etc.)" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=9873",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/9873"
  },
  {
    standard_number: "IS 694:2010",
    base_number: "694",
    title: "Polyvinyl Chloride Insulated Cables for Working Voltages up to and including 1100 V — Specification (Fourth Revision)",
    scope: "Covers requirements for single-core and multi-core PVC insulated cables for electric power and lighting in domestic, industrial, and commercial wiring.",
    status: "Active",
    edition: "Fourth Revision (Reaffirmed 2020)",
    publication_year: "2010",
    amendments: "Amendments 1, 2, 3 incorporated",
    mandatory_status: "Mandatory under the Electrical Wires and Cables Quality Control Order. ISI marking mandatory.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Certification)",
    product_category: "Electrotechnical / Electrical Conductors",
    key_parameters: [
      { parameter: "Conductor Resistance", requirement: "Conforms to IS 8130 for copper or aluminium conductors" },
      { parameter: "Insulation Resistance", requirement: "Minimum values at room temperature and 70°C maximum operating temperature" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=694",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/694"
  },
  {
    standard_number: "IS 302 (Part 1):2008",
    base_number: "302",
    title: "Safety of Household and Similar Electrical Appliances — Part 1: General Requirements (Sixth Revision)",
    scope: "Deals with the safety of electrical appliances for household and similar purposes whose rated voltage is not more than 250 V for single-phase appliances and 480 V for other appliances. Note: Particular requirements for specific appliances are covered under IS 302 Part 2 (e.g., IS 302-2-3 for electric irons, IS 302-2-21 for storage water heaters/geysers).",
    status: "Active",
    edition: "Sixth Revision (Reaffirmed 2019)",
    publication_year: "2008",
    amendments: "Amendments 1 to 4 incorporated",
    mandatory_status: "Mandatory for appliances covered under respective QCOs (e.g. electric irons, immersion heaters, geysers).",
    certification_scheme: "Scheme I (Mandatory ISI Mark)",
    product_category: "Electrotechnical / Home Appliances",
    key_parameters: [
      { parameter: "Protection Against Electric Shock", requirement: "Class 0, Class 0I, Class I, Class II, and Class III construction standards" },
      { parameter: "Heating & Leakage Current", requirement: "Leakage current under working temperatures shall not exceed statutory milliampere thresholds" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=302",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/302"
  },
  {
    standard_number: "IS 16240:2015",
    base_number: "16240",
    title: "Reverse Osmosis (RO) Based Point-of-Use (PoU) Water Treatment Systems — Specification",
    scope: "Prescribes requirements for reverse osmosis (RO) based point-of-use drinking water treatment systems for reducing total dissolved solids (TDS), chemical contaminants, and microbiological parameters from drinking water supplies.",
    status: "Active",
    edition: "First Edition (Reaffirmed 2020)",
    publication_year: "2015",
    amendments: "Amendment No. 1 (2020)",
    mandatory_status: "Voluntary ISI mark certification; heavily recommended and referenced in consumer health guidelines.",
    certification_scheme: "Scheme I (ISI Mark Certification)",
    product_category: "Mechanical & Chemical / Water Purifiers",
    key_parameters: [
      { parameter: "Recovery Percentage", requirement: "System shall maintain minimum water recovery standards to prevent excessive waste" },
      { parameter: "TDS Reduction", requirement: "Minimum 90% reduction of feed water total dissolved solids" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=16240",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/16240"
  },
  {
    standard_number: "IS/ISO 9001:2015",
    base_number: "9001",
    title: "Quality Management Systems — Requirements (Fifth Revision)",
    scope: "Specifies requirements for a quality management system when an organization needs to demonstrate its ability to consistently provide products and services that meet customer and applicable statutory and regulatory requirements.",
    status: "Active",
    edition: "Fifth Revision (Reaffirmed 2021)",
    publication_year: "2015",
    amendments: "Identical adoption of ISO 9001:2015",
    mandatory_status: "Voluntary Management Systems Certification.",
    certification_scheme: "Management Systems Certification Scheme (MSCS)",
    product_category: "Management and Quality Assurance",
    key_parameters: [
      { parameter: "Framework", requirement: "Plan-Do-Check-Act (PDCA) cycle and risk-based thinking" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=9001",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/9001"
  },
  {
    standard_number: "IS 15410:2025",
    base_number: "15410",
    title: "Containers for Packaging of Natural Mineral Water and Packaged Drinking Water — Specification",
    scope: "Prescribes the requirements, sampling, and test methods for plastic containers and bottles (PET, Polycarbonate, and other food-grade polymers) used for packaging natural mineral water and packaged drinking water. It defines migration limits, drop impact resistance, transparency, and safety for human contact.",
    status: "Active",
    edition: "Latest Revision (2025)",
    publication_year: "2025",
    amendments: "Current Revision incorporating updated food-grade migration limits",
    mandatory_status: "Mandatory Certification under Quality Control Orders (QCO) issued by the Ministry of Commerce and Industry and FSSAI regulations. Water bottles and packaging containers must bear the BIS ISI Mark.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Scheme with CM/L license number)",
    product_category: "Plastics / Food Contact Packaging / Water Bottles",
    key_parameters: [
      { parameter: "Overall Migration Limit", requirement: "Shall not exceed 60 mg/kg or 10 mg/dm² in contact with food/water simulants per IS 9845" },
      { parameter: "Drop Impact Test", requirement: "Filled bottles dropped from 1.2m height onto flat steel surface must show no rupture, leakage or cracking" },
      { parameter: "Transparency and Odour", requirement: "Free from offensive odour, taste, or contamination with water" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=15410",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/15410"
  },
  {
    standard_number: "IS 17526:2021",
    base_number: "17526",
    title: "Stainless Steel Vacuum Flasks / Insulated Water Bottles — Specification",
    scope: "Specifies requirements, performance criteria, thermal insulation retention, and test methods for stainless steel vacuum flasks, bottles, and thermal containers intended for holding drinking water and beverages.",
    status: "Active",
    edition: "First Edition (2021)",
    publication_year: "2021",
    amendments: "Current",
    mandatory_status: "Mandatory under the Domestic Stainless Steel and Aluminium Utensils Quality Control Order (QCO) issued by DPIIT. ISI Mark is compulsory before manufacture, import, or sale.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Certification with CM/L license)",
    product_category: "Utensils & Domestic Hardware / Thermal Bottles",
    key_parameters: [
      { parameter: "Thermal Retention Test", requirement: "Water temperature must remain >= 60°C after 6 hours when filled at 95°C" },
      { parameter: "Corrosion Resistance", requirement: "Passes 24-hour boiling water immersion and salt spray testing without staining or rusting" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=17526",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/17526"
  },
  {
    standard_number: "IS 16102 (Part 1):2012",
    base_number: "16102",
    title: "Self-Ballasted LED Lamps for General Lighting Services — Part 1: Safety Requirements",
    scope: "Specifies the safety and interchangeability requirements, together with the test methods and conditions required to show compliance of self-ballasted LED lamps for general lighting services having a rated wattage up to 60 W and a rated voltage up to 250 V. Covers insulation resistance, electric shock protection, mechanical strength, and cap temperature rise.",
    status: "Active",
    edition: "First Edition (Reaffirmed 2022)",
    publication_year: "2012",
    amendments: "Amendment No. 1, 2",
    mandatory_status: "Mandatory under the Electronics and Information Technology Goods (Requirements for Compulsory Registration) Order (CRS) notified by MeitY and BIS. Manufacturers and importers must obtain BIS CRS registration with unique R-number (R-XXXXXXXX) and conform to BEE mandatory star labelling.",
    certification_scheme: "Scheme II (Compulsory Registration Scheme - CRS with 'R-XXXXXXXX' registration mark)",
    product_category: "Lighting / Electronics & Information Technology / LED Lamps",
    key_parameters: [
      { parameter: "Safety Requirements", requirement: "Protection against electric shock, insulation resistance >= 4 MΩ, mechanical strength" },
      { parameter: "Cap Temperature Rise", requirement: "Cap temperature rise shall not exceed 120 K under operating conditions" },
      { parameter: "Registration Mark", requirement: "BIS CRS Logo with R-number displayed on packaging and lamp body" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=16102",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/16102"
  },
  {
    standard_number: "IS 10322 (Part 5/Sec 1):2012",
    base_number: "10322",
    title: "Luminaires — Part 5: Particular Requirements — Section 1: Fixed General Purpose Luminaires (including LED Luminaires)",
    scope: "Specifies requirements for fixed general purpose luminaires, including indoor/outdoor LED luminaires, batten lights, downlights, and panel lights on supply voltages up to 1000 V.",
    status: "Active",
    edition: "First Edition (Reaffirmed 2021)",
    publication_year: "2012",
    amendments: "Current",
    mandatory_status: "Mandatory under the Compulsory Registration Scheme (CRS) for fixed general purpose LED luminaires.",
    certification_scheme: "Scheme II (Compulsory Registration Scheme - CRS)",
    product_category: "Lighting / LED Luminaires",
    key_parameters: [
      { parameter: "Ingress Protection", requirement: "IP rating conformance depending on indoor/outdoor installation" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=10322",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/10322"
  },
  {
    standard_number: "IS 2346:1992",
    base_number: "2346",
    title: "Carbonated Beverages — Specification (Second Revision)",
    scope: "Prescribes the requirements and methods of sampling and test for carbonated beverages (soft drinks, aerated waters, and carbonated flavored drinks). Covers ingredients, gas volume carbonation, microbiological limits, hygienic conditions, and food-grade packaging.",
    status: "Active",
    edition: "Second Revision (Reaffirmed 2021)",
    publication_year: "1992",
    amendments: "Amendment No. 1, Amendment No. 2",
    mandatory_status: "Mandatory compliance under Food Safety and Standards (Food Products Standards and Food Additives) Regulations and BIS Certification Scheme I.",
    certification_scheme: "Scheme I (ISI Mark Scheme) / FSSAI Compliance",
    product_category: "Food and Agriculture / Drinks and Carbonated Beverages (FAD 14)",
    key_parameters: [
      { parameter: "Gas Volume (Carbonation)", requirement: "Minimum 1.0 volume of carbon dioxide for flavored drinks; minimum 2.0 volumes for club sodas / plain carbonated water" },
      { parameter: "Microbiological Safety", requirement: "Total plate count shall not exceed 50 cfu/ml; Coliform bacteria shall be absent in 100 ml" },
      { parameter: "Water Quality", requirement: "Potable water complying with IS 10500 treated to beverage-grade standards" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=2346",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/2346"
  },
  {
    standard_number: "IS 546:1975",
    base_number: "546",
    title: "Mustard Oil — Specification (Second Revision)",
    scope: "Prescribes the requirements and methods of sampling and test for mustard oil expressed or extracted from seeds of Brassica compestris (yellow or brown sarson) and Brassica juncea (rai). Covers raw, refined and filtered grades.",
    status: "Active",
    edition: "Second Revision (Reaffirmed 2020)",
    publication_year: "1975",
    amendments: "Amendments 1 to 4 incorporated",
    mandatory_status: "Mandatory compliance under FSSAI regulations and BIS Scheme I (ISI Mark). Pure mustard oil must be free from argemone oil and adulterants.",
    certification_scheme: "Scheme I (ISI Mark Scheme) / AGMARK / FSSAI",
    product_category: "Food and Agriculture / Oils and Oilseeds (FAD 44)",
    key_parameters: [
      { parameter: "Pungency / Allyl Isothiocyanate", requirement: "0.25 to 0.60 percent by mass (distinct natural pungency)" },
      { parameter: "Refractive Index at 40°C", requirement: "1.4646 to 1.4662" },
      { parameter: "Iodine Value (Wijs)", requirement: "98 to 110" },
      { parameter: "Argemone Oil Test", requirement: "Negative (Must be completely absent)" },
      { parameter: "Bellier Turbidity Temperature", requirement: "23.0°C to 27.5°C" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=546",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/546"
  },
  {
    standard_number: "IS 10633:2017",
    base_number: "10633",
    title: "Vanaspati — Specification (Third Revision)",
    scope: "Prescribes requirements and methods of sampling and test for Vanaspati (hydrogenated edible vegetable oils) manufactured from refined vegetable oils. Covers fatty acid composition, vitamin A fortification, melting point, and trans fatty acid limits.",
    status: "Active",
    edition: "Third Revision (Reaffirmed 2022)",
    publication_year: "2017",
    amendments: "Current",
    mandatory_status: "Mandatory BIS Certification (ISI Mark) under the Vegetable Oil Products (Regulation) Order and Section 16 of BIS Act.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Scheme)",
    product_category: "Food and Agriculture / Oils and Oilseeds (FAD 44)",
    key_parameters: [
      { parameter: "Melting Point (Slip point)", requirement: "31°C to 37°C" },
      { parameter: "Trans Fatty Acids", requirement: "Not more than 2% by mass (strictly regulated per FSSAI/BIS limit)" },
      { parameter: "Vitamin A Fortification", requirement: "Synthetic Vitamin A addition mandatory at minimum 25 IU per gram" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=10633",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/10633"
  },
  {
    standard_number: "IS 544:2014",
    base_number: "544",
    title: "Groundnut Oil — Specification (Third Revision)",
    scope: "Prescribes requirements and methods of sampling and test for groundnut (peanut) oil obtained by expression or solvent extraction from sound Arachis hypogaea seeds. Covers raw and refined grades.",
    status: "Active",
    edition: "Third Revision (Reaffirmed 2019)",
    publication_year: "2014",
    amendments: "Current",
    mandatory_status: "Regulated under Food Safety and Standards (Food Products Standards) Regulations; voluntary and mandatory ISI certification for commercial packing.",
    certification_scheme: "Scheme I (ISI Mark Scheme)",
    product_category: "Food and Agriculture / Oils and Oilseeds (FAD 44)",
    key_parameters: [
      { parameter: "Saponification Value", requirement: "188 to 196" },
      { parameter: "Iodine Value", requirement: "85 to 99" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=544",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/544"
  },
  {
    standard_number: "IS 8881:2014",
    base_number: "8881",
    title: "Blended Edible Vegetable Oils — Specification",
    scope: "Prescribes requirements for blended edible vegetable oils obtained by blending two edible vegetable oils where the proportion of any edible vegetable oil used in the blend is not less than 20 percent by mass.",
    status: "Active",
    edition: "Third Revision (Reaffirmed 2019)",
    publication_year: "2014",
    amendments: "Current",
    mandatory_status: "Mandatory Agmark / BIS Scheme I compliance under FSSAI Blended Edible Vegetable Oil Regulations.",
    certification_scheme: "Scheme I (ISI Mark Scheme)",
    product_category: "Food and Agriculture / Edible Oils and Fats (FAD 44)",
    key_parameters: [
      { parameter: "Constituent Oil Minimum", requirement: "Not less than 20% by weight of each constituent vegetable oil" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=8881",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/8881"
  },
  {
    standard_number: "IS 4985:2021",
    base_number: "4985",
    title: "Unplasticized PVC Pipes for Potable Water Supplies — Specification (Fourth Revision)",
    scope: "Prescribes requirements for plain and socket-ended unplasticized polyvinyl chloride (UPVC) pipes for potable water supplies, plumbing, tubewells, and agricultural irrigation.",
    status: "Active",
    edition: "Fourth Revision (2021)",
    publication_year: "2021",
    amendments: "Current",
    mandatory_status: "Mandatory BIS Certification (ISI Mark) under the Pipes and Fittings (Quality Control) Order.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Scheme)",
    product_category: "Civil Engineering / Plastic Piping System (CED 50)",
    key_parameters: [
      { parameter: "Hydrostatic Strength", requirement: "Withstands short-term and 1000-hour internal hydrostatic pressure test without bursting or leaking" },
      { parameter: "Lead Content / Toxic Leaching", requirement: "Conforms to heavy metal extraction safety limits for potable water" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=4985",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/4985"
  },
  {
    standard_number: "IS 15778:2007",
    base_number: "15778",
    title: "Chlorinated Polyvinyl Chloride (CPVC) Pipes for Potable Hot and Cold Water Distribution Supplies — Specification",
    scope: "Prescribes requirements for CPVC pipes used for residential, commercial and industrial potable hot and cold water distribution plumbing up to 93°C.",
    status: "Active",
    edition: "First Edition (Reaffirmed 2022)",
    publication_year: "2007",
    amendments: "Amendment No. 1, 2",
    mandatory_status: "Mandatory BIS Certification under CPVC Pipes Quality Control Order.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Scheme)",
    product_category: "Civil Engineering / Plastic Piping System (CED 50)",
    key_parameters: [
      { parameter: "Temperature Rating", requirement: "Safe continuous service at temperatures up to 82°C and short-term up to 93°C" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=15778",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/15778"
  },
  {
    standard_number: "IS 1239 (Part 1):2004",
    base_number: "1239",
    title: "Steel Tubes, Tubulars and Other Wrought Steel Fittings — Part 1: Steel Tubes (Light, Medium and Heavy)",
    scope: "Prescribes requirements for butt welded and seamless, screwed and socketed, and plain end mild steel tubes and galvanized iron (GI) tubes for water, non-hazardous gas, air and steam lines.",
    status: "Active",
    edition: "Sixth Revision (Reaffirmed 2019)",
    publication_year: "2004",
    amendments: "Current",
    mandatory_status: "Mandatory Certification (ISI Mark) under Steel Tubes Quality Control Order.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Scheme)",
    product_category: "Metallurgical Engineering / Steel Tubes and Pipes (MTD 19)",
    key_parameters: [
      { parameter: "Zinc Coating (GI pipes)", requirement: "Minimum 360 g/m² average zinc mass coating for corrosion resistance" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=1239",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/1239"
  },
  {
    standard_number: "IS 4984:2016",
    base_number: "4984",
    title: "High Density Polyethylene (HDPE) Pipes for Water Supply — Specification",
    scope: "Prescribes requirements for high density polyethylene (HDPE) pipes for potable water supplies, sewage conveyance, industrial effluent pipelines and agricultural micro-irrigation.",
    status: "Active",
    edition: "Fifth Revision (Reaffirmed 2021)",
    publication_year: "2016",
    amendments: "Current",
    mandatory_status: "Mandatory ISI Certification under Polyethylene Pipes Quality Control Order.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Scheme)",
    product_category: "Civil Engineering / Plastic Piping System (CED 50)",
    key_parameters: [
      { parameter: "Material Grade", requirement: "PE 63, PE 80, and PE 100 virgin grade polymer granules with carbon black UV stabilizer" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=4984",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/4984"
  },
  {
    standard_number: "IS 1489 (Part 1):2015",
    base_number: "1489",
    title: "Portland Pozzolana Cement — Specification — Part 1: Fly Ash Based (Third Revision)",
    scope: "Prescribes requirements for manufacture, chemical and physical properties of Portland Pozzolana Cement (PPC) using fly ash as pozzolanic admixture. Extensively used in residential, commercial and mass concrete construction.",
    status: "Active",
    edition: "Third Revision (Reaffirmed 2020)",
    publication_year: "2015",
    amendments: "Current",
    mandatory_status: "Mandatory BIS Certification (ISI Mark) under Cement (Quality Control) Order.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Scheme)",
    product_category: "Civil Engineering / Cement and Concrete (CED 2)",
    key_parameters: [
      { parameter: "Compressive Strength", requirement: "33 MPa minimum at 28 days" },
      { parameter: "Fly Ash Content", requirement: "15% to 35% by mass of cement" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=1489",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/1489"
  },
  {
    standard_number: "IS 455:2015",
    base_number: "455",
    title: "Portland Slag Cement — Specification (Fifth Revision)",
    scope: "Prescribes requirements for Portland Slag Cement (PSC) manufactured by intimately grinding Portland cement clinker and granulated blast furnace slag with addition of gypsum. Ideal for marine environments and sulfate attack resistance.",
    status: "Active",
    edition: "Fifth Revision (Reaffirmed 2020)",
    publication_year: "2015",
    amendments: "Current",
    mandatory_status: "Mandatory BIS Certification (ISI Mark) under Cement (Quality Control) Order.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Scheme)",
    product_category: "Civil Engineering / Cement and Concrete (CED 2)",
    key_parameters: [
      { parameter: "Slag Constituent", requirement: "25% to 70% by mass of cement" },
      { parameter: "Sulfate Resistance", requirement: "Superior resistance to sulfate and chloride penetration" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=455",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/455"
  },
  {
    standard_number: "IS 13252 (Part 1):2010 / IEC 60950-1:2005",
    base_number: "13252",
    title: "Information Technology Equipment — Safety — Part 1: General Requirements (Second Revision)",
    scope: "Specifies requirements intended to reduce risks of fire, electric shock or injury for the operator and layman who may come into contact with the equipment, including power adapters and battery chargers for mobile phones, cellular devices, tablets, laptops, and IT peripherals.",
    status: "Active",
    edition: "Second Revision (Reaffirmed 2020)",
    publication_year: "2010",
    amendments: "Amendment No. 1 (2012), Amendment No. 2 (2014), Amendment No. 3 (2015), Amendment No. 4 (2017)",
    mandatory_status: "Mandatory under the Compulsory Registration Scheme (CRS) notified by the Ministry of Electronics and Information Technology (MeitY) and BIS. All mobile phone chargers, power adapters, and SMPS power units must be registered with BIS and display the Standard Mark (R-XXXXXXXX) before manufacture, import, or sale.",
    certification_scheme: "Scheme II (Compulsory Registration Scheme - CRS with 'R-XXXXXXXX' registration mark)",
    product_category: "Electronics and Information Technology / Power Adapters & Chargers (LITD 07)",
    key_parameters: [
      { parameter: "Insulation & Electric Strength", requirement: "Reinforced insulation must withstand 3000 V AC dielectric voltage without breakdown" },
      { parameter: "Touch / Leakage Current", requirement: "Touch current shall not exceed 0.25 mA for Class II portable power adapters" },
      { parameter: "Marking Requirement", requirement: "BIS CRS Standard Mark with 'Self Declaration - Conforming to IS 13252 (Part 1):2010' and Registration Number R-XXXXXXXX" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=13252",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/13252"
  },
  {
    standard_number: "IS 2347:2017",
    base_number: "2347",
    title: "Domestic Pressure Cookers — Specification (Fifth Revision)",
    scope: "Prescribes the requirements for domestic pressure cookers made from aluminium alloys, stainless steel, or composite materials. Specifies safety mechanisms, maximum operating pressure, nominal capacity, hydrostatic pressure test, burst test, and safety relief device performance.",
    status: "Active",
    edition: "Fifth Revision (Reaffirmed 2022)",
    publication_year: "2017",
    amendments: "Amendment No. 1, 2",
    mandatory_status: "Mandatory Certification under the Domestic Pressure Cookers (Quality Control) Order issued by the Ministry of Consumer Affairs, Food and Public Distribution. Manufacture, import, distribution, or sale without ISI mark is strictly prohibited.",
    certification_scheme: "Scheme I (Mandatory ISI Mark Certification with CM/L license number)",
    product_category: "Mechanical Engineering / Cookware & Domestic Appliances (MED 33)",
    key_parameters: [
      { parameter: "Operating Pressure", requirement: "Standard operating pressure between 0.5 kgf/cm² and 1.1 kgf/cm² (50 kPa to 110 kPa)" },
      { parameter: "Hydrostatic Proof Pressure", requirement: "Vessel and lid assembly must withstand hydrostatic test pressure of 3 times normal operating pressure without leakage or distortion" },
      { parameter: "Safety Relief Device", requirement: "Fusible plug or secondary safety relief device operates safely between 1.3 to 2.0 times normal operating pressure" }
    ],
    source_url: "https://standards.bis.gov.in/gemini/browse-standards?is=2347",
    gazette_link: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/2347"
  }
];

module.exports = {
  BIS_STANDARDS_DATABASE
};
