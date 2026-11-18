import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { clients, contacts, demandes, factures, roles, shootings, user } from "@/src/db/schema";
import { openDatabase } from "@/src/db/client";

export async function listClients() {
  const { client, db } = await openDatabase();
  try {
    return await db.select({
      id: clients.id,
      contactId: contacts.id,
      nom: contacts.nom,
      email: contacts.email,
      createdAt: clients.createdAt,
    }).from(clients).innerJoin(contacts, eq(clients.contactId, contacts.id)).orderBy(desc(clients.createdAt), desc(clients.id));
  } finally { await client.close(); }
}

export async function getClient(id: number) {
  const { client, db } = await openDatabase();
  try {
    const [record] = await db.select({
      id: clients.id,
      contactId: contacts.id,
      nom: contacts.nom,
      email: contacts.email,
      createdAt: clients.createdAt,
    }).from(clients).innerJoin(contacts, eq(clients.contactId, contacts.id)).where(eq(clients.id, id)).limit(1);
    if (!record) return undefined;
    const requests = await db.select({
      id: demandes.id,
      typeSeance: demandes.typeSeance,
      statut: demandes.statut,
      dateSouhaitee: demandes.dateSouhaitee,
      budgetEur: demandes.budgetEur,
      createdAt: demandes.createdAt,
    }).from(demandes).where(eq(demandes.contactId, record.contactId)).orderBy(desc(demandes.createdAt), desc(demandes.id));
    const [clientShootings, clientInvoices] = await Promise.all([
      db.select({ id: shootings.id, demandeId: shootings.demandeId, titre: shootings.titre, statut: shootings.statut, dateSeance: shootings.dateSeance, heureDebut: shootings.heureDebut, lieu: shootings.lieu })
        .from(shootings).where(eq(shootings.clientId, record.id)).orderBy(desc(shootings.dateSeance), desc(shootings.id)),
      db.select({ id: factures.id, demandeId: factures.demandeId, type: factures.type, statut: factures.statut, montantCentimes: factures.montantCentimes, dateEmission: factures.dateEmission })
        .from(factures).where(eq(factures.clientId, record.id)).orderBy(desc(factures.createdAt), desc(factures.id)),
    ]);
    return { ...record, demandes: requests, shootings: clientShootings, factures: clientInvoices };
  } finally { await client.close(); }
}

export async function listShootings() {
  const { client, db } = await openDatabase();
  try {
    return await db.select({
      id: shootings.id,
      titre: shootings.titre,
      demandeId: demandes.id,
      clientId: clients.id,
      contactNom: contacts.nom,
      contactEmail: contacts.email,
      typeSeance: demandes.typeSeance,
      statut: shootings.statut,
      dateSeance: shootings.dateSeance,
      heureDebut: shootings.heureDebut,
      lieu: shootings.lieu,
      organisation: shootings.organisation,
    }).from(shootings).innerJoin(clients, eq(shootings.clientId, clients.id)).innerJoin(contacts, eq(clients.contactId, contacts.id)).leftJoin(demandes, eq(shootings.demandeId, demandes.id)).orderBy(desc(shootings.dateSeance), desc(shootings.id));
  } finally { await client.close(); }
}

export async function getShooting(id: number) {
  const { client, db } = await openDatabase();
  try {
    const [record] = await db.select({
      id: shootings.id,
      titre: shootings.titre,
      demandeId: demandes.id,
      clientId: clients.id,
      contactNom: contacts.nom,
      contactEmail: contacts.email,
      typeSeance: demandes.typeSeance,
      statut: shootings.statut,
      dateSeance: shootings.dateSeance,
      heureDebut: shootings.heureDebut,
      heureFin: shootings.heureFin,
      lieu: shootings.lieu,
      personnesEtMoments: shootings.personnesEtMoments,
      organisation: shootings.organisation,
      livrables: shootings.livrables,
    }).from(shootings).innerJoin(clients, eq(shootings.clientId, clients.id)).innerJoin(contacts, eq(clients.contactId, contacts.id)).leftJoin(demandes, eq(shootings.demandeId, demandes.id)).where(eq(shootings.id, id)).limit(1);
    return record;
  } finally { await client.close(); }
}

export async function listFactures() {
  const { client, db } = await openDatabase();
  try {
    const invoiceContacts = alias(contacts, "invoice_contacts");
    const requestContacts = alias(contacts, "request_contacts");
    return await db.select({
      id: factures.id,
      clientId: clients.id,
      demandeId: demandes.id,
      contactNom: sql<string>`coalesce(${invoiceContacts.nom}, ${requestContacts.nom})`,
      contactEmail: sql<string>`coalesce(${invoiceContacts.email}, ${requestContacts.email})`,
      typeSeance: demandes.typeSeance,
      type: factures.type,
      statut: factures.statut,
      montantCentimes: factures.montantCentimes,
      dateEmission: factures.dateEmission,
      datePaiement: factures.datePaiement,
    }).from(factures).leftJoin(clients, eq(factures.clientId, clients.id)).leftJoin(invoiceContacts, eq(clients.contactId, invoiceContacts.id)).leftJoin(demandes, eq(factures.demandeId, demandes.id)).leftJoin(requestContacts, eq(demandes.contactId, requestContacts.id)).orderBy(desc(factures.createdAt), desc(factures.id));
  } finally { await client.close(); }
}

export async function getFacturesForDemande(demandeId: number) {
  const { client, db } = await openDatabase();
  try {
    return await db.select({
      id: factures.id,
      clientId: factures.clientId,
      demandeId: factures.demandeId,
      type: factures.type,
      statut: factures.statut,
      montantCentimes: factures.montantCentimes,
      dateEmission: factures.dateEmission,
      datePaiement: factures.datePaiement,
    }).from(factures).where(eq(factures.demandeId, demandeId)).orderBy(desc(factures.createdAt), desc(factures.id));
  } finally { await client.close(); }
}

export async function listUsersAndRoles() {
  const { client, db } = await openDatabase();
  try {
    const [users, roleList] = await Promise.all([
      db.select({ id: user.id, nom: user.name, email: user.email, role: user.role }).from(user).orderBy(user.name, user.email),
      db.select({ id: roles.id, nom: roles.nom, accesCrm: roles.accesCrm, roleSysteme: roles.roleSysteme }).from(roles).orderBy(roles.nom),
    ]);
    return { users, roles: roleList };
  } finally { await client.close(); }
}
