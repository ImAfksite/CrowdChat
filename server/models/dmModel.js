const db = require('../db/database');

const DMModel = {
  getConversations: (userId) => {
    return db.prepare(`
      SELECT
        c.id as conversation_id,
        c.last_message_at,
        u.id as other_user_id,
        u.username,
        u.display_name,
        u.avatar_url,
        u.custom_status,
        u.accent_color,
        (
          SELECT m.content FROM messages m
          WHERE (m.sender_id = c.user1_id AND m.recipient_id = c.user2_id)
             OR (m.sender_id = c.user2_id AND m.recipient_id = c.user1_id)
          ORDER BY m.id DESC LIMIT 1
        ) as last_message_snippet,
        CASE
          WHEN c.user1_id = ? THEN c.user1_read_at < c.last_message_at
          ELSE c.user2_read_at < c.last_message_at
        END as has_unread
      FROM dm_conversations c
      JOIN users u ON u.id = CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END
      WHERE (c.user1_id = ? OR c.user2_id = ?) AND u.is_banned = 0
      ORDER BY c.last_message_at DESC
    `).all(userId, userId, userId, userId);
  },

  getOrCreateConversation: (user1Id, user2Id) => {
    const minId = Math.min(user1Id, user2Id);
    const maxId = Math.max(user1Id, user2Id);

    let conv = db.prepare('SELECT * FROM dm_conversations WHERE user1_id = ? AND user2_id = ?').get(minId, maxId);

    if (!conv) {
      const stmt = db.prepare('INSERT INTO dm_conversations (user1_id, user2_id) VALUES (?, ?)');
      const info = stmt.run(minId, maxId);
      conv = db.prepare('SELECT * FROM dm_conversations WHERE id = ?').get(info.lastInsertRowid);
    }
    return conv;
  },

  getDMMessages: (user1Id, user2Id, limit = 50) => {
    return db.prepare(`
      SELECT m.*,
        u.username as sender_username,
        u.display_name as sender_display_name,
        u.avatar_url as sender_avatar,
        u.accent_color as sender_color,
        rm.content as reply_content,
        ru.username as reply_username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN messages rm ON m.reply_to_id = rm.id
      LEFT JOIN users ru ON rm.sender_id = ru.id
      WHERE (m.sender_id = ? AND m.recipient_id = ?)
         OR (m.sender_id = ? AND m.recipient_id = ?)
      ORDER BY m.id DESC
      LIMIT ?
    `).all(user1Id, user2Id, user2Id, user1Id, limit).reverse();
  },

  sendDM: ({ senderId, recipientId, content, attachmentUrl, attachmentType, replyToId }) => {
    const stmt = db.prepare(`
      INSERT INTO messages (sender_id, recipient_id, content, attachment_url, attachment_type, reply_to_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(senderId, recipientId, content, attachmentUrl || null, attachmentType || null, replyToId || null);

    // Update conversation last_message_at
    const minId = Math.min(senderId, recipientId);
    const maxId = Math.max(senderId, recipientId);
    db.prepare(`
      INSERT INTO dm_conversations (user1_id, user2_id, last_message_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user1_id, user2_id) DO UPDATE SET last_message_at = CURRENT_TIMESTAMP
    `).run(minId, maxId);

    return db.prepare(`
      SELECT m.*, u.username as sender_username, u.display_name as sender_display_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `).get(info.lastInsertRowid);
  },

  markAsRead: (userId, otherUserId) => {
    const minId = Math.min(userId, otherUserId);
    const maxId = Math.max(userId, otherUserId);
    if (userId === minId) {
      db.prepare('UPDATE dm_conversations SET user1_read_at = CURRENT_TIMESTAMP WHERE user1_id = ? AND user2_id = ?').run(minId, maxId);
    } else {
      db.prepare('UPDATE dm_conversations SET user2_read_at = CURRENT_TIMESTAMP WHERE user1_id = ? AND user2_id = ?').run(minId, maxId);
    }
  },

  isBlocked: (userA, userB) => {
    const blocked = db.prepare(`
      SELECT id FROM user_blocks
      WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)
    `).get(userA, userB, userB, userA);
    return !!blocked;
  }
};

module.exports = DMModel;
