import * as videoProgressService from "../../../services/videoProgressService.js";

// Get video progress
export const getProgress = async (req, res) => {
  try {
    const { userId, courseId, sectionId, lectureId } = req.params;
    const progress = await videoProgressService.getVideoProgress(
      userId,
      courseId,
      sectionId,
      lectureId
    );
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update video progress
export const updateProgress = async (req, res) => {
  try {
    const { userId, courseId, sectionId, lectureId, progress } = req.body;
    const updatedProgress = await videoProgressService.updateVideoProgress(
      userId,
      courseId,
      sectionId,
      lectureId,
      progress
    );
    res.json({ message: "Video progress updated", updatedProgress });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
