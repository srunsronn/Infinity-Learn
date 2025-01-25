import express from "express";
import { register, loginUser, logout, refreshToken, forgotPassword, verifyOtp, resetPassword, resendOtp} from "../controllers/api/v1/authController.js";

const router = express.Router();
router.route("/register").post(register);
router.route("/login").post(loginUser);
router.route("/logout").post(logout);
router.route("/refresh-token").post(refreshToken);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyOtp);
router.route("/reset-password").post(resetPassword);
router.route("/resend-otp").post(resendOtp);


export default router;