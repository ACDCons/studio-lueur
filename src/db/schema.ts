import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
  AUTEURS_ECHANGE,
  ETATS_FACTURE,
  TYPES_FACTURE,
  STATUTS_SHOOTING,
  RAISONS_REFUS,
  STATUTS_CONTACT,
  STATUTS_DEMANDE,
  STATUTS_DEMANDE_STOCKES,
  TYPES_SEANCE,
} from "../demandes/constants";

export * from "./auth-schema";

export const typesSeance = TYPES_SEANCE;
export const statutsDemande = STATUTS_DEMANDE;
export const statutsContact = STATUTS_CONTACT;
export const raisonsRefus = RAISONS_REFUS;
export const auteursEchange = AUTEURS_ECHANGE;
export const typesFacture = TYPES_FACTURE;
export const etatsFacture = ETATS_FACTURE;
export const statutsShooting = STATUTS_SHOOTING;

export const contacts = sqliteTable(
  "contacts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nom: text("nom").notNull(),
    email: text("email").notNull(),
    emailNormalise: text("email_normalise").notNull(),
    statutContact: text("statut_contact", { enum: STATUTS_CONTACT }).notNull().default("Lead"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("contacts_email_normalise_unique").on(table.emailNormalise),
    check("contacts_statut_check", sql`${table.statutContact} in ('Lead', 'Client', 'KO', 'HS', 'Toxique')`),
  ],
);

export const clients = sqliteTable(
  "clients",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    contactId: integer("contact_id").notNull().unique().references(() => contacts.id, { onDelete: "restrict" }),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("clients_contact_id_idx").on(table.contactId)],
);

export const roles = sqliteTable(
  "roles",
  {
    id: text("id").primaryKey(),
    nom: text("nom").notNull().unique(),
    accesCrm: integer("acces_crm", { mode: "boolean" }).notNull().default(false),
    roleSysteme: integer("role_systeme", { mode: "boolean" }).notNull().default(false),
  },
);

export const demandes = sqliteTable(
  "demandes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    contactId: integer("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "restrict" }),
    typeSeance: text("type_seance", { enum: TYPES_SEANCE }).notNull(),
    dateSouhaitee: text("date_souhaitee"),
    dateShootingValidee: text("date_shooting_validee"),
    message: text("message").notNull(),
    statut: text("statut", { enum: STATUTS_DEMANDE_STOCKES }).notNull().default("Nouveau"),
    note: text("note"),
    prochaineAction: text("prochaine_action"),
    budgetEur: integer("budget_eur"),
    raisonRefus: text("raison_refus", { enum: RAISONS_REFUS }),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    check(
      "demandes_type_seance_check",
      sql`${table.typeSeance} in ('Mariage', 'Portrait', 'Entreprise')`,
    ),
    check(
      "demandes_statut_check",
      sql`${table.statut} in ('Nouveau', 'En Discussion', 'Acompte versé', 'Shooting proche', 'Retouche en cours', 'Livrée', 'Payée', 'Refusée', 'Annulée', 'Client (historique)')`,
    ),
    check(
      "demandes_raison_refus_check",
      sql`${table.raisonRefus} is null or ${table.raisonRefus} in ('Hors budget', 'Pas de réponse', 'Toxique')`,
    ),
    check("demandes_budget_check", sql`${table.budgetEur} is null or ${table.budgetEur} >= 0`),
    index("demandes_contact_id_idx").on(table.contactId),
    index("demandes_statut_idx").on(table.statut),
  ],
);

export const shootings = sqliteTable(
  "shootings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clientId: integer("client_id").notNull().references(() => clients.id, { onDelete: "restrict" }),
    demandeId: integer("demande_id").unique().references(() => demandes.id, { onDelete: "restrict" }),
    titre: text("titre").notNull(),
    statut: text("statut", { enum: STATUTS_SHOOTING }).notNull().default("À organiser"),
    dateSeance: text("date_seance"),
    heureDebut: text("heure_debut"),
    heureFin: text("heure_fin"),
    lieu: text("lieu"),
    personnesEtMoments: text("personnes_et_moments"),
    organisation: text("organisation"),
    livrables: text("livrables"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    check("shootings_statut_check", sql`${table.statut} in ('À organiser', 'Planifié', 'Réalisé', 'En retouche', 'Livré', 'Annulé')`),
    index("shootings_statut_idx").on(table.statut),
    index("shootings_date_idx").on(table.dateSeance),
    index("shootings_client_id_idx").on(table.clientId),
  ],
);

export const factures = sqliteTable(
  "factures",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clientId: integer("client_id").references(() => clients.id, { onDelete: "restrict" }),
    demandeId: integer("demande_id").references(() => demandes.id, { onDelete: "restrict" }),
    type: text("type", { enum: TYPES_FACTURE }).notNull(),
    statut: text("statut", { enum: ETATS_FACTURE }).notNull().default("Envoyée"),
    montantCentimes: integer("montant_centimes").notNull(),
    dateEmission: text("date_emission").notNull().default(sql`CURRENT_TIMESTAMP`),
    datePaiement: text("date_paiement"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    check("factures_type_check", sql`${table.type} in ('Acompte', 'Solde')`),
    check("factures_statut_check", sql`${table.statut} in ('Envoyée', 'Relance 1', 'Relance 2', 'Relance 3', 'Payée', 'Annulée')`),
    check("factures_montant_check", sql`${table.montantCentimes} >= 0`),
    check("factures_lien_check", sql`${table.clientId} is not null or ${table.demandeId} is not null`),
    index("factures_demande_idx").on(table.demandeId),
    index("factures_client_idx").on(table.clientId),
    index("factures_statut_idx").on(table.statut),
  ],
);

export const echanges = sqliteTable(
  "echanges",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    demandeId: integer("demande_id")
      .notNull()
      .references(() => demandes.id, { onDelete: "cascade" }),
    auteur: text("auteur", { enum: AUTEURS_ECHANGE }).notNull(),
    contenu: text("contenu").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    check("echanges_auteur_check", sql`${table.auteur} in ('Client', 'Studio')`),
    index("echanges_demande_date_idx").on(table.demandeId, table.createdAt),
  ],
);
