import express from "express";
import {
  enrolledCourse,
  getAllEnrolledCourses,
} from "../controllers/api/v1/enrolledCourseController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/:id", getAllEnrolledCourses);
router.post("/new-enroll", authenticate, verifyRole("admin"), enrolledCourse);

export default router;
