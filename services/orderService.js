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

  // Now accepts an object with additional fields
  async createPayPalOrder({
    userId,
    courseIds,
    amount,
    orderId: customOrderId,
    transactionId: customTransactionId,
    currency = "USD",
  }) {
    const token = await this.generatePayPalToken();
    const courses = await Course.find({ _id: { $in: courseIds } });
    if (!courses || courses.length === 0) {
      throw new Error("Courses not found");
    }

    const purchaseItems = courses.map((course) => ({
      name: course.name,
      description: course.description,
      quantity: "1",
      unit_amount: {
        currency_code: currency,
        value: course.price,
      },
    }));
    //console.log(purchaseItems);

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

      // Use the custom orderId if provided, otherwise fallback to PayPal id
      const finalOrderId = customOrderId || id;
      // Use the custom transactionId if provided, otherwise fallback to finalOrderId
      const finalTransactionId = customTransactionId || finalOrderId;

      const order = new Order({
        userId,
        courseId: courseIds,
        amount,
        orderId: finalOrderId,
        transactionId: finalTransactionId,
        status: "pending",
      });
      console.log(order);
      await order.save();

      return {
        order: order,
        approvalUrl: approvalLink.href,
        transactionId: order.transactionId,
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
      // Check for a matching order by either "orderId" or "transactionId"
      const order = await Order.findOne({
        $or: [{ orderId: orderId }, { transactionId: orderId }],
      });
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
