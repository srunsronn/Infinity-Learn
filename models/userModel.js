import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password required only if not using Google
      },
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    profile: {
      type: String,
      default: function () {
        return this.googleId ? "" : undefined;
      },
    },
    otp: {
      type: String,
      default: "",
    },
    otpExpiresAt: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: function () {
        return this.googleId ? true : false;
      },
    },
    googleId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.methods.generateOtp = function () {
  const otp = crypto.randomInt(100000, 999999).toString();
  this.otp = otp;
  this.otpExpiresAt = Date.now() + 10 * 60 * 1000;
  return otp;
};

userSchema.methods.verifyOtp = function (otp) {
  return this.otp === otp && this.otpExpiresAt > Date.now();
};

export default mongoose.model("User", userSchema);
