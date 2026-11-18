# Règles · Studio Lueur

## Références

- Besoin et périmètre : docs/brief.md.
- Décisions produit : docs/decisions.md.
- Faits fictifs : sources/studio-lueur.md ; ne pas les présenter comme des faits réels.
- Schéma Drizzle et migrations : src/db/schema.ts et drizzle/.
- Architecture et publication : docs/backend.md.
- Reprise et historique : docs/journal.md.

## Règles de travail

- Présenter un plan et attendre l’accord avant installation, modification de code, commande ou migration. Une demande explicite de l’utilisateur pour une modification précise vaut accord pour ce périmètre.
- Préserver les migrations, l’historique et les données locales et distantes. Pas d’effacement global, de remise à zéro, de copie implicite, ni de migration distante non vérifiée.
- Ne pas lire .env.local ni afficher de valeur secrète. Les secrets sont saisis par le participant dans des champs ou invites masqués, jamais dans les arguments ou logs.
- Ne pas inventer de faits, d’état de base, d’identité, de rôle ou de droit. Distinguer les données fictives des faits fournis.
- Les écritures passent par des requêtes paramétrées, des champs autorisés et une validation côté serveur. Pas d’endpoint SQL générique.
- Décrire les observations réelles, les fichiers modifiés et les limites ; ne pas prétendre avoir vérifié une interface ou une base qui ne l’a pas été.
- Les changements de schéma passent par une migration Drizzle conservée dans drizzle/. Drizzle Studio sert à observer les données, jamais à modifier des lignes à la main.

## Base et données

- En local, utiliser SQLite via @libsql/client et le chemin stable data/local.sqlite, résolu depuis la racine du projet. Aucun fichier de base dans public, Git ou les assets Next.js.
- Activer et vérifier les clés étrangères sur chaque connexion.
- Un contact peut avoir plusieurs demandes ; chaque demande doit avoir un contact. La création liée se fait dans une transaction.
- Un contact métier, un client et un utilisateur Better Auth sont trois entités distinctes.
- Un client n’a pas de statut. Le statut éventuel d’un contact ne remplace pas l’entité client.
- Le passage d’une demande au statut Payée ne crée ni client ni shooting. Le déclencheur est une facture de type Acompte liée à la demande dont l’état passe à Payée ; client, rattachements et shooting sont créés/résolus transactionnellement.
- Tout shooting est lié à un client. Son lien à une demande est facultatif ; ses champs décrivent la séance photo, pas une copie de la demande.
- Une facture est de type Acompte ou Solde. Si elle est liée à un client et une demande, les deux doivent correspondre. Une facture d’acompte peut précéder le client en étant liée à la demande.
- La fiche client affiche demandes, shootings et factures et permet d’en créer manuellement. Une demande peut aussi être attribuée à un client selon les règles d’historique.
- Les états actifs des demandes sont Nouveau, En Discussion, Acompte versé, Shooting proche, Retouche en cours, Livrée, Payée, Refusée et Annulée. Client (historique) reste conservé pour les anciennes lignes.
- Les états des factures sont Envoyée, Relance 1, Relance 2, Relance 3, Payée et Annulée. Les types sont Acompte et Solde.
- Les quatre états du brief initial (Nouveau, En discussion, Client, Perdu) sont historiques. Ne pas les recréer comme une deuxième liste de statuts en ligne ; les migrations portent les contraintes actuelles.
- Supprimer uniquement une demande admissible et ciblée ; aucune cascade vers le contact ou ses autres demandes. Pas de suppression de contact dans la V1. Une demande liée à une facture ou un shooting conserve son historique.

## Authentification et rôles

- Better Auth gère la session. Pas d’inscription publique et pas de cryptographie maison.
- Contrôler la session et le rôle autorisé côté serveur pour chaque page et chaque action privée.
- Les rôles système sont admin (accès CRM) et user (sans accès CRM). La section Utilisateurs gère les rôles personnalisés et leur attribution aux comptes existants ; les rôles système ne sont pas supprimables.
- Aucun rôle n’est choisi depuis le navigateur. La création de comptes passe par une opération d’administration explicite. Les comptes en ligne seront créés séparément par le participant.

## Publication Vercel et Turso

- La publication reste séparée du développement local. Le participant crée la base Turso depuis l’onglet Storage de Vercel.
- Avant toute opération distante, expliquer le plan et attendre l’accord. Identifier par lecture seule le bon projet Vercel et la bonne base Turso, puis comparer leur état et le journal de migrations. Si la cible ou les données sont inattendues, arrêter avant toute écriture.
- Lire les documentations officielles actuelles de Vercel, Turso, Drizzle et Better Auth avant la mise en ligne.
- Appliquer en ligne toutes les migrations conservées, y compris Better Auth (0001_special_quasar.sql), sans remise à zéro. Appliquer aussi chaque nouvelle migration à Turso avant un Push qui la contient.
- Un Push ne transfère aucune ligne de data/local.sqlite. Préserver les données locales et toute donnée déjà présente en ligne.
- Ne jamais afficher les valeurs des variables. Le participant saisit les variables sensibles et secrets ; recréer en ligne les comptes A (gestionnaire/admin) et B (utilisateur/user) avec les identités et mots de passe choisis par le participant.
- Ne pas considérer les quatre statuts initiaux comme des lignes à insérer : ils sont remplacés par la liste actuelle du schéma et ne sont pas des entités séparées.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
