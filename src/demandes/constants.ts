export const TYPES_SEANCE = ["Mariage", "Portrait", "Entreprise"] as const;
export const STATUTS_DEMANDE = ["Nouveau", "En discussion", "Client", "Perdu"] as const;

export type TypeSeance = (typeof TYPES_SEANCE)[number];
export type StatutDemande = (typeof STATUTS_DEMANDE)[number];
