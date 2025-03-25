import LoginHistory from "../models/loginHistoryModel.js";
import BaseService from "../utils/baseService.js";

class LoginHistoryService extends BaseService {
  constructor() {
    super(LoginHistory);
  }

  async trackLogin(userId, ipAddress, device, browser, os, tokenId) {
    const filter = { userId, device, browser, os };
    let record = await LoginHistory.findOne(filter);

    if (record) {
      // Update the login time and ip address if desired
      record.loginTime = Date.now();
      record.ipAddress = ipAddress;
      record.tokenId = tokenId; // Update tokenId if needed
      return await record.save();
    } else {
      const newLogin = new LoginHistory({
        userId,
        ipAddress,
        device,
        browser,
        os,
        tokenId, // store the token identifier
      });
      return await newLogin.save();
    }
  }

  async getUserLoginHistory(userId) {
    return await LoginHistory.find({ userId }).sort({ loginTime: -1 });
  }
}

export default new LoginHistoryService();
