/**
 * Agent Reach Web Retrieval Service for BISsetu
 * 
 * Provides an autonomous web retrieval layer for official BIS information:
 * - Targeted web search for official BIS portals (*.bis.gov.in, standards.bis.gov.in, manakonline.in)
 * - Source classification and strict ranking (Exact BIS > Other BIS > Official Gov > Third-Party)
 * - Webpage content reading (via Jina Reader and direct HTTP fallback)
 * - Evidence extraction and relevance scoring
 * - Structured logging as specified by the system architecture
 */

const { URL } = require('url');

/**
 * Determines whether Agent Reach Web Retrieval should be triggered
 * Avoids searching the entire internet for every query; triggers when:
 * 1. Existing RAG has insufficient evidence (count === 0)
 * 2. Query explicitly asks for current/latest/recent/updated information
 * 3. Query is about QCOs, licences, fees, offices, contacts, circulars, CRS, or labs
 * 4. A specific official BIS source or portal needs to be located
 */
function shouldTriggerAgentReach(query, analysis, existingResults = [], options = {}) {
  if (!query || typeof query !== 'string') return false;
  const qLower = query.toLowerCase().trim();

  // 1. Explicit option flag from planner
  if (options.requiresFreshWebRetrieval) {
    return true;
  }

  // 2. Insufficient evidence in local indexed RAG
  if (!existingResults || existingResults.length === 0) {
    return true;
  }

  // 3. Query explicitly requests current / latest / active / new information
  if (/\b(latest|current|recent|new|updated?|active|today|now|circular|gazette\s+copy|notification|amendment)\b/i.test(qLower)) {
    return true;
  }

  // 4. Domains that require fresh official web retrieval per specification
  const freshRetrievalCategories = [
    'qco_compliance',
    'bis_licence',
    'fees_and_charges',
    'bis_offices',
    'bis_laboratories',
    'notices_circulars',
    'crs_scheme',
    'consumer_complaints',
    'online_services'
  ];
  if (analysis?.category && freshRetrievalCategories.includes(analysis.category)) {
    return true;
  }

  const procedureKeywords = /\b(qco|complaint|grievance|shikayat|portal|website|link|procedure|how\s+to\s+file|where\s+to\s+apply|regional\s+office|branch\s+office|jaipur|department|scheme|manakonline|e-bis|crs|fee|fees|cost|charge|charges|licence\s+renewal|lab\s+near\s+me)\b/i;
  if (procedureKeywords.test(qLower)) {
    return true;
  }

  return false;
}

/**
 * Classifies a URL into the 4-tier hierarchy:
 * 1. Exact official BIS source
 * 2. Other official BIS source
 * 3. Relevant official government source
 * 4. Other sources (only if official evidence is unavailable)
 */
function classifySource(urlStr) {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();

    // Tier 1: Exact official BIS primary portals
    const exactBisHosts = [
      'standards.bis.gov.in',
      'www.bis.gov.in',
      'bis.gov.in',
      'services.bis.gov.in',
      'www.services.bis.gov.in',
      'manakonline.in',
      'www.manakonline.in',
      'crsbis.in',
      'www.crsbis.in',
      'e-bis.gov.in',
      'www.e-bis.gov.in'
    ];

    if (exactBisHosts.includes(host)) {
      return {
        sourceDomain: host,
        sourceType: 'Exact official BIS source',
        isOfficialBIS: true,
        rank: 1
      };
    }

    // Tier 2: Other official BIS sources / subdomains
    if (host.endsWith('.bis.gov.in') || host.endsWith('.manakonline.in') || host === 'bis.org.in' || host.endsWith('.bis.org.in')) {
      return {
        sourceDomain: host,
        sourceType: 'Other official BIS source',
        isOfficialBIS: true,
        rank: 2
      };
    }

    // Tier 3: Relevant official government source (.gov.in or .nic.in)
    if (host.endsWith('.gov.in') || host.endsWith('.nic.in')) {
      return {
        sourceDomain: host,
        sourceType: 'Relevant official government source',
        isOfficialBIS: false,
        rank: 3
      };
    }

    // Tier 4: Other sources
    return {
      sourceDomain: host,
      sourceType: 'Other source',
      isOfficialBIS: false,
      rank: 4
    };
  } catch (err) {
    return {
      sourceDomain: 'unknown',
      sourceType: 'Other source',
      isOfficialBIS: false,
      rank: 5
    };
  }
}

/**
 * Calculates keyword-based relevance score for a search result
 */
function calculateRelevance(title, snippet, query) {
  if (!query) return 'low';
  const cleanQ = query.toLowerCase();
  const text = `${title} ${snippet}`.toLowerCase();

  // If query is specifically looking for an IS number (e.g. 10500, 99999, 99999999)
  const numMatches = cleanQ.match(/\b\d{3,8}\b/g);
  if (numMatches) {
    const hasAnyNum = numMatches.some(num => text.includes(num));
    if (!hasAnyNum) {
      return 'low';
    }
  }

  // Meaningful tokens ignoring generic stop words
  const stopWords = new Set(['what', 'how', 'the', 'for', 'can', 'with', 'and', 'are', 'is', 'a', 'an', 'in', 'of', 'to', 'bis', 'standard', 'standards', 'indian']);
  const tokens = cleanQ.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  
  if (tokens.length === 0) {
    return text.includes('bis') ? 'medium' : 'low';
  }

  let matches = 0;
  for (const token of tokens) {
    if (text.includes(token)) matches++;
  }

  const ratio = matches / tokens.length;
  if (ratio >= 0.4) {
    return 'high';
  } else if (ratio >= 0.2) {
    return 'medium';
  }
  return 'low';
}

/**
 * Web search targeting official BIS ecosystem
 * Uses lightweight zero-config search parser
 */
async function searchWeb(query, options = {}) {
  const maxResults = options.maxResults || 6;
  
  // Construct targeted queries: prioritize official BIS domains
  const targetQuery = query.toLowerCase().includes('bis') ? query : `${query} BIS Bureau of Indian Standards`;
  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(targetQuery)}`;

  try {
    const res = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) {
      return [];
    }

    const html = await res.text();
    const rawResults = [];
    
    // Parse result blocks from DuckDuckGo HTML
    const resultBlocks = [...html.matchAll(/<div[^>]+class="[^"]*result__body[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)];

    for (const blockMatch of resultBlocks) {
      const block = blockMatch[1];
      const linkMatch = block.match(/<a[^>]+class="[^"]*result__url[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i) ||
                        block.match(/<a[^>]+href="([^"]+)"/i);
      const titleMatch = block.match(/<a[^>]+class="[^"]*result__title[^"]*"[^>]*>([\s\S]*?)<\/a>/i) ||
                         block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
      const snippetMatch = block.match(/<a[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/i) ||
                           block.match(/<div[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

      if (linkMatch) {
        let rawUrl = linkMatch[1];
        if (rawUrl.includes('uddg=')) {
          try {
            rawUrl = decodeURIComponent(rawUrl.split('uddg=')[1].split('&')[0]);
          } catch (e) {
            // Keep rawUrl
          }
        }

        // Exclude ads or trackers
        if (!rawUrl.startsWith('http')) continue;
        if (rawUrl.includes('duckduckgo.com') || rawUrl.includes('yandex') || rawUrl.includes('bing')) continue;

        const rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'BIS Official Information';
        const rawSnippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';

        rawResults.push({
          title: rawTitle,
          url: rawUrl,
          snippet: rawSnippet
        });

        if (rawResults.length >= maxResults * 2) break;
      }
    }

    return rawResults;
  } catch (err) {
    console.warn(`[AGENT REACH WARN] Web search failed or timed out: ${err.message}`);
    return [];
  }
}

/**
 * Reads webpage content via Jina Reader (Agent Reach standard reader) with fast fallback
 */
async function readWebPage(url, options = {}) {
  const timeoutMs = options.timeoutMs || 5000;

  // 1. Try Jina Reader (Converts live web page to clean markdown)
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const res = await fetch(jinaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BISsetu-Agent-Reach/1.0',
        'Accept': 'text/plain'
      },
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 100 && !text.includes('AuthenticationRequiredError')) {
        return cleanPageContent(text);
      }
    }
  } catch (err) {
    // Continue to direct fetch fallback
  }

  // 2. Direct fetch fallback for official BIS pages
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Accept': 'text/html,text/plain'
      },
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (res.ok) {
      const html = await res.text();
      // Extract text content from html
      const cleaned = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return cleanPageContent(cleaned);
    }
  } catch (err) {
    // Return empty if unreachable
  }

  return '';
}

/**
 * Cleans extracted web content by filtering navigation junk, headers, footers, and scripts
 */
function cleanPageContent(rawText) {
  if (!rawText) return '';

  // 1. If markdown has an article heading (# Title) followed by body text
  const headingMatches = [...rawText.matchAll(/^#\s+(.+)$/gm)];
  if (headingMatches.length > 0) {
    const contentHeading = headingMatches.find(m => !m[1].toLowerCase().includes('main menu') && !m[1].toLowerCase().includes('navigation'));
    if (contentHeading) {
      const startIdx = contentHeading.index;
      const afterHeading = rawText.substring(startIdx);
      const bodyLines = afterHeading.split('\n')
        .map(l => l.trim())
        .filter(l => {
          if (l.length < 15) return false;
          if (l.startsWith('*   [') && (l.includes('Overview') || l.includes('Annual Report') || l.includes('Governing Council') || l.includes('Standards') || l.includes('Statement'))) return false;
          if (l.includes('![Image') || l.includes('Pause|Play')) return false;
          return true;
        });
      if (bodyLines.length > 0) {
        return bodyLines.slice(0, 8).join('\n\n').substring(0, 1500).trim();
      }
    }
  }

  // 2. Fallback: take substantive informational lines
  const lines = rawText.split('\n')
    .map(l => l.trim())
    .filter(l => {
      if (l.length < 25) return false;
      if (l.startsWith('*   [')) return false;
      if (/^(home|about us|contact us|menu|navigation|cookie|all rights reserved|javascript:)/i.test(l)) return false;
      if (l.includes('![Image') || l.includes('logo-strip')) return false;
      return true;
    });

  const substantive = lines.slice(0, 8).join('\n\n');
  return substantive.substring(0, 1500).trim();
}

/**
 * Filters, ranks, and structures retrieved sources
 * Stored Schema per user request:
 * {
 *   "title": "...",
 *   "url": "...",
 *   "sourceDomain": "...",
 *   "sourceType": "...",
 *   "content": "...",
 *   "relevance": "...",
 *   "isOfficialBIS": true/false
 * }
 */
function filterAndRankSources(rawResults, query) {
  const structured = rawResults.map(item => {
    const classification = classifySource(item.url);
    const relevance = calculateRelevance(item.title, item.snippet, query);

    return {
      title: item.title,
      url: item.url,
      sourceDomain: classification.sourceDomain,
      sourceType: classification.sourceType,
      content: item.snippet || '',
      relevance: relevance,
      isOfficialBIS: classification.isOfficialBIS,
      _rank: classification.rank
    };
  });

  // Only accept sources that have at least medium relevance to the query
  const relevant = structured.filter(s => s.relevance === 'high' || s.relevance === 'medium');
  if (relevant.length === 0) {
    return [];
  }

  // Source Ranking Rule:
  // 1. Exact official BIS source
  // 2. Other official BIS source
  // 3. Relevant official government source
  // 4. Other sources only if official evidence is unavailable
  const hasOfficial = relevant.some(s => s._rank <= 2);
  const filtered = hasOfficial 
    ? relevant.filter(s => s._rank <= 2)
    : relevant.filter(s => s._rank <= 3);

  // Sort by rank ascending, then relevance
  filtered.sort((a, b) => {
    if (a._rank !== b._rank) return a._rank - b._rank;
    const relWeight = { high: 3, medium: 2, low: 1 };
    return (relWeight[b.relevance] || 0) - (relWeight[a.relevance] || 0);
  });

  // Remove internal helper _rank property before saving
  return filtered.map(({ _rank, ...rest }) => rest);
}

/**
 * Orchestrates Agent Reach Web Retrieval
 * 1. Checks trigger condition
 * 2. Searches targeted web sources
 * 3. Classifies and ranks official sources
 * 4. Reads top official BIS webpages
 * 5. Extracts verified evidence
 */
async function performAgentReachRetrieval(query, analysis, existingResults = [], options = {}) {
  const requestId = options.requestId || 'req-' + Date.now();
  const isTriggered = shouldTriggerAgentReach(query, analysis, existingResults, options);

  if (!isTriggered) {
    console.log(`[AGENT REACH SEARCH] requestId: ${requestId} | performed: false | query: "${query}" | reason: indexed RAG sufficient`);
    return {
      performed: false,
      sources: [],
      officialBisFound: 0,
      extractedEvidenceText: ''
    };
  }

  console.log(`[AGENT REACH SEARCH] requestId: ${requestId} | performed: true | query: "${query}"`);

  // 1. Search Web with Query Refinement Feedback Loop
  let rawResults = await searchWeb(query, options);
  let rankedSources = filterAndRankSources(rawResults, query);

  // If initial search yielded no official BIS sources, refine with expanded queries
  if (rankedSources.filter(s => s.isOfficialBIS).length === 0 && Array.isArray(options.expandedQueries)) {
    for (const expQuery of options.expandedQueries.slice(0, 3)) {
      if (expQuery.toLowerCase().trim() === query.toLowerCase().trim()) continue;
      console.log(`[AGENT REACH REFINEMENT] requestId: ${requestId} | trying refined query: "${expQuery}"`);
      const refinedResults = await searchWeb(expQuery, options);
      if (refinedResults.length > 0) {
        const combined = [...rawResults, ...refinedResults];
        const newRanked = filterAndRankSources(combined, query);
        if (newRanked.some(s => s.isOfficialBIS)) {
          rawResults = combined;
          rankedSources = newRanked;
          break;
        }
      }
    }
  }

  const officialBisFound = rankedSources.filter(s => s.isOfficialBIS).length;

  console.log(`[AGENT REACH RESULTS] requestId: ${requestId} | official BIS found: ${officialBisFound} | total: ${rankedSources.length}`);

  // 3. Select top official sources to read (up to 2)
  const topSources = rankedSources.slice(0, 2);

  for (const source of topSources) {
    if (source.isOfficialBIS && source.url) {
      const pageText = await readWebPage(source.url, { timeoutMs: 4000 });
      if (pageText && pageText.length > 50) {
        source.content = pageText;
      }
    }
  }

  // 4. Build Evidence Text for Gemini
  let extractedEvidenceText = '';
  if (topSources.length > 0) {
    extractedEvidenceText = topSources.map((s, idx) => {
      return `[AGENT REACH OFFICIAL BIS WEB EVIDENCE ${idx + 1}]
  Title: ${s.title}
  URL: ${s.url}
  Source Type: ${s.sourceType} (Official BIS: ${s.isOfficialBIS ? 'Yes' : 'No'})
  Verified Web Information:
  ${s.content}`;
    }).join('\n\n');
  }

  return {
    performed: true,
    sources: topSources,
    officialBisFound,
    extractedEvidenceText
  };
}

module.exports = {
  shouldTriggerAgentReach,
  classifySource,
  calculateRelevance,
  searchWeb,
  readWebPage,
  cleanPageContent,
  filterAndRankSources,
  performAgentReachRetrieval
};
