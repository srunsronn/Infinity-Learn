import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
  resendOtp,
} from "../controllers/api/v1/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/refresh-token").post(refreshToken);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyOtp);
router.route("/reset-password").post(resetPassword);
router.route("/resend-otp").post(resendOtp);

//protect routes
router.route("/admin").get(authenticate, verifyRole("admin"), (req, res) => {
  res.json({
    message: "Admin Page",
  });
});

router
  .route("/teacher")
  .get(authenticate, verifyRole("teacher"), (req, res) => {
    res.json({
      message: "Teacher Page",
    });
  });

router
  .route("/student")
  .get(authenticate, verifyRole("student"), (req, res) => {
    res.json({
      message: "Student Page",
    });
  });

export default router;
