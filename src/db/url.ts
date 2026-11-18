import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEFAULT_DATABASE_URL = "file:data/local.sqlite";

export function getDatabaseConnectionConfig(projectRoot: string) {
  // Use Vercel's connected Turso database in deployments, while local
  // development stays on the project SQLite file unless DATABASE_URL is set.
  const isVercel = process.env.VERCEL === "1";
  const configuredUrl = isVercel
    ? process.env.TURSO_DATABASE_URL?.trim()
    : process.env.DATABASE_URL?.trim();

  if (isVercel && !configuredUrl) {
    throw new Error("TURSO_DATABASE_URL is required for a Vercel deployment.");
  }

  const url = resolveDatabaseUrl(configuredUrl, projectRoot);
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!url.startsWith("file:") && !authToken) {
    throw new Error("TURSO_AUTH_TOKEN is required for a remote libSQL database.");
  }

  return {
    url,
    ...(url.startsWith("file:") || !authToken ? {} : { authToken }),
  };
}

export function resolveDatabaseUrl(
  configuredUrl: string | undefined,
  projectRoot: string,
): string {
  const value = configuredUrl?.trim() || DEFAULT_DATABASE_URL;
  if (!value.startsWith("file:")) return value;

  const filePath = value.slice("file:".length);
  if (!filePath || filePath === ":memory:") return value;

  let absolutePath: string;
  if (value.startsWith("file:/")) {
    absolutePath = fileURLToPath(value);
  } else if (path.isAbsolute(filePath)) {
    absolutePath = filePath;
  } else {
    absolutePath = path.resolve(projectRoot, filePath);
  }

  return pathToFileURL(absolutePath).href;
}
