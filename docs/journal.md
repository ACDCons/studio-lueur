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

## Back office CRM (2026-11-18)

- Ajout d’un back office local avec menu latéral, dashboard, liste filtrable et fiche de demande. Les pages CRM restent protégées par `requireManager()` au niveau du layout ; les actions privées contrôlent aussi la session et le rôle.
- Ajout de la connexion `/saucisse-connection`, avec champ utilisateur compatible avec `Antho`, masque visuel en emojis saucisse et bouton d’affichage. Le compte utilise l’adresse e-mail fournie dans Better Auth.
- Migration Drizzle additive `0002_sticky_gauntlet.sql`, générée par Drizzle puis ajustée pour préserver les valeurs préexistantes pendant la reconstruction de la table demandes. Elle ajoute les statuts de contact, les statuts de demande, le budget, les motifs de refus et l’historique d’échanges. La commande `npm run db:migrate` a ciblé explicitement `file:data/local.sqlite` et s’est terminée sans erreur.
- Conversion des statuts préexistants : Nouveau reste Nouveau ; En discussion devient En Discussion ; les demandes Client sont conservées sous `Client (historique)` et leur contact passe à Client ; Perdu devient Refusée sans motif. Les autres contacts reçoivent le statut Lead par défaut.
- Aucune ligne de budget ou d’échange n’a été inventée. Le graphique des prix utilise un exemple fictif clairement signalé ; les autres totaux lisent les demandes locales.
- Aucun compte gestionnaire n’a été créé. Le CLI d’administration existant demande le mot de passe dans une invite masquée ; l’agent n’a pas lu `.env.local` ni transmis le mot de passe dans une commande.
- Aucun test, build Next ou vérification navigateur n’a été lancé. Le back office reste local ; aucune publication ni tunnel n’a été effectué.
- Après retour sur une erreur `tsx` en format CommonJS, le flux de `scripts/create-local-account.ts` a été encapsulé dans `main()` pour supprimer les `await` au niveau supérieur. L’insertion directe dans les tables Better Auth n’est pas utilisée ; la création doit passer par le CLI Better Auth.
- Diagnostic de connexion : le compte gestionnaire existe avec le rôle admin et un credential enregistré. Le endpoint de session renvoyait `500` avec une clé locale trop courte. Une clé aléatoire de 32 caractères a été écrite dans `.env.development.local` sans l’afficher ; après redémarrage, `/api/auth/get-session` répond `200`. Le CLI de création charge désormais l’environnement `development` pour suivre la priorité des variables de Next dev. La connexion avec le mot de passe n’a pas été effectuée par l’agent.
- Ajout de `npm run auth:reset-manager-password` pour réinitialiser localement le mot de passe d’un compte `admin` via le hachage et l’adaptateur Better Auth, sans SQL manuel. Le nouveau mot de passe est saisi en mode terminal sans écho ; les sessions existantes sont révoquées.
- Correction après la première tentative : Better Auth renvoie l’utilisateur dans `findUserByEmail(...).user`. Le script vérifiait le rôle sur l’enveloppe de résultat et s’arrêtait avant toute modification. La recherche cible maintenant la propriété utilisateur correctement.
- Diagnostic de connexion : les requêtes depuis `http://localhost:3000` étaient refusées parce que seule l’origine loopback `127.0.0.1` était configurée. `src/auth.ts` fait maintenant confiance explicitement aux deux origines locales.

## Dates de séance et tri CRM (2026-11-18)

- Migration additive Drizzle `0003_broken_unus.sql` appliquée explicitement à `data/local.sqlite`. Elle ajoute `demandes.date_shooting_validee`, facultative ; aucune date historique n’a été rétro-remplie.
- La fiche affiche et permet d’éditer la date validée. La liste montre les deux dates et peut être triée par date souhaitée croissante ou décroissante, les dates manquantes restant à la fin.
- Les demandes fictives existantes 4, 5, 6, 8 et 9 ont reçu un contexte de projet ajouté à la suite du message d’origine et des budgets respectifs de 1 850 €, 480 €, 1 250 €, 390 € et 1 100 €. Le script `scripts/enrich-demo-requests.ts` vérifie les identifiants, e-mails fictifs, messages d’origine et budgets vides dans une transaction avant toute mise à jour.
- Le lien de retour en haut des fiches est plus visible ; l’action d’ouverture dans la liste est un bouton sombre à texte blanc, plus grand que le lien précédent.
- Aucune date de shooting validée n’a été inventée. Aucun test, build ou parcours navigateur n’a été exécuté pour cette modification.

## Clients, shootings, factures et rôles (2026-11-18)

- À la demande du participant, le CRM distingue maintenant les clients des contacts. Les clients n’ont pas de statut ; ils sont créés depuis le contact déjà lié à une demande lorsque sa facture d’acompte passe à Payée.
- La demande garde son contact obligatoire. Une demande manuelle peut sélectionner un client, ou une demande existante peut être attribuée à un client depuis sa fiche. Le rattachement est refusé après paiement d’un acompte.
- Le paiement d’une facture d’acompte crée, dans une transaction, le client et un shooting. La demande peut garder ses statuts propres ; changer son statut n’active pas le flux. Les shootings ont des champs dédiés photo et un état distinct ; leur liste filtre par texte, état et type de séance et se trie par date.
- Les factures enregistrent type Acompte/Solde, montant en centimes et les états demandés. Le suivi des factures reste manuel : pas d’envoi ni de relance automatique.
- La nouvelle section `/crm/utilisateurs` gère les rôles non système et affecte des rôles aux comptes existants. Les opérations sont réservées au rôle `admin` contrôlé côté serveur. Les rôles système admin/user ne peuvent pas être supprimés ; le dernier administrateur ne peut pas se retirer l’accès. Les comptes eux-mêmes continuent d’être créés par les commandes locales existantes.
- Migration Drizzle additive `drizzle/0004_aromatic_morgan_stark.sql`, générée à partir de `src/db/schema.ts`, puis complétée par l’insertion des deux rôles système. Appliquée explicitement à `file:data/local.sqlite` avec `npm run db:migrate` ; pas de remise à zéro ni modification manuelle de lignes.
- `npm run db:seed-crm-demo` a ajouté des données uniquement aux demandes fictives enrichies 4, 5, 6, 8 et 9, après vérification dans une transaction des identifiants, e-mails, débuts de messages, budgets et absence de données CRM préexistantes. Résultat : 5 clients, 10 factures et 5 shootings fictifs.
- Une demande avec facture ou shooting ne peut plus être supprimée ; la fiche explique ce blocage afin de préserver ces historiques. Les autres suppressions restent ciblées et ne touchent pas au contact ni à ses autres demandes.
- Pages et actions ajoutées pour clients, shootings, factures et utilisateurs ; les actions de statut de facture et d’édition de shooting contrôlent la session et le rôle au début de chaque appel. Les autres actions CRM existantes conservent le même contrôle.
- Le guide Next local sur layouts/pages, mutations serveur, sécurité des données et authentification a été lu avant les changements. `npx tsc --noEmit` a réussi. Aucun test automatisé, build Next ou parcours navigateur n’a été lancé.
- Drizzle Studio n’a pas pu être observé par l’agent : son port 4983 était déjà occupé et l’outil de contrôle d’interface a échoué à se connecter. Aucune observation ou mesure supplémentaire de l’état global de la base n’est revendiquée.

## Fiche client complète (2026-11-18)

- Le participant a précisé que chaque fiche client doit réunir demandes, shootings et factures, avec création manuelle des trois depuis cette fiche. Un shooting est toujours lié à un client, mais son lien à une demande est facultatif ; le lien facture/client est toujours présent dès qu’un client existe, tandis qu’une facture d’acompte pré-conversion peut d’abord être reliée à la demande seule.
- Le schéma Drizzle fait désormais porter aux shootings `client_id` obligatoire, `demande_id` facultatif et un intitulé propre. Les factures portent des liens facultatifs vers client et demande, avec une contrainte empêchant une facture sans aucun propriétaire. Un `demande_id` sur un shooting reste unique lorsqu’il existe.
- Migration additive Drizzle `0005_yummy_terrax.sql` reconstruit les deux tables en conservant les identifiants, dates, montants et états. Elle rattache les anciens shootings aux clients par le contact de leur demande et attribue un intitulé générique basé sur l’identifiant de demande ; les factures existantes reçoivent le client correspondant lorsqu’il existe.
- Pré-contrôle avant migration, avec `scripts/preflight-shooting-clients.ts` : 5 shootings hérités, 0 client manquant. Migration appliquée à `file:data/local.sqlite` par `npm run db:migrate`.
- La fiche client affiche maintenant les demandes, shootings et factures, et permet de créer chacun manuellement. Un shooting manuel peut être sans demande ; une facture manuelle peut être sans demande. Les demandes éventuellement choisies sont contrôlées côté serveur et doivent appartenir au client.
- Le changement de statut d’un acompte lié à une demande vers Payée crée ou retrouve le client, rattache toutes les factures de cette demande à ce client, et crée le shooting lié s’il n’existe pas. Un acompte sans demande ne crée aucun shooting.
- Vérification ORM en lecture seule via `scripts/check-client-links.ts` : 5 clients, 5 shootings, 10 factures, aucune incohérence de lien et aucune violation de clé étrangère. La base locale a été ciblée explicitement.
- Les pages de liste des shootings et factures prennent maintenant en charge les liens facultatifs vers une demande. Le tri/filtre des shootings distingue leur origine manuelle ou liée à une demande.
- Drizzle Studio et le parcours visuel restent non vérifiés ; l’échec d’accès à l’interface et le port 4983 déjà occupé sont consignés dans l’entrée précédente. Aucun test automatisé ni build Next n’a été lancé pour cette évolution.

## État de travail

- Tous les changements après le commit initial `34861bf` restent non commités, y compris `package-lock.json`.
- `tsconfig.json` conserve la modification apparue précédemment (`jsx: react-jsx` et `.next/dev/types/**/*.ts` dans `include`) ; elle n’a pas été retouchée dans le bloc 3.
