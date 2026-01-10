const mongoose = require('mongoose');

const ReelSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        trim: true
    },
    likes: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reel', ReelSchema);
