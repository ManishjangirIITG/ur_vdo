import express from 'express';
import { determineTheme } from '../services/authService.js';

const router = express.Router();

router.get('/', (req, res) => {
  console.log('the userlocation which is input for the determineTheme is : ',req.userLocation);
  res.json({ theme: determineTheme(req.userLocation) });
});

export default router;
