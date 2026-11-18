ALTER TABLE `contacts` ADD COLUMN `statut_contact` text NOT NULL DEFAULT 'Lead' CHECK (`statut_contact` in ('Lead', 'Client', 'KO', 'HS', 'Toxique'));
--> statement-breakpoint
UPDATE `contacts`
SET `statut_contact` = 'Client'
WHERE `id` IN (SELECT `contact_id` FROM `demandes` WHERE `statut` = 'Client');
--> statement-breakpoint
CREATE TABLE `__new_demandes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`type_seance` text NOT NULL,
	`date_souhaitee` text,
	`message` text NOT NULL,
	`statut` text DEFAULT 'Nouveau' NOT NULL,
	`note` text,
	`prochaine_action` text,
	`budget_eur` integer,
	`raison_refus` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "demandes_type_seance_check" CHECK(`type_seance` in ('Mariage', 'Portrait', 'Entreprise')),
	CONSTRAINT "demandes_statut_check" CHECK(`statut` in ('Nouveau', 'En Discussion', 'Acompte versé', 'Shooting proche', 'Retouche en cours', 'Livrée', 'Payée', 'Refusée', 'Annulée', 'Client (historique)')),
	CONSTRAINT "demandes_raison_refus_check" CHECK(`raison_refus` is null or `raison_refus` in ('Hors budget', 'Pas de réponse', 'Toxique')),
	CONSTRAINT "demandes_budget_check" CHECK(`budget_eur` is null or `budget_eur` >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_demandes` (`id`, `contact_id`, `type_seance`, `date_souhaitee`, `message`, `statut`, `note`, `prochaine_action`, `budget_eur`, `raison_refus`, `created_at`)
SELECT `id`, `contact_id`, `type_seance`, `date_souhaitee`, `message`,
	CASE `statut`
		WHEN 'En discussion' THEN 'En Discussion'
		WHEN 'Client' THEN 'Client (historique)'
		WHEN 'Perdu' THEN 'Refusée'
		ELSE `statut`
	END,
	`note`, `prochaine_action`, NULL, NULL, `created_at`
FROM `demandes`;
--> statement-breakpoint
DROP TABLE `demandes`;
--> statement-breakpoint
ALTER TABLE `__new_demandes` RENAME TO `demandes`;
--> statement-breakpoint
CREATE INDEX `demandes_contact_id_idx` ON `demandes` (`contact_id`);
--> statement-breakpoint
CREATE INDEX `demandes_statut_idx` ON `demandes` (`statut`);
--> statement-breakpoint
CREATE TABLE `echanges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`demande_id` integer NOT NULL,
	`auteur` text NOT NULL,
	`contenu` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`demande_id`) REFERENCES `demandes`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "echanges_auteur_check" CHECK(`auteur` in ('Client', 'Studio'))
);
--> statement-breakpoint
CREATE INDEX `echanges_demande_date_idx` ON `echanges` (`demande_id`, `created_at`);
