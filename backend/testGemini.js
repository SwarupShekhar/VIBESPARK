const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios'); // Added axios import
require("dotenv").config();

async function testGemini() {
    try {
        const apiKey = process.env.GEMINI_API_KEY; // Introduced apiKey variable
        console.log("🔑 Testing with API Key:", apiKey ? "Present" : "Missing");

        console.log("\n🔍 Listing models via REST API...");
        try {
            const listResponse = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            console.log("✅ Models found:", listResponse.data.models?.map(m => m.name).join(", "));
        } catch (e) {
            console.log("❌ Failed to list models:", e.response?.data || e.message);
        }

        const genAI = new GoogleGenerativeAI(apiKey); // Used apiKey
        // Try the models that were actually LISTED as available
        const models = [
            "gemini-2.0-flash",
            "gemini-flash-latest",
            "gemini-2.0-flash-lite",
            "gemini-pro-latest"
        ];

        for (const modelName of models) {
            console.log(`\n🤖 Attempting model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Say 'Gemini is working' in one word.");
                const response = await result.response;
                console.log(`✅ SUCCESS with ${modelName}:`, response.text());
                return; // Stop after first success
            } catch (e) {
                console.log(`❌ Failed ${modelName}:`, e.message);
            }
        }
        console.log("\n❌ ALL MODELS FAILED.");
    } catch (err) {
        console.error("❌ Fatal Error:", err);
    }
}

testGemini();
