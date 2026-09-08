PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL COLLATE NOCASE,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT 'Hey there! I am using CrowdChat.',
  custom_status TEXT DEFAULT '',
  role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'moderator', 'user')),
  accent_color TEXT DEFAULT '#6366f1',
  is_banned INTEGER DEFAULT 0,
  muted_until DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Public channels
CREATE TABLE IF NOT EXISTS channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL COLLATE NOCASE,
  topic TEXT DEFAULT '',
  is_read_only INTEGER DEFAULT 0,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_archived INTEGER DEFAULT 0,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER DEFAULT NULL,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER DEFAULT NULL,
  group_id INTEGER DEFAULT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT DEFAULT NULL,
  attachment_type TEXT DEFAULT NULL CHECK(attachment_type IN ('image', 'gif', 'sticker', 'meme', 'youtube', NULL)),
  reply_to_id INTEGER DEFAULT NULL,
  is_edited INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- Message reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  emoji TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(message_id, user_id, emoji),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Groups
CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon_url TEXT DEFAULT '',
  owner_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Group members
CREATE TABLE IF NOT EXISTS group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT DEFAULT 'member' CHECK(role IN ('owner', 'member')),
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- DMs
CREATE TABLE IF NOT EXISTS dm_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user1_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user2_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id),
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Blocked users
CREATE TABLE IF NOT EXISTS user_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blocker_id INTEGER NOT NULL,
  blocked_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blocker_id, blocked_id),
  FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_id INTEGER NOT NULL,
  reported_user_id INTEGER NOT NULL,
  message_id INTEGER DEFAULT NULL,
  reason TEXT NOT NULL,
  details TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'resolved', 'dismissed')),
  resolved_by INTEGER DEFAULT NULL,
  resolution_note TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME DEFAULT NULL,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id INTEGER DEFAULT NULL,
  details TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
);
