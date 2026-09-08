const express = require('express');
const router = express.Router();
const { fetchLinkPreview } = require('../services/linkPreviewService');
const { authenticateToken } = require('../middleware/auth');

router.get('/preview', authenticateToken, async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL parameter is required' });

  try {
    const preview = await fetchLinkPreview(url);
    res.json({ preview });
  } catch {
    res.json({ preview: null });
  }
});

module.exports = router;
