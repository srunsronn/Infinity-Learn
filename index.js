import MongoStore from "connect-mongo";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import passport from "passport";
import fileUpload from "express-fileupload";
import session from "express-session";
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
import enrolledCourseRoute from "./routes/enrolledCourseRoute.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import trackLoginRoutes from "./routes/trackLoginRoutes.js";
import addToCartRoutes from "./routes/addToCartRoutes.js";
import engagementRoutes from "./routes/engagementRoutes.js";
import recommendationRoutes from "./routes/recommendCourseRoute.js";
import sessionConfig from "./update-session.js";
import heathRoutes from "./routes/healthRoutes.js";

dotenv.config();

const port = process.env.PORT || 5000;
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const connectedUsers = new Map();

// Socket.IO connection management
io.on("connection", (socket) => {
  socket.on("authenticate", (userId) => {
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    connectedUsers.set(userId.toString(), {
      socketId: socket.id,
      lastActive: Date.now(),
    });

    console.log(`User ${userId} authenticated with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, userData] of connectedUsers.entries()) {
      if (userData.socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });

  socket.on("ping", (userId) => {
    if (userId && connectedUsers.has(userId.toString())) {
      connectedUsers.get(userId.toString()).lastActive = Date.now();
    }
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Disconnect inactive users every minute
setInterval(() => {
  const now = Date.now();
  for (const [userId, userData] of connectedUsers.entries()) {
    if (now - userData.lastActive > 120000) {
      io.to(userData.socketId).disconnectSockets(true);
      connectedUsers.delete(userId);
      console.log(`Disconnected inactive user ${userId}`);
    }
  }
}, 60000);

// MongoDB session store configuration
let store;
try {
  store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    ttl: 14 * 24 * 60 * 60, // 14 days
    touchAfter: 24 * 3600, // time period in seconds to refresh session
  });
  console.log("Using MongoDB for session storage");
} catch (error) {
  console.error("Error setting up MongoDB session store:", error);
  console.warn("Falling back to memory store - NOT RECOMMENDED FOR PRODUCTION");
  store = null; // This will default to MemoryStore as a last resort
}

// Session configuration with fallback
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
  },
};

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// Session middleware setup
app.use(session(sessionConfig));

// Passport session initialization
app.use(passport.initialize());
app.use(passport.session());

// File upload middleware
app.use(fileUpload());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

app.use("/api/v1/health", heathRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/quiz", quizRoute);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/saveCourses", saveCourseRoute);
app.use("/api/v1/upload", uploadFileRoute);
app.use("/api/v1/question", questionRoute);
app.use("/api/v1/enroll", enrolledCourseRoute);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/trackings", trackLoginRoutes);
app.use("/api/v1/carts", addToCartRoutes);
app.use("/api/v1/engagement", engagementRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);

// Error middleware
app.use(errorMiddleware);

// Graceful shutdown setup
const gracefulShutdown = () => {
  console.log("Received shutdown signal - closing HTTP server");

  io.close(() => {
    console.log("All Socket.io connections closed");

    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

// Shutdown signal handling
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGUSR2", gracefulShutdown);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
