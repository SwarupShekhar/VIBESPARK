const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { registerValidation, loginValidation, validate } = require('../middleware/validationMiddleware');

router.post('/register', registerValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);
router.get('/profile', authMiddleware, getUserProfile);

module.exports = router;
