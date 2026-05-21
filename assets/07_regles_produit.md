# Étape 7 — Règles produit

## Objectif

Définir les règles qui doivent guider la conception de l’app.

Ces règles sont importantes parce qu’elles empêchent l’app de devenir trop lourde, trop administrative, ou trop éloignée du besoin réel.

L’app doit rester centrée sur :

```text
Visual review
Daily update
Latest visible version
Simple status
No management overload
```

---

# 1. Le board visible montre toujours l’état courant

## Règle

```text
Le board principal montre toujours la dernière version utile à reviewer.
```

L’Art Director ne doit pas avoir à chercher quelle image est la bonne.

La carte visible doit répondre immédiatement à la question :

```text
Qu’est-ce qu’on doit regarder maintenant ?
```

## Implication

Quand une nouvelle image principale est ajoutée :

```text
ancienne image → archive
nouvelle image → visible sur le board
```

---

# 2. L’app est un outil de review visuelle, pas un outil de management

## Règle

```text
The app is where the release is visually reviewed.
It is not where production is managed.
```

L’app ne doit pas devenir :

- un Monday bis ;
- un Airtable bis ;
- un Notion bis ;
- un task tracker ;
- un reporting dashboard.

## Implication

Les fonctionnalités de management doivent être évitées au départ.

Exemples à éviter dans le MVP :

- dépendances ;
- tâches complexes ;
- notifications ;
- analytics ;
- reporting ;
- workflow d’approbation trop détaillé ;
- commentaires internes complets.

---

# 3. L’Art Director doit pouvoir utiliser l’app sans effort

## Règle

```text
L’Art Director ne doit pas administrer l’app.
```

Son usage doit être :

```text
Open release
  ↓
Scan board
  ↓
Click model
  ↓
Review
  ↓
Give feedback in Loom / thread
```

## Implication

L’interface doit rester très visuelle.

L’Art Director ne doit pas être obligé de :

- remplir des champs ;
- gérer des cartes ;
- déplacer des éléments ;
- mettre à jour des données ;
- comprendre un système complexe.

---

# 4. Les sculpteurs ne sont pas responsables de l’administration du board

## Règle

```text
Artists provide images.
Updaters maintain the board.
```

Les sculpteurs continuent à poster leurs images dans le thread.

Ils ne doivent pas être obligés de :

- mettre à jour l’app ;
- classer les images ;
- gérer les statuts ;
- remplir une base de données.

## Implication

L’app doit être conçue pour 1–2 updaters, pas pour forcer toute l’équipe à devenir administratrice.

---

# 5. Le thread et Loom restent la source de vérité du feedback

## Règle

```text
Thread + Loom = feedback source of truth.
App = visual current-state board.
```

L’app ne doit pas remplacer le système de feedback existant.

## Implication

L’app peut contenir :

- un lien Loom ;
- un lien thread ;
- une note courte.

Mais elle ne doit pas recréer :

- une messagerie ;
- un système complet de commentaires ;
- un historique complet de discussions ;
- un outil de validation complexe.

---

# 6. Les statuts doivent rester simples

## Règle

```text
Les statuts sont des signaux visuels, pas un workflow complexe.
```

Statuts recommandés :

```text
Gray    = Sketch
Blue    = Sculpt WIP
Orange  = Review
Green   = Approved / Finished
```

## Implication

Changer un statut doit principalement changer la couleur de la carte.

Le statut ne doit pas déclencher de logique complexe dans le MVP.

---

# 7. La création mensuelle doit partir d’un template

## Règle

```text
Une nouvelle release ne doit pas être reconstruite à partir de zéro.
```

La structure mensuelle étant souvent similaire, l’app doit permettre de créer une release depuis un template.

## Implication

Un template contient :

- tiers habituels ;
- slots de cartes ;
- types de cartes ;
- structure visuelle ;
- statut par défaut.

Objectif :

```text
New month = duplicate template + replace images
```

---

# 8. La mise à jour quotidienne doit être rapide

## Règle

```text
Updating the board should take minutes, not become an admin task.
```

L’updater doit pouvoir mettre à jour rapidement :

- image principale ;
- images détail ;
- statut ;
- artiste ;
- due date ;
- lien Loom / thread.

## Implication

Les actions importantes doivent être accessibles depuis une carte ou un panneau simple.

Exemple :

```text
Click card
  ↓
Edit
  ↓
Replace image
  ↓
Change status
  ↓
Save
```

---

# 9. L’archive doit rester secondaire

## Règle

```text
Archive is reference, not the main experience.
```

Le board principal doit rester propre et lisible.

L’archive sert uniquement à retrouver une ancienne version si nécessaire.

## Implication

L’archive ne doit pas être visible par défaut sur le board.

Elle peut être accessible depuis une carte :

```text
Open card
  ↓
Archive
  ↓
Previous versions
```

---

# 10. Les update boards doivent rester petits

## Règle

```text
Update boards only show models being updated.
```

Un update board ne doit pas recréer toute une ancienne release.

## Implication

Pour une release précédente, le board contient uniquement :

- modèles concernés ;
- nouvelles images ;
- éventuellement anciennes images pour comparaison.

---

# 11. Tout ajout de fonctionnalité doit passer un test simple

Avant d’ajouter une fonctionnalité, poser cette question :

```text
Est-ce que cette fonctionnalité aide directement :
1. la review visuelle ?
2. la mise à jour quotidienne ?
3. la clarté de la dernière version ?
```

Si la réponse est non, la fonctionnalité doit être évitée ou reportée.

---

# 12. La première version doit être volontairement limitée

## Règle

```text
Build the smallest version that replaces the Photoshop board.
```

Le MVP doit résoudre le problème actuel, pas anticiper tous les cas possibles.

## MVP prioritaire

- board par tier ;
- cartes modèles ;
- image principale ;
- images détail ;
- statut couleur ;
- focus view ;
- remplacement d’image ;
- template de release ;
- archive simple.

## Pas prioritaire

- notifications ;
- analytics ;
- reporting ;
- permissions avancées ;
- commentaires complexes ;
- messagerie ;
- task management.

---

# Règles résumées

```text
1. Main board = current visual state.
2. App = visual review, not project management.
3. AD reviews; updater maintains.
4. Sculptors provide images, not admin.
5. Thread + Loom remain feedback source of truth.
6. Status = simple visual signal.
7. New releases come from templates.
8. Daily updates must be fast.
9. Archive stays secondary.
10. Update boards stay small.
11. Every feature must serve review or update.
12. MVP must stay intentionally limited.
```

---

# Principe final

```text
Do not build a management system.
Build a visual release review system.
```
