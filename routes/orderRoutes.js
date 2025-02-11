import express from "express";
import { createOrder, getOrderById, getUserOrders , getAllOrders, updateOrderById, deleteOrder} from "../controllers/api/v1/orderController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

//student
router.route("/create-order").post(authenticate,verifyRole("student"), createOrder);
router.route("/:id").get(authenticate, getOrderById);
router.route("/user/:id").get(authenticate,verifyRole("student"), getUserOrders);

//admin 
router.route("/admin/get-all-orders").get(authenticate, verifyRole("admin"), getAllOrders);
router.route("/:id/status").put(authenticate, verifyRole("admin"), updateOrderById);

router.route("/:id").delete(authenticate,verifyRole("student", "admin"), deleteOrder);



export default router;
