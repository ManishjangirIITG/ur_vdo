// In services/otpService.js
import twilio from 'twilio';
import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'
import crypto from 'crypto';

dotenv.config()

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const OTP_EXPIRY = 5 * 60 * 1000;

const otpStore = new Map();

export const verifyOTP = (phone, code) => {
    const phoneHash = crypto.createHash('sha256').update(phone).digest('hex');
    const stored = otpStore.get(phoneHash);

    if (!stored) return false;
    if (Date.now() > stored.expiresAt) return false;

    return stored.otp === code;
};

const client = twilio(accountSid, authToken);

if (!accountSid || !authToken || !twilioPhoneNumber) {
    throw new Error('Twilio credentials are missing in environment variables');
}

export const sendEmailOTP = async (email, otp) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: email,
        from: 'maskeduchihaobito@gmail.com',
        subject: 'Your OTP for Login',
        text: `Your verification OTP is: ${otp}`,
        html: `<strong>Your verification OTP is: ${otp}</strong>`,
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
        return true; // OTP sent successfully
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        return false; // Failed to send OTP
    }
};

export const sendSMSOTP = async (phoneNumber, otp) => {
    try {
        // Validate phone number format
        if (!phoneNumber.startsWith('+')) {
            throw new Error('Phone number must include country code (e.g. +91...)');
        }

        const message = await client.messages.create({
            body: `Your OTP for login is: ${otp}`,
            from: twilioPhoneNumber,
            to: phoneNumber
        });
        console.log(`SMS sent to ${phoneNumber}, SID: ${message.sid}`);
        return true;
    } catch (error) {
        console.error('Twilio SMS Error:', {
            code: error.code,
            message: error.message,
            moreInfo: error.more_info
        });
        return false;
    }
};