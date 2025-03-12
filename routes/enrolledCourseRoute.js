import express from "express";
import {
  enrolledCourse,
  getAllEnrolledCourses,
  getCourseEnrollmentsByInstructor,
  getCourseEnrollmentsMonthly
} from "../controllers/api/v1/enrolledCourseController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/:id", getAllEnrolledCourses);
router.post("/new-enroll", authenticate, verifyRole("student"), enrolledCourse);

// instructor get course enrollments
router.get("/instructor/get-course-enrollments", authenticate, verifyRole("teacher"), getCourseEnrollmentsByInstructor);

// instructor get enrollment monthly
router.get("/instructor/get-enrollments-monthly", authenticate, verifyRole("teacher"), getCourseEnrollmentsMonthly);


export default router;
