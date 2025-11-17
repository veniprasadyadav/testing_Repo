import express from "express";
import socialBlogRouter from "./routes/socialBlogRouter";

const app = express();

// keep global parsers for rest of your app (we do NOT change this)
app.use(express.json());

// add the route group
app.use("/api/v1/social-blogs", socialBlogRouter);

export default app;
