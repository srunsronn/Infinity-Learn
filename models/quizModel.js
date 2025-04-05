import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question_text: { type: String, required: true },
    options: [{ type: String, required: true }], 
    correct_answer: [{ type: Number, required: true }], 
    type: {
      type: String,
      enum: ["single-choice", "multiple-choice"],
      required: true,
    },
  },
  { _id: false } 
);

const quizSchema = new mongoose.Schema(
  {
    section_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    }, 
    title: { type: String, required: true },
    description: { type: String }, 
    time_limit: { type: Number, required: true }, 
    passing_score: { type: Number, default: 50 }, 
    is_active: { type: Boolean, default: true },
    
    questions: [questionSchema], 
  },
  { timestamps: true } 
);

export default mongoose.model("Quiz", quizSchema);
