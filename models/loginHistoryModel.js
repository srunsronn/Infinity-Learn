import mongoose from "mongoose";
import { type } from "os";

const loginHistroySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  ipAddress: { type: String, require: true },
  device: { type: String, require: true },
  browser: { type: String, require: true },
  os: { type: String, require: true },
  tokenId: { type: String, require: true },
  loginTime: { type: Date, default: Date.now },
});

export default mongoose.model("LoginHistory", loginHistroySchema);
