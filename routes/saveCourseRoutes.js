import express from "express";
import {
  getAllSaveCourse,
  saveCourse,
} from "../controllers/api/v1/saveCourseController.js";

const router = express.Router();

router.get("/:id", getAllSaveCourse);
router.post("/create-saveCourse", saveCourse);

export default router;
