export {}; 

// This uses declaration merging to add 'rawBody' to the existing Express Request type
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer; // We explicitly define it as an optional Buffer type
    }
  }
}