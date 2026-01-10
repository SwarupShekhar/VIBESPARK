const { check, validationResult } = require('express-validator');

// Validation Rules
exports.registerValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

exports.loginValidation = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
];

// Error Handling Middleware
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
