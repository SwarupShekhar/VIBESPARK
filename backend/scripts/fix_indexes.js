const mongoose = require('mongoose');
const path = require('path');
// Load .env from backend directory (one level up from this script)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is undefined. Make sure you have a .env file in the backend directory.');
    process.exit(1);
}

const fixIndexes = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const collection = mongoose.connection.collection('users');

        // List indexes to confirm
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Drop the problematic index
        try {
            await collection.dropIndex('username_1');
            console.log('✅ Successfully dropped index: username_1');
        } catch (err) {
            console.log('⚠️ Could not drop username_1 (maybe it does not exist):', err.message);
        }

        console.log('🎉 Index fix complete. You can now register users!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

fixIndexes();
