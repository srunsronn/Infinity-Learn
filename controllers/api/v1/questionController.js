import asyncHandler from "../../../middlewares/asyncHandler.js";
import questionService from "../../../services/questionService.js";

const createQuestion = asyncHandler(async (req, res) => {
  const result = await questionService.createQuestion(req.body);
  res.status(201).json(result);
});

const getAllQuestion = asyncHandler(async (req, res) => {
  const result = await questionService.findAll();
  res.status(200).json({ message: "Get All question success", result });
});

const getQuestionById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await questionService.findById(id);
  res.status(200).json(result);
});

const getQuestionByQuizId = asyncHandler(async (req, res) => {
  const quizid = req.params.quiz_id;
  const result = await questionService.getQuestionByQuizId(quizid);
  res.status(200).json(result);
});

const updateQuestion = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await questionService.update(id, req.body);
  res.status(200).json(result);
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await questionService.delete(id);
  res.status(200).json(result);
});

const deleteAll = asyncHandler(async (req, res) => {
  const result = await questionService.deleteAllQuestion();
  res.status(200).json(result);
});

export {
  createQuestion,
  getAllQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionByQuizId,
  deleteAll,
};
