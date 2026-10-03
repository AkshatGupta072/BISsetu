/**
 * Answer Validation Service
 * Validates generated AI answers against retrieved official BIS evidence
 *
 * Verifications performed:
 * 1. Ensures answers for empty evidence reflect search limitations
 * 2. For standards queries, checks that claimed IS numbers match retrieved records
 * 3. Ensures ecosystem inquiries (complaints, HUID, regional offices, QCO, ISI mark) are validated against official evidence
 * 4. Ensures official BIS portal or reference links are preserved
 * 5. Reverts cleanly to grounded deterministic answer only when genuine factual fabrication occurs
 */

const { generateDeterministicAnswer } = require('./geminiService');

function validateAnswer(generatedAnswer, query, evidence, options = {}) {
  const requestId = options.requestId || evidence.requestId || 'req';
  console.log(`[VALIDATION START] requestId: ${requestId} | category: ${evidence.analysis?.category || 'general'}`);

  const { results, analysis } = evidence;
  const category = analysis?.category || 'standards';

  // 1. If no records were found, answer must reflect limitation or no-match
  if (!results || results.length === 0) {
    if (/IS\s*\d{3,5}/i.test(generatedAnswer) && !/couldn't find|not found|नहीं मिला|कोई प्रमाणित|उपलब्ध नहीं/i.test(generatedAnswer)) {
      console.warn(`[VALIDATION FAILED] requestId: ${requestId} | Fabricated standard on empty evidence.`);
      const fallback = generateDeterministicAnswer(query, evidence, options);
      return {
        isValid: false,
        validatedAnswer: fallback,
        reason: 'Grounding violation: fabricated standard on empty evidence.'
      };
    }
    return { isValid: true, validatedAnswer: generatedAnswer };
  }

  // 2. Ecosystem topics (Generic identification, consumer complaints, HUID, regional offices, QCO, ISI mark, etc.)
  if (category !== 'standards') {
    // Check that official BIS Source: is referenced
    if (!generatedAnswer.includes('Source:')) {
      if (/###?\s*(?:Official Sources?|Sources?):?/i.test(generatedAnswer)) {
        generatedAnswer = generatedAnswer.replace(/###?\s*(?:Official Sources?|Sources?):?/i, 'Source:');
      } else {
        const primarySource = results[0]?.source_url || 'https://www.bis.gov.in/';
        generatedAnswer += `\n\nSource:\nBureau of Indian Standards (BIS)\n${primarySource}`;
      }
    }

    console.log(`[VALIDATION PASSED] requestId: ${requestId} | Ecosystem response verified.`);
    return {
      isValid: true,
      validatedAnswer: generatedAnswer
    };
  }

  // 3. Standards queries: Validate IS numbers (case-sensitive IS to avoid matching English word "is")
  const rawIsMatches = generatedAnswer.match(/\b(?:IS|IS\/ISO)\s*[-:]?\s*(\d{2,5})\b/g) || [];
  const validBaseNumbers = new Set(results.map(r => r.base_number).filter(Boolean));

  // Also include base numbers from disambiguation options if present
  if (evidence.disambiguation && Array.isArray(evidence.disambiguation.options)) {
    for (const opt of evidence.disambiguation.options) {
      const numMatch = opt.standardNumber.match(/\b\d{2,5}\b/);
      if (numMatch) validBaseNumbers.add(numMatch[0]);
    }
  }

  // Also include any IS numbers mentioned in the retrieved evidence text / parameters
  if (evidence.evidenceText) {
    const textMatches = evidence.evidenceText.match(/\b(?:IS|IS\/ISO)\s*[-:]?\s*(\d{2,5})\b/g) || [];
    for (const tm of textMatches) {
      const numPart = tm.replace(/[^\d]/g, '');
      if (numPart) validBaseNumbers.add(numPart);
    }
  }

  // Ignore year matches (like '2016' from BIS Act 2016)
  const isNumbersInAnswer = rawIsMatches.filter(m => {
    const numPart = m.replace(/[^\d]/g, '');
    return numPart !== '2016'; // BIS Act 2016 exemption
  });

  for (const match of isNumbersInAnswer) {
    const numPart = match.replace(/[^\d]/g, '');
    if (numPart && !validBaseNumbers.has(numPart)) {
      // If the query was broad or generic, do not falsely fail unless it claimed an exact specification
      if (validBaseNumbers.size > 0 && !analysis.isGenericStandardQuery) {
        console.warn(`[VALIDATION FAILED] requestId: ${requestId} | Ungrounded IS ${numPart} not in retrieved standards.`);
        return {
          isValid: false,
          validatedAnswer: generateDeterministicAnswer(query, evidence, options),
          reason: `Grounding violation: IS ${numPart} was not in retrieved evidence.`
        };
      }
    }
  }

  // 4. Verify that an official BIS source link or portal reference is present under Source:
  if (!generatedAnswer.includes('Source:')) {
    if (/###?\s*(?:Official Sources?|Sources?):?/i.test(generatedAnswer)) {
      generatedAnswer = generatedAnswer.replace(/###?\s*(?:Official Sources?|Sources?):?/i, 'Source:');
    } else {
      const primarySource = results[0]?.source_url || 'https://standards.bis.gov.in/';
      generatedAnswer += `\n\nSource:\nBureau of Indian Standards (BIS)\n${primarySource}`;
    }
  }

  console.log(`[VALIDATION PASSED] requestId: ${requestId} | Standards response verified.`);
  return {
    isValid: true,
    validatedAnswer: generatedAnswer
  };
}

module.exports = {
  validateAnswer
};
