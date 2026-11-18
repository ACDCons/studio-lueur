"use client";

import { useActionState } from "react";
import { updateDemande } from "@/app/actions/demandes";
import { STATUTS_DEMANDE, TYPES_SEANCE } from "@/src/demandes/constants";
import { emptyEditFormState, type EditValues } from "@/src/demandes/form-types";

export default function EditDemandeForm({ initialValues }: { initialValues: EditValues }) {
  const [state, formAction, isPending] = useActionState(
    updateDemande,
    emptyEditFormState(initialValues),
  );
  const { values, errors } = state;

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
      <label htmlFor="edit-message">Message
        <textarea id="edit-message" name="message" rows={5} maxLength={5000} required defaultValue={values.message} />
        {errors.message && <small className="form-error">{errors.message}</small>}
      </label>
      <label htmlFor="edit-status">Statut
        <select id="edit-status" name="statut" required defaultValue={values.statut}>
          {STATUTS_DEMANDE.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        {errors.statut && <small className="form-error">{errors.statut}</small>}
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
