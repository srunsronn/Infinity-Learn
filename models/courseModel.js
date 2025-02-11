import mongoose from "mongoose";
import User from "../models/userModel.js"; // User schema import for reference

const courseDataSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    videoThumnail: {
        type: String,
        required: true,
    },
    videoLink: {
        type: String,
        required: true,
    },
    videoSection: {
        type: String,
    },
    videoLength: {
        type: Number,
        required: true,
    }
});

const courseSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        courseThumnail: {
            type: String,
            required: true,
        },
        tags: {
            type: String,
            required: true,
        },
        level: {
            type: String,
            required: true,
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: User, // Reference to the instructor (user)
        },
        benefits: [{ title: String }],
        courseData: [courseDataSchema], // Array of course data without comments
    },
    { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
