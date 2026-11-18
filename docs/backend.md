# Backend · Studio Lueur

## Environnement

Le projet et sa base locale restent documentés dans ce guide. La configuration Vercel/Turso est en cours côté participant ; aucune ressource distante n’a été inspectée ou modifiée par l’agent.

La base utilise @libsql/client et Drizzle. En local, DATABASE_URL explicite permet de garder le chemin file:data/local.sqlite. En développement, TURSO_DATABASE_URL est ignoré par défaut pour préserver la base locale. Sur Vercel, la configuration utilise TURSO_DATABASE_URL et exige TURSO_AUTH_TOKEN pour toute URL distante. Le fichier local est ignoré par Git sous data/.

Better Auth utilise `BETTER_AUTH_URL` et `BETTER_AUTH_SECRET`. Le fichier `.env.example` nomme ces variables sans valeur secrète. Le participant doit saisir une clé stable d’au moins 32 caractères dans son environnement local avant de se connecter ou de créer des comptes. Le code de l’application refuse une clé absente ou trop courte sans l’afficher.

## Commandes

- `npm run db:generate` : générer une migration Drizzle depuis `src/db/schema.ts`.
- `npm run db:migrate` : appliquer les migrations conservées dans `drizzle/`.
- `npm run db:seed` : ajouter un contact et deux demandes fictives à une base vide. Le script s’arrête si des lignes existent déjà.
- `npm run db:seed-sample` : ajouter le jeu fictif local de 22 clients et 23 demandes. Le script vérifie la base cible et les comptes avant insertion, et s’arrête si le jeu a déjà été modifié ou si le plafond serait dépassé.
- `npm run db:seed-crm-demo` : ajouter des clients, factures et shootings fictifs aux cinq demandes de démonstration déjà enrichies. Le script exige `file:data/local.sqlite` et vérifie les e-mails, le texte et les budgets attendus avant toute insertion.
- `npm run db:studio` : ouvrir Drizzle Studio en local pour observer les tables et les lignes ; ne pas modifier les lignes à la main.
- `npm run auth:generate-schema` : régénérer le schéma Better Auth dans `src/db/auth-schema.ts` avec le CLI officiel.
- `npm run auth:create-manager` : créer un compte gestionnaire local. La commande demande l’adresse e-mail et le nom, puis le CLI Better Auth demande le mot de passe sans l’ajouter aux arguments.
- `npm run auth:create-user` : créer un compte standard local selon le même mode. Son rôle est fixé par la commande.
- `npm run auth:reset-manager-password` : remplacer le mot de passe d’un compte gestionnaire existant. La commande demande l’e-mail puis saisit le nouveau mot de passe sans l’afficher ; elle passe par le hachage et l’adaptateur Better Auth, puis révoque les sessions précédentes.

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

## Back office Studio Lueur

- Connexion gestionnaire sur `/saucisse-connection` ; le champ accepte le nom `Antho` ou l’adresse e-mail Better Auth. L’inscription publique reste désactivée et le contrôle `admin` reste côté serveur dans le layout CRM et chaque action privée.
- Better Auth accepte les deux origines locales `http://localhost:3000` et `http://127.0.0.1:3000`.
- En développement Next.js, `.env.development.local` prend priorité sur `.env.local`. Le CLI de création de compte charge aussi explicitement l’environnement `development` pour utiliser la même clé que `npm run dev`.
- Le mot de passe est saisi dans un champ masqué visuellement par des emojis saucisse, avec un bouton d’affichage. Il n’est pas stocké dans le code.
- `/crm` est le tableau de bord ; `/crm/demandes` affiche la liste filtrable ; `/crm/[id]` affiche le projet, le suivi, le contact, le budget et les échanges.
- Statuts des demandes : Nouveau, En Discussion, Acompte versé, Shooting proche, Retouche en cours, Livrée, Payée, Refusée et Annulée. Les motifs de refus autorisés sont Hors budget, Pas de réponse et Toxique.
- Statuts des contacts : Lead, Client, KO, HS et Toxique. Un contact est indépendant de ses demandes.
- La migration additive `drizzle/0002_sticky_gauntlet.sql` ajoute le statut contact, le budget en euros, le motif de refus et la table `echanges`. Elle conserve les anciens identifiants et champs. Les anciens statuts `Client` des demandes restent étiquetés `Client (historique)` et le contact associé devient `Client` ; `Perdu` devient `Refusée` sans motif inventé.
- La migration additive `drizzle/0003_broken_unus.sql` ajoute la date facultative `date_shooting_validee`, sans rétro-remplir les demandes existantes. La liste permet de trier selon la date souhaitée ; la fiche affiche et modifie aussi la date validée.
- `npm run db:enrich-demo` ajoute du contexte fictif et un budget aux cinq demandes de démonstration ciblées, sans remplacer le message d’origine. Il refuse d’agir si les enregistrements ne correspondent plus aux valeurs inspectées.
- Le graphique par prix est un exemple fictif indépendant des budgets réellement enregistrés. Les demandes et statuts du CRM proviennent de la base locale.
- Le compte gestionnaire n’a pas été créé par l’agent. Pour le créer, exécuter `npm run auth:create-manager`, saisir `Antho` et l’adresse fournie dans les invites, puis saisir le mot de passe dans l’invite masquée du CLI Better Auth. Ne pas ajouter le mot de passe à la commande.
- La migration a été appliquée à `file:data/local.sqlite`. Aucun compte, tunnel ou déploiement n’a été créé. Aucun test ni parcours navigateur n’a été exécuté pour cette étape.

## Clients, shootings, factures et rôles (2026-11-18)

- La migration Drizzle `0004_aromatic_morgan_stark.sql` ajoute `clients`, `shootings`, `factures` et `roles`. La migration additive `0005_yummy_terrax.sql` relie les shootings à un client obligatoire, rend leur demande facultative et permet aux factures d’être reliées à un client, à une demande, ou aux deux. Les clients n’ont pas de statut et restent liés un à un à un contact ; chaque demande conserve son `contact_id` obligatoire.
- Une facture porte le type Acompte ou Solde, un montant entier en centimes, un état de suivi et ses dates d’émission/paiement. États : Envoyée, Relance 1, Relance 2, Relance 3, Payée et Annulée. Une facture peut être créée depuis une demande avant le client ; à la conversion après acompte payé, les factures de cette demande sont rattachées au client. Une facture créée depuis le client peut être liée à une de ses demandes ou rester indépendante.
- Quand une facture de type Acompte liée à une demande passe à Payée, une transaction crée ou retrouve le client, rattache les factures de la demande à ce client et crée le shooting associé s’il n’existe pas. Le statut de demande n’est pas le déclencheur. Une facture d’acompte indépendante, sans demande, ne crée pas de shooting.
- Un shooting est toujours lié à un client et peut être lié à au plus une demande. Il peut être créé depuis une demande après acompte payé, ou manuellement depuis la fiche d’un client sans demande. Il porte un intitulé, un état (À organiser, Planifié, Réalisé, En retouche, Livré ou Annulé), date, horaires, lieu, personnes/moments, organisation et livrables ; les champs de demande ne sont pas copiés.
- La fiche client affiche ses demandes, shootings et factures et permet d’en créer manuellement. Les liens de demande facultatifs sur un shooting ou une facture sont validés côté serveur pour vérifier qu’ils appartiennent au client sélectionné.
- Une demande créée depuis une fiche client réutilise son contact. Une demande existante sans facture ni shooting peut être attribuée à un client ; les demandes déjà reliées à une facture ou un shooting gardent leur rattachement pour préserver l’historique.
- Une demande liée à une facture ou à un shooting ne peut pas être supprimée ; cette restriction conserve l’historique financier et opérationnel. Les demandes sans ces liens restent supprimables sans supprimer le contact ni les autres demandes.
- `roles` conserve les rôles système `admin` (accès CRM) et `user` (sans accès CRM) et accepte des rôles personnalisés avec ou sans accès CRM. `/crm/utilisateurs` permet à un administrateur de créer, modifier et supprimer un rôle non système, et d’affecter un rôle à un compte Better Auth. Chaque mutation vérifie le rôle `admin` côté serveur ; un rôle attribué ne peut pas être supprimé. Les comptes restent créés par les opérations locales existantes, sans inscription publique ni mot de passe saisi dans le CRM.
- `npm run db:seed-crm-demo` a ajouté des exemples explicitement fictifs (5 clients, 10 factures et 5 shootings) aux demandes enrichies 4, 5, 6, 8 et 9. Le script s’arrête si une ligne attendue diffère ou si des données CRM sont déjà présentes sur une demande ciblée.
- Le pré-contrôle avant `0005` a observé 5 shootings hérités et 0 shooting sans client résolvable. Après migration, la vérification ORM a observé 5 clients, 5 shootings et 10 factures, sans lien client/demande incohérent ni violation de clé étrangère.
- La vérification TypeScript `npx tsc --noEmit` a réussi. Drizzle Studio n’a pas pu être ouvert par l’agent : le port local 4983 était déjà occupé et l’outil de contrôle d’interface n’a pas pu se connecter. La base a été ciblée explicitement par les commandes de migration et d’exemples ; aucune autre base n’a été ouverte.


## Préparation Vercel et Turso — en préparation, non déployée

Aucune ressource distante n’a été inspectée ni modifiée. Le projet Vercel, la base Turso cible, ses éventuelles données et son historique de migrations restent à identifier. Aucune valeur de .env.local n’a été lue. La base locale data/local.sqlite n’a pas été modifiée.

### Configuration constatée

La connexion partagée est utilisée par le CRM, Better Auth et le script de migrations. Sur Vercel, le runtime est identifié par VERCEL=1 et la cible prioritaire est TURSO_DATABASE_URL ; si cette URL manque, la configuration échoue au lieu d’utiliser silencieusement le fichier local. En développement local, TURSO_DATABASE_URL est ignoré par défaut : DATABASE_URL explicite ou data/local.sqlite sont utilisés, ce qui préserve l’isolation. Pour toute URL distante, TURSO_AUTH_TOKEN est obligatoire. Un DATABASE_URL explicite peut servir à une commande locale d’administration distante, après vérification de la cible.

La fiche Turso de Vercel indique que l’intégration fournit TURSO_DATABASE_URL et TURSO_AUTH_TOKEN et montre leur utilisation avec createClient. La documentation Drizzle/libSQL documente aussi le passage du jeton authToken au client. Voir [l’intégration Turso sur Vercel](https://vercel.com/marketplace/tursocloud/database), [la connexion libSQL de Drizzle](https://orm.drizzle.team/docs/get-started/turso-new) et [les variables d’environnement Vercel](https://vercel.com/docs/environment-variables).

### Variables à préparer

| Nom | Usage | Qui la fournit |
|---|---|---|
| DATABASE_URL | Surcharge explicite de l’URL de base en local ; par défaut elle pointe vers file:data/local.sqlite. Vercel ignore cette variable et exige TURSO_DATABASE_URL. | Fichier local d’exemple ; ne pas créer cette variable sur Vercel |
| TURSO_DATABASE_URL | Adresse de la base distante sélectionnée | Intégration Turso installée dans le projet Vercel |
| TURSO_AUTH_TOKEN | Jeton d’accès à la base distante | Intégration Turso ; secret à ne jamais afficher |
| BETTER_AUTH_URL | Origine publique finale du site | À saisir par le participant dans Vercel |
| BETTER_AUTH_SECRET | Secret de session stable, propre à la production et d’au moins 32 caractères | À générer et saisir par le participant dans Vercel |

Vérifier le projet Vercel auquel l’intégration est liée et la base qu’elle désigne avant toute migration. Les valeurs de TURSO_DATABASE_URL, TURSO_AUTH_TOKEN et BETTER_AUTH_SECRET ne sont ni lues ni affichées par l’agent.

### Migrations locales à comparer avec la cible

Le journal Drizzle du dépôt comprend six migrations :

1. 0000_foamy_alice.sql — tables initiales contacts et demandes.
2. 0001_special_quasar.sql — tables Better Auth user, session, account et verification.
3. 0002_sticky_gauntlet.sql — évolutions CRM des contacts et demandes, statuts, budget, motifs de refus et échanges.
4. 0003_broken_unus.sql — date de shooting validée sur les demandes.
5. 0004_aromatic_morgan_stark.sql — clients, shootings, factures et rôles.
6. 0005_yummy_terrax.sql — lien client obligatoire des shootings et associations client/demande des factures.

La cible doit d’abord être examinée en lecture seule. Comparer son journal de migrations aux six fichiers ci-dessus ; conserver toutes ses lignes et ne lancer aucune remise à zéro. N’appliquer que les migrations manquantes après confirmation de la cible et de la sauvegarde. Le script npm run db:migrate passe par la configuration partagée ci-dessus.

### Comptes et statuts

- Compte A : gestionnaire, rôle Better Auth admin, accès CRM.
- Compte B : utilisateur standard, rôle Better Auth user, sans accès CRM.

Le participant choisit les identités et saisit les mots de passe dans une invite masquée. Les scripts de création de comptes existants sont destinés à l’administration locale ; il faut préparer et vérifier une opération explicite qui cible Turso avant de créer les comptes en ligne. Le nombre de comptes présents sur la cible est inconnu tant qu’elle n’a pas été inspectée.

Les quatre statuts initiaux Nouveau, En discussion, Client et Perdu sont historiques. Les états actifs des demandes sont Nouveau, En Discussion, Acompte versé, Shooting proche, Retouche en cours, Livrée, Payée, Refusée et Annulée, avec Client (historique) pour préserver les anciennes données. Ce sont des valeurs permises par les contraintes des migrations, pas des lignes à créer manuellement. Les états des shootings et des factures sont également définis dans le schéma.

### Ordre avant la mise en ligne

1. Vérifier en lecture seule le projet Vercel, l’intégration et la base cible ; confirmer que c’est la bonne base et relever son état sans exposer de valeur de variable.
2. Comparer son journal de migrations à celui du dépôt et établir la sauvegarde requise sans modifier les lignes.
3. Si l’état est cohérent, appliquer seulement les migrations manquantes, Better Auth comprise, sans effacer de données.
4. Créer les comptes A et B avec le participant et vérifier leurs rôles côté serveur.
5. Lancer le déploiement Vercel ; vérifier ensuite la session et le CRM.

Aucune de ces opérations distantes n’a été effectuée. Cette préparation ne prouve pas que la cible, ses variables ou ses migrations en ligne ont été vérifiées.
