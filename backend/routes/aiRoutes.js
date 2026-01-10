const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const aiController = require('../controllers/aiController');

// Configure Multer for audio uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        // Save with .wav extension for simplicity (or preserve original)
        cb(null, 'input-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// POST /api/ai/chat
// Expects 'audio' file field
router.post('/chat', upload.single('audio'), aiController.chatWithAnam);

module.exports = router;
