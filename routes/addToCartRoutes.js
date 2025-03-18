import {
  getCart,
  addToCart,
  removeCart,
} from "../controllers/api/v1/addToCartController.js";
import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.route("/addTocart").post(authenticate, verifyRole("student"), addToCart);
router
  .route("/removeCart/:id")
  .delete(authenticate, verifyRole("student"), removeCart);
router
  .route("/getCart/:userId")
  .get(authenticate, verifyRole("student"), getCart);

export default router;
