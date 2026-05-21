# Étape 9 — Questions à clarifier avant construction

## Objectif

Cette étape sert à collecter les informations nécessaires avant de lancer le développement réel de l’app.

Le but n’est pas de tout complexifier.  
Le but est de donner à la personne qui travaillera avec Codex / Claude Code les réponses nécessaires pour éviter les mauvaises hypothèses.

---

# 1. Structure des releases

## Questions

- Quels sont les tiers habituels d’une release mensuelle ?
- Les noms des tiers changent-ils chaque mois ?
- Combien de tiers y a-t-il en général ?
- Est-ce qu’il existe des sections récurrentes hors tiers ?
- Les updates d’anciennes releases doivent-elles utiliser les mêmes tiers ou une structure différente ?

## Pourquoi c’est important

Ces réponses permettent de créer le bon template de release.

```text
Release Template
  ├ Tier 1
  ├ Tier 2
  ├ Tier 3
  └ Bonus / Updates if needed
```

---

# 2. Contenu typique de chaque tier

## Questions

Pour chaque tier, il faut préciser :

- combien de SKUs en moyenne ;
- combien de modèles par SKU ;
- quels types de modèles apparaissent ;
- quels éléments sont toujours présents ;
- quels éléments changent d’un mois à l’autre.

## Exemple de réponse attendue

```text
Tier 1
- 1 hero
- 1 troop unit
- 1 monster
- 1 terrain element

Tier 2
- 1 alternate hero
- 1 troop group
- 1 bonus model
```

## Pourquoi c’est important

Cela permet de savoir combien de cartes doivent être dans le template mensuel.

---

# 3. Types de cartes nécessaires

## Questions

Quels types de cartes faut-il prévoir ?

Exemples possibles :

- Hero card ;
- Character card ;
- Troop card ;
- Monster card ;
- Terrain card ;
- Group / SKU card ;
- Before / After update card.

## Pour chaque type

Il faut savoir :

- taille relative ;
- ratio d’image ;
- nombre d’images détail ;
- informations affichées ;
- si le type apparaît souvent ou rarement.

## Pourquoi c’est important

Cela permet de créer des layouts de cartes standards.

```text
Small card
Medium card
Wide card
Large monster card
Before / After card
```

---

# 4. Images et versions

## Questions

- Combien d’images sont généralement nécessaires par modèle ?
- Une image principale suffit-elle dans la plupart des cas ?
- Combien d’images détail faut-il prévoir ?
- Les vues arrière sont-elles fréquentes ?
- Les before/after sont-ils nécessaires pour les update boards ?
- Faut-il archiver automatiquement l’ancienne image principale ?
- Combien de versions anciennes faut-il conserver ?
- Faut-il pouvoir restaurer une ancienne version ?

## Pourquoi c’est important

Cela définit la logique de gestion des images.

```text
Main image = current review version
Detail images = support views
Archive = previous versions
```

---

# 5. Sources des images

## Questions

- Où les images sont-elles postées aujourd’hui ?
- Sont-elles téléchargées depuis un thread ?
- Sont-elles copiées depuis un chat ?
- Sont-elles parfois dans un dossier partagé ?
- Faut-il uploader les images dans l’app ?
- Ou simplement coller des liens ?
- Les images doivent-elles être stockées dans l’app ?
- Quelle taille typique font les images ?

## Pourquoi c’est important

Cela détermine le stockage technique.

Options possibles :

```text
Option A — Upload direct dans l’app
Option B — Stockage externe + lien
Option C — Drag-and-drop depuis ordinateur
Option D — Mix upload + liens
```

---

# 6. Source de vérité du feedback

## Questions

- Quel outil sert aujourd’hui de thread principal ?
- Est-ce toujours le même outil ?
- Un modèle peut-il avoir plusieurs liens Loom ?
- Le lien Loom doit-il être sur la carte ou dans l’archive ?
- Le lien thread doit-il pointer vers tout le thread ou vers un message spécifique ?
- Faut-il afficher le dernier lien de feedback seulement ?
- Faut-il garder les anciens liens de feedback ?

## Pourquoi c’est important

L’app ne remplace pas Loom / thread, mais elle peut les relier proprement au modèle concerné.

---

# 7. Rôles et accès

## Questions

Qui doit pouvoir faire quoi ?

### Art Director

- view only ?
- peut-il modifier des statuts ?
- peut-il ajouter une note ?

### Technical Supervisor

- view only ?
- peut-il modifier des statuts ?
- peut-il ajouter des images ?

### Assistant / Updater

- peut-il tout modifier ?
- peut-il créer une release ?
- peut-il modifier les templates ?

### Sculpteurs

- doivent-ils avoir accès ?
- view only ?
- aucun accès nécessaire ?

## Pourquoi c’est important

Pour le MVP, deux rôles peuvent suffire :

```text
Editor
Viewer
```

Mais il faut savoir si cela est suffisant.

---

# 8. Templates

## Questions

- Combien de templates faut-il ?
- Un template mensuel suffit-il ?
- Faut-il un template pour update boards ?
- Les templates doivent-ils être modifiables dans l’app ?
- Ou peuvent-ils être codés au départ ?
- Qui peut modifier un template ?
- Que doit contenir un template ?

## Exemple

```text
Monthly Release Template
  ├ Tier 1
  ├ Tier 2
  ├ Tier 3

Update Board Template
  └ Updated Models
```

## Pourquoi c’est important

Les templates réduisent fortement le travail mensuel.

---

# 9. Update boards

## Questions

- À quelle fréquence mettez-vous à jour d’anciennes releases ?
- Combien de modèles sont généralement concernés ?
- Faut-il comparer ancienne et nouvelle version ?
- Faut-il afficher la release d’origine ?
- Faut-il garder le même système de statut ?
- Faut-il une vue before/after dédiée ?

## Pourquoi c’est important

Un update board est plus petit qu’une release mensuelle et ne doit pas être traité comme un board complet.

---

# 10. Exports et partage

## Questions

- L’Art Director doit-il simplement ouvrir l’app ?
- Faut-il pouvoir exporter le board en image ?
- Faut-il exporter en PDF ?
- Faut-il partager un lien public / privé ?
- Faut-il pouvoir envoyer une capture du board à quelqu’un ?

## Pourquoi c’est important

L’export n’est pas indispensable au MVP, mais peut être utile pour partager un état de la release.

---

# 11. Environnement technique

## Questions

- L’app doit-elle être interne uniquement ?
- Faut-il un login ?
- Où doit-elle être hébergée ?
- Qui doit pouvoir y accéder ?
- Faut-il une app web responsive ?
- Est-ce qu’un usage desktop suffit ?
- Faut-il que l’app marche sur tablette ?

## Pourquoi c’est important

Cela influence fortement les choix techniques.

---

# 12. Données et sauvegarde

## Questions

- Les données doivent-elles être sauvegardées en base ?
- Est-ce qu’un prototype local suffit au départ ?
- Faut-il sauvegarder les images ?
- Faut-il sauvegarder les anciennes versions ?
- Combien de releases faut-il garder consultables ?
- Faut-il pouvoir supprimer / archiver une release ?

## Pourquoi c’est important

Cela définit la complexité backend.

---

# 13. Priorité MVP

## Questions

Parmi ces fonctionnalités, lesquelles sont absolument nécessaires pour une première version testable ?

```text
Release board par tier
Model focus view
Image upload
Image replacement
Status color
Templates
Archive
Loom/thread links
Search
Filters
Export
Permissions
```

## Pourquoi c’est important

Il faut protéger le MVP contre la surcharge.

---

# 14. Questions les plus importantes à répondre en premier

Si on veut avancer vite, les questions prioritaires sont :

```text
1. Quels sont les tiers habituels ?
2. Quel est le contenu typique de chaque tier ?
3. Quels types de cartes faut-il ?
4. Combien d’images par modèle ?
5. Faut-il uploader les images dans l’app ?
6. Faut-il archiver automatiquement l’ancienne image ?
7. Quels rôles faut-il pour le MVP ?
8. Faut-il un template mensuel dès la première version ?
9. Faut-il une vue before/after pour les update boards ?
10. Où l’app devra-t-elle être hébergée ?
```

---

# Format recommandé pour répondre

Tu peux répondre avec une structure simple :

```text
1. Tiers habituels
Réponse :

2. Contenu par tier
Réponse :

3. Types de cartes
Réponse :

4. Images
Réponse :

5. Source des images
Réponse :

6. Rôles
Réponse :

7. Templates
Réponse :

8. Update boards
Réponse :

9. Export / partage
Réponse :

10. Hébergement / accès
Réponse :
```

---

# Résumé

Cette étape sert à éviter les mauvaises décisions techniques.

Les réponses permettront de transformer le brief général en spécification plus précise pour construire l’app.

Le principe reste :

```text
Répondre uniquement à ce qui aide à construire le MVP.
Ne pas sur-spécifier des fonctionnalités secondaires.
```
