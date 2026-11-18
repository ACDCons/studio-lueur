import { openDatabase } from "../src/db/client";
import { contacts, demandes } from "../src/db/schema";

async function main() {
  const { client, db } = await openDatabase();

  try {
    await db.transaction(async (tx) => {
      const [existingContact] = await tx.select({ id: contacts.id }).from(contacts).limit(1);
      const [existingDemande] = await tx.select({ id: demandes.id }).from(demandes).limit(1);

      if (existingContact || existingDemande) {
        throw new Error("Seed refused: the database already contains rows; no data was changed.");
      }

      const [contact] = await tx
        .insert(contacts)
        .values({
          nom: "Léa",
          email: "lea@example.invalid",
          emailNormalise: "lea@example.invalid",
        })
        .returning({ id: contacts.id });

      if (!contact) throw new Error("Could not create the fictitious contact.");

      await tx.insert(demandes).values([
        {
          contactId: contact.id,
          typeSeance: "Mariage",
          message: "Demande fictive de démonstration 1.",
        },
        {
          contactId: contact.id,
          typeSeance: "Portrait",
          message: "Demande fictive de démonstration 2.",
        },
      ]);
    });

    console.log("Inserted one fictitious contact and two fictitious requests.");
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
