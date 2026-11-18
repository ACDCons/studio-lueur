import { eq, isNull } from "drizzle-orm";
import { clients, contacts, demandes, shootings } from "../src/db/schema";
import { openDatabase } from "../src/db/client";
import { resolveDatabaseUrl } from "../src/db/url";

async function main() {
  const localUrl = resolveDatabaseUrl(undefined, process.cwd());
  const targetUrl = resolveDatabaseUrl(process.env.DATABASE_URL, process.cwd());
  if (targetUrl !== localUrl) throw new Error("Preflight can only inspect data/local.sqlite.");

  const { client, db } = await openDatabase();
  try {
    const rows = await db.select({ id: shootings.id, clientId: clients.id }).from(shootings)
      .innerJoin(demandes, eq(shootings.demandeId, demandes.id))
      .innerJoin(contacts, eq(demandes.contactId, contacts.id))
      .leftJoin(clients, eq(clients.contactId, contacts.id));
    const unresolved = rows.filter((row) => row.clientId === null).map((row) => row.id);
    console.log(`Shootings observed: ${rows.length}. Shootings without a resolvable client: ${unresolved.length}.`);
    if (unresolved.length) throw new Error(`Migration stopped; shooting IDs need a client link: ${unresolved.join(", ")}.`);
  } finally { await client.close(); }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
