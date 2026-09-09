const bcrypt = require('bcryptjs');
const db = require('./database');

async function seed() {
  console.log('🌱 Seeding CrowdChat database with Crowd Admin...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Seed Crowd Admin Only
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

  // Seed Public #main Channel
  const insertChannel = db.prepare(`
    INSERT OR IGNORE INTO channels (name, topic, is_read_only, created_by)
    VALUES (?, ?, ?, 1)
  `);

  insertChannel.run('main', 'The heart of CrowdChat! Welcome everyone. Say hi and join the discussion.', 0);
  insertChannel.run('creations', 'Show off your art, code, music, memes, and passion projects!', 0);
  insertChannel.run('gaming', 'Matchmaking, game discussions, clips, and banter.', 0);
  insertChannel.run('announcements', 'Official CrowdChat updates and platform rules.', 1);

  console.log('✅ Seed completed: Crowd Admin ready (Username: "admin", Password: "Password123!")');
}

if (require.main === module) {
  seed().then(() => process.exit(0));
}

module.exports = seed;
