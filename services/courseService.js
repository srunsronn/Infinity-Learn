import BaseService from "../utils/baseService.js";
import Course from "../models/courseModel.js";
import ErrorHandler from "../utils/errorHandler.js";

class CourseService extends BaseService {
    constructor(Course) {
        super(Course);
    }

    // get course by ID
    async getCourseById(courseID) { 
        try {
            const course = await this.findById(courseID);
            return course;
        } catch (err) {
            throw new ErrorHandler(500, err.message);
        }
    }

    // get all courses
    async getAllCourses() {
        try {
            return await this.findAll();
        } catch (err) {
            throw new ErrorHandler(500, err.message);
        }
    }

    // create course
    async createCourse(data) {
        try {
            return await this.create(data);
        } catch (err) {
            throw new ErrorHandler(500, err.message);
        }
    }

    // update course
    // async updateCourse(courseID, data) {
    //     try {
    //         const course = await this.model.findById(courseID); 

    //         if (!course) {
    //             throw new ErrorHandler(404, "Course not found");
    //         }


    //     } catch (error) {
            
    //     }
    // }
}


export default new CourseService(Course);