import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      // gg
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
        return !this.googleId;
      },
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    profile: {
      type: String, // URL of the profile picture
      // default: function () {
      //   return this.googleId ? "" : undefined;
      // },
      default: "",
    },
    bio: {
      type: String,
      default: "", // User bio, optional
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
