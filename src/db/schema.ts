import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { STATUTS_DEMANDE, TYPES_SEANCE } from "../demandes/constants";

export * from "./auth-schema";

export const typesSeance = TYPES_SEANCE;
export const statutsDemande = STATUTS_DEMANDE;

export const contacts = sqliteTable(
  "contacts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nom: text("nom").notNull(),
    email: text("email").notNull(),
    emailNormalise: text("email_normalise").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("contacts_email_normalise_unique").on(table.emailNormalise)],
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
    message: text("message").notNull(),
    statut: text("statut", { enum: STATUTS_DEMANDE }).notNull().default("Nouveau"),
    note: text("note"),
    prochaineAction: text("prochaine_action"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    check(
      "demandes_type_seance_check",
      sql`${table.typeSeance} in ('Mariage', 'Portrait', 'Entreprise')`,
    ),
    check(
      "demandes_statut_check",
      sql`${table.statut} in ('Nouveau', 'En discussion', 'Client', 'Perdu')`,
    ),
    index("demandes_contact_id_idx").on(table.contactId),
    index("demandes_statut_idx").on(table.statut),
  ],
);
