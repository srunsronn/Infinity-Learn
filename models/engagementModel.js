import mongoose from "mongoose";

const engagementSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    logins: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number, // Time spent in minutes
      default: 0,
    },
    participation: {
      type: Number,
      default: 0,
    },
    quizzesCompleted: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Engagement", engagementSchema);