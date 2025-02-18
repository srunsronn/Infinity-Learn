import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import notificationService from "./services/notificationService.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import quizRoute from "./routes/quizRoutes.js";
import saveCourseRoute from "./routes/saveCourseRoutes.js";
import uploadFileRoute from "./routes/uploadRoutes.js";
import questionRoute from "./routes/questionRoutes.js";

dotenv.config();
const port = process.env.PORT || 5000;
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(
  cors({
    origin: "http://localhost:5174", // Replace with your frontend's origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("online", (user) => {
    onlineUsers.set(user._id, socket.id);
    io.emit("online", Array.from(onlineUsers.keys()));
  });

  socket.on("send-notification", async (notification) => {
    const receiverSocketId = onlineUsers.get(notification.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-notification", notification);
    }
    await notificationService.create(notification);
  });

  socket.on("disconnect", () => {
    for (const [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        io.emit("online", Array.from(onlineUsers.keys()));
        break;
      }
    }
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/quiz", quizRoute);
app.use("/api/v1/saveCourses", saveCourseRoute);
app.use("/api/v1/upload", uploadFileRoute);

app.use("/api/v1/quiz", quizRoute);
app.use("/api/v1/question", questionRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(errorMiddleware);

export { onlineUsers };
