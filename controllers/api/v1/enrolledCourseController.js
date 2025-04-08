import asyncHandler from "../../../middlewares/asyncHandler.js";
import enrolledCourseService from "../../../services/enrolledCourseService.js";

const enrolledCourse = asyncHandler(async (req, res) => {
  const student = req.user._id;
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

const getRatingCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  const result = await enrolledCourseService.getRatingCourse(courseId);
  res.status(200).json({ message: "Retrieved course rating successfully", result });
});


export {
  enrolledCourse,
  getAllEnrolledCourses,
  getCourseEnrollmentsByInstructor,
  getCourseEnrollmentsMonthly,
  submitRatingEnrolledCourse,
  getRatingCourse,
};
