import mongoose from "mongoose";
import User from "./userModel.js";
import Course from "./courseModel.js"
const saveCourseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Course,
        required: true
    },

}, { timestamps: true });

export default mongoose.model("SaveCourse", saveCourseSchema);