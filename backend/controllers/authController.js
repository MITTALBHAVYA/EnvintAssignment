//authController.js
import User from "../models/userModel.js";
import bcrypt from 'bcrypt';
import JwtService from '../services/jwtServices.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../middleware/errorHandler.js';
import EmailService from "../services/EmailService.js";
import crypto from 'crypto';
import { PasswordReset } from "../models/passwordResetModel.js";
import logger from '../utils/logger.js';

export const register = catchAsyncErrors(async (req, res, next) => {
    const { username, email, password } = req.body;

    logger.info(`Registration attempt for email: ${email}`);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        logger.warn(`Registration failed: Email already in use - ${email}`);
        return next(new ErrorHandler("User already exists with this email", 400));
    }
    const user = await User.create({ username, email, password });
    logger.info(`New user registered: ${email}, UserID: ${user._id}`);

    const token = JwtService.generateToken(user);
    JwtService.sendToken(user, 201, res, "User registered successfully");
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    logger.info(`Login attempt for email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
        logger.warn(`Login failed: Invalid email - ${email}`);
        return next(new ErrorHandler("1. Invalid email or password", 401));
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        logger.warn(`Login failed: Incorrect password for ${email}`);
        return next(new ErrorHandler("2. Invalid email or password", 401));
    }

    const token = JwtService.generateToken(user);

    logger.info(`User logged in: ${email}, UserID: ${user._id}`);
    JwtService.sendToken(user, 200, res, "Login successful");
});

export const logout = catchAsyncErrors(async (req, res, next) => {

    logger.info(`User logged out: ${req.user?.email || "Unknown User"}`);

    res
        .status(200)
        .cookie("token", "", {
            expires: new Date(Date.now()),
            httpOnly: true,
            sameSite: 'Strict',
        })
        .json({
            success: true,
            message: "Logged out successfully.",
        });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    logger.info(`Password reset request initiated for email: ${email}`);

    const user = await User.findOne({ email } );

    if (!user) {
        logger.warn(`Password reset failed: No user found with email - ${email}`);
        return next(new ErrorHandler("User not found with this email", 404));
    }
    const { _id } = user;
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    const resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    const user_id = _id.toString();
    const delPrev = await PasswordReset.deleteMany({ user_id });
    const passwordResetData = await PasswordReset.create({ user_id, resetPasswordToken, resetPasswordExpire });
    const emailSubject = `Password Reset Request`;
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;
    const emailMessage = `You requested a password reset. Click here to reset your password: ${resetUrl}\n\n If you did not request this, please ignore this email.`;

    try {
        const emailService = new EmailService({
            recipientEmail: email,
            emailSubject,
            emailMessage,
        });
        await emailService.sendEmail();
        logger.info(`Password reset email sent to: ${email}`);

        res.status(200).json({
            success: true,
            message: 'Password reset token sent to email',
        })
    } catch (error) {
        logger.error(`Failed to send password reset email to: ${email} - ${error.message}`);
        return next(new ErrorHandler("Email could not be sent", 500));
    }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    if (!req.body.password || !req.body.confirmPassword) {
        return next(new ErrorHandler("Please provide a password and confirm it", 400));
    }

    if (req.body.password.length < 8) {
        return next(new ErrorHandler("Password must be at least 8 characters long", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const passwordResetData = await PasswordReset.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!passwordResetData) {
        logger.warn(`Invalid or expired password reset token`);
        return next(new ErrorHandler("Password reset token is invalid or has expired", 400));
    }

    const { user_id } = passwordResetData;
    await PasswordReset.deleteOne({ user_id });

    const user = await User.findOne({ _id: user_id});
    if (!user) {
        logger.warn(`Password reset failed: No user found for reset token`);
        return next(new ErrorHandler("User not found", 404));
    }

    try {
        user.password = req.body.password;
    } catch (error) {
        return next(new ErrorHandler("Error hashing password", 500));
    }

    await user.save();

    JwtService.sendToken(user, 200, res, "Password reset successful");
});

