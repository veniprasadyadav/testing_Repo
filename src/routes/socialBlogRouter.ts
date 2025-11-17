import { Router } from "express";
import express from "express";
import { linkedinWebhooks } from "../controllers/linkedinPostController";

const router = Router();

// LinkedIn webhook: capture raw body only for this route
router.all(
  "/webhook/linkedin/challenge",
  // express.raw gives you the exact Buffer sent by LinkedIn
  express.raw({ type: "*/*" }),
  // convert Buffer -> string and expose as req.rawBody (typed above)
  (req: any, _res, next) => {
    // Note: req.body here is a Buffer because we used express.raw()
    req.rawBody = (req.body && req.body.toString("utf8")) || "";
    next();
  },
  linkedinWebhooks
);

export default router;
