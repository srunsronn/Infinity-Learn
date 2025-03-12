import mongoose from "mongoose";
import User from "./userModel.js";
import Course from "./courseModel.js"
const enrolledSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    completed: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0
    },
    feedback: {
        type: String,
        default: ""
    }

}, { timestamps: true });

export default mongoose.model("EnrolledCourse", enrolledSchema);