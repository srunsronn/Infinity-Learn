import asyncHandler from "../../../middlewares/asyncHandler.js";
import enrolledCourseService from "../../../services/enrolledCourseService.js";

// Create new enrollment
const enrolledCourse = asyncHandler(async (req, res) => {
  const { userID, courseID } = req.body;

  if (!userID || !courseID) {
    return res
      .status(400)
      .json({ message: "User ID and Course ID are required" });
  }

  const result = await enrolledCourseService.enrolledCourse(userID, courseID);
  res.status(200).json({ message: "New course enrolled successfully", result });
});

// Get all enrollments of a user
const getAllEnrolledCourses = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get user ID from URL params

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  console.log("Data user in controller: ", id);
  const result = await enrolledCourseService.getAllEnrolledCourses(id);
  res
    .status(200)
    .json({ message: "Retrieved all enrolled courses successfully", result });
});

export { enrolledCourse, getAllEnrolledCourses };
