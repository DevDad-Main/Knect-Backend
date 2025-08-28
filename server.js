import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./db/mongooseDB.js";
import { inngest, functions } from "./utils/inngest.utils.js";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";
import usersRouter from "./routes/user.routes.js";
import postsRouter from "./routes/post.routes.js";
import storysRouter from "./routes/story.routes.js";
import messagesRouter from "./routes/message.routes.js";

//#region CONSTANTS
const app = express();
const PORT = process.env.PORT || 4000;
//#endregion

//#region MIDDLEWARE
app.use(express.json());
app.use(cors());

//INFO: The clerkMiddleware() function checks the request's cookies and headers for a session JWT and, if found, attaches the object to the request object under the auth key.
app.use(clerkMiddleware());
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

//#region MONGO CONNECTION
connectDB()
  .then(
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    }),
  )
  .catch((err) => {
    console.log(`MongoDB Connection Error`, err);
  });
//#endregion
