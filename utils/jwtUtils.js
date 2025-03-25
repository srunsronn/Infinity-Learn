import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
const generateAccessToken = (userId) => {
  const tokenId = uuidv4();
  return jwt.sign({ userId, tokenId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

const generateRefreshToken = (userId) => {
  const tokenId = uuidv4();
  return jwt.sign({ userId, tokenId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

const createTokens = (res, userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  return { accessToken, refreshToken };
};

export default createTokens;
