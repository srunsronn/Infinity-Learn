import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { redis } from "../config/redis.js";
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token provided. Unauthorized!" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the access token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // Check token revocation
    const isRevoked = await redis.get(`bl_${decoded.tokenId}`);
    if (isRevoked) {
      return res
        .status(401)
        .json({ message: "Token revoked,please log in again" });
    }
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found. Unauthorized!" });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token. Not authorized." });
  }
};

export { authenticate };
