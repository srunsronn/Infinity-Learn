import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";
import {
  getAllCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/api/v1/courseController.js";
const router = express.Router();

router.get("/", authenticate, getAllCourses);
router.post(
  "/create-course",
  authenticate,
  verifyRole("admin", "teacher"),
  createCourse
);
router.get("/:id", authenticate, getCourseById);
router.put("/:id", authenticate, verifyRole("admin", "teacher"), updateCourse);
router.delete(
  "/:id",
  authenticate,
  verifyRole("admin", "teacher"),
  deleteCourse
);
export default router;
