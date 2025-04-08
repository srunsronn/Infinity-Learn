import axios from "axios";
import dotenv from "dotenv";
import BaseService from "../utils/baseService.js";
import mongoose from "mongoose";

dotenv.config();

const RECOMMENDATION_API_URL =
  process.env.RECOMMENDATION_API_URL || "http://localhost:5001/api";

class RecommendationCourseService extends BaseService {
  constructor() {
    super(null);
    this.apiBaseUrl = RECOMMENDATION_API_URL;
    console.log(`Recommendation API URL: ${this.apiBaseUrl}`);

    // Flag to track if Flask API is available
    this.flaskApiAvailable = false;

    // Try to reconnect every 5 minutes
    this.checkFlaskApiAvailability().catch((err) => {
      console.log("Flask API not available on startup:", err.message);
    });

    // Periodically check if the Flask API becomes available
    setInterval(() => {
      if (!this.flaskApiAvailable) {
        this.checkFlaskApiAvailability()
          .then((available) => {
            if (available) console.log("Flask API is now available!");
          })
          .catch(() => {});
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  async checkFlaskApiAvailability() {
    try {
      // Try with the direct health endpoint first
      const response = await axios.get(`${this.apiBaseUrl}/health`, {
        timeout: 5000, // Increase timeout to 5 seconds
      });

      this.flaskApiAvailable = true;
      console.log("Flask API is available:", response.data);
      return true;
    } catch (firstError) {
      try {
        // Try alternate path structure if first attempt fails
        const alternateUrl = `${this.apiBaseUrl.replace(
          "/api",
          ""
        )}/api/health`;
        console.log(
          `First health check failed, trying alternate URL: ${alternateUrl}`
        );

        const response = await axios.get(alternateUrl, {
          timeout: 5000,
        });

        this.flaskApiAvailable = true;
        console.log("Flask API is available at alternate URL:", response.data);
        return true;
      } catch (error) {
        this.flaskApiAvailable = false;
        console.log(
          "Flask API is not available - using MongoDB recommendations only:",
          error.message
        );
        return false;
      }
    }
  }

  async getCourseSimilarRecommendations(courseId, count = 5) {
    try {
      // Try to use Flask API if it was available
      if (this.flaskApiAvailable) {
        try {
          console.log(
            `Trying Flask API for recommendations for course ${courseId}...`
          );
          const response = await axios.get(
            `${this.apiBaseUrl}/recommendations/course/${courseId}`,
            {
              params: { count },
              timeout: 3000, // 3 second timeout
            }
          );
          console.log("Successfully received recommendations from Flask API");
          return response.data;
        } catch (apiError) {
          console.error("Flask API request failed:", apiError.message);
          this.flaskApiAvailable = false; // Mark as unavailable
        }
      }

      // If we got here, either API is unavailable or request failed
      console.log("Using MongoDB-based recommendations for course:", courseId);
      return await this.getMongoDBRecommendations(courseId, count);
    } catch (error) {
      console.error("Error in recommendation service:", error.message);
      return {
        status: "error",
        message: "Failed to fetch recommendations",
        recommendations: [],
      };
    }
  }

  async getMongoDBRecommendations(courseId, count = 5) {
    try {
      // Get references to models
      const Course = mongoose.model("Course");

      // Get the course for which we need recommendations
      const course = await Course.findById(courseId);
      if (!course) {
        return {
          status: "error",
          message: "Course not found",
          recommendations: [],
        };
      }

      console.log(
        `Finding recommendations for course: ${course.name} (${courseId})`
      );

      // Multi-stage recommendation strategy:

      // 1. Find courses with the same topic (strong match)
      let similarCourses = await Course.find({
        _id: { $ne: courseId },
        courseTopic: course.courseTopic,
        // Only include active/published courses
        // Assuming you have such a field; adjust as needed
        // isActive: true
      })
        .limit(Math.ceil(count * 0.7)) // 70% of recommendations from same topic
        .select(
          "_id name courseTopic price courseThumbnail instructor studentsEnrolled"
        )
        .lean();

      console.log(`Found ${similarCourses.length} courses with the same topic`);

      // 2. Find popular courses (different topic) to fill any remaining spots
      const remainingCount = count - similarCourses.length;

      if (remainingCount > 0) {
        const popularCourses = await Course.find({
          _id: { $ne: courseId },
          courseTopic: { $ne: course.courseTopic },
          // isActive: true
        })
          .sort({ studentsEnrolled: -1 }) // Sort by popularity
          .limit(remainingCount)
          .select(
            "_id name courseTopic price courseThumbnail instructor studentsEnrolled"
          )
          .lean();

        console.log(
          `Found ${popularCourses.length} popular courses to fill recommendations`
        );

        // Combine the results
        similarCourses = [...similarCourses, ...popularCourses];
      }

      // 3. Enhance recommendations with instructor info
      const User = mongoose.model("User");

      // Get all instructor IDs
      const instructorIds = similarCourses
        .map((course) => course.instructor)
        .filter((id) => id); // Filter out any null/undefined

      // Fetch instructors in one query
      const instructors = await User.find({
        _id: { $in: instructorIds },
      })
        .select("firstName lastName")
        .lean();

      // Create lookup map
      const instructorMap = {};
      instructors.forEach((instructor) => {
        instructorMap[
          instructor._id.toString()
        ] = `${instructor.firstName} ${instructor.lastName}`;
      });

      // Format the response to match the expected format
      const formattedRecommendations = similarCourses.map((rec) => {
        // Calculate similarity score - higher for same topic
        const similarityScore =
          rec.courseTopic === course.courseTopic ? 0.85 : 0.5;

        // Get instructor name from map
        const instructorId = rec.instructor ? rec.instructor.toString() : null;
        const instructorName =
          instructorId && instructorMap[instructorId]
            ? instructorMap[instructorId]
            : "Unknown Instructor";

        return {
          course_id: rec._id.toString(),
          course_name: rec.name,
          course_topic: rec.courseTopic,
          price: rec.price,
          thumbnail: rec.courseThumbnail,
          instructor_name: instructorName,
          students_enrolled: rec.studentsEnrolled || 0,
          similarity_score: similarityScore,
          using_mongodb: true, // Flag to indicate this is MongoDB-based
        };
      });

      return {
        status: "ok",
        source_course: {
          id: courseId,
          name: course.name,
          topic: course.courseTopic,
        },
        recommendations: formattedRecommendations,
        recommendation_source: "mongodb",
      };
    } catch (error) {
      console.error("Error generating MongoDB recommendations:", error);
      return {
        status: "error",
        message: "Failed to generate recommendations",
        error: error.message,
        recommendations: [],
      };
    }
  }

  // Add more recommendation methods as needed
  async getInterestBasedRecommendations(interestText, count = 5) {
    try {
      // Try Flask API if available
      if (this.flaskApiAvailable) {
        try {
          const response = await axios.post(
            `${this.apiBaseUrl}/recommendations/interest`,
            {
              interest_text: interestText,
              count,
            },
            { timeout: 3000 }
          );
          return response.data;
        } catch (apiError) {
          console.error(
            "Flask API interest recommendation failed:",
            apiError.message
          );
          this.flaskApiAvailable = false;
        }
      }

      // Fallback to simple text matching
      return await this.getInterestBasedMongoDBRecommendations(
        interestText,
        count
      );
    } catch (error) {
      console.error("Error in interest recommendations:", error);
      return {
        status: "error",
        message: "Failed to get interest-based recommendations",
        recommendations: [],
      };
    }
  }

  async getPersonalizedMongoDBRecommendations(userId, count = 5) {
    try {
      // Get user's enrolled courses
      const EnrolledCourse = mongoose.model("EnrolledCourse");
      const User = mongoose.model("User");
      const Course = mongoose.model("Course");

      // Find user info to get interests
      const user = await User.findById(userId).select("interests");
      if (!user) {
        console.log(`User with ID ${userId} not found`);
        return await this.getNewUserRecommendations(count);
      }

      // Get all courses this user is enrolled in
      const enrollments = await EnrolledCourse.find({
        student: userId,
      }).populate("course", "name courseTopic _id");

      if (!enrollments || enrollments.length === 0) {
        console.log(`No enrollments found for user ${userId}`);
        // No enrollments, return recommendations for new users
        return await this.getNewUserRecommendations(count);
      }

      console.log(`Found ${enrollments.length} enrollments for user ${userId}`);

      // Extract course topics and ids from enrollments (with null checks)
      const enrolledCourseIds = enrollments
        .filter((e) => e.course) // Filter out null courses
        .map((e) => e.course._id);

      const enrolledTopics = enrollments
        .filter((e) => e.course && e.course.courseTopic)
        .map((e) => e.course.courseTopic);

      console.log(`Enrolled topics: ${enrolledTopics.join(", ")}`);

      if (enrolledCourseIds.length === 0) {
        console.log(
          "No valid enrolled courses found, falling back to new user recs"
        );
        return await this.getNewUserRecommendations(count);
      }

      // Count topics to find most frequent ones
      const topicFrequency = {};
      enrolledTopics.forEach((topic) => {
        topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
      });

      // Sort topics by frequency
      const sortedTopics = Object.keys(topicFrequency).sort(
        (a, b) => topicFrequency[b] - topicFrequency[a]
      );

      // Get user interests (if any)
      const userInterests = user?.interests || [];

      // Combine user interests with enrolled topics
      const preferredTopics = [...new Set([...sortedTopics, ...userInterests])];
      console.log(`Preferred topics: ${preferredTopics.join(", ")}`);

      // Find courses with the same topics but not already enrolled
      let recommendedCourses = [];

      if (preferredTopics.length > 0) {
        // First try to get courses with the same topics
        recommendedCourses = await Course.find({
          _id: { $nin: enrolledCourseIds },
          courseTopic: { $in: preferredTopics },
        })
          .limit(Math.round(count * 0.8)) // 80% from preferred topics
          .select(
            "_id name courseTopic price courseThumbnail instructor studentsEnrolled"
          )
          .lean();

        console.log(
          `Found ${recommendedCourses.length} courses with preferred topics`
        );
      }

      // If we need more recommendations, add some popular courses
      if (recommendedCourses.length < count) {
        const remainingCount = count - recommendedCourses.length;

        // Get popular courses not already recommended or enrolled
        const excludedIds = [
          ...enrolledCourseIds,
          ...recommendedCourses.map((c) => c._id),
        ];

        const popularCourses = await Course.find({
          _id: { $nin: excludedIds },
        })
          .sort({ studentsEnrolled: -1 })
          .limit(remainingCount)
          .select(
            "_id name courseTopic price courseThumbnail instructor studentsEnrolled"
          )
          .lean();

        console.log(
          `Added ${popularCourses.length} popular courses to recommendations`
        );
        recommendedCourses = [...recommendedCourses, ...popularCourses];
      }

      // Format the response
      const result = await this.formatCourseResults(
        recommendedCourses,
        "Personalized recommendations"
      );

      return result;
    } catch (error) {
      console.error("Error generating personalized recommendations:", error);
      return {
        status: "error",
        message: "Failed to generate personalized recommendations",
        recommendations: [],
      };
    }
  }

  // Helper method to format course results consistently
  async formatCourseResults(courses, sourceText) {
    try {
      // Get all instructor IDs
      const User = mongoose.model("User");
      const instructorIds = courses
        .map((course) => course.instructor)
        .filter((id) => id);

      // Fetch instructors
      const instructors = await User.find({
        _id: { $in: instructorIds },
      })
        .select("firstName lastName")
        .lean();

      // Create lookup map
      const instructorMap = {};
      instructors.forEach((instructor) => {
        instructorMap[
          instructor._id.toString()
        ] = `${instructor.firstName} ${instructor.lastName}`;
      });

      // Format courses
      const formattedCourses = courses.map((course) => {
        const instructorId = course.instructor
          ? course.instructor.toString()
          : null;
        const instructorName =
          instructorId && instructorMap[instructorId]
            ? instructorMap[instructorId]
            : "Unknown Instructor";

        return {
          course_id: course._id.toString(),
          course_name: course.name,
          course_topic: course.courseTopic,
          price: course.price,
          thumbnail: course.courseThumbnail,
          description: course.description || "", // Add description here
          instructor_name: instructorName,
          students_enrolled: course.studentsEnrolled || 0,
          similarity_score: 0.7, // Default similarity score
          using_mongodb: true,
        };
      });

      return {
        status: "ok",
        interest_text: sourceText,
        recommendations: formattedCourses,
        recommendation_source: "mongodb",
      };
    } catch (error) {
      console.error("Error formatting course results:", error);
      return {
        status: "error",
        message: "Error formatting results",
        recommendations: [],
      };
    }
  }

  async getPersonalizedRecommendations(userId, count = 5) {
    try {
      console.log(`Starting personalized recommendations for user: ${userId}`);

      // Try Flask API if available
      if (this.flaskApiAvailable) {
        try {
          // First get user's enrolled courses
          const EnrolledCourse = mongoose.model("EnrolledCourse");
          const User = mongoose.model("User");

          // Get enrollment data
          const enrolledCourses = await EnrolledCourse.find({
            student: userId,
          }).select("course");

          // Get user data for interests
          const user = await User.findById(userId).select("interests");
          const userInterests = user?.interests || [];

          const courseIds = enrolledCourses
            .filter((e) => e.course) // Filter out null courses
            .map((e) => e.course.toString());

          console.log(
            `Found ${courseIds.length} enrolled courses for Flask API`
          );

          // If user has no enrolled courses, check if they have interests
          if (courseIds.length === 0 && userInterests.length === 0) {
            console.log(
              "No courses or interests, returning new user recommendations"
            );
            // No courses or interests, get recommendations for new users
            return await this.getNewUserRecommendations(count);
          }

          // Use Flask API for user recommendations with enhanced metadata
          console.log(
            `Calling Flask API at ${this.apiBaseUrl}/recommendations/user`
          );
          const response = await axios.post(
            `${this.apiBaseUrl}/recommendations/user`,
            {
              enrolled_courses: courseIds,
              user_interests: userInterests,
              user_id: userId.toString(),
              count,
            },
            {
              timeout: 5000, // Add a timeout
            }
          );

          // Ensure response has the expected structure
          if (
            response.data &&
            response.data.status === "ok" &&
            response.data.recommendations &&
            response.data.recommendations.length > 0
          ) {
            console.log(
              `Got successful response from Flask API with ${response.data.recommendations.length} recommendations`
            );
            return response.data;
          } else {
            console.log(
              "Flask API returned unexpected structure:",
              JSON.stringify(response.data).substring(0, 200)
            );
            throw new Error("Invalid response structure from Flask API");
          }
        } catch (apiError) {
          console.error(
            "Flask API user recommendation failed:",
            apiError.message
          );
          this.flaskApiAvailable = false;
        }
      }

      return await this.getPersonalizedMongoDBRecommendations(userId, count);
    } catch (error) {
      console.error(
        "Error getting personalized recommendations:",
        error.message
      );
      return {
        status: "error",
        message: "Failed to generate personalized recommendations",
        recommendations: [],
      };
    }
  }
  async getPersonalizedMongoDBRecommendations(userId, count = 5) {
    try {
      // Get user's enrolled courses
      const EnrolledCourse = mongoose.model("EnrolledCourse");
      const User = mongoose.model("User");
      const Course = mongoose.model("Course");

      // Find user info to get interests
      const user = await User.findById(userId).select("interests");
      if (!user) {
        console.log(`User with ID ${userId} not found`);
        return await this.getNewUserRecommendations(count);
      }

      // Get all courses this user is enrolled in
      const enrollments = await EnrolledCourse.find({
        student: userId,
      }).populate("course", "name courseTopic _id");

      // Extract course topics and ids from enrollments with null checks
      const enrolledCourseIds = [];
      const enrolledTopics = [];

      // Process enrollments with null safety
      enrollments.forEach((enrollment) => {
        if (enrollment.course) {
          enrolledCourseIds.push(enrollment.course._id);
          if (enrollment.course.courseTopic) {
            enrolledTopics.push(enrollment.course.courseTopic);
          }
        }
      });

      // If no valid enrollments, return new user recommendations
      if (enrolledCourseIds.length === 0) {
        return await this.getNewUserRecommendations(count);
      }

      // Count topics to find most frequent ones
      const topicFrequency = {};
      enrolledTopics.forEach((topic) => {
        topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
      });

      // Sort topics by frequency
      const sortedTopics = Object.keys(topicFrequency).sort(
        (a, b) => topicFrequency[b] - topicFrequency[a]
      );

      // Get user interests (if any)
      const userInterests = user?.interests || [];

      // Combine user interests with enrolled topics
      const preferredTopics = [...new Set([...sortedTopics, ...userInterests])];
      console.log(`Preferred topics: ${preferredTopics.join(", ") || "none"}`);

      // Find courses with the same topics but not already enrolled
      let recommendedCourses = [];

      if (preferredTopics.length > 0) {
        // First try to get courses with the same topics
        recommendedCourses = await Course.find({
          _id: { $nin: enrolledCourseIds },
          courseTopic: { $in: preferredTopics },
        })
          .limit(Math.round(count * 0.8)) // 80% from preferred topics
          .select(
            "_id name courseTopic price courseThumbnail instructor description studentsEnrolled"
          )
          .lean();

        console.log(
          `Found ${recommendedCourses.length} courses with preferred topics`
        );
      }

      // If we need more recommendations, add some popular courses
      if (recommendedCourses.length < count) {
        const remainingCount = count - recommendedCourses.length;

        // Get popular courses not already recommended or enrolled
        const excludedIds = [
          ...enrolledCourseIds,
          ...recommendedCourses.map((c) => c._id),
        ];

        const popularCourses = await Course.find({
          _id: { $nin: excludedIds },
        })
          .sort({ studentsEnrolled: -1 })
          .limit(remainingCount)
          .select(
            "_id name courseTopic price courseThumbnail instructor studentsEnrolled"
          )
          .lean();

        console.log(
          `Added ${popularCourses.length} popular courses to recommendations`
        );
        recommendedCourses = [...recommendedCourses, ...popularCourses];
      }

      // Format the response
      const result = await this.formatCourseResults(
        recommendedCourses,
        "Personalized recommendations"
      );

      return result;
    } catch (error) {
      console.error("Error generating personalized recommendations:", error);
      return {
        status: "error",
        message: "Failed to generate personalized recommendations",
        recommendations: [],
      };
    }
  }
  async getTrendingCourses(count = 5, topicFilter = null) {
    try {
      // Try Flask API if available (might have more sophisticated trending algorithm)
      if (this.flaskApiAvailable && !topicFilter) {
        try {
          const response = await axios.get(`${this.apiBaseUrl}/trending`, {
            params: { count },
          });
          return response.data;
        } catch (apiError) {
          console.error("Flask API trending courses failed:", apiError.message);
          this.flaskApiAvailable = false;
        }
      }

      // Fallback to MongoDB-based trending courses
      const Course = mongoose.model("Course");

      // Build query based on whether topic filter is provided
      const query = topicFilter ? { courseTopic: topicFilter } : {};

      // Get most enrolled courses
      const popularCourses = await Course.find(query)
        .sort({ studentsEnrolled: -1 })
        .limit(count)
        .select(
          "_id name courseTopic price courseThumbnail instructor description studentsEnrolled"
        )
        .lean();

      // Format the result
      return await this.formatCourseResults(
        popularCourses,
        topicFilter ? `Popular ${topicFilter} courses` : "Trending courses"
      );
    } catch (error) {
      console.error("Error getting trending courses:", error);
      return {
        status: "error",
        message: "Failed to get trending courses",
        recommendations: [],
      };
    }
  }
  async getTopicCategories() {
    try {
      const Course = mongoose.model("Course");

      // Aggregate to get topics with counts
      const topicCounts = await Course.aggregate([
        { $match: { courseTopic: { $exists: true, $ne: null, $ne: "" } } },
        { $group: { _id: "$courseTopic", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      return {
        status: "ok",
        categories: topicCounts.map((topic) => ({
          name: topic._id,
          count: topic.count,
        })),
      };
    } catch (error) {
      console.error("Error getting topic categories:", error);
      return {
        status: "error",
        message: "Failed to get course categories",
        categories: [],
      };
    }
  }

  async getNewUserRecommendations(count = 8) {
    try {
      // Try Flask API if available
      if (this.flaskApiAvailable) {
        try {
          const response = await axios.get(`${this.apiBaseUrl}/trending`, {
            params: { count },
            timeout: 3000,
          });
          return response.data;
        } catch (apiError) {
          console.error(
            "Flask API new user recommendations failed:",
            apiError.message
          );
          this.flaskApiAvailable = false;
        }
      }

      const Course = mongoose.model("Course");

      // For new users, recommend a mix of popular and diverse topics

      // First get the most popular courses
      const popularCourses = await Course.find()
        .sort({ studentsEnrolled: -1 })
        .limit(Math.ceil(count / 2))
        .select(
          "_id name courseTopic price courseThumbnail instructor studentsEnrolled"
        )
        .lean();

      // Get topic diversity by finding one popular course from each topic
      const topicCounts = await Course.aggregate([
        { $match: { courseTopic: { $exists: true, $ne: null, $ne: "" } } },
        { $group: { _id: "$courseTopic", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: Math.ceil(count / 2) },
      ]);

      // Get one representative course from each popular topic
      const diverseCourses = [];

      for (const topic of topicCounts) {
        // Skip if we already have enough
        if (diverseCourses.length >= Math.ceil(count / 2)) {
          break;
        }

        // Find a highly-rated course in this topic
        const topicCourse = await Course.findOne({
          courseTopic: topic._id,
          _id: { $nin: popularCourses.map((c) => c._id) }, // Avoid duplicates
        })
          .sort({ studentsEnrolled: -1 })
          .select(
            "_id name courseTopic price courseThumbnail instructor studentsEnrolled"
          )
          .lean();

        if (topicCourse) {
          diverseCourses.push(topicCourse);
        }
      }

      // Combine the recommendations
      const allRecommendations = [...popularCourses, ...diverseCourses];

      // Format the response
      return await this.formatCourseResults(
        allRecommendations,
        "Recommended for new users"
      );
    } catch (error) {
      console.error("Error getting new user recommendations:", error);
      return {
        status: "error",
        message: "Failed to generate recommendations",
        recommendations: [],
      };
    }
  }
}

export default new RecommendationCourseService();
