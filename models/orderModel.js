import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    payment_info: {
      amount: { type: Number, required: true },
      currency: { type: String, default: "USD" },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
      paymentMethod: { type: String, required: true },
      transactionId: { type: String, required: true },
    },
  },
  { timestamps: true }
);
export default mongoose.model("Order", orderSchema);
