import dotenv from "dotenv";
import Redis from "ioredis";
import BaseService from "../utils/baseService.js";
import Quiz from "../models/quizModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import Course from "../models/courseModel.js";
dotenv.config();
const redis = new Redis(process.env.REDIS_URL);

class QuizService extends BaseService {
  constructor(Quiz) {
    super(Quiz);
  }

  // Create a new quiz
  async create(data) {
    try {
      const {
        section_id,
        title,
        description,
        time_limit,
        passing_score,
        questions,
      } = data;

      if (
        !section_id ||
        !title ||
        !time_limit ||
        !questions ||
        questions.length === 0
      ) {
        throw new ErrorHandler(
          400,
          "Missing required fields: section_id, title, time_limit, or questions"
        );
      }

      const newQuiz = await Quiz.create({
        section_id,
        title,
        description,
        time_limit,
        passing_score: passing_score ?? 50,
        questions,
      });

      return newQuiz;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // Get all quizzes
  async findAll(filter = {}) {
    try {
      return await this.model.find(filter);
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // Get a single quiz by ID
  async findById(id) {
    try {
      const quiz = await this.model.findById(id);
      if (!quiz) {
        throw new ErrorHandler(404, "Quiz not found");
      }
      return quiz;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }
  // Get all active quizzes
  async getAllActiveQuizzes() {
    try {
      return await this.model.find({ is_active: true });
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  //get quiz by section id
  async getQuizzesBySection(section_id) {
    try {
      const quizzes = await this.model.find({ section_id });
      if (!quizzes) {
        throw new ErrorHandler(404, "Quizzes not found for this section");
      }
      return quizzes;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  async getQuizzesByCourse(courseId) {
    try {
      const course = await Course.findById(courseId);
      if (!course || !course.sections || course.sections.length === 0) {
        return {};
      }

      const quizzesBySection = {};

      for (const section of course.sections) {
        const quizzes = await this.model.find({ section_id: section._id });

        if (quizzes && quizzes.length > 0) {
          quizzesBySection[section._id.toString()] = quizzes.map((quiz) => ({
            _id: quiz._id,
            title: quiz.title,
            questions: quiz.questions,
            time_limit: quiz.time_limit,
            passing_score: quiz.passing_score,
            is_active: quiz.is_active,
          }));
        }
      }

      return quizzesBySection;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // Update a quiz
  async updateQuiz(id, updateData) {
    try {
      const quiz = await this.findById(id);
      if (!quiz) {
        throw new ErrorHandler(404, "Quiz not found");
      }

      const updatedQuiz = await this.update(id, updateData);
      return updatedQuiz;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // Update quiz status (activate/deactivate)
  async updateQuizStatus(id) {
    try {
      const quiz = await this.findById(id);
      if (!quiz) {
        throw new ErrorHandler(404, "Quiz not found");
      }

      const updatedQuiz = await this.update(id, { is_active: !quiz.is_active });
      return { message: "Quiz status updated successfully", quiz: updatedQuiz };
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // Delete a quiz
  async deleteQuiz(id) {
    try {
      const quiz = await this.findById(id);
      if (!quiz) {
        throw new ErrorHandler(404, "Quiz not found");
      }

      await this.delete(id);
      return { message: "Quiz deleted successfully" };
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }
}

export default new QuizService(Quiz);
