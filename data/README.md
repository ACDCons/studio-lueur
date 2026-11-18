# La base du projet

- `local.sqlite` : données de développement, créées pendant l’exercice ; hors Git et hors public.
- Les migrations sont dans `drizzle/`, à la racine : préparées par Drizzle, relues puis appliquées après accord ; à conserver dans Git.
- Drizzle Studio (`npx drizzle-kit studio`, dans Chrome) : pour regarder les tables et les lignes, sans les modifier.

Aucun fichier de base ni solution des exercices n’est fourni. Deux tables métier à produire au bloc 1 : `contacts` et `demandes`, reliées par contact_id ; au bloc 3, les tables et relations d’authentification suivent la bibliothèque choisie, pas un schéma de mots de passe improvisé.

Studio est une fenêtre, pas une sauvegarde : il ne garde rien.

Studio ne sauvegarde pas les demandes. Prévoir une sauvegarde SQLite cohérente ; ne pas copier à chaud uniquement le fichier principal si un journal WAL est en cours d’usage. Les droits du fichier et du serveur restent à gérer.
