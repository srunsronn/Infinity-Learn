import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";
import { getAllCourses, createCourse } from "../controllers/api/v1/courseController.js";
const router = express.Router();

router.get("/", authenticate, getAllCourses);
router.post("/create-course", authenticate, verifyRole("admin", "teacher"), createCourse);


export default router;