import CourseService from "../../../services/courseService.js";
import asyncHandler from "../../../middlewares/asyncHandler.js";

const getAllCourses = asyncHandler(async (req, res) => {
    const result = await CourseService.findAll();
    res.status(200).json({ message: "Get all courses successfully", result });
});

const createCourse = asyncHandler(async (req, res) => {
    const result = await CourseService.createCourse(req.body);
    res.status(201).json({ message: "Create course successfully", result });
});

export { getAllCourses, createCourse }  ;