// server.js (root or server/server.local.js — your choice)
import app from "./server/express.js";
import { connectDB } from "./server/db.js";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env that sits next to server.js (project root)
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 3000;

(async () => {
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI");
    process.exit(1);
  }
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/`));
})();