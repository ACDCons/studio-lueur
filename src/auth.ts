import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { authDb, ensureAuthDatabaseReady } from "./db/auth-database";

// Start foreign-key setup before Better Auth's CLI or request handlers use this client.
void ensureAuthDatabaseReady().catch(() => undefined);

export const auth = betterAuth({
  appName: "Studio Lueur",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3000",
  trustedOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(authDb, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [admin(), nextCookies()],
});
