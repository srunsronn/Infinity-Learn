import CourseService from "../../../services/courseService.js";
import asyncHandler from "../../../middlewares/asyncHandler.js";


const getAllCourses = asyncHandler(async (req, res) => {
    const result = await CourseService.getAllCourses();
    res.status(200).json({ message: "Get all courses successfully", result });
});

const createCourse = asyncHandler(async (req, res) => {
    const result = await CourseService.createCourse(req.body);
    res.status(201).json({ message: "Create course successfully", result });
});

const getCourseById = asyncHandler(async (req, res) => {
    const result = await CourseService.getCourseById(req.params.id);
    res.status(200).json({ message: "Get course by id successfully", result });
});

const updateCourse = asyncHandler(async (req, res) => {
    const result = await CourseService.updateCourse(req.params.id, req.body);
    res.status(200).json({ message: "Update course successfully", result });
});

const deleteCourse = asyncHandler(async (req, res) => {
    const result = await CourseService.deleteCourse(req.params.id);
    res.status(200).json({ message: "Delete course successfully", result });
});
export { getAllCourses, createCourse, getCourseById, updateCourse ,deleteCourse};