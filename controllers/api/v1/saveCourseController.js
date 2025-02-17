import asyncHandler from "../../../middlewares/asyncHandler.js";
import saveCourseService from "../../../services/saveCourseService.js";

const getAllSaveCourse = asyncHandler(async (req, res) => {
    const result = await saveCourseService.getAllSaveCourses();
    res.status(200).json({ message: "Get all save course successfully", result });
});

const saveCourse = asyncHandler(async (req, res) => {
    const { userID, courseID } = req.body;
    console.log(userID, courseID);
    const result = await saveCourseService.saveCourseToggle(userID, courseID);
    res.status(200).json({ message: "Save course successfully", result });
});

export { getAllSaveCourse, saveCourse };