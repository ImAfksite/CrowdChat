module.exports = {
  ROLES: {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    USER: 'user',
  },
  PRESENCE: {
    ONLINE: 'online',
    IDLE: 'idle',
    DND: 'dnd',
    OFFLINE: 'offline',
  },
  LIMITS: {
    MAX_GROUP_MEMBERS: 10,
    MAX_MESSAGE_LENGTH: 2000,
    RATE_LIMIT_MESSAGES: 5, // 5 messages
    RATE_LIMIT_WINDOW_MS: 4000, // per 4 seconds
    MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  },
  REPORT_REASONS: [
    'nsfw_content',
    'harassment',
    'personal_info_leak',
    'spam_flooding',
    'dangerous_content',
    'other',
  ],
};
