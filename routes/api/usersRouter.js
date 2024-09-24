import express from "express";
import { signupUser, loginUser, logoutUser, getCurrentUsers, updateUserSubscription, updateAvatar } from "../../controllers/usersControllers.js";
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { upload } from "../../middleware/upload.js";

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/logout', authMiddleware, logoutUser);
router.get('/current', authMiddleware, getCurrentUsers);
router.patch('/', authMiddleware, updateUserSubscription);
router.patch('/avatars', authMiddleware, upload.single('avatar'), updateAvatar);

export { router };