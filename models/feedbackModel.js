import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    feedback_text: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      // optional rating (e.g., scale of 1-5)
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
