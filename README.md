# Studio Lueur

CRM de démonstration pour le studio photo fictif de Nora. Le projet comprend une landing avec formulaire de demande et un espace CRM local protégé par Better Auth.

## État actuel

Le code est prêt pour la préparation de publication. Le déploiement Vercel/Turso est en cours côté participant, mais aucune cible distante n’a été inspectée ou modifiée par l’agent. En local, SQLite/libSQL est ciblé sur data/local.sqlite. Les exemples métier sont fictifs.

Le CRM comprend les demandes, clients, shootings, factures et la gestion des rôles. La fiche client rassemble ses demandes, shootings et factures. Les rôles et comptes d’accès sont distincts des contacts et clients métier.

## Repères

- [Brief fonctionnel](docs/brief.md) : besoin et règles métier validées.
- [Décisions](docs/decisions.md) : décisions de modèle et de fonctionnement.
- [Faits fictifs](sources/studio-lueur.md) : contexte fourni, sans faits réels ajoutés.
- [Backend](docs/backend.md) : base, authentification, migrations et préparation de publication.
- [Journal](docs/journal.md) : étapes réalisées, observations et limites.
- [Règles de travail](AGENTS.md).

## Développement local

Le projet utilise Next.js, Drizzle ORM, Better Auth et le client libSQL. Le chemin SQLite par défaut est data/local.sqlite. La base et ses fichiers annexes restent hors de public et du dépôt Git.

Les principaux scripts sont npm run dev, npm run db:studio, npm run db:migrate, npm run auth:create-manager et npm run auth:create-user. La destination de chaque opération sur la base doit être vérifiée avant son exécution. Les commandes de comptes demandent le mot de passe de façon masquée ; ne pas mettre de secret dans les arguments ou dans Git.

L’inscription publique est désactivée. L’accès CRM et chaque mutation privée doivent vérifier la session Better Auth et le rôle côté serveur.

## Publications

La cible prévue est Vercel avec une base Turso créée depuis l’onglet Storage de Vercel. Les migrations locales existantes, y compris Better Auth, devront être vérifiées et appliquées sans remise à zéro. Un Push GitHub ne transfère aucune ligne de data/local.sqlite. L’intégration Vercel fournit les variables de connexion Turso ; le participant saisit les valeurs Better Auth. Voir le guide [backend](docs/backend.md).

Aucun secret, compte cloud ou donnée réelle n’est documenté dans ce dépôt.
