import jwt from 'jsonwebtoken';
import { User } from '../models/usersModel.js';
import "dotenv/config";

const { SECRET_KEY } = process.env;

export const authMiddleware = async (req, res, next) => {
    try {
        // Check if authorization header is present
        const { authorization = '' } = req.headers;
        const [bearer, token] = authorization.split(' ');

        // Check if the token is provided and has the correct format
        if (bearer !== 'Bearer' || !token) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY);

        // Find the user by ID
        const user = await User.findById(decoded.id);

        // Check if the user exists and if the token matches the one in the database
        if (!user || user.token !== token) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Store user data in req.user for access in route handlers
        req.user = user;
        next();
    } catch (error) {
        // If token verification or any error occurs, return unauthorized
        return res.status(401).json({ message: 'Not authorized' });
    }
};

