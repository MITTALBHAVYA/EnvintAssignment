import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 20,
    },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

export default mongoose.model("User", userSchema);
