import express, { Application, Request, Response, NextFunction } from 'express';
import socialBlogRouter from "./routes/socialBlogRouter";
import * as bodyParser from 'body-parser'; // Import bodyParser

const app: Application = express();

// Use bodyParser.json with a verify function to capture the raw buffer
app.use(bodyParser.json({
    verify: (req: Request, res: Response, buf: Buffer) => {
        // Assign the raw buffer to the req.rawBody property we declared globally
        (req as any).rawBody = buf; 
    }
}));
app.use(express.urlencoded({ extended: true }));


// add the route group
app.use("/api/v1/social-blogs", socialBlogRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the LinkedIn Webhook Listener API");
});

export default app;