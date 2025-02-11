import asyncHandler from "../../../middlewares/asyncHandler.js";
import AuthService from "../../../services/authService.js";

const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body, res);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body, res);
  res.status(200).json(result);
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const result = await AuthService.logout(refreshToken, res);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json(result);
});

const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const result = await AuthService.refreshToken(refreshToken, res);

  res.status(200).json(result);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await AuthService.forgotPassword(email);

  res.status(200).json(result);
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  console.log(email, otp);

  const result = await AuthService.verifyOtp(email, otp);

  res.status(200).json(result);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const result = await AuthService.resetPassword(email, otp, newPassword);

  res.status(200).json(result);
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await AuthService.resendOtp(email);

  res.status(200).json(result);
});

export {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
  resendOtp,
};
