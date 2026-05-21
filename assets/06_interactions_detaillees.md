# Étape 6 — Interactions détaillées

## Objectif

Définir les interactions principales de l’app.

Cette étape est importante parce qu’elle traduit le workflow humain en actions concrètes dans l’interface.

L’app doit rester simple :

```text
L’Art Director review.
L’Assistant / Updater met à jour.
Les sculpteurs fournissent les images.
Le thread + Loom gardent le feedback.
```

---

# 1. Interaction principale : review par l’Art Director

## Objectif

Permettre à l’Art Director de voir la release, de naviguer rapidement, et de reviewer un modèle en grand.

## Parcours

```text
Open app
  ↓
Open current release
  ↓
Scan board by tier
  ↓
Click model card
  ↓
Open Model Focus View
  ↓
Review main image and details
  ↓
Give feedback in Loom / thread
```

## Actions nécessaires

L’Art Director doit pouvoir :

- ouvrir une release ;
- voir toute la release organisée par tier ;
- cliquer sur une carte modèle ;
- voir l’image principale en grand ;
- voir les images détail ;
- lire le statut ;
- ouvrir un lien Loom ou thread si disponible ;
- fermer la vue focus et revenir au board.

## Ce qu’il ne doit pas avoir besoin de faire

L’Art Director ne doit pas avoir besoin de :

- gérer des tâches ;
- remplir des champs obligatoires ;
- administrer le board ;
- déplacer les cartes ;
- gérer les versions ;
- maintenir les données.

Son expérience doit rester visuelle.

---

# 2. Interaction principale : mise à jour quotidienne par l’Assistant / Updater

## Objectif

Permettre à une ou deux personnes de mettre à jour le board rapidement chaque jour.

## Parcours

```text
Open thread
  ↓
Collect latest images
  ↓
Open current release board
  ↓
Find relevant model card
  ↓
Replace main image
  ↓
Add detail images if needed
  ↓
Update status color if needed
  ↓
Save
```

## Actions nécessaires

L’Assistant / Updater doit pouvoir :

- ouvrir la release du mois ;
- trouver rapidement une carte modèle ;
- remplacer l’image principale ;
- ajouter une image détail ;
- remplacer une image détail ;
- changer le statut ;
- modifier le nom du modèle si nécessaire ;
- modifier l’artiste assigné ;
- modifier la due date ;
- ajouter un lien Loom ;
- ajouter un lien thread ;
- ajouter une note courte ;
- sauvegarder ;
- revenir au board.

## Interaction idéale

La mise à jour doit fonctionner comme ceci :

```text
Click card
  ↓
Click Edit / Update
  ↓
Drop new image
  ↓
Choose status
  ↓
Save
```

La mise à jour ne doit pas nécessiter plusieurs écrans compliqués.

---

# 3. Interaction : remplacement d’image principale

## Objectif

Garantir que la carte visible montre toujours la dernière version utile à reviewer.

## Comportement attendu

Quand l’updater remplace l’image principale :

```text
New image uploaded
  ↓
Old image optionally moves to archive
  ↓
New image becomes visible on board
```

## Options possibles

L’app peut proposer :

```text
Replace image only
```

ou :

```text
Replace image + archive previous version
```

## Règle recommandée

Par défaut :

```text
Replacing main image archives the previous image automatically.
```

Mais l’archive doit rester discrète.

---

# 4. Interaction : ajout d’images détail

## Objectif

Permettre de montrer plusieurs vues utiles sans encombrer le board principal.

## Exemples d’images détail

- close-up visage ;
- dos ;
- arme ;
- pose alternative ;
- détail technique ;
- comparaison avant/après.

## Comportement attendu

Dans la carte :

```text
Main image
Detail image 1
Detail image 2
```

Dans la Focus View :

```text
Large main image
[Detail] [Back View] [Alt Angle]
```

Les images détail doivent être optionnelles.

---

# 5. Interaction : changement de statut

## Objectif

Permettre de comprendre l’état de la release immédiatement.

## Statuts recommandés

```text
Gray    = Sketch
Blue    = Sculpt WIP
Orange  = Review
Green   = Approved / Finished
```

## Comportement attendu

Quand l’updater change le statut :

```text
Select card
  ↓
Change status
  ↓
Card border color updates
```

Le statut doit être visuel avant tout.

Il ne doit pas déclencher de workflow complexe dans le MVP.

---

# 6. Interaction : création d’une release depuis un template

## Objectif

Éviter de reconstruire le board chaque mois.

## Parcours

```text
Open templates
  ↓
Choose Monthly Release Template
  ↓
Create new release
  ↓
Enter release name / month
  ↓
Board is created with tiers and cards
```

## Résultat attendu

La nouvelle release contient déjà :

- les tiers ;
- les cartes vides ;
- les types de cartes ;
- la légende des statuts ;
- la structure visuelle.

L’updater ne doit plus qu’ajouter ou remplacer les images.

---

# 7. Interaction : création d’un update board

## Objectif

Créer un board plus petit pour les updates d’anciennes releases.

## Parcours

```text
Create update board
  ↓
Choose source release / name
  ↓
Add only updated models
  ↓
Review updated models
```

## Spécificité

L’update board peut avoir une logique différente :

```text
Before / After
```

ou :

```text
Old version / New version
```

Mais uniquement si cela aide la review.

---

# 8. Interaction : consultation de l’archive

## Objectif

Permettre de retrouver les anciennes versions sans polluer la vue principale.

## Parcours

```text
Open model card
  ↓
Click Archive
  ↓
View previous versions
  ↓
Optionally restore or compare
```

## Ce que l’archive doit montrer

- image ;
- date d’upload ;
- statut à ce moment ;
- note courte optionnelle.

## Règle

L’archive ne doit jamais devenir la vue principale.

```text
Main board = current state
Archive = reference only
```

---

# 9. Interaction : liens Loom et thread

## Objectif

Relier l’app au système de feedback existant sans le remplacer.

## Comportement attendu

Chaque carte peut contenir :

- un lien vers le thread ;
- un lien vers un Loom ;
- une note courte.

Exemple :

```text
Loom feedback: [Open]
Thread: [Open]
```

L’app ne doit pas essayer de remplacer Loom ou le thread.

---

# 10. Interaction : recherche / navigation rapide

## Objectif

Aider à retrouver rapidement une carte dans une grosse release.

## Interactions utiles

- search by model name ;
- jump to tier ;
- filter by status ;
- show only cards in Review ;
- show only WIP cards.

## Priorité

Utile, mais pas prioritaire avant le board principal.

---

# 11. Rôles et permissions

## MVP simple

Dans un premier MVP, deux rôles peuvent suffire :

```text
Editor
Viewer
```

## Editor

Peut :

- créer une release ;
- éditer une carte ;
- remplacer images ;
- changer statut ;
- gérer templates.

## Viewer

Peut :

- ouvrir une release ;
- cliquer sur les cartes ;
- voir les images ;
- ouvrir les liens.

## Rôles plus avancés plus tard

```text
Admin
Updater
Art Director
Technical Supervisor
Viewer
```

Mais il ne faut pas complexifier trop tôt.

---

# 12. Interactions à éviter au début

Ne pas ajouter dans le MVP :

- assignation de tâches complexe ;
- deadlines automatisées ;
- notifications ;
- commentaires internes complets ;
- approval workflow lourd ;
- dépendances ;
- kanban ;
- reporting ;
- analytics.

Ces éléments peuvent être ajoutés plus tard seulement s’ils deviennent vraiment nécessaires.

---

# Résumé des interactions MVP

Le MVP doit permettre principalement :

```text
Create release from template
Open release board
Click model card
Review focus view
Replace image
Add detail images
Change status
Open Loom / thread link
Archive previous image
```

La règle centrale :

```text
Every interaction must support either visual review or fast daily update.
```
