import asyncHandler from "../../../middlewares/asyncHandler.js";
import enrolledCourseService from "../../../services/enrolledCourseService.js";

// Create new enrollment
const enrolledCourse = asyncHandler(async (req, res) => {
  const { student, course } = req.body;

  if (!student || !course) {
    return res
      .status(400)
      .json({ message: "User ID and Course ID are required" });
  }

  const result = await enrolledCourseService.enrolledCourse(student, course);
  res.status(200).json({ message: "New course enrolled successfully", result });
});

// Get all enrollments of a user
const getAllEnrolledCourses = asyncHandler(async (req, res) => {
  const { id } = req.params; 

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const result = await enrolledCourseService.getAllEnrolledCourses(id);

  res
    .status(200)
    .json({ message: "Retrieved all enrolled courses successfully", result });
});

const getCourseEnrollmentsByInstructor = asyncHandler(async (req, res) => {
  const instructorID = req.user._id;

  const result = await enrolledCourseService.getCourseEnrollments(instructorID);
  res.status(200).json({ message: "Retrieved all course enrollments", result });
});
const getCourseEnrollmentsMonthly = asyncHandler(async (req, res) => {
  const instructorID = req.user._id;

  const result = await enrolledCourseService.getCourseEnrollmentsMonthly(
    instructorID
  );
  res
    .status(200)
    .json({ message: "Retrieved all course enrollments monthly", result });
});

const submitRatingEnrolledCourse = asyncHandler(async (req, res)=> {
  const {courseId} = req.params;
  const {rating} = req.body;
  const student = req.user._id;

  if(!rating){
    return res.status(400).json({message: "Rating is required"});
  }

  const result = await enrolledCourseService.submitRatingEnrolledCourse(courseId, student, rating);
  res.status(200).json({message: "Rating submitted successfully", result});
});

export {
  enrolledCourse,
  getAllEnrolledCourses,
  getCourseEnrollmentsByInstructor,
  getCourseEnrollmentsMonthly,
  submitRatingEnrolledCourse
};
