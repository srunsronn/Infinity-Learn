import User from "../../../models/userModel.js";
import asyncHandler from "../../../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createTokens from "../../../utils/jwtUtils.js";
import jwt from "jsonwebtoken";
import Redis from "ioredis";
import dotenv from "dotenv";
import { send } from "process";
import sendEmail from "../../../utils/email.js";
import { verify } from "crypto";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL);

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all fields.");
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("User already exists.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    const { accessToken, refreshToken } = createTokens(res, newUser._id);

    await redis.set(
      `refreshToken:${newUser._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    );

    res.status(201).json({
      message: "Register success",
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Server error");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill all fields.");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid credentials.");
  }

  const { accessToken, refreshToken } = createTokens(res, user._id);

  await redis.set(
    `refreshToken:${user._id}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );

  res.status(200).json({
    message: "Login success",
    _id: user._id,
    name: user.name,
    email: user.email,
    accessToken,
    refreshToken,
  });
});

const logout = asyncHandler(async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refreshToken:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout success" });
  } catch (error) {
    res.status(500);
    throw new Error("Server error");
  }
});

const refreshToken = asyncHandler(async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided." });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const storedToken = await redis.get(`refreshToken:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const { accessToken } = createTokens(res, decoded.userId);

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500);
    throw new Error("Server error");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const otp = user.generateOtp();
  await user.save();

  sendEmail({
    email: user.email,
    subject: "Forgot Password",
    message: `${otp}`,
  });

  res.status(200).json({ message: "OTP sent to your email" });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  console.log(email, otp);

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (user.verifyOtp(otp)) {
    res.status(200).json({ message: "OTP verified" });
  } else {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (!user.verifyOtp(otp)) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.otp = "";
  user.otpExpiresAt = 0;
  await user.save();

  res.status(200).json({ message: "Password reset success" });
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const otp = user.generateOtp();
  await user.save();

  sendEmail({
    email: user.email,
    subject: "Forgot Password",
    message: `Your OTP is ${otp}`,
  });

  res.status(200).json({ message: "OTP sent to your email" });
});

export {
  register,
  loginUser,
  logout,
  refreshToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
  resendOtp,
};
