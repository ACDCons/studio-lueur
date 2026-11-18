# Décisions — Studio Lueur

## Modèle métier

- Un contact peut avoir plusieurs demandes. Chaque demande garde un contact obligatoire et une clé étrangère activée sur chaque connexion.
- Un contact n’est ni un client ni un utilisateur connecté. Un client n’a pas de statut.
- Une facture d’Acompte liée à une demande qui passe à Payée déclenche, dans une transaction, la création ou la récupération du client, le rattachement des factures de la demande et la création du shooting associé s’il n’existe pas. Changer le statut de la demande en Payée ne déclenche pas cette conversion.
- Les demandes ont leurs propres champs de suivi. Les shootings ont des champs photo dédiés : titre, état, date, heures, lieu, personnes et moments, organisation et livrables.
- Tout shooting doit appartenir à un client ; son lien à une demande est facultatif. Il peut être créé manuellement depuis un client sans demande.
- Une demande peut être créée depuis la fiche d’un client. Une demande existante peut être attribuée à un client depuis sa fiche lorsqu’elle n’a pas déjà de facture ou de shooting lié. Les associations sont validées côté serveur.
- Depuis la fiche client, création manuelle possible d’une demande, d’un shooting ou d’une facture. Une demande facultative choisie pour un shooting ou une facture doit appartenir au même client.
- Une facture est de type Acompte ou Solde et suit l’un des états Envoyée, Relance 1, Relance 2, Relance 3, Payée ou Annulée. Le suivi est manuel, sans envoi ou relance automatique.
- La suppression d’une demande avec facture ou shooting est refusée afin de conserver l’historique. La suppression d’une demande admissible ne supprime ni son contact ni ses autres demandes. Il n’y a pas de suppression de contact dans la V1.

## États et statuts

Les états actifs des demandes sont : Nouveau, En Discussion, Acompte versé, Shooting proche, Retouche en cours, Livrée, Payée, Refusée et Annulée. Client (historique) est gardé pour préserver d’anciennes données. Les états des shootings sont : À organiser, Planifié, Réalisé, En retouche, Livré et Annulé.

Le brief pédagogique initial citait quatre statuts de demande : Nouveau, En discussion, Client et Perdu. Ils décrivent l’historique du premier exercice. Ils ont été remplacés dans le CRM actuel par les états ci-dessus ; la migration 0002 conserve les anciennes valeurs sous forme historique ou les convertit. Les statuts sont des valeurs contraintes dans le schéma, pas quatre lignes à insérer manuellement. En publication, appliquer les migrations prévues et ne pas créer une seconde liste de statuts sans décision distincte.

Les statuts de contact (Lead, Client, KO, HS, Toxique) sont indépendants de l’entité client, qui n’a pas de statut.

## Authentification et rôles

- Better Auth gère les identifiants et les sessions ; aucune inscription publique.
- Les rôles système sont admin (accès CRM) et user (sans accès CRM).
- La section Utilisateurs permet de créer, modifier et supprimer les rôles non système et d’attribuer un rôle aux comptes existants. Les contrôles sont faits côté serveur ; les rôles système ne peuvent pas être supprimés.
- La création de comptes reste une opération d’administration explicite. Aucun rôle n’est choisi par le navigateur.

## Stockage et publication

- En local, la base est data/local.sqlite, servie par libSQL et décrite avec Drizzle. Les migrations sont générées par Drizzle et conservées dans drizzle/.
- La cible prévue est une base Turso créée par le participant depuis l’onglet Storage de Vercel.
- La publication doit préserver la base locale et toute donnée déjà présente en ligne. On vérifie en lecture seule le projet Vercel, la base cible et son historique de migrations avant d’appliquer quoi que ce soit.
- Un Push GitHub ne copie pas les lignes de la base locale. Les données d’exemple ne sont pas à transférer.
- L’intégration Vercel fournit les variables de connexion Turso ; le participant saisit les secrets Better Auth dans Vercel. Aucun secret n’est lu ou affiché.
- La publication n’a pas encore été effectuée ; les variables et la cible distante n’ont pas encore été vérifiées.
