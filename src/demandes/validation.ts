import "server-only";
import { RAISONS_REFUS, STATUTS_DEMANDE_STOCKES, TYPES_SEANCE } from "./constants";
import type { EditFormState, EditValues, RequestFormState, RequestValues } from "./form-types";

export type { EditFormState, EditValues, RequestFormState, RequestValues } from "./form-types";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isValidDate(value: string): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function validateNewRequest(formData: FormData) {
  const values: RequestValues = {
    nom: field(formData, "nom"),
    email: field(formData, "email"),
    type_seance: field(formData, "type_seance"),
    date_souhaitee: field(formData, "date_souhaitee"),
    message: field(formData, "message"),
  };
  const errors: RequestFormState["errors"] = {};

  if (!values.nom || values.nom.length > 120) {
    errors.nom = "Indique un nom de 1 à 120 caractères.";
  }
  if (
    values.email.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
  ) {
    errors.email = "Indique une adresse e-mail valide.";
  }
  if (!(TYPES_SEANCE as readonly string[]).includes(values.type_seance)) {
    errors.type_seance = "Choisis un type de séance proposé.";
  }
  if (!isValidDate(values.date_souhaitee)) {
    errors.date_souhaitee = "Indique une date valide.";
  }
  if (!values.message || values.message.length > 5000) {
    errors.message = "Le message doit contenir de 1 à 5 000 caractères.";
  }

  return { values, errors };
}

export function validateEditRequest(formData: FormData) {
  const values: EditValues = {
    id: field(formData, "demande_id"),
    type_seance: field(formData, "type_seance"),
    date_souhaitee: field(formData, "date_souhaitee"),
    date_shooting_validee: field(formData, "date_shooting_validee"),
    message: field(formData, "message"),
    statut: field(formData, "statut"),
    raison_refus: field(formData, "raison_refus"),
    budget_eur: field(formData, "budget_eur"),
    note: field(formData, "note"),
    prochaine_action: field(formData, "prochaine_action"),
  };
  const errors: EditFormState["errors"] = {};
  const id = Number(values.id);

  if (!Number.isSafeInteger(id) || id < 1) errors.id = "Demande invalide.";
  if (!(TYPES_SEANCE as readonly string[]).includes(values.type_seance)) {
    errors.type_seance = "Choisis un type de séance proposé.";
  }
  if (!isValidDate(values.date_souhaitee)) {
    errors.date_souhaitee = "Indique une date valide.";
  }
  if (!isValidDate(values.date_shooting_validee)) {
    errors.date_shooting_validee = "Indique une date de shooting validée valide.";
  }
  if (!values.message || values.message.length > 5000) {
    errors.message = "Le message doit contenir de 1 à 5 000 caractères.";
  }
  if (!(STATUTS_DEMANDE_STOCKES as readonly string[]).includes(values.statut)) {
    errors.statut = "Choisis un statut proposé.";
  }
  if (values.raison_refus && !(RAISONS_REFUS as readonly string[]).includes(values.raison_refus)) {
    errors.raison_refus = "Choisis un motif de refus proposé.";
  }
  if (values.statut === "Refusée" && !values.raison_refus) {
    errors.raison_refus = "Choisis un motif pour une demande refusée.";
  }
  if (values.statut !== "Refusée" && values.raison_refus) {
    errors.raison_refus = "Le motif de refus s'applique uniquement au statut Refusée.";
  }
  if (values.budget_eur) {
    const budget = Number(values.budget_eur);
    if (!/^\d+$/.test(values.budget_eur) || !Number.isSafeInteger(budget)) {
      errors.budget_eur = "Indique un budget en euros sous forme de nombre entier positif.";
    }
  }
  if (values.note.length > 5000) errors.note = "La note ne peut pas dépasser 5 000 caractères.";
  if (values.prochaine_action.length > 500) {
    errors.prochaine_action = "La prochaine action ne peut pas dépasser 500 caractères.";
  }

  return { values, errors };
}
