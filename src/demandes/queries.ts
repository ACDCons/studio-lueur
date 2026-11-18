import { desc, eq } from "drizzle-orm";
import { clients, contacts, demandes, echanges } from "@/src/db/schema";
import { openDatabase } from "@/src/db/client";

export async function listDemandes() {
  const { client, db } = await openDatabase();
  try {
    const records = await db
      .select({
        id: demandes.id,
        contactId: demandes.contactId,
        clientId: clients.id,
        contactNom: contacts.nom,
        contactEmail: contacts.email,
        statutContact: contacts.statutContact,
        typeSeance: demandes.typeSeance,
        dateSouhaitee: demandes.dateSouhaitee,
        dateShootingValidee: demandes.dateShootingValidee,
        message: demandes.message,
        statut: demandes.statut,
        note: demandes.note,
        prochaineAction: demandes.prochaineAction,
        budgetEur: demandes.budgetEur,
        raisonRefus: demandes.raisonRefus,
        createdAt: demandes.createdAt,
      })
      .from(demandes)
      .innerJoin(contacts, eq(demandes.contactId, contacts.id))
      .leftJoin(clients, eq(clients.contactId, contacts.id))
      .orderBy(desc(demandes.createdAt), desc(demandes.id));
    return records.map(({ clientId, statutContact, ...record }) => ({ ...record, statutContact: clientId ? null : statutContact }));
  } finally {
    await client.close();
  }
}

export async function getDemande(id: number) {
  const { client, db } = await openDatabase();
  try {
    const [record] = await db
      .select({
        id: demandes.id,
        contactId: demandes.contactId,
        clientId: clients.id,
        contactNom: contacts.nom,
        contactEmail: contacts.email,
        statutContact: contacts.statutContact,
        typeSeance: demandes.typeSeance,
        dateSouhaitee: demandes.dateSouhaitee,
        dateShootingValidee: demandes.dateShootingValidee,
        message: demandes.message,
        statut: demandes.statut,
        note: demandes.note,
        prochaineAction: demandes.prochaineAction,
        budgetEur: demandes.budgetEur,
        raisonRefus: demandes.raisonRefus,
        createdAt: demandes.createdAt,
      })
      .from(demandes)
      .innerJoin(contacts, eq(demandes.contactId, contacts.id))
      .leftJoin(clients, eq(clients.contactId, contacts.id))
      .where(eq(demandes.id, id))
      .limit(1);
    if (!record) return undefined;
    const historique = await db
      .select({ id: echanges.id, auteur: echanges.auteur, contenu: echanges.contenu, createdAt: echanges.createdAt })
      .from(echanges)
      .where(eq(echanges.demandeId, id))
      .orderBy(desc(echanges.createdAt), desc(echanges.id));
    return { ...record, statutContact: record.clientId ? null : record.statutContact, echanges: historique };
  } finally {
    await client.close();
  }
}
