import mongoose from "mongoose";

const videoProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    index: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Course ID is required"],
    index: true,
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Section ID is required"],
    index: true,
  },
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Lecture ID is required"],
    index: true,
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Video ID is required"],
    index: true,
  },
  progress: {
    type: Number,
    required: [true, "Progress is required"],
    min: [0, "Progress cannot be less than 0"],
    max: [100, "Progress cannot exceed 100"],
    set: (val) => Math.round(val),
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  watchStartedAt: {
    type: Date,
    default: null,
  },
  watchDay: {
    type: String,
    enum: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    default: null,
  },
});

// Create a compound index so there's one progress record per video
videoProgressSchema.index(
  { userId: 1, courseId: 1, sectionId: 1, lectureId: 1, videoId: 1 },
  { unique: true }
);

export default mongoose.model("VideoProgress", videoProgressSchema);
