import express from "express";
import { getUserProfile, updateUserProfile, deleteUser, getAllUsers, getUsersMonthly, updateUserRole, createUserByAdmin, updateUserByAdmin,getUserById } from "../controllers/api/v1/userControllers.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/profile", authenticate, getUserProfile);
router.put(
  "/profile/",
  authenticate,
  verifyRole("admin", "teacher", "student"),
  updateUserProfile
);

//admin route
router.delete("/deleteUser/:id", authenticate, verifyRole('admin'), deleteUser);
router.get("/getAllUsers", authenticate, verifyRole('admin'), getAllUsers);
router.get("/admin/get-users-monthly", authenticate, verifyRole("admin"), getUsersMonthly);
router.patch("/update-role/:id", authenticate, verifyRole("admin"), updateUserRole);
router.post("/create-user", authenticate, verifyRole("admin"), createUserByAdmin);
router.get("/get-user/:id", authenticate, verifyRole("admin"), getUserById);
router.put("/update-user/:id", authenticate, verifyRole("admin"), updateUserByAdmin);
export default router;

// router.post("/create-quiz", authenticate, verifyRole("teacher", "admin"), createQuiz);
