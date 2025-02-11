import mongoose from "mongoose";

const ReviewSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        comment: {
            type: String,
        },
        rating: {
            type: Number,
            default: 0,
        },
    }
);

const commentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    comment: {
        type: String,
    },
    commentReplies: [Object]
});

const courseDataSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        require: true,
    },
    videoThumnail: {
        type: String,
        required: true,
    },
    videoLink: {
        type: String,
        require: true,
    },
    videoSection: {
        type: String,
    },
    videoLength: {
        type: Number,
        require: true,
    },
    questions: [commentSchema]

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
            require: true,
        },
        level: {
            type: String,
            require: true,
        },
        instructor:{
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            ref: "User"
        },
        benefits: [{ title: String }],
        reviews: [ReviewSchema],
        courseData: [courseDataSchema]
    },
    { timestamps: true }
);

export default mongoose.model("Course", courseSchema);