import express from "express"
import { login, verifyOTP } from "../Controllers/auth.js"
import { updatechaneldata, getallchanels } from "../Controllers/channel.js";
import  authMiddleware  from "../middleware/auth.js";

const routes = express.Router();

// Authentication routes
routes.post('/login', login)
routes.post('/verify-otp', verifyOTP)

// Channel routes (protected by authentication)
routes.patch('/update/:id', authMiddleware, updatechaneldata)
routes.get('/getallchannel', authMiddleware, getallchanels)

export default routes;
