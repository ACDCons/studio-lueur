import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";
import { resolveDatabaseUrl } from "./src/db/url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: resolveDatabaseUrl(process.env.DATABASE_URL, projectRoot),
  },
});
