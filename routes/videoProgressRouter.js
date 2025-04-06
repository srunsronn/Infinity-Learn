import express from "express";
import {
  updateProgress,
  getVideoProgress,
  getAllVideoProgressByUser,
  getCourseProgress,
  getAllCourseProgressByUser,
} from "../controllers/api/v1/videoProgressController.js";

const router = express.Router();

router.get(
  "/:userId/:courseId/:sectionId/:lectureId/:videoId",
  getVideoProgress
);
router.post("/update", updateProgress);
router.get("/user/:userId", getAllVideoProgressByUser);
router.get("/courseProgress/:userId/:courseId", getCourseProgress);
// Route for aggregated course progress for all courses for a user
router.get("/allCourses/:userId", getAllCourseProgressByUser);

export default router;
