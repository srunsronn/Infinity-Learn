import mongoose from "mongoose";
import User from "./userModel.js";
import Quiz from "./quizModel.js";

const videoSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ["file", "youtube"],
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 0,
  },
});

const lectureSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  video: videoSchema,
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
  },
});

const sectionSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  lectures: [lectureSchema],
});

const courseSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    courseThumbnail: {
      type: String,
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    outcomes: [
      {
        type: String,
      },
    ],
    sections: [sectionSchema],
    courseTopic: {
      type: String,
      required: true,
    },
    studentsEnrolled: {
      type: Number,
      default: 0,
    },
    studentCompleted: {
      type: Number,
      default: 0,
    },
    averageTRating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
