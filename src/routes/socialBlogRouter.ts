import { Router } from "express";
import express from "express";
import { linkedinWebhooks } from "../controllers/linkedinPostController";

const router = Router();

// LinkedIn webhook: capture raw body only for this route
router.all(
  "/webhook/linkedin/challenge",
  // express.raw gives you the exact Buffer sent by LinkedIn
  linkedinWebhooks
);

export default router;
