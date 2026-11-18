# Brief fonctionnel — Studio Lueur

## Besoin

Studio Lueur est un studio photo fictif. Le CRM doit permettre de suivre les demandes entrantes puis, après paiement d’un acompte, les clients et le travail photo associé. Les exemples de projets ajoutés aux demandes sont fictifs.

## Sections du CRM

- **Demandes** : liste avec filtres et tris, création, consultation, modification et suppression ciblée quand aucun historique financier ou opérationnel n’y est lié.
- **Clients** : liste et fiche client. Le client n’a pas de statut propre. Sa fiche affiche ses demandes, shootings et factures et permet d’en créer manuellement.
- **Shootings** : liste avec filtres et tris et fiche métier dédiée à la prise de vue. Les champs de shooting ne sont pas une copie des champs de demande.
- **Factures** : liste des factures et suivi manuel des factures d’acompte et de solde.
- **Utilisateurs** : gestion des rôles CRM et attribution d’un rôle aux comptes Better Auth existants.

## Règles métier

Un contact peut avoir plusieurs demandes ; chaque demande reste liée à un contact. Un client est créé ou retrouvé lorsqu’une facture de type Acompte liée à une demande passe à l’état Payée. C’est le paiement de la facture qui déclenche la conversion et la création du shooting lié ; modifier manuellement le statut de la demande ne déclenche pas ce flux.

Une demande peut être créée depuis un client, ou une demande déjà créée depuis Toutes les demandes peut être attribuée à un client si elle n’a pas déjà d’historique de facture ou de shooting incompatible. Depuis la fiche d’un client, on peut créer manuellement une demande, un shooting ou une facture.

Tout shooting est lié à un client ; son lien vers une demande est facultatif. Une facture peut être liée à un client, à une demande, ou aux deux. Si les deux liens sont présents, ils doivent correspondre au même client. Une facture d’acompte liée à une demande peut exister avant la création du client.

Les factures ont deux types : Acompte et Solde. Leurs états de suivi sont Envoyée, Relance 1, Relance 2, Relance 3, Payée et Annulée. Les changements d’état sont manuels ; l’envoi et les relances automatiques ne font pas partie du périmètre.

## États suivis

Les états de demande actifs sont Nouveau, En Discussion, Acompte versé, Shooting proche, Retouche en cours, Livrée, Payée, Refusée et Annulée. La valeur Client (historique) est conservée pour d’anciennes lignes. Les shootings suivent leur propre cycle : À organiser, Planifié, Réalisé, En retouche, Livré ou Annulé.

Les contacts ont un statut de suivi de prospect ; ce statut ne devient pas un statut de client. Le client métier n’a aucun champ de statut.

## Accès et données

Better Auth gère les sessions. L’inscription publique est désactivée. Chaque page et action privée vérifie la session et l’autorisation côté serveur. Les mots de passe ne sont jamais transmis dans les arguments de commande ou les logs.

Le développement et les données de démonstration restent locaux et fictifs. Aucune donnée de SQLite locale ne sera transférée par un Push GitHub. La publication Vercel/Turso est une étape séparée, soumise à vérification de la cible, des variables et des migrations avant toute opération distante.
