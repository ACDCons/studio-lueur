"use client";

import { useActionState } from "react";
import { updateDemande } from "@/app/actions/demandes";
import { RAISONS_REFUS, STATUTS_DEMANDE, TYPES_SEANCE } from "@/src/demandes/constants";
import { emptyEditFormState, type EditValues } from "@/src/demandes/form-types";
import { useState } from "react";

export default function EditDemandeForm({ initialValues }: { initialValues: EditValues }) {
  const [state, formAction, isPending] = useActionState(
    updateDemande,
    emptyEditFormState(initialValues),
  );
  const { values, errors } = state;
  const [selectedStatus, setSelectedStatus] = useState(values.statut);

  return (
    <form action={formAction}>
      <input type="hidden" name="demande_id" value={values.id} readOnly />
      <label htmlFor="edit-type">Type de séance
        <select id="edit-type" name="type_seance" required defaultValue={values.type_seance}>
          {TYPES_SEANCE.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        {errors.type_seance && <small className="form-error">{errors.type_seance}</small>}
      </label>
      <label htmlFor="edit-date">Date souhaitée
        <input id="edit-date" name="date_souhaitee" type="date" defaultValue={values.date_souhaitee} />
        {errors.date_souhaitee && <small className="form-error">{errors.date_souhaitee}</small>}
      </label>
      <label htmlFor="edit-shooting-date">Date de shooting validée
        <input id="edit-shooting-date" name="date_shooting_validee" type="date" defaultValue={values.date_shooting_validee} />
        {errors.date_shooting_validee && <small className="form-error">{errors.date_shooting_validee}</small>}
      </label>
      <label htmlFor="edit-message">Message
        <textarea id="edit-message" name="message" rows={5} maxLength={5000} required defaultValue={values.message} />
        {errors.message && <small className="form-error">{errors.message}</small>}
      </label>
      <label htmlFor="edit-status">Statut
        <select id="edit-status" name="statut" required value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
          {STATUTS_DEMANDE.map((status) => <option key={status} value={status}>{status}</option>)}
          {values.statut === "Client (historique)" && <option value="Client (historique)">Client (ancien statut)</option>}
        </select>
        {errors.statut && <small className="form-error">{errors.statut}</small>}
      </label>
      {selectedStatus === "Refusée" && <label htmlFor="edit-reason">Motif du refus
        <select id="edit-reason" name="raison_refus" required defaultValue={values.raison_refus}>
          <option value="" disabled>Choisir un motif</option>
          {RAISONS_REFUS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
        </select>
        {errors.raison_refus && <small className="form-error">{errors.raison_refus}</small>}
      </label>}
      {selectedStatus !== "Refusée" && <input type="hidden" name="raison_refus" value="" />}
      <label htmlFor="edit-budget">Budget client (€)
        <input id="edit-budget" name="budget_eur" type="number" min="0" step="1" defaultValue={values.budget_eur} />
        {errors.budget_eur && <small className="form-error">{errors.budget_eur}</small>}
      </label>
      <label htmlFor="edit-note">Note
        <textarea id="edit-note" name="note" rows={3} maxLength={5000} defaultValue={values.note} />
        {errors.note && <small className="form-error">{errors.note}</small>}
      </label>
      <label htmlFor="edit-next-action">Prochaine action
        <input id="edit-next-action" name="prochaine_action" maxLength={500} defaultValue={values.prochaine_action} />
        {errors.prochaine_action && <small className="form-error">{errors.prochaine_action}</small>}
      </label>
      <button type="submit" disabled={isPending}>{isPending ? "Enregistrement…" : "Enregistrer les modifications"}</button>
      {state.message && (
        <p className={state.status === "error" ? "form-error" : "demo-note"} role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      )}
    </form>
  );
}
