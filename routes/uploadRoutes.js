import express from "express";
import upload from "../middlewares/multer.js";
import { uploadImage } from "../controllers/api/v1/uploadController.js";

const router = express.Router();

// Define the POST route for uploading an image
router.post("/", upload.single("image"), uploadImage);

export default router;