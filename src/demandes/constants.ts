export const TYPES_SEANCE = ["Mariage", "Portrait", "Entreprise"] as const;
export const STATUTS_DEMANDE = [
  "Nouveau",
  "En Discussion",
  "Acompte versé",
  "Shooting proche",
  "Retouche en cours",
  "Livrée",
  "Payée",
  "Refusée",
  "Annulée",
] as const;
export const STATUTS_DEMANDE_STOCKES = [...STATUTS_DEMANDE, "Client (historique)"] as const;
export const STATUTS_CONTACT = ["Lead", "Client", "KO", "HS", "Toxique"] as const;
export const RAISONS_REFUS = ["Hors budget", "Pas de réponse", "Toxique"] as const;
export const AUTEURS_ECHANGE = ["Client", "Studio"] as const;
export const TYPES_FACTURE = ["Acompte", "Solde"] as const;
export const ETATS_FACTURE = ["Envoyée", "Relance 1", "Relance 2", "Relance 3", "Payée", "Annulée"] as const;
export const STATUTS_SHOOTING = ["À organiser", "Planifié", "Réalisé", "En retouche", "Livré", "Annulé"] as const;

export type TypeSeance = (typeof TYPES_SEANCE)[number];
export type StatutDemande = (typeof STATUTS_DEMANDE_STOCKES)[number];
export type StatutContact = (typeof STATUTS_CONTACT)[number];
export type RaisonRefus = (typeof RAISONS_REFUS)[number];
export type AuteurEchange = (typeof AUTEURS_ECHANGE)[number];
export type TypeFacture = (typeof TYPES_FACTURE)[number];
export type EtatFacture = (typeof ETATS_FACTURE)[number];
export type StatutShooting = (typeof STATUTS_SHOOTING)[number];
