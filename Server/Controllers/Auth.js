import users from "../models/auth.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { determineTheme, getOtpMethod } from '../services/authService.js';
import { sendEmailOTP, sendSMSOTP } from '../services/otpService.js';
import { generateOTP } from '../utils/otpUtils.js';

dotenv.config();

export const login = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;

        // Add validation
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        } // Fixed missing closing brace

        const userLocation = req.userLocation;
        if (!userLocation) {
            return res.status(500).json({ message: "Location data missing" });
        } // Fixed missing closing brace

        // Determine requirements FIRST
        const requiresPhoneNumber = getOtpMethod(userLocation) === 'sms';

        // Validate phone number if required
        if (requiresPhoneNumber && (!phoneNumber || !phoneNumber.startsWith('+'))) {
            return res.status(400).json({
                message: 'Valid phone number required (+ country code)',
                requiresPhoneNumber: true
            });
        }

        // Create/find user
        let user = await users.findOne({ email: email }) ||
            await users.create({ email: email, phonenumber: phoneNumber });

        // Generate and send OTP
        const otp = generateOTP();
        let otpSent = false;

        if (requiresPhoneNumber) {
            otpSent = await sendSMSOTP(phoneNumber, otp);
        } else {
            otpSent = await sendEmailOTP(email, otp);
        }

        console.log('user from controller/auth.js login : ',user);

        if (otpSent) {
            req.session.otp = otp;
            req.session.otpExpiry = Date.now() + 600000;
            req.session.userId = user._id;

            return res.status(200).json({
                requiresOTP: true,
                method: requiresPhoneNumber ? 'sms' : 'email'
            });
        }

        return res.status(500).json({ message: "Failed to send OTP" });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// Update verifyOTP controller
export const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!req.session.otp || req.session.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (Date.now() > req.session.otpExpiry) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        const user = await users.findById(req.session.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate FINAL token only after verification
        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Clear session data
        delete req.session.otp;
        delete req.session.otpExpiry;
        delete req.session.userId;

        return res.status(200).json({
            result: user,
            token,
            message: 'Login successful'
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const checkLoginRequirements = (req, res) => {
    try {
        const userLocation = req.userLocation;
        const theme = determineTheme(userLocation);
        const otpMethod = getOtpMethod(userLocation);

        return res.json({
            theme,
            otpMethod,
            requiresPhoneNumber: otpMethod === 'sms'
        });
    } catch (error) {
        console.error("Check requirements error:", error);
        return res.status(500).json({ message: "Failed to check login requirements" });
    }
};
