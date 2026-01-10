const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getFeed, createReel } = require('../controllers/reelController');

// Public or Protected? Let's make feed protected for now consistent with user request
// GET /api/reels
router.get('/', authMiddleware, getFeed);

// POST /api/reels
router.post('/', authMiddleware, createReel);

module.exports = router;
