import VideoProgress from "../models/VideoProgress.js";

// Get video progress for a user
export const getVideoProgress = async (
  userId,
  courseId,
  sectionId,
  lectureId
) => {
  return (
    (await VideoProgress.findOne({
      userId,
      courseId,
      sectionId,
      lectureId,
    })) || { progress: 0 }
  );
};

// Update video progress
export const updateVideoProgress = async (
  userId,
  courseId,
  sectionId,
  lectureId,
  progress
) => {
  let videoProgress = await VideoProgress.findOne({
    userId,
    courseId,
    sectionId,
    lectureId,
  });

  if (videoProgress) {
    videoProgress.progress = progress;
    videoProgress.lastWatchedAt = new Date();
  } else {
    videoProgress = new VideoProgress({
      userId,
      courseId,
      sectionId,
      lectureId,
      progress,
    });
  }

  return await videoProgress.save();
};
