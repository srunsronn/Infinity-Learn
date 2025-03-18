import BaseService from "../utils/baseService.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import enrolledCourseService from "./enrolledCourseService.js";

class CourseService extends BaseService {
  constructor(Course) {
    super(Course);
  }

  // get course by ID
  async getCourseById(courseID) {
    try {
      const course = await this.model
        .findById(courseID)
        //use populate to get name of instructor
        .populate({
          path: "instructor",
          select: "name",
        });
      return course;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // get all courses
  async getAllCourses() {
    try {
      const courses = await this.model.find().populate({
        path: "instructor",
        select: "name",
      });
      return courses;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // get courses by instructor
  async getCoursesByInstructor(instructorId){
    return this.model.find({instructor: instructorId});
  }

  // create course
  async createCourse(data) {
    try {
      // Ensure the instructor exists before creating the course
      if (data.instructor) {
        const instructorExists = await User.exists({ _id: data.instructor });
        if (!instructorExists) {
          throw new ErrorHandler(404, "Instructor not found");
        }
      }

      // Create the course
      const course = await this.create(data);

      // Populate the instructor field
      const populatedCourse = await this.model.findById(course._id).populate({
        path: "instructor",
        select: "name",
      }); // Populate instructor reference
      return populatedCourse;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // update course
  async updateCourse(courseID, data) {
    try {
      const course = await this.findById(courseID);
      if (!course) {
        throw new ErrorHandler(404, "Course not found");
      }

      for (let key in data) {
        if (data[key]) {
          course[key] = data[key];
        }
      }
      const updatedCourse = await course.save();

      const populatedCourse = await this.model
        .findById(updatedCourse._id)
        .populate("instructor");

      return populatedCourse;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // delete course
  async deleteCourse(courseID) {
    try {
      const course = await this.findById(courseID);
      if (!course) {
        throw new ErrorHandler(404, "Course not found");
      }
      await this.model.findByIdAndDelete(courseID);
      return { message: "Course deleted successfully" };
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

 
}

export default new CourseService(Course);
