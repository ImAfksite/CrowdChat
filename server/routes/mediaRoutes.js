const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const { searchGifs, getStickers } = require('../services/gifService');

// Upload image/media
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename, size: req.file.size });
});

// GIF Search Catalog
router.get('/gifs', authenticateToken, (req, res) => {
  const { q, category } = req.query;
  const results = searchGifs(q, category);
  res.json({ results });
});

// Sticker Library
router.get('/stickers', authenticateToken, (req, res) => {
  const stickers = getStickers();
  res.json({ stickers });
});

module.exports = router;
