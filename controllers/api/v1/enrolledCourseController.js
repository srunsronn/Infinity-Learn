import asyncHandler from "../../../middlewares/asyncHandler.js";
import enrolledCourseService from "../../../services/enrolledCourseService.js";

// Create new enrollment(s). Accepts an array of courseIds.
const enrolledCourse = asyncHandler(async (req, res) => {
  // Use req.user._id as student ID via authentication middleware.
  const student = req.user._id;
  // Expect an array of course IDs in req.body.courseIds. Fallback if a single course is provided.
  let courseIds = req.body.courseIds;
  if (!courseIds) {
    const { course } = req.body;
    if (!course) {
      return res
        .status(400)
        .json({ message: "User ID and Course ID are required" });
    }
    courseIds = [course];
  }

  // Process enrollments for each course
  const results = await Promise.all(
    courseIds.map((courseId) =>
      enrolledCourseService.enrolledCourse(student, courseId)
    )
  );

  res
    .status(200)
    .json({ message: "New courses enrolled successfully", results });
});

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

const submitRatingEnrolledCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { rating } = req.body;
  const student = req.user._id;

  if (!rating) {
    return res.status(400).json({ message: "Rating is required" });
  }

  const result = await enrolledCourseService.submitRatingEnrolledCourse(
    courseId,
    student,
    rating
  );
  res.status(200).json({ message: "Rating submitted successfully", result });
});

export {
  enrolledCourse,
  getAllEnrolledCourses,
  getCourseEnrollmentsByInstructor,
  getCourseEnrollmentsMonthly,
  submitRatingEnrolledCourse,
};
