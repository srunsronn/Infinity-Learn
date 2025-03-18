import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    completionRate: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
    feedback: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            rating: {
                type: Number,
                default: 0
            },
            comment: {
                type: String,
                default: ""
            },
        },
    ],
});

export default mongoose.model("Performance", performanceSchema);