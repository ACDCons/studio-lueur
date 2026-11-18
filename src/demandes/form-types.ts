export type RequestValues = {
  nom: string;
  email: string;
  type_seance: string;
  date_souhaitee: string;
  message: string;
};

export type RequestField = keyof RequestValues;

export type RequestFormState = {
  status: "idle" | "error" | "success";
  message: string;
  values: RequestValues;
  errors: Partial<Record<RequestField, string>>;
};

export const emptyRequestValues: RequestValues = {
  nom: "",
  email: "",
  type_seance: "",
  date_souhaitee: "",
  message: "",
};

export const emptyRequestFormState: RequestFormState = {
  status: "idle",
  message: "",
  values: emptyRequestValues,
  errors: {},
};

export type EditValues = {
  id: string;
  type_seance: string;
  date_souhaitee: string;
  message: string;
  statut: string;
  note: string;
  prochaine_action: string;
};

export type EditField = keyof EditValues;

export type EditFormState = {
  status: "idle" | "error" | "success";
  message: string;
  values: EditValues;
  errors: Partial<Record<EditField, string>>;
};

export function emptyEditFormState(values: EditValues): EditFormState {
  return { status: "idle", message: "", values, errors: {} };
}
