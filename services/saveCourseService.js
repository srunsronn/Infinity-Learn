import BaseService from "../utils/baseService.js";
import SaveCourse from "../models/saveCourseModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Course from "../models/courseModel.js";

class SaveCourseService extends BaseService {
    constructor() {
        super(SaveCourse);
    }

    // Toggle save course
    async saveCourseToggle(userID, courseID) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userID) || !mongoose.Types.ObjectId.isValid(courseID)) {
                throw new ErrorHandler(400, "Invalid user or course ID format");
            }

            console.log("Valid userID:", userID);
            console.log("Valid courseID:", courseID);

            // Ensure user and course exist in the database
            const userExists = await User.findById(userID);
            const courseExists = await Course.findById(courseID);

            if (!userExists || !courseExists) {
                throw new ErrorHandler(404, "User or course not found");
            }

            // Check if the course is already saved
            const saveCourse = await this.model.findOne({ user: userID, course: courseID });

            if (saveCourse) {
                await saveCourse.deleteOne();
                return { status: 200, message: "Course removed from saved list successfully" };
            } else {
                const newSaveCourse = new this.model({ user: userID, course: courseID });
                await newSaveCourse.save();
                return { status: 200, message: "Course added to saved list successfully" };
            }
        } catch (err) {
            throw new ErrorHandler(500, err.message);
        }
    }

    // Get all saved courses
    async getAllSaveCourses() {
        try {
            return await this.model.find();
        } catch (err) {
            throw new ErrorHandler(500, err.message);
        }
    }
}

export default new SaveCourseService(SaveCourse);
