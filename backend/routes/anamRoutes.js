const express = require('express');
const router = express.Router();
const anamController = require('../controllers/anamController');

// POST /api/anam/session
// Create Anam AI session token for WebRTC streaming
router.post('/session', anamController.createAnamSession);

module.exports = router;
