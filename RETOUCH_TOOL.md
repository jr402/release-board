# RetouchTool — Liquify + Transform (style Photoshop)

Module autonome (`retouch-tool.js`, ~2000 lignes, zéro dépendance, WebGL2) qui ouvre un éditeur plein écran
sur une image et renvoie le résultat. Réutilisable dans n'importe quelle page HTML.

Démo : ouvrir `retouch-demo.html` (bouton « Image d'exemple », fichier, drag & drop ou Ctrl+V).

## Intégration

```html
<script src="retouch-tool.js"></script>
<script>
RetouchTool.open({
  src: "photo.jpg",              // URL, data URL, <img>, <canvas>, File / Blob, ImageBitmap
  title: "Nom de l'image",       // optionnel
  format: "auto",                // "auto" (= format source) | "image/png" | "image/jpeg" | "image/webp"
  quality: 0.92,                 // JPEG / WebP
  background: "#ffffff",         // fond utilisé pour le JPEG (pas d'alpha)
  lang: "fr",                    // "fr" | "en" (défaut : langue du navigateur)
  zIndex: 100000,                // au-dessus de tout le reste
  maxSize: 8192,                 // l'image est réduite si elle dépasse (limite GPU)
  theme: { accent: "#4f8cff" },  // surcharge des variables CSS --rt-* (bg, panel, panel2, text, muted, accent, danger)
  onSave(result) {},             // { dataUrl, blob, mime, width, height, canvas } — peut renvoyer une Promise (upload…)
  onCancel() {},
  onClose(reason) {},            // "save" | "cancel" | "api" | "replaced"
  closeOnSave: true,
});
RetouchTool.close();   RetouchTool.isOpen();   RetouchTool.current  // l'éditeur ouvert
</script>
```

Sans `onSave`, le résultat est téléchargé (`filename` optionnel, `retouche` par défaut).

Une URL d'un autre domaine doit être servie avec CORS (`Access-Control-Allow-Origin`) sinon le GPU refuse
l'image → message « Impossible de charger l'image ». Les data URL et les fichiers locaux passent toujours.

## Ce que fait l'outil

Pendant que l'éditeur est ouvert, tous les raccourcis clavier / souris / molette / drop / paste de la page
hôte sont bloqués (écouteurs en phase de capture) : aucun conflit avec les raccourcis de l'app.

### Onglet Fluidité (Liquify)

Filet de déformation (jusqu'à ~320 000 sommets, bilinéaire) rendu en WebGL — fluide même sur du 4000 × 3000.

| Outil | Touche | Effet |
|---|---|---|
| Déformation | W | pousse les pixels dans le sens du geste |
| Reconstruction | R | ramène vers l'original (maintenir pour continuer) |
| Pousser | O | pousse perpendiculairement au geste (Alt = inverse) |
| Contraction / Dilatation | S / B | vers / depuis le centre (maintenir ; Alt = inverse) |
| Tourbillon | C | rotation horaire (Alt = antihoraire) |
| Lissage | E | adoucit la déformation |
| Blocage / Libération | F / D | masque rouge qui protège une zone |
| Main | H (ou Espace) | déplacer la vue |

Pinceau : taille (`[` `]`), pression (`Maj+[` `]`), vitesse (outils continus), densité (dureté du bord),
pression du stylet. Affichage : filet, masque, bouton Original (`\`), Tout restaurer, Tout libérer.

### Onglet Transformation

Sélection rectangulaire optionnelle (outil `M`, clic = toute l'image) puis transformation manuelle :

- glisser à l'intérieur = déplacer (Maj = axe), flèches = décaler de 1 px (Maj = 10)
- coins = échelle proportionnelle (Maj = libre, Alt = depuis le centre), côtés = échelle sur un axe
- hors des coins = rotation (Maj = pas de 15°), point de pivot déplaçable
- Ctrl+coin = torsion (distort), Ctrl+côté = inclinaison (skew), Ctrl+Alt+Maj+coin = perspective
- menu Mode pour forcer un mode : Échelle / Rotation / Inclinaison / Torsion / Perspective / Déformation (warp)
- Déformation = grille de Bézier 4 × 4 (16 points) + presets (arc, renflement, drapeau, onde, œil de poisson, torsion…) et curseur Courbure
- boutons Symétrie H/V, 90°, 180°, champs numériques X / Y / L % / H % / Angle
- Zone libérée : transparente (comme Photoshop) ou garder l'original
- `Entrée` = appliquer la transformation ; le canevas garde la taille de l'image, ce qui dépasse est coupé

### Général

`Ctrl+Z` / `Ctrl+Y` annuler-rétablir (60 étapes, y compris les applications), `Ctrl+0` ajuster, `Ctrl+1` 100 %,
molette = zoom, `Ctrl+T` change d'onglet (chaque changement d'onglet applique l'édition en cours),
`Ctrl+Entrée` / `Ctrl+S` = enregistrer, `Échap` = fermer (confirmation si modifié). Export PNG (alpha), JPEG (fond) ou WebP.

## Dans le Release Board

- bouton 🪄 dans les outils latéraux de chaque carte image (éditeurs uniquement), dans l'en-tête de la fenêtre
  Versions et dans la fenêtre ALT
- à l'enregistrement : l'ancienne image est archivée (comme un drop / coller), le résultat est envoyé dans
  Supabase Storage quand c'est possible (sinon data URL), puis `render(); save();`
- `retouch-tool.js` doit être copié à côté de `index.html` (aussi dans `deploy/`)
