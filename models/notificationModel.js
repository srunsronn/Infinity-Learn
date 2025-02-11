import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            default: "unread",
        },
        userId: {
            type: String,
            required: true,
        },

    }, { timestamps: true }
);
export default mongoose.model("Notification", notificationSchema);