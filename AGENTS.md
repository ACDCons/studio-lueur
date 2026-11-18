# Règles · Studio Lueur

## Où lire
- Besoin : docs/brief.md ; faits : sources/studio-lueur.md.
- Tables décrites avec Drizzle ; migrations dans drizzle/, générées par Drizzle ; Drizzle Studio pour regarder la base.
- Backend : docs/backend.md ; reprise : docs/journal.md.

## Règles
- Présenter un plan puis attendre mon accord avant installation, modification, migration ou commande.
- SQLite côté serveur, avec un pilote compatible Turso (@libsql/client) dès le départ : fichier local en développement, adresse lue dans DATABASE_URL. Aucun compte cloud avant la publication, bonus de l’exercice 3.
- Cibler data/local.sqlite par un chemin stable. Aucun fichier de base dans public, Git ou les assets Next.js ; ne pas créer silencieusement une autre base.
- Ne pas lire .env.local ni exposer de secret ou mot de passe. Les mots de passe se saisissent de façon masquée, pas dans les arguments ou logs.
- Requêtes paramétrées, validation serveur et champs autorisés ; pas d’endpoint SQL générique.
- Ne rien inventer : faits, état de la base ou droits. Le départ n’a ni stockage ni CRM.
- Préserver migrations, données et historique ; pas d’effacement global ou remise à zéro pour débloquer.
- Bloc 2 : développement local isolé avec données fictives, sans tunnel ou publication. Bloc 3 : session Better Auth et gestionnaire vérifiés côté serveur sur chaque action privée. Pas de cryptographie maison ni d’inscription publique.
- Comptes A/B créés par une opération locale d’administration explicitée ; aucun rôle choisi par le navigateur.
- Les changements de structure passent par une migration autorisée ; jamais de modification de lignes à la main dans Drizzle Studio. Lister les observations, les fichiers et les limites ; aucune observation inventée.
- Publication (bonus) : site sur Vercel, base Turso créée par le participant depuis l’onglet Storage de Vercel ; lire les documentations officielles de Vercel, Turso, Drizzle et Better Auth. Appliquer toutes les migrations sur Turso, y compris celles de Better Auth, et chaque nouvelle migration aussi sur Turso avant le Push ; ne jamais afficher les valeurs des variables ; secret de session saisi par le participant ; comptes recréés en ligne. Un Push ne déplace jamais les lignes.

- Règles métier : contacts 1 → N demandes ; contact_id obligatoire, clés étrangères activées sur chaque connexion, création liée dans une transaction. Un contact métier n’est pas un utilisateur connecté.
- Bloc 1 : demande à l’IA (besoin puis technique), plan validé, base, migrations et deux demandes fictives. Bloc 2 : réception du formulaire et CRM (ajout, lecture, modification, suppression). Faire évoluer les tables par migration additive si nécessaire.
- La suppression confirmée vise une seule demande ; aucune cascade vers le contact ou les autres demandes. Pas de suppression de contact dans la V1.
- Après Better Auth, contrôler aussi création interne et suppression dans chaque action privée.
