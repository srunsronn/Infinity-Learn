import asyncHandler from "../../../middlewares/asyncHandler.js";
import quizService from "../../../services/quizService.js";

// Create a new quiz
const createQuiz = asyncHandler(async (req, res) => {
  const result = await quizService.create(req.body);
  res.status(201).json({ message: "Quiz created successfully", data: result });
});

// Get all quizzes
const getAllQuiz = asyncHandler(async (req, res) => {
  const result = await quizService.findAll();
  res.status(200).json({ data: result });
});

// Get a single quiz by ID
const getQuizById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await quizService.findById(id);
  res.status(200).json({ data: result });
});
const getAllActiveQuiz = asyncHandler(async (req, res) => {
  const result = await quizService.getAllActiveQuizzes();
  res.status(200).json({ data: result });
});

const getQuizzesBySection = asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  const result = await quizService.getQuizzesBySection(sectionId);
  res.status(200).json({ data: result });
});
const getQuizzesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const result = await quizService.getQuizzesByCourse(courseId);
  res.status(200).json({ data: result });

});
// Update a quiz
const updateQuiz = asyncHandler(async (req, res) => {
  const { id, ...updateData } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Quiz ID is required" });
  }
  const result = await quizService.updateQuiz(id, updateData);
  res.status(200).json({ message: "Quiz updated successfully", data: result });
});

// Update quiz status
const updateQuizStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await quizService.updateQuizStatus(id);
  res.status(200).json(result);
});

// Delete a quiz
const deleteQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await quizService.deleteQuiz(id);
  res.status(200).json(result);
});

export {
  createQuiz,
  getAllQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  updateQuizStatus,
  getAllActiveQuiz,
  getQuizzesBySection,
  getQuizzesByCourse,
};
