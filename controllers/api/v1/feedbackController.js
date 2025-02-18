import asyncHandler from "../../../middlewares/asyncHandler.js";
import feedbackService from "../../../services/feedbackService.js";

const createFeedback = asyncHandler(async (req, res) => {
  const result = await feedbackService.create(req.body);
  res.status(201).json(result);
});

const getAllFeedback = asyncHandler(async (req, res) => {
  const result = await feedbackService.findAll();
  res.status(200).json(result);
});

const getFeedbackById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await feedbackService.findById(id);
  res.status(200).json(result);
});

const updateFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await feedbackService.update(id, req.body);
  res.status(200).json(result);
});

const deleteFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await feedbackService.delete(id);
  res.status(200).json(result);
});

const getFeedbackByCourseId = asyncHandler(async (req, res) => {
  const course_id = req.params.id; // changed from req.params.course_id
  const result = await feedbackService.getFeedbackByCourseId(course_id);
  res.status(200).json(result);
});

export {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getFeedbackByCourseId,
};
