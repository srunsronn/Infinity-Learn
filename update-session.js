// import MongoStore from "connect-mongo";
// // Session configuration with error handling
// let store;
// try {
//   store = MongoStore.create({
//     mongoUrl: process.env.MONGODB_URL,
//     ttl: 14 * 24 * 60 * 60, // 14 days
//     touchAfter: 24 * 3600, // time period in seconds to refresh session
//   });
//   console.log("Using MongoDB for session storage");
// } catch (error) {
//   console.error("Error setting up MongoDB session store:", error);
//   console.warn("Falling back to memory store - NOT RECOMMENDED FOR PRODUCTION");
//   store = null; // This will default to MemoryStore as a last resort
// }

// const sessionConfig = {
//   secret: process.env.SESSION_SECRET || "default_secret",
//   resave: false,
//   saveUninitialized: false,
//   store: store,
//   cookie: {
//     secure: process.env.NODE_ENV === "production",
//     httpOnly: true,
//     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//     maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
//   },
// };

// export default sessionConfig;
