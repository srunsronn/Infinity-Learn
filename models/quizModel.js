import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    title: { type: String, required: true },
    description: { type: String },
    time_limit: { type: Number, required: true }, // in minutes
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);



export default mongoose.model("Quiz", quizSchema);
