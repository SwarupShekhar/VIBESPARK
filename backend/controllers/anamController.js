const axios = require('axios');

const ANAM_API_KEY = process.env.ANAM_API_KEY;
const AVATAR_ID = 'd9ebe82e-2f34-4ff6-9632-16cb73e7de08';

/**
 * Create Anam AI session token
 * This allows the frontend to establish a WebRTC connection with Anam
 */
exports.createAnamSession = async (req, res) => {
    try {
        const { aiResponse } = req.body; // Gemini's response text

        if (!aiResponse) {
            return res.status(400).json({ error: 'aiResponse is required' });
        }

        console.log('🎬 Creating Anam session for response:', aiResponse);

        const response = await axios.post(
            'https://api.anam.ai/v1/auth/session-token',
            {
                personaConfig: {
                    name: 'VIBE-buddy',
                    avatarId: AVATAR_ID,
                    voiceId: '6bfbe25a-979d-40f3-a92b-5394170af54b', // Default Anam voice
                    llmId: '0934d97d-0c3a-4f33-91b0-5e136a0ef466', // Anam's LLM
                    systemPrompt: `You are VIBE-BUDDY, an empathetic AI friend. Say exactly: "${aiResponse}"`,
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ANAM_API_KEY}`,
                },
            }
        );

        console.log('✅ Anam session created successfully');
        res.json({
            sessionToken: response.data.sessionToken,
            avatarId: AVATAR_ID
        });

    } catch (error) {
        console.error('❌ Anam session error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to create Anam session',
            details: error.response?.data || error.message
        });
    }
};
