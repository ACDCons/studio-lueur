CREATE TABLE `clients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_contact_id_unique` ON `clients` (`contact_id`);--> statement-breakpoint
CREATE INDEX `clients_contact_id_idx` ON `clients` (`contact_id`);--> statement-breakpoint
CREATE TABLE `factures` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`demande_id` integer NOT NULL,
	`type` text NOT NULL,
	`statut` text DEFAULT 'Envoyée' NOT NULL,
	`montant_centimes` integer NOT NULL,
	`date_emission` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`date_paiement` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`demande_id`) REFERENCES `demandes`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "factures_type_check" CHECK("factures"."type" in ('Acompte', 'Solde')),
	CONSTRAINT "factures_statut_check" CHECK("factures"."statut" in ('Envoyée', 'Relance 1', 'Relance 2', 'Relance 3', 'Payée', 'Annulée')),
	CONSTRAINT "factures_montant_check" CHECK("factures"."montant_centimes" >= 0)
);
--> statement-breakpoint
CREATE INDEX `factures_demande_idx` ON `factures` (`demande_id`);--> statement-breakpoint
CREATE INDEX `factures_statut_idx` ON `factures` (`statut`);--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`nom` text NOT NULL,
	`acces_crm` integer DEFAULT false NOT NULL,
	`role_systeme` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_nom_unique` ON `roles` (`nom`);--> statement-breakpoint
CREATE TABLE `shootings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`demande_id` integer NOT NULL,
	`statut` text DEFAULT 'À organiser' NOT NULL,
	`date_seance` text,
	`heure_debut` text,
	`heure_fin` text,
	`lieu` text,
	`personnes_et_moments` text,
	`organisation` text,
	`livrables` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`demande_id`) REFERENCES `demandes`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "shootings_statut_check" CHECK("shootings"."statut" in ('À organiser', 'Planifié', 'Réalisé', 'En retouche', 'Livré', 'Annulé'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shootings_demande_id_unique` ON `shootings` (`demande_id`);--> statement-breakpoint
CREATE INDEX `shootings_statut_idx` ON `shootings` (`statut`);--> statement-breakpoint
CREATE INDEX `shootings_date_idx` ON `shootings` (`date_seance`);
--> statement-breakpoint
INSERT INTO `roles` (`id`, `nom`, `acces_crm`, `role_systeme`) VALUES
	('admin', 'Administrateur', 1, 1),
	('user', 'Utilisateur', 0, 1);
