# Journal · reprise Studio Lueur

## État initial fourni

- Landing Next.js et formulaire de démonstration, sans enregistrement.
- Aucune base, migration, authentification ni CRM fournis.
- Le fichier `docs/backend.md`, cité par `AGENTS.md`, n’est pas présent.

## Bloc 1 · base locale (2026-11-18)

- Dépôt Git initialisé ; premier commit : `34861bf` (`Initial commit: Studio Lueur exercise starter`).
- Dépendances ajoutées : `@libsql/client`, `drizzle-orm`, `drizzle-kit` et `tsx`.
- Schéma Drizzle : `contacts` et `demandes`, avec `contact_id` obligatoire, index, quatre statuts, champs de suivi et suppression restreinte du contact lié.
- Migration générée par Drizzle : `drizzle/0000_foamy_alice.sql`, appliquée à `data/local.sqlite`.
- Données de démonstration fictives : contact id 1 (`Léa`, e-mail `lea@example.invalid`) et deux demandes id 1 et 2, liées à ce contact, de type Mariage et Portrait, statut Nouveau.
- La connexion du projet active `PRAGMA foreign_keys`. Une lecture a confirmé l’activation et la clé `demandes.contact_id → contacts.id` avec `ON DELETE RESTRICT`.
- Le script de seed refuse de s’exécuter si la base contient déjà des lignes ; il n’efface ni ne remplace de données.

## Observations et limites

- Drizzle Studio a démarré sur `127.0.0.1`, mais l’outil d’interface Windows n’a pas pu s’y connecter. Les tables et lignes ont donc été observées par une requête libSQL en lecture seule ; aucune ligne n’a été modifiée via Studio.
- `tsconfig.json` apparaît aussi modifié dans l’arbre de travail : `jsx` est passé à `react-jsx` et `.next/dev/types/**/*.ts` a été ajouté à `include`. Ce changement n’a pas été retouché.

## Bloc 2 · réception locale et CRM

- `npm run dev` et `npm start` sont configurés pour écouter sur `127.0.0.1` ; aucun tunnel ni publication n’a été lancé.
- Le formulaire utilise une Server Action avec validation serveur des champs autorisés. La création éventuelle du contact et de la demande est transactionnelle ; un contact retrouvé par e-mail normalisé conserve ses coordonnées existantes.
- Le CRM local permet de créer une demande reçue directement, lire la liste et le détail, modifier les champs de demande et supprimer une demande ciblée après confirmation dans l’interface. Le contact et ses autres demandes ne sont pas supprimés.
- Le schéma du bloc 1 contenait déjà les champs nécessaires au CRM ; aucune nouvelle migration n’a été créée.
- `docs/backend.md` décrit les commandes et les limites de cette étape.

## Limites et suite

- Le bloc 2 ajoute le formulaire persistant avec validation serveur et le CRM sur `/crm` : liste, détail, ajout interne, modification et suppression ciblée après confirmation.
- La création publique ou interne recherche le contact par e-mail normalisé et ne modifie pas les coordonnées d’un contact existant ; la création du contact éventuel et de sa demande est transactionnelle.
- Les actions de mise à jour n’écrivent que les champs prévus. La suppression cible uniquement l’id de la demande ; aucun contact n’est supprimé.
- Aucun changement de structure n’a été nécessaire au bloc 2 ; la migration existante reste la seule migration appliquée.
- Le code du bloc 2 n’a pas été lancé ni vérifié dans le navigateur ; aucun test automatisé n’a été lancé.
- Better Auth et le contrôle gestionnaire de chaque page/action privée restent à faire au bloc 3. Le CRM du bloc 2 est sans authentification et ne doit pas être publié ou partagé.
- Les changements après le commit initial `34861bf` restent non commités, y compris `package-lock.json` qui est non suivi.

## Bloc 3 · authentification locale (2026-11-18)

- Better Auth, son adaptateur Drizzle et son CLI sont installés en version `1.7.25` ; la documentation officielle a été consultée avant la configuration.
- Le CLI Better Auth a généré `src/db/auth-schema.ts`. Drizzle a généré `drizzle/0001_special_quasar.sql`, qui ajoute les tables `user`, `session`, `account` et `verification` sans toucher aux tables métier ; la migration a été appliquée à `data/local.sqlite`.
- Juste après migration, une lecture seule a observé `foreign_keys = 1`, 1 contact, 2 demandes et 0 utilisateur Better Auth. Plus tard, avant le jeu fictif demandé, l’état observé était de 2 contacts et 3 demandes ; je n’ai pas supposé l’origine de ces lignes supplémentaires.
- La connexion e-mail/mot de passe est configurée ; l’inscription publique est désactivée. Le rôle Better Auth `admin` sert de rôle gestionnaire et `user` est le rôle standard.
- Les pages `/crm`, `/crm/[id]` et `/crm/nouvelle` vérifient la session Better Auth et le rôle côté serveur. Les actions privées d’ajout interne, de modification et de suppression répètent le contrôle à chaque appel. L’action du formulaire public reste publique.
- Les routes HTTP du plugin d’administration sont masquées ; les commandes locales attribuent un rôle fixe. Les commandes demandent l’identité, puis le CLI Better Auth invite à saisir le mot de passe sans argument de commande.
- `.env.example` nomme `BETTER_AUTH_URL` et `BETTER_AUTH_SECRET` sans valeur secrète. Je n’ai pas lu `.env.local`, affiché de secret ou créé de compte. Le script local exige une clé d’au moins 32 caractères avant de créer A (gestionnaire) et B (utilisateur).
- La création effective des comptes A/B reste à faire par le participant : leurs identités et mots de passe ne sont pas fournis, et aucun secret de session n’a été saisi. La base contient donc actuellement 0 utilisateur Better Auth.
- À la demande du participant, `scripts/seed-sample.ts` a ajouté 22 clients et 23 demandes fictifs, avec des e-mails `.invalid`, par une transaction locale. Résultat vérifié en lecture seule : 24 contacts + 26 demandes = 50 lignes métier, 0 demande orpheline et 0 violation de clé étrangère. Aucun contact ni aucune demande préexistante n’a été modifié ; aucune migration n’a été nécessaire.
- Le participant a choisi « données seulement » : aucune page de consultation colorée n’a été ajoutée. La couleur de l’interface Drizzle Studio reste inchangée.
- `npx tsc --noEmit` a réussi. Aucun tunnel ou déploiement n’a été lancé ; le parcours de connexion n’a pas été essayé dans un navigateur, aucun build Next ni aucune suite de tests n’ont été lancés.
- `npm audit --omit=dev` signale 4 vulnérabilités modérées dans `esbuild` via `@esbuild-kit` et `drizzle-kit`. `npm audit fix --force` propose une rétrogradation majeure vers Drizzle Kit 0.18.1 ; aucun correctif automatique n’a été appliqué.

## État de travail

- Tous les changements après le commit initial `34861bf` restent non commités, y compris `package-lock.json`.
- `tsconfig.json` conserve la modification apparue précédemment (`jsx: react-jsx` et `.next/dev/types/**/*.ts` dans `include`) ; elle n’a pas été retouchée dans le bloc 3.
