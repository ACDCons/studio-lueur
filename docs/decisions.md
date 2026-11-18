# Décisions

- Même projet Next.js à la racine ; une landing, demande en bas, sources et Git préservés.
- SQLite local pour démarrer sans compte cloud : data/local.sqlite côté serveur Node, hors public et Git.
- Drizzle pour les tables et les migrations ; Drizzle Studio pour regarder la base en local, sans modifier à la main.
- Backend et CRM : liste des demandes, vue de suivi, quatre statuts, note et prochaine action. Paiement, agenda, relances hors V1.
- Authentification via Better Auth au bloc 3, puis autorisation du gestionnaire dans toutes les actions serveur. Les comptes du site ne sont pas un compte de service cloud.
- Développement fictif isolé avant protection ; publication distante seulement après choix et contrôles. Pas de collecte réelle pendant la formation.

- Cadrer contacts 1 → N demandes et préparer la réception et une lecture bornée au bloc 1 ; interface et quatre opérations au bloc 2 ; connexion et droits Better Auth au bloc 3.
- Suppression d’une demande : cible identifiée, confirmation ou annulation ; conserver contact et autres demandes.
