const Reel = require('../models/Reel');
const User = require('../models/User');

// Get all reels (Feed)
exports.getFeed = async (req, res) => {
    try {
        // Populate user details (name, vibe) for each reel
        const reels = await Reel.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'name vibe');
        res.json(reels);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create a new Reel
exports.createReel = async (req, res) => {
    const { videoUrl, caption } = req.body;

    try {
        const newReel = new Reel({
            userId: req.user.userId, // From authMiddleware
            videoUrl,
            caption
        });

        const reel = await newReel.save();
        res.json(reel);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
