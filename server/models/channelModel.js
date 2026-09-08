const db = require('../db/database');

const ChannelModel = {
  getAll: () => {
    return db.prepare(`
      SELECT c.*, u.username as creator_name,
        (SELECT COUNT(*) FROM messages m WHERE m.channel_id = c.id AND m.is_deleted = 0) as message_count
      FROM channels c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.is_archived = 0
      ORDER BY c.id ASC
    `).all();
  },

  findById: (id) => {
    return db.prepare('SELECT * FROM channels WHERE id = ?').get(id);
  },

  findByName: (name) => {
    return db.prepare('SELECT * FROM channels WHERE name = ? COLLATE NOCASE').get(name);
  },

  create: ({ name, topic, isReadOnly, createdBy }) => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const stmt = db.prepare(`
      INSERT INTO channels (name, topic, is_read_only, created_by)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(cleanName, topic || '', isReadOnly ? 1 : 0, createdBy);
    return ChannelModel.findById(info.lastInsertRowid);
  },

  update: (id, { topic, isReadOnly }) => {
    db.prepare('UPDATE channels SET topic = ?, is_read_only = ? WHERE id = ?').run(topic, isReadOnly ? 1 : 0, id);
    return ChannelModel.findById(id);
  },

  archive: (id) => {
    db.prepare('UPDATE channels SET is_archived = 1 WHERE id = ?').run(id);
  }
};

module.exports = ChannelModel;
