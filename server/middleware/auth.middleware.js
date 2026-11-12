import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/users.js';

export const authenticate = (req, res, next) => {
    try {
        //Get the authorization header from the request
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        // Extract the token from the authorization header
        const token = authHeader.split('Bearer ')[1];

        // Verify the token using the JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.auth = decoded; // Attach the decoded token to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Error authenticating token:", error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const requireAdmin = async (req, res, next) => {
    const userId = req.auth?.id;
    if (typeof userId !== 'string' || !mongoose.isValidObjectId(userId)) {
        return res.status(401).json({ error: 'Invalid authentication token.' });
    }

    try {
        const user = await User.findById(userId).select('role');
        if (!user) {
            return res.status(401).json({ error: 'Account no longer exists.' });
        }
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        return next();
    } catch (error) {
        console.error('Error checking admin access:', error);
        return res.status(500).json({ error: 'Could not verify account permissions.' });
    }
};