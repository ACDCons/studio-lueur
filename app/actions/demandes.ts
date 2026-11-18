"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { contacts, demandes } from "@/src/db/schema";
import { openDatabase } from "@/src/db/client";
import { requireManager } from "@/src/auth/server";
import {
  validateEditRequest,
  validateNewRequest,
} from "@/src/demandes/validation";
import type { EditFormState, RequestFormState } from "@/src/demandes/form-types";
import type { StatutDemande, TypeSeance } from "@/src/demandes/constants";

async function persistRequest(values: ReturnType<typeof validateNewRequest>["values"]) {
  const { client, db } = await openDatabase();
  const emailNormalise = values.email.trim().toLowerCase();

  try {
    await db.transaction(async (tx) => {
      const [existingContact] = await tx
        .select({ id: contacts.id })
        .from(contacts)
        .where(eq(contacts.emailNormalise, emailNormalise))
        .limit(1);

      let contactId = existingContact?.id;

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
  if (hasErrors(errors)) {
    return { status: "error", message: "Vérifie les champs indiqués.", values, errors };
  }

  try {
    await persistRequest(values);
    revalidatePath("/crm");
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
        message: values.message,
        statut: values.statut as StatutDemande,
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

export async function deleteDemande(formData: FormData): Promise<void> {
  await requireManager();
  const rawId = formData.get("demande_id");
  const id = typeof rawId === "string" ? Number(rawId) : Number.NaN;
  if (!Number.isSafeInteger(id) || id < 1) redirect("/crm");

  const { client, db } = await openDatabase();
  try {
    await db.delete(demandes).where(eq(demandes.id, id));
  } finally {
    await client.close();
  }

  revalidatePath("/crm");
  redirect("/crm");
}
