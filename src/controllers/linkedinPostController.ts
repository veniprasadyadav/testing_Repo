import { Request, Response } from "express";
import * as crypto from "crypto";

const CLIENT_SECRET: string = process.env.LINKEDIN_CLIENT_SECRET!;

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
    const signature: string | undefined = req.header("x-li-signature");
    console.log("Verifying signature:", signature);
    console.log("Raw body for signature verification:", req.rawBody);
    console.log("CLIENT_SECRET:", CLIENT_SECRET);
    console.log(
      "Computed HMAC:",
      computeHmacHex(req.rawBody?.toString() || "")
    );
    console.log(
      "issignatureValid :",
      isSignatureValid(req.rawBody!, signature || "", CLIENT_SECRET)
    );

    if (
      !req.rawBody ||
      !signature ||
      !isSignatureValid(req.rawBody, signature, CLIENT_SECRET)
    ) {
      // A 401 Unauthorized is appropriate here if the signature fails validation.
      console.error("Invalid signature: Unauthorized access attempt.");
      return res.status(401).send("Unauthorized");
    }

    // Signature valid. Process the event.
    console.log("Received a valid event:", req.body);

    // Add your logic to process the specific event types here

    // LinkedIn expects a 200 OK response quickly upon success
    return res.status(200).send("Event received and processed.");
  }

  // Handle other methods not implemented
  res.status(405).send("Method Not Allowed");
};

function isSignatureValid(
  rawBody: Buffer,
  signature: string,
  secret: string
): boolean {
  // LinkedIn requires the signature to be prefixed with 'hmacsha256='
  const expectedSignaturePrefix = "hmacsha256=";
  if (!signature.startsWith(expectedSignaturePrefix)) {
    return false;
  }

  const linkedInHash: string = signature.substring(
    expectedSignaturePrefix.length
  );

  // Calculate HMAC-SHA256 hash of the raw request body using your client secret
  const hash: string = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  console.log("Calculated hash:", hash);
  console.log("LinkedIn hash:", linkedInHash);
  // Use timingSafeEqual for security against timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(linkedInHash, "hex")
  );
}
