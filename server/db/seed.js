const bcrypt = require('bcryptjs');
const db = require('./database');

async function seed() {
  console.log('🌱 Seeding CrowdChat database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Main Admin User
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, display_name, email, password_hash, avatar_url, bio, custom_status, role, accent_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'admin',
    'Crowd Admin',
    'admin@crowdchat.local',
    passwordHash,
    'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    'Platform Administrator & Community Architect 🛡️',
    'Building CrowdChat 🚀',
    'admin',
    '#6366f1'
  );

  // 2. Seed Demo Active Users for Rich Community Experience
  const demoUsers = [
    { username: 'pixel_sam', name: 'Sammy 👾', email: 'sam@crowdchat.local', role: 'moderator', bio: 'Retro game enthusiast & pixel artist', status: 'Streaming SNES RPGs 🎮', color: '#ec4899', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sammy' },
    { username: 'elena_dev', name: 'Elena Codes', email: 'elena@crowdchat.local', role: 'user', bio: 'Full-stack builder. Coffee to code converter ☕', status: 'Refactoring React components ⚡', color: '#10b981', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena' },
    { username: 'kai_beats', name: 'Kai Vibes', email: 'kai@crowdchat.local', role: 'user', bio: 'Lofi beats and audio engineering 🎧', status: 'Listening to Synthwave 🎶', color: '#f59e0b', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kai' },
    { username: 'nova_star', name: 'Nova ✨', email: 'nova@crowdchat.local', role: 'user', bio: 'Astrophotography & Sci-Fi reader 🌌', status: 'Observing the cosmos 🔭', color: '#8b5cf6', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova' }
  ];

  for (const u of demoUsers) {
    insertUser.run(u.username, u.name, u.email, passwordHash, u.avatar, u.bio, u.status, u.role, u.color);
  }

  // 3. Seed Core Public Channels (Starting with #main)
  const insertChannel = db.prepare(`
    INSERT OR IGNORE INTO channels (name, topic, is_read_only, created_by)
    VALUES (?, ?, ?, 1)
  `);

  insertChannel.run('main', 'The heart of CrowdChat! Welcome everyone. Say hi and join the discussion.', 0);
  insertChannel.run('creations', 'Show off your art, code, music, memes, and passion projects!', 0);
  insertChannel.run('gaming', 'Matchmaking, game discussions, clips, and esports banter.', 0);
  insertChannel.run('announcements', 'Official CrowdChat updates and platform rules.', 1);

  // 4. Seed Initial Messages in #main
  const mainChan = db.prepare('SELECT id FROM channels WHERE name = ?').get('main');
  if (mainChan) {
    const msgCount = db.prepare('SELECT COUNT(*) as c FROM messages WHERE channel_id = ?').get(mainChan.id);
    if (msgCount.c === 0) {
      const insertMsg = db.prepare(`
        INSERT INTO messages (channel_id, sender_id, content, created_at)
        VALUES (?, ?, ?, datetime('now', ?))
      `);

      insertMsg.run(mainChan.id, 1, 'Welcome to **CrowdChat**! 🎉 This is our shared community space. Feel free to share links, upload images, send reactions, or start private groups!', '-2 hours');
      insertMsg.run(mainChan.id, 2, 'Hey everyone! Glad to be here. Check out the custom stickers and GIF search in the input bar!', '-1 hour');
      insertMsg.run(mainChan.id, 3, 'Loving the real-time vibe. Make sure to check out YouTube preview embeds by pasting any video link! 🎬', '-30 minutes');
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('👉 Default Admin Login -> Username: "admin", Password: "Password123!"');
  console.log('👉 Demo Users Password -> "Password123!"');
}

if (require.main === module) {
  seed().then(() => process.exit(0));
}

module.exports = seed;
