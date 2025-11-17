import dotenv from "dotenv";
dotenv.config();
import app from "./app";

const PORT = process.env.PORT ?? 8000;

app.listen(Number(PORT), () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
