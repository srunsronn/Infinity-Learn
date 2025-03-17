import express from "express";
import {
  trackLogin,
  trackTimeSpent,
  trackParticipation,
  trackQuizCompletion,
  getCourseEngagementScores,
} from "../controllers/api/v1/engagementController.js";

const router = express.Router();

router.post("/track-login", trackLogin);
router.post("/track-time-spent", trackTimeSpent);
router.post("/track-participation", trackParticipation);
router.post("/track-quiz-completion", trackQuizCompletion);
router.get("/course-engagement-scores/:courseId", getCourseEngagementScores);

export default router;