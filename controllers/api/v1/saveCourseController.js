import asyncHandler from "../../../middlewares/asyncHandler.js";
import saveCourseService from "../../../services/saveCourseService.js";

const getAllSaveCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  const result = await saveCourseService.getAllSaveCourses(id);
  res
    .status(200)
    .json({ message: "Retrieved all saved courses successfully", result });
});

const saveCourse = asyncHandler(async (req, res) => {
  const { userID, courseID } = req.body;
  console.log(userID, courseID);
  const result = await saveCourseService.saveCourseToggle(userID, courseID);
  res.status(200).json({ message: "Save course successfully", result });
});

export { getAllSaveCourse, saveCourse };
