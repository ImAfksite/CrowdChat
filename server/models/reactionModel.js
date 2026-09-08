const db = require('../db/database');

const ReactionModel = {
  toggleReaction: (messageId, userId, emoji) => {
    const existing = db.prepare('SELECT id FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?').get(messageId, userId, emoji);

    if (existing) {
      db.prepare('DELETE FROM message_reactions WHERE id = ?').run(existing.id);
      return { action: 'removed', emoji };
    } else {
      db.prepare('INSERT INTO message_reactions (message_id, user_id, emoji) VALUES (?, ?, ?)').run(messageId, userId, emoji);
      return { action: 'added', emoji };
    }
  },

  getReactionsForMessages: (messageIds) => {
    if (!messageIds.length) return {};

    const placeholders = messageIds.map(() => '?').join(',');
    const rows = db.prepare(`
      SELECT r.message_id, r.emoji, r.user_id, u.username, u.display_name
      FROM message_reactions r
      JOIN users u ON r.user_id = u.id
      WHERE r.message_id IN (${placeholders})
    `).all(...messageIds);

    const map = {};
    for (const r of rows) {
      if (!map[r.message_id]) map[r.message_id] = {};
      if (!map[r.message_id][r.emoji]) {
        map[r.message_id][r.emoji] = { emoji: r.emoji, count: 0, users: [] };
      }
      map[r.message_id][r.emoji].count += 1;
      map[r.message_id][r.emoji].users.push({ id: r.user_id, username: r.username, displayName: r.display_name });
    }
    return map;
  }
};

module.exports = ReactionModel;
