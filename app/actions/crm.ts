"use server";

import { and, count, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { openDatabase } from "@/src/db/client";
import { clients, contacts, demandes, factures, roles, shootings, user } from "@/src/db/schema";
import { ETATS_FACTURE, STATUTS_SHOOTING, TYPES_FACTURE } from "@/src/demandes/constants";
import type { EtatFacture, StatutShooting, TypeFacture } from "@/src/demandes/constants";
import { requireAdministrator, requireManager } from "@/src/auth/server";

const value = (formData: FormData, key: string) => {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
};

function safeId(raw: string): number {
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
}

function validDate(raw: string): boolean {
  if (!raw) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const [year, month, day] = raw.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export async function createFacture(formData: FormData): Promise<void> {
  await requireManager();
  const demandeId = safeId(value(formData, "demande_id"));
  const type = value(formData, "type");
  const montantRaw = value(formData, "montant_eur");
  const amount = Number(montantRaw);
  if (!Number.isSafeInteger(demandeId) || !(TYPES_FACTURE as readonly string[]).includes(type) || !/^\d+(\.\d{1,2})?$/.test(montantRaw) || !Number.isFinite(amount) || amount <= 0 || Math.round(amount * 100) > 2_000_000_000) redirect("/crm/factures");

  const { client, db } = await openDatabase();
  try {
    const [request] = await db.select({ id: demandes.id, clientId: clients.id }).from(demandes)
      .leftJoin(clients, eq(clients.contactId, demandes.contactId)).where(eq(demandes.id, demandeId)).limit(1);
    if (!request) redirect("/crm/demandes");
    await db.insert(factures).values({ clientId: request.clientId, demandeId, type: type as TypeFacture, statut: "Envoyée", montantCentimes: Math.round(amount * 100) });
  } finally { await client.close(); }
  revalidatePath("/crm/factures");
  revalidatePath(`/crm/${demandeId}`);
}

export async function updateFactureStatus(formData: FormData): Promise<void> {
  await requireManager();
  const id = safeId(value(formData, "facture_id"));
  const status = value(formData, "statut");
  if (!Number.isSafeInteger(id) || !(ETATS_FACTURE as readonly string[]).includes(status)) redirect("/crm/factures");

  const { client, db } = await openDatabase();
  try {
    await db.transaction(async (tx) => {
      const [invoice] = await tx.select({ id: factures.id, demandeId: factures.demandeId, clientId: factures.clientId, type: factures.type }).from(factures).where(eq(factures.id, id)).limit(1);
      if (!invoice) throw new Error("Facture introuvable.");
      await tx.update(factures).set({
        statut: status as EtatFacture,
        ...(status === "Payée" ? { datePaiement: sql`CURRENT_DATE` } : {}),
      }).where(eq(factures.id, id));

      if (invoice.type === "Acompte" && status === "Payée" && invoice.demandeId !== null) {
        const [request] = await tx.select({ contactId: demandes.contactId, nom: contacts.nom }).from(demandes)
          .innerJoin(contacts, eq(demandes.contactId, contacts.id)).where(eq(demandes.id, invoice.demandeId)).limit(1);
        if (!request) throw new Error("Demande liée introuvable.");
        await tx.insert(clients).values({ contactId: request.contactId }).onConflictDoNothing({ target: clients.contactId });
        const [createdClient] = await tx.select({ id: clients.id }).from(clients).where(eq(clients.contactId, request.contactId)).limit(1);
        if (!createdClient) throw new Error("Le client associé à la demande n’a pas pu être résolu.");
        await tx.update(factures).set({ clientId: createdClient.id }).where(eq(factures.demandeId, invoice.demandeId));
        await tx.insert(shootings).values({ clientId: createdClient.id, demandeId: invoice.demandeId, titre: `Shooting lié à la demande #${invoice.demandeId}` }).onConflictDoNothing({ target: shootings.demandeId });
      }
    });
  } finally { await client.close(); }
  revalidatePath("/crm");
  revalidatePath("/crm/clients");
  revalidatePath("/crm/shootings");
  revalidatePath("/crm/factures");
}

export async function updateShooting(formData: FormData): Promise<void> {
  await requireManager();
  const id = safeId(value(formData, "shooting_id"));
  const statut = value(formData, "statut");
  const titre = value(formData, "titre");
  const date = value(formData, "date_seance");
  const heureDebut = value(formData, "heure_debut");
  const heureFin = value(formData, "heure_fin");
  const lieu = value(formData, "lieu");
  const personnesEtMoments = value(formData, "personnes_et_moments");
  const organisation = value(formData, "organisation");
  const livrables = value(formData, "livrables");
  const validTime = (time: string) => !time || /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  if (!Number.isSafeInteger(id) || titre.length < 2 || titre.length > 120 || !(STATUTS_SHOOTING as readonly string[]).includes(statut) || !validDate(date) || !validTime(heureDebut) || !validTime(heureFin) || lieu.length > 300 || personnesEtMoments.length > 3000 || organisation.length > 3000 || livrables.length > 3000) redirect("/crm/shootings");
  const { client, db } = await openDatabase();
  try {
    await db.update(shootings).set({
      titre,
      statut: statut as StatutShooting,
      dateSeance: date || null,
      heureDebut: heureDebut || null,
      heureFin: heureFin || null,
      lieu: lieu || null,
      personnesEtMoments: personnesEtMoments || null,
      organisation: organisation || null,
      livrables: livrables || null,
    }).where(eq(shootings.id, id));
  } finally { await client.close(); }
  revalidatePath("/crm/shootings");
  revalidatePath(`/crm/shootings/${id}`);
}

export async function createShootingForClient(formData: FormData): Promise<void> {
  await requireManager();
  const clientId = safeId(value(formData, "client_id"));
  const demandeRaw = value(formData, "demande_id");
  const demandeId = demandeRaw ? safeId(demandeRaw) : null;
  const titre = value(formData, "titre");
  const statut = value(formData, "statut");
  const date = value(formData, "date_seance");
  const heureDebut = value(formData, "heure_debut");
  const heureFin = value(formData, "heure_fin");
  const lieu = value(formData, "lieu");
  const personnesEtMoments = value(formData, "personnes_et_moments");
  const organisation = value(formData, "organisation");
  const livrables = value(formData, "livrables");
  const validTime = (time: string) => !time || /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  if (!Number.isSafeInteger(clientId) || (demandeId !== null && !Number.isSafeInteger(demandeId)) || titre.length < 2 || titre.length > 120 || !(STATUTS_SHOOTING as readonly string[]).includes(statut) || !validDate(date) || !validTime(heureDebut) || !validTime(heureFin) || lieu.length > 300 || personnesEtMoments.length > 3000 || organisation.length > 3000 || livrables.length > 3000) redirect(`/crm/clients/${clientId}`);
  const { client, db } = await openDatabase();
  try {
    await db.transaction(async (tx) => {
      const [owner] = await tx.select({ contactId: clients.contactId }).from(clients).where(eq(clients.id, clientId)).limit(1);
      if (!owner) throw new Error("Client introuvable.");
      if (demandeId !== null) {
        const [request] = await tx.select({ id: demandes.id }).from(demandes).where(and(eq(demandes.id, demandeId), eq(demandes.contactId, owner.contactId))).limit(1);
        if (!request) throw new Error("La demande n’appartient pas à ce client.");
      }
      await tx.insert(shootings).values({
        clientId,
        demandeId,
        titre,
        statut: statut as StatutShooting,
        dateSeance: date || null,
        heureDebut: heureDebut || null,
        heureFin: heureFin || null,
        lieu: lieu || null,
        personnesEtMoments: personnesEtMoments || null,
        organisation: organisation || null,
        livrables: livrables || null,
      });
    });
  } catch {
    redirect(`/crm/clients/${clientId}?shooting=erreur`);
  } finally { await client.close(); }
  revalidatePath(`/crm/clients/${clientId}`);
  revalidatePath("/crm/shootings");
}

export async function createFactureForClient(formData: FormData): Promise<void> {
  await requireManager();
  const clientId = safeId(value(formData, "client_id"));
  const demandeRaw = value(formData, "demande_id");
  const demandeId = demandeRaw ? safeId(demandeRaw) : null;
  const type = value(formData, "type");
  const montantRaw = value(formData, "montant_eur");
  const amount = Number(montantRaw);
  if (!Number.isSafeInteger(clientId) || (demandeId !== null && !Number.isSafeInteger(demandeId)) || !(TYPES_FACTURE as readonly string[]).includes(type) || !/^\d+(\.\d{1,2})?$/.test(montantRaw) || !Number.isFinite(amount) || amount <= 0 || Math.round(amount * 100) > 2_000_000_000) redirect(`/crm/clients/${clientId}`);
  const { client, db } = await openDatabase();
  try {
    await db.transaction(async (tx) => {
      const [owner] = await tx.select({ contactId: clients.contactId }).from(clients).where(eq(clients.id, clientId)).limit(1);
      if (!owner) throw new Error("Client introuvable.");
      if (demandeId !== null) {
        const [request] = await tx.select({ id: demandes.id }).from(demandes).where(and(eq(demandes.id, demandeId), eq(demandes.contactId, owner.contactId))).limit(1);
        if (!request) throw new Error("La demande n’appartient pas à ce client.");
      }
      await tx.insert(factures).values({ clientId, demandeId, type: type as TypeFacture, statut: "Envoyée", montantCentimes: Math.round(amount * 100) });
    });
  } catch {
    redirect(`/crm/clients/${clientId}?facture=erreur`);
  } finally { await client.close(); }
  revalidatePath(`/crm/clients/${clientId}`);
  revalidatePath("/crm/factures");
}

export async function assignDemandeClient(formData: FormData): Promise<void> {
  await requireManager();
  const demandeId = safeId(value(formData, "demande_id"));
  const clientId = safeId(value(formData, "client_id"));
  if (!Number.isSafeInteger(demandeId) || !Number.isSafeInteger(clientId)) redirect("/crm/demandes");
  const { client, db } = await openDatabase();
  try {
    await db.transaction(async (tx) => {
      const [record] = await tx.select({ contactId: clients.contactId }).from(clients).where(eq(clients.id, clientId)).limit(1);
      if (!record) throw new Error("Client introuvable.");
      const [relatedInvoice] = await tx.select({ id: factures.id }).from(factures).where(eq(factures.demandeId, demandeId)).limit(1);
      const [relatedShooting] = await tx.select({ id: shootings.id }).from(shootings).where(eq(shootings.demandeId, demandeId)).limit(1);
      if (relatedInvoice || relatedShooting) throw new Error("Une demande avec une facture ou un shooting lié ne peut pas changer de client.");
      await tx.update(demandes).set({ contactId: record.contactId }).where(eq(demandes.id, demandeId));
    });
  } catch {
    redirect(`/crm/${demandeId}?client=verrouille`);
  } finally { await client.close(); }
  revalidatePath("/crm/demandes");
  revalidatePath(`/crm/${demandeId}`);
  revalidatePath("/crm/clients");
  redirect(`/crm/${demandeId}?client=attribue`);
}

export async function createRole(formData: FormData): Promise<void> {
  await requireAdministrator();
  const nom = value(formData, "nom");
  const id = nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const accesCrm = formData.get("acces_crm") === "on";
  if (nom.length < 2 || nom.length > 60 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id === "admin" || id === "user") redirect("/crm/utilisateurs?role=erreur");
  const { client, db } = await openDatabase();
  try { await db.insert(roles).values({ id, nom, accesCrm, roleSysteme: false }); }
  catch { redirect("/crm/utilisateurs?role=existe"); }
  finally { await client.close(); }
  revalidatePath("/crm/utilisateurs");
}

export async function updateRole(formData: FormData): Promise<void> {
  await requireAdministrator();
  const roleId = value(formData, "role_id");
  const nom = value(formData, "nom");
  const accesCrm = formData.get("acces_crm") === "on";
  if (!roleId || roleId === "admin" || roleId === "user" || nom.length < 2 || nom.length > 60) redirect("/crm/utilisateurs?role=erreur");
  const { client, db } = await openDatabase();
  try {
    await db.update(roles).set({ nom, accesCrm }).where(and(eq(roles.id, roleId), eq(roles.roleSysteme, false)));
  } catch { redirect("/crm/utilisateurs?role=existe"); }
  finally { await client.close(); }
  revalidatePath("/crm/utilisateurs");
}

export async function deleteRole(formData: FormData): Promise<void> {
  await requireAdministrator();
  const roleId = value(formData, "role_id");
  if (!roleId || roleId === "admin" || roleId === "user") redirect("/crm/utilisateurs");
  const { client, db } = await openDatabase();
  try {
    const [role] = await db.select({ id: roles.id, roleSysteme: roles.roleSysteme }).from(roles).where(eq(roles.id, roleId)).limit(1);
    if (!role || role.roleSysteme) redirect("/crm/utilisateurs");
    const [assigned] = await db.select({ total: count() }).from(user).where(eq(user.role, roleId));
    if ((assigned?.total ?? 0) > 0) redirect("/crm/utilisateurs?role=attribue");
    await db.delete(roles).where(and(eq(roles.id, roleId), eq(roles.roleSysteme, false)));
  } finally { await client.close(); }
  revalidatePath("/crm/utilisateurs");
}

export async function assignUserRole(formData: FormData): Promise<void> {
  const session = await requireAdministrator();
  const userId = value(formData, "user_id");
  const roleId = value(formData, "role_id");
  if (!userId || !roleId) redirect("/crm/utilisateurs");
  const { client, db } = await openDatabase();
  try {
    const [role] = await db.select({ id: roles.id }).from(roles).where(eq(roles.id, roleId)).limit(1);
    const [target] = await db.select({ id: user.id, role: user.role }).from(user).where(eq(user.id, userId)).limit(1);
    if (!role || !target) redirect("/crm/utilisateurs?utilisateur=introuvable");
    if (userId === session.user.id && target.role === "admin" && roleId !== "admin") {
      const [admins] = await db.select({ total: count() }).from(user).where(eq(user.role, "admin"));
      if ((admins?.total ?? 0) <= 1) redirect("/crm/utilisateurs?admin=dernier");
    }
    await db.update(user).set({ role: roleId }).where(eq(user.id, userId));
  } finally { await client.close(); }
  revalidatePath("/crm/utilisateurs");
}
