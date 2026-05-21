# Étape 10 — Plan de construction MVP

## Objectif

Définir un plan de construction réaliste pour créer l’app sans partir dans une version trop large.

Le but est de construire une première version testable qui remplace réellement le board Photoshop, puis d’ajouter les fonctionnalités seulement si elles sont nécessaires.

---

# Principe de construction

L’app doit être construite par phases.

Chaque phase doit :

- ajouter une capacité claire ;
- être testable séparément ;
- être validée avant de passer à la suivante ;
- éviter d’ajouter des fonctionnalités de management inutiles.

Principe :

```text
Build small
Test quickly
Validate with users
Add only what improves review or updating
```

---

# Phase 1 — Setup du projet

## Objectif

Créer la base technique de l’app.

## À construire

- structure du projet ;
- routing de base ;
- layout général ;
- données de test ;
- design system minimal ;
- page d’accueil temporaire.

## Résultat attendu

Une app qui s’ouvre correctement et qui peut afficher une page simple.

## Critère de validation

```text
L’app tourne localement.
La structure du projet est claire.
Les prochaines phases peuvent être ajoutées facilement.
```

---

# Phase 2 — Board statique de release

## Objectif

Créer la vue principale : le board visuel par tiers.

## À construire

- une release de test ;
- Tier 1 / Tier 2 / Tier 3 ;
- cartes modèles ;
- statuts couleur ;
- images placeholder ;
- légende des statuts.

## Résultat attendu

L’Art Director doit pouvoir comprendre immédiatement le concept du board.

## Critère de validation

```text
On voit une release organisée par tiers.
Chaque carte a un statut visuel.
Le board ressemble à un outil de review, pas à un tableau de management.
```

---

# Phase 3 — Model Focus View

## Objectif

Permettre de cliquer sur une carte et de voir un modèle en grand.

## À construire

- ouverture d’une vue focus ou modal ;
- grande image principale ;
- images détail ;
- nom du modèle ;
- artiste ;
- due date ;
- statut ;
- bouton retour / fermeture.

## Résultat attendu

L’Art Director peut passer de la vue globale à la review détaillée d’un modèle.

## Critère de validation

```text
Click card → large model view.
Close focus view → back to board.
```

---

# Phase 4 — Édition simple d’une carte

## Objectif

Permettre à l’updater de modifier les informations d’une carte.

## À construire

- panneau edit ;
- modification du nom ;
- modification artiste ;
- modification due date ;
- changement de statut ;
- note courte ;
- liens Loom / thread.

## Résultat attendu

L’updater peut préparer une carte pour la review sans toucher au code.

## Critère de validation

```text
Un updater peut modifier les champs principaux d’une carte et sauvegarder.
```

---

# Phase 5 — Upload / remplacement d’images

## Objectif

Permettre le remplacement des images depuis l’interface.

## À construire

- upload ou drag-and-drop image principale ;
- preview image ;
- remplacement image principale ;
- ajout images détail ;
- suppression / remplacement image détail.

## Résultat attendu

Le board peut être mis à jour avec les images du jour.

## Critère de validation

```text
L’updater peut remplacer une image principale et voir le changement sur le board.
```

---

# Phase 6 — Archive simple des versions

## Objectif

Garder une trace des anciennes images sans encombrer la vue principale.

## À construire

- archivage automatique de l’ancienne image principale ;
- vue archive depuis la carte ;
- liste des versions précédentes ;
- date d’ajout ;
- statut au moment de l’archive.

## Résultat attendu

Le board reste propre, mais une ancienne version peut être retrouvée.

## Critère de validation

```text
Remplacer une image archive l’ancienne.
La vue principale montre uniquement la version actuelle.
```

---

# Phase 7 — Templates de release

## Objectif

Permettre de créer rapidement une nouvelle release mensuelle.

## À construire

- template mensuel ;
- duplication d’un template ;
- création d’une release avec nom / mois ;
- tiers et cartes pré-remplis ;
- statuts par défaut.

## Résultat attendu

Créer une nouvelle release ne demande pas de reconstruire le board.

## Critère de validation

```text
New release = duplicate template + replace images.
```

---

# Phase 8 — Update boards

## Objectif

Créer des boards plus petits pour les updates d’anciennes releases.

## À construire

- type de release : update board ;
- structure simplifiée ;
- ajout manuel des modèles concernés ;
- option before / after si nécessaire.

## Résultat attendu

Les updates ne sont pas forcées dans la structure complète d’une release mensuelle.

## Critère de validation

```text
Un update board peut contenir uniquement les modèles concernés.
```

---

# Phase 9 — Navigation rapide et filtres simples

## Objectif

Faciliter la review quand une release contient beaucoup de modèles.

## À construire

- recherche par nom ;
- jump to tier ;
- filtre par statut ;
- affichage “Review only” ;
- affichage “WIP only”.

## Résultat attendu

L’AD et l’updater peuvent retrouver rapidement les modèles importants.

## Critère de validation

```text
On peut trouver rapidement une carte sans parcourir tout le board.
```

---

# Phase 10 — Polish et préparation au test réel

## Objectif

Améliorer l’expérience avant usage réel par l’équipe.

## À construire

- amélioration visuelle ;
- responsive desktop ;
- états hover / focus ;
- loading states ;
- empty states ;
- messages d’erreur simples ;
- export simple si nécessaire.

## Résultat attendu

L’app est assez propre pour être testée sur une vraie release.

## Critère de validation

```text
L’équipe peut utiliser l’app sur une release pilote.
```

---

# Ordre recommandé

```text
1. Setup projet
2. Board statique
3. Model Focus View
4. Édition de carte
5. Upload / remplacement image
6. Archive simple
7. Templates
8. Update boards
9. Navigation / filtres
10. Polish + test réel
```

---

# MVP minimum testable

La toute première version vraiment utile doit inclure :

```text
Board par tier
Model cards
Status colors
Focus view
Edit card
Replace main image
Detail images
```

Sans ces éléments, l’app ne remplace pas le board Photoshop.

---

# MVP recommandé pour test équipe

La version recommandée pour un test interne devrait inclure :

```text
Board par tier
Model cards
Status colors
Focus view
Edit card
Image upload / replace
Detail images
Simple archive
Release template
Loom / thread links
```

---

# Ce qu’il ne faut pas construire avant le test réel

Ne pas construire avant validation par l’équipe :

- analytics ;
- dashboard management ;
- notifications ;
- comments complexes ;
- task dependencies ;
- approval workflow ;
- time tracking ;
- permissions détaillées ;
- reporting.

Ces fonctionnalités peuvent être discutées plus tard, mais elles ne doivent pas retarder la première version utile.

---

# Méthode de validation recommandée

Après chaque phase :

```text
1. Démontrer la fonctionnalité.
2. Tester avec un cas réel ou semi-réel.
3. Identifier ce qui bloque.
4. Corriger avant d’ajouter une nouvelle couche.
5. Continuer seulement après validation.
```

---

# Release pilote recommandée

Pour tester l’app, utiliser une release simple ou une ancienne release représentative.

Critères :

- pas trop grande ;
- contient plusieurs tiers ;
- contient au moins un modèle solo ;
- contient au moins un groupe ;
- contient au moins un monstre / grosse pièce ;
- contient quelques images détail.

Objectif :

```text
Vérifier que l’app fonctionne sur un vrai workflow sans risquer une release critique.
```

---

# Résumé

Le développement doit commencer par le board visuel, pas par les outils annexes.

La roadmap doit rester disciplinée :

```text
Visual board first.
Focus review second.
Daily update third.
Templates fourth.
Everything else later.
```
