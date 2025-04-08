import express from "express";
import {
  getCourseSimilarRecommendations,
  getInterestRecommendations,
  getPersonalizedRecommendations,
  getTrendingCourses,
  getTopicCategories,
  getNewUserRecommendations,
} from "../controllers/api/v1/recommendCourseController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Course-based recommendations (with authentication)
router.get(
  "/course/:courseId",
  authenticate,
  verifyRole("admin", "student", "teacher"),
  getCourseSimilarRecommendations
);


// Interest-based recommendations (publicly accessible)
router.post("/interest", getInterestRecommendations);

// Personalized recommendations based on user's enrolled courses
router.get("/personalized", authenticate, getPersonalizedRecommendations);

// Trending/popular courses (publicly accessible)
router.get("/trending", getTrendingCourses);

// Get course topic categories
router.get("/topics", getTopicCategories);

// Recommendations for new users
router.get("/for-new-users", getNewUserRecommendations);

export default router;
