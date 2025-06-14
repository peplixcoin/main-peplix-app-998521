const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided, authorization denied' });
        }
        
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found, authorization denied' });
        }
        req.user = user._id;  // Store the user's ID in req.user
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid or expired' });
    }
};

module.exports = authMiddleware;
