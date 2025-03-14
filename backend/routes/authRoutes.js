//authRoutes.js

import express from "express";
import { register, login, logout, forgotPassword, resetPassword} from "../controllers/authController.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register",rateLimiter(15,20), register);
router.post("/login",rateLimiter(15,20), login);
router.post("/logout", logout);
router.post("/forgot-password", rateLimiter(15,5),forgotPassword);
router.put("/reset-password/:token",resetPassword);
export default router;