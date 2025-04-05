import axios from "axios";
import dotenv from "dotenv";
import Order from "../models/orderModel.js";
import Course from "../models/courseModel.js";
import EnrolledCourseService from "./enrolledCourseService.js";

dotenv.config();

class OrderService {
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

  // Create PayPal order supporting multiple courses
  async createPayPalOrder(userId, courseIds, amount, currency = "USD") {
    const token = await this.generatePayPalToken();

    // Retrieve multiple courses using the array of courseIds
    const courses = await Course.find({ _id: { $in: courseIds } });
    if (!courses || courses.length === 0) {
      throw new Error("Courses not found");
    }

    // Build purchase items array from all courses
    const purchaseItems = courses.map((course) => ({
      name: course.name,
      description: course.description,
      quantity: "1",
      unit_amount: {
        currency_code: currency,
        value: course.price,
      },
    }));

    try {
      const res = await axios.post(
        `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
        {
          intent: "CAPTURE",
          purchase_units: [
            {
              items: purchaseItems,
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

      // Save order with courseIds as an array
      const order = new Order({
        userId,
        courseId: courseIds, // now expecting an array
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
        await EnrolledCourseService.enrolledCourse(
          order.userId,
          order.courseId
        );
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

export default new OrderService();
