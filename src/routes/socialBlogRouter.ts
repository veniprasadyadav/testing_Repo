import { Router } from "express";
import express from "express"; 
import { linkedinWebhooks } from "../controllers/linkedinPostController";

const router = Router();

// 👇 This ensures req.body is a Buffer *only* for this specific route
router.all(
  "/webhook/linkedin/challenge",
  express.raw({ type: 'application/json' }), // Restricts the type to JSON as LinkedIn sends
  linkedinWebhooks
);

export default router;