import User from "../models/userModel.js";
import bcrypt from 'bcrypt';
import JwtService from '../services/jwtServices.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';  

export const changePassword = catchAsyncErrors(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        logger.warn(`Password change failed: User not found (UserID: ${req.user._id})`);
        return next(new ErrorHandler("User not found", 404));
    }

 
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
        logger.warn(`Password change failed: Incorrect current password (UserID: ${req.user._id})`);
        return next(new ErrorHandler("Current password is incorrect", 401));
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    logger.info(`Password changed successfully for UserID: ${req.user._id}`);

    JwtService.sendToken(user, 200, res, "Password changed successfully");
});


export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const { username, email } = req.body;
    const user_id = req.user.id;

    logger.info(`Profile update initiated for UserID: ${user_id}`);

    let updateFields = {};
    if (username) updateFields.username = username;
    if (email) {
        const emailExists = await User.findOne({ email });
        if (emailExists && emailExists._id.toString() !== user_id) {
            logger.warn(`Profile update failed: Email already in use (UserID: ${user_id}, Email: ${email})`);
            return next(new ErrorHandler("Email already in use", 400));
        }
        updateFields.email = email;
    }

    const user = await User.findByIdAndUpdate(user_id, updateFields, { 
        new: true, 
        runValidators: true 
    });

    if (!user) {
        logger.warn(`Profile update failed: User not found (UserID: ${user_id})`);
        return next(new ErrorHandler("User not found", 404));
    }

    logger.info(`Profile updated successfully for UserID: ${user_id}`);

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
});


export const deleteCurrUser = catchAsyncErrors(async (req, res, next) => {
    const user_id = req.user.id;

    logger.info(`Delete request received for UserID: ${user_id}`);

    const user = await User.deleteOne({ _id: user_id });

    if (user.deletedCount === 0) {
        logger.warn(`Delete failed: User not found (UserID: ${user_id})`);
        return next(new ErrorHandler("User not found", 404));
    }

    logger.info(`User deleted successfully (UserID: ${user_id})`);

    res.status(200).json({ success: true, message: "User deleted successfully" });
});


export const getCurrentUser = catchAsyncErrors(async (req, res, next) => {
    const user_id = req.user.id;

    logger.info(`Fetching details for UserID: ${user_id}`);

    const user = await User.findById(user_id, 'id username email');

    if (!user) {
        logger.warn(`User not found while fetching details (UserID: ${user_id})`);
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    logger.info(`User details fetched successfully (UserID: ${user_id})`);

    res.status(200).json({ success: true, user });
});
