import mongoose from "mongoose";
import Course from "./courseModel.js";
import User from "./userModel.js";
const addToCartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: User,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: Course,
  },
  addTocartTime: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("AddToCart", addToCartSchema);
