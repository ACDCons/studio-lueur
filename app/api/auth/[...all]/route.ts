import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/src/auth";
import { assertAuthSecret } from "@/src/auth/server";
import { ensureAuthDatabaseReady } from "@/src/db/auth-database";

const handlers = toNextJsHandler(auth);

function isPublicAuthRequest(request: Request): boolean {
  let path: string;
  try {
    path = new URL(request.url).pathname
      .slice("/api/auth".length)
      .split("/")
      .map((segment) => decodeURIComponent(segment))
      .join("/")
      .toLowerCase();
  } catch {
    return false;
  }

  const route = `${request.method.toUpperCase()} ${path}`;
  return new Set([
    "GET /get-session",
    "POST /sign-in/email",
    "POST /sign-out",
  ]).has(route);
}

async function prepare(request: Request): Promise<Response | null> {
  if (!isPublicAuthRequest(request)) return new Response(null, { status: 404 });
  assertAuthSecret();
  await ensureAuthDatabaseReady();
  return null;
}

export async function GET(request: Request): Promise<Response> {
  const blocked = await prepare(request);
  if (blocked) return blocked;
  return handlers.GET(request);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = await prepare(request);
  if (blocked) return blocked;
  return handlers.POST(request);
}
