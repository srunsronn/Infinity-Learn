import asyncHandler from "../../../middlewares/asyncHandler.js";
import saveCourseService from "../../../services/saveCourseService.js";

const getAllSaveCourse = asyncHandler(async (req, res) => {
    const result = await saveCourseService.getAllSaveCourses();
    res.status(200).json({ message: "Get all save course successfully", result });
});

const saveCourse = asyncHandler(async (req, res) => {
    const { user, course } = req.body;
    console.log(user, course);
    const result = await saveCourseService.saveCourseToggle(user, course);
    res.status(200).json({ message: "Save course successfully", result });
});

export { getAllSaveCourse, saveCourse };