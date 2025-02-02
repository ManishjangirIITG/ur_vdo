import jwt from 'jsonwebtoken'
import User from '../models/auth.js'

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "No authentication token provided" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch the complete user data and attach it to req
    const user = await User.findById(decodedData.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

export default auth;