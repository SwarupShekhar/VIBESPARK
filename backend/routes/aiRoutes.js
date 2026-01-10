const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const aiController = require('../controllers/aiController');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
}

// Configure Multer for audio uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        // Save with .wav extension for simplicity (or preserve original)
        cb(null, 'input-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// POST /api/ai/chat
// Expects 'audio' file field
// POST /api/ai/chat
// Expects 'audio' file field
router.post('/chat', upload.single('audio'), aiController.chatWithAnam);

// GET /api/ai/debug-gemini
router.get('/debug-gemini', aiController.debugGemini);

module.exports = router;
