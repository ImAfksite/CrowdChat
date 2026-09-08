// Sensible, balanced content guard
const HARMFUL_PATTERNS = [
  /\b(?:\d{4}[ -]?){3}\d{4}\b/, // Credit card numbers
  /\b\d{3}-\d{2}-\d{4}\b/,       // SSN format
];

function sanitizeAndValidateContent(content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Message content cannot be empty' };
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be only whitespace' };
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: 'Message exceeds maximum length of 2000 characters' };
  }

  // Check for private sensitive info leaks
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        error: 'Message contains sensitive personal information (credit card or identity number). Action blocked for safety.'
      };
    }
  }

  return { valid: true, sanitized: trimmed };
}

function isUserMuted(user) {
  if (!user.muted_until) return false;
  const mutedUntil = new Date(user.muted_until);
  return mutedUntil > new Date();
}

module.exports = { sanitizeAndValidateContent, isUserMuted };
