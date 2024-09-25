import { User } from '../models/usersModel.js';
import bcrypt from 'bcryptjs';
import gravatar from 'gravatar';
import jwt from 'jsonwebtoken';
import "dotenv/config";
import { Jimp } from 'jimp';
import path from 'path';
import fs from 'fs/promises';
import { nanoid } from 'nanoid';
import { sendEmail } from '../helpers/sendEmail.js';
import { signupValidation, subscriptionValidation, validateEmail } from '../validations/validation.js';

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

        // Generate a unique verification token
        const verificationToken = nanoid();

        // Create a link to the user's avatar with gravatar
        const avatarURL = gravatar.url(email, { protocol: 'http' });
        
        // Create a new user
        const newUser = await User.create({
            email,
            password: hashedPassword,
            verificationToken,
            avatarURL,
        });
        
        // Create the verification link
        const verificationLink = `${process.env.BASE_URL}/auth/verify/${verificationToken}`;
        
        // Compose the email content
        const emailContent = `
            <p>Welcome! Please verify your email by clicking the following link:</p>
            <a href="${verificationLink}">Verify Your Email</a>
        `;

        // Send the verification email asynchronously
        await sendEmail(email, 'Verify Your Email', emailContent);
        
        // Send a success response
       res.status(201).json({
           user: {
               email: newUser.email,
               subscription: newUser.subscription,
               avatarURL: newUser.avatarURL,
               verificationToken,
           },
           message: 'User registered successfully. Please check your email to verify your account.',
       });
    
    } catch (error) {
        // Catch and send any server errors
            return res.status(500).json({
                message: 'Server error',
                error: error.message,
        });
    }
};

const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate that the email field is present
        if (!email) {
            return res.status(400).json({ message: 'missing required field email' });
        }

        // validation for the email format
        const { error } = validateEmail.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has already verified their email
        if (user.verify) {
            return res.status(400).json({ message: 'Verification has already been passed' });
        }

        // Create the verification link
        const verificationLink = `${process.env.BASE_URL}/auth/verify/${user.verificationToken}`;

        // Compose the email content
        const emailContent = `
        <p>It seems you didn't verify your email. Please verify your email by clicking the following link:</p>
        <a href="${verificationLink}">Verify Your Email</a>
        `;

        // Send the verification email
        await sendEmail(email, 'Verify Your Email', emailContent);

        // Respond with success message
        return res.status(200).json({ message: 'Verification email sent' });

    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
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

        // Check if the user's email is verified
        if (!user.verify) {
            return res.status(403).json({ message: 'Please verify your email before logging in.'});
        }

        // Compare the provided password with the hashed password
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

 //  For email verification
const verifyEmail = async (req, res) => {
    try {
        const { verificationToken } = req.params;

        // Find the user with the provided verification token
        const user = await User.findOne({ verificationToken });

        if (!user) {
            // If no user is found, return 404
            return res.status(404).json({
                message: 'User not found',
            });
        }

        // Update the user document: set verify to true and clear the verificationToken
        await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });

        // Send a successful response
        return res.status(200).json({
            message: 'Verification successful',
        });
    } catch (error) {
        // Handle errors
        return res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

const getVerificationStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user's email is verified
        if(user.verify) {
            return res.status(200).json({ message: 'Email is verified' });
        } else {
            return res.status(400).json({ message: 'Email is not verified' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { 
    signupUser, 
    resendVerificationEmail,
    loginUser, 
    logoutUser, 
    getCurrentUsers, 
    updateUserSubscription, 
    updateAvatar,
    verifyEmail,
    getVerificationStatus,
};



