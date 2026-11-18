"use client";

import { useActionState } from "react";
import { addInternalDemande } from "@/app/actions/demandes";
import RequestFields from "@/app/components/RequestFields";
import { emptyRequestFormState } from "@/src/demandes/form-types";

export default function NewDemandeForm({ clients, defaultClientId = "" }: { clients: { id: number; nom: string; email: string }[]; defaultClientId?: string }) {
  const initialClient = clients.find((client) => String(client.id) === defaultClientId);
  const initialState = initialClient ? {
    ...emptyRequestFormState,
    values: { ...emptyRequestFormState.values, nom: initialClient.nom, email: initialClient.email },
  } : emptyRequestFormState;
  const [state, formAction, isPending] = useActionState(addInternalDemande, initialState);

  return (
    <form action={formAction}>
      <label htmlFor="request-client">Client associé (facultatif)
        <select id="request-client" name="client_id" defaultValue={defaultClientId}>
          <option value="">Aucun client · retrouver le contact par e-mail</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.nom} · {client.email}</option>)}
        </select>
      </label>
      {defaultClientId && <p className="muted-text">Les coordonnées du client sélectionné seront conservées pour cette demande.</p>}
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
