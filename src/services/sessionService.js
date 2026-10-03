/**
 * Session Management Service
 * Manages in-memory conversation history and context indexed by session_id
 * Supports stateful multi-turn conversations for webhooks (n8n, messaging bots, etc.)
 */

// In-memory store: Map<string, SessionData>
const sessions = new Map();

// Configuration
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_HISTORY_MESSAGES = 20; // 10 conversation turns

/**
 * Get or create a session by sessionId
 * @param {string|number} sessionId
 * @returns {object|null} Session object
 */
function getSession(sessionId) {
  if (sessionId === undefined || sessionId === null || String(sessionId).trim() === '') {
    return null;
  }
  const key = String(sessionId).trim();
  const now = Date.now();

  let session = sessions.get(key);
  if (!session) {
    session = {
      sessionId: key,
      history: [],
      context: null,
      createdAt: now,
      lastAccessedAt: now
    };
    sessions.set(key, session);
  } else {
    session.lastAccessedAt = now;
  }

  return session;
}

/**
 * Update session history and context
 * @param {string|number} sessionId
 * @param {object} updates
 * @param {Array} [updates.history]
 * @param {object} [updates.context]
 * @returns {object|null}
 */
function updateSession(sessionId, { history, context } = {}) {
  if (sessionId === undefined || sessionId === null || String(sessionId).trim() === '') {
    return null;
  }
  const key = String(sessionId).trim();
  const session = getSession(key);

  if (Array.isArray(history)) {
    session.history = history.slice(-MAX_HISTORY_MESSAGES);
  }

  if (context !== undefined) {
    session.context = context;
  }

  session.lastAccessedAt = Date.now();
  return session;
}

/**
 * Clear a session from memory
 * @param {string|number} sessionId
 * @returns {boolean}
 */
function clearSession(sessionId) {
  if (sessionId === undefined || sessionId === null || String(sessionId).trim() === '') {
    return false;
  }
  const key = String(sessionId).trim();
  return sessions.delete(key);
}

/**
 * Clean up expired sessions
 * @param {number} [ttlMs]
 * @returns {number} Count of removed sessions
 */
function cleanupExpiredSessions(ttlMs = DEFAULT_TTL_MS) {
  const now = Date.now();
  let removedCount = 0;
  for (const [key, session] of sessions.entries()) {
    if (now - session.lastAccessedAt > ttlMs) {
      sessions.delete(key);
      removedCount++;
    }
  }
  return removedCount;
}

// Periodic cleanup interval (unref so process isn't kept alive artificially)
const cleanupTimer = setInterval(() => {
  cleanupExpiredSessions();
}, 30 * 60 * 1000);
if (cleanupTimer && typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

module.exports = {
  getSession,
  updateSession,
  clearSession,
  cleanupExpiredSessions,
  _sessions: sessions
};
