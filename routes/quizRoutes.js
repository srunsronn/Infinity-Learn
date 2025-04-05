import express from "express";

import {
  createQuiz,
  getAllQuiz,
  updateQuiz,
  deleteQuiz,
  updateQuizStatus,
  getAllActiveQuiz,
  getQuizzesBySection,
  getQuizzesByCourse
} from "../controllers/api/v1/quizController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Create a new quiz
router
  .route("/createQuiz")
  .post(authenticate, verifyRole("admin", "teacher"), createQuiz);

// Get all quizzes
router
  .route("/getAllQuiz")
  .get(authenticate, verifyRole("admin", "teacher", "student"), getAllQuiz);

// Get all active quizzes
router
  .route("/getAllQuiz/active")
  .get(
    authenticate,
    verifyRole("admin", "teacher", "student"),
    getAllActiveQuiz
  );
router
  .route("/course/:courseId")
  .get(
    authenticate,
    verifyRole("admin", "teacher", "student"),
    getQuizzesByCourse
  );

router
  .route("/section/:sectionId")
  .get(
    authenticate,
    verifyRole("admin", "teacher", "student"),
    getQuizzesBySection
  );

// Update a quiz
router
  .route("/updateQuiz")
  .put(authenticate, verifyRole("admin", "teacher"), updateQuiz);

// Update quiz status
router
  .route("/updateQuiz/status/:id")
  .patch(authenticate, verifyRole("admin", "teacher"), updateQuizStatus);

// Delete a quiz
router
  .route("/deleteQuiz/:id")
  .delete(authenticate, verifyRole("admin", "teacher"), deleteQuiz);

export default router;
