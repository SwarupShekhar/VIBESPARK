const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
    const { name, email, password, vibe } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all required fields.' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name,
            email,
            password: hashedPassword,
            vibe
        });

        await user.save();

        // Generate Token
        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                vibe: user.vibe
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Return JWT
        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                vibe: user.vibe
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
