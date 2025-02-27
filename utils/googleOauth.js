import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import ErrorHandler from "./errorHandler.js";
dotenv.config();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export const getProfileInfo = async (credential) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw new ErrorHandler(400, "Invalid token");
  }
};
