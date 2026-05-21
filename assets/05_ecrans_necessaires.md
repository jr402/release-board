# Étape 5 — Écrans nécessaires

## Objectif

Définir les écrans nécessaires pour construire l’app de manière simple, progressive et utile.

L’objectif n’est pas de créer une app complète dès le départ.  
L’objectif est de construire d’abord le minimum qui permet :

- de créer une release ;
- d’afficher un board visuel par tiers ;
- de mettre à jour les images ;
- de reviewer un modèle en grand ;
- de garder une trace simple des anciennes versions si nécessaire.

---

## Principe général

L’app doit être pensée autour de l’expérience suivante :

```text
Open app
  ↓
Choose release
  ↓
View release board
  ↓
Click model card
  ↓
Review model in focus view
  ↓
Updater replaces images when needed
```

Le cœur de l’app est donc le **Release Board**.

Tous les autres écrans existent pour servir ce board.

---

# Liste des écrans

## 1. Release Dashboard

### Rôle

Écran d’accueil de l’app.

Il permet de choisir une release existante ou d’en créer une nouvelle.

### Ce qu’il doit montrer

- releases mensuelles en cours ;
- anciennes releases ;
- update boards ;
- bouton “Create new release” ;
- bouton “Create from template”.

### Exemple simple

```text
Release Dashboard

Current Releases
[Release — July 2026]
[Release — August 2026]

Update Boards
[Update — March 2024 Release]

Templates
[Monthly Release Template]
[Update Board Template]
```

### Priorité

MVP utile, mais simple.

Cet écran ne doit pas devenir un dashboard de management.

---

## 2. Monthly Release Board

### Rôle

Écran principal de l’app.

C’est l’équivalent du board Photoshop / Figma.

### Ce qu’il doit montrer

- nom de la release ;
- sections par tier ;
- cartes modèles ;
- statut visuel par couleur ;
- image principale de chaque modèle ;
- éventuellement mini-images détail ;
- navigation simple.

### Exemple

```text
Release — July 2026

Tier 1
[Card][Card][Card][Card]

Tier 2
[Card][Card][Card]

Tier 3
[Monster Card][Terrain Card]
```

### Priorité

MVP indispensable.

C’est l’écran le plus important de toute l’app.

---

## 3. Model Focus View

### Rôle

Vue détaillée d’un modèle.

Elle s’ouvre quand l’Art Director ou le Technical Supervisor clique sur une carte.

### Ce qu’elle doit montrer

- grande image principale ;
- images détail ;
- vue arrière / vue alternative ;
- nom du modèle ;
- artiste ;
- due date ;
- statut ;
- lien Loom optionnel ;
- lien thread optionnel ;
- notes courtes optionnelles ;
- bouton pour voir l’archive si disponible.

### Exemple

```text
Model Focus View

[Large main image]

[Detail] [Back View] [Alt Angle]

Model name
Artist
Due date
Status
Loom link
Thread link
Notes
```

### Priorité

MVP indispensable.

C’est l’écran central pour la review du modèle.

---

## 4. Update / Upload Panel

### Rôle

Permettre à l’assistant / updater de mettre à jour une carte rapidement.

Cet écran peut être un panneau latéral ou une modal.

### Ce qu’il doit permettre

- remplacer l’image principale ;
- ajouter / remplacer des images détail ;
- changer le statut ;
- modifier l’artiste ;
- modifier la due date ;
- ajouter un lien Loom ;
- ajouter un lien thread ;
- ajouter une note courte ;
- archiver l’image précédente si nécessaire.

### Exemple

```text
Update Card

Model name: [________]
Artist:     [________]
Due date:   [________]
Status:     [Review ▼]

Main image:
[Replace image]

Detail images:
[Add image] [Add image]

Links:
Loom  [________]
Thread[________]

[Save]
```

### Priorité

MVP indispensable pour l’updater.

L’interface doit être rapide et simple.

---

## 5. Archive / Version View

### Rôle

Voir les anciennes versions d’une carte modèle.

Cette vue ne doit pas encombrer le board principal.

### Ce qu’elle doit montrer

- anciennes images ;
- date d’ajout ;
- statut au moment de l’ajout ;
- note optionnelle ;
- possibilité de restaurer une ancienne version si nécessaire.

### Exemple

```text
Version Archive — Model Name

Current version
[Image]

Previous versions
[v04] [date] [status]
[v03] [date] [status]
[v02] [date] [status]
```

### Priorité

MVP utile, mais pas forcément indispensable pour la toute première version.

Le board principal doit rester plus important que l’archive.

---

## 6. Template Management

### Rôle

Créer et maintenir les templates de releases.

Puisque les releases mensuelles ont souvent la même structure, cet écran est important à moyen terme.

### Ce qu’il doit permettre

- créer un template ;
- dupliquer un template ;
- organiser les tiers ;
- placer des cartes types ;
- définir les types de cartes ;
- créer une release depuis un template.

### Exemple

```text
Templates

[Monthly Release Template]
  Tier 1
  Tier 2
  Tier 3

[Update Board Template]
  Updated Models
```

### Priorité

MVP utile si les templates doivent exister dès le début.  
Sinon, peut être construit après le board principal.

---

# Priorisation MVP

## MVP indispensable

Ces écrans doivent être construits en premier :

```text
1. Monthly Release Board
2. Model Focus View
3. Update / Upload Panel
```

Sans ces trois écrans, l’app ne remplace pas réellement le board Photoshop.

---

## MVP utile

Ces écrans sont très utiles, mais peuvent venir juste après :

```text
4. Release Dashboard
5. Template Management
```

Ils permettent de rendre l’app utilisable de manière régulière, mois après mois.

---

## Après le MVP

Ces écrans peuvent venir plus tard :

```text
6. Archive / Version View
7. Settings
8. User permissions
9. Export view
```

---

## À éviter au début

Ne pas construire au départ :

- dashboard de management ;
- analytics ;
- reporting ;
- task board ;
- notifications ;
- messagerie interne ;
- commentaires complexes ;
- dépendances de tâches ;
- système d’approbation trop détaillé.

Ces éléments risquent de transformer l’app en project management system.

---

# Navigation recommandée

La navigation doit rester simple.

```text
Dashboard
  ↓
Release Board
  ↓
Model Focus View
  ↓
Update Panel
  ↓
Archive View
```

Le board doit toujours être facilement accessible.

---

# Expérience Art Director

L’Art Director doit principalement utiliser :

```text
Release Board
  ↓
Model Focus View
```

Il ne doit pas avoir besoin d’utiliser les écrans administratifs.

Son expérience doit être :

```text
Open release
  ↓
Scan visually
  ↓
Click model
  ↓
Review large image
  ↓
Give feedback in Loom / thread
```

---

# Expérience Assistant / Updater

L’assistant / updater utilise davantage :

```text
Release Board
  ↓
Update / Upload Panel
  ↓
Template / Dashboard
```

Son expérience doit être :

```text
Open current release
  ↓
Find model card
  ↓
Replace images
  ↓
Update status
  ↓
Save
```

---

# Résumé

L’app doit être construite autour d’un écran principal :

```text
Monthly Release Board
```

Les autres écrans doivent exister uniquement pour soutenir ce board.

Priorité absolue :

```text
Visual review first.
Daily update second.
Management features later, or never.
```
