import { eq } from "drizzle-orm";
import { clients, contacts, demandes, factures, shootings } from "../src/db/schema";
import { openDatabase } from "../src/db/client";
import { resolveDatabaseUrl } from "../src/db/url";

async function main() {
  const localUrl = resolveDatabaseUrl(undefined, process.cwd());
  const targetUrl = resolveDatabaseUrl(process.env.DATABASE_URL, process.cwd());
  if (targetUrl !== localUrl) throw new Error("Client-link check can only read data/local.sqlite.");
  const { client, db } = await openDatabase();
  try {
    const [clientRows, shootingRows, invoiceRows] = await Promise.all([
      db.select({ id: clients.id }).from(clients),
      db.select({ id: shootings.id, clientContactId: contacts.id, demandeId: demandes.id, demandeContactId: demandes.contactId })
        .from(shootings).innerJoin(clients, eq(shootings.clientId, clients.id)).innerJoin(contacts, eq(clients.contactId, contacts.id))
        .leftJoin(demandes, eq(shootings.demandeId, demandes.id)),
      db.select({ id: factures.id, clientContactId: contacts.id, demandeId: demandes.id, demandeContactId: demandes.contactId })
        .from(factures).leftJoin(clients, eq(factures.clientId, clients.id)).leftJoin(contacts, eq(clients.contactId, contacts.id))
        .leftJoin(demandes, eq(factures.demandeId, demandes.id)),
    ]);
    const badShootings = shootingRows.filter((row) => row.demandeId !== null && row.clientContactId !== row.demandeContactId).map((row) => row.id);
    const badInvoices = invoiceRows.filter((row) => row.demandeId === null && row.clientContactId === null || row.demandeId !== null && row.clientContactId !== null && row.clientContactId !== row.demandeContactId).map((row) => row.id);
    const fk = await client.execute("PRAGMA foreign_key_check");
    console.log(`Clients: ${clientRows.length}; shootings: ${shootingRows.length}; invoices: ${invoiceRows.length}; shootings without a matching client: ${badShootings.length}; invoices without a valid owner link: ${badInvoices.length}; foreign-key violations: ${fk.rows.length}.`);
    if (badShootings.length || badInvoices.length || fk.rows.length) throw new Error("Client links or foreign keys need attention.");
  } finally { await client.close(); }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
