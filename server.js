import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./db/mongooseDB.js";
import { inngest, functions } from "./utils/inngest.utils.js";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

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
