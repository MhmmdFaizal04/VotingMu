import { Pool } from "pg";

// Singleton pattern — critical for Vercel serverless to avoid exhausting
// Neon free tier's 20-connection limit across cold starts
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  // Replace deprecated sslmode=require with sslmode=verify-full to silence
  // pg-connection-string v3 security warning while keeping identical behaviour.
  const connectionString = (process.env.DATABASE_URL ?? "").replace(
    /sslmode=require/g,
    "sslmode=verify-full"
  );
  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

const pool: Pool = globalThis._pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis._pgPool = pool;
}

export default pool;
