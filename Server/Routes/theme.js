import express from 'express';
import { determineTheme } from '../services/authService.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ theme: determineTheme(req.userLocation) });
});

export default router;
