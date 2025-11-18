import { Request, Response } from "express";
import * as crypto from "crypto";

const CLIENT_SECRET: string = process.env.LINKEDIN_CLIENT_SECRET!;

function computeHmacHex(payload: string | Buffer) { // Update type to accept Buffer or string
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
    // NOTE: The header name should be 'x-li-signature' (lowercase for consistency)
    const signature: string | undefined = req.header("x-li-signature"); 
    
    // With express.raw(), req.body is already a Buffer
    const rawBodyBuffer: Buffer = req.body as Buffer; 

    console.log("Verifying signature:", signature);
    console.log("Raw body is Buffer:", Buffer.isBuffer(rawBodyBuffer));
    console.log("CLIENT_SECRET length:", CLIENT_SECRET.length); // Don't log the secret itself
    console.log(
      "Computed HMAC:",
      computeHmacHex(rawBodyBuffer) // Pass the buffer directly
    );
    console.log(
      "issignatureValid :",
      isSignatureValid(rawBodyBuffer, signature || "", CLIENT_SECRET)
    );

    if (
      !rawBodyBuffer ||
      !signature ||
      !isSignatureValid(rawBodyBuffer, signature, CLIENT_SECRET)
    ) {
      console.error("Invalid signature: Unauthorized access attempt.");
      return res.status(401).send("Unauthorized");
    }

    // Signature valid. Process the event.
    console.log("Received a valid event (parsed as raw buffer initially).");
    // If you need JSON data, you can parse it here:
    // const eventData = JSON.parse(rawBodyBuffer.toString('utf8'));
    // console.log("Event Data Object:", eventData);


    // LinkedIn expects a 200 OK response quickly upon success
    return res.status(200).send("Event received and processed.");
  }

  // Handle other methods not implemented
  res.status(405).send("Method Not Allowed");
};

// ... (The isSignatureValid function remains unchanged, it is correct) ...
function isSignatureValid(
  rawBody: Buffer,
  signature: string,
  secret: string
): boolean {
  // LinkedIn requires the signature to be prefixed with 'hmacsha256='
  const expectedSignaturePrefix = "hmacsha256=";
  // Your console logs confirmed the issue was here previously
  if (!signature.startsWith(expectedSignaturePrefix)) {
    console.log("Signature does not start with expected prefix.");
    return false;
  }
  // ... (rest of the validation function) ...
  const linkedInHash: string = signature.substring(
    expectedSignaturePrefix.length
  );
  const hash: string = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(linkedInHash, "hex")
  );
}