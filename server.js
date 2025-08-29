import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./db/mongooseDB.js";
import { inngest, functions } from "./utils/inngest.utils.js";
import { serve } from "inngest/express";
import usersRouter from "./routes/user.routes.js";
import postsRouter from "./routes/post.routes.js";
import storysRouter from "./routes/story.routes.js";
import messagesRouter from "./routes/message.routes.js";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

//#region CONSTANTS
const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = process.env.CORS_ORIGIN.split(","); // split comma-separated string
//#endregion

//#region MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["PATCH", "POST", "PUT", "GET", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Headers",
      // "Access-Control-Allow-Origin",
    ],
    credentials: true,
    // optionsSuccessStatus: 200,
  }),
);

//INFO: The clerkMiddleware() function checks the request's cookies and headers for a session JWT and, if found, attaches the object to the request object under the auth key.
// app.use(clerkMiddleware());
//#endregion

//#region ENDPOINTS
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/v1/user", usersRouter);
app.use("/api/v1/post", postsRouter);
app.use("/api/v1/story", storysRouter);
app.use("/api/v1/message", messagesRouter);
//#endregion

//#region Socket IO;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  const token = socket.handshake.query.token;
  // if (!userId) return;

  console.log(`Socket connected: ${socket.id} (user: ${userId})`);

  const userSet = onlineUsers.get(userId) ?? new Set();
  userSet.add(socket.id);
  onlineUsers.set(userId, userSet);

  // Receive messages
  socket.on("private_message", (payload) => {
    const { to_user_id, text } = payload;
    console.log(`Message from ${userId} to ${to_user_id}: ${text}`);

    // Emit to recipient if online
    const destSockets = onlineUsers.get(to_user_id);
    if (destSockets) {
      for (const sid of destSockets) {
        io.to(sid).emit("receive_message", {
          from_user_id: userId,
          to_user_id,
          text,
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    const userSet = onlineUsers.get(userId);
    if (userSet) {
      userSet.delete(socket.id);
      if (userSet.size === 0) onlineUsers.delete(userId);
      else onlineUsers.set(userId, userSet);
    }
  });
});

app.set("io", io);
//#endregion

//#region MONGO CONNECTION
connectDB()
  .then(
    server.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    }),
  )
  .catch((err) => {
    console.log(`MongoDB Connection Error`, err);
  });
//#endregion
