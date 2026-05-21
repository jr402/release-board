# Étape 3 — Fonctionnement Figma final

## Objectif

Remplacer le board Photoshop actuel par un **board Figma vivant**, sans changer le fonctionnement général de la review.

Le board Figma sert à montrer l’état visuel actuel de la release.  
Il ne remplace pas le thread de conversation, Loom, ou le fonctionnement de production existant.

---

## Principe général

```text
Sculpteurs
  ↓ postent leurs images
Thread de conversation
  ↓ images récupérées par
Assistant / Updater
  ↓ mise à jour quotidienne
Board Figma
  ↓ review visuelle par
Art Director + Technical Supervisor
  ↓ feedback via
Loom + Thread
```

Le board Figma est donc le **support visuel de review**.  
Le thread et Loom restent la **source principale du feedback et des décisions**.

---

## Organisation du board

Le board est organisé par **tier**, comme la release est actuellement pensée et reviewée.

```text
Monthly Release Board

Tier 1
[Model Card][Model Card][Model Card][Model Card]

Tier 2
[Model Card][Model Card][Model Card]

Tier 3
[Monster Card][Terrain Card]
```

Chaque tier contient les modèles ou groupes de modèles correspondants.

Chaque modèle ou SKU important possède une carte visuelle.

---

## Structure d’une carte modèle

Chaque carte contient les informations minimales nécessaires à la review.

```text
┌─────────────────────────────┐
│                             │
│       Image principale      │
│       du sculpt actuel      │
│                             │
├───────────────┬─────────────┤
│ détail / vue  │ détail / vue│
└───────────────┴─────────────┘

Model name
Artist
Due date
Status color
```

La grande image montre la version actuelle du modèle.

Les petites images peuvent montrer :

- un détail important ;
- une vue arrière ;
- une vue alternative ;
- un close-up utile pour la review.

Ces images secondaires sont optionnelles.

---

## Statut visuel

Le statut est indiqué par la couleur du cadre de la carte.

```text
Gray    = Sketch
Blue    = Sculpt WIP
Orange  = Review
Green   = Approved / Finished
```

L’objectif est que l’Art Director puisse comprendre l’état de la release en quelques secondes, sans lire un tableau.

---

## Règle de version

La carte visible montre toujours la **dernière version utile à reviewer**.

```text
Carte visible = dernière version actuelle
Anciennes versions = archive ou remplacées
Feedback = thread + Loom
```

Le board ne doit pas devenir un historique complet et complexe.

Si un historique est nécessaire, il peut être gardé dans une zone d’archive ou une page séparée, mais la vue principale doit rester claire.

---

## Rôle de l’Art Director

L’Art Director utilise le board pour reviewer la release visuellement.

Il peut :

- ouvrir le board ;
- voir toute la release en un coup d’œil ;
- review par tier ;
- zoomer sur un modèle ;
- vérifier la composition globale ;
- inspecter les détails importants ;
- donner son feedback via Loom ou le thread.

Son workflow ne change pas fondamentalement.

```text
Open board
  ↓
Scan full release
  ↓
Review tier
  ↓
Zoom into model
  ↓
Give feedback via Loom / thread
```

---

## Rôle du Technical Supervisor

Le Technical Supervisor utilise le board comme support de review technique.

Il peut :

- vérifier l’état actuel des modèles ;
- regarder les détails techniques ;
- comparer les attentes avec la version visible ;
- participer à la review avec l’Art Director ;
- compléter le feedback dans le thread ou via Loom.

Le board lui donne une vue claire de ce qui est en cours, en review, ou validé.

---

## Rôle de l’Assistant / Updater

L’assistant ou updater est responsable de la mise à jour quotidienne du board.

Il récupère les images postées par les sculpteurs dans le thread, puis met à jour les cartes correspondantes.

```text
Open thread
  ↓
Collect latest sculpt screenshots
  ↓
Open Figma board
  ↓
Replace images on cards
  ↓
Update status color if needed
  ↓
Board ready for review
```

L’objectif est que cette mise à jour reste rapide et simple.

Le board doit être prêt pour la review quotidienne, sans créer une charge administrative supplémentaire.

---

## Rôle des sculpteurs

Les sculpteurs ne sont pas responsables de l’administration du board.

Ils continuent à travailler comme aujourd’hui :

- ils produisent les sculpts ;
- ils postent les images dans le thread ;
- ils indiquent si une image est une nouvelle version, une correction, une vue détail, ou une version prête pour review ;
- ils reçoivent le feedback via Loom ou le thread.

Ils n’ont pas besoin d’aller mettre à jour Figma eux-mêmes.

---

## Rôle du Production Manager / Management

Le board ne remplace pas le fonctionnement de production existant.

Il peut aider à voir l’état général de la release, mais il ne doit pas devenir :

- un tracker lourd ;
- un système de tâches ;
- un outil administratif ;
- une base de données complexe.

La production continue à fonctionner avec la review quotidienne et les habitudes existantes.

---

## Templates mensuels

Comme la structure des releases est souvent similaire, un template Figma peut être créé.

```text
Release Template
  ↓ duplicate
Release — July
  ↓ duplicate
Release — August
```

Le template contient déjà :

- les tiers ;
- les emplacements des cartes ;
- les différents types de cartes ;
- la légende des couleurs ;
- la structure générale de la review.

Chaque mois, l’updater duplique le template et remplace les images.

---

## Boards pour updates de releases précédentes

Pour les updates de releases existantes, il faut utiliser un board plus petit.

```text
Update Board

Release concernée
[Updated Model][Updated Model][Updated Model]
```

Ce board ne contient que les modèles concernés par l’update.

Il peut éventuellement montrer :

```text
Before / After
```

ou :

```text
Ancienne version
Nouvelle version
```

Mais uniquement si cela aide la review.

---

## Ce qui change

- Le board devient plus léger.
- Il est plus facile à mettre à jour.
- Une ou deux personnes peuvent travailler dessus.
- La dernière version visible est plus claire.
- L’Art Director peut zoomer dans le board sans ouvrir plusieurs fichiers.
- Les statuts sont visibles immédiatement.

---

## Ce qui ne change pas

- La release reste reviewée visuellement.
- L’organisation par tier reste centrale.
- Les sculpteurs continuent à poster dans le thread.
- Loom et le thread restent la source principale du feedback.
- L’Art Director garde son mode de review.
- La production ne devient pas plus administrative.

---

## Résumé

Le board Figma est une version vivante du board Photoshop actuel.

Il garde le meilleur du système actuel :

- vision globale ;
- review visuelle ;
- organisation par tier ;
- simplicité.

Il corrige les problèmes principaux :

- fichier lourd ;
- difficulté de collaboration ;
- confusion sur la dernière version ;
- mise à jour quotidienne moins fluide.

Le principe à retenir :

```text
Figma = visual current-state board
Thread + Loom = feedback source of truth
Updater = board maintenance
Art Director = visual review
Sculptors = image source, not board admins
```
