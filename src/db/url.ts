import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEFAULT_DATABASE_URL = "file:data/local.sqlite";

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
