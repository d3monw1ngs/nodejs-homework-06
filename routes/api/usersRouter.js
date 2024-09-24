import express from "express";
import { signupUser, loginUser, logoutUser, getCurrentUsers, updateUserSubscription } from "../../controllers/usersControllers.js";
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/logout', authMiddleware, logoutUser);
router.get('/current', authMiddleware, getCurrentUsers);
router.patch('/', authMiddleware, updateUserSubscription);

export { router };