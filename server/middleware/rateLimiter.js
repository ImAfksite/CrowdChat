const userMessageHistory = new Map();
const { LIMITS } = require('../config/constants');

function checkMessageRateLimit(userId) {
  const now = Date.now();
  const history = userMessageHistory.get(userId) || [];

  // Filter messages within the sliding window
  const recent = history.filter(ts => now - ts < LIMITS.RATE_LIMIT_WINDOW_MS);

  if (recent.length >= LIMITS.RATE_LIMIT_MESSAGES) {
    return false; // Exceeded limit
  }

  recent.push(now);
  userMessageHistory.set(userId, recent);
  return true;
}

// Clean up stale history every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [userId, history] of userMessageHistory.entries()) {
    const recent = history.filter(ts => now - ts < LIMITS.RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) {
      userMessageHistory.delete(userId);
    } else {
      userMessageHistory.set(userId, recent);
    }
  }
}, 10 * 60 * 1000);

module.exports = { checkMessageRateLimit };
