import express, { Application, Request, Response, NextFunction } from 'express';
import socialBlogRouter from "./routes/socialBlogRouter";
import * as bodyParser from 'body-parser';

const app: Application = express();
interface CustomRequest extends Request {
    rawBody?: Buffer;
}

// Middleware to capture the raw body before JSON parsing
// This is crucial for signature verification as the signature is based on the raw payload
app.use(bodyParser.json({
    verify: (req: CustomRequest, res: Response, buf: Buffer) => {
        req.rawBody = buf;
    }
}));
// add the route group
app.use("/api/v1/social-blogs", socialBlogRouter);
app.get("/", (req, res) => {
  res.send("Welcome to the LinkedIn Webhook Listener API");
});

export default app;
