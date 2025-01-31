import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided. Not authorized." });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found. Not authorized." });
    }

    next(); 
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token. Not authorized." });
  }
};

export { authenticate };
