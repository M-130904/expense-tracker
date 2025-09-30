// backend/managers/AuthManager.js
const User = require('../models/User');

class AuthManager {
    // Register a new user
    static async registerUser(data) {
        // The pre-save hook in User model handles hashing
        const newUser = new User(data);
        return newUser.save();
    }

    // Find user by email for login validation
    static async findUserByEmail(email) {
        return User.findOne({ email });
    }

    // Find user by ID
    static async findUserById(id) {
        return User.findById(id).select('-password'); // Exclude password
    }

    // Helper to generate JWT token
    static generateToken(id) {
        return require('jsonwebtoken').sign({ id }, process.env.JWT_SECRET, {
            expiresIn: '30d', // Token expires in 30 days
        });
    }
}

module.exports = AuthManager;