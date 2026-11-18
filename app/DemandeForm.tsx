"use client";

import { useActionState } from "react";
import { submitPublicDemande } from "./actions/demandes";
import RequestFields from "./components/RequestFields";
import { emptyRequestFormState } from "@/src/demandes/form-types";

export default function DemandeForm() {
  const [state, formAction, isPending] = useActionState(submitPublicDemande, emptyRequestFormState);

  return (
    <form action={formAction}>
      <RequestFields idPrefix="public" values={state.values} errors={state.errors} />
      <button type="submit" disabled={isPending}>{isPending ? "Envoi…" : "Envoyer la demande"}</button>
      <p className="demo-note">Exercice local : utilise uniquement des données fictives pour le moment.</p>
      <p className="demo-note">Votre nom et votre e-mail serviront uniquement à répondre à votre demande. La durée de conservation reste à confirmer.</p>
      <p className="demo-note" role={state.status === "error" ? "alert" : "status"} aria-live="polite">
        {state.message || "Merci de renseigner les champs obligatoires."}
      </p>
    </form>
  );
}
