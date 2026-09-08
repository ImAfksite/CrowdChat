const db = require('../db/database');

const ModerationModel = {
  createReport: ({ reporterId, reportedUserId, messageId, reason, details }) => {
    const stmt = db.prepare(`
      INSERT INTO reports (reporter_id, reported_user_id, message_id, reason, details)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(reporterId, reportedUserId, messageId || null, reason, details || '');
    return info.lastInsertRowid;
  },

  getPendingReports: () => {
    return db.prepare(`
      SELECT r.*,
        rep.username as reporter_username,
        rep.display_name as reporter_display_name,
        tgt.username as reported_username,
        tgt.display_name as reported_display_name,
        tgt.is_banned as reported_user_is_banned,
        tgt.muted_until as reported_user_muted_until,
        m.content as message_content,
        m.channel_id,
        m.is_deleted as message_is_deleted
      FROM reports r
      JOIN users rep ON r.reporter_id = rep.id
      JOIN users tgt ON r.reported_user_id = tgt.id
      LEFT JOIN messages m ON r.message_id = m.id
      WHERE r.status = 'pending'
      ORDER BY r.id DESC
    `).all();
  },

  resolveReport: (reportId, resolvedBy, note, status = 'resolved') => {
    db.prepare(`
      UPDATE reports
      SET status = ?, resolved_by = ?, resolution_note = ?, resolved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, resolvedBy, note || '', reportId);
  },

  muteUser: (userId, minutes, actorId) => {
    const mutedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    db.prepare('UPDATE users SET muted_until = ? WHERE id = ?').run(mutedUntil, userId);
    ModerationModel.logAudit(actorId, 'MUTE_USER', 'user', userId, `Muted for ${minutes} minutes`);
    return mutedUntil;
  },

  unmuteUser: (userId, actorId) => {
    db.prepare('UPDATE users SET muted_until = NULL WHERE id = ?').run(userId);
    ModerationModel.logAudit(actorId, 'UNMUTE_USER', 'user', userId, 'Unmuted user');
  },

  banUser: (userId, actorId, reason = '') => {
    db.prepare('UPDATE users SET is_banned = 1 WHERE id = ?').run(userId);
    ModerationModel.logAudit(actorId, 'BAN_USER', 'user', userId, reason || 'Banned by admin');
  },

  unbanUser: (userId, actorId) => {
    db.prepare('UPDATE users SET is_banned = 0 WHERE id = ?').run(userId);
    ModerationModel.logAudit(actorId, 'UNBAN_USER', 'user', userId, 'Unbanned user');
  },

  logAudit: (actorId, action, targetType, targetId, details) => {
    db.prepare(`
      INSERT INTO audit_logs (actor_id, action, target_type, target_id, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(actorId, action, targetType, targetId || null, details || '');
  },

  getAuditLogs: (limit = 50) => {
    return db.prepare(`
      SELECT a.*, u.username as actor_username, u.display_name as actor_display_name
      FROM audit_logs a
      JOIN users u ON a.actor_id = u.id
      ORDER BY a.id DESC LIMIT ?
    `).all(limit);
  }
};

module.exports = ModerationModel;
