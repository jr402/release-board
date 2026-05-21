# Étape 11 — Synthèse de passation corrigée

## Décision

Nous ne recommandons pas de tester Figma comme étape intermédiaire.

Tester Figma demanderait à l’équipe d’apprendre un nouveau fonctionnement temporaire, puis de rechanger ensuite si l’app sur mesure est construite.

Cela crée une perte de temps et une double transition.

La bonne direction est donc :

```text
Workflow actuel Photoshop
  ↓
Spécification du besoin
  ↓
Prototype / MVP app sur mesure
  ↓
Test sur une release pilote ou un update board
  ↓
Amélioration progressive
```

Et non :

```text
Photoshop
  ↓
Figma
  ↓
App finale
```

---

# Objectif de cette synthèse

Ce document sert de point d’entrée pour l’ensemble du travail produit jusqu’ici.

Il explique :

- ce qui a été défini ;
- à quoi servent les fichiers `.md` ;
- à quoi servent les images ;
- dans quel ordre utiliser les documents ;
- quelles sont les prochaines étapes ;
- comment passer de la réflexion à la construction de l’app.

---

# Résumé du projet

Nous voulons remplacer le board Photoshop actuel par une app sur mesure.

Cette app doit être une **Visual Release Review App**.

Elle doit permettre :

- de voir toute une release en un coup d’œil ;
- de l’organiser par tiers ;
- de voir la dernière version visible de chaque modèle ;
- de zoomer / ouvrir un modèle en grand ;
- de montrer les statuts par couleur ;
- de permettre une mise à jour quotidienne rapide par 1–2 updaters ;
- de ne pas ajouter de couche administrative inutile.

---

# Principe central

```text
App = visual current-state board
Thread + Loom = feedback source of truth
Updater = board maintenance
Art Director = visual review
Sculptors = image source, not board admins
```

L’app ne doit pas remplacer le thread ou Loom.  
Elle ne doit pas devenir un outil de management.

---

# Problème actuel

Le board Photoshop fonctionne visuellement, mais :

- le fichier devient lourd ;
- la collaboration est difficile ;
- la dernière version peut être confuse ;
- deux personnes ne peuvent pas facilement mettre à jour en parallèle ;
- la mise à jour quotidienne reste manuelle et statique ;
- le système n’est pas conçu pour une review vivante.

---

# Besoin réel

L’équipe a besoin d’un board visuel vivant qui permet :

- de voir toute la release en un coup d’œil ;
- de reviewer par tier ;
- de zoomer sur un modèle ;
- de voir la dernière version visible ;
- de mettre à jour rapidement les images ;
- de garder les statuts lisibles par couleur ;
- de ne pas ajouter de charge administrative.

---

# Documents produits

## 1. Overview — Situation actuelle et besoin réel

Document de contexte.

Il explique :

- le besoin réel ;
- ce que l’outil doit faire ;
- ce que l’outil ne doit pas devenir ;
- le workflow actuel ;
- les problèmes du board Photoshop.

Utilisation :

```text
Partager avec l’équipe pour valider le diagnostic.
```

---

## 2. Fonctionnement Figma final

Ce document reste utile comme réflexion de workflow, mais Figma n’est plus recommandé comme étape intermédiaire.

Il peut encore servir à comprendre :

- la logique du board vivant ;
- les rôles de l’Art Director, de l’updater, des sculpteurs et du Technical Supervisor ;
- les règles du board ;
- la différence entre board visuel et outil de management.

Utilisation :

```text
Référence conceptuelle, pas plan de déploiement.
```

---

## 3. Description de l’app idéale

Document produit principal.

Il transforme le workflow en structure produit :

- Release ;
- Tier ;
- SKU / Group ;
- Model Card ;
- Image ;
- Status ;
- Archive ;
- User Role ;
- Template ;
- Update Board.

Utilisation :

```text
Base produit pour construire l’app sur mesure.
```

---

## 4. Écrans nécessaires

Document qui définit les écrans de l’app :

- Release Dashboard ;
- Monthly Release Board ;
- Model Focus View ;
- Update / Upload Panel ;
- Archive / Version View ;
- Template Management.

Utilisation :

```text
Base UI/UX pour designer ou coder l’app.
```

---

## 5. Interactions détaillées

Document qui décrit ce que chaque utilisateur doit pouvoir faire :

- review par l’Art Director ;
- mise à jour quotidienne par l’updater ;
- remplacement d’image ;
- ajout d’images détail ;
- changement de statut ;
- création depuis template ;
- update boards ;
- archive ;
- liens Loom / thread.

Utilisation :

```text
Base fonctionnelle pour développement.
```

---

## 6. Règles produit

Document de garde-fous.

Il empêche l’app de devenir trop complexe.

Règles principales :

```text
Main board = current visual state.
App = visual review, not project management.
AD reviews; updater maintains.
Sculptors provide images, not admin.
Thread + Loom remain feedback source of truth.
Status = simple visual signal.
New releases come from templates.
Daily updates must be fast.
Archive stays secondary.
Update boards stay small.
Every feature must serve review or update.
MVP must stay intentionally limited.
```

Utilisation :

```text
À donner à toute IA ou développeur avant de commencer.
```

---

## 7. Brief Codex / Claude Code

Document prêt à utiliser comme base pour travailler avec Codex ou Claude Code.

Il explique :

- le projet ;
- les rôles ;
- les objets de données ;
- les écrans ;
- les phases de développement ;
- les règles de collaboration avec l’IA ;
- les critères d’acceptation MVP.

Utilisation :

```text
Base du prompt final pour lancer le développement assisté par IA.
```

Important : ce brief doit encore être personnalisé avec les réponses aux questions de l’étape 9.

---

## 8. Questions à clarifier

Document de questions à répondre avant construction.

Il couvre :

- tiers habituels ;
- contenu par tier ;
- types de cartes ;
- images et versions ;
- source des images ;
- Loom / thread ;
- rôles ;
- templates ;
- update boards ;
- exports ;
- hébergement ;
- données et sauvegarde.

Utilisation :

```text
À remplir avant de finaliser le brief Codex / Claude Code.
```

---

## 9. Plan de construction MVP

Document de roadmap.

Il définit les phases de construction :

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

Utilisation :

```text
Plan d’exécution pour construire l’app étape par étape.
```

---

# Rôle des images produites

Les images produites servent de supports visuels pour expliquer rapidement :

- la structure de l’app idéale ;
- les écrans nécessaires ;
- les interactions principales ;
- les règles produit ;
- les phases de développement ;
- la synthèse de passation.

Elles sont utiles pour :

```text
- présenter le projet à l’équipe ;
- aligner les personnes non techniques ;
- donner un aperçu rapide avant de lire les .md ;
- aider un designer ou développeur à comprendre le système ;
- accompagner le brief destiné à Codex / Claude Code.
```

---

# Ordre d’utilisation recommandé

## Pour l’équipe

```text
1. Overview — Situation actuelle
2. Description de l’app idéale
3. Règles produit
4. Plan de construction MVP
```

Objectif :

```text
Valider le besoin, la direction produit, et les garde-fous.
```

---

## Pour l’Art Director

```text
1. Description de l’app idéale
2. Schéma de l’app idéale
3. Écrans nécessaires
4. Prototype visuel / HTML si utile
```

Objectif :

```text
Montrer que l’app servira la review visuelle sans ajouter d’administration.
```

---

## Pour l’Assistant / Updater

```text
1. Interactions détaillées
2. Écrans nécessaires
3. Questions à clarifier
```

Objectif :

```text
Valider que la mise à jour quotidienne est réaliste.
```

---

## Pour Codex / Claude Code

```text
1. Règles produit
2. Description de l’app idéale
3. Écrans nécessaires
4. Interactions détaillées
5. Questions à clarifier
6. Brief Codex / Claude Code
7. Plan de construction MVP
```

Objectif :

```text
Construire l’app progressivement sans dériver vers un outil de management.
```

---

# Prochaines étapes

## Étape immédiate

Répondre aux questions de :

```text
Étape 9 — Questions à clarifier
```

Priorités :

```text
1. Tiers habituels
2. Contenu typique par tier
3. Types de cartes nécessaires
4. Nombre d’images par modèle
5. Besoin d’archive
6. Source des images
7. Rôles MVP
8. Templates nécessaires
9. Update boards
10. Hébergement / accès
```

---

## Ensuite

Une fois les réponses obtenues :

```text
1. Mettre à jour la description de l’app idéale avec les informations réelles.
2. Adapter les écrans nécessaires.
3. Adapter les interactions.
4. Finaliser le brief Codex / Claude Code.
5. Produire un prompt final prêt à coller.
6. Lancer la construction phase par phase.
```

---

# Recommandation de méthode

La méthode recommandée est maintenant :

```text
1. Continuer avec Photoshop tant que l’app n’est pas prête.
2. Ne pas introduire Figma comme outil temporaire.
3. Répondre aux questions de clarification.
4. Personnaliser le brief Codex / Claude Code.
5. Construire le MVP directement.
6. Tester le MVP sur une petite release ou un update board.
7. Migrer seulement si l’app fait gagner du temps.
```

---

# Résumé final

Le projet ne consiste pas à tester un nouvel outil générique.

Le projet consiste à construire un outil sur mesure qui correspond exactement au workflow réel de l’équipe.

Principe final :

```text
No temporary tool.
No extra learning curve.
Build the tool that fits the workflow.
```
