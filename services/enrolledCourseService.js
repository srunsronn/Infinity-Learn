import mongoose from "mongoose";
import EnrolledCourse from "../models/enrolledModel.js";
import BaseService from "../utils/baseService.js";
import User from "../models/userModel.js";
import Course from "../models/courseModel.js";
import ErrorHandler from "../utils/errorHandler.js";

class EnrolledService extends BaseService {
    constructor() {
        super(EnrolledCourse);
    }

    async enrolledCourse(userID, courseID) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userID) || !mongoose.Types.ObjectId.isValid(courseID)) {
                throw new ErrorHandler(400, "Invalid user or course ID format");
            }

            // Check if user and course exist
            const userExists = await User.findById(userID);
            const courseExists = await Course.findById(courseID);

            if (!userExists || !courseExists) {
                throw new ErrorHandler(404, "User or course not found");
            }

            // Check if already enrolled
            const existingEnrollment = await this.model.findOne({ user: userID, course: courseID });
            if (existingEnrollment) {
                throw new ErrorHandler(400, "User is already enrolled in this course");
            }

            const newEnrollCourse = new this.model({ user: userID, course: courseID });
            await newEnrollCourse.save();
            return { status: 200, message: "Course enrolled successfully" };
        } catch (err) {
            throw new ErrorHandler(500, err.message);
        }
    }

    // Get all enrolled courses for a user
    async getAllEnrolledCourses(userID) {
        try {
            // 
            // return await this.model.find({ user: userID }).populate("course");
            return await this.model.find({ user: userID });
        } catch (err) {
            throw new ErrorHandler(500, err.message);
        }
    }
}

export default new EnrolledService(EnrolledCourse);
