import asyncHandler from "../../../middlewares/asyncHandler.js";
import OrderService from "../../../services/orderService.js";
import dotenv from "dotenv";
dotenv.config();

// Create PayPal order
const createPayPalOrder = asyncHandler(async (req, res) => {
  const { userId, courseId, amount, orderId } = req.body; // extract orderId if available
  const { order, approvalUrl } = await OrderService.createPayPalOrder({
    userId,
    courseIds: courseId, // send as courseIds to the service
    amount,
    orderId, // pass the custom orderId if provided
  });
  res.status(201).json({
    message: "PayPal order created successfully",
    order,
    approvalUrl,
  });
});

const successPayPalOrder = asyncHandler(async (req, res) => {
  // Use the "orderID" query parameter coming from PayPal
  //const { orderID } = req.query;
  const order = await OrderService.capturePayPalOrder(req.query.token);
  res
    .status(200)
    .json({ message: "PayPal order captured successfully", order });
});
const cancelPayPalOrder = asyncHandler(async (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/payment`);
});

export { createPayPalOrder, successPayPalOrder, cancelPayPalOrder };
