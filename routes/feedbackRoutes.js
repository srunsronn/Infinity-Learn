import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";
import {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getFeedbackByCourseId,
} from "../controllers/api/v1/feedbackController.js";

const router = express.Router();

router
  .route("/createFeedback")
  .post(authenticate, verifyRole("student"), createFeedback);
router
  .route("/getAllFeedback")
  .get(authenticate, verifyRole("admin"), getAllFeedback);
router
  .route("/getFeedbackById/:id")
  .get(authenticate, verifyRole("admin", "teacher"), getFeedbackById);
router
  .route("/updateFeedback/:id")
  .put(authenticate, verifyRole("admin", "teacher"), updateFeedback);
router
  .route("/deleteFeedback/:id")
  .delete(authenticate, verifyRole("admin", "teacher"), deleteFeedback);
router
  .route("/getFeedbackByCourseId/:id")
  .get(authenticate, verifyRole("admin", "teacher"), getFeedbackByCourseId);

export default router;
