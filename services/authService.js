import BaseService from "../utils/baseService.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import createTokens from "../utils/jwtUtils.js";
import jwt from "jsonwebtoken";
import Redis from "ioredis";
import dotenv from "dotenv";
import sendEmail from "../utils/email.js";
import ErrorHandler from "../utils/errorHandler.js";
import { OAuth2Client } from "google-auth-library";
import { getProfileInfo } from "../utils/googleOauth.js";

dotenv.config();

dotenv.config();
const redis = new Redis(process.env.REDIS_URL);

class AuthService extends BaseService {
  constructor(User) {
    super(User);
  }

  // register
  async register(data, res) {
    const { firstName,lastName, email, password } = data;

    if (!firstName || !lastName || !email || !password) {
      throw new ErrorHandler(400, "Please fill all fields.");
    }

    const userExist = await this.model.findOne({ email });
    if (userExist) {
      throw new ErrorHandler(400, "User already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
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

    await redis.set(
      `refreshToken:${newUser._id}`,
      refreshToken,
      "EX",
      60 * 60 * 24 * 30
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
    });

    return {
      message: "Registration successful",
      user: newUser,
      accessToken,
    };
  }

  // login
  async login(data, res) {
    const { email, password } = data;

    if (!email || !password) {
      throw new ErrorHandler(400, "Please fill all fields.");
    }

    const user = await this.model.findOne({ email });

    if (!user) {
      throw new ErrorHandler(404, "User not found.");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new ErrorHandler(401, "Invalid credentials.");
    }

    const { accessToken, refreshToken } = createTokens(res, user._id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    await redis.set(
      `refreshToken:${user._id}`,
      refreshToken,
      "EX",
      60 * 60 * 24 * 30
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
    });

    return {
      message: "Login success",
      user: user,
      accessToken,
    };
  }

  // logout
  async logout(userId, res) {
    if (userId) {
      await redis.del(`refreshToken:${userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return { message: "Logout success" };
  }

  // refresh token
  async refreshToken(refreshToken, res) {
    try {
      if (!refreshToken) {
        throw new ErrorHandler(400, "Refresh token required.");
      }

      const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const storedToken = await redis.get(`refreshToken:${decode.userId}`);

      if (!storedToken || storedToken !== refreshToken) {
        throw new ErrorHandler(400, "Invalid or expired refresh token.");
      }

      // Generate a new access token
      const { accessToken, refreshToken: newRefreshToken } = createTokens(
        res,
        decode.userId
      );

      // Update refresh token in Redis
      await redis.set(
        `refreshToken:${decode.userId}`,
        newRefreshToken,
        "EX",
        60 * 60 * 24 * 30
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
      });

      return { accessToken };
    } catch (error) {
      throw new ErrorHandler(400, "Invalid refresh token.");
    }
  }

  // forgot password
  async forgotPassword(email) {
    const user = await this.model.findOne({ email });

    if (!user) {
      throw new ErrorHandler(404, "User not found.");
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

    if (!user) {
      throw new ErrorHandler(404, "User not found.");
    }

    if (!user.verifyOtp(otp)) {
      throw new ErrorHandler(400, "Invalid or expired OTP");
    }

    return { message: "OTP verified" };
  }

  // reset password
  async resetPassword(email, otp, newPassword) {
    const user = await this.model.findOne({ email });

    if (!user) {
      throw new ErrorHandler(404, "User not found.");
    }

    if (!user.verifyOtp(otp)) {
      throw new ErrorHandler(400, "Invalid or expired OTP");
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
      throw new ErrorHandler(404, "User not found.");
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

  async googleLogin(token, res) {
    const payload = await getProfileInfo(token);
    const { email, firstName, lastName, sub: googleId, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        googleId,
        email,
        firstName,
        lastName,
        profile: picture,
        isVerified: true,
      });
      await user.save();
    } else {
      if (user.profile !== picture) {
        user.profile = picture;
        await user.save();
      }
    }

    const { accessToken, refreshToken } = createTokens(user._id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    await redis.set(
      `refreshToken:${user._id}`,
      refreshToken,
      "EX",
      60 * 60 * 24 * 30 // 30 days
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
    });

    return { accessToken, refreshToken, user };
  }
}

export default new AuthService(User);
