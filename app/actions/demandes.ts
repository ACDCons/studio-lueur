"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clients, contacts, demandes, echanges, factures, shootings } from "@/src/db/schema";
import { openDatabase } from "@/src/db/client";
import { requireManager } from "@/src/auth/server";
import {
  validateEditRequest,
  validateNewRequest,
} from "@/src/demandes/validation";
import type { EditFormState, RequestFormState } from "@/src/demandes/form-types";
import { AUTEURS_ECHANGE, STATUTS_CONTACT } from "@/src/demandes/constants";
import type { AuteurEchange, StatutContact, StatutDemande, TypeSeance } from "@/src/demandes/constants";

async function persistRequest(values: ReturnType<typeof validateNewRequest>["values"], clientId?: number) {
  const { client, db } = await openDatabase();
  const emailNormalise = values.email.trim().toLowerCase();

  try {
    await db.transaction(async (tx) => {
      let contactId: number | undefined;
      if (clientId) {
        const [clientRecord] = await tx.select({ contactId: clients.contactId }).from(clients).where(eq(clients.id, clientId)).limit(1);
        contactId = clientRecord?.contactId;
        if (!contactId) throw new Error("Client could not be resolved.");
      } else {
        const [existingContact] = await tx
          .select({ id: contacts.id })
          .from(contacts)
          .where(eq(contacts.emailNormalise, emailNormalise))
          .limit(1);

        contactId = existingContact?.id;
      }

      if (!contactId) {
        const [insertedContact] = await tx
          .insert(contacts)
          .values({
            nom: values.nom,
            email: values.email,
            emailNormalise,
          })
          .onConflictDoNothing({ target: contacts.emailNormalise })
          .returning({ id: contacts.id });

        contactId = insertedContact?.id;

        if (!contactId) {
          const [contactAfterConflict] = await tx
            .select({ id: contacts.id })
            .from(contacts)
            .where(eq(contacts.emailNormalise, emailNormalise))
            .limit(1);
          contactId = contactAfterConflict?.id;
        }
      }

      if (!contactId) throw new Error("Contact could not be resolved.");

      await tx.insert(demandes).values({
        contactId,
        typeSeance: values.type_seance as TypeSeance,
        dateSouhaitee: values.date_souhaitee || null,
        message: values.message,
      });
    });
  } finally {
    await client.close();
  }
}

function hasErrors(errors: object): boolean {
  return Object.values(errors).some((message) => typeof message === "string" && message.length > 0);
}

export async function submitPublicDemande(
  _previousState: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  const { values, errors } = validateNewRequest(formData);
  if (hasErrors(errors)) {
    return { status: "error", message: "Vérifie les champs indiqués.", values, errors };
  }

  try {
    await persistRequest(values);
    revalidatePath("/crm");
    return {
      status: "success",
      message: "Votre demande a bien été enregistrée.",
      values: { nom: "", email: "", type_seance: "", date_souhaitee: "", message: "" },
      errors: {},
    };
  } catch {
    return {
      status: "error",
      message: "La demande n’a pas pu être enregistrée. Réessaie plus tard.",
      values,
      errors: {},
    };
  }
}

export async function addInternalDemande(
  _previousState: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  await requireManager();
  const { values, errors } = validateNewRequest(formData);
  const rawClientId = formData.get("client_id");
  const clientId = typeof rawClientId === "string" && rawClientId ? Number(rawClientId) : undefined;
  if (clientId !== undefined && (!Number.isSafeInteger(clientId) || clientId < 1)) {
    return { status: "error", message: "Choisis un client valide.", values, errors: {} };
  }
  if (hasErrors(errors)) {
    return { status: "error", message: "Vérifie les champs indiqués.", values, errors };
  }

  try {
    await persistRequest(values, clientId);
    revalidatePath("/crm");
    revalidatePath("/crm/clients");
    return {
      status: "success",
      message: "La demande a été ajoutée.",
      values: { nom: "", email: "", type_seance: "", date_souhaitee: "", message: "" },
      errors: {},
    };
  } catch {
    return {
      status: "error",
      message: "La demande n’a pas pu être ajoutée. Réessaie.",
      values,
      errors: {},
    };
  }
}

export async function updateDemande(
  _previousState: EditFormState,
  formData: FormData,
): Promise<EditFormState> {
  await requireManager();
  const { values, errors } = validateEditRequest(formData);
  if (hasErrors(errors)) {
    return { status: "error", message: "Vérifie les champs indiqués.", values, errors };
  }

  const id = Number(values.id);
  const { client, db } = await openDatabase();

  try {
    const [updated] = await db
      .update(demandes)
      .set({
        typeSeance: values.type_seance as TypeSeance,
        dateSouhaitee: values.date_souhaitee || null,
        dateShootingValidee: values.date_shooting_validee || null,
        message: values.message,
        statut: values.statut as StatutDemande,
        raisonRefus: values.raison_refus ? values.raison_refus as "Hors budget" | "Pas de réponse" | "Toxique" : null,
        budgetEur: values.budget_eur ? Number(values.budget_eur) : null,
        note: values.note || null,
        prochaineAction: values.prochaine_action || null,
      })
      .where(eq(demandes.id, id))
      .returning({ id: demandes.id });

    if (!updated) {
      return { status: "error", message: "Cette demande n’existe plus.", values, errors: {} };
    }

    revalidatePath("/crm");
    revalidatePath(`/crm/${id}`);
    return { status: "success", message: "Les modifications ont été enregistrées.", values, errors: {} };
  } catch {
    return { status: "error", message: "La demande n’a pas pu être modifiée.", values, errors: {} };
  } finally {
    await client.close();
  }
}

export async function updateContactStatus(formData: FormData): Promise<void> {
  await requireManager();
  const rawContactId = formData.get("contact_id");
  const rawStatus = formData.get("statut_contact");
  const contactId = typeof rawContactId === "string" ? Number(rawContactId) : Number.NaN;
  const status = typeof rawStatus === "string" ? rawStatus : "";
  if (!Number.isSafeInteger(contactId) || contactId < 1) redirect("/crm");
  if (!(STATUTS_CONTACT as readonly string[]).includes(status)) redirect("/crm/demandes");

  const { client, db } = await openDatabase();
  try {
    const [clientRecord] = await db.select({ id: clients.id }).from(clients).where(eq(clients.contactId, contactId)).limit(1);
    if (clientRecord) redirect("/crm/clients");
    await db.update(contacts).set({ statutContact: status as StatutContact }).where(eq(contacts.id, contactId));
  } finally {
    await client.close();
  }
  revalidatePath("/crm");
  revalidatePath("/crm", "layout");
}

export async function addExchange(formData: FormData): Promise<void> {
  await requireManager();
  const rawId = formData.get("demande_id");
  const rawAuthor = formData.get("auteur");
  const rawContent = formData.get("contenu");
  const id = typeof rawId === "string" ? Number(rawId) : Number.NaN;
  const author = typeof rawAuthor === "string" ? rawAuthor : "";
  const content = typeof rawContent === "string" ? rawContent.trim() : "";
  if (!Number.isSafeInteger(id) || id < 1) redirect("/crm/demandes");
  if (!(AUTEURS_ECHANGE as readonly string[]).includes(author) || !content || content.length > 5000) {
    redirect(`/crm/${id}?echange=erreur`);
  }

  const { client, db } = await openDatabase();
  try {
    const [request] = await db.select({ id: demandes.id }).from(demandes).where(eq(demandes.id, id)).limit(1);
    if (!request) redirect("/crm/demandes");
    await db.insert(echanges).values({ demandeId: id, auteur: author as AuteurEchange, contenu: content });
  } finally {
    await client.close();
  }
  revalidatePath(`/crm/${id}`);
}

export async function deleteDemande(formData: FormData): Promise<void> {
  await requireManager();
  const rawId = formData.get("demande_id");
  const id = typeof rawId === "string" ? Number(rawId) : Number.NaN;
  if (!Number.isSafeInteger(id) || id < 1) redirect("/crm");

  const { client, db } = await openDatabase();
  try {
    const [invoice] = await db.select({ id: factures.id }).from(factures).where(eq(factures.demandeId, id)).limit(1);
    const [shooting] = await db.select({ id: shootings.id }).from(shootings).where(eq(shootings.demandeId, id)).limit(1);
    if (invoice || shooting) redirect(`/crm/${id}?suppression=liee`);
    await db.delete(demandes).where(eq(demandes.id, id));
  } finally {
    await client.close();
  }

  revalidatePath("/crm");
  redirect("/crm");
}
