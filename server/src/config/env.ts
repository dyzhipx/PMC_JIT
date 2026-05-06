import "dotenv/config";

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://pmc:pmc_secret@localhost:5432/pmc_db",
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "pmc-dev-secret-key-2026",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};
