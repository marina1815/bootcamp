import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL missing in .env");

export const db = new Pool({
  connectionString,
  max: 10, // optional: pool size
});

db.on("connect", () => console.log("✅ PostgreSQL connected"));
db.on("error", (err) => console.error("❌ PostgreSQL error:", err));

