import express from "express";
import {
  getProgress,
  updateProgress,
} from "../controllers/api/v1/videoProgressController.js";

const router = express.Router();

router.get("/:userId/:courseId/:sectionId/:lectureId", getProgress);
router.post("/update", updateProgress);

export default router;
