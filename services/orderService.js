import axios from "axios";
import dotenv from "dotenv";
import Order from "../models/orderModel.js";
import Course from "../models/courseModel.js";
import EnrolledCourseService from "./enrolledCourseService.js";

dotenv.config();

class OrderService {
  // Generate PayPal OAuth Token
  async generatePayPalToken() {
    const res = await axios.post(
      `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: process.env.PAYPAL_CLIENT_ID,
          password: process.env.PAYPAL_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return res.data.access_token;
  }

  // Create PayPal order
  async createPayPalOrder(userId, courseId, amount, currency = "USD") {
    const token = await this.generatePayPalToken();

    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    try {
      const res = await axios.post(
        `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
        {
          intent: "CAPTURE",
          purchase_units: [
            {
              items: [
                {
                  name: course.name,
                  description: course.description,
                  quantity: "1",
                  unit_amount: {
                    currency_code: currency,
                    value: amount,
                  },
                },
              ],
              amount: {
                currency_code: currency,
                value: amount,
                breakdown: {
                  item_total: {
                    currency_code: currency,
                    value: amount,
                  },
                },
              },
            },
          ],
          application_context: {
            return_url: `${process.env.FRONTEND_URL}/success-order`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel-order`,
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            brand_name: "Infinity E-Learning",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { id, links } = res.data;

      const approvalLink = links.find((link) => link.rel === "approve");
      if (!approvalLink) {
        throw new Error("Approval link is missing in PayPal response");
      }

      // Save order with transaction ID
      const order = new Order({
        userId,
        courseId,
        amount,
        transactionId: id,
        status: "pending",
      });
      await order.save();

      return {
        order: res.data,
        approvalUrl: approvalLink.href,
        transactionId: id,
      };
    } catch (error) {
      console.error(
        "Error creating PayPal order:",
        error.response?.data || error.message
      );
      throw new Error("Failed to create PayPal order");
    }
  }

  // Capture PayPal order
  async capturePayPalOrder(orderId) {
    const token = await this.generatePayPalToken();

    const res = await axios.post(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    try {
      const order = await Order.findOne({ transactionId: orderId });
      if (order) {
        order.status = "completed";
        await order.save();

        //call enroll course service
        await EnrolledCourseService.enrolledCourse(order.userId, order.courseId);
      } else {
        throw new Error("Order not found");
      }
    } catch (error) {
      console.error(
        "Error capturing PayPal order:",
        error.response?.data || error.message
      );
      throw new Error("Failed to capture PayPal order");
    }
    return res.data;
  }
}

export default new OrderService(Order);
