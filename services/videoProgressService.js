import VideoProgress from "../models/videoProgressModel.js";
import Course from "../models/courseModel.js";
// Update or create progress for a specific video in a lecture
export const updateVideoProgress = async (
  userId,
  courseId,
  sectionId,
  lectureId,
  videoId,
  progress
) => {
  try {
    const now = new Date();
    const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));
    const watchDay = now.toLocaleString("en-US", { weekday: "long" });

    // Find existing record, if any
    const existingRecord = await VideoProgress.findOne({
      userId,
      courseId,
      sectionId,
      lectureId,
      videoId,
    });

    // If a record exists and progress is already 100 or new progress is lower than current,
    // do not update to avoid resetting progress.
    if (existingRecord) {
      if (
        existingRecord.progress === 100 ||
        clampedProgress < existingRecord.progress
      ) {
        return existingRecord;
      }
    }

    // Otherwise, update or insert the record.
    const updatedRecord = await VideoProgress.findOneAndUpdate(
      { userId, courseId, sectionId, lectureId, videoId },
      {
        $set: {
          progress: clampedProgress,
          lastWatchedAt: now,
          watchDay,
        },
        $setOnInsert: {
          watchStartedAt: now,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return updatedRecord;
  } catch (error) {
    console.error("Progress update failed:", error);
    throw new Error(`Failed to update progress: ${error.message}`);
  }
};

export const getVideoProgress = async (
  userId,
  courseId,
  sectionId,
  lectureId,
  videoId
) => {
  try {
    return await VideoProgress.findOne({
      userId,
      courseId,
      sectionId,
      lectureId,
      videoId,
    });
  } catch (error) {
    console.error("Fetching video progress failed:", error);
    throw new Error(`Failed to fetch progress: ${error.message}`);
  }
};

export const getCourseProgress = async (userId, courseId) => {
  try {
    // Get all video progress records for the given user and course
    const records = await VideoProgress.find({ userId, courseId });

    // Sum up the progress from records (if a lecture has no record, its progress is 0)
    const sumProgress = records.reduce(
      (sum, record) => sum + record.progress,
      0
    );

    // Fetch the full course document to count the total number of videos
    const course = await Course.findById(courseId);
    if (!course) {
      console.error(`Course ${courseId} not found`);
      return 0;
    }
    let totalVideos = 0;
    // Count every lecture that has a video
    course.sections.forEach((section) => {
      if (Array.isArray(section.lectures)) {
        totalVideos += section.lectures.filter(
          (lecture) => lecture.video && lecture.video._id
        ).length;
      }
    });

    // Compute overall progress:
    // For example, if sumProgress is 100 and there are 2 sections with videos, computed progress is 50.
    const computedProgress =
      totalVideos > 0 ? Math.round(sumProgress / totalVideos) : 0;
    return computedProgress;
  } catch (error) {
    console.error("Failed to fetch course progress:", error);
    throw new Error(`Failed to fetch course progress: ${error.message}`);
  }
};

export const getAllVideoProgressByUser = async (userId) => {
  try {
    return await VideoProgress.find({ userId });
  } catch (error) {
    console.error("Fetching video progress failed:", error);
    throw new Error(`Failed to fetch progress: ${error.message}`);
  }
};

export const getAllCourseProgressByUser = async (userId) => {
  try {
    // Get all video progress records for the user
    const records = await VideoProgress.find({ userId });
    if (!records.length) return [];

    // Group records by courseId and sum their progress
    const grouped = records.reduce((acc, record) => {
      const courseKey = record.courseId.toString();
      if (!acc[courseKey]) {
        acc[courseKey] = { sumProgress: 0 };
      }
      acc[courseKey].sumProgress += record.progress;
      return acc;
    }, {});

    const result = [];
    // For each course, fetch the course and count total number of videos
    for (const courseId of Object.keys(grouped)) {
      const course = await Course.findById(courseId);
      if (!course) {
        console.error(`Course ${courseId} not found`);
        continue;
      }
      let totalVideos = 0;
      // Count every lecture that has a video
      course.sections.forEach((section) => {
        if (Array.isArray(section.lectures)) {
          totalVideos += section.lectures.filter(
            (lecture) => lecture.video && lecture.video._id
          ).length;
        }
      });
      // If the course contains two videos and only one progress record exists with progress 100,
      // computedProgress should be Math.round(100 / 2) = 50.
      const computedProgress =
        totalVideos > 0
          ? Math.round(grouped[courseId].sumProgress / totalVideos)
          : 0;
      result.push({
        courseId,
        courseProgress: computedProgress, // progress as a percentage (0 - 100)
      });
    }
    return result;
  } catch (error) {
    console.error("Failed to fetch all course progress:", error);
    throw new Error(`Failed to fetch all course progress: ${error.message}`);
  }
};
