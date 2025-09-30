// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const AuthManager = require('../managers/AuthManager');

const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header (Format: Bearer <TOKEN>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token payload (excluding password)
            req.userId = decoded.id; 
            
            // Optionally fetch user details if needed:
            // req.user = await AuthManager.findUserById(decoded.id);

            next(); // Proceed to the controller
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };