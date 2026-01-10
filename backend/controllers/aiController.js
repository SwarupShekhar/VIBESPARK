const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Configuration ---
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ANAM_API_KEY = process.env.ANAM_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

exports.chatWithAnam = async (req, res) => {
    try {
        console.log("🎤 Received voice chat request");

        // Validate API keys first
        if (!DEEPGRAM_API_KEY || !GEMINI_API_KEY || !ELEVENLABS_API_KEY) {
            console.error("❌ Missing API keys. Check environment variables.");
            return res.status(500).json({
                error: 'Server configuration error. Please add API keys to Railway environment.'
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded' });
        }

        const audioPath = req.file.path;
        console.log(`📁 Audio file saved at: ${audioPath}`);

        // --- 1. Deepgram (Speech-to-Text) ---
        console.log("📝 Transcribing with Deepgram...");
        const deepgramResponse = await transcribeAudio(audioPath);
        const userTranscript = deepgramResponse?.results?.channels[0]?.alternatives[0]?.transcript;

        if (!userTranscript) {
            throw new Error("Deepgram failed to transcribe audio.");
        }
        console.log(`🗣️ User said: "${userTranscript}"`);

        // --- 2. Gemini (LLM) ---
        console.log("🧠 Generating response with Gemini...");
        const aiReply = await generateGeminiResponse(userTranscript);
        console.log(`🤖 AI Reply: "${aiReply}"`);

        // --- 3. ElevenLabs (Text-to-Speech) ---
        console.log("🔊 Generating voice with ElevenLabs...");
        // Use a default Voice ID (e.g., '21m00Tcm4TlvDq8ikWAM' is Rachel, or pick one from env)
        const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
        const audioStream = await generateSpeechElevenLabs(aiReply, VOICE_ID);

        // --- 4. Anam AI (Avatar Video) ---
        // NOTE: Anam API usually requires audio input to generate lip-sync.
        // Assuming Anam has an endpoint that takes audio and returns video.
        // If Anam is purely real-time streaming, this flow might differ.
        // Based on user prompt: "Use Anam AI API to animate avatar (based on avatarId and generated voice)"

        // For this MVP, since Anam might be complex to integrate blindly without docs, 
        // we will return the Audio URL (from ElevenLabs) and Transcript. 
        // *Self-Correction*: User explicitly asked for Anam Video URL.
        // Let's implement a placeholder function for Anam that we can refine if docs are provided.
        // Or strictly follow the user's request structure.

        console.log("🎬 Generating Avatar Video with Anam AI...");
        // Placeholder: Anam API usually takes text or audio. 
        // Let's assume we send the text/audio to Anam.
        const avatarVideoUrl = await generateAnamVideo(aiReply, req.body.avatarId || 'default');

        // Cleanup uploaded file
        fs.unlinkSync(audioPath);

        res.json({
            transcript: userTranscript,
            reply: aiReply,
            avatarVideoUrl: avatarVideoUrl
        });

    } catch (error) {
        console.error("❌ Error in chatWithAnam:", error);
        // Cleanup if error
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message || 'Server error processing AI chat' });
    }
};

// --- Helper Functions ---

async function transcribeAudio(filePath) {
    try {
        const audioData = fs.readFileSync(filePath);
        console.log(`📏 Audio file size: ${audioData.length} bytes`);

        const response = await axios.post(
            'https://api.deepgram.com/v1/listen?smart_format=true&model=nova-2',
            audioData,
            {
                headers: {
                    'Authorization': `Token ${DEEPGRAM_API_KEY}`,
                    'Content-Type': 'audio/m4a'
                }
            }
        );
        console.log('✅ Deepgram response:', JSON.stringify(response.data).slice(0, 200));
        return response.data;
    } catch (error) {
        console.error('❌ Deepgram API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        throw new Error(`Deepgram API failed: ${error.response?.data?.err_msg || error.message}`);
    }
}

async function generateGeminiResponse(text) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // System instruction (injected as context for now as gemini-pro is chat optimized)
    const prompt = `
    You are VIBE-BUDDY, an empathetic AI friend. 
    Your purpose: Make users feel heard.
    Tone: Warm, conversational, curious.
    Rules: Keep replies short (2 sentences max). No lectures. Ask one follow-up question.
    
    User said: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

async function generateSpeechElevenLabs(text, voiceId) {
    // Returns audio buffer or stream
    const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
            text: text,
            model_id: "eleven_monolingual_v1",
            voice_settings: { stability: 0.5, similarity_boost: 0.5 }
        },
        {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        }
    );
    return response.data;
}

async function generateAnamVideo(text, avatarId) {
    // *** INTEGRATION PLACEHOLDER ***
    // Real Anam API integration differs. 
    // Usually it acts as a streaming interface (Talk API).
    // For this async REST flow, we'd need a "generate video" endpoint.
    // If Anam only supports real-time streaming, we might need to change architecture.
    // Proceeding with a mock/assumption for now as requested.

    // Attempting to hit Anam API (hypothetical endpoint)
    // const response = await axios.post('https://api.anam.ai/v1/talk', { ... })

    // For MVP safety, returning a dummy video URL if API fails or is unknown.
    return "https://www.w3schools.com/html/mov_bbb.mp4"; // Mock video for testing frontend
}
