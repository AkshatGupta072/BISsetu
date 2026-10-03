/**
 * BISsetu - BIS AI Assistant Backend Server
 * Conforms to BISsetu AI Instruction Specification
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const resolvePath = (...segments) => {
  const candidates = [
    path.join(__dirname, ...segments),
    path.join(process.cwd(), ...segments),
    path.join(__dirname, '..', ...segments)
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.join(__dirname, ...segments);
};

const { retrieveBisEvidence } = require('./src/services/bisRetrievalService');
const { generateAnswer, generateAnswerStream } = require('./src/services/geminiService');
const { validateAnswer } = require('./src/services/answerValidationService');
const { buildOrUpdateContext } = require('./src/services/conversationContextService');
const sessionService = require('./src/services/sessionService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Serve static assets from landing-page and search-page
app.use('/landing-page', express.static(resolvePath('landing-page')));
app.use('/search-page', express.static(resolvePath('search-page')));
app.use('/shared', express.static(resolvePath('shared')));

// Serve vendor assets (marked, dompurify, highlight.js) locally
app.use('/vendor/marked', express.static(resolvePath('node_modules', 'marked', 'lib')));
app.use('/vendor/dompurify', express.static(resolvePath('node_modules', 'dompurify', 'dist')));
app.use('/vendor/highlight', express.static(resolvePath('node_modules', 'highlight.js')));

// Page Routes
app.get('/', (req, res) => {
  if (req.query.view === 'desktop') {
    return res.sendFile(resolvePath('desktop landing page.html'));
  }
  res.sendFile(resolvePath('landing-page', 'code.html'));
});

app.get('/landing', (req, res) => {
  if (req.query.view === 'desktop') {
    return res.sendFile(resolvePath('desktop landing page.html'));
  }
  res.sendFile(resolvePath('landing-page', 'code.html'));
});

app.get('/desktop-landing', (req, res) => {
  res.sendFile(resolvePath('desktop landing page.html'));
});

app.get('/desktop', (req, res) => {
  res.sendFile(resolvePath('desktop landing page.html'));
});

app.get('/search', (req, res) => {
  res.sendFile(resolvePath('search-page', 'code.html'));
});

app.get('/history', (req, res) => {
  res.sendFile(resolvePath('search-page', 'code.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BISsetu AI Backend',
    version: '1.0.0',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY')
  });
});

/**
 * POST /api/search
 * Atomic response generation endpoint with RAG grounding and full validation
 */
app.post('/api/search', async (req, res) => {
  const requestId = req.body.requestId || ('req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7));

  try {
    const { query, image, history, context, language } = req.body;

    // 1. Validate query or image
    if ((!query || typeof query !== 'string' || query.trim() === '') && !image) {
      return res.status(400).json({
        requestId,
        error: 'Query or image is required and must not be empty.',
        source: 'BIS'
      });
    }

    const cleanQuery = (query || '').trim();

    // 2. Maintain conversation context & rewrite follow-up queries
    const {
      context: updatedContext,
      isFollowUp,
      intentType,
      rewrittenQuery
    } = buildOrUpdateContext(cleanQuery, history, context);

    // 3. Topic-Aware BIS Retrieval with Context & Evidence Continuity
    const retrievalQuery = rewrittenQuery || cleanQuery || (image ? 'ISI Hallmark standard verification' : '');
    const evidence = await retrieveBisEvidence(retrievalQuery, {
      requestId,
      context: updatedContext,
      isFollowUp,
      intentType
    });

    // 4. Generate Answer via Gemini / Conversational Engine
    const { answer: rawAnswer, engine } = await generateAnswer(cleanQuery, evidence, {
      requestId,
      image,
      history,
      language,
      context: updatedContext,
      isFollowUp,
      intentType,
      rewrittenQuery
    });

    // 5. Final Answer Validation
    const { validatedAnswer, isValid, reason } = validateAnswer(rawAnswer, cleanQuery, evidence, { requestId });

    console.log(`[FINAL RESPONSE COMMITTED] requestId: ${requestId} | engine: ${engine} | isValid: ${isValid}`);

    // 6. Return verified atomic answer + sources metadata
    const combinedSources = [
      ...evidence.results.map(r => ({
        standard_number: r.standard_number || '',
        title: r.title,
        url: r.source_url || r.url || 'https://www.bis.gov.in/',
        status: r.status,
        mandatory_status: r.mandatory_status,
        gazette_link: r.gazette_link,
        isOfficialBIS: r.isOfficialBIS !== undefined ? r.isOfficialBIS : true
      })),
      ...(evidence.webSources || []).map(w => ({
        standard_number: '',
        title: w.title,
        url: w.url,
        status: 'Official BIS Web Source',
        mandatory_status: '',
        sourceDomain: w.sourceDomain,
        sourceType: w.sourceType,
        isOfficialBIS: w.isOfficialBIS
      }))
    ];

    // Carry forward previous sources if follow-up
    if (isFollowUp && updatedContext.lastSources && Array.isArray(updatedContext.lastSources)) {
      for (const prevSrc of updatedContext.lastSources) {
        if (!combinedSources.some(s => s.url === prevSrc.url)) {
          combinedSources.push(prevSrc);
        }
      }
    }

    const uniqueSources = [];
    const seenUrls = new Set();
    for (const s of combinedSources) {
      if (s.url && !seenUrls.has(s.url)) {
        seenUrls.add(s.url);
        uniqueSources.push(s);
      }
    }

    // Persist active state into context for subsequent follow-up queries
    updatedContext.retrievedEvidence = evidence.results;
    updatedContext.lastSources = uniqueSources;
    updatedContext.activeCertificationContext = true;

    return res.json({
      requestId,
      query: cleanQuery,
      resolvedQuery: rewrittenQuery,
      isFollowUp: isFollowUp,
      answer: validatedAnswer,
      context: updatedContext,
      source: 'BIS',
      engine: engine,
      validated: isValid,
      validationNote: reason || 'Verified against authoritative BIS repository',
      results: evidence.results,
      webSources: evidence.webSources || [],
      agentReachPerformed: evidence.agentReachPerformed || false,
      sources: uniqueSources.length > 0 ? uniqueSources : [
        {
          title: 'Bureau of Indian Standards (BIS)',
          url: 'https://standards.bis.gov.in/'
        }
      ]
    });
  } catch (err) {
    console.error(`[SERVER ERROR] requestId: ${requestId}:`, err);
    return res.status(500).json({
      requestId,
      error: "I'm unable to retrieve BIS information right now. Please try again.",
      source: 'BIS'
    });
  }
});

/**
 * POST /api/search/stream
 * Server-Sent Events (SSE) streaming endpoint
 * Streams the VALIDATED final response progressively without unverified preliminary flashes
 */
app.post('/api/search/stream', async (req, res) => {
  const requestId = req.body.requestId || ('req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7));

  try {
    const { query, image, history, context, language } = req.body;

    if ((!query || typeof query !== 'string' || query.trim() === '') && !image) {
      return res.status(400).json({
        requestId,
        error: 'Query or image is required and must not be empty.',
        source: 'BIS'
      });
    }

    const cleanQuery = (query || '').trim();

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // 1. Maintain conversation context & rewrite follow-up queries
    const {
      context: updatedContext,
      isFollowUp,
      intentType,
      rewrittenQuery
    } = buildOrUpdateContext(cleanQuery, history, context);

    // 2. Retrieve BIS evidence using topic-aware routing & context continuity
    const retrievalQuery = rewrittenQuery || cleanQuery || (image ? 'ISI Hallmark standard verification' : '');
    const evidence = await retrieveBisEvidence(retrievalQuery, {
      requestId,
      context: updatedContext,
      isFollowUp,
      intentType
    });

    const combinedSources = [
      ...evidence.results.map(r => ({
        standard_number: r.standard_number || '',
        title: r.title,
        url: r.source_url || r.url || 'https://www.bis.gov.in/',
        status: r.status,
        mandatory_status: r.mandatory_status,
        gazette_link: r.gazette_link,
        isOfficialBIS: r.isOfficialBIS !== undefined ? r.isOfficialBIS : true
      })),
      ...(evidence.webSources || []).map(w => ({
        standard_number: '',
        title: w.title,
        url: w.url,
        status: 'Official BIS Web Source',
        mandatory_status: '',
        sourceDomain: w.sourceDomain,
        sourceType: w.sourceType,
        isOfficialBIS: w.isOfficialBIS
      }))
    ];

    if (isFollowUp && updatedContext.lastSources && Array.isArray(updatedContext.lastSources)) {
      for (const prevSrc of updatedContext.lastSources) {
        if (!combinedSources.some(s => s.url === prevSrc.url)) {
          combinedSources.push(prevSrc);
        }
      }
    }

    const uniqueSources = [];
    const seenUrls = new Set();
    for (const s of combinedSources) {
      if (s.url && !seenUrls.has(s.url)) {
        seenUrls.add(s.url);
        uniqueSources.push(s);
      }
    }

    // Persist active state into context
    updatedContext.retrievedEvidence = evidence.results;
    updatedContext.lastSources = uniqueSources;
    updatedContext.activeCertificationContext = true;

    // Send metadata event (sources, resolved query, context, requestId)
    res.write(`data: ${JSON.stringify({
      type: 'meta',
      requestId,
      query: cleanQuery,
      resolvedQuery: rewrittenQuery,
      isFollowUp: isFollowUp,
      context: updatedContext,
      source: 'BIS',
      results: evidence.results,
      webSources: evidence.webSources || [],
      agentReachPerformed: evidence.agentReachPerformed || false,
      sources: uniqueSources.length > 0 ? uniqueSources : [
        { title: 'Bureau of Indian Standards (BIS)', url: 'https://standards.bis.gov.in/' }
      ]
    })}\n\n`);

    // 3. Generate answer
    const { answer: rawAnswer, engine } = await generateAnswer(cleanQuery, evidence, {
      requestId,
      image,
      history,
      language,
      context: updatedContext,
      isFollowUp,
      intentType,
      rewrittenQuery
    });

    // 4. Validate generated answer BEFORE streaming to user
    const { validatedAnswer, isValid, reason } = validateAnswer(rawAnswer, cleanQuery, evidence, { requestId });

    console.log(`[FINAL RESPONSE COMMITTED] requestId: ${requestId} | engine: ${engine} | isValid: ${isValid}`);

    // 5. Stream the VALIDATED final response progressively in natural token units
    const words = validatedAnswer.split(/(\s+)/);
    let buffer = '';
    for (let i = 0; i < words.length; i++) {
      if (res.writableEnded) break;
      buffer += words[i];
      if (buffer.length >= 8 || i === words.length - 1) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', requestId, text: buffer })}\n\n`);
        buffer = '';
        await new Promise(r => setTimeout(r, 12));
      }
    }

    // 6. Send completion event
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({
        type: 'done',
        requestId,
        engine: engine,
        validated: isValid,
        validationNote: reason || 'Verified against authoritative BIS repository',
        finalAnswer: validatedAnswer,
        context: updatedContext,
        resolvedQuery: rewrittenQuery,
        sources: uniqueSources.length > 0 ? uniqueSources : [
          { title: 'Bureau of Indian Standards (BIS)', url: 'https://standards.bis.gov.in/' }
        ],
        results: evidence.results
      })}\n\n`);

      res.end();
    }
  } catch (err) {
    console.error(`[STREAM ERROR] requestId: ${requestId}:`, err);
    if (!res.headersSent) {
      return res.status(500).json({
        requestId,
        error: "I'm unable to retrieve BIS information right now. Please try again.",
        source: 'BIS'
      });
    } else {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        requestId,
        error: "I'm unable to retrieve BIS information right now. Please try again."
      })}\n\n`);
      res.end();
    }
  }
});

/**
 * POST /api/chat
 * Webhook-friendly REST API endpoint for conversational BIS AI
 * Compatible with external orchestrators like n8n, WhatsApp bots, and messaging platforms
 *
 * Request format:
 * {
 *   "message": "User query string",
 *   "session_id": "Unique user identifier / phone number"
 * }
 *
 * Response format:
 * {
 *   "reply": "Generated response string from the BIS AI"
 * }
 */
app.post('/api/chat', async (req, res) => {
  const requestId = req.body?.requestId || ('req-chat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7));

  // 1. Validation for missing or invalid request body & fields
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      error: 'Invalid request body: expected a JSON object with "message" and "session_id".'
    });
  }

  const { message, session_id } = req.body;

  if (session_id === undefined || session_id === null || String(session_id).trim() === '') {
    return res.status(400).json({
      error: 'Missing required field: "session_id" is required to maintain conversation state.'
    });
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({
      error: 'Missing required field: "message" must be a non-empty string.'
    });
  }

  const sessionId = String(session_id).trim();
  const cleanMessage = message.trim();

  // 2. Timeout configuration (default: 45 seconds, configurable via CHAT_TIMEOUT_MS)
  const timeoutMs = parseInt(process.env.CHAT_TIMEOUT_MS, 10) || 45000;

  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      const err = new Error('AI generation timed out');
      err.name = 'TimeoutError';
      reject(err);
    }, timeoutMs);
    if (timeoutHandle && typeof timeoutHandle.unref === 'function') {
      timeoutHandle.unref();
    }
  });

  const chatProcessingPromise = (async () => {
    // Retrieve or initialize session state
    const session = sessionService.getSession(sessionId);

    // Step A: Conversation memory & follow-up query rewriting
    const {
      context: updatedContext,
      isFollowUp,
      intentType,
      rewrittenQuery
    } = buildOrUpdateContext(cleanMessage, session.history, session.context);

    // Step B: Authoritative BIS RAG Retrieval
    const retrievalQuery = rewrittenQuery || cleanMessage;
    const evidence = await retrieveBisEvidence(retrievalQuery, {
      requestId,
      context: updatedContext,
      isFollowUp,
      intentType
    });

    // Step C: Answer Generation via Gemini / Grounded BIS Engine
    const { answer: rawAnswer, engine } = await generateAnswer(cleanMessage, evidence, {
      requestId,
      history: session.history,
      context: updatedContext,
      isFollowUp,
      intentType,
      rewrittenQuery
    });

    // Step D: Answer Validation against Grounded Evidence
    const { validatedAnswer, isValid, reason } = validateAnswer(rawAnswer, cleanMessage, evidence, { requestId });
    console.log(`[API /api/chat] requestId: ${requestId} | session: ${sessionId} | engine: ${engine} | isValid: ${isValid}`);

    // Step E: Update sources and persist context in session
    const combinedSources = [
      ...evidence.results.map(r => ({
        standard_number: r.standard_number || '',
        title: r.title,
        url: r.source_url || r.url || 'https://www.bis.gov.in/',
        status: r.status,
        mandatory_status: r.mandatory_status,
        gazette_link: r.gazette_link,
        isOfficialBIS: r.isOfficialBIS !== undefined ? r.isOfficialBIS : true
      })),
      ...(evidence.webSources || []).map(w => ({
        standard_number: '',
        title: w.title,
        url: w.url,
        status: 'Official BIS Web Source',
        mandatory_status: '',
        sourceDomain: w.sourceDomain,
        sourceType: w.sourceType,
        isOfficialBIS: w.isOfficialBIS
      }))
    ];

    if (isFollowUp && updatedContext.lastSources && Array.isArray(updatedContext.lastSources)) {
      for (const prevSrc of updatedContext.lastSources) {
        if (!combinedSources.some(s => s.url === prevSrc.url)) {
          combinedSources.push(prevSrc);
        }
      }
    }

    const uniqueSources = [];
    const seenUrls = new Set();
    for (const s of combinedSources) {
      if (s.url && !seenUrls.has(s.url)) {
        seenUrls.add(s.url);
        uniqueSources.push(s);
      }
    }

    updatedContext.retrievedEvidence = evidence.results;
    updatedContext.lastSources = uniqueSources;
    updatedContext.activeCertificationContext = true;

    // Step F: Append turns to session history
    const updatedHistory = [
      ...(session.history || []),
      { role: 'user', content: cleanMessage },
      { role: 'model', content: validatedAnswer }
    ];

    sessionService.updateSession(sessionId, {
      history: updatedHistory,
      context: updatedContext
    });

    return validatedAnswer;
  })();

  try {
    const reply = await Promise.race([chatProcessingPromise, timeoutPromise]);
    clearTimeout(timeoutHandle);

    return res.json({
      reply
    });
  } catch (err) {
    clearTimeout(timeoutHandle);
    console.error(`[API /api/chat ERROR] requestId: ${requestId} | session: ${sessionId}:`, err);

    if (err.name === 'TimeoutError') {
      return res.status(504).json({
        error: 'Request timed out while generating response from BIS AI.'
      });
    }

    return res.status(500).json({
      error: 'Failed to generate BIS AI response. Please try again.'
    });
  }
});

/**
 * POST /api/chat/reset
 * Helper endpoint to reset conversation memory for a session_id
 */
app.post('/api/chat/reset', (req, res) => {
  const { session_id } = req.body || {};
  if (session_id === undefined || session_id === null || String(session_id).trim() === '') {
    return res.status(400).json({
      error: 'Missing required field: "session_id".'
    });
  }
  const cleared = sessionService.clearSession(session_id);
  return res.json({
    success: true,
    message: `Session "${session_id}" reset successfully.`,
    cleared
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`BISsetu BIS AI Server running on port ${PORT}`);
    console.log(`Landing Page: http://localhost:${PORT}/`);
    console.log(`Search Page:  http://localhost:${PORT}/search`);
    console.log(`API Health:   http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
}

module.exports = app;
