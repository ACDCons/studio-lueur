import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../auth";
import { ensureAuthDatabaseReady } from "../db/auth-database";

export function assertAuthSecret(): void {
  if ((process.env.BETTER_AUTH_SECRET?.trim().length ?? 0) < 32) {
    throw new Error("Set your own stable BETTER_AUTH_SECRET (at least 32 characters) in the local environment. Do not share or commit that value.");
  }
}

export async function getCurrentSession() {
  assertAuthSecret();
  await ensureAuthDatabaseReady();
  return auth.api.getSession({ headers: await headers() });
}

export async function requireManager() {
  const session = await getCurrentSession();
  if (!session) redirect("/saucisse-connection?retour=/crm");
  if (session.user.role !== "admin") redirect("/acces-refuse");
  return session;
}
