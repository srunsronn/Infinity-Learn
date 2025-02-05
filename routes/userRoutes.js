import express from "express";
import { getUserProfile, updateUserProfile, deleteUser, getAllUsers } from "../controllers/api/v1/userControllers.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);

//admin route
router.delete("/deleteUser/:id", authenticate, verifyRole('admin'), deleteUser);
router.get("/getAllUsers", authenticate, verifyRole('admin'), getAllUsers);

export default router;

// router.post("/create-quiz", authenticate, verifyRole("teacher", "admin"), createQuiz);