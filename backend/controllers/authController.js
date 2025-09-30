// backend/controllers/authController.js
const AuthManager = require('../managers/AuthManager');

exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await AuthManager.findUserByEmail(email);

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = await AuthManager.registerUser({ name, email, password });

        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            token: AuthManager.generateToken(newUser._id),
        });
    } catch (err) {
        next(err);
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await AuthManager.findUserByEmail(email);

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: AuthManager.generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        next(err);
    }
};