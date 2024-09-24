import { User } from '../models/usersModel.js';
import bcrypt from 'bcryptjs';
import gravatar from 'gravatar';
import jwt from 'jsonwebtoken';
import "dotenv/config";
import { Jimp } from 'jimp';
import path from 'path';
import fs from 'fs/promises';
import { signupValidation, subscriptionValidation } from '../validations/validation.js';

const { SECRET_KEY } = process.env;

const signupUser = async (req, res) => {
    try {
        // Validate the request body
        const {error} = signupValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { email, password } = req.body;

        // Check if the email is already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email in use" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a link to the user's avatar with gravatar
        const avatarURL = gravatar.url(email, { protocol: 'http' });

        // Create a new user
        const newUser = await User.create({
            email,
            password: hashedPassword,
            avatarURL,
        });

        // Send a success response
        res.status(201).json({
            user: {
                email: newUser.email,
                subscription: newUser.subscription,
                avatarURL: newUser.avatarURL,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        // Validate the request body
        const { error } = signupValidation.validate(req.body);
        if (error) {
            return res.status(401).json({ message: error.details[0].message });
        }

        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email or password is wrong' });
        }

        // Compare the passwords
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Email or password is wrong' });
        }

        // Create a JWT token 
        const payload = { id: user._id };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });

        await User.findByIdAndUpdate(user._id, { token });

        // Send a success response
        res.status(200).json({
            token,
            user: {
                email: user.email,
                subscription: user.subscription,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logoutUser = async (req, res) => {
    try {
        const { _id } = req.user;

        // Find the user by ID
        const user = await User.findById(_id);

        if (!user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Clear the token in the user document
        user.token = null;
        await user.save();

        // Send a successful response with no content
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCurrentUsers = async (req, res) => {
    try {
        // req.user is populated by the middleware if the token is valid
        const { email, subscription } = req.user;

        // Return the user's email and subscription
        res.status(200).json({ email, subscription });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserSubscription = async (req, res) => {
    try {
        // Validate the subscription data in the request body
        const {error} = subscriptionValidation.validate(req.body);
        if (error) {
            // Throw a 400 Bad Request error if validation fails
            return res.status(400).json({ message: 'Email or password is required' });
        }
        // Extract the user ID from the authenticated user (req.user)
        const { _id } = req.user;

        // Find the user by ID and update their subscription
        const updatedUser = await User.findByIdAndUpdate(_id, req.body, {
            new: true,
        });

        // If no user is found, return a 404 Not Found error
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with the updated user's email and subscription
        res.json({
            email: updatedUser.email,
            subscription: updatedUser.subscription,
        });
    } catch (error) {
        // Pass any server error to the error-handling middleware
        res.status(500).json({ message: error.message });
    }
 };

 const updateAvatar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { path: oldPath, originalname } = req.file;

        // Process the image using Jimp
        try {
            const image = await Jimp.read(oldPath);
            image.cover(250, 250).write(oldPath);
        } catch (error) {
            return res.status(500).json({message: 'Failed to process image'});
        }

        // Generate unique filename using user ID and file extension
        const extension = path.extname(originalname);
        const filename = `${_id}${extension}`;
        const newPath = path.join('public', 'avatars', filename);

        // Move the file from tmp folder to public/avatars
        try {
            await fs.rename(oldPath, newPath);
        } catch (error) {
            return res.status(500).json({message: 'Failed to move file'});
        }

        // Generate avatar URL
        let avatarURL = path.posix.join('/avatars', filename);

        // Update the user's avatarURL in the database
        await User.findByIdAndUpdate(_id, { avatarURL });

        // Send a successful response with the new avatar URL
        res.status(200).json({ avatarURL });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
 };

export { signupUser, loginUser, logoutUser, getCurrentUsers, updateUserSubscription, updateAvatar };



