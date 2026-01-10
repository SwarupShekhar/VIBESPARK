// ===================================
// VIBESPARK API & SIGNALING SERVER (server.js)
// ===================================

// --- 1. CONFIGURATION & IMPORTS ---

// Load environment variables from .env file FIRST (safely)
// Load environment variables from .env file FIRST (safely)
require('dotenv').config();

// Core Server and Database Modules
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');           // <--- HTTP server for Socket.IO
const { Server } = require('socket.io'); // <--- Socket.IO Server
const morgan = require('morgan');       // <--- Logger

// Security and Utility Modules
const cors = require('cors');

// Initialize Express App and HTTP Server
const app = express();
const server = http.createServer(app); // <--- Use http to wrap Express

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Initialize Socket.IO server, passing the HTTP server
const io = new Server(server, {
    cors: {
        origin: "*", // Allows all origins (for Vercel front-end)
        methods: ["GET", "POST"]
    }
});

// --- 2. MIDDLEWARE ---

// Parse incoming JSON requests (req.body)
app.use(express.json());

// Logging
app.use(morgan('dev'));

// Enable Cross-Origin Resource Sharing for front-end access
app.use(cors());


// --- 3. DATABASE CONNECTION ---

// --- 3. DATABASE CONNECTION ---

const connectDB = async () => {
    try {
        // Connection options can be added here if needed, but Mongoose 6+ defaults are good
        const conn = await mongoose.connect(MONGODB_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📂 Database Name: ${conn.connection.name}`);

        // Listen for connection errors after initial connection
        mongoose.connection.on('error', err => {
            console.error('❌ MongoDB Runtime Error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB Disconnected. Attempting to reconnect...');
        });

    } catch (err) {
        console.error('❌ MongoDB Connection Failed:', err.message);
        // Do NOT exit process, try again in 5 seconds provided we haven't given up
        console.log('🔄 Retrying MongoDB connection in 5s...');
        setTimeout(connectDB, 5000);
    }
};


// --- 4. API ROUTES ---

// --- 4. API ROUTES ---

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reels', require('./routes/reelRoutes'));

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Vibespark backend is running 🚀');
});



// --- 5. SOCKET.IO SIGNALING LOGIC (WebRTC Foundation) ---

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a 'room' based on a user ID or call ID
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
        socket.to(roomId).emit('user_joined', socket.id);
    });

    // Relay WebRTC Offer
    socket.on('offer', (data) => {
        socket.to(data.toRoom).emit('offer', data.signal, socket.id);
    });

    // Relay WebRTC Answer
    socket.on('answer', (data) => {
        socket.to(data.toRoom).emit('answer', data.signal, socket.id);
    });

    // Relay ICE Candidates (Network information)
    socket.on('ice-candidate', (data) => {
        socket.to(data.toRoom).emit('ice-candidate', data.candidate, socket.id);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


// --- 6. START SERVER ---

// 1. Start listening IMMEDIATELY (Fixes Railway "Connection Refused" / 502 Errors)
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on port ${PORT} (0.0.0.0)`);
    console.log(`📡 Socket.IO initialized.`);
});

// 2. Connect to Database asynchronously
console.log('⏳ Attempting to connect to MongoDB...');
if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is undefined. Check Railway Variables.');
} else {
    connectDB();
}
