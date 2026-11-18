import { TYPES_SEANCE } from "@/src/demandes/constants";
import type { RequestField, RequestValues } from "@/src/demandes/form-types";

type Props = {
  idPrefix: string;
  values: RequestValues;
  errors: Partial<Record<RequestField, string>>;
};

export default function RequestFields({ idPrefix, values, errors }: Props) {
  return (
    <>
      <label htmlFor={`${idPrefix}-nom`}>Nom
        <input id={`${idPrefix}-nom`} name="nom" autoComplete="name" maxLength={120} required defaultValue={values.nom} aria-invalid={Boolean(errors.nom)} aria-describedby={errors.nom ? `${idPrefix}-nom-error` : undefined} />
        {errors.nom && <small id={`${idPrefix}-nom-error`} className="form-error">{errors.nom}</small>}
      </label>
      <label htmlFor={`${idPrefix}-email`}>E-mail
        <input id={`${idPrefix}-email`} name="email" type="email" autoComplete="email" maxLength={254} required defaultValue={values.email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${idPrefix}-email-error` : undefined} />
        {errors.email && <small id={`${idPrefix}-email-error`} className="form-error">{errors.email}</small>}
      </label>
      <label htmlFor={`${idPrefix}-type`}>Type de séance
        <select id={`${idPrefix}-type`} name="type_seance" required defaultValue={values.type_seance} aria-invalid={Boolean(errors.type_seance)} aria-describedby={errors.type_seance ? `${idPrefix}-type-error` : undefined}>
          <option value="" disabled>Choisir…</option>
          {TYPES_SEANCE.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        {errors.type_seance && <small id={`${idPrefix}-type-error`} className="form-error">{errors.type_seance}</small>}
      </label>
      <label htmlFor={`${idPrefix}-date`}>Date souhaitée (facultatif)
        <input id={`${idPrefix}-date`} name="date_souhaitee" type="date" defaultValue={values.date_souhaitee} aria-invalid={Boolean(errors.date_souhaitee)} aria-describedby={errors.date_souhaitee ? `${idPrefix}-date-error` : undefined} />
        {errors.date_souhaitee && <small id={`${idPrefix}-date-error`} className="form-error">{errors.date_souhaitee}</small>}
      </label>
      <label htmlFor={`${idPrefix}-message`}>Votre projet
        <textarea id={`${idPrefix}-message`} name="message" rows={5} maxLength={5000} required defaultValue={values.message} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? `${idPrefix}-message-error` : undefined} />
        {errors.message && <small id={`${idPrefix}-message-error`} className="form-error">{errors.message}</small>}
      </label>
    </>
  );
}
