import BaseService from "./baseService.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import createTokens from "../utils/jwtUtils.js";
import jwt from "jsonwebtoken";
import Redis from "ioredis";
import dotenv from "dotenv";
import sendEmail from "../utils/email.js";

dotenv.config();
const redis = new Redis(process.env.REDIS_URL);

class AuthService extends BaseService {
  constructor(User) {
    super(User);
  }

  // register
  async register(data, res) {
    const { name, email, password } = data;

    if (!name || !email || !password) {
      throw new Error("Please fill all fields.");
    }

    const userExist = await this.model.findOne({ email });
    if (userExist) {
      throw new Error("User already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    const { accessToken, refreshToken } = createTokens(res, newUser._id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await redis.set(
      `refreshToken:${newUser._id}`,
      refreshToken,
      "EX",
      60 * 60 * 24 * 30
    );

    return {
      message: "Registration successful",
      user: newUser,
      accessToken,
      refreshToken,
    };
  }

  // login

  async login(data, res) {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error("Please fill all fields.");
    }

    const user = await this.model.findOne({ email });

    if (!user) {
      throw new Error("User not found.");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid credentials.");
    }

    const { accessToken, refreshToken } = createTokens(res, user._id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await redis.set(
      `refreshToken:${user._id}`,
      refreshToken,
      "EX",
      60 * 60 * 24 * 30
    );

    return {
      message: "Login success",
      user: user,
      accessToken,
      refreshToken,
    };
  }

  // logout
  async logout(refreshToken) {
    if (refreshToken) {
      const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refreshToken:${decode.userId}`);
    }

    return { message: "Logout success" };
  }

  // refresh token
  async refreshToken(refreshToken, res) {
    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const storedToken = await redis.get(`refreshToken:${decode.userId}`);

    if (storedToken !== refreshToken) {
      throw new Error("Invalid refresh token.");
    }

    const { accessToken } = createTokens(res, decode.userId);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return { accessToken };
  }

  // forgot password
  async forgotPassword(email) {
    const user = await this.model.findOne({ email });

    if (!user) {
      throw new Error("User not found.");
    }

    const otp = user.generateOtp();
    await user.save();

    sendEmail({
      email: user.email,
      subject: "Forgot Password",
      message: `${otp}`,
    });

    return { message: "OTP sent to your email" };
  }

  // verify OTP
  async verifyOtp(email, otp) {
    const user = await this.model.findOne({ email });

    console.log(user);

    if (!user) {
      throw new Error("User not found.");
    }

    if (!user.verifyOtp(otp)) {
      throw new Error("Invalid or expired OTP");
    }

    return { message: "OTP verified" };
  }

  // reset password
  async resetPassword(email, otp, newPassword) {

    const user = await this.model.findOne({ email });

    if (!user) {
      throw new Error("User not found.");
    }

    if (!user.verifyOtp(otp)) {
      throw new Error("Invalid or expired OTP");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = "";
    user.otpExpiresAt = 0;

    await user.save();

    return { message: "Password reset success" };
  }

  // resend OTP
  async resendOtp(email) {
    const user = await this.model.findOne({ email });

    if (!user) {
      throw new Error("User not found.");
    }

    const otp = user.generateOtp();
    await user.save();

    sendEmail({
      email: user.email,
      subject: "Forgot Password",
      message: `Your OTP is ${otp}`,
    });

    return { message: "OTP sent to your email" };
  }
}
export default new AuthService(User);
