# Étape 4 — Description de l’app idéale

## Objectif de l’app

L’app idéale est une **Visual Release Review App**.

Elle sert à montrer l’état visuel actuel d’une release mensuelle de figurines, organisée par tiers, avec une mise à jour quotidienne simple et une review rapide par l’Art Director et le Technical Supervisor.

Elle ne doit pas devenir un outil de project management.

---

## Définition courte

```text
Une app visuelle pour suivre et reviewer l’état courant d’une release,
modèle par modèle, tier par tier,
avec les dernières images visibles,
des statuts couleur,
et une mise à jour quotidienne simple par 1–2 updaters.
```

---

## Ce que l’app doit remplacer

L’app remplace le board Photoshop actuel.

Elle doit garder les avantages du board Photoshop :

- vision globale de toute la release ;
- organisation visuelle ;
- lecture rapide par l’Art Director ;
- support de review simple.

Elle doit corriger ses limites :

- fichiers lourds ;
- collaboration difficile ;
- confusion possible sur la dernière version ;
- mises à jour manuelles peu fluides ;
- difficulté de review à plusieurs.

---

## Ce que l’app ne doit pas remplacer

L’app ne remplace pas :

- le thread de conversation ;
- Loom ;
- le feedback de l’Art Director ;
- les habitudes de production ;
- la responsabilité des sculpteurs de poster leurs images ;
- le rôle de l’assistant / updater.

Le thread et Loom restent la **source de vérité du feedback**.  
L’app est la **source visuelle de l’état courant**.

---

## Principe produit central

```text
L’app montre ce qui doit être reviewé maintenant.
```

Elle n’a pas besoin de tout faire.

Elle doit surtout permettre de répondre rapidement à ces questions :

- Qu’est-ce qui est dans la release ?
- Où en est chaque modèle ?
- Quelle est la dernière version visible ?
- Qu’est-ce qui est prêt à reviewer ?
- Qu’est-ce qui est approuvé ?
- Sur quoi l’Art Director doit-il se concentrer aujourd’hui ?

---

## Structure générale de l’app

```text
Release
  ├ Tier
  │   ├ SKU / Group
  │   │   ├ Model Card
  │   │   ├ Model Card
  │   │   └ Model Card
  │   └ SKU / Group
  │       └ Model Card
  └ Tier
      └ Model Card
```

---

## Objets principaux

### 1. Release

Une release représente une sortie mensuelle ou un update d’ancienne release.

Une release contient :

- nom de la release ;
- mois / date ;
- type de release ;
- tiers ;
- cartes modèles ;
- statut général optionnel.

Exemples :

```text
Release — July 2026
Release — August 2026
Update — March 2024 Release
```

---

### 2. Tier

Un tier est une section de la release.

Il correspond à la manière dont la release est vendue, présentée ou reviewée.

Un tier contient :

- nom du tier ;
- ordre d’affichage ;
- cartes modèles ou groupes de modèles.

Exemple :

```text
Tier 1
Tier 2
Tier 3
Bonus
Update models
```

---

### 3. SKU / Group

Un SKU ou groupe représente un ensemble de modèles liés.

Certains SKUs peuvent contenir un seul modèle.  
D’autres peuvent contenir un groupe de 3 à 5 modèles.

Exemples :

```text
Hero
Troop Unit
Monster
Terrain Set
Character Pack
```

Un SKU peut être affiché comme :

```text
SKU
  ├ Model Card
  ├ Model Card
  └ Model Card
```

ou comme une seule carte de groupe si cela est plus lisible.

---

### 4. Model Card

La carte modèle est l’objet principal de review.

Elle contient :

- nom du modèle ;
- artiste / sculpteur assigné ;
- date due ;
- statut ;
- image principale ;
- images détail optionnelles ;
- lien thread optionnel ;
- lien Loom optionnel ;
- notes courtes optionnelles ;
- versions précédentes optionnelles.

Visuellement :

```text
┌─────────────────────────────┐
│                             │
│      Main sculpt image      │
│                             │
├──────────────┬──────────────┤
│ Detail view  │ Back view    │
└──────────────┴──────────────┘

Model name
Artist
Due date
Status
```

---

### 5. Image

Une image peut être :

- image principale ;
- image détail ;
- vue arrière ;
- vue alternative ;
- image avant/après ;
- ancienne version archivée.

Le plus important est que la carte visible montre toujours la version actuelle.

```text
Visible card = current useful version
Archive = previous versions if needed
```

---

### 6. Status

Le statut est un indicateur visuel simple.

```text
Gray    = Sketch
Blue    = Sculpt WIP
Orange  = Review
Green   = Approved / Finished
```

Le statut ne doit pas devenir un workflow complexe.  
Il sert surtout à lire l’état de la release en un coup d’œil.

---

### 7. Archive / Version History

L’archive sert à retrouver les anciennes versions si nécessaire.

Mais l’archive ne doit pas encombrer la vue principale.

Principe :

```text
Board principal = dernière version actuelle
Archive = anciennes versions
```

L’archive peut être simple au départ :

- date d’upload ;
- image ;
- statut au moment de l’upload ;
- note courte optionnelle.

---

### 8. User Role

Les rôles doivent rester simples.

```text
Admin / Owner
Assistant / Updater
Art Director
Technical Supervisor
Viewer
```

Mais dans le MVP, il est possible de commencer avec seulement deux niveaux :

```text
Editor
Viewer
```

L’important est que les sculpteurs ne soient pas obligés d’administrer l’app.

---

## Rôles dans l’app

### Art Director

L’Art Director utilise l’app pour :

- voir toute la release ;
- review par tier ;
- ouvrir une carte modèle ;
- voir l’image principale en grand ;
- regarder les images détail ;
- comprendre rapidement le statut ;
- donner son feedback via Loom ou le thread.

L’expérience doit être rapide, visuelle, et sans friction.

---

### Technical Supervisor

Le Technical Supervisor utilise l’app pour :

- vérifier l’état technique des modèles ;
- review avec ou après l’Art Director ;
- identifier les modèles à corriger ;
- utiliser les liens Loom / thread si nécessaire.

---

### Assistant / Updater

L’assistant / updater utilise l’app pour :

- créer une release depuis un template ;
- mettre à jour les images ;
- remplacer la version visible ;
- ajouter des images détail ;
- changer le statut couleur ;
- ajouter un lien Loom ou thread si utile ;
- garder le board prêt pour la review quotidienne.

---

### Sculpteurs

Les sculpteurs n’ont pas besoin de gérer l’app.

Ils continuent à :

- produire les modèles ;
- poster les images dans le thread ;
- fournir les vues nécessaires ;
- recevoir le feedback via Loom / thread.

---

## Types de release

L’app doit permettre au minimum deux types de boards.

### 1. Monthly Release Board

Board principal pour une release mensuelle.

```text
Monthly Release
  ├ Tier 1
  ├ Tier 2
  └ Tier 3
```

C’est le cas d’usage principal.

---

### 2. Update Board

Board plus petit pour mettre à jour une ancienne release.

```text
Update Board
  ├ Updated Model
  ├ Updated Model
  └ Updated Model
```

Ce board doit être rapide à créer et limité aux modèles concernés.

Il peut éventuellement utiliser une structure :

```text
Before / After
```

si cela aide la review.

---

## Templates

Les templates sont importants parce que les releases ont souvent une structure similaire.

L’app doit permettre de créer une nouvelle release depuis un template.

```text
Release Template
  ↓ duplicate
Release — July
  ↓ duplicate
Release — August
```

Un template contient :

- tiers habituels ;
- emplacements de cartes ;
- types de cartes ;
- structure visuelle ;
- statuts par défaut ;
- éventuellement noms de slots récurrents.

Objectif :

```text
Créer une nouvelle release ne doit pas nécessiter de reconstruire le board.
```

---

## Vue principale

La vue principale doit être visuelle.

Elle doit ressembler davantage à un mur de review qu’à une base de données.

```text
Release — July 2026

Tier 1
[Card][Card][Card][Card]

Tier 2
[Card][Card][Card]

Tier 3
[Monster Card][Terrain Card]
```

L’Art Director doit pouvoir comprendre la release sans lire un tableau.

---

## Focus View

Quand on clique sur une carte, l’app doit ouvrir une vue focus.

```text
Model Focus View

[Large main image]

[Detail] [Back View] [Alt Angle]

Model name
Artist
Due date
Status
Links
Notes
```

Cette vue sert à reviewer un modèle précisément.

Elle doit donner plus de place à l’image que la carte du board.

---

## Mise à jour quotidienne

La mise à jour doit être très simple.

```text
Open app
  ↓
Open current release
  ↓
Select card
  ↓
Replace main image
  ↓
Add detail images if needed
  ↓
Change status color
  ↓
Save
```

L’app doit réduire le temps de mise à jour, pas créer une charge de travail supplémentaire.

---

## Priorité produit

L’app doit être pensée dans cet ordre :

```text
1. Visual review experience
2. Fast daily update
3. Clear latest version
4. Simple status indicators
5. Template-based monthly setup
6. Lightweight archive
```

Pas dans cet ordre :

```text
1. Management dashboards
2. Task tracking
3. Notifications
4. Complex permissions
5. Reporting
```

---

## MVP recommandé

Le MVP doit contenir :

- création d’une release ;
- création depuis template ;
- tiers ;
- cartes modèles ;
- image principale ;
- images détail ;
- statut couleur ;
- vue focus ;
- remplacement d’image ;
- archive simple des anciennes images ;
- liens Loom / thread optionnels.

---

## À éviter dans le MVP

Ne pas ajouter au départ :

- kanban complexe ;
- gestion de tâches détaillée ;
- dépendances ;
- notifications ;
- analytics ;
- système complet de commentaires ;
- messagerie interne ;
- dashboards de management.

Ces fonctionnalités peuvent être discutées plus tard, mais elles ne doivent pas guider la première version.

---

## Résumé

L’app idéale est une version sur mesure du board visuel actuel.

Elle doit être :

- visuelle ;
- simple ;
- rapide ;
- centrée sur l’Art Director ;
- facile à maintenir par un updater ;
- organisée par tiers ;
- claire sur la dernière version visible ;
- connectée au workflow existant via Loom et le thread.

Principe final :

```text
The app is not where production is managed.
The app is where the release is visually reviewed.
```
