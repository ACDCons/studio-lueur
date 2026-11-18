import { and, eq } from "drizzle-orm";
import { contacts, demandes } from "../src/db/schema";
import { openDatabase } from "../src/db/client";
import { resolveDatabaseUrl } from "../src/db/url";

const fixtures = [
  {
    id: 4,
    email: "crm-demo-01@example.invalid",
    expectedMessage: "Projet de mariage fictif pour une galerie de démonstration. Référence fictive 01.",
    budget: 1850,
    context: "Mariage intimiste de 65 invités à la mairie puis dans un jardin familial. Recherche un reportage naturel des préparatifs, de la cérémonie, des portraits de famille et du début du cocktail.",
  },
  {
    id: 5,
    email: "crm-demo-02@example.invalid",
    expectedMessage: "Projet de portrait fictif pour une galerie de démonstration. Référence fictive 02.",
    budget: 480,
    context: "Portraits professionnels pour renouveler le site d’un atelier d’architecture : deux tenues, lumière naturelle, portraits individuels et images en situation.",
  },
  {
    id: 6,
    email: "crm-demo-03@example.invalid",
    expectedMessage: "Projet photo d’entreprise fictif pour une galerie de démonstration. Référence fictive 03.",
    budget: 1250,
    context: "Reportage d’une journée de cohésion pour 35 personnes, alternant portraits d’équipe, ateliers et moments informels ; livraison numérique pour la communication interne.",
  },
  {
    id: 8,
    email: "crm-demo-05@example.invalid",
    expectedMessage: "Projet de portrait fictif pour une galerie de démonstration. Référence fictive 05.",
    budget: 390,
    context: "Séance portrait mère-fille en extérieur, deux générations, lumière de fin de journée et quelques tirages encadrés.",
  },
  {
    id: 9,
    email: "crm-demo-06@example.invalid",
    expectedMessage: "Projet photo d’entreprise fictif pour une galerie de démonstration. Référence fictive 06.",
    budget: 1100,
    context: "Couverture d’une soirée d’équipe avec accueil, prises de parole et photos de groupe ; prévoir une courte séance de portraits avant l’évènement.",
  },
] as const;

async function main() {
  const localUrl = resolveDatabaseUrl(undefined, process.cwd());
  const targetUrl = resolveDatabaseUrl(process.env.DATABASE_URL, process.cwd());
  if (targetUrl !== localUrl) {
    throw new Error("Demo enrichment only runs against the project's local data/local.sqlite database.");
  }

  const { client, db } = await openDatabase();
  try {
    await db.transaction(async (tx) => {
      for (const fixture of fixtures) {
        const [request] = await tx
          .select({
            id: demandes.id,
            emailNormalise: contacts.emailNormalise,
            message: demandes.message,
            budgetEur: demandes.budgetEur,
          })
          .from(demandes)
          .innerJoin(contacts, eq(demandes.contactId, contacts.id))
          .where(and(eq(demandes.id, fixture.id), eq(contacts.emailNormalise, fixture.email)))
          .limit(1);

        if (!request || request.message !== fixture.expectedMessage || request.budgetEur !== null) {
          throw new Error(`Demo request ${fixture.id} changed since inspection; no enrichment was applied.`);
        }

        await tx
          .update(demandes)
          .set({
            message: `${request.message}\n\nContexte fictif complémentaire : ${fixture.context}`,
            budgetEur: fixture.budget,
          })
          .where(eq(demandes.id, fixture.id));
      }
    });
    console.log("Added fictional project context and budgets to five existing demo requests.");
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
