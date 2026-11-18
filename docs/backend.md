# Backend · Studio Lueur

## Environnement

Le projet reste en développement local, avec des données fictives. `npm run dev` et `npm start` écoutent sur `127.0.0.1`. Aucun tunnel, compte cloud ou déploiement n’a été créé.

La base utilise `@libsql/client` et Drizzle. `DATABASE_URL` est lu par le client ; sans valeur, le chemin `file:data/local.sqlite` est résolu depuis la racine du projet. Le fichier de base est ignoré par Git sous `data/`.

Better Auth utilise `BETTER_AUTH_URL` et `BETTER_AUTH_SECRET`. Le fichier `.env.example` nomme ces variables sans valeur secrète. Le participant doit saisir une clé stable d’au moins 32 caractères dans son environnement local avant de se connecter ou de créer des comptes. Le code de l’application refuse une clé absente ou trop courte sans l’afficher.

## Commandes

- `npm run db:generate` : générer une migration Drizzle depuis `src/db/schema.ts`.
- `npm run db:migrate` : appliquer les migrations conservées dans `drizzle/`.
- `npm run db:seed` : ajouter un contact et deux demandes fictives à une base vide. Le script s’arrête si des lignes existent déjà.
- `npm run db:seed-sample` : ajouter le jeu fictif local de 22 clients et 23 demandes. Le script vérifie la base cible et les comptes avant insertion, et s’arrête si le jeu a déjà été modifié ou si le plafond serait dépassé.
- `npm run db:studio` : ouvrir Drizzle Studio en local pour observer les tables et les lignes ; ne pas modifier les lignes à la main.
- `npm run auth:generate-schema` : régénérer le schéma Better Auth dans `src/db/auth-schema.ts` avec le CLI officiel.
- `npm run auth:create-manager` : créer un compte gestionnaire local. La commande demande l’adresse e-mail et le nom, puis le CLI Better Auth demande le mot de passe sans l’ajouter aux arguments.
- `npm run auth:create-user` : créer un compte standard local selon le même mode. Son rôle est fixé par la commande.

Les commandes de création chargent la configuration locale via `@next/env`, exigent `BETTER_AUTH_SECRET`, puis appellent le CLI Better Auth. Elles ne lisent pas ni n’affichent les mots de passe ; ne pas passer de mot de passe ou de rôle dans les arguments. Créer d’abord le gestionnaire, puis le compte standard. Aucune commande ne supprime ni ne remplace un compte existant.

## Modèle et écritures

- Un contact peut avoir plusieurs demandes ; chaque demande a un `contact_id` obligatoire.
- Les connexions du projet activent et vérifient `PRAGMA foreign_keys`. La suppression d’un contact lié est restreinte.
- Les Server Actions sélectionnent explicitement les champs autorisés et valident chaque valeur côté serveur. Les lectures et écritures utilisent Drizzle, sans endpoint SQL générique.
- Le formulaire normalise l’e-mail pour retrouver un contact. Si celui-ci existe déjà, ses coordonnées ne sont pas modifiées. La création éventuelle du contact et de la demande est faite dans une transaction.
- Le CRM permet de créer une demande reçue directement, lire les demandes, modifier les champs de la demande et supprimer une seule demande après confirmation dans l’interface. La suppression ne vise pas le contact ni ses autres demandes.

## Authentification et autorisation

- La connexion e-mail/mot de passe passe par Better Auth. L’inscription publique est désactivée.
- Le rôle Better Auth `admin` correspond au gestionnaire du CRM ; le rôle `user` n’a pas accès au CRM. Les rôles sont assignés uniquement par les commandes locales d’administration, pas par le formulaire ni par le navigateur.
- `/crm`, `/crm/[id]` et `/crm/nouvelle` appellent `requireManager()` côté serveur, qui demande à Better Auth la session depuis les en-têtes de la requête puis vérifie `user.role`.
- Les actions privées `addInternalDemande`, `updateDemande` et `deleteDemande` répètent ce contrôle au début de chaque appel. `submitPublicDemande` reste l’action publique du formulaire du site.
- La route HTTP Better Auth n’autorise que la lecture de session, la connexion et la déconnexion. Les routes d’inscription et du plugin d’administration ne sont pas accessibles ; la création des comptes passe par le CLI local aux rôles fixés par les commandes du projet.
- L’initialisation Better Auth utilise le même chemin de base stable et active aussi les clés étrangères sur sa connexion SQLite.

## Migrations d’authentification

Le schéma a été généré par `auth generate`, puis Drizzle a produit `drizzle/0001_special_quasar.sql`. Cette migration ajoute `user`, `session`, `account` et `verification` ; elle ne modifie pas les tables métier. Elle a été appliquée à `data/local.sqlite` sans remise à zéro. La lecture faite juste après cette migration avait observé un contact et deux demandes.

## Jeu fictif ajouté

À la demande du participant, `npm run db:seed-sample` a ajouté 22 contacts et 23 demandes à la base locale. Les adresses utilisent le domaine réservé `.invalid`. Le script a conservé toutes les lignes préexistantes et a lié chaque demande à un contact dans une transaction. Aucune migration n’a été nécessaire.

La vérification en lecture seule après insertion a observé 24 contacts et 26 demandes, soit 50 lignes métier au total, `foreign_keys = 1`, aucune demande sans contact et aucune violation `PRAGMA foreign_key_check`. Les comptes Better Auth sont toujours à zéro. Aucun compte A/B n’a encore été créé : le participant doit fournir ses identités, sa clé locale et saisir les mots de passe dans les invites masquées.

## Limites

Le bloc reste local et n’a pas été publié. `npx tsc --noEmit` a réussi ; le parcours d’authentification n’a pas été essayé dans un navigateur, aucun build Next ni aucune suite de tests n’ont été lancés. Les connexions réelles des identités visiteur/A/B restent à vérifier après création des comptes. La création d’une demande depuis le formulaire public n’exige volontairement pas de session.
