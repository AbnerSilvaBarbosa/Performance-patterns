import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./libs/database/src/schema.ts",
  out: "./libs/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
