import asyncHandler from "../../../middlewares/asyncHandler.js";
import engagementService from "../../../services/engagementService.js";

// Track login event
const trackLogin = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.body;
  await engagementService.trackLogin(studentId, courseId);
  res.status(200).json({ message: "Login tracked successfully" });
});

// Track time spent
const trackTimeSpent = asyncHandler(async (req, res) => {
  const { studentId, courseId, duration } = req.body;
  await engagementService.trackTimeSpent(studentId, courseId, duration);
  res.status(200).json({ message: "Time spent tracked successfully" });
});

// Track participation
const trackParticipation = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.body;
  await engagementService.trackParticipation(studentId, courseId);
  res.status(200).json({ message: "Participation tracked successfully" });
});

// Track quiz completion
const trackQuizCompletion = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.body;
  await engagementService.trackQuizCompletion(studentId, courseId);
  res.status(200).json({ message: "Quiz completion tracked successfully" });
});

// Get course engagement scores
const getCourseEngagementScores = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const averageEngagementScore =
    await engagementService.getCourseEngagementScores(courseId);
  res.status(200).json({ averageEngagementScore });
});

export {
  trackLogin,
  trackTimeSpent,
  trackParticipation,
  trackQuizCompletion,
  getCourseEngagementScores,
};
