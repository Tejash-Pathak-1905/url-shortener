var express = require('express');
var router = express.Router();
const db = require('../db');

/* GET home page (fallback) */
router.get('/', function(req, res, next) {
  res.send('URL Shortener API Server');
});

// @route   GET /:shortId
// @desc    Redirect to original URL
router.get('/:shortId', async (req, res, next) => {
  const { shortId } = req.params;

  try {
    const result = await db.query(
      'UPDATE links SET clicks = clicks + 1 WHERE short_id = $1 RETURNING original_url',
      [shortId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Short link not found');
    }

    const { original_url } = result.rows[0];
    res.redirect(original_url);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during redirection');
  }
});

module.exports = router;
