//userController.js
import User from "../models/userModel.js";
import bcrypt from 'bcrypt';
import JwtService from '../services/jwtServices.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../middleware/errorHandler.js';


export const changePassword = catchAsyncErrors(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Compare current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
        return next(new ErrorHandler("Current password is incorrect", 401));
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    JwtService.sendToken(user, 200, res, "Password changed successfully");
});


export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const { username, email } = req.body;

    let updateFields = {};
    if (username) updateFields.username = username;
    if (email) {
        const emailExists = await User.findOne({ email });
        if (emailExists && emailExists._id.toString() !== req.user.id) {
            return next(new ErrorHandler("Email already in use", 400));
        }
        updateFields.email = email;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, { 
        new: true, 
        runValidators: true 
    });

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
    const user = await User.deleteOne({ _id: user_id });
    res.status(200).json({ success: true, user});
});

export const getCurrentUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id, 'id username email'); 

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
});