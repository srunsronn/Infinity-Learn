import mongoose from "mongoose";

const videoProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  progress: {
    type: Number, // Store percentage (e.g., 50 for 50% watched)
    required: true,
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("VideoProgress", videoProgressSchema);
