import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../auth";
import { ensureAuthDatabaseReady } from "../db/auth-database";
import { openDatabase } from "../db/client";
import { roles } from "../db/schema";
import { eq } from "drizzle-orm";

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
  const roleId = session.user.role ?? "user";
  const { client, db } = await openDatabase();
  let crmAccess = false;
  try {
    const [role] = await db.select({ accesCrm: roles.accesCrm }).from(roles).where(eq(roles.id, roleId)).limit(1);
    crmAccess = role?.accesCrm ?? false;
  } finally { await client.close(); }
  if (!crmAccess) redirect("/acces-refuse");
  return session;
}

export async function requireAdministrator() {
  const session = await getCurrentSession();
  if (!session) redirect("/saucisse-connection?retour=/crm");
  if (session.user.role !== "admin") redirect("/acces-refuse");
  return session;
}
