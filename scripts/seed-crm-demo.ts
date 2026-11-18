import { and, eq } from "drizzle-orm";
import { clients, contacts, demandes, factures, shootings } from "../src/db/schema";
import { openDatabase } from "../src/db/client";
import { resolveDatabaseUrl } from "../src/db/url";

const fixtures = [
  { id: 4, email: "crm-demo-01@example.invalid", prefix: "Projet de mariage fictif pour une galerie de démonstration. Référence fictive 01.", budget: 1850, acompteDate: "2026-09-16", seance: { statut: "Planifié", dateSeance: "2027-06-19", heureDebut: "14:00", heureFin: "21:00", lieu: "Jardin familial fictif · lieu à confirmer", personnesEtMoments: "Préparatifs, cérémonie, portraits des familles et début du cocktail.", organisation: "Arrivée 45 minutes avant la cérémonie. Prévoir une liste de groupes préparée avec les mariés.", livrables: "Galerie numérique privée et sélection de portraits de famille." }, solde: "Envoyée" },
  { id: 5, email: "crm-demo-02@example.invalid", prefix: "Projet de portrait fictif pour une galerie de démonstration. Référence fictive 02.", budget: 480, acompteDate: "2026-09-18", seance: { statut: "Planifié", dateSeance: "2026-12-03", heureDebut: "10:00", heureFin: "12:00", lieu: "Atelier d’architecture fictif", personnesEtMoments: "Portraits individuels de l’équipe et quelques images en situation.", organisation: "Deux changements de tenue. Lumière naturelle, séance dans les espaces de travail.", livrables: "Sélection de portraits recadrés pour le site fictif de l’atelier." }, solde: "Relance 1" },
  { id: 6, email: "crm-demo-03@example.invalid", prefix: "Projet photo d’entreprise fictif pour une galerie de démonstration. Référence fictive 03.", budget: 1250, acompteDate: "2026-09-20", seance: { statut: "En retouche", dateSeance: "2026-10-22", heureDebut: "09:00", heureFin: "17:00", lieu: "Domaine fictif des Tilleuls", personnesEtMoments: "Équipe de 35 personnes, ateliers collectifs et moments informels.", organisation: "Reportage sur une journée. Point de rendez-vous fictif à l’accueil du domaine.", livrables: "Galerie numérique pour la communication interne." }, solde: "Relance 2" },
  { id: 8, email: "crm-demo-05@example.invalid", prefix: "Projet de portrait fictif pour une galerie de démonstration. Référence fictive 05.", budget: 390, acompteDate: "2026-10-01", seance: { statut: "Livré", dateSeance: "2026-10-10", heureDebut: "17:30", heureFin: "19:00", lieu: "Parc fictif des Amandiers", personnesEtMoments: "Portraits mère-fille et quelques images spontanées en extérieur.", organisation: "Séance prévue en lumière de fin de journée. Prévoir une tenue de rechange.", livrables: "Galerie numérique et deux tirages encadrés fictifs." }, solde: "Relance 3" },
  { id: 9, email: "crm-demo-06@example.invalid", prefix: "Projet photo d’entreprise fictif pour une galerie de démonstration. Référence fictive 06.", budget: 1100, acompteDate: "2026-10-04", seance: { statut: "À organiser", dateSeance: "2027-02-18", heureDebut: "18:00", heureFin: "22:00", lieu: "Salle des Verrières fictive", personnesEtMoments: "Accueil, prises de parole, photos d’équipe et portraits avant la soirée.", organisation: "Confirmer l’accès à la salle et l’ordre des prises de parole avant la date.", livrables: "Galerie numérique pour la communication de l’évènement." }, solde: "Annulée" },
] as const;

async function main() {
  const localUrl = resolveDatabaseUrl(undefined, process.cwd());
  const targetUrl = resolveDatabaseUrl(process.env.DATABASE_URL, process.cwd());
  if (targetUrl !== localUrl) throw new Error("Demo CRM data can only be written to data/local.sqlite.");

  const { client, db } = await openDatabase();
  try {
    await db.transaction(async (tx) => {
      const ready: { fixture: (typeof fixtures)[number]; contactId: number }[] = [];
      for (const fixture of fixtures) {
        const [request] = await tx.select({ id: demandes.id, contactId: demandes.contactId, email: contacts.emailNormalise, message: demandes.message, budget: demandes.budgetEur })
          .from(demandes).innerJoin(contacts, eq(demandes.contactId, contacts.id)).where(and(eq(demandes.id, fixture.id), eq(contacts.emailNormalise, fixture.email))).limit(1);
        if (!request || !request.message.startsWith(fixture.prefix) || request.budget !== fixture.budget) {
          throw new Error(`Fictional demo request ${fixture.id} differs from the reviewed fixture; no data was added.`);
        }
        const [existingClient] = await tx.select({ id: clients.id }).from(clients).where(eq(clients.contactId, request.contactId)).limit(1);
        const [existingShooting] = await tx.select({ id: shootings.id }).from(shootings).where(eq(shootings.demandeId, request.id)).limit(1);
        const [existingInvoice] = await tx.select({ id: factures.id }).from(factures).where(eq(factures.demandeId, request.id)).limit(1);
        if (existingClient || existingShooting || existingInvoice) throw new Error(`CRM demo data already exists or was changed for request ${fixture.id}; no data was added.`);
        ready.push({ fixture, contactId: request.contactId });
      }

      for (const { fixture, contactId } of ready) {
        const acompteCentimes = Math.round(fixture.budget * 0.3 * 100);
        const soldeCentimes = fixture.budget * 100 - acompteCentimes;
        const [createdClient] = await tx.insert(clients).values({ contactId }).returning({ id: clients.id });
        if (!createdClient) throw new Error(`Could not create demo client for request ${fixture.id}.`);
        await tx.insert(factures).values({ clientId: createdClient.id, demandeId: fixture.id, type: "Acompte", statut: "Payée", montantCentimes: acompteCentimes, datePaiement: fixture.acompteDate });
        await tx.insert(factures).values({ clientId: createdClient.id, demandeId: fixture.id, type: "Solde", statut: fixture.solde, montantCentimes: soldeCentimes });
        await tx.insert(shootings).values({ clientId: createdClient.id, demandeId: fixture.id, titre: `Shooting · demande #${fixture.id}`, ...fixture.seance });
      }
    });
    console.log("Added fictional CRM clients, paid deposit invoices, balance invoices and photo shooting details for five reviewed demo requests.");
  } finally { await client.close(); }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
