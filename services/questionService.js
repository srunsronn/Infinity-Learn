import express from "express";
import dotenv from "dotenv";
import BaseService from "../utils/baseService.js";
import Question from "../models/questionModel.js";
import Quiz from "../models/quizModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import Redis from "ioredis";

dotenv.config();
const redis = new Redis(process.env.REDIS_URL);
class QuestionService extends BaseService {
  constructor(Question) {
    super(Question);
  }

  async createQuestion(data) {
    try {
      const { quiz_id, type, question_text, options, correct_answer } = data;
      if (!["multiple-choice", "true/false", "short-answer"].includes(type)) {
        throw new ErrorHandler(400, "Invalid question type");
      }

      if (type === "true/false") {
        if (correct_answer !== "true" && correct_answer !== "false") {
          throw new ErrorHandler(
            400,
            'Correct answer must be "true" or "false"'
          );
        }
      }
      if (type === "short-answer") {
        if (!correct_answer || typeof correct_answer !== "string") {
          throw new ErrorHandler(400, "Correct answer must be a string");
        }
      }
      if (type === "multiple-choice") {
        if (!options || options.length < 2) {
          throw new ErrorHandler(
            400,
            "Multiple choice question must have at least 2 options"
          );
        }
        if (!options.includes(correct_answer)) {
          throw new ErrorHandler(
            400,
            "Correct answer must be one of the options"
          );
        }
      }

      const newQuestion = await Question.create({
        quiz_id,
        type,
        question_text,
        options,
        correct_answer,
      });
      return { message: "Question created", newQuestion };
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  async getQuestionByQuizId(id) {
    try {
      const quiz = await Quiz.findById(id);
      if (!quiz) {
        throw new ErrorHandler(404, "Quiz not found");
      }
      const qestion = await Question.find({ quiz_id: id });
      return { message: "Question founded", qestion };
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  async updateQuestion(id, data) {
    return await this.update(id, data);
  }

  async deleteAllQuestion() {
    const deleteAll = await Question.deleteMany();
    return deleteAll;
  }
}

export default new QuestionService(Question);
