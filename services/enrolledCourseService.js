import mongoose, { trusted } from "mongoose";
import EnrolledCourse from "../models/enrolledModel.js";
import BaseService from "../utils/baseService.js";
import User from "../models/userModel.js";
import Course from "../models/courseModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import courseService from "./courseService.js";

class EnrolledService extends BaseService {
  constructor() {
    super(EnrolledCourse);
  }

  async enrolledCourse(student, course) {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(student) ||
        !mongoose.Types.ObjectId.isValid(course)
      ) {
        throw new ErrorHandler(400, "Invalid user or course ID format");
      }

      // Check if user and course exist
      const userExists = await User.findById(student);
      const courseExists = await Course.findById(course);

      if (!userExists || !courseExists) {
        throw new ErrorHandler(404, "User or course not found");
      }

      // Check if already enrolled
      const existingEnrollment = await this.model.findOne({
        student: student,
        course: course,
      });
      if (existingEnrollment) {
        throw new ErrorHandler(400, "User is already enrolled in this course");
      }

      const newEnrollCourse = new this.model({
        student: student,
        course: course,
      });
      await newEnrollCourse.save();

      courseExists.studentsEnrolled += 1;
      await courseExists.save();

      return { status: 200, message: "Course enrolled successfully" };
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  async getAllEnrolledCourses(userID) {
    try {
      const coursesEnrolled = await this.model
        .find({ student: userID })
        .populate("course");

      return coursesEnrolled;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  async getCourseEnrollments(instructorID) {
    try {
      // get all courses by instructor
      const courses = await courseService.getCoursesByInstructor(instructorID);

      // total enrollments for each course
      const enrollmentsData = await Promise.all(
        courses.map(async (course) => {
          const enrollmentCount = await this.model.countDocuments({
            course: course._id,
          });
          return {
            courseName: course.name,
            enrollments: enrollmentCount,
          };
        })
      );
      return enrollmentsData;
    } catch (error) {
      throw new ErrorHandler(500, error.message);
    }
  }
  async getCourseEnrollmentsMonthly(instructorID) {
    try {
      // get all courses by instructor
      const courses = await courseService.getCoursesByInstructor(instructorID);

      // aggregate enrollments by month
      const monthlyEnrollments = await this.model.aggregate([
        { $match: { course: { $in: courses.map((course) => course._id) } } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            enrollments: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const trendData = months.map((month, index) => {
        const monthData = monthlyEnrollments.find(
          (data) => data._id === index + 1
        );
        return {
          month: month,
          enrollments: monthData ? monthData.enrollments : 0,
        };
      });
      return trendData;
    } catch (error) {
      throw new ErrorHandler(500, error.message);
    }
  }
  async submitRatingEnrolledCourse(courseId, student, rating) {
    try {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        throw new ErrorHandler(400, "Invalid course ID format");
      }

      if (rating < 1 || rating > 5) {
        throw new ErrorHandler(400, "Rating must be between 1 and 5");
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const enrollment = await EnrolledCourse.findOne({
        course: courseId,
        student: student,
      });

      if (!enrollment) {
        throw new ErrorHandler(404, "User not enrolled in this course");
      }

      enrollment.rating = rating;
      await enrollment.save();

      // Update course average rating
      const ratings = await EnrolledCourse.find({
        course: courseId,
        rating: { $gt: 0 },
      });
      const averageRating =
        ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;

      course.averageTRating = averageRating;
      await course.save();

      return { averageRating };
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }
}

export default new EnrolledService(EnrolledCourse);
