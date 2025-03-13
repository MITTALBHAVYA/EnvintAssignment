//userRoutes.js

import express from "express";
import {changePassword, updateProfile, getCurrentUser,deleteCurrUser} from "../controllers/userController.js"
import { isAuthorized } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put('/change-password', isAuthorized, changePassword);
router.put('/me', isAuthorized, updateProfile);
router.get('/me', isAuthorized, getCurrentUser);
router.delete('/me',isAuthorized,deleteCurrUser);

export default router;