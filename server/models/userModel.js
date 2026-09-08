const db = require('../db/database');

const UserModel = {
  findById: (id) => {
    return db.prepare(`
      SELECT id, username, display_name, email, role, avatar_url, bio, custom_status, accent_color, is_banned, muted_until, created_at, last_active_at
      FROM users WHERE id = ?
    `).get(id);
  },

  findByUsername: (username) => {
    return db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(username);
  },

  findByEmail: (email) => {
    return db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email);
  },

  create: ({ username, displayName, email, passwordHash, avatarUrl, bio, accentColor }) => {
    const stmt = db.prepare(`
      INSERT INTO users (username, display_name, email, password_hash, avatar_url, bio, accent_color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      username,
      displayName || username,
      email,
      passwordHash,
      avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio || 'Hey there! I am using CrowdChat.',
      accentColor || '#6366f1'
    );
    return UserModel.findById(info.lastInsertRowid);
  },

  updateProfile: (id, { displayName, bio, customStatus, avatarUrl, accentColor }) => {
    const stmt = db.prepare(`
      UPDATE users
      SET display_name = COALESCE(?, display_name),
          bio = COALESCE(?, bio),
          custom_status = COALESCE(?, custom_status),
          avatar_url = COALESCE(?, avatar_url),
          accent_color = COALESCE(?, accent_color),
          last_active_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(displayName, bio, customStatus, avatarUrl, accentColor, id);
    return UserModel.findById(id);
  },

  searchUsers: (query, currentUserId) => {
    const stmt = db.prepare(`
      SELECT id, username, display_name, avatar_url, bio, custom_status, role, accent_color
      FROM users
      WHERE (username LIKE ? OR display_name LIKE ?) AND is_banned = 0 AND id != ?
      LIMIT 15
    `);
    const q = `%${query}%`;
    return stmt.all(q, q, currentUserId);
  },

  updateLastActive: (id) => {
    db.prepare('UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
  }
};

module.exports = UserModel;
