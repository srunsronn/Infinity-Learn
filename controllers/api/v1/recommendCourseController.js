import asyncHandler from "express-async-handler";
import RecommendationCourseService from "../../../services/recommendCourseService.js";

export const getCourseSimilarRecommendations = asyncHandler(
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const count = parseInt(req.query.count || 5);

      console.log(`Getting recommendations for course ID: ${courseId}`);

      const recommendations =
        await RecommendationCourseService.getCourseSimilarRecommendations(
          courseId,
          count
        );

      return res.status(200).json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      console.error("Error in recommendation controller:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to process recommendation request",
        error: error.message,
      });
    }
  }
);

// Add an endpoint for interest-based recommendations
export const getInterestRecommendations = asyncHandler(async (req, res) => {
  try {
    const { interest_text } = req.body;
    const count = parseInt(req.body.count || 5);

    if (!interest_text) {
      return res.status(400).json({
        success: false,
        message: "Interest text is required",
      });
    }

    console.log(`Getting recommendations for interest: ${interest_text}`);

    const recommendations =
      await RecommendationCourseService.getInterestBasedRecommendations(
        interest_text,
        count
      );

    return res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error in interest recommendation controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process interest recommendation request",
      error: error.message,
    });
  }
});

export const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;
    const count = parseInt(req.query.count || 5);

    console.log(`Getting personalized recommendations for user: ${userId}`);

    const recommendations =
      await RecommendationCourseService.getPersonalizedRecommendations(
        userId,
        count
      );

    return res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error in personalized recommendation controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process personalized recommendation request",
      error: error.message,
    });
  }
});
export const getTrendingCourses = asyncHandler(async (req, res) => {
  try {
    const count = parseInt(req.query.count || 5);
    const topicFilter = req.query.topic; // Optional topic filter

    
    console.log(
      `Getting trending courses${topicFilter ? ` in ${topicFilter}` : ""}`
    );

    const recommendations =
      await RecommendationCourseService.getTrendingCourses(count, topicFilter);

    return res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error in trending courses controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trending courses",
      error: error.message,
    });
  }
});
export const getTopicCategories = asyncHandler(async (req, res) => {
  try {
    console.log("Getting course topic categories");

    const categories = await RecommendationCourseService.getTopicCategories();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error in course categories controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course categories",
      error: error.message,
    });
  }
});

export const getNewUserRecommendations = asyncHandler(async (req, res) => {
  try {
    const count = parseInt(req.query.count || 8);

    console.log("Getting recommendations for new users");

    const recommendations =
      await RecommendationCourseService.getNewUserRecommendations(count);

    return res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error in new user recommendations controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations for new users",
      error: error.message,
    });
  }
});
