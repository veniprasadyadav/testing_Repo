import { Router } from "express";
// express import is no longer needed here if it's just routing
import { linkedinWebhooks } from "../controllers/linkedinPostController";

const router = Router();

// Remove express.raw() here. The global middleware handles the raw body capture.
router.all(
  "/webhook/linkedin/challenge",
  linkedinWebhooks
);

export default router;