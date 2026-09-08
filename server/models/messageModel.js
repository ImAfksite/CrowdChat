const db = require('../db/database');

const MessageModel = {
  getChannelMessages: (channelId, limit = 50, beforeId = null) => {
    let query = `
      SELECT m.*,
        u.username as sender_username,
        u.display_name as sender_display_name,
        u.avatar_url as sender_avatar,
        u.role as sender_role,
        u.accent_color as sender_color,
        rm.content as reply_content,
        ru.username as reply_username,
        ru.display_name as reply_display_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN messages rm ON m.reply_to_id = rm.id
      LEFT JOIN users ru ON rm.sender_id = ru.id
      WHERE m.channel_id = ?
    `;

    const params = [channelId];

    if (beforeId) {
      query += ` AND m.id < ?`;
      params.push(beforeId);
    }

    query += ` ORDER BY m.id DESC LIMIT ?`;
    params.push(limit);

    const rows = db.prepare(query).all(...params);
    return rows.reverse();
  },

  createChannelMessage: ({ channelId, senderId, content, attachmentUrl, attachmentType, replyToId }) => {
    const stmt = db.prepare(`
      INSERT INTO messages (channel_id, sender_id, content, attachment_url, attachment_type, reply_to_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(channelId, senderId, content, attachmentUrl || null, attachmentType || null, replyToId || null);
    return MessageModel.getById(info.lastInsertRowid);
  },

  getById: (id) => {
    return db.prepare(`
      SELECT m.*,
        u.username as sender_username,
        u.display_name as sender_display_name,
        u.avatar_url as sender_avatar,
        u.role as sender_role,
        u.accent_color as sender_color,
        rm.content as reply_content,
        ru.username as reply_username,
        ru.display_name as reply_display_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN messages rm ON m.reply_to_id = rm.id
      LEFT JOIN users ru ON rm.sender_id = ru.id
      WHERE m.id = ?
    `).get(id);
  },

  editMessage: (id, senderId, newContent) => {
    db.prepare(`
      UPDATE messages
      SET content = ?, is_edited = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND sender_id = ? AND is_deleted = 0
    `).run(newContent, id, senderId);
    return MessageModel.getById(id);
  },

  deleteMessage: (id, userId, isStaff) => {
    if (isStaff) {
      db.prepare(`UPDATE messages SET is_deleted = 1, content = '[Message deleted by moderator]' WHERE id = ?`).run(id);
    } else {
      db.prepare(`UPDATE messages SET is_deleted = 1, content = '[Message deleted]' WHERE id = ? AND sender_id = ?`).run(id, userId);
    }
    return MessageModel.getById(id);
  },

  search: (query, channelId = null) => {
    let sql = `
      SELECT m.*, u.username as sender_username, u.display_name as sender_display_name, u.avatar_url as sender_avatar, c.name as channel_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN channels c ON m.channel_id = c.id
      WHERE m.content LIKE ? AND m.is_deleted = 0
    `;
    const params = [`%${query}%`];

    if (channelId) {
      sql += ' AND m.channel_id = ?';
      params.push(channelId);
    }

    sql += ' ORDER BY m.id DESC LIMIT 30';
    return db.prepare(sql).all(...params);
  }
};

module.exports = MessageModel;
