import express from "express";
import {
  createPayPalOrder,
  successPayPalOrder,
  cancelPayPalOrder

} from "../controllers/api/v1/orderController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Student
router
  .route("/create-paypal-order")
  .post(authenticate, verifyRole("student"), createPayPalOrder);

router.route("/success-order").get(successPayPalOrder);
router.route("/cancel-order").get(cancelPayPalOrder);

export default router;
