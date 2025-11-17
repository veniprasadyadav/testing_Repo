import { Request, Response } from "express";
import * as crypto from "crypto";

const CLIENT_SECRET :string=process.env.LINKEDIN_CLIENT_SECRET!  ;

function computeHmacHex(payload: string) {
  return crypto
    .createHmac("sha256", CLIENT_SECRET)
    .update(payload)
    .digest("hex");
}

export const linkedinWebhooks = (req: Request, res: Response) => {
  console.log("testing route : ---------------");
  // Validation (GET) - LinkedIn's challenge validation
  if (req.method === "GET") {
    const challengeCode = req.query.challengeCode as string;
    const applicationId = req.query.applicationId as string | undefined;
    const challenge = req.query.challengeCode as string | undefined;
    console.log("challenge query : ==========", challengeCode);
    if (!challengeCode) {
      console.log("challengesCode missing : ");
      return res.status(400).json({ error: "challengeCode missing" });
    }
    const challengeResponse = crypto
      .createHmac("sha256", CLIENT_SECRET)
      .update(challengeCode)
      .digest("hex");
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      challengeCode,
      challengeResponse,
    });
  }

  // Event (POST) - verify signature
  if (req.method === "POST") {
    const signatureHeader = req.headers["x-li-signature"] as string | undefined;
    const rawBody = req.rawBody ?? "";
    console.log("rawBody ============: ===============", rawBody);
    if (!signatureHeader) {
      console.warn("No X-LI-Signature header");
      return res.status(401).send("Unauthorized");
    }

    const computed = computeHmacHex(rawBody);

    console.log("LinkedIn signature:", signatureHeader);
    console.log("Computed signature:", computed);

    if (computed !== signatureHeader) {
      console.warn("Signature mismatch");
      return res.status(401).send("Unauthorized");
    }

    // signature ok — parse payload
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch (err) {
      console.error("Failed to parse rawBody JSON", err);
      return res.status(400).send("Bad Request");
    }

    console.log("Received LinkedIn webhook event:", JSON.stringify(body));
    // Example dedupe (optional): body.notifications[0].notificationId

    // Always respond quickly with 2xx
    return res.status(200).send("OK");
  }

  return res.status(405).send("Method Not Allowed");
};
