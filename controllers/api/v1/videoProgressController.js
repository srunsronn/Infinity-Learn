import * as videoProgressService from "../../../services/videoProgressService.js";
import mongoose from "mongoose";

// Shared validation function for ObjectIds
const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Update progress for a specific video in a lecture
export const updateProgress = async (req, res) => {
  try {
    const { userId, courseId, sectionId, lectureId, videoId, progress } =
      req.body;

    if (
      ![userId, courseId, sectionId, lectureId, videoId].every(validateObjectId)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format - all IDs must be valid MongoDB ObjectIDs",
      });
    }

    if (typeof progress !== "number" || isNaN(progress)) {
      return res.status(400).json({
        success: false,
        error: "Progress must be a numeric value",
      });
    }

    const updatedProgress = await videoProgressService.updateVideoProgress(
      userId,
      courseId,
      sectionId,
      lectureId,
      videoId,
      progress
    );

    return res.json({
      success: true,
      data: {
        progress: updatedProgress.progress,
        lastWatched: updatedProgress.lastWatchedAt,
        watchStartedAt: updatedProgress.watchStartedAt,
        watchDay: updatedProgress.watchDay,
      },
    });
  } catch (error) {
    console.error("API Error:", {
      endpoint: "updateProgress",
      error: error.message,
      body: req.body,
    });
    return res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Failed to update progress"
          : error.message,
    });
  }
};

// Get progress for a specific video in a lecture
export const getVideoProgress = async (req, res) => {
  try {
    const { userId, courseId, sectionId, lectureId, videoId } = req.params;

    if (
      ![userId, courseId, sectionId, lectureId, videoId].every(validateObjectId)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format - all IDs must be valid MongoDB ObjectIDs",
      });
    }

    const progressData = await videoProgressService.getVideoProgress(
      userId,
      courseId,
      sectionId,
      lectureId,
      videoId
    );

    return res.json({
      success: true,
      data: {
        progress: progressData ? progressData.progress : 0,
        lastWatched: progressData ? progressData.lastWatchedAt : null,
        watchStartedAt: progressData ? progressData.watchStartedAt : null,
        watchDay: progressData ? progressData.watchDay : null,
      },
    });
  } catch (error) {
    console.error("API Error:", {
      endpoint: "getVideoProgress",
      error: error.message,
      params: req.params,
    });
    return res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Failed to fetch progress"
          : error.message,
    });
  }
};

// Get all video progress records for a user
export const getAllVideoProgressByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!validateObjectId(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid userId format - must be a valid MongoDB ObjectID",
      });
    }

    const allProgress = await videoProgressService.getAllVideoProgressByUser(
      userId
    );

    return res.json({
      success: true,
      data: allProgress,
    });
  } catch (error) {
    console.error("API Error:", {
      endpoint: "getAllVideoProgressByUser",
      error: error.message,
      params: req.params,
    });
    return res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Failed to fetch all video progress"
          : error.message,
    });
  }
};

export const getCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    if (![userId, courseId].every(validateObjectId)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid ID format - userId and courseId must be valid MongoDB ObjectIDs",
      });
    }

    const computedProgress = await videoProgressService.getCourseProgress(
      userId,
      courseId
    );
    return res.json({
      success: true,
      data: {
        courseProgress: `${computedProgress}%`,
      },
    });
  } catch (error) {
    console.error("API Error:", {
      endpoint: "getCourseProgress",
      error: error.message,
      params: req.params,
    });
    return res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Failed to fetch course progress"
          : error.message,
    });
  }
};

export const getAllCourseProgressByUser = async (req, res) => {
  try {
    // Ensure req.params exists and destructure userId (or use an empty object if undefined)
    const { userId } = req.params || {};
    if (!userId || !validateObjectId(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing userId parameter",
      });
    }

    const coursesProgress =
      await videoProgressService.getAllCourseProgressByUser(userId);
    return res.json({
      success: true,
      data: coursesProgress,
    });
  } catch (error) {
    console.error("API Error:", {
      endpoint: "getAllCourseProgressByUser",
      error: error.message,
      params: req.params,
    });
    return res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Failed to fetch all course progress"
          : error.message,
    });
  }
};
