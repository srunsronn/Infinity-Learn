import AddToCartModel from "../models/addToCartModel.js";
import BaseService from "../utils/baseService.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";
import Course from "../models/courseModel.js";
import { populate } from "dotenv";
class AddToCartService extends BaseService {
  constructor() {
    super(AddToCartModel);
  }

  // Toggle add to cart
  async addToCartToggle(userID, courseID) {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(userID) ||
        !mongoose.Types.ObjectId.isValid(courseID)
      ) {
        throw new ErrorHandler(400, "Invalid user or course ID format");
      }

      console.log("Valid userID:", userID);
      console.log("Valid courseID:", courseID);

      // Ensure user and course exist in the database
      const userExists = await User.findById(userID);
      const courseExists = await Course.findById(courseID);

      if (!userExists || !courseExists) {
        throw new ErrorHandler(404, "User or course not found");
      }

      // Check if the course is already saved
      const addToCart = await this.model.findOne({
        userId: userID,
        courseId: courseID,
      });

      if (addToCart) {
        return {
          status: 200,
          message: "Course already added",
        };
      } else {
        const newAddToCart = new this.model({
          userId: userID,
          courseId: courseID,
        });
        await newAddToCart.save();
        return {
          status: 200,
          message: "Cart added successfully",
        };
      }
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  async getCart(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new ErrorHandler(404, "User not found");
      }
      const cart = await this.model
        .find({ userId: id })
        .populate({
          path: "courseId",
          populate: { path: "instructor", select: "name" },
        })
        .populate({
          path: "userId",
        });
      return { message: "Get Cart success", cart };
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }
}

export default new AddToCartService();
