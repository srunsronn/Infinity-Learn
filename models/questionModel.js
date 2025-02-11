import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    question_text: { type: String, required: true },
    options: { type: [String], required: true },
    correct_answer: { type: String, required: true },
    type: { type: String, enum: ["multiple-choice", "true/false", "short-answer"], required: true },
    difficulty_level: { type: String, default: "medium" }, // optional
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
