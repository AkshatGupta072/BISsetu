/**
 * Authoritative Bureau of Indian Standards (BIS) Ecosystem Knowledge Base
 * Covers the COMPLETE official BIS ecosystem:
 * 1. Indian Standards Identification, Formulation & Directory
 * 2. BIS Product Certification (Scheme I - ISI Mark)
 * 3. BIS Licence, CM/L Number, Grant, Renewal & Modification
 * 4. ISI Mark Definition, Visual Elements & Verification
 * 5. Quality Control Orders (QCO) under Section 16 of BIS Act, 2016
 * 6. Mandatory vs Voluntary Certification Distinction
 * 7. Compulsory Registration Scheme (CRS) for Electronics & IT Goods
 * 8. Hallmarking & Hallmark Unique Identification (HUID)
 * 9. Testing & BIS Laboratory Network (LRS, Central & Regional Labs)
 * 10. Online Services, Applications & Manak Online Portal
 * 11. Fee Structure, Costs, Marking Fees & MSME Concessions
 * 12. Consumer Services, Grievance Redressal & BIS Care App
 * 13. BIS Regional Offices (ROs) & Branch Offices (BOs) Network
 * 14. BIS Branch Offices Directory & Regional Contacts (Jaipur, Delhi, Mumbai, etc.)
 * 15. BIS Laboratory Network Directory & Testing Facilities
 * 16. BIS Schemes, Flagship Programmes (Standards Clubs, Manak Rath, NITS)
 * 17. Notices, Circulars, Gazette Notifications & Amendments
 * 18. General BIS FAQ, History, Statutory Mandate & BIS vs ISI
 * 19. Official Documents, Product Manuals, Guidelines & Publications
 * 20. Multimodal Image Verification Guidelines (ISI, HUID, CM/L, CRS R-number)
 */

const BIS_ECOSYSTEM_DATABASE = [
  // 1. Generic Standard Identification & Search Methodology
  {
    id: "how_to_identify_standards",
    category: "standards_identification_generic",
    title: "Official Classification and Criteria for Identifying Indian Standards",
    official_source_name: "Bureau of Indian Standards (BIS) Standards Directory",
    source_url: "https://standards.bis.gov.in/",
    secondary_url: "https://www.services.bis.gov.in/",
    summary: "Authoritative criteria and technical classification structure utilized by the Bureau of Indian Standards (BIS) to categorize, formulate, and assign applicable Indian Standards for products.",
    key_points: [
      "Division Councils & Sectional Committees: Indian Standards are categorized across 15 Division Councils (CED Civil, ETD Electrotechnical, MED Mechanical, FAD Food & Agriculture, CHD Chemicals, LITD Electronics & IT, TXD Textiles, etc.). Each technical committee formulates standards defining precise scopes and testing limits.",
      "Product Scope & Codification: Every Indian Standard carries an IS number, publication year, and explicit scope defining the variants, components, materials, and operating thresholds covered (e.g., IS 10500 for Drinking Water, IS 4151 for Two-Wheeler Helmets).",
      "Quality Control Orders (QCO) Status: Central Government Ministries issue mandatory QCOs under Section 16 of the BIS Act 2016, making compliance and ISI marking legally compulsory for over 700+ notified products prior to manufacture, import, or sale.",
      "Product Manuals for Conformity Assessment: For all certified products, BIS maintains official Product Manuals specifying sampling procedures, testing schedules, and factory audit guidelines.",
      "Direct Verification: Users can directly provide any specific product or IS number to BISsetu to retrieve and verify the exact standard, parameters, and mandatory status without manual searching."
    ],
    procedure_steps: [
      "Determine the generic functional name, raw material, and intended application of the product.",
      "Match product technical specifications against the defined scope of relevant Indian Standards established by BIS Sectional Committees.",
      "Verify the standard's current edition, amendments, and whether it is notified under a mandatory Quality Control Order (QCO).",
      "Consult the official BIS Product Manual to determine sampling guidelines, testing parameters, and Scheme I certification requirements."
    ]
  },

  // 2. BIS Product Certification (Scheme I - ISI Mark)
  {
    id: "product_certification_scheme1",
    category: "product_certification",
    title: "BIS Product Certification Scheme (Scheme I - ISI Mark)",
    official_source_name: "Bureau of Indian Standards - Conformity Assessment / Scheme I",
    source_url: "https://www.bis.gov.in/product-certification/",
    secondary_url: "https://www.manakonline.in/",
    summary: "Official third-party conformity assessment scheme under which manufacturers obtain a licence to use the standard ISI Mark on their products, certifying compliance with relevant Indian Standards.",
    key_points: [
      "What is BIS Product Certification: A third-party conformity assessment granted under Scheme I of the BIS (Conformity Assessment) Regulations, 2018. It certifies that a manufactured product conforms to specified Indian Standards (IS).",
      "Two Application Routes: 1. Normal Procedure (Factory audit followed by sample testing in BIS labs, takes 60-90 days); 2. Simplified Procedure (Factory audit after self-testing in BIS-recognized NABL labs, licence granted within 30 days).",
      "Domestic vs Foreign Manufacturers: Domestic units apply via Manak Online (e-BIS); foreign manufacturers exporting to India apply under the Foreign Manufacturers Certification Scheme (FMCS).",
      "Validity & Scope: Licences are typically granted initially for 1 or 2 years, renewable up to 5 years upon payment of annual marking fees and satisfactory surveillance audit results.",
      "Key Requirements: In-house testing laboratory, qualified quality control personnel, compliance with Scheme of Testing and Inspection (STI), and adherence to the official Product Manual."
    ],
    procedure_steps: [
      "Identify the applicable Indian Standard and review the official BIS Product Manual.",
      "Establish in-house testing facilities and implement the Scheme of Testing and Inspection (STI).",
      "Submit an online application on Manak Online (manakonline.in) with required factory and technical documents.",
      "Pay the prescribed application fee and audit charges.",
      "Undergo factory verification audit by BIS technical officers and sample drawing for laboratory testing.",
      "Grant of BIS Licence (CM/L) upon satisfactory audit and independent lab test reports."
    ]
  },

  // 3. BIS Licence, CM/L Number, Renewal & Modification
  {
    id: "bis_licence_and_cml",
    category: "bis_licence",
    title: "BIS Licence, CM/L Number, Renewal, Modification & Status Verification",
    official_source_name: "Bureau of Indian Standards - Licences & Manak Online",
    source_url: "https://www.manakonline.in/",
    secondary_url: "https://www.services.bis.gov.in/",
    summary: "Complete statutory guidance on BIS licences, the unique 7-digit CM/L identifier, licence grant, renewal timelines, scope endorsements, and public verification.",
    key_points: [
      "What is a BIS Licence: A statutory authorization granted by BIS under the BIS Act, 2016 permitting a specific manufacturing unit to apply the Standard Mark (ISI mark) to designated varieties of products.",
      "CM/L Number Explained: CM/L stands for 'Certification Marks / License'. It is a unique 7-digit numeric code (e.g., CM/L-1234567) assigned to each licensed manufacturing location. A manufacturer with multiple factories receives separate CM/L numbers for each site.",
      "Licence Renewal Process: Licensees must apply for renewal on Manak Online at least 30 days before licence expiry, submit production data, declare marking details, and pay the annual minimum marking fee and renewal fee.",
      "Licence Modification / Endorsement: Additions of new product varieties, brand names, changes in manufacturing address, or alterations in testing equipment are processed via online Endorsement/Modification applications on Manak Online.",
      "Licence Verification: Any licence can be instantly verified on https://www.services.bis.gov.in/ or the BIS Care App under 'Verify License Details' using the 7-digit CM/L number or company name."
    ],
    procedure_steps: [
      "Log in to the licensee portal on Manak Online (manakonline.in).",
      "Select 'Licence Management' -> 'Apply for Renewal' or 'Apply for Endorsement / Modification'.",
      "Enter production volume, marking data, and attach updated quality control records.",
      "Pay the prescribed renewal/endorsement fees through the payment gateway.",
      "Receive updated statutory endorsement certificate with extended validity."
    ]
  },

  // 4. ISI Mark Definition & Verification
  {
    id: "what_is_isi_mark",
    category: "isi_mark",
    title: "BIS ISI Mark (Product Certification Scheme I)",
    official_source_name: "Bureau of Indian Standards - Product Certification",
    source_url: "https://www.bis.gov.in/product-certification/",
    secondary_url: "https://www.services.bis.gov.in/",
    summary: "The prestigious third-party product quality certification mark of the Bureau of Indian Standards, certifying compliance with relevant Indian Standards since 1955.",
    key_points: [
      "What is the ISI Mark: The ISI (Indian Standards Institute) Mark is the official product conformity mark of the Bureau of Indian Standards (BIS). It certifies that a product meets the stringent quality, safety, and performance criteria of the relevant Indian Standard (IS).",
      "Difference between BIS and ISI: BIS is the statutory National Standards Body of India (the organization). ISI is the certification mark (the mark) issued by BIS for products conforming to Indian Standards under Scheme I.",
      "Three Essential Visual Elements of Authentic ISI Marking: 1. The stylized ISI pyramid symbol, 2. The Indian Standard number (e.g. IS 10500, IS 4151) printed ABOVE the symbol, 3. The unique 7-digit Certification Marks / License number (CM/L-XXXXXXX) printed BELOW the symbol.",
      "Significance of CM/L Number: The 7-digit CM/L number identifies the specific manufacturing facility licensed by BIS. No generic ISI mark is valid without this unique license number.",
      "Mandatory vs Voluntary Certification: Certification is mandatory for products notified under Quality Control Orders (QCOs) by Government ministries (e.g., packaged drinking water, cement, steel, helmets, toys). For non-notified products, certification is voluntary as a quality benchmark.",
      "Consumer Verification via BIS Care App: Consumers can verify the authenticity of an ISI mark by entering the 7-digit CM/L number into the BIS Care App under 'Verify License Details' to confirm manufacturer name, factory address, standard, and license validity."
    ],
    procedure_steps: [
      "Locate the ISI pyramid mark on the product label or packaging.",
      "Check that the applicable Indian Standard number (e.g., IS 10500) appears above the mark.",
      "Check that the 7-digit CM/L license number (e.g., CM/L-1234567) appears below the mark.",
      "Open the official BIS Care Mobile App and tap 'Verify License Details'.",
      "Enter the 7-digit CM/L number to view live validity, manufacturer name, factory address, and product scope."
    ]
  },

  // 5. Quality Control Orders (QCO)
  {
    id: "what_is_a_qco",
    category: "qco_compliance",
    title: "Quality Control Orders (QCO) under the BIS Act, 2016",
    official_source_name: "Bureau of Indian Standards - Compulsory Certification / QCOs",
    source_url: "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/",
    secondary_url: "https://www.services.bis.gov.in/",
    summary: "Statutory orders issued by Central Government Ministries making adherence to Indian Standards and obtaining a BIS license legally compulsory before manufacture, import, or sale.",
    key_points: [
      "What is a QCO: A Quality Control Order (QCO) is a statutory order issued by Central Government Ministries (e.g. DPIIT, Ministry of Steel, MeitY, Ministry of Chemicals, MoHFW) exercising powers under Section 16 of the BIS Act, 2016.",
      "Mandatory Enforcement: Once a QCO comes into force, the specified Indian Standard(s) becomes legally mandatory. Products cannot be manufactured, imported, distributed, stocked, or sold without a valid BIS license and Standard Mark.",
      "Applicability to Domestic and Foreign Manufacturers: Both Indian factories (Scheme I) and foreign manufacturers exporting to India (Foreign Manufacturers Certification Scheme - FMCS) must obtain certification.",
      "Prohibitions & Penalties: Under Section 17 & 29 of the BIS Act 2016, selling non-certified goods covered under an active QCO is a criminal offense punishable by imprisonment up to two years, fines up to ₹5 lakh or value of goods, and confiscation.",
      "Consumer Safety & Industrial Quality: QCOs are notified in public interest to ensure consumer health, environmental protection, prevention of unfair trade practices, and national security.",
      "Product Sectors Covered: Over 700+ products are under mandatory QCOs, including steel, cement, toys, domestic electrical appliances, wires & cables, safety helmets, packaged drinking water, footwear, and industrial chemicals."
    ],
    procedure_steps: [
      "Check whether the product or Indian Standard is listed in the official BIS Compulsory Certification Directory (bis.gov.in).",
      "Review the specific Gazette Notification to confirm the implementation date, transition timelines, and MSME exemptions.",
      "Ensure the manufacturing facility holds a valid BIS licence before manufacturing or importing the product.",
      "Ensure every consignment carries the authentic Standard Mark (ISI mark or CRS mark) with valid licence/registration number."
    ]
  },

  // 6. Mandatory vs Voluntary Certification
  {
    id: "mandatory_vs_voluntary_certification",
    category: "mandatory_vs_voluntary",
    title: "Mandatory vs Voluntary BIS Certification Distinction",
    official_source_name: "Bureau of Indian Standards - Conformity Assessment Guidelines",
    source_url: "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/",
    secondary_url: "https://standards.bis.gov.in/",
    summary: "Statutory explanation of the fundamental legal difference between an Indian Standard and a mandatory certification requirement under Indian law.",
    key_points: [
      "Fundamental Principle: The mere existence of an Indian Standard does NOT automatically mean BIS certification is mandatory for that product.",
      "Voluntary by Default: Under the BIS Act 2016, Indian Standards are formulated as voluntary national quality standards by default, serving as technical specifications and benchmarks.",
      "When Certification Becomes Mandatory: Certification becomes legally compulsory ONLY when a Central Ministry issues a Quality Control Order (QCO) under Section 16 of the BIS Act 2016, or when another statutory regulator mandates it (such as FSSAI for packaged drinking water, or MeitY for electronics under CRS).",
      "Independent Verification Mandate: Never assume that because a product has an IS number, a licence is legally required. Mandatory status must be verified independently against the official Compulsory Certification list and Gazette QCOs.",
      "Voluntary Certification Benefits: For products not under mandatory QCOs, manufacturers can voluntarily apply for the ISI mark as a third-party mark of superior quality, enabling preference in public procurement and consumer trust."
    ]
  },

  // 7. Compulsory Registration Scheme (CRS) for Electronics & IT Goods
  {
    id: "compulsory_registration_scheme_crs",
    category: "crs_scheme",
    title: "Compulsory Registration Scheme (CRS) for Electronics & IT Goods",
    official_source_name: "Bureau of Indian Standards - CRS Department",
    source_url: "https://www.crsbis.in/",
    secondary_url: "https://www.bis.gov.in/",
    summary: "Self-declaration of conformity scheme under Scheme II of BIS Regulations, mandated by MeitY and other ministries for electronic, IT, and solar photovoltaic products.",
    key_points: [
      "What is CRS: The Compulsory Registration Scheme (CRS) is an expedited conformity assessment scheme (Scheme II) operated by BIS under the Electronics and Information Technology Goods (Requirement for Compulsory Registration) Order.",
      "Products Covered: Laptops, tablets, mobile phones, power adapters/chargers, LED lamps, televisions, smart watches, power banks, bluetooth speakers, servers, and solar PV modules.",
      "Self-Declaration of Conformity: Unlike Scheme I (ISI mark) which requires factory audits, CRS is based on Self-Declaration of Conformity backed by product sample testing in BIS-recognized labs in India.",
      "CRS Registration Number (R-Number): Registered products carry the standard BIS CRS statement: 'Self Declaration - Conforming to IS XXXXX (Part X)', along with the unique 8-digit Registration Number (e.g., R-XXXXXXXX) and website reference (www.bis.gov.in).",
      "Difference from ISI Mark: ISI mark is Scheme I (factory audit + regular surveillance, CM/L number, traditional products). CRS is Scheme II (test-report based self-declaration, R-number, electronics & IT goods).",
      "Portal & Verification: CRS applications and registrations are processed exclusively on https://www.crsbis.in/. Public verification of R-numbers is available on crsbis.in and the BIS Care App."
    ],
    procedure_steps: [
      "Register manufacturing unit profile on the official CRS portal (crsbis.in).",
      "Send product sample to a BIS-recognized testing laboratory in India for evaluation against the applicable Indian Standard.",
      "Receive approved test report from the laboratory (valid for 90 days from date of issue).",
      "Submit online application on crsbis.in with test report, undertaking, and authorized Indian representative (AIR) details for foreign factories.",
      "Grant of CRS Registration Number (R-number) by BIS CRS department.",
      "Affix the prescribed CRS mark with R-number on product and packaging before distribution or sale."
    ]
  },

  // 8. Hallmarking & HUID (Precious Metals)
  {
    id: "huid_hallmarking_overview",
    category: "hallmarking_huid",
    standard_number: "IS 1417:2016",
    base_number: "1417",
    title: "BIS Hallmark Unique Identification (HUID) & Gold Hallmarking System",
    official_source_name: "Bureau of Indian Standards - Hallmarking Department",
    source_url: "https://www.bis.gov.in/hallmarking-overview/",
    secondary_url: "https://www.services.bis.gov.in/",
    summary: "Official hallmarking scheme ensuring purity and authenticity of precious metals (gold and silver jewellery) using a 6-digit alphanumeric HUID code laser-etched at BIS Assaying & Hallmarking Centres.",
    key_points: [
      "What is HUID: HUID stands for Hallmark Unique Identification. It is a 6-digit alphanumeric code laser-engraved on each piece of hallmarked jewellery at BIS-recognized Assaying and Hallmarking Centres (AHC).",
      "Unique Identity & Traceability: Every jewellery item receives a distinct HUID number, ensuring complete traceability from the assaying centre and registered jeweller to the consumer, preventing fraud and duplicate hallmarking.",
      "Three Mandatory Marks on Gold Jewellery: 1. BIS Logo (Triangle), 2. Purity / Fineness Grade (e.g., 24K999, 22K916, 18K750, 14K585), and 3. 6-digit alphanumeric HUID code.",
      "Consumer Verification via BIS Care App: Consumers can verify any HUID code in the BIS Care App under 'Verify HUID'. It displays Jeweller Registration details, AHC name, hallmarking date, article type, and declared purity.",
      "Mandatory Status: Hallmarking is legally mandatory across designated districts in India under the Central Government Hallmarking Quality Control Orders.",
      "Assaying Standards: Conformity evaluated per IS 1417 (Gold & Gold Alloys Purity) and IS 15820 (AHC Competence) using precision Fire Assay testing (IS 1418)."
    ],
    procedure_steps: [
      "Inspect the jewellery piece for the 3 mandatory marks: BIS triangle, purity grade, and 6-digit HUID.",
      "Open the official BIS Care App on your smartphone.",
      "Select the 'Verify HUID' module and type the 6-digit alphanumeric code.",
      "Verify that the displayed details (article type, purity, jeweller, date) match your physical jewellery item and invoice."
    ]
  },

  // 9. Testing & Laboratories
  {
    id: "testing_and_laboratories",
    category: "testing_and_laboratories",
    title: "BIS Testing and Laboratory Network (LRS, Central & Regional Labs)",
    official_source_name: "Bureau of Indian Standards - Laboratory Department",
    source_url: "https://www.bis.gov.in/laboratories-overview/",
    secondary_url: "https://www.services.bis.gov.in/",
    summary: "Statutory laboratory infrastructure through which BIS evaluates product samples for initial grant of licence, market surveillance, consumer dispute resolution, and regulatory compliance.",
    key_points: [
      "BIS Laboratory Network: Comprises Central Laboratory (CL) at Sahibabad (NCR), 4 Regional Laboratories (Mohali/Chandigarh, Mumbai, Chennai, Kolkata), and 3 Branch Laboratories (Patna, Bengaluru, Guwahati).",
      "Laboratory Recognition Scheme (LRS): To meet nationwide testing demand, BIS recognizes hundreds of independent NABL-accredited commercial and government laboratories under the BIS Laboratory Recognition Scheme (LRS), 2020.",
      "Testing Disciplines: Chemical analysis, mechanical testing, electrical and electronic evaluation, microbiological assessment, civil engineering materials testing, and precious metal assaying.",
      "Testing Charges: Set according to official BIS schedules based on standard test methods, parameter complexity, and equipment requirements. Charges are paid online by applicants.",
      "How to Find a Recognized Lab: Users and manufacturers can search the official LRS Directory on services.bis.gov.in by product name or Indian Standard number to find nearest authorized testing facilities."
    ],
    procedure_steps: [
      "Identify the applicable Indian Standard and the specific testing clauses required.",
      "Visit the BIS Recognized Laboratories portal on https://www.services.bis.gov.in/ under 'Laboratory Recognition Scheme'.",
      "Search by IS Number to generate the live list of accredited BIS Central, Regional, and LRS-recognized private laboratories.",
      "Submit test samples accompanied by the official sample forwarding form and pay the prescribed testing fees.",
      "Obtain the official test report signed by authorized laboratory personnel."
    ]
  },

  // 10. Applications & Online Services (Manak Online Portal)
  {
    id: "applications_and_online_services",
    category: "online_services",
    title: "BIS Applications, Registration & Manak Online Portal Services",
    official_source_name: "Bureau of Indian Standards - Manak Online (e-BIS)",
    source_url: "https://www.manakonline.in/",
    secondary_url: "https://www.services.bis.gov.in/",
    summary: "The single-window digital governance platform (Manak Online) for submitting and tracking all BIS certification, hallmarking, laboratory recognition, and licence applications.",
    key_points: [
      "Manak Online Portal (manakonline.in): The unified digital interface for all online BIS services, including Product Certification (e-BIS), Compulsory Registration (CRS), Hallmarking, Standards Promotion, and Laboratory Recognition.",
      "Single-Window Registration: Applicants register an enterprise profile with PAN, Aadhaar/corporate identification, email, and mobile OTP verification.",
      "Online Document Submission: Factory premises proof, machinery list, manufacturing flowchart, testing equipment calibration certificates, quality personnel qualifications, and test reports are uploaded digitally.",
      "Real-Time Tracking: Applicants track application status at every phase: scrutiny, inspection scheduling, sample test reports, and licence issuance.",
      "Digital Payments: All statutory application, audit, and marking fees are paid securely via Bharatkosh or integrated payment gateways."
    ],
    procedure_steps: [
      "Visit https://www.manakonline.in/ and click 'Register' to create a user account.",
      "Log in and select the relevant module (Product Certification Scheme I, Hallmarking, or CRS).",
      "Fill out Form I (Application for Grant of Licence) and upload factory layout, machinery, and testing equipment lists.",
      "Pay application fees via the integrated online payment portal.",
      "Track application progression online through each technical review and inspection milestone."
    ]
  },

  // 11. Fees & Charges Structure
  {
    id: "fees_and_charges",
    category: "fees_and_charges",
    title: "BIS Fee Structure, Application Costs, Licence & Marking Charges",
    official_source_name: "Bureau of Indian Standards - Fee Schedules",
    source_url: "https://www.bis.gov.in/product-certification/fee-structure/",
    secondary_url: "https://www.manakonline.in/",
    summary: "Statutory fee guidelines and official cost components for obtaining and maintaining BIS product licences, hallmarking registration, and laboratory testing.",
    key_points: [
      "Key Fee Components: 1. Application Fee (Nominal, payable upon submission, typically ₹1,000); 2. Factory Audit / Inspection Charges (₹7,000 per auditor per day plus travel/stay); 3. Product Sample Testing Charges (paid to the evaluating lab per parameter); 4. Annual Licence Fee (₹1,000 per licence year); 5. Marking Fee (Annual volume-based fee with a stipulated minimum threshold).",
      "Minimum Marking Fee: Each product standard has a designated minimum marking fee payable at the time of grant and renewed annually based on declared production.",
      "Hallmarking Charges: Set at statutory rates per piece (e.g., ₹45 + GST per gold article, ₹35 + GST per silver article), ensuring nominal cost to consumers.",
      "MSME and Start-up Concessions: BIS offers substantial fee concessions (up to 50% discount on marking fees and application fees) for registered Micro enterprises, Women entrepreneurs, and DPIIT-recognized Startups.",
      "Live Fee Verification Mandate: Exact fee calculations depend on the specific product standard and production scale. Current fee tables must always be retrieved from official BIS schedules (bis.gov.in / manakonline.in) rather than estimated."
    ]
  },

  // 12. Consumer Complaints & Grievance Redressal
  {
    id: "consumer_complaint_procedure",
    category: "consumer_complaints",
    title: "BIS Consumer Grievance Redressal Mechanism & Complaint Lodging Procedure",
    official_source_name: "Bureau of Indian Standards - Consumer Affairs Department",
    source_url: "https://www.bis.gov.in/consumer-overview/",
    secondary_url: "https://www.services.bis.gov.in/",
    summary: "Comprehensive statutory mechanism for consumers to lodge complaints regarding defective certified products, misleading quality marks, or unauthorized misuse of BIS ISI / Hallmark marks.",
    key_points: [
      "BIS Care Mobile App: Official mobile tool (Android & iOS) with a dedicated 'Complaints' section to register grievances against substandard ISI-marked goods, hallmarked jewellery, CRS electronics, or counterfeit markings.",
      "e-BIS Online Consumer Grievance Portal: Official web portal on https://www.services.bis.gov.in/ and https://www.manakonline.in/ under 'Consumer Grievance / Public Grievance' providing online complaint registration and tracking.",
      "Consumer Affairs Department (CAD): Written grievances can be emailed to complaints@bis.gov.in / cad@bis.gov.in, or mailed to Head (CAD), BIS, Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110002.",
      "Required Details: Complainant contact details, product description, brand name, CM/L license number or 6-digit HUID code, purchase receipt/cash memo, and clear photos of the product and defect.",
      "Investigation & Testing: BIS technical officers inspect the manufacturer/retailer, draw samples for laboratory testing in BIS labs, and mandate product replacement or refund if found sub-standard.",
      "Enforcement & Penalties: Misuse of the BIS standard mark is a punishable offense under Section 29 of the BIS Act 2016, attracting raids, product seizure, heavy fines, and imprisonment up to 2 years."
    ],
    procedure_steps: [
      "Select the official channel (BIS Care Mobile App or e-BIS Consumer Grievance Portal).",
      "Specify the complaint category (Quality Complaint on certified product or Misuse of BIS Mark).",
      "Provide the product details, brand, and the 7-digit CM/L license number or 6-digit HUID.",
      "Submit proof of purchase (invoice/bill) along with photographs showing the defective product/marking.",
      "Receive and record the unique tracking ID for statutory status updates."
    ]
  },

  // 13. Role of BIS Regional Offices & Branch Network
  {
    id: "regional_offices_role",
    category: "regional_offices",
    title: "Role and Functions of BIS Regional and Branch Offices",
    official_source_name: "Bureau of Indian Standards - Regional & Branch Offices",
    source_url: "https://www.bis.gov.in/index.php/regional-branch-offices/",
    secondary_url: "https://www.services.bis.gov.in/",
    summary: "The statutory administrative and operational network through which BIS enforces conformity assessment, licensing, market surveillance, laboratory testing, and consumer protection across India.",
    key_points: [
      "Organizational Network: BIS operates across India through 5 Regional Offices (ROs) and over 30+ Branch Offices (BOs).",
      "Five Regional Offices (ROs): Northern Regional Office (NRO) - Chandigarh, Central Regional Office (CRO) - Sahibabad (Ghaziabad / NCR), Western Regional Office (WRO) - Mumbai, Southern Regional Office (SRO) - Chennai, and Eastern Regional Office (ERO) - Kolkata.",
      "Conformity Assessment & Licensing: Regional and Branch Offices evaluate factory infrastructure, conduct audits, draw samples, and grant BIS licenses (Scheme I ISI mark, Scheme IV FMCS, Hallmarking registration, MSCS).",
      "Factory & Market Surveillance: Officers conduct scheduled and unannounced audits at manufacturing units and purchase off-the-shelf market samples to ensure continued compliance with Indian Standards.",
      "Enforcement & Raids: Dedicated enforcement squads investigate complaints of fake ISI marks, conduct search-and-seizure raids on counterfeiters, and file criminal prosecutions under Section 29 of the BIS Act 2016.",
      "Laboratory Management: Regional offices supervise regional and branch testing laboratories for mechanical, chemical, electrical, and microbiological evaluation.",
      "Consumer Grievance Handling: Process consumer complaints within their regional jurisdiction and enforce corrective actions on licensees.",
      "Standards Promotion & MSME Support: Organize awareness campaigns, industry conclaves, handhold MSMEs for certification, and coordinate with State Level Advisory Committees (SLAC)."
    ]
  },

  // 14. BIS Branch Offices Directory & Regional Contacts
  {
    id: "bis_offices_directory",
    category: "bis_offices",
    title: "BIS Regional and Branch Offices Directory (Jaipur, Delhi, Mumbai, etc.)",
    official_source_name: "Bureau of Indian Standards - Directory of Branch Offices",
    source_url: "https://www.bis.gov.in/index.php/regional-branch-offices/",
    secondary_url: "https://www.services.bis.gov.in/",
    summary: "Authoritative geographic directory of key BIS Branch and Regional Offices across India, including addresses, jurisdictions, and communication channels.",
    key_points: [
      "BIS Jaipur Branch Office (Rajasthan): Located at 'Prithviraj Road, C-Scheme, Jaipur - 302005, Rajasthan'. Handles conformity assessment, factory audits, market surveillance, and hallmarking enforcement across Rajasthan under Northern Region.",
      "BIS Delhi & NCR Offices (Manak Bhavan & CRO): Headquarters at Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110002; Central Regional Office at Sahibabad Industrial Area, Ghaziabad (UP) 201010.",
      "BIS Mumbai Branch & Western Regional Office (WRO): Located at Manakalaya, E9, MIDC, Andheri (East), Mumbai 400093. Supervises Maharashtra, Gujarat, Goa, and Madhya Pradesh branches.",
      "BIS Southern Regional Office (SRO - Chennai): Located at CIT Campus, IV Cross Road, Taramani, Chennai 600113. Oversees Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, and Telangana.",
      "BIS Eastern Regional Office (ERO - Kolkata): Located at 1/14 C.I.T. Scheme VII M, V.I.P. Road, Kankurgachi, Kolkata 700054. Oversees West Bengal, Odisha, Bihar, Jharkhand, and North Eastern States.",
      "Other Key Branch Offices: Ahmedabad (Gujarat), Bengaluru (Karnataka), Hyderabad (Telangana), Lucknow (Uttar Pradesh), Bhopal (Madhya Pradesh), Patna (Bihar), Chandigarh (Punjab & Haryana), Guwahati (Assam & North East), Pune (Maharashtra), Kochi (Kerala).",
      "Contact Channel: Dedicated email formats typically follow `<city>bo@bis.gov.in` (e.g., `jpbo@bis.gov.in` for Jaipur) and telephone helplines listed on bis.gov.in."
    ]
  },

  // 15. BIS Laboratories Directory & Testing Facilities
  {
    id: "bis_laboratories_directory",
    category: "bis_laboratories",
    title: "BIS Laboratory Network Directory & Testing Facilities",
    official_source_name: "Bureau of Indian Standards - Central & Regional Laboratories",
    source_url: "https://www.bis.gov.in/laboratories-overview/",
    secondary_url: "https://www.services.bis.gov.in/",
    summary: "Directory of BIS in-house testing laboratories and capabilities across regional centres and state branches.",
    key_points: [
      "Central Laboratory (Sahibabad): Plot No. 20/9, Site IV, Sahibabad Industrial Area, Ghaziabad 201010. Premier testing institution equipped for high-precision chemical, electrical, mechanical, and microbiological conformity testing.",
      "Northern Regional Laboratory (NRL Mohali): Plot No. 4A, Sector 27B, Mohali, Punjab 160019. Caters to industrial units in Punjab, Haryana, Himachal Pradesh, Jammu & Kashmir, and Chandigarh.",
      "Western Regional Laboratory (WRL Mumbai): Manakalaya, Andheri (East), Mumbai 400093. Comprehensive testing facilities for plastics, chemicals, electrical goods, and metallurgical products.",
      "Southern Regional Laboratory (SRL Chennai): Taramani, Chennai 600113. Key testing centre for electrical appliances, cement, cables, and mechanical engineering products.",
      "Eastern Regional Laboratory (ERL Kolkata): V.I.P. Road, Kankurgachi, Kolkata 700054. Specializes in steel, civil materials, chemicals, and consumer products.",
      "Testing in Rajasthan / Jaipur: Handled through regional testing coordination and extensive network of NABL-accredited BIS-recognized commercial laboratories in Jaipur, Kota, and Udaipur under the Laboratory Recognition Scheme (LRS)."
    ]
  },

  // 16. BIS Schemes & Flagship Programmes
  {
    id: "bis_departments_and_schemes",
    category: "bis_departments_schemes",
    title: "BIS Operational Departments & Flagship Initiatives",
    official_source_name: "Bureau of Indian Standards",
    source_url: "https://www.bis.gov.in/",
    secondary_url: "https://www.manakonline.in/",
    summary: "Overview of key technical and consumer departments within BIS and flagship programmes designed to promote quality infrastructure and consumer consciousness across India.",
    key_points: [
      "Standards Promotion Department (SPD): Fosters quality culture by driving outreach programs, organizing youth clubs, and engaging industry associations.",
      "Consumer Affairs Department (CAD): Coordinates grievance redressal, oversees consumer awareness programs, and handles public outreach.",
      "Central Marks Department (CMD): Formulates policies for Conformity Assessment (Product Certification Scheme I / ISI Mark).",
      "National Institute of Training for Standardization (NITS): National training academy located in Noida providing technical training to industry professionals, laboratory personnel, and international delegates.",
      "Standards Clubs in Schools and Colleges: Established by BIS across educational institutions to educate students on standard formulation, quality evaluation, and consumer rights.",
      "Manak Rath: Mobile exhibition vans deployed across districts demonstrating testing methods, ISI mark verification, and hallmarking awareness directly to citizens.",
      "Foreign Manufacturers Certification Scheme (FMCS): Dedicated certification program permitting overseas manufacturers to obtain BIS ISI mark licence for exports to India."
    ]
  },

  // 17. Notices, Circulars, Notifications & Updates
  {
    id: "notices_circulars_updates",
    category: "notices_circulars",
    title: "BIS Notices, Circulars, Gazette Notifications & Updates",
    official_source_name: "Bureau of Indian Standards - Notifications & Circulars",
    source_url: "https://www.bis.gov.in/notifications-circulars/",
    secondary_url: "https://www.manakonline.in/",
    summary: "Official repository of regulatory circulars, Quality Control Order implementation dates, gazette notifications, and standards amendments published by BIS.",
    key_points: [
      "Fresh Retrieval Requirement: Regulatory circulars, notification dates, and QCO enforcement schedules are subject to ongoing government revisions and require fresh official retrieval.",
      "Gazette Notifications: Central Government notifications issued under Section 16 of the BIS Act 2016 specifying new products brought under mandatory certification and transition timelines.",
      "Implementation Circulars: Guidelines issued by BIS Directorates explaining procedural changes, testing waivers, MSME relief measures, or revisions in Indian Standards.",
      "Draft Standards under Wide Circulation: Indian Standards in the drafting stage made publicly available on standards.bis.gov.in for public comment and technical review prior to formal gazettal.",
      "Access Portals: All active circulars and notifications are published in the 'What's New' and 'Notifications / Circulars' sections on bis.gov.in and manakonline.in."
    ]
  },

  // 18. General BIS FAQ, History & Mandate
  {
    id: "general_bis_information_faq",
    category: "general_bis",
    title: "General BIS Overview: Mandate, History, Functions & FAQs",
    official_source_name: "Bureau of Indian Standards - About BIS",
    source_url: "https://www.bis.gov.in/about-bis/",
    secondary_url: "https://standards.bis.gov.in/",
    summary: "Authoritative background on the origin, statutory authority under the BIS Act, 2016, organizational structure, and national responsibilities of the Bureau of Indian Standards.",
    key_points: [
      "What is BIS: The Bureau of Indian Standards (BIS) is the statutory National Standards Body of India, established under the Bureau of Indian Standards Act, 2016 (originally established under the BIS Act 1986, succeeding the Indian Standards Institution founded on 6 January 1947).",
      "Headquarters: Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110002.",
      "Administrative Ministry: Operates under the Ministry of Consumer Affairs, Food and Public Distribution, Government of India.",
      "Core Functions: 1. Harmonious formulation of Indian Standards; 2. Third-party product conformity assessment (ISI Mark); 3. Hallmarking of precious metals; 4. Compulsory Registration Scheme (CRS) for electronics; 5. Operation of testing laboratories; 6. Consumer protection and market surveillance; 7. Representation of India at international standardization bodies (ISO, IEC).",
      "Difference between BIS and ISI: BIS is the organization/governing body. ISI (Indian Standards Institute) is the certification mark licensed by BIS for certified products.",
      "Who Can Apply: Any legitimate manufacturer (domestic or foreign) possessing manufacturing premises and necessary quality testing equipment can apply for a BIS licence."
    ]
  },

  // 19. Documents, Product Manuals & Publications
  {
    id: "documents_manuals_publications",
    category: "documents_publications",
    title: "Official BIS Documents, Product Manuals, Guidelines & Publications",
    official_source_name: "Bureau of Indian Standards - Documents & Publications",
    source_url: "https://www.bis.gov.in/product-certification/product-specific-information/",
    secondary_url: "https://standards.bis.gov.in/",
    summary: "Technical manuals, Scheme of Testing and Inspection (STI), guidelines for grant of licence, and standards catalogues published by BIS.",
    key_points: [
      "Product Manuals for Conformity Assessment: Exhaustive official documents published for each certified product standard specifying scope, sampling criteria, grouping guidelines, and raw material controls.",
      "Scheme of Testing and Inspection (STI): Statutory document defining routine factory tests, testing frequencies, and maintenance of quality control logbooks required for licensees.",
      "Guidelines for Grant of Licence: Document outlining verification procedures under Normal and Simplified routes.",
      "Indian Standards Catalogue: Complete repository of active, revised, and superseded Indian Standards accessible on standards.bis.gov.in.",
      "Official Document Access: All product manuals and application guidelines are freely accessible on bis.gov.in under 'Product Specific Information' and manakonline.in."
    ]
  },

  // 20. Multimodal Image Verification Guidelines
  {
    id: "image_verification_guide",
    category: "image_verification",
    title: "Methodology for Verifying BIS Markings from Product Images",
    official_source_name: "Bureau of Indian Standards - Verification Guidelines",
    source_url: "https://www.services.bis.gov.in/",
    secondary_url: "https://www.bis.gov.in/",
    summary: "Technical procedure for identifying, reading, and verifying product labels, ISI marks, HUID codes, and CRS registration marks submitted via product photographs.",
    key_points: [
      "Image Reading Workflow: 1. Read printed text and logos; 2. Identify the regulatory mark type (ISI mark, HUID code, or CRS mark); 3. Extract the unique identifier (7-digit CM/L number, 6-digit HUID, or 8-digit CRS R-number); 4. Query official BIS verification databases; 5. Verify live validity and product match.",
      "ISI Mark Verification: Confirm that the IS number appears on top and the 7-digit CM/L number appears below the pyramid symbol. Check the CM/L in the BIS Care App or services.bis.gov.in.",
      "Gold Jewellery Image Verification: Check for the BIS triangular logo, purity marking (e.g., 22K916), and 6-digit alphanumeric HUID. Verify HUID on the BIS Care App.",
      "Electronics & IT Goods Verification: Look for the BIS CRS mark containing the standard number and 'R-XXXXXXXX'. Verify the registration number on crsbis.in.",
      "Anti-Fabrication Principle: Authentic status cannot be judged solely from visual appearance on packaging. The unique license/registration number must be verified against official BIS registries."
    ]
  }
];

module.exports = {
  BIS_ECOSYSTEM_DATABASE
};
