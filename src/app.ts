import express, { Application, Request, Response, NextFunction } from 'express';
import socialBlogRouter from "./routes/socialBlogRouter";
// import * as bodyParser from 'body-parser'; // Remove this import

const app: Application = express();

// Remove the custom interface definition
// interface CustomRequest extends Request {
//     rawBody?: Buffer;
// }

// Keep the standard JSON and URLencoded middleware for your *other* API routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// add the route group
app.use("/api/v1/social-blogs", socialBlogRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the LinkedIn Webhook Listener API");
});

export default app;