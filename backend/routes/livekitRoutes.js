const express = require('express');
const { AccessToken } = require('livekit-server-sdk');

const router = express.Router();

// POST /api/livekit/token
router.post('/token', async (req, res) => {
    try {
        const { roomName, userName } = req.body;

        if (!roomName || !userName) {
            return res.status(400).json({ error: 'roomName and userName are required' });
        }

        const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
            identity: userName,
        });

        // Allow this user to join the room
        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
        });

        const token = await at.toJwt();
        res.json({ token });
    } catch (err) {
        console.error('Error creating token:', err);
        res.status(500).json({ error: 'Failed to generate LiveKit token' });
    }
});

module.exports = router;
