import express from 'express';
import { checkLoginRequirements, login, verifyOTP } from '../Controllers/auth.js';

const router = express.Router();

router.get('/check-login-requirements', checkLoginRequirements);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);

export default router;