//jwtServices.js

import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

class JwtService {
    // Method to generate a JWT token
    static generateToken(user) {
        try {
            user._id.toString();
            const userID = user._id.toString();
            return jwt.sign({ id: userID }, process.env.JWT_SECRET_KEY, {
                expiresIn: process.env.JWT_EXPIRE,
            });
        } catch (error) {
            throw new Error(`Error generating JWT token : ${error}`);
        }
    }

    // Method to verify a JWT token
    static verifyToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    reject(new Error('Invalid or expired token'));
                } else {
                    resolve(decoded);
                }
            });
        });
    }

    // Method to extract the user from the token
    static async getUserFromToken(token) {
        try {
            const decoded = await this.verifyToken(token);
            const user = await User.findByPk(decoded.id);
            
            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            throw new Error(error.message || 'Unable to retrieve user from token');
        }
    }

    static sendToken(user, statusCode, res, message) {
        try {
            const token = this.generateToken(user);
            const options = {
                expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000), 
                httpOnly: true, 
            };

            const userData = {
                id: user.id,
                username: user.username,
                email: user.email,
            };

            res.status(statusCode)
                .cookie('token', token, options) 
                .header('Authorization', `Bearer ${token}`) 
                .json({
                    success: true,
                    user: userData,
                    message,
                    token,
                });
        } catch (error) {
            throw new Error('Error sending JWT token');
        }
    }
}

export default JwtService;
