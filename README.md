# Studio Lueur · les trois exercices du soir 3

Départ pédagogique préparé au niveau du soir 2 : landing Next.js d’une page et demande de démonstration, sans stockage ni CRM. Aucun historique Git ou fichier SQLite fourni.

Ouvrir ce dossier `studio-lueur` dans Paseo, pas l’enveloppe de l’archive. Lire [le brief](docs/brief.md), [les faits fictifs](sources/studio-lueur.md), AGENTS.md et [le journal](docs/journal.md). Garder ce dossier, les documents, la base et l’historique pendant les trois exercices.

## Trois résultats progressifs

1. **Préparer la base** : une demande claire à l’IA, base SQLite locale (libSQL, Drizzle), dossiers data/ et drizzle/, Léa et ses deux demandes, vues dans Drizzle Studio.
2. **Développer le back** : le formulaire enregistre ; le CRM retrouve, modifie, supprime la bonne demande.
3. **Sécuriser les accès** : Better Auth, comptes A/B, contrôle du gestionnaire sur la page et chaque action, preuve avec trois identités. Publication Vercel + Turso en bonus.

Le plan, l’effet des commandes et la destination sont expliqués avant accord. Préserver les données : aucune remise à zéro pour contourner un problème. Les repères C1/D1/D2 du cours sont illustratifs ; noter et comparer les identifiants réellement obtenus.

## Démarrage déjà enseigné au soir 2

Préparer Git si nécessaire et conserver le départ. Après votre accord, dans le terminal du dossier : `npm install` puis `npm run dev` pour la landing. Garder le terminal visible. Avant de développer le CRM non protégé au bloc 2, faire préparer un lancement adapté limité à 127.0.0.1, sans tunnel ou partage réseau.

Node/npm/Next sont les prérequis du soir 2. Le pilote SQLite compatible avec votre environnement est proposé puis installé pendant l’exercice après accord.

## Voir la base sans logiciel supplémentaire

Aucune base au départ. Une fois la base créée (avec Drizzle, après accord) : Lancer `npm run db:studio` dans un deuxième terminal et ouvrir l’adresse dans Chrome (Safari et Brave bloquent la page) : on y voit les tables et les lignes. On regarde, on ne modifie rien à la main. Comparer avec votre demande.

## Limites et reprise

Données fictives seulement, jamais un fichier de vrais clients pour expliquer la structure. SQLite et ses journaux, exports/sauvegardes et secrets hors public/Git. Valeurs personnelles hors chat, arguments et logs. En cas de blocage : message exact, destination et dernier point atteint dans le journal ; accompagnement sur le même dossier.

Le passage en ligne est une étape séparée : stockage durable et pilotes compatibles, migrations et transfert décidés, nouveaux réglages et accès à observer. Push ne transfère pas les lignes de SQLite. Aucune création de compte cloud ou vraie collecte obligatoire pendant ces exercices.
