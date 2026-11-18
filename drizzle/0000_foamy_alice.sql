CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nom` text NOT NULL,
	`email` text NOT NULL,
	`email_normalise` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contacts_email_normalise_unique` ON `contacts` (`email_normalise`);--> statement-breakpoint
CREATE TABLE `demandes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`type_seance` text NOT NULL,
	`date_souhaitee` text,
	`message` text NOT NULL,
	`statut` text DEFAULT 'Nouveau' NOT NULL,
	`note` text,
	`prochaine_action` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "demandes_type_seance_check" CHECK("demandes"."type_seance" in ('Mariage', 'Portrait', 'Entreprise')),
	CONSTRAINT "demandes_statut_check" CHECK("demandes"."statut" in ('Nouveau', 'En discussion', 'Client', 'Perdu'))
);
--> statement-breakpoint
CREATE INDEX `demandes_contact_id_idx` ON `demandes` (`contact_id`);--> statement-breakpoint
CREATE INDEX `demandes_statut_idx` ON `demandes` (`statut`);