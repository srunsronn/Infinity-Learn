import * as UAParser from "ua-parser-js";
import loginHistoryService from "../../../services/loginHistoryService.js";
import { redis } from "../../../config/redis.js";
import jwt from "jsonwebtoken";
import LoginHistory from "../../../models/loginHistoryModel.js";
const trackLogin = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userAgentString = req.headers["user-agent"];
    console.log("User Agent String:", userAgentString);
    const parser = new UAParser.UAParser(userAgentString);
    const result = parser.getResult();
    console.log("UAParser Result:", result);

    const browser = `${result.browser.name || "Unknown Browser"} ${
      result.browser.version || ""
    }`.trim();
    const os = `${result.os.name || "Unknown OS"} ${
      result.os.version || ""
    }`.trim();
    const device = result.device.model || "Desktop";
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "Unknown";
    // Extract tokenId from the access token if present.
    let tokenId = "unknown";
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      tokenId = decoded.tokenId;
    }
    const loginData = await loginHistoryService.trackLogin(
      userId,
      ipAddress,
      device,
      browser,
      os,
      tokenId
    );
    res.status(200).json({ message: "Login Tracked", data: loginData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error tracking Login", error: error.message });
  }
};

const getUserLoginHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Fetching login history for user:", userId);
    const history = await loginHistoryService.getUserLoginHistory(userId);
    console.log("MongoDB result:", history);
    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching login history:", error);
    res
      .status(500)
      .json({ message: "Error fetching login history", error: error.message });
  }
};

const deleteLoginHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await LoginHistory.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Remove the login history record.
    await loginHistoryService.delete(id);

    // Revoke the token associated with this record.
    // Match the life of your access token (15 minutes = 900 seconds)
    if (record.tokenId) {
      await redis.set(`bl_${record.tokenId}`, record.tokenId, "EX", 900);
    }

    res.status(200).json({ message: "Device logged out and record deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting login history",
      error: error.message,
    });
  }
};

export { trackLogin, getUserLoginHistory, deleteLoginHistory };
