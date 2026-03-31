const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// Utility to generate a short ID
function generateShortId(length = 6) {
  return crypto.randomBytes(length).toString('base64url').substring(0, length);
}

// @route   POST /api/shorten
// @desc    Generate short URL
router.post('/shorten', async (req, res) => {
  const { originalUrl, comment } = req.body;
  
  if (!originalUrl) {
    return res.status(400).json({ error: 'Valid URL is required' });
  }

  // Basic URL Validation
  try {
    new URL(originalUrl);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortId = generateShortId();

  try {
    const result = await db.query(
      'INSERT INTO links (original_url, short_id, comment) VALUES ($1, $2, $3) RETURNING *',
      [originalUrl, shortId, comment || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('ERROR DB INSERT:', err.message);
    res.status(500).json({ error: 'Database failed to save shortened URL.' });
  }
});

// @route   GET /api/links
// @desc    Get all shortened links
router.get('/links', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM links ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('ERROR DB FETCH LINKS:', err.message);
    res.status(500).json({ error: 'Database failed to fetch links.' });
  }
});

// @route   GET /api/analytics/:shortId
// @desc    Get stats for a single URL
router.get('/analytics/:shortId', async (req, res) => {
  const { shortId } = req.params;

  try {
    const result = await db.query('SELECT original_url, short_id, clicks, created_at, comment FROM links WHERE short_id = $1', [shortId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short link not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('ERROR DB ANALYTICS:', err.message);
    res.status(500).json({ error: 'Database failed to retrieve analytics.' });
  }
});

module.exports = router;
