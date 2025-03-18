import BaseService from "../utils/baseService.js";
import Order from "../models/orderModel.js";
import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

class PaymentService extends BaseService {
  constructor() {
    super(Order);
  }

  // Helper function to generate the hash
  generateHash(input) {
    return crypto
      .createHmac("sha512", process.env.ABA_PAYWAY_API_KEY)
      .update(input)
      .digest("base64");
  }

  // Create transaction with PayWay
  async createTransaction(data, res) {
    try {
      const {
        userId,
        firstname,
        lastname,
        email,
        phone,
        amount,
        currency,
        return_url,
        continue_success_url,
      } = data;

      // Validate input
      if (
        !userId ||
        !firstname ||
        !lastname ||
        !email ||
        !phone ||
        !amount ||
        !currency ||
        !return_url ||
        !continue_success_url
      ) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Generate return_param (unique identifier for the transaction)
      const returnParam = `rp-${Date.now()}`;

      // Generate return_url (base64 encoded callback URL)
      const encodedReturnUrl = Buffer.from(return_url).toString("base64");

      // Generate the hash
      const hashInput =
        process.env.ABA_PAYWAY_MERCHANT_ID + userId + returnParam;
      const hash = this.generateHash(hashInput);

      // PayWay API request payload
      const payload = {
        merchant_id: process.env.ABA_PAYWAY_MERCHANT_ID,
        ctid: userId,
        firstname,
        lastname,
        email,
        phone,
        amount,
        currency,
        return_param: returnParam,
        return_url: encodedReturnUrl,
        continue_add_card_success_url: continue_success_url,
        hash,
      };

      // Log the request payload for debugging
      console.log("PayWay API Request Payload:", payload);

      // Send the request to PayWay's CoF Initial API
      const response = await axios.post(
        process.env.ABA_PAYWAY_API_URL,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Log the response data for debugging
      console.log("PayWay API Response Data:", response.data);

      // Check if the response contains the URL
      if (response.data && response.data.url) {
        console.log("✅ PayWay returned a URL. Redirecting...");
        res.status(200).json({ url: response.data.url }); // Send the URL to the client
      } else {
        res.status(400).json({ error: "No URL returned from PayWay" });
      }
    } catch (error) {
      console.error(
        "Error in createTransaction:",
        error.response ? error.response.data : error.message
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default new PaymentService(Order);
