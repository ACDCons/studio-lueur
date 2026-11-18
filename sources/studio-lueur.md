# Studio Lueur — faits fictifs et décisions validées

Studio Lueur est le studio fictif de Nora, photographe indépendante. Ce cas pédagogique est distinct du projet final Thomas. Aucun fait sur une entreprise réelle n’est fourni ici.

## Contexte initial fourni

- Séances proposées : mariages, portraits et événements d’entreprise.
- Les demandes arrivent par la section « Demander une séance » au bas de la landing.
- Une demande contient le nom, l’adresse e-mail, le type de séance, une date souhaitée facultative et un message.
- Le brief initial indiquait que Nora était la seule personne autorisée à consulter les demandes.
- Les quatre statuts du premier exercice étaient Nouveau, En discussion, Client et Perdu. Ils sont historiques et ne sont pas la liste actuelle du CRM.

## Décisions CRM validées

- Un contact peut avoir plusieurs demandes. Chaque demande possède un contact obligatoire.
- Le client est une entité métier sans statut, distincte du contact et du compte utilisateur.
- Une facture d’acompte liée à une demande devient le déclencheur : quand son état passe à Payée, le CRM crée ou retrouve le client et crée le shooting lié. Le changement manuel du statut de la demande ne déclenche pas ce flux.
- Le CRM courant suit les demandes avec les états Nouveau, En Discussion, Acompte versé, Shooting proche, Retouche en cours, Livrée, Payée, Refusée et Annulée. L’ancienne valeur Client (historique) est conservée pour les données antérieures.
- Depuis un client, on peut créer une demande, un shooting ou une facture. Un shooting appartient toujours à un client, mais n’a pas obligatoirement une demande. Une demande préexistante peut être attribuée à un client selon les règles d’historique.
- Les factures sont de type Acompte ou Solde et suivent les états Envoyée, Relance 1, Relance 2, Relance 3, Payée ou Annulée.
- Better Auth et la gestion de rôles sont utilisés dans l’espace privé. Il n’y a pas d’inscription publique.

## Exemples de projets ajoutés

Les contextes photo et budgets fictifs ajoutés aux demandes 4, 5, 6, 8 et 9 sont des données de démonstration. Les adresses d’exemple utilisent le domaine réservé .invalid. Elles ne décrivent pas de clients réels.

## Faits non fournis : ne pas inventer

Tarifs réels, disponibilités, délais de réponse, avis clients, adresse, zone d’intervention, identité réelle des clients, et politique de conservation des données restent inconnus.

## Données personnelles

Les noms et adresses e-mail des demandes sont des données personnelles. Dans l’exercice, elles servent à répondre à la demande. La durée de conservation réelle reste à confirmer avec la personne responsable du studio.
