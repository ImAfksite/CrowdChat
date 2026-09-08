const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'production',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_crowdchat_key',
  clientUrl: process.env.CLIENT_URL || '*',
  dbPath: process.env.DATABASE_PATH || path.resolve(__dirname, '../db/crowdchat.db'),
  uploadDir: path.resolve(__dirname, '../uploads'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10) * 1024 * 1024,
};
