import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URL;

    await mongoose.connect(mongoURI);

    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("Error: " + error.message);
    process.exit(1);
  }
};

export default connectDB;
