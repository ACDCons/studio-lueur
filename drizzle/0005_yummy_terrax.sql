PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `__new_factures` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_id` integer,
	`demande_id` integer,
	`type` text NOT NULL,
	`statut` text DEFAULT 'Envoyée' NOT NULL,
	`montant_centimes` integer NOT NULL,
	`date_emission` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`date_paiement` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`demande_id`) REFERENCES `demandes`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "factures_type_check" CHECK("__new_factures"."type" in ('Acompte', 'Solde')),
	CONSTRAINT "factures_statut_check" CHECK("__new_factures"."statut" in ('Envoyée', 'Relance 1', 'Relance 2', 'Relance 3', 'Payée', 'Annulée')),
	CONSTRAINT "factures_montant_check" CHECK("__new_factures"."montant_centimes" >= 0),
	CONSTRAINT "factures_lien_check" CHECK("__new_factures"."client_id" is not null or "__new_factures"."demande_id" is not null)
);
--> statement-breakpoint
INSERT INTO `__new_factures` (`id`, `client_id`, `demande_id`, `type`, `statut`, `montant_centimes`, `date_emission`, `date_paiement`, `created_at`)
SELECT `f`.`id`,
	(SELECT `c`.`id` FROM `clients` AS `c` INNER JOIN `demandes` AS `d` ON `d`.`contact_id` = `c`.`contact_id` WHERE `d`.`id` = `f`.`demande_id`),
	`f`.`demande_id`, `f`.`type`, `f`.`statut`, `f`.`montant_centimes`, `f`.`date_emission`, `f`.`date_paiement`, `f`.`created_at`
FROM `factures` AS `f`;
--> statement-breakpoint
DROP TABLE `factures`;
--> statement-breakpoint
ALTER TABLE `__new_factures` RENAME TO `factures`;
--> statement-breakpoint
CREATE INDEX `factures_demande_idx` ON `factures` (`demande_id`);
--> statement-breakpoint
CREATE INDEX `factures_client_idx` ON `factures` (`client_id`);
--> statement-breakpoint
CREATE INDEX `factures_statut_idx` ON `factures` (`statut`);
--> statement-breakpoint
CREATE TABLE `__new_shootings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_id` integer NOT NULL,
	`demande_id` integer,
	`titre` text NOT NULL,
	`statut` text DEFAULT 'À organiser' NOT NULL,
	`date_seance` text,
	`heure_debut` text,
	`heure_fin` text,
	`lieu` text,
	`personnes_et_moments` text,
	`organisation` text,
	`livrables` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`demande_id`) REFERENCES `demandes`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "shootings_statut_check" CHECK("__new_shootings"."statut" in ('À organiser', 'Planifié', 'Réalisé', 'En retouche', 'Livré', 'Annulé'))
);
--> statement-breakpoint
INSERT INTO `__new_shootings` (`id`, `client_id`, `demande_id`, `titre`, `statut`, `date_seance`, `heure_debut`, `heure_fin`, `lieu`, `personnes_et_moments`, `organisation`, `livrables`, `created_at`)
SELECT `s`.`id`,
	(SELECT `c`.`id` FROM `clients` AS `c` INNER JOIN `demandes` AS `d` ON `d`.`contact_id` = `c`.`contact_id` WHERE `d`.`id` = `s`.`demande_id`),
	`s`.`demande_id`,
	'Shooting lié à la demande #' || `s`.`demande_id`,
	`s`.`statut`, `s`.`date_seance`, `s`.`heure_debut`, `s`.`heure_fin`, `s`.`lieu`, `s`.`personnes_et_moments`, `s`.`organisation`, `s`.`livrables`, `s`.`created_at`
FROM `shootings` AS `s`;
--> statement-breakpoint
DROP TABLE `shootings`;
--> statement-breakpoint
ALTER TABLE `__new_shootings` RENAME TO `shootings`;
--> statement-breakpoint
CREATE UNIQUE INDEX `shootings_demande_id_unique` ON `shootings` (`demande_id`);
--> statement-breakpoint
CREATE INDEX `shootings_statut_idx` ON `shootings` (`statut`);
--> statement-breakpoint
CREATE INDEX `shootings_date_idx` ON `shootings` (`date_seance`);
--> statement-breakpoint
CREATE INDEX `shootings_client_id_idx` ON `shootings` (`client_id`);
--> statement-breakpoint
PRAGMA foreign_keys=ON;
