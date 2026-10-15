# Release Board — instructions pour Claude

Lire `CONTEXT.md` en premier (état du projet, structure, choix techniques).

## Deux PC
Le projet est développé sur deux PC (ce PC : `E:\Claude code\figma`, l'autre :
`C:\Users\PC\Documents\Claude code\figma`). Le dépôt GitHub sert de point de synchro :
- au début d'une session : `git pull` sur `main` avant de toucher au code ;
- si les deux PC ont divergé, fusionner (merge), ne jamais écraser une version par l'autre.

## Déploiement — autorisation permanente
Quand une modif est terminée et vérifiée (pages chargées sans erreur console, scripts
inline sans erreur de syntaxe, fonctionnalité testée dans le navigateur), le faire sans
redemander :
1. Recopier les fichiers servis de la racine vers `deploy/` : `index.html`, `mobile.html`,
   `back-office.html`, `retouch-tool.js` doivent y être identiques à la racine.
2. Commit sur `main`, puis `git push origin main`.
3. `netlify deploy --prod --dir deploy`
4. Vérifier que https://monthly-release-board.netlify.app sert bien les fichiers de `deploy/`
   (curl + diff). Le site en ligne peut montrer `href='/'` à la place de `href="index.html"`
   (réécriture côté Netlify) : ce n'est pas une différence à corriger dans le repo.

Garde-fous :
- Toujours `--dir deploy`, jamais la racine (elle contient `.env.local`, `assets/`, la doc…).
- Les migrations SQL (`supabase/migrations/`) et les Edge Functions ne partent pas avec
  Netlify : ne jamais les exécuter sur la base Supabase sans demander.
- Si `netlify` répond « Not logged in », demander à l'utilisateur de lancer `netlify login`
  dans son terminal ; ne pas tenter de se connecter à sa place.
- Le board est partagé par l'équipe (une seule ligne `boards_data` dans Supabase) : un bug de
  synchro peut effacer le travail des autres. Toute modif de `cloudSave` / `cloudLoad` /
  realtime doit être testée avec soin avant déploiement.
