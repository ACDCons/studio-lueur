"use client";

import { useActionState } from "react";
import { addInternalDemande } from "@/app/actions/demandes";
import RequestFields from "@/app/components/RequestFields";
import { emptyRequestFormState } from "@/src/demandes/form-types";

export default function NewDemandeForm() {
  const [state, formAction, isPending] = useActionState(addInternalDemande, emptyRequestFormState);

  return (
    <form action={formAction}>
      <RequestFields idPrefix="internal" values={state.values} errors={state.errors} />
      <button type="submit" disabled={isPending}>{isPending ? "Ajout…" : "Ajouter la demande"}</button>
      {state.message && (
        <p className={state.status === "error" ? "form-error" : "demo-note"} role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      )}
    </form>
  );
}
