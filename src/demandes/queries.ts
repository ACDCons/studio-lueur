import { desc, eq } from "drizzle-orm";
import { contacts, demandes } from "@/src/db/schema";
import { openDatabase } from "@/src/db/client";

export async function listDemandes() {
  const { client, db } = await openDatabase();
  try {
    return await db
      .select({
        id: demandes.id,
        contactId: demandes.contactId,
        contactNom: contacts.nom,
        contactEmail: contacts.email,
        typeSeance: demandes.typeSeance,
        dateSouhaitee: demandes.dateSouhaitee,
        message: demandes.message,
        statut: demandes.statut,
        note: demandes.note,
        prochaineAction: demandes.prochaineAction,
        createdAt: demandes.createdAt,
      })
      .from(demandes)
      .innerJoin(contacts, eq(demandes.contactId, contacts.id))
      .orderBy(desc(demandes.createdAt), desc(demandes.id));
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
        contactNom: contacts.nom,
        contactEmail: contacts.email,
        typeSeance: demandes.typeSeance,
        dateSouhaitee: demandes.dateSouhaitee,
        message: demandes.message,
        statut: demandes.statut,
        note: demandes.note,
        prochaineAction: demandes.prochaineAction,
        createdAt: demandes.createdAt,
      })
      .from(demandes)
      .innerJoin(contacts, eq(demandes.contactId, contacts.id))
      .where(eq(demandes.id, id))
      .limit(1);
    return record;
  } finally {
    await client.close();
  }
}
