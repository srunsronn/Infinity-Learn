import asyncHandler from "../../../middlewares/asyncHandler.js";
import OrderService from "../../../services/orderService.js";
import dotenv from "dotenv";
dotenv.config();

// Create PayPal order
const createPayPalOrder = asyncHandler(async (req, res) => {
  const { userId, courseId, amount } = req.body;
  const { order, approvalUrl } = await OrderService.createPayPalOrder(
    userId,
    courseId,
    amount
  );
  res.status(201).json({
    message: "PayPal order created successfully",
    order,
    approvalUrl,
  });
});

const successPayPalOrder = asyncHandler(async (req, res) => {
  const order = await OrderService.capturePayPalOrder(req.query.token);
  res.status(200).json({
    message: "PayPal order captured successfully",
    order,
  });
});
const cancelPayPalOrder = asyncHandler(async (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/payment`);
});

export { createPayPalOrder, successPayPalOrder, cancelPayPalOrder };
