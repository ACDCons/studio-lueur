import { count, inArray } from "drizzle-orm";
import { openDatabase } from "../src/db/client";
import { contacts, demandes } from "../src/db/schema";
import { resolveDatabaseUrl } from "../src/db/url";
import type { StatutDemande, TypeSeance } from "../src/demandes/constants";

const MAX_BUSINESS_ROWS = 50;
const EXPECTED_CONTACTS_BEFORE = 2;
const EXPECTED_DEMANDES_BEFORE = 3;

const clients = [
  "Camille Bernard",
  "Hugo Lefèvre",
  "Inès Moreau",
  "Noah Laurent",
  "Chloé Petit",
  "Louis Robert",
  "Manon Dubois",
  "Adam Garcia",
  "Jade Simon",
  "Arthur Michel",
  "Zoé François",
  "Jules Roux",
  "Lina Vincent",
  "Sacha Fournier",
  "Emma Girard",
  "Gabriel Bonnet",
  "Rose Lambert",
  "Nathan Faure",
  "Anna André",
  "Maël Mercier",
  "Léo Dupont",
  "Sarah Fontaine",
] as const;

type SeedRequest = {
  clientIndex: number;
  typeSeance: TypeSeance;
  statut: StatutDemande;
  dateSouhaitee: string;
  message: string;
  note: string | null;
  prochaineAction: string | null;
};

const types: TypeSeance[] = ["Mariage", "Portrait", "Entreprise"];
const statuses: StatutDemande[] = [
  "Nouveau",
  "En Discussion",
  "Acompte versé",
  "Shooting proche",
  "Retouche en cours",
  "Livrée",
  "Payée",
  "Refusée",
  "Annulée",
];
const messages: Record<TypeSeance, string> = {
  Mariage: "Projet de mariage fictif pour une galerie de démonstration.",
  Portrait: "Projet de portrait fictif pour une galerie de démonstration.",
  Entreprise: "Projet photo d’entreprise fictif pour une galerie de démonstration.",
};

const requests: SeedRequest[] = clients.map((_, index) => {
  const typeSeance = types[index % types.length];
  const followUp = index % 5 === 0;

  return {
    clientIndex: index,
    typeSeance,
    statut: statuses[index % statuses.length],
    dateSouhaitee: `2027-05-${String(10 + (index % 18)).padStart(2, "0")}`,
    message: `${messages[typeSeance]} Référence fictive ${String(index + 1).padStart(2, "0")}.`,
    note: followUp ? "Échange de suivi fictif." : null,
    prochaineAction: followUp ? "Recontacter au sujet du devis fictif." : null,
  };
});

requests.push({
  clientIndex: 6,
  typeSeance: "Portrait",
  statut: "En Discussion",
  dateSouhaitee: "2027-09-11",
  message: "Deuxième demande fictive liée au même client de démonstration.",
  note: "Préférence de séance fictive notée.",
  prochaineAction: "Confirmer les disponibilités fictives.",
});

async function main() {
  const localUrl = resolveDatabaseUrl(undefined, process.cwd());
  const configuredUrl = resolveDatabaseUrl(process.env.DATABASE_URL, process.cwd());
  if (configuredUrl !== localUrl) {
    throw new Error("Sample data can only be written to the project's local data/local.sqlite database.");
  }

  const { client, db } = await openDatabase();
  try {
    await db.transaction(async (tx) => {
      const [contactCount] = await tx.select({ total: count() }).from(contacts);
      const [demandeCount] = await tx.select({ total: count() }).from(demandes);

      if (
        Number(contactCount?.total) !== EXPECTED_CONTACTS_BEFORE ||
        Number(demandeCount?.total) !== EXPECTED_DEMANDES_BEFORE
      ) {
        throw new Error(
          `Seed stopped without changes: expected ${EXPECTED_CONTACTS_BEFORE} contacts and ${EXPECTED_DEMANDES_BEFORE} requests before insertion.`,
        );
      }

      const demoEmails = clients.map((_, index) => `crm-demo-${String(index + 1).padStart(2, "0")}@example.invalid`);
      const existingDemoClients = await tx
        .select({ id: contacts.id })
        .from(contacts)
        .where(inArray(contacts.emailNormalise, demoEmails));
      if (existingDemoClients.length > 0) {
        throw new Error("Seed stopped without changes: demo client addresses already exist.");
      }

      const clientIds: number[] = [];
      for (const [index, nom] of clients.entries()) {
        const email = demoEmails[index];
        const [inserted] = await tx
          .insert(contacts)
          .values({ nom, email, emailNormalise: email })
          .returning({ id: contacts.id });
        if (!inserted) throw new Error("Could not create a fictitious client.");
        clientIds.push(inserted.id);
      }

      for (const request of requests) {
        const contactId = clientIds[request.clientIndex];
        if (!contactId) throw new Error("A fictitious request has no matching client.");
        await tx.insert(demandes).values({
          contactId,
          typeSeance: request.typeSeance,
          statut: request.statut,
          dateSouhaitee: request.dateSouhaitee,
          message: request.message,
          note: request.note,
          prochaineAction: request.prochaineAction,
        });
      }

      const [contactCountAfter] = await tx.select({ total: count() }).from(contacts);
      const [demandeCountAfter] = await tx.select({ total: count() }).from(demandes);
      const totalRows = Number(contactCountAfter?.total) + Number(demandeCountAfter?.total);
      if (
        Number(contactCountAfter?.total) !== EXPECTED_CONTACTS_BEFORE + clients.length ||
        Number(demandeCountAfter?.total) !== EXPECTED_DEMANDES_BEFORE + requests.length ||
        totalRows > MAX_BUSINESS_ROWS
      ) {
        throw new Error("Seed stopped because the 50-row limit would be exceeded.");
      }
    });

    console.log(`Added ${clients.length} fictitious clients and ${requests.length} fictitious requests to the local database.`);
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
