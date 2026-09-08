const db = require('../db/database');
const { LIMITS } = require('../config/constants');

const GroupModel = {
  getUserGroups: (userId) => {
    return db.prepare(`
      SELECT g.*, gm.role as member_role,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count,
        (SELECT content FROM messages WHERE group_id = g.id ORDER BY id DESC LIMIT 1) as last_message_snippet
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY g.id DESC
    `).all(userId);
  },

  getById: (groupId) => {
    return db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
  },

  getMembers: (groupId) => {
    return db.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar_url, u.custom_status, gm.role, gm.joined_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.role DESC, gm.joined_at ASC
    `).all(groupId);
  },

  create: ({ name, iconUrl, ownerId, initialMemberIds = [] }) => {
    const memberCount = new Set([ownerId, ...initialMemberIds]).size;
    if (memberCount > LIMITS.MAX_GROUP_MEMBERS) {
      throw new Error(`Groups cannot exceed ${LIMITS.MAX_GROUP_MEMBERS} members.`);
    }

    const info = db.prepare('INSERT INTO groups (name, icon_url, owner_id) VALUES (?, ?, ?)').run(
      name,
      iconUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
      ownerId
    );
    const groupId = info.lastInsertRowid;

    // Add Owner
    db.prepare('INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)').run(groupId, ownerId, 'owner');

    // Add initial members
    const addMemberStmt = db.prepare('INSERT OR IGNORE INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)');
    for (const memId of initialMemberIds) {
      if (memId !== ownerId) {
        addMemberStmt.run(groupId, memId, 'member');
      }
    }

    return GroupModel.getById(groupId);
  },

  addMember: (groupId, userId) => {
    const count = db.prepare('SELECT COUNT(*) as c FROM group_members WHERE group_id = ?').get(groupId).c;
    if (count >= LIMITS.MAX_GROUP_MEMBERS) {
      throw new Error(`This group is full (maximum ${LIMITS.MAX_GROUP_MEMBERS} members).`);
    }

    db.prepare('INSERT OR IGNORE INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)').run(groupId, userId, 'member');
  },

  removeMember: (groupId, userId) => {
    db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?').run(groupId, userId);
  },

  isMember: (groupId, userId) => {
    const row = db.prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?').get(groupId, userId);
    return !!row;
  },

  getMessages: (groupId, limit = 50) => {
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
      WHERE m.group_id = ?
      ORDER BY m.id DESC LIMIT ?
    `).all(groupId, limit).reverse();
  },

  sendMessage: ({ groupId, senderId, content, attachmentUrl, attachmentType, replyToId }) => {
    const stmt = db.prepare(`
      INSERT INTO messages (group_id, sender_id, content, attachment_url, attachment_type, reply_to_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(groupId, senderId, content, attachmentUrl || null, attachmentType || null, replyToId || null);
    return db.prepare(`
      SELECT m.*, u.username as sender_username, u.display_name as sender_display_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `).get(info.lastInsertRowid);
  }
};

module.exports = GroupModel;
