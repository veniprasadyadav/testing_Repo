import express, { Application, Request, Response, NextFunction } from 'express';
import socialBlogRouter from "./routes/socialBlogRouter";

const app: Application = express();

// Keep these global for your other API routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/social-blogs", socialBlogRouter);
// ... other app setup ...
export default app;