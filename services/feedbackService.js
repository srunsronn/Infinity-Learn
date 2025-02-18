import BaseService from "../utils/baseService.js";
import Feedback from "../models/feedbackModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import Course from "../models/courseModel.js";

class FeedbackService extends BaseService {
  constructor() {
    super(Feedback);
  }

  async getFeedbackByCourseId(id) {
    try {
      const course = await Course.findById(id);
      if (!course) {
        throw new ErrorHandler(404, "Course not found");
      }
      const feedbacks = await Feedback.find({ course_id: id });
      return { message: "Get feedback by course id success", feedbacks };
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }
}

export default new FeedbackService();
