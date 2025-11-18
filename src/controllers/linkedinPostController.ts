import { Request, Response } from "express";
import * as crypto from "crypto";

const CLIENT_SECRET: string = process.env.LINKEDIN_CLIENT_SECRET!;

function computeHmacHex(payload: string | Buffer) {
  // Update type to accept Buffer or string
  return crypto
    .createHmac("sha256", CLIENT_SECRET)
    .update(payload)
    .digest("hex");
}

export const linkedinWebhooks = (req: Request, res: Response) => {
  console.log("testing route : ---------------");

  // Validation (GET) - LinkedIn's challenge validation
  if (req.method === "GET") {
    // ... (Your GET logic is fine, keeping it as is) ...
    const challengeCode = req.query.challengeCode as string;
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
    
    // 👇 Use req.rawBody which was populated by the global middleware
    const rawBodyBuffer: Buffer | undefined = (req as any).rawBody; 

    console.log("Verifying signature:", signature);
    console.log("Raw body is Buffer:", Buffer.isBuffer(rawBodyBuffer)); // Should now be true
    
    // Ensure we have both raw body and signature
    if (!rawBodyBuffer || !signature) {
        console.error("Missing raw body or signature.");
        return res.status(401).send("Unauthorized: Missing data");
    }

    console.log(
      "Computed HMAC:",
      computeHmacHex(rawBodyBuffer) // Pass the buffer directly
    );
    
    if (
      !isSignatureValid(rawBodyBuffer, signature, CLIENT_SECRET)
    ) {
      console.error("Invalid signature: Unauthorized access attempt.");
      return res.status(401).send("Unauthorized: Invalid Signature");
    }

    // Signature valid. Process the event.
    console.log("Received a valid event.");
    console.log("Event JSON Body:", req.body); // req.body is automatically JSON object here

    return res.status(200).send("Event received and processed.");
  }
  res.status(405).send("Method Not Allowed");
};

// ... (isSignatureValid function is correct) ...
function isSignatureValid(
  rawBody: Buffer,
  signature: string,
  secret: string
): boolean {
  // LinkedIn requires the signature to be prefixed with 'hmacsha256='
  const expectedSignaturePrefix = "hmacsha256=";
  if (!signature.startsWith(expectedSignaturePrefix)) {
    console.log("Signature does not start with expected prefix.");
    return false;
  }
  const linkedInHash: string = signature.substring(expectedSignaturePrefix.length);
  const hash: string = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(linkedInHash, "hex")
  );
}