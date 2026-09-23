/*!
 * RetouchTool v1.0 — Liquify + Transform (style Photoshop) pour n'importe quelle image.
 * Pur JS + WebGL2, zéro dépendance, un seul fichier à inclure dans n'importe quelle page HTML.
 *
 *   <script src="retouch-tool.js"></script>
 *   RetouchTool.open({
 *     src: "photo.jpg",            // string (URL / data URL) | <img> | <canvas> | Blob | File | ImageBitmap
 *     title: "Ma retouche",        // optionnel
 *     format: "auto",              // "auto" | "image/png" | "image/jpeg" | "image/webp"
 *     quality: 0.92,               // JPEG / WebP
 *     background: "#ffffff",       // fond utilisé pour les formats sans alpha
 *     lang: "en",                  // "en" (défaut) | "fr"
 *     zIndex: 100000,
 *     onSave(result) {},           // result = { dataUrl, blob, mime, width, height, canvas } — peut renvoyer une Promise
 *     onCancel() {},
 *   });
 *   RetouchTool.close();  RetouchTool.isOpen();
 *
 * Sans onSave, le résultat est simplement téléchargé.
 * Raccourcis : voir la barre d'état de l'outil (W R O S B C E F D · [ ] · Ctrl+Z/Y · Espace = main · Ctrl+0 / Ctrl+1).
 */
(function (global) {
  "use strict";

  const VERSION = "1.0.0";

  // ---------------------------------------------------------------- i18n
  const I18N = {
    en: {
      title: "Retouch", liquify: "Liquify", transform: "Transform",
      undo: "Undo", redo: "Redo", reset: "Reset", cancel: "Cancel", save: "Save", saving: "Saving…", apply: "Apply",
      original: "Original", fit: "Fit", zoom100: "100%", close: "Close",
      tools: {
        warp: "Forward warp", reconstruct: "Reconstruct", pushLeft: "Push left", pucker: "Pucker", bloat: "Bloat",
        twirl: "Twirl", smooth: "Smooth", freeze: "Freeze", thaw: "Thaw",
        move: "Transform", marquee: "Marquee", hand: "Hand",
      },
      brush: "Brush", size: "Size", pressure: "Pressure", rate: "Rate", density: "Density", pen: "Use pen pressure",
      view: "View", showMesh: "Show mesh", meshSize: "Mesh size", showMask: "Show mask",
      restoreAll: "Restore all", thawAll: "Thaw all", meshSizes: ["Small", "Medium", "Large"],
      mode: "Mode",
      modes: { free: "Free transform", scale: "Scale", rotate: "Rotate", skew: "Skew", distort: "Distort", perspective: "Perspective", warp: "Warp" },
      flipH: "Flip H", flipV: "Flip V", rot90cw: "90° CW", rot90ccw: "90° CCW", rot180: "180°", resetTransform: "Reset transform",
      x: "X", y: "Y", w: "W %", h: "H %", angle: "Angle", proportional: "Keep proportions",
      selection: "Selection", selectAll: "Whole image", hole: "Vacated area",
      holeTransparent: "Transparent", holeKeep: "Keep original",
      warpPreset: "Warp preset", bend: "Bend",
      presets: { custom: "Custom", arc: "Arc", arcLower: "Arc lower", arcUpper: "Arc upper", arch: "Arch", bulge: "Bulge", flag: "Flag", wave: "Wave", fish: "Fish", rise: "Rise", fisheye: "Fisheye", inflate: "Inflate", squeeze: "Squeeze", twist: "Twist" },
      exportT: "Export", format: "Format", auto: "Auto", quality: "Quality", background: "Background",
      more: "More", options: "Settings", pinch: "Pinch to zoom · two fingers to pan",
      brushMenu: "right-click = brush options",
      liquifyShort: "Liquify", transformShort: "Transform",
      hints: {
        warp: "Drag to push pixels. [ ] brush size · Shift+[ ] pressure · Space = pan",
        reconstruct: "Paint to bring pixels back to the original. Hold to keep restoring.",
        pushLeft: "Drag up to push pixels left, down to push right (Alt = reverse).",
        pucker: "Hold / drag to pull pixels toward the center (Alt = bloat).",
        bloat: "Hold / drag to push pixels away from the center (Alt = pucker).",
        twirl: "Hold / drag to twirl clockwise (Alt = counter-clockwise).",
        smooth: "Paint to relax the distortion.",
        freeze: "Paint a mask to protect areas from liquify (red).",
        thaw: "Erase the freeze mask.",
        move: "Drag inside = move · corners = scale (Shift free, Alt from center) · outside corners = rotate · Ctrl = distort · Ctrl+Alt+Shift = perspective · Enter = apply",
        marquee: "Drag a rectangle to transform only that region. Click = whole image.",
        hand: "Drag to pan. Wheel = zoom.",
      },
      unsaved: "Discard your changes?", resetConfirm: "Reset everything back to the original image?",
      webgl: "WebGL2 is not available in this browser — the retouch tool can't run.",
      loadError: "Could not load the image (cross-origin without CORS?).",
      tooBig: "Image reduced to fit the GPU limit",
      imageSize: "Image", zoomL: "Zoom", steps: "steps", applied: "applied",
    },
    fr: {
      title: "Retouche", liquify: "Fluidité", transform: "Transformation",
      undo: "Annuler", redo: "Rétablir", reset: "Réinitialiser", cancel: "Fermer sans enregistrer", save: "Enregistrer", saving: "Enregistrement…", apply: "Appliquer",
      original: "Original", fit: "Ajuster", zoom100: "100 %", close: "Fermer",
      tools: {
        warp: "Déformation", reconstruct: "Reconstruction", pushLeft: "Pousser", pucker: "Contraction", bloat: "Dilatation",
        twirl: "Tourbillon", smooth: "Lissage", freeze: "Blocage", thaw: "Libération",
        move: "Transformer", marquee: "Sélection", hand: "Main",
      },
      brush: "Pinceau", size: "Taille", pressure: "Pression", rate: "Vitesse", density: "Densité", pen: "Pression du stylet",
      view: "Affichage", showMesh: "Afficher le filet", meshSize: "Taille du filet", showMask: "Afficher le masque",
      restoreAll: "Tout restaurer", thawAll: "Tout libérer", meshSizes: ["Petit", "Moyen", "Grand"],
      mode: "Mode",
      modes: { free: "Transformation manuelle", scale: "Échelle", rotate: "Rotation", skew: "Inclinaison", distort: "Torsion", perspective: "Perspective", warp: "Déformation" },
      flipH: "Symétrie H", flipV: "Symétrie V", rot90cw: "90° horaire", rot90ccw: "90° antihoraire", rot180: "180°", resetTransform: "Réinitialiser",
      x: "X", y: "Y", w: "L %", h: "H %", angle: "Angle", proportional: "Conserver les proportions",
      selection: "Sélection", selectAll: "Toute l'image", hole: "Zone libérée",
      holeTransparent: "Transparente", holeKeep: "Garder l'original",
      warpPreset: "Déformation prédéfinie", bend: "Courbure",
      presets: { custom: "Personnalisée", arc: "Arc", arcLower: "Arc inférieur", arcUpper: "Arc supérieur", arch: "Arche", bulge: "Renflement", flag: "Drapeau", wave: "Onde", fish: "Poisson", rise: "Ascension", fisheye: "Œil de poisson", inflate: "Gonflement", squeeze: "Compression", twist: "Torsion" },
      exportT: "Export", format: "Format", auto: "Auto", quality: "Qualité", background: "Fond",
      more: "Plus", options: "Réglages", pinch: "Pincer pour zoomer · deux doigts pour déplacer",
      brushMenu: "clic droit = options du pinceau",
      liquifyShort: "Fluidité", transformShort: "Transf.",
      hints: {
        warp: "Glisser pour pousser les pixels. [ ] taille · Maj+[ ] pression · Espace = main",
        reconstruct: "Peindre pour ramener les pixels à l'original. Maintenir pour continuer.",
        pushLeft: "Glisser vers le haut pousse à gauche, vers le bas à droite (Alt = inverse).",
        pucker: "Maintenir / glisser pour attirer les pixels vers le centre (Alt = dilater).",
        bloat: "Maintenir / glisser pour repousser les pixels du centre (Alt = contracter).",
        twirl: "Maintenir / glisser pour tourner dans le sens horaire (Alt = antihoraire).",
        smooth: "Peindre pour adoucir la déformation.",
        freeze: "Peindre un masque pour protéger une zone (rouge).",
        thaw: "Effacer le masque de blocage.",
        move: "Glisser à l'intérieur = déplacer · coins = échelle (Maj libre, Alt depuis le centre) · hors des coins = rotation · Ctrl = torsion · Ctrl+Alt+Maj = perspective · Entrée = appliquer",
        marquee: "Tracer un rectangle pour ne transformer que cette zone. Clic = toute l'image.",
        hand: "Glisser pour déplacer la vue. Molette = zoom.",
      },
      unsaved: "Abandonner les modifications ?", resetConfirm: "Tout remettre comme l'image d'origine ?",
      webgl: "WebGL2 n'est pas disponible dans ce navigateur — l'outil de retouche ne peut pas fonctionner.",
      loadError: "Impossible de charger l'image (origine différente sans CORS ?).",
      tooBig: "Image réduite pour tenir dans la limite du GPU",
      imageSize: "Image", zoomL: "Zoom", steps: "étapes", applied: "appliquée(s)",
    },
  };

  // ---------------------------------------------------------------- icons (24x24, stroke = currentColor)
  const ICONS = {
    warp: '<circle cx="9" cy="12" r="4"/><path d="M13 12h7M17 9l3 3-3 3"/>',
    reconstruct: '<path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v5h5"/>',
    pushLeft: '<path d="M20 12H8M12 8l-4 4 4 4"/><path d="M4 5v14"/>',
    pucker: '<path d="M4 4l5 5M20 4l-5 5M4 20l5-5M20 20l-5-5"/><circle cx="12" cy="12" r="2"/>',
    bloat: '<path d="M9 9L4 4M15 9l5-5M9 15l-5 5M15 15l5 5"/><circle cx="12" cy="12" r="3"/>',
    twirl: '<path d="M12 12a2 2 0 0 0 2-2 4 4 0 0 0-4-4 6 6 0 0 0-6 6 8 8 0 0 0 8 8 10 10 0 0 0 9-6"/>',
    smooth: '<path d="M3 11c3-4 6-4 9 0s6 4 9 0"/><path d="M3 17c3-4 6-4 9 0s6 4 9 0" opacity=".45"/>',
    freeze: '<path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18"/>',
    thaw: '<path d="M12 4s-6 6.5-6 11a6 6 0 0 0 12 0c0-4.5-6-11-6-11z"/>',
    move: '<rect x="6" y="6" width="12" height="12"/><path d="M4 4h4v4H4zM16 4h4v4h-4zM4 16h4v4H4zM16 16h4v4h-4z" fill="currentColor" stroke="none"/>',
    marquee: '<rect x="4" y="4" width="16" height="16" stroke-dasharray="3 2.5"/>',
    hand: '<path d="M8 13V6a1.5 1.5 0 0 1 3 0v6M11 12V4.5a1.5 1.5 0 0 1 3 0V12M14 12V6a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3.6 14a1.5 1.5 0 0 1 2.4-1.8L8 14"/>',
  };
  const KEYS = { warp: "W", reconstruct: "R", pushLeft: "O", pucker: "S", bloat: "B", twirl: "C", smooth: "E", freeze: "F", thaw: "D", move: "V", marquee: "M", hand: "H" };
  const LIQUIFY_TOOLS = ["warp", "reconstruct", "pushLeft", "pucker", "bloat", "twirl", "smooth", "freeze", "thaw"];
  const TRANSFORM_TOOLS = ["move", "marquee"];

  // ---------------------------------------------------------------- CSS (scoped under .rt-root)
  const CSS = `
.rt-root{position:fixed;inset:0;display:grid;grid-template-rows:46px 1fr 26px;grid-template-columns:62px 1fr 276px;
  grid-template-areas:"top top top" "left stage right" "status status status";
  --rt-bg:#1a1b1e;--rt-panel:#2a2b30;--rt-panel2:#34353b;--rt-text:#e7e7ea;--rt-muted:#8b8d95;--rt-accent:#4f8cff;
  --rt-danger:#e0566b;--rt-border:rgba(255,255,255,.08);--rt-stage:#111113;
  background:var(--rt-bg);color:var(--rt-text);font:13px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  user-select:none;-webkit-user-select:none;outline:none;box-sizing:border-box}
.rt-root *,.rt-root *::before,.rt-root *::after{box-sizing:border-box}
.rt-top{grid-area:top;display:flex;align-items:center;gap:8px;padding:0 12px;background:var(--rt-panel);border-bottom:1px solid var(--rt-border);min-width:0}
.rt-title{font-weight:600;margin-right:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:240px;flex:0 1 auto}
.rt-tabs{display:flex;background:var(--rt-bg);border-radius:6px;padding:2px;flex:0 0 auto}
.rt-tab{padding:5px 14px;border-radius:5px;cursor:pointer;color:var(--rt-muted);font-weight:600}
.rt-tab:hover{color:var(--rt-text)}
.rt-tab.active{background:var(--rt-accent);color:#fff}
.rt-btn{background:var(--rt-panel2);border:1px solid var(--rt-border);color:var(--rt-text);border-radius:5px;padding:5px 10px;cursor:pointer;font:inherit;white-space:nowrap;line-height:1.2}
.rt-btn:hover{filter:brightness(1.18)}
.rt-btn:disabled{opacity:.4;cursor:default;filter:none}
.rt-btn.primary{background:var(--rt-accent);border-color:transparent;color:#fff;font-weight:600}
.rt-btn.danger{color:var(--rt-danger)}
.rt-btn.icon{padding:4px 8px;min-width:30px;font-size:14px}
.rt-btn.toggle.on{background:var(--rt-accent);color:#fff;border-color:transparent}
.rt-btn.small{padding:3px 8px;font-size:12px}
.rt-spacer{flex:1}
.rt-zoom{display:flex;align-items:center;gap:2px}
.rt-zoom .rt-zoomval{min-width:52px;text-align:center;font-variant-numeric:tabular-nums;color:var(--rt-muted);font-size:12px}
.rt-left{grid-area:left;background:var(--rt-panel);border-right:1px solid var(--rt-border);display:flex;flex-direction:column;align-items:center;padding:8px 0;gap:3px;overflow-y:auto;overflow-x:hidden}
.rt-tool{width:50px;height:46px;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;cursor:pointer;color:var(--rt-muted);font-size:9px;border:1px solid transparent;position:relative;text-align:center;line-height:1}
.rt-tool svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}
.rt-tool span{max-width:48px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rt-tool:hover{background:var(--rt-panel2);color:var(--rt-text)}
.rt-tool.active{background:var(--rt-accent);color:#fff;border-color:transparent}
.rt-tool i{position:absolute;top:2px;right:4px;font-style:normal;font-size:8px;opacity:.55}
.rt-tool-sep{width:34px;height:1px;background:var(--rt-border);margin:4px 0;flex:0 0 auto}
.rt-stage{grid-area:stage;position:relative;overflow:hidden;background:var(--rt-stage);touch-action:none;min-width:0;min-height:0}
.rt-stage canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
.rt-stage.brush{cursor:none}.rt-stage.pan{cursor:grab}.rt-stage.panning{cursor:grabbing}
.rt-stage.marquee{cursor:crosshair}
.rt-msg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(20,20,25,.9);border:1px solid var(--rt-border);border-radius:8px;padding:14px 18px;max-width:80%;text-align:center;color:var(--rt-text);font-size:13px;pointer-events:none}
.rt-msg.err{color:var(--rt-danger)}
.rt-right{grid-area:right;background:var(--rt-panel);border-left:1px solid var(--rt-border);overflow-y:auto;overflow-x:hidden;padding:12px 12px 20px;display:flex;flex-direction:column;gap:14px;min-width:0}
.rt-sec{display:flex;flex-direction:column;gap:7px}
.rt-sec h4{margin:0 0 2px;font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;color:var(--rt-muted);font-weight:600}
.rt-row{display:flex;align-items:center;gap:8px;min-height:24px}
.rt-row label{flex:0 0 70px;color:var(--rt-muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rt-row input[type=range]{flex:1;min-width:0;accent-color:var(--rt-accent);margin:0}
.rt-row .rt-val{flex:0 0 40px;text-align:right;font-variant-numeric:tabular-nums;font-size:12px}
.rt-row input[type=number],.rt-row select,.rt-row input[type=text]{flex:1;min-width:0;width:0;background:var(--rt-bg);color:var(--rt-text);border:1px solid var(--rt-border);border-radius:4px;padding:4px 6px;font:inherit;font-size:12px;outline:none}
.rt-row input[type=number]:focus,.rt-row select:focus{border-color:var(--rt-accent)}
.rt-row input[type=number]{font-variant-numeric:tabular-nums}
.rt-row input[type=color]{width:34px;height:24px;padding:0 2px;border:1px solid var(--rt-border);background:var(--rt-bg);border-radius:4px;cursor:pointer}
.rt-row .rt-unit{color:var(--rt-muted);font-size:11px;flex:0 0 auto}
.rt-check{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;color:var(--rt-text)}
.rt-check input{accent-color:var(--rt-accent);margin:0}
.rt-grid2{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.rt-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
.rt-status{grid-area:status;background:var(--rt-panel);border-top:1px solid var(--rt-border);display:flex;align-items:center;gap:16px;padding:0 12px;font-size:11.5px;color:var(--rt-muted);white-space:nowrap;overflow:hidden;min-width:0}
.rt-status b{color:var(--rt-text);font-weight:500}
.rt-status .rt-hint{flex:1;overflow:hidden;text-overflow:ellipsis}
.rt-hidden{display:none!important}
.rt-kbd{display:inline-block;padding:0 4px;border:1px solid var(--rt-border);border-radius:3px;font-size:10px;color:var(--rt-muted);margin-left:4px;line-height:1.5}
.rt-top{position:relative}
.rt-topscroll{display:contents}
.rt-more{display:flex;align-items:center;gap:8px}
.rt-grip,.rt-only-mobile{display:none}
.rt-pop{position:fixed;z-index:40;width:232px;padding:9px 12px 11px;display:none;
  background:var(--rt-panel);border:1px solid var(--rt-border);border-radius:8px;box-shadow:0 14px 36px rgba(0,0,0,.55)}
.rt-pop.open{display:block}
.rt-pop h4{margin:0 0 6px;font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;color:var(--rt-muted);font-weight:600}
.rt-pop .rt-row label{flex:0 0 62px}
.rt-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);max-width:88%;background:rgba(20,20,25,.92);
  border:1px solid var(--rt-border);border-radius:8px;padding:7px 12px;font-size:12px;line-height:1.3;text-align:center;
  color:var(--rt-text);opacity:0;transition:opacity .2s;pointer-events:none}
.rt-toast.show{opacity:1}
@media (max-width:1100px){.rt-root{grid-template-columns:62px 1fr 240px}.rt-title{max-width:150px}}

/* ---------------- phone / small screen layout ---------------- */
.rt-root.rt-mobile{
  grid-template-rows:auto 1fr auto;grid-template-columns:100%;
  grid-template-areas:"top" "stage" "left";
  touch-action:none;padding-top:env(safe-area-inset-top,0px)}
.rt-mobile .rt-top{height:48px;padding:0 8px;gap:6px}
.rt-mobile .rt-title,.rt-mobile .rt-status,.rt-mobile .rt-zoomval,.rt-mobile .rt-no-mobile{display:none}
.rt-mobile .rt-only-mobile{display:flex;align-items:center;justify-content:center}
.rt-mobile .rt-tab{padding:6px 12px;font-size:12.5px}
.rt-mobile .rt-btn{padding:7px 10px}
.rt-mobile .rt-btn.icon{min-width:36px;padding:6px 8px}
.rt-mobile .rt-btn.small{padding:6px 9px}
.rt-mobile .rt-cancel{font-size:0;padding:6px 10px}
.rt-mobile .rt-cancel::after{content:"✕";font-size:14px;line-height:1}
.rt-mobile .rt-topscroll{display:flex;align-items:center;gap:6px;flex:1 1 auto;min-width:0;
  overflow-x:auto;overflow-y:hidden;touch-action:pan-x;scrollbar-width:none}
.rt-mobile .rt-topscroll::-webkit-scrollbar{display:none}
.rt-mobile .rt-top>.rt-btn,.rt-mobile .rt-topscroll>*{flex:0 0 auto}
.rt-mobile .rt-spacer{flex:1 0 4px}
.rt-mobile .rt-more{gap:6px}
.rt-mobile .rt-tab{font-size:0;padding:6px 10px}
.rt-mobile .rt-tab::after{content:attr(data-short);font-size:12.5px}
/* too narrow for one row: mode tabs + close/save on top, history + view controls underneath */
@media (max-width:559px){
  .rt-mobile .rt-top{height:auto;flex-wrap:wrap;row-gap:5px;padding:5px 8px}
  .rt-mobile .rt-tabs{order:1}
  .rt-mobile .rt-spacer{order:2}
  .rt-mobile .rt-only-mobile,.rt-mobile .rt-cancel,.rt-mobile .rt-btn.primary{order:3}
  .rt-mobile .rt-topscroll{order:4;flex:1 0 100%;min-width:100%}
}
.rt-mobile .rt-left{grid-area:left;flex-direction:row;align-items:center;gap:4px;
  border-right:none;border-top:1px solid var(--rt-border);
  padding:6px 8px calc(6px + env(safe-area-inset-bottom,0px));
  overflow-x:auto;overflow-y:hidden;touch-action:pan-x;scrollbar-width:none}
.rt-mobile .rt-left::-webkit-scrollbar{display:none}
.rt-mobile .rt-tool{flex:0 0 auto;width:58px;height:50px;font-size:9px}
.rt-mobile .rt-tool svg{width:22px;height:22px}
.rt-mobile .rt-tool span{max-width:56px}
.rt-mobile .rt-tool-sep{width:1px;height:34px;margin:0 5px}
.rt-mobile .rt-stage.brush{cursor:default}
.rt-mobile .rt-right{grid-area:stage;align-self:end;justify-self:stretch;z-index:8;
  max-height:min(62%,420px);border-left:none;border-top:1px solid var(--rt-border);
  border-radius:12px 12px 0 0;box-shadow:0 -12px 30px rgba(0,0,0,.5);
  padding:12px 14px calc(22px + env(safe-area-inset-bottom,0px));touch-action:pan-y;
  transform:translateY(105%);visibility:hidden;pointer-events:none;
  transition:transform .22s ease,visibility 0s linear .22s}
.rt-mobile .rt-right.open{transform:none;visibility:visible;pointer-events:auto;transition:transform .22s ease}
.rt-mobile .rt-grip{display:block;position:sticky;top:-12px;z-index:3;
  margin:-12px -14px 4px;padding:9px 0 7px;background:var(--rt-panel);border-radius:12px 12px 0 0;cursor:pointer}
.rt-mobile .rt-grip::after{content:"";display:block;width:42px;height:4px;border-radius:2px;background:var(--rt-panel2);margin:0 auto}
/* landscape phone: the strip gives its labels back to the canvas */
@media (max-height:460px){
  .rt-mobile .rt-tool{width:46px;height:40px}
  .rt-mobile .rt-tool span{display:none}
  .rt-mobile .rt-left{padding-top:4px;padding-bottom:calc(4px + env(safe-area-inset-bottom,0px))}
  .rt-mobile .rt-right{max-height:82%}
}
.rt-mobile .rt-row{min-height:30px}
.rt-mobile .rt-row label{flex:0 0 78px}
.rt-mobile .rt-row input[type=range]{height:26px}
.rt-mobile .rt-check{padding:3px 0}
`;

  // ---------------------------------------------------------------- small helpers
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function svgIcon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;
  }

  // ---------------------------------------------------------------- 3x3 matrices (row-major, [a b c, d e f, g h i])
  function m3Mul(A, B) {
    return [
      A[0]*B[0] + A[1]*B[3] + A[2]*B[6], A[0]*B[1] + A[1]*B[4] + A[2]*B[7], A[0]*B[2] + A[1]*B[5] + A[2]*B[8],
      A[3]*B[0] + A[4]*B[3] + A[5]*B[6], A[3]*B[1] + A[4]*B[4] + A[5]*B[7], A[3]*B[2] + A[4]*B[5] + A[5]*B[8],
      A[6]*B[0] + A[7]*B[3] + A[8]*B[6], A[6]*B[1] + A[7]*B[4] + A[8]*B[7], A[6]*B[2] + A[7]*B[5] + A[8]*B[8],
    ];
  }
  function m3Inv(m) {
    const [a, b, c, d, e, f, g, h, i] = m;
    const A = e*i - f*h, B = -(d*i - f*g), C = d*h - e*g;
    const det = a*A + b*B + c*C;
    if (Math.abs(det) < 1e-12) return null;
    const id = 1 / det;
    return [
      A*id, -(b*i - c*h)*id, (b*f - c*e)*id,
      B*id, (a*i - c*g)*id, -(a*f - c*d)*id,
      C*id, -(a*h - b*g)*id, (a*e - b*d)*id,
    ];
  }
  // apply to a point, returns [x, y] (perspective divide)
  function m3Pt(m, x, y) {
    const w = m[6]*x + m[7]*y + m[8];
    return [(m[0]*x + m[1]*y + m[2]) / w, (m[3]*x + m[4]*y + m[5]) / w];
  }
  // homogeneous (no divide) → [X, Y, W]
  function m3PtH(m, x, y) {
    return [m[0]*x + m[1]*y + m[2], m[3]*x + m[4]*y + m[5], m[6]*x + m[7]*y + m[8]];
  }
  const m3Translate = (tx, ty) => [1, 0, tx, 0, 1, ty, 0, 0, 1];
  const m3Scale = (sx, sy) => [sx, 0, 0, 0, sy, 0, 0, 0, 1];
  function m3Rotate(a) { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; }
  // affine about a pivot: T(p) * M * T(-p)
  const m3About = (M, px, py) => m3Mul(m3Translate(px, py), m3Mul(M, m3Translate(-px, -py)));
  // column-major Float32Array for WebGL uniformMatrix3fv
  const m3ToGL = (m) => new Float32Array([m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]);

  // Unit square (0,0)(1,0)(1,1)(0,1) → quad [p0,p1,p2,p3] (Heckbert). Returns a 3x3 homography.
  function squareToQuad(q) {
    const [x0, y0] = q[0], [x1, y1] = q[1], [x2, y2] = q[2], [x3, y3] = q[3];
    const sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
    if (Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9) {
      return [x1 - x0, x3 - x0, x0, y1 - y0, y3 - y0, y0, 0, 0, 1];
    }
    const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2;
    const det = dx1*dy2 - dx2*dy1;
    if (Math.abs(det) < 1e-12) return [x1 - x0, x3 - x0, x0, y1 - y0, y3 - y0, y0, 0, 0, 1];
    const g = (sx*dy2 - dx2*sy) / det;
    const h = (dx1*sy - sx*dy1) / det;
    return [x1 - x0 + g*x1, x3 - x0 + h*x3, x0, y1 - y0 + g*y1, y3 - y0 + h*y3, y0, g, h, 1];
  }

  // cubic Bézier basis
  function bez(t) {
    const u = 1 - t;
    return [u*u*u, 3*u*u*t, 3*u*t*t, t*t*t];
  }

  // ---------------------------------------------------------------- WebGL2 renderer
  const VS = `#version 300 es
in vec3 a_pos; in vec2 a_uv; in float a_mask;
uniform mat3 u_view;
out vec2 v_uv; out float v_mask; out vec2 v_img;
void main(){
  vec3 c = u_view * a_pos;
  gl_Position = vec4(c.xy, 0.0, c.z);
  v_uv = a_uv; v_mask = a_mask; v_img = a_pos.xy / max(a_pos.z, 1e-6);
}`;
  const FS = `#version 300 es
precision highp float;
in vec2 v_uv; in float v_mask; in vec2 v_img;
uniform sampler2D u_tex;
uniform float u_showMesh, u_meshN, u_showMask, u_alpha, u_useHole, u_checker, u_cell;
uniform vec4 u_hole;
out vec4 o;
void main(){
  if (u_checker > 0.5) {
    float k = mod(floor(v_img.x / u_cell) + floor(v_img.y / u_cell), 2.0);
    o = vec4(vec3(mix(0.42, 0.56, k)), 1.0);
    return;
  }
  if (u_useHole > 0.5 && v_uv.x >= u_hole.x && v_uv.y >= u_hole.y && v_uv.x < u_hole.z && v_uv.y < u_hole.w) discard;
  vec4 c = texture(u_tex, clamp(v_uv, 0.0, 1.0));
  if (u_showMesh > 0.5) {
    vec2 g = v_uv * u_meshN;
    vec2 d = abs(fract(g - 0.5) - 0.5) / max(fwidth(g), vec2(1e-5));
    float line = 1.0 - min(min(d.x, d.y), 1.0);
    c = mix(c, vec4(0.35, 0.65, 1.0, 1.0), line * 0.8);
  }
  if (u_showMask > 0.5 && v_mask > 0.001) {
    c = mix(c, vec4(0.9, 0.12, 0.12, 1.0), clamp(v_mask, 0.0, 1.0) * 0.5);
  }
  o = c * u_alpha;
}`;

  class Mesh {
    constructor(gl, nVerts, indices) {
      this.gl = gl; this.n = nVerts;
      this.pos = new Float32Array(nVerts * 3);
      this.uv = new Float32Array(nVerts * 2);
      this.mask = new Float32Array(nVerts);
      this.posBuf = gl.createBuffer(); this.uvBuf = gl.createBuffer(); this.maskBuf = gl.createBuffer();
      this.idxBuf = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuf);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
      this.count = indices.length;
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf); gl.bufferData(gl.ARRAY_BUFFER, this.pos, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuf); gl.bufferData(gl.ARRAY_BUFFER, this.uv, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.maskBuf); gl.bufferData(gl.ARRAY_BUFFER, this.mask, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuf);
      gl.bindVertexArray(null);
    }
    // upload a vertex range [v0, v1) of the given attribute ("pos" | "uv" | "mask"); whole array if omitted
    upload(which, v0 = 0, v1 = this.n) {
      const gl = this.gl;
      const arr = this[which], comps = which === "pos" ? 3 : which === "uv" ? 2 : 1;
      gl.bindBuffer(gl.ARRAY_BUFFER, this[which + "Buf"]);
      gl.bufferSubData(gl.ARRAY_BUFFER, v0 * comps * 4, arr, v0 * comps, (v1 - v0) * comps);
    }
    dispose() {
      const gl = this.gl;
      gl.deleteBuffer(this.posBuf); gl.deleteBuffer(this.uvBuf); gl.deleteBuffer(this.maskBuf); gl.deleteBuffer(this.idxBuf);
      gl.deleteVertexArray(this.vao);
    }
  }

  // regular grid mesh (nx × ny vertices) → index buffer
  function gridIndices(nx, ny) {
    const idx = new Uint32Array((nx - 1) * (ny - 1) * 6);
    let k = 0;
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = j*nx + i, b = a + 1, c = a + nx, d = c + 1;
      idx[k++] = a; idx[k++] = c; idx[k++] = b;
      idx[k++] = b; idx[k++] = c; idx[k++] = d;
    }
    return idx;
  }

  class Renderer {
    constructor(canvas) {
      const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false, alpha: true });
      if (!gl) throw new Error("webgl2");
      this.gl = gl; this.canvas = canvas;
      this.maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      this.prog = this._program(VS, FS);
      this.u = {};
      for (const n of ["u_view", "u_tex", "u_showMesh", "u_meshN", "u_showMask", "u_alpha", "u_useHole", "u_hole", "u_checker", "u_cell"])
        this.u[n] = gl.getUniformLocation(this.prog, n);
      gl.useProgram(this.prog);
      gl.uniform1i(this.u.u_tex, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // premultiplied alpha
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      // 2-triangle quad used for full-image draws + checkerboard
      this.quad = new Mesh(gl, 4, new Uint32Array([0, 2, 1, 1, 2, 3]));
    }
    _program(vs, fs) {
      const gl = this.gl;
      const mk = (type, src) => {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      const p = gl.createProgram();
      gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, "a_pos"); gl.bindAttribLocation(p, 1, "a_uv"); gl.bindAttribLocation(p, 2, "a_mask");
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      return p;
    }
    texFromImage(source) {
      const gl = this.gl, t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      return t;
    }
    // empty texture + framebuffer (render target)
    target(w, h) {
      const gl = this.gl, t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { tex: t, fb, w, h };
    }
    disposeTarget(t) { this.gl.deleteTexture(t.tex); this.gl.deleteFramebuffer(t.fb); }
    // begin drawing into a target (or the screen when null). Clears to transparent.
    begin(target, cw, ch) {
      const gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fb : null);
      gl.viewport(0, 0, target ? target.w : cw, target ? target.h : ch);
      gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    // image px → clip space. screen: y flipped (canvas). fbo: not flipped (texel row 0 = image row 0)
    viewScreen(ox, oy, zoom, cw, ch) {
      return [2*zoom/cw, 0, 2*ox/cw - 1, 0, -2*zoom/ch, 1 - 2*oy/ch, 0, 0, 1];
    }
    viewFBO(w, h) { return [2/w, 0, -1, 0, 2/h, -1, 0, 0, 1]; }
    scissor(x, y, w, h, ch) {
      const gl = this.gl;
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(Math.floor(x), Math.floor(ch - y - h), Math.ceil(w), Math.ceil(h));
    }
    noScissor() { const gl = this.gl; gl.disable(gl.SCISSOR_TEST); }
    draw(mesh, tex, view, o = {}) {
      const gl = this.gl, u = this.u;
      gl.useProgram(this.prog);
      gl.uniformMatrix3fv(u.u_view, false, m3ToGL(view));
      gl.uniform1f(u.u_showMesh, o.showMesh ? 1 : 0);
      gl.uniform1f(u.u_meshN, o.meshN || 20);
      gl.uniform1f(u.u_showMask, o.showMask ? 1 : 0);
      gl.uniform1f(u.u_alpha, o.alpha == null ? 1 : o.alpha);
      gl.uniform1f(u.u_useHole, o.hole ? 1 : 0);
      gl.uniform4f(u.u_hole, ...(o.hole || [0, 0, 0, 0]));
      gl.uniform1f(u.u_checker, o.checker ? 1 : 0);
      gl.uniform1f(u.u_cell, o.cell || 8);
      if (tex) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); }
      gl.bindVertexArray(mesh.vao);
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0);
      gl.bindVertexArray(null);
    }
    // full-image quad (positions in image px, uv 0..1)
    setQuad(w, h) {
      const q = this.quad;
      q.pos.set([0, 0, 1, w, 0, 1, 0, h, 1, w, h, 1]);
      q.uv.set([0, 0, 1, 0, 0, 1, 1, 1]);
      q.upload("pos"); q.upload("uv");
    }
    // read a target back as straight-alpha RGBA (top-down rows)
    readTarget(t) {
      const gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
      const px = new Uint8ClampedArray(t.w * t.h * 4);
      gl.readPixels(0, 0, t.w, t.h, gl.RGBA, gl.UNSIGNED_BYTE, px);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      for (let i = 0; i < px.length; i += 4) {          // un-premultiply
        const a = px[i + 3];
        if (a > 0 && a < 255) { const k = 255 / a; px[i] = px[i]*k; px[i+1] = px[i+1]*k; px[i+2] = px[i+2]*k; }
      }
      return px;
    }
    dispose() {
      const gl = this.gl;
      this.quad.dispose();
      gl.deleteProgram(this.prog);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    }
  }

  // ---------------------------------------------------------------- Liquify displacement field
  // Backward-mapping mesh: every grid vertex sits at a fixed output position p and samples the
  // source at p + D(p). A brush stroke moving content by v is composed as D'(p) = D(p - v) - v.
  class LiquifyField {
    constructor(W, H, maxVerts = 320000) {
      this.W = W; this.H = H;
      const cell = Math.max(1, Math.ceil(Math.sqrt((W * H) / maxVerts)));
      this.gw = Math.max(1, Math.ceil(W / cell)); this.gh = Math.max(1, Math.ceil(H / cell));
      this.cx = W / this.gw; this.cy = H / this.gh;              // exact cell size (may be fractional)
      this.nx = this.gw + 1; this.ny = this.gh + 1; this.n = this.nx * this.ny;
      this.dx = new Float32Array(this.n); this.dy = new Float32Array(this.n);
      this.mask = new Float32Array(this.n);
      this.touched = false;          // any non-zero displacement since the last reset?
      this._sx = null;               // scratch copies used during composition
    }
    reset() { this.dx.fill(0); this.dy.fill(0); this.touched = false; }
    thawAll() { this.mask.fill(0); }
    hasMask() { for (let i = 0; i < this.n; i++) if (this.mask[i] > 0.001) return true; return false; }
    isIdentity() {
      if (!this.touched) return true;
      for (let i = 0; i < this.n; i++) if (this.dx[i] !== 0 || this.dy[i] !== 0) return false;
      return true;
    }
    // bilinear sample of an array at fractional grid coords (clamped)
    sample(arr, gx, gy) {
      gx = clamp(gx, 0, this.gw); gy = clamp(gy, 0, this.gh);
      const i0 = Math.min(Math.floor(gx), this.gw - 1), j0 = Math.min(Math.floor(gy), this.gh - 1);
      const fx = gx - i0, fy = gy - j0, nx = this.nx;
      const a = arr[j0*nx + i0], b = arr[j0*nx + i0 + 1], c = arr[(j0+1)*nx + i0], d = arr[(j0+1)*nx + i0 + 1];
      return (a*(1-fx) + b*fx)*(1-fy) + (c*(1-fx) + d*fx)*fy;
    }
    // fill mesh uv (and mask) arrays for vertex rows [j0, j1]
    fillMesh(mesh, j0 = 0, j1 = this.ny - 1) {
      const { nx, cx, cy, W, H, dx, dy, mask } = this;
      const uv = mesh.uv, mk = mesh.mask;
      for (let j = j0; j <= j1; j++) {
        const py = j * cy;
        for (let i = 0; i < nx; i++) {
          const k = j*nx + i;
          uv[k*2] = (i*cx + dx[k]) / W; uv[k*2 + 1] = (py + dy[k]) / H;
          mk[k] = mask[k];
        }
      }
    }
    fillMeshFrom(mesh, dx, dy) {     // used when re-baking a committed op
      const { nx, ny, cx, cy, W, H } = this, uv = mesh.uv;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const k = j*nx + i;
        uv[k*2] = (i*cx + dx[k]) / W; uv[k*2 + 1] = (j*cy + dy[k]) / H;
      }
    }
    // static vertex positions (image px) for a mesh
    fillPositions(mesh) {
      const { nx, ny, cx, cy } = this, pos = mesh.pos;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const k = (j*nx + i) * 3;
        pos[k] = i*cx; pos[k + 1] = j*cy; pos[k + 2] = 1;
      }
    }
    // brush falloff: plateau up to `density` then smooth to 0 at the edge
    static falloff(t, density) {
      const h = clamp(density / 100, 0, 0.97);
      if (t <= h) return 1;
      const s = (t - h) / (1 - h);
      return 1 - s*s*(3 - 2*s);
    }
    // Apply one brush dab. Returns the touched vertex rect {i0,j0,i1,j1} or null.
    //  tool:   warp | pushLeft | bloat | pucker | twirl | reconstruct | smooth | freeze | thaw
    //  c:      [x, y] image px, r: radius px, k: strength 0..1, density: 0..100
    //  v:      [dx, dy] pointer delta (warp / pushLeft), amount: 0..1 (time-based tools)
    dab(tool, c, r, k, density, v, amount) {
      const { nx, gw, gh, cx, cy, dx, dy, mask } = this;
      const i0 = clamp(Math.floor((c[0] - r) / cx), 0, gw), i1 = clamp(Math.ceil((c[0] + r) / cx), 0, gw);
      const j0 = clamp(Math.floor((c[1] - r) / cy), 0, gh), j1 = clamp(Math.ceil((c[1] + r) / cy), 0, gh);
      if (i1 < i0 || j1 < j0) return null;
      const r2 = r * r;

      if (tool === "freeze" || tool === "thaw") {
        const s = clamp(amount, 0, 1) * k * (tool === "freeze" ? 1 : -1);
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const px = i*cx - c[0], py = j*cy - c[1], d2 = px*px + py*py;
          if (d2 >= r2) continue;
          const f = LiquifyField.falloff(Math.sqrt(d2) / r, density);
          const idx = j*nx + i;
          mask[idx] = clamp(mask[idx] + s * f, 0, 1);
        }
        return { i0, j0, i1, j1 };
      }
      if (tool === "reconstruct") {
        const s = clamp(amount * k, 0, 1);
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const px = i*cx - c[0], py = j*cy - c[1], d2 = px*px + py*py;
          if (d2 >= r2) continue;
          const idx = j*nx + i;
          const f = LiquifyField.falloff(Math.sqrt(d2) / r, density) * (1 - mask[idx]) * s;
          dx[idx] *= 1 - f; dy[idx] *= 1 - f;
        }
        this.touched = true;
        return { i0, j0, i1, j1 };
      }
      if (tool === "smooth") {
        const s = clamp(amount * k, 0, 1);
        const sx = this._copyRegion(dx, i0 - 2, j0 - 2, i1 + 2, j1 + 2), sy = this._copyRegion(dy, i0 - 2, j0 - 2, i1 + 2, j1 + 2);
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const px = i*cx - c[0], py = j*cy - c[1], d2 = px*px + py*py;
          if (d2 >= r2) continue;
          const idx = j*nx + i;
          const f = LiquifyField.falloff(Math.sqrt(d2) / r, density) * (1 - mask[idx]) * s;
          let ax = 0, ay = 0, cnt = 0;
          for (let jj = j - 2; jj <= j + 2; jj++) for (let ii = i - 2; ii <= i + 2; ii++) {
            if (ii < 0 || jj < 0 || ii > gw || jj > gh) continue;
            ax += sx.get(ii, jj); ay += sy.get(ii, jj); cnt++;
          }
          dx[idx] = lerp(dx[idx], ax / cnt, f); dy[idx] = lerp(dy[idx], ay / cnt, f);
        }
        this.touched = true;
        return { i0, j0, i1, j1 };
      }

      // ---- composing tools: compute v(p), then D'(p) = D(p - v) - v
      let maxV = 0;
      if (tool === "warp" || tool === "pushLeft") maxV = Math.hypot(v[0], v[1]) * k;
      else if (tool === "bloat" || tool === "pucker") maxV = amount * k * r;
      else if (tool === "twirl") maxV = amount * k * r;
      if (maxV <= 1e-6) return null;
      const mi = Math.ceil(maxV / cx) + 1, mj = Math.ceil(maxV / cy) + 1;
      const sx = this._copyRegion(dx, i0 - mi, j0 - mj, i1 + mi, j1 + mj);
      const sy = this._copyRegion(dy, i0 - mi, j0 - mj, i1 + mi, j1 + mj);
      const pl = tool === "pushLeft" ? [v[1], -v[0]] : null;
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const ox = i*cx, oy = j*cy;
        const px = ox - c[0], py = oy - c[1], d2 = px*px + py*py;
        if (d2 >= r2) continue;
        const idx = j*nx + i;
        const f = LiquifyField.falloff(Math.sqrt(d2) / r, density) * (1 - mask[idx]) * k;
        if (f <= 0) continue;
        let vx, vy;
        if (tool === "warp") { vx = v[0] * f; vy = v[1] * f; }
        else if (tool === "pushLeft") { vx = pl[0] * f; vy = pl[1] * f; }
        else if (tool === "bloat") { vx = px * amount * f; vy = py * amount * f; }
        else if (tool === "pucker") { vx = -px * amount * f; vy = -py * amount * f; }
        else { vx = -py * amount * f; vy = px * amount * f; }          // twirl (clockwise on screen)
        // sample old displacement at p - v (bilinear on the scratch copy)
        const qx = (ox - vx) / cx, qy = (oy - vy) / cy;
        dx[idx] = sx.sampleAt(qx, qy) - vx;
        dy[idx] = sy.sampleAt(qx, qy) - vy;
      }
      this.touched = true;
      return { i0, j0, i1, j1 };
    }
    // copy a rect of vertices (clamped to the grid) into a scratch object with bilinear sampling
    _copyRegion(arr, i0, j0, i1, j1) {
      const gw = this.gw, gh = this.gh, nx = this.nx;
      i0 = clamp(i0, 0, gw); i1 = clamp(i1, 0, gw); j0 = clamp(j0, 0, gh); j1 = clamp(j1, 0, gh);
      const w = i1 - i0 + 1, h = j1 - j0 + 1;
      const buf = new Float32Array(w * h);
      for (let j = 0; j < h; j++) buf.set(arr.subarray((j0 + j)*nx + i0, (j0 + j)*nx + i0 + w), j * w);
      return {
        get(i, j) { return buf[(clamp(j, j0, j1) - j0) * w + (clamp(i, i0, i1) - i0)]; },
        sampleAt(gx, gy) {
          gx = clamp(gx, i0, i1); gy = clamp(gy, j0, j1);
          const a0 = Math.min(Math.floor(gx), i1 - 1), b0 = Math.min(Math.floor(gy), j1 - 1);
          if (w === 1 || h === 1) return buf[(clamp(Math.round(gy), j0, j1) - j0) * w + (clamp(Math.round(gx), i0, i1) - i0)];
          const fx = gx - a0, fy = gy - b0;
          const k = (b0 - j0) * w + (a0 - i0);
          return (buf[k]*(1-fx) + buf[k+1]*fx)*(1-fy) + (buf[k+w]*(1-fx) + buf[k+w+1]*fx)*fy;
        },
      };
    }
    // snapshot / restore a vertex rect (for undo)
    snapshot(rc) {
      const { nx } = this, w = rc.i1 - rc.i0 + 1, h = rc.j1 - rc.j0 + 1;
      const sdx = new Float32Array(w*h), sdy = new Float32Array(w*h), sm = new Float32Array(w*h);
      for (let j = 0; j < h; j++) {
        const s = (rc.j0 + j)*nx + rc.i0;
        sdx.set(this.dx.subarray(s, s + w), j*w); sdy.set(this.dy.subarray(s, s + w), j*w); sm.set(this.mask.subarray(s, s + w), j*w);
      }
      return { rc: { ...rc }, w, h, dx: sdx, dy: sdy, mask: sm };
    }
    restore(snap) {
      const { nx } = this, { rc, w, h } = snap;
      for (let j = 0; j < h; j++) {
        const s = (rc.j0 + j)*nx + rc.i0;
        this.dx.set(snap.dx.subarray(j*w, j*w + w), s); this.dy.set(snap.dy.subarray(j*w, j*w + w), s); this.mask.set(snap.mask.subarray(j*w, j*w + w), s);
      }
      this.touched = true;
    }
    fullRect() { return { i0: 0, j0: 0, i1: this.gw, j1: this.gh }; }
  }
  const unionRect = (a, b) => !a ? { ...b } : !b ? a : { i0: Math.min(a.i0, b.i0), j0: Math.min(a.j0, b.j0), i1: Math.max(a.i1, b.i1), j1: Math.max(a.j1, b.j1) };

  // ---------------------------------------------------------------- Transform state
  // src = source rect in image px (whole image or a marquee selection). corners = the 4 destination
  // corners (image px) of the unit square (0,0)(1,0)(1,1)(0,1) → homography H. Optional warp = 16
  // Bézier control points (image px, index j*4+i) laid over the quad.
  class TransformState {
    constructor(src) {
      this.src = { ...src };
      this.corners = TransformState.rectCorners(src);
      this.pivot = [0.5, 0.5];
      this.warp = null;
      this.preset = "custom"; this.bend = 50;
    }
    static rectCorners(r) { return [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]]; }
    clone() {
      const t = new TransformState(this.src);
      t.corners = this.corners.map(c => [c[0], c[1]]);
      t.pivot = [...this.pivot];
      t.warp = this.warp ? Float64Array.from(this.warp) : null;
      t.preset = this.preset; t.bend = this.bend;
      return t;
    }
    assign(o) { this.src = { ...o.src }; this.corners = o.corners.map(c => [c[0], c[1]]); this.pivot = [...o.pivot]; this.warp = o.warp ? Float64Array.from(o.warp) : null; this.preset = o.preset; this.bend = o.bend; }
    H() { return squareToQuad(this.corners); }
    Hinv() { return m3Inv(this.H()) || [1, 0, 0, 0, 1, 0, 0, 0, 1]; }
    isIdentity() {
      const rc = TransformState.rectCorners(this.src);
      for (let i = 0; i < 4; i++) if (Math.abs(rc[i][0] - this.corners[i][0]) > 1e-4 || Math.abs(rc[i][1] - this.corners[i][1]) > 1e-4) return false;
      if (this.warp) {
        const H = this.H();
        for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
          const p = m3Pt(H, i / 3, j / 3), k = (j*4 + i) * 2;
          if (Math.abs(p[0] - this.warp[k]) > 1e-3 || Math.abs(p[1] - this.warp[k + 1]) > 1e-3) return false;
        }
      }
      return true;
    }
    // replace the corners; the warp control points follow the change of homography
    setCorners(nc) {
      if (this.warp) {
        const M = m3Mul(squareToQuad(nc), this.Hinv());
        for (let k = 0; k < 16; k++) {
          const p = m3Pt(M, this.warp[k*2], this.warp[k*2 + 1]);
          this.warp[k*2] = p[0]; this.warp[k*2 + 1] = p[1];
        }
      }
      this.corners = nc.map(c => [c[0], c[1]]);
    }
    applyDest(M) { this.setCorners(this.corners.map(c => m3Pt(M, c[0], c[1]))); }        // destination-space op
    applySrc(S) {                                                                          // unit-space op (H' = H·S)
      const Hn = m3Mul(this.H(), S);
      this.setCorners([m3Pt(Hn, 0, 0), m3Pt(Hn, 1, 0), m3Pt(Hn, 1, 1), m3Pt(Hn, 0, 1)]);
    }
    pivotDest() { return m3Pt(this.H(), this.pivot[0], this.pivot[1]); }
    bbox() {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      const add = (x, y) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; };
      if (this.warp) for (let k = 0; k < 16; k++) add(this.warp[k*2], this.warp[k*2 + 1]);
      else for (const c of this.corners) add(c[0], c[1]);
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }
    // numeric readout
    readout() {
      const [c0, c1, , c3] = this.corners;
      const w = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]) / this.src.w * 100;
      const h = Math.hypot(c3[0] - c0[0], c3[1] - c0[1]) / this.src.h * 100;
      const angle = Math.atan2(c1[1] - c0[1], c1[0] - c0[0]) * 180 / Math.PI;
      const p = this.pivotDest();
      return { w, h, angle, x: p[0], y: p[1] };
    }
    // ---- warp (bicubic Bézier patch)
    initWarp() {
      const H = this.H(), w = new Float64Array(32);
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
        const p = m3Pt(H, i / 3, j / 3); w[(j*4 + i)*2] = p[0]; w[(j*4 + i)*2 + 1] = p[1];
      }
      this.warp = w; this.preset = "custom";
    }
    // The handle the user sees and grabs sits ON the mesh, at the crossing of the 1/3 lines.
    // (The raw Bezier control points float off the surface, which is what made them drift.)
    warpHandle(k) {
      const i = k % 4, j = (k / 4) | 0;
      if (TransformState.isWarpCorner(k)) return [this.warp[k*2], this.warp[k*2 + 1]];
      return this.warpAt(i / 3, j / 3);
    }
    static isWarpCorner(k) { return k === 0 || k === 3 || k === 12 || k === 15; }
    // How much moving control point k moves its own crossing — used to drag 1:1.
    static warpWeight(k) {
      const i = k % 4, j = (k / 4) | 0;
      return bez(i / 3)[i] * bez(j / 3)[j];
    }
    warpAt(u, v) {
      const bu = bez(u), bv = bez(v), w = this.warp;
      let x = 0, y = 0;
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
        const b = bu[i] * bv[j], k = (j*4 + i) * 2;
        x += w[k] * b; y += w[k + 1] * b;
      }
      return [x, y];
    }
    // regenerate the 16 control points from a preset (unit-space displacement mapped through H)
    applyPreset(name, bend) {
      this.preset = name; this.bend = bend;
      if (name === "custom") { if (!this.warp) this.initWarp(); return; }
      const H = this.H(), k = bend / 100, w = new Float64Array(32);
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
        const [u, v] = WARP_PRESETS[name](i / 3, j / 3, k);
        const p = m3Pt(H, u, v);
        w[(j*4 + i)*2] = p[0]; w[(j*4 + i)*2 + 1] = p[1];
      }
      this.warp = w;
    }
  }
  // unit-space preset shapes: (u, v, k∈[-1,1]) → [u', v']
  const WARP_PRESETS = {
    arc: (u, v, k) => { const s = 2*u - 1; return [u - 0.25*k*s*(0.5 - v)*2, v - 0.5*k*(1 - s*s)]; },
    arcLower: (u, v, k) => { const s = 2*u - 1; return [u, v + 0.5*k*(1 - s*s)*v]; },
    arcUpper: (u, v, k) => { const s = 2*u - 1; return [u, v - 0.5*k*(1 - s*s)*(1 - v)]; },
    arch: (u, v, k) => { const s = 2*u - 1; return [u, v - 0.5*k*(1 - s*s)]; },
    bulge: (u, v, k) => { const s = 2*u - 1; return [u, v + 0.5*k*(1 - s*s)*(v - 0.5)*2]; },
    flag: (u, v, k) => [u, v - 0.35*k*Math.sin(2*Math.PI*u)],
    wave: (u, v, k) => [u, v + 0.35*k*Math.sin(2*Math.PI*u)*(v - 0.5)*2],
    fish: (u, v, k) => [u, v + 0.5*k*4*u*(1 - u)*(0.4 + 0.6*u)*(v - 0.5)*2],
    rise: (u, v, k) => [u, v - 0.25*k*(1 - Math.cos(Math.PI*u))],
    fisheye: (u, v, k) => { const s = 2*u - 1, t = 2*v - 1, r2 = (s*s + t*t)/2; const g = 1 + 0.45*k*(1 - r2); return [0.5 + (u - 0.5)*g, 0.5 + (v - 0.5)*g]; },
    inflate: (u, v, k) => { const s = 2*u - 1, t = 2*v - 1; return [u + 0.25*k*s*(1 - t*t), v + 0.25*k*t*(1 - s*s)]; },
    squeeze: (u, v, k) => { const s = 2*u - 1, t = 2*v - 1; return [u - 0.25*k*s*(1 - t*t), v - 0.25*k*t*(1 - s*s)]; },
    twist: (u, v, k) => {
      const s = u - 0.5, t = v - 0.5, r = Math.hypot(s, t) / 0.7071;
      const a = k * Math.PI / 2 * Math.max(0, 1 - r), c = Math.cos(a), sn = Math.sin(a);
      return [0.5 + s*c - t*sn, 0.5 + s*sn + t*c];
    },
  };
  const PRESET_NAMES = ["custom", "arc", "arcLower", "arcUpper", "arch", "bulge", "flag", "wave", "fish", "rise", "fisheye", "inflate", "squeeze", "twist"];

  // ---------------------------------------------------------------- image loading
  function loadSource(src, crossOrigin) {
    return new Promise((resolve, reject) => {
      if (typeof ImageBitmap !== "undefined" && src instanceof ImageBitmap) return resolve(src);
      if (src instanceof HTMLCanvasElement) return resolve(src);
      if (src instanceof HTMLImageElement) {
        if (src.complete && src.naturalWidth) return resolve(src);
        src.addEventListener("load", () => resolve(src), { once: true });
        src.addEventListener("error", () => reject(new Error("load")), { once: true });
        return;
      }
      if (src instanceof Blob) {
        const url = URL.createObjectURL(src);
        return loadSource(url, null).then(img => { URL.revokeObjectURL(url); resolve(img); }, err => { URL.revokeObjectURL(url); reject(err); });
      }
      if (typeof src !== "string") return reject(new Error("src"));
      const img = new Image();
      const remote = /^https?:\/\//i.test(src) && !src.startsWith(location.origin + "/");
      if (remote && crossOrigin !== false) img.crossOrigin = crossOrigin || "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (!img.crossOrigin) return reject(new Error("load"));
        // retry without CORS so at least we can tell the user what went wrong
        const img2 = new Image();
        img2.onload = () => reject(new Error("cors"));
        img2.onerror = () => reject(new Error("load"));
        img2.src = src;
      };
      img.src = src;
    });
  }
  function guessMime(src) {
    if (typeof src !== "string") return src && src.type && /^image\//.test(src.type) ? src.type : null;
    const m = /^data:(image\/[a-z0-9.+-]+)/i.exec(src);
    if (m) return m[1].toLowerCase();
    const ext = (/\.([a-z0-9]+)(?:[?#]|$)/i.exec(src) || [])[1];
    if (!ext) return null;
    const e = ext.toLowerCase();
    return e === "jpg" || e === "jpeg" ? "image/jpeg" : e === "webp" ? "image/webp" : e === "png" ? "image/png" : null;
  }

  // ---------------------------------------------------------------- Editor
  const MESH_N = { 0: 48, 1: 24, 2: 12 };   // "show mesh" cell counts across the image

  class Editor {
    constructor(opts) {
      this.o = opts;
      const lang = (opts.lang || "en").toLowerCase();       // English unless the host asks for another
      this.t = I18N[lang] || I18N.en;
      this.mode = opts.mode === "transform" ? "transform" : "liquify";
      this.tool = this.mode === "liquify" ? "warp" : "move";
      this.lastTool = { liquify: "warp", transform: "move" };
      this.brush = { size: 150, pressure: 50, rate: 60, density: 50, pen: true };
      this.vo = { showMesh: false, meshSize: 1, showMask: true, original: false };
      this.xfMode = "free"; this.hole = "transparent"; this.proportional = true;
      this.exp = { format: opts.format || "auto", quality: opts.quality != null ? opts.quality : 0.92, bg: opts.background || "#ffffff" };
      this.view = { ox: 0, oy: 0, zoom: 1 };
      this.ops = []; this.undoStack = []; this.redoStack = [];
      this.sel = null;                   // marquee selection rect (image px) or null
      this.pointer = null;               // last pointer position in stage px
      this.drag = null;                  // current interaction
      this.touches = new Map();          // live touch points (stage px), for pinch zoom / 2-finger pan
      this.pinch = null;
      this.mq = window.matchMedia("(max-width: 760px), (max-height: 460px)");
      this.mobile = false;
      this.touchUI = this.mq.matches || window.matchMedia("(pointer: coarse)").matches;
      this.space = false; this.alt = false;
      this.ready = false; this.closed = false;
      this._raf = 0;
      this.build();
    }

    // ---------- DOM
    build() {
      const t = this.t, o = this.o;
      if (!document.getElementById("rt-style")) {
        const st = el("style"); st.id = "rt-style"; st.textContent = CSS; document.head.appendChild(st);
      }
      const root = this.root = el("div", "rt-root");
      root.tabIndex = -1;
      root.style.zIndex = o.zIndex || 100000;
      if (o.theme) for (const k in o.theme) root.style.setProperty("--rt-" + k, o.theme[k]);

      // top bar
      const top = this.top = el("div", "rt-top");
      // Everything but the pinned actions lives in a group that can scroll sideways on a phone.
      top.appendChild(el("div", "rt-title", escapeHtml(o.title || t.title)));
      const bar = this.topScroll = el("div", "rt-topscroll");
      const tabs = el("div", "rt-tabs");
      this.tabEls = {};
      for (const m of ["liquify", "transform"]) {
        const tab = el("div", "rt-tab" + (this.mode === m ? " active" : ""), t[m]);
        tab.dataset.short = t[m + "Short"] || t[m];
        tab.addEventListener("click", () => this.setMode(m));
        tabs.appendChild(tab); this.tabEls[m] = tab;
      }
      top.appendChild(tabs);
      top.appendChild(el("div", "rt-spacer rt-no-mobile"));   // desktop: pushes the controls right
      this.btnUndo = this.button(bar, "↶", t.undo + " (Ctrl+Z)", () => this.undo(), "icon");
      this.btnRedo = this.button(bar, "↷", t.redo + " (Ctrl+Y)", () => this.redo(), "icon");
      const zoom = el("div", "rt-zoom");
      this.button(zoom, "−", "Zoom −", () => this.zoomBy(1 / 1.25), "icon rt-no-mobile");
      this.zoomVal = el("span", "rt-zoomval", "100%"); zoom.appendChild(this.zoomVal);
      this.button(zoom, "+", "Zoom +", () => this.zoomBy(1.25), "icon rt-no-mobile");
      this.button(zoom, t.fit, "Ctrl+0", () => this.fit(), "small");
      this.button(zoom, t.zoom100, "Ctrl+1", () => this.zoomTo(1), "small rt-no-mobile");
      bar.appendChild(zoom);
      // Original / Reset: inline in the bar on desktop, moved into the sheet on a phone
      const more = this.more = el("div", "rt-more");
      this.btnOriginal = this.button(more, t.original, "\\", () => this.toggleOriginal(), "small toggle");
      this.button(more, t.reset, "", () => this.resetAll(), "small danger");
      bar.appendChild(more);
      top.appendChild(bar);
      top.appendChild(el("div", "rt-spacer rt-only-mobile"));  // phone: pushes the pinned actions right
      // pinned (never scroll away)
      this.btnApplyTop = this.button(top, "✓", t.apply, () => this.commitLive(), "icon primary rt-only-mobile rt-hidden");
      this.btnSheet = this.button(top, "⚙", t.options, () => this.toggleSheet(), "icon rt-only-mobile");
      this.button(top, t.cancel, "Esc", () => this.cancel(), "small rt-cancel");
      this.btnSave = this.button(top, t.save, "Ctrl+Enter", () => this.save(), "primary");
      root.appendChild(top);

      // left tools
      this.left = el("div", "rt-left");
      root.appendChild(this.left);

      // stage
      const stage = this.stage = el("div", "rt-stage");
      this.gl = el("canvas"); this.ov = el("canvas");
      stage.appendChild(this.gl); stage.appendChild(this.ov);
      this.msg = el("div", "rt-msg rt-hidden"); stage.appendChild(this.msg);
      this.toastEl = el("div", "rt-toast"); stage.appendChild(this.toastEl);
      root.appendChild(stage);

      // right panel
      this.right = el("div", "rt-right");
      this.grip = el("div", "rt-grip");
      this.grip.addEventListener("click", () => this.toggleSheet());
      this.right.appendChild(this.grip);
      root.appendChild(this.right);
      this.buildLiquifyPanel();
      this.buildTransformPanel();
      this.buildExportPanel();
      this.buildBrushPopup();

      // status bar
      const status = el("div", "rt-status");
      this.stImg = el("span"); this.stZoom = el("span"); this.stHint = el("span", "rt-hint");
      status.appendChild(this.stImg); status.appendChild(this.stZoom); status.appendChild(this.stHint);
      root.appendChild(status);

      document.body.appendChild(root);
      // Keep the host page from scrolling / rubber-banding behind the editor, and make sure a phone
      // reports its real width (pages with no viewport meta would otherwise lay out at ~980px).
      this._prevOverflow = document.body.style.overflow;
      this._prevOverscroll = document.documentElement.style.overscrollBehavior;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overscrollBehavior = "none";
      if (!document.querySelector('meta[name="viewport"]')) {
        this.meta = el("meta");
        this.meta.name = "viewport";
        this.meta.content = "width=device-width, initial-scale=1, viewport-fit=cover";
        document.head.appendChild(this.meta);
      }
      this._onMQ = () => this.applyLayout();
      this.mq.addEventListener ? this.mq.addEventListener("change", this._onMQ) : this.mq.addListener(this._onMQ);
      this.applyLayout();
      this.buildTools();
      this.syncPanels();
    }
    // phone layout: tools become a bottom strip, the right panel a bottom sheet
    applyLayout() {
      const m = this.mq.matches;
      this.mobile = m;
      this.touchUI = m || window.matchMedia("(pointer: coarse)").matches;
      this.root.classList.toggle("rt-mobile", m);
      if (!m) this.closeSheet();
      if (this.ready) { this.resize(); this.syncPanels(); }
    }
    toggleSheet() {
      const open = !this.right.classList.contains("open");
      this.right.classList.toggle("open", open);
      this.btnSheet.classList.toggle("on", open);
    }
    closeSheet() {
      if (!this.right.classList.contains("open")) return false;
      this.right.classList.remove("open");
      this.btnSheet.classList.remove("on");
      return true;
    }
    toast(text) {
      if (!text) return;
      this.toastEl.textContent = text;
      this.toastEl.classList.add("show");
      clearTimeout(this._toastT);
      this._toastT = setTimeout(() => this.toastEl.classList.remove("show"), 2800);
    }
    button(parent, label, title, onClick, cls = "") {
      const b = el("button", "rt-btn " + cls, label);
      if (title) b.title = title;
      b.addEventListener("click", (e) => { e.preventDefault(); onClick(e); this.root.focus(); });
      parent.appendChild(b);
      return b;
    }
    section(parent, title) {
      const s = el("div", "rt-sec");
      if (title) s.appendChild(el("h4", null, title));
      parent.appendChild(s);
      return s;
    }
    slider(parent, label, obj, key, min, max, step, fmt, onChange) {
      const row = el("div", "rt-row");
      row.appendChild(el("label", null, label));
      const inp = el("input"); inp.type = "range"; inp.min = min; inp.max = max; inp.step = step; inp.value = obj[key];
      const val = el("span", "rt-val", fmt ? fmt(obj[key]) : obj[key]);
      inp.addEventListener("input", () => { obj[key] = +inp.value; val.textContent = fmt ? fmt(obj[key]) : obj[key]; if (onChange) onChange(obj[key]); });
      row.appendChild(inp); row.appendChild(val);
      parent.appendChild(row);
      return { row, inp, val, set(v) { obj[key] = v; inp.value = v; val.textContent = fmt ? fmt(v) : v; } };
    }
    check(parent, label, obj, key, onChange) {
      const lab = el("label", "rt-check");
      const inp = el("input"); inp.type = "checkbox"; inp.checked = !!obj[key];
      inp.addEventListener("change", () => { obj[key] = inp.checked; if (onChange) onChange(inp.checked); this.root.focus(); });
      lab.appendChild(inp); lab.appendChild(document.createTextNode(label));
      parent.appendChild(lab);
      return inp;
    }
    select(parent, label, options, value, onChange) {
      const row = el("div", "rt-row");
      row.appendChild(el("label", null, label));
      const sel = el("select");
      for (const [v, l] of options) { const op = el("option", null, l); op.value = v; sel.appendChild(op); }
      sel.value = value;
      sel.addEventListener("change", () => { onChange(sel.value); this.root.focus(); });
      row.appendChild(sel); parent.appendChild(row);
      return sel;
    }
    number(parent, label, unit, onCommit) {
      const row = el("div", "rt-row");
      row.appendChild(el("label", null, label));
      const inp = el("input"); inp.type = "number"; inp.step = "any";
      inp.addEventListener("change", () => { const v = parseFloat(inp.value); if (!isNaN(v)) onCommit(v); this.syncTransformReadout(); });
      row.appendChild(inp);
      if (unit) row.appendChild(el("span", "rt-unit", unit));
      parent.appendChild(row);
      return inp;
    }

    buildTools() {
      const t = this.t;
      this.left.innerHTML = "";
      this.toolEls = {};
      const list = this.mode === "liquify" ? LIQUIFY_TOOLS : TRANSFORM_TOOLS;
      const add = (name) => {
        const b = el("div", "rt-tool" + (this.tool === name ? " active" : ""));
        b.innerHTML = svgIcon(name) + `<span>${t.tools[name]}</span><i>${KEYS[name]}</i>`;
        b.title = `${t.tools[name]} (${KEYS[name]})`;
        b.addEventListener("click", () => this.setTool(name));
        this.left.appendChild(b); this.toolEls[name] = b;
      };
      for (const n of list) add(n);
      this.left.appendChild(el("div", "rt-tool-sep"));
      add("hand");
    }

    buildLiquifyPanel() {
      const t = this.t, p = this.pLiq = el("div", "rt-sec-group");
      const b = this.section(p, t.brush);
      const sync = () => { this.syncBrushControls(); this.requestRender(); };
      this.sSize = this.slider(b, t.size, this.brush, "size", 5, 1000, 1, v => v + "px", sync);
      this.sPressure = this.slider(b, t.pressure, this.brush, "pressure", 1, 100, 1, null, sync);
      this.sRate = this.slider(b, t.rate, this.brush, "rate", 0, 100, 1, null, sync);
      this.sDensity = this.slider(b, t.density, this.brush, "density", 0, 100, 1, null, sync);
      this.check(b, t.pen, this.brush, "pen");
      const v = this.section(p, t.view);
      this.check(v, t.showMesh, this.vo, "showMesh", () => this.requestRender());
      this.select(v, t.meshSize, [[0, t.meshSizes[0]], [1, t.meshSizes[1]], [2, t.meshSizes[2]]], String(this.vo.meshSize), (val) => { this.vo.meshSize = +val; this.requestRender(); });
      this.check(v, t.showMask, this.vo, "showMask", () => this.requestRender());
      const r = el("div", "rt-grid2");
      this.button(r, t.restoreAll, "", () => this.restoreAll(), "small");
      this.button(r, t.thawAll, "", () => this.thawAll(), "small");
      v.appendChild(r);
      this.right.appendChild(p);
    }

    // Right-click on the canvas: the brush settings, at the cursor (Photoshop-style)
    buildBrushPopup() {
      const t = this.t, pop = this.brushPop = el("div", "rt-pop");
      pop.appendChild(el("h4", null, t.brush));
      const mk = (label, key, min, max, step, fmt) =>
        this.slider(pop, label, this.brush, key, min, max, step, fmt, () => { this.syncBrushControls(); this.requestRender(); });
      this.pSize     = mk(t.size, "size", 5, 1000, 1, v => v + "px");
      this.pPressure = mk(t.pressure, "pressure", 1, 100, 1);
      this.pRate     = mk(t.rate, "rate", 0, 100, 1);
      this.pDensity  = mk(t.density, "density", 0, 100, 1);
      pop.addEventListener("contextmenu", e => { e.preventDefault(); e.stopPropagation(); });
      this.root.appendChild(pop);
    }
    // keep the panel sliders and the popup sliders showing the same numbers
    syncBrushControls() {
      const pairs = [["size", this.sSize, this.pSize], ["pressure", this.sPressure, this.pPressure],
                     ["rate", this.sRate, this.pRate], ["density", this.sDensity, this.pDensity]];
      for (const [key, a, b] of pairs) {
        const v = this.brush[key];
        if (a) a.set(v);
        if (b) b.set(v);
      }
    }
    openBrushPop(x, y) {
      if (this.mobile || this.mode !== "liquify" || this.tool === "hand" || !this.ready) return;
      const p = this.brushPop;
      this.syncBrushControls();
      p.classList.add("open");
      p.style.left = clamp(x + 2, 8, window.innerWidth - p.offsetWidth - 8) + "px";
      p.style.top  = clamp(y + 2, 8, window.innerHeight - p.offsetHeight - 8) + "px";
    }
    closeBrushPop() {
      if (!this.brushPop || !this.brushPop.classList.contains("open")) return false;
      this.brushPop.classList.remove("open");
      return true;
    }
    buildTransformPanel() {
      const t = this.t, p = this.pXf = el("div", "rt-sec-group");
      const m = this.section(p, t.transform);
      this.selMode = this.select(m, t.mode, Object.keys(t.modes).map(k => [k, t.modes[k]]), this.xfMode, (v) => this.setXfMode(v));
      const g = el("div", "rt-grid3");
      this.button(g, t.flipH, "", () => this.xfOp("flipH"), "small");
      this.button(g, t.flipV, "", () => this.xfOp("flipV"), "small");
      this.button(g, t.rot180, "", () => this.xfOp("rot180"), "small");
      this.button(g, t.rot90cw, "", () => this.xfOp("rot90cw"), "small");
      this.button(g, t.rot90ccw, "", () => this.xfOp("rot90ccw"), "small");
      this.button(g, t.resetTransform, "", () => this.xfOp("reset"), "small");
      m.appendChild(g);
      const n = this.section(p, null);
      this.nX = this.number(n, t.x, "px", v => this.xfSet("x", v));
      this.nY = this.number(n, t.y, "px", v => this.xfSet("y", v));
      this.nW = this.number(n, t.w, "%", v => this.xfSet("w", v));
      this.nH = this.number(n, t.h, "%", v => this.xfSet("h", v));
      this.nA = this.number(n, t.angle, "°", v => this.xfSet("angle", v));
      this.check(n, t.proportional, this, "proportional");
      const ab = el("div", "rt-grid2");
      this.btnApply = this.button(ab, t.apply + " ⏎", "Enter", () => this.commitLive(true), "small primary");
      n.appendChild(ab);
      const w = this.section(p, t.modes.warp);
      this.selPreset = this.select(w, t.warpPreset, PRESET_NAMES.map(k => [k, t.presets[k]]), "custom", (v) => this.setWarpPreset(v));
      this.sBend = this.slider(w, t.bend, { bend: 50 }, "bend", -100, 100, 1, v => v + "%", (v) => this.setWarpBend(v));
      const s = this.section(p, t.selection);
      this.selInfo = el("div", null, t.selectAll); this.selInfo.style.cssText = "font-size:12px;color:var(--rt-muted)";
      s.appendChild(this.selInfo);
      this.button(s, t.selectAll, "Ctrl+D", () => this.setSelection(null), "small");
      this.select(s, t.hole, [["transparent", t.holeTransparent], ["keep", t.holeKeep]], this.hole, (v) => { this.hole = v; this.requestRender(); });
      this.right.appendChild(p);
    }

    buildExportPanel() {
      const t = this.t, p = this.section(this.right, t.exportT);
      const fmts = [["auto", t.auto], ["image/png", "PNG"], ["image/jpeg", "JPEG"], ["image/webp", "WebP"]];
      this.select(p, t.format, fmts, this.exp.format, (v) => { this.exp.format = v; this.syncExport(); });
      this.sQuality = this.slider(p, t.quality, this.exp, "quality", 0.3, 1, 0.01, v => Math.round(v * 100) + "%");
      const row = el("div", "rt-row"); row.appendChild(el("label", null, t.background));
      const col = el("input"); col.type = "color"; col.value = this.exp.bg;
      col.addEventListener("input", () => { this.exp.bg = col.value; });
      row.appendChild(col); this.bgRow = row; p.appendChild(row);
    }

    syncPanels() {
      const liq = this.mode === "liquify";
      this.pLiq.classList.toggle("rt-hidden", !liq);
      this.pXf.classList.toggle("rt-hidden", liq);
      for (const m in this.tabEls) this.tabEls[m].classList.toggle("active", m === this.mode);
      this.syncExport();
      this.syncHistoryButtons();
      this.btnApplyTop.classList.toggle("rt-hidden", liq);
      if (!liq) this.syncTransformReadout();
      this.setHint();
      this.stage.classList.toggle("brush", liq && this.tool !== "hand");
      this.stage.classList.toggle("marquee", !liq && this.tool === "marquee");
      this.stage.classList.toggle("pan", this.tool === "hand" || this.space);
    }
    syncExport() {
      const mime = this.exportMime();
      const lossy = mime !== "image/png";
      this.sQuality.row.style.display = lossy ? "" : "none";
      this.bgRow.style.display = mime === "image/jpeg" ? "" : "none";
    }
    exportMime() {
      if (this.exp.format !== "auto") return this.exp.format;
      const g = this.srcMime;
      return g === "image/jpeg" || g === "image/webp" ? g : "image/png";
    }
    syncHistoryButtons() {
      this.btnUndo.disabled = this.undoStack.length === 0;
      this.btnRedo.disabled = this.redoStack.length === 0;
    }
    syncTransformReadout() {
      if (!this.xf) return;
      const r = this.xf.readout();
      const set = (inp, v) => { if (document.activeElement !== inp) inp.value = Math.round(v * 100) / 100; };
      set(this.nX, r.x); set(this.nY, r.y); set(this.nW, r.w); set(this.nH, r.h); set(this.nA, r.angle);
      this.selInfo.textContent = this.sel ? `${Math.round(this.sel.w)} × ${Math.round(this.sel.h)} px @ ${Math.round(this.sel.x)}, ${Math.round(this.sel.y)}` : this.t.selectAll;
      this.btnApply.disabled = this.xf.isIdentity();
      this.btnApplyTop.classList.toggle("rt-hidden", this.mode !== "transform" || this.xf.isIdentity());
      if (this.selPreset.value !== this.xf.preset) this.selPreset.value = this.xf.preset;
    }
    setHint(text) {
      let h = text != null ? text : (this.t.hints[this.tool] || "");
      if (text == null && this.mode === "liquify" && this.tool !== "hand") h += " · " + this.t.brushMenu;
      this.stHint.textContent = h;
    }
    setStatus() {
      const t = this.t;
      this.stImg.innerHTML = `${t.imageSize}: <b>${this.W} × ${this.H}</b>` + (this.ops.length ? ` · ${this.ops.length} ${t.applied}` : "");
      const z = Math.round(this.view.zoom * 100) + "%";
      this.stZoom.innerHTML = `${t.zoomL}: <b>${z}</b>`;
      this.zoomVal.textContent = z;
    }
    showMsg(text, err) {
      this.msg.textContent = text; this.msg.classList.toggle("err", !!err); this.msg.classList.remove("rt-hidden");
    }
    hideMsg() { this.msg.classList.add("rt-hidden"); }
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  // ---------------------------------------------------------------- Editor: init, view, liquify strokes
  const TIME_TOOLS = new Set(["bloat", "pucker", "twirl", "reconstruct", "smooth", "freeze", "thaw"]);
  const RATE_PER_SEC = { bloat: 1.4, pucker: 1.4, twirl: 2.2, reconstruct: 3, smooth: 3, freeze: 4, thaw: 4 };
  const MOVE_AMOUNT = { bloat: 0.04, pucker: 0.04, twirl: 0.06, reconstruct: 0.25, smooth: 0.25, freeze: 0.5, thaw: 0.5 };
  const ROTATE_CURSOR = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.6-5.9" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/><path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>')}") 11 11, auto`;

  Object.assign(Editor.prototype, {
    async init() {
      const o = this.o, t = this.t;
      this.showMsg("…");
      let img;
      try { img = await loadSource(o.src, o.crossOrigin); }
      catch (e) { this.showMsg(t.loadError, true); return; }
      if (this.closed) return;
      try { this.r = new Renderer(this.gl); }
      catch (e) { this.showMsg(t.webgl, true); return; }
      const r = this.r, gl = r.gl;
      let W = img.naturalWidth || img.width, H = img.naturalHeight || img.height;
      const maxT = Math.min(r.maxTex, o.maxSize || 8192);
      let source = img, reduced = false;
      if (W > maxT || H > maxT) {
        const s = Math.min(maxT / W, maxT / H);
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.floor(W * s)); c.height = Math.max(1, Math.floor(H * s));
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        source = c; W = c.width; H = c.height; reduced = true;
      }
      this.W = W; this.H = H;
      this.srcMime = guessMime(o.src);
      try { this.origTex = r.texFromImage(source); }
      catch (e) { this.showMsg(t.loadError, true); return; }
      this.base = r.target(W, H); this.tmp = r.target(W, H);
      r.setQuad(W, H);
      r.begin(this.base); r.draw(r.quad, this.origTex, r.viewFBO(W, H));
      // liquify mesh
      this.field = new LiquifyField(W, H);
      this.lmesh = new Mesh(gl, this.field.n, gridIndices(this.field.nx, this.field.ny));
      this.field.fillPositions(this.lmesh); this.lmesh.upload("pos");
      this.field.fillMesh(this.lmesh); this.lmesh.upload("uv"); this.lmesh.upload("mask");
      this.dirtyRows = null;
      // transform mesh (tessellated quad)
      this.XN = 33;
      this.xmesh = new Mesh(gl, this.XN * this.XN, gridIndices(this.XN, this.XN));
      this.xf = new TransformState({ x: 0, y: 0, w: W, h: H });
      this.brush.size = Math.round(clamp(Math.max(W, H) / 8, 20, 400));
      this.sSize.set(this.brush.size);
      this.ready = true;
      this.hideMsg();
      if (reduced) { this.showMsg(`${t.tooBig} (${W}×${H})`); setTimeout(() => this.hideMsg(), 3000); }
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.stage);
      this.resize(); this.fit(); this.setStatus(); this.syncPanels();
      this.bindEvents();
      this.root.focus();
    },

    resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = this.stage.clientWidth, h = this.stage.clientHeight;
      if (!w || !h) return;
      this.sw = w; this.sh = h; this.dpr = dpr;
      for (const c of [this.gl, this.ov]) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      this.requestRender();
    },

    // ---------- modes & tools
    setMode(m) {
      if (m === this.mode || !this.ready) return;
      this.endDrag();
      this.closeBrushPop();
      this.commitLive();                // applying the current mode's edit is undoable
      this.lastTool[this.mode] = this.tool;
      this.mode = m;
      this.tool = this.lastTool[m] || (m === "liquify" ? "warp" : "move");
      this.buildTools(); this.syncPanels(); this.requestRender();
      if (this.mobile) this.toast(this.t.hints[this.tool]);
    },
    setTool(name) {
      if (name !== "hand" && !(this.mode === "liquify" ? LIQUIFY_TOOLS : TRANSFORM_TOOLS).includes(name)) return;
      this.endDrag();
      if (name === "marquee" && this.xf && !this.xf.isIdentity()) this.commitLive();
      this.tool = name;
      this.closeBrushPop();
      for (const k in this.toolEls) this.toolEls[k].classList.toggle("active", k === name);
      this.syncPanels(); this.requestRender();
      if (this.mobile) this.toast(this.t.hints[name]);
    },
    setXfMode(m) {
      this.xfMode = m;
      if (m === "warp") { if (!this.xf.warp) { const before = this.xf.clone(); this.xf.initWarp(); this.pushXfHistory(before); } }
      this.selMode.value = m;
      this.syncTransformReadout(); this.requestRender();
    },
    toggleOriginal() {
      this.vo.original = !this.vo.original;
      this.btnOriginal.classList.toggle("on", this.vo.original);
      this.requestRender();
    },

    // ---------- view
    toImage(x, y) { return [(x - this.view.ox) / this.view.zoom, (y - this.view.oy) / this.view.zoom]; },
    toScreen(x, y) { return [this.view.ox + x * this.view.zoom, this.view.oy + y * this.view.zoom]; },
    fit() {
      if (!this.ready) return;
      const pad = this.mobile ? 16 : 48;
      const z = Math.min((this.sw - pad) / this.W, (this.sh - pad) / this.H, 4);
      this.view.zoom = z;
      this.view.ox = (this.sw - this.W * z) / 2; this.view.oy = (this.sh - this.H * z) / 2;
      this.setStatus(); this.requestRender();
    },
    zoomTo(z) { this.zoomAt(this.sw / 2, this.sh / 2, z / this.view.zoom); },
    zoomBy(f) { this.zoomAt(this.pointer ? this.pointer[0] : this.sw / 2, this.pointer ? this.pointer[1] : this.sh / 2, f); },
    zoomAt(x, y, f) {
      const v = this.view, nz = clamp(v.zoom * f, 0.02, 64);
      f = nz / v.zoom;
      v.ox = x - (x - v.ox) * f; v.oy = y - (y - v.oy) * f; v.zoom = nz;
      this.setStatus(); this.requestRender();
    },

    // ---------- events
    bindEvents() {
      const st = this.stage;
      st.addEventListener("pointerdown", e => this.onPointerDown(e));
      st.addEventListener("pointermove", e => this.onPointerMove(e));
      st.addEventListener("pointerup", e => this.onPointerUp(e));
      st.addEventListener("pointercancel", e => this.onPointerUp(e));
      st.addEventListener("pointerleave", () => { if (!this.drag) { this.pointer = null; this.requestRender(); } });
      this._blockers = [];
      const block = (type, fn, opts) => { window.addEventListener(type, fn, opts); this._blockers.push([type, fn, opts]); };
      const inside = e => e.target instanceof Node && this.root.contains(e.target);
      for (const type of ["mousedown", "mouseup", "mousemove", "dblclick"]) block(type, e => { if (inside(e)) e.stopPropagation(); }, true);
      block("contextmenu", e => {
        if (!inside(e)) return;
        e.preventDefault(); e.stopPropagation();
        // a long press on a touch screen also fires this — never while something is being drawn
        if (this.stage.contains(e.target) && !this.drag && !this.touches.size) this.openBrushPop(e.clientX, e.clientY);
      }, true);
      block("pointerdown", e => {
        if (!this.brushPop.classList.contains("open")) return;
        if (!(e.target instanceof Node) || this.brushPop.contains(e.target) || this.stage.contains(e.target)) return;
        this.closeBrushPop();
      }, true);
      block("wheel", e => this.onWheel(e), { capture: true, passive: false });
      block("keydown", e => this.onKeyDown(e), true);
      block("keyup", e => this.onKeyUp(e), true);
      block("keypress", e => e.stopPropagation(), true);
      for (const type of ["dragenter", "dragover", "dragleave", "drop"]) block(type, e => { e.preventDefault(); e.stopPropagation(); }, true);
      block("paste", e => e.stopPropagation(), true);
      block("copy", e => e.stopPropagation(), true);
      block("cut", e => e.stopPropagation(), true);
      block("blur", () => { this.space = this.alt = false; this.touches.clear(); this.pinch = null; this.endDrag(); this.syncPanels(); });
      block("resize", () => this.applyLayout());
      block("orientationchange", () => setTimeout(() => this.applyLayout(), 250));
      this.sBend.inp.addEventListener("change", () => { const b = this._bendBefore; this._bendBefore = null; if (b) this.pushXfHistory(b); });
    },
    unbindEvents() {
      for (const [type, fn, opts] of this._blockers || []) window.removeEventListener(type, fn, opts);
      this._blockers = [];
    },
    stagePos(e) {
      const r = this.stage.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    },
    onWheel(e) {
      if (!(e.target instanceof Node) || !this.root.contains(e.target)) return;
      e.stopPropagation();
      if (!this.stage.contains(e.target)) return;      // let panels scroll
      e.preventDefault();
      if (!this.ready) return;
      this.closeBrushPop();
      const p = this.stagePos(e);
      const f = Math.exp(-clamp(e.deltaY, -120, 120) * 0.0022);
      this.zoomAt(p[0], p[1], f);
    },
    startPinch() {
      const pts = [...this.touches.values()];
      this.pinch = {
        d0: Math.max(1, Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1])),
        mid0: [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2],
        view0: { ...this.view },
      };
    },
    updatePinch() {
      const pts = [...this.touches.values()];
      if (pts.length < 2) return;
      const p = this.pinch;
      const d = Math.max(1, Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]));
      const mid = [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
      const nz = clamp(p.view0.zoom * (d / p.d0), 0.02, 64), k = nz / p.view0.zoom;
      this.view.zoom = nz;
      this.view.ox = mid[0] - (p.mid0[0] - p.view0.ox) * k;
      this.view.oy = mid[1] - (p.mid0[1] - p.view0.oy) * k;
      this.setStatus();
    },
    onPointerDown(e) {
      if (!this.ready) return;
      this.root.focus();
      const p = this.stagePos(e), ip = this.toImage(p[0], p[1]);
      this.pointer = p;
      if (this.closeBrushPop()) { this.pointer = null; return; }               // first click dismisses the brush popup
      if (this.mobile && this.closeSheet()) { this.pointer = null; return; }   // first tap dismisses the sheet
      if (e.pointerType === "touch") {
        this.touches.set(e.pointerId, p);
        if (this.touches.size >= 2) {           // second finger = pinch/pan, drop whatever was in progress
          this.cancelDrag();
          this.startPinch();
          if (this.mobile) this.toast(this.t.pinch);
          this.requestRender();
          return;
        }
      }
      if (this.pinch) return;
      if (this.drag) return;
      if (e.button === 1 || this.space || this.tool === "hand" || (e.button === 0 && this.tool !== "marquee" && this.mode === "transform" && this.hitTransform(p) == null && !this.pointInQuad(ip))) {
        if (e.button === 2) return;
        this.drag = { type: "pan", id: e.pointerId, start: p, ox: this.view.ox, oy: this.view.oy };
        this.stage.classList.add("panning");
      } else if (e.button !== 0) {
        return;
      } else if (this.mode === "liquify") {
        this.drag = { type: "stroke", id: e.pointerId };
        this.startStroke(e, ip);
      } else if (this.tool === "marquee") {
        if (!this.xf.isIdentity()) this.commitLive();
        this.drag = { type: "marquee", id: e.pointerId, start: ip, before: this.sel ? { ...this.sel } : null };
      } else {
        this.startTransformDrag(e, p, ip);
      }
      if (this.drag) { try { this.stage.setPointerCapture(e.pointerId); } catch (_) {} }
      this.requestRender();
    },
    onPointerMove(e) {
      if (!this.ready) return;
      const p = this.stagePos(e), ip = this.toImage(p[0], p[1]);
      this.pointer = p;
      if (e.pointerType === "touch" && this.touches.has(e.pointerId)) this.touches.set(e.pointerId, p);
      if (this.pinch) { this.updatePinch(); this.requestRender(); return; }
      const d = this.drag;
      if (!d) { this.updateCursor(p, ip); this.requestRender(); return; }
      if (d.id !== e.pointerId) return;
      if (d.type === "pan") {
        this.view.ox = d.ox + p[0] - d.start[0]; this.view.oy = d.oy + p[1] - d.start[1];
      } else if (d.type === "stroke") {
        // use coalesced events for smoother strokes when available
        const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        for (const ev of (evs.length ? evs : [e])) {
          const pp = this.stagePos(ev), iq = this.toImage(pp[0], pp[1]);
          this.moveStroke(ev, iq);
        }
      } else if (d.type === "marquee") {
        this.sel = this.normRect(d.start, ip, true);
        this.syncTransformReadout();
      } else if (d.type === "xf") {
        this.moveTransformDrag(e, p, ip);
      }
      this.requestRender();
    },
    onPointerUp(e) {
      if (e.pointerType === "touch") {
        this.touches.delete(e.pointerId);
        if (this.pinch && this.touches.size < 2) { this.pinch = null; this.setStatus(); }
        if (this.touches.size === 0) this.pointer = null;     // no hover on touch: drop the brush ring
      }
      const d = this.drag;
      if (!d || d.id !== e.pointerId) { this.requestRender(); return; }
      try { this.stage.releasePointerCapture(e.pointerId); } catch (_) {}
      this.endDrag();
      this.requestRender();
    },
    endDrag() {
      const d = this.drag;
      if (!d) return;
      this.drag = null;
      this.stage.classList.remove("panning");
      if (d.type === "stroke") this.endStroke();
      else if (d.type === "marquee") this.endMarquee(d);
      else if (d.type === "xf") this.endTransformDrag(d);
    },
    normRect(a, b, clampToImage) {
      let x0 = Math.min(a[0], b[0]), y0 = Math.min(a[1], b[1]), x1 = Math.max(a[0], b[0]), y1 = Math.max(a[1], b[1]);
      if (clampToImage) { x0 = clamp(x0, 0, this.W); x1 = clamp(x1, 0, this.W); y0 = clamp(y0, 0, this.H); y1 = clamp(y1, 0, this.H); }
      return { x: Math.round(x0), y: Math.round(y0), w: Math.round(x1) - Math.round(x0), h: Math.round(y1) - Math.round(y0) };
    },

    // ---------- liquify strokes
    effectiveTool() {
      const t = this.tool;
      if (!this.alt) return t;
      return t === "bloat" ? "pucker" : t === "pucker" ? "bloat" : t;
    },
    brushK(e) {
      let k = this.brush.pressure / 100;
      if (this.brush.pen && e && e.pointerType === "pen" && e.pressure > 0) k *= e.pressure;
      return k;
    },
    startStroke(e, ip) {
      const f = this.field;
      this.strokeSnap = f.snapshot(f.fullRect());
      this.stroke = { last: ip, rect: null, t: performance.now(), k: this.brushK(e), e };
      const tool = this.effectiveTool();
      if (TIME_TOOLS.has(tool)) this.applyDab(tool, ip, [0, 0], MOVE_AMOUNT[tool] * 0.5);
      this._loop = () => {
        if (!this.stroke) return;
        const now = performance.now(), dt = Math.min(0.1, (now - this.stroke.t) / 1000);
        this.stroke.t = now;
        const tl = this.effectiveTool();
        if (TIME_TOOLS.has(tl) && this.brush.rate > 0) {
          const amount = Math.min(0.25, RATE_PER_SEC[tl] * (this.brush.rate / 100) * dt);
          this.applyDab(tl, this.stroke.last, [0, 0], amount);
          this.requestRender();
        }
        this._raf2 = requestAnimationFrame(this._loop);
      };
      this._raf2 = requestAnimationFrame(this._loop);
    },
    moveStroke(e, ip) {
      const s = this.stroke;
      if (!s) return;
      s.k = this.brushK(e);
      const tool = this.effectiveTool();
      const dx = ip[0] - s.last[0], dy = ip[1] - s.last[1], len = Math.hypot(dx, dy);
      if (len < 0.01) return;
      const r = this.brush.size / 2;
      const step = Math.max(1.5, r / 4), n = Math.max(1, Math.ceil(len / step));
      for (let i = 1; i <= n; i++) {
        const c = [s.last[0] + dx * i / n, s.last[1] + dy * i / n];
        if (tool === "warp" || tool === "pushLeft") this.applyDab(tool, c, [dx / n, dy / n], 0);
        else this.applyDab(tool, c, [0, 0], MOVE_AMOUNT[tool] * Math.min(1, (len / n) / step));
      }
      s.last = ip;
    },
    applyDab(tool, c, v, amount) {
      const s = this.stroke; if (!s) return;
      const r = this.brush.size / 2;
      let vv = v, am = amount;
      if (this.alt && tool === "pushLeft") vv = [-v[0], -v[1]];
      if (this.alt && tool === "twirl") am = -amount;
      const rc = this.field.dab(tool, c, r, s.k, this.brush.density, vv, am);
      if (!rc) return;
      s.rect = unionRect(s.rect, rc);
      this.dirtyRows = !this.dirtyRows ? [rc.j0, rc.j1] : [Math.min(this.dirtyRows[0], rc.j0), Math.max(this.dirtyRows[1], rc.j1)];
    },
    endStroke() {
      cancelAnimationFrame(this._raf2);
      const s = this.stroke; this.stroke = null;
      if (!s || !s.rect) { this.strokeSnap = null; return; }
      const f = this.field, rc = s.rect;
      const before = cropSnapshot(this.strokeSnap, rc, f.nx), after = f.snapshot(rc);
      this.strokeSnap = null;
      this.pushHistory({
        undo: () => { f.restore(before); this.markRows(rc); },
        redo: () => { f.restore(after); this.markRows(rc); },
      });
    },
    markRows(rc) { this.dirtyRows = !this.dirtyRows ? [rc.j0, rc.j1] : [Math.min(this.dirtyRows[0], rc.j0), Math.max(this.dirtyRows[1], rc.j1)]; this.requestRender(); },
    restoreAll() {
      const f = this.field; if (!f || f.isIdentity()) return;
      const before = f.snapshot(f.fullRect());
      f.reset();
      const after = f.snapshot(f.fullRect()), rc = f.fullRect();
      this.pushHistory({ undo: () => { f.restore(before); this.markRows(rc); }, redo: () => { f.restore(after); this.markRows(rc); } });
      this.markRows(rc);
    },
    thawAll() {
      const f = this.field; if (!f || !f.hasMask()) return;
      const before = f.snapshot(f.fullRect());
      f.thawAll();
      const after = f.snapshot(f.fullRect()), rc = f.fullRect();
      this.pushHistory({ undo: () => { f.restore(before); this.markRows(rc); }, redo: () => { f.restore(after); this.markRows(rc); } });
      this.markRows(rc);
    },
  });
  // crop a full-field snapshot to a vertex rect
  function cropSnapshot(full, rc, nx) {
    const w = rc.i1 - rc.i0 + 1, h = rc.j1 - rc.j0 + 1;
    const dx = new Float32Array(w*h), dy = new Float32Array(w*h), mask = new Float32Array(w*h);
    for (let j = 0; j < h; j++) {
      const s = (rc.j0 + j)*nx + rc.i0;
      dx.set(full.dx.subarray(s, s + w), j*w); dy.set(full.dy.subarray(s, s + w), j*w); mask.set(full.mask.subarray(s, s + w), j*w);
    }
    return { rc: { ...rc }, w, h, dx, dy, mask };
  }

  // ---------------------------------------------------------------- Editor: transform interaction, keyboard
  const UNIT_CORNERS = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const UNIT_SIDES = [[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]];
  const WARP_CORNER_HANDLES = { 0: [1, 4], 3: [2, 7], 12: [13, 8], 15: [14, 11] };
  const sameRect = (a, b) => (!a && !b) || (a && b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h);

  Object.assign(Editor.prototype, {
    pointInQuad(ip) {
      if (this.xf.warp) { const b = this.xf.bbox(); return ip[0] >= b.x && ip[0] <= b.x + b.w && ip[1] >= b.y && ip[1] <= b.y + b.h; }
      const [u, v] = m3Pt(this.xf.Hinv(), ip[0], ip[1]);
      return u >= 0 && u <= 1 && v >= 0 && v <= 1;
    },
    // screen-space hit test → { kind, idx } | null
    hitTransform(p) {
      const xf = this.xf, HR = this.touchUI ? 22 : 7;   // a fingertip needs a much bigger target
      const near = (q, r) => Math.hypot(q[0] - p[0], q[1] - p[1]) <= r;
      const pv = this.toScreen(...xf.pivotDest());
      if (xf.warp && this.xfMode === "warp") {
        for (let k = 0; k < 16; k++) if (near(this.toScreen(...xf.warpHandle(k)), HR + 1)) return { kind: "warp", idx: k };
        if (near(pv, HR)) return { kind: "pivot" };
        return this.pointInQuad(this.toImage(p[0], p[1])) ? { kind: "inside" } : null;
      }
      const cs = xf.corners.map(c => this.toScreen(c[0], c[1]));
      for (let i = 0; i < 4; i++) if (near(cs[i], HR)) return { kind: "corner", idx: i };
      for (let i = 0; i < 4; i++) { const a = cs[i], b = cs[(i + 1) % 4]; if (near([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], HR)) return { kind: "side", idx: i }; }
      if (near(pv, HR)) return { kind: "pivot" };
      const ip = this.toImage(p[0], p[1]);
      if (this.pointInQuad(ip)) return { kind: "inside" };
      for (let i = 0; i < 4; i++) if (near(cs[i], this.touchUI ? 62 : 36)) return { kind: "rotate", idx: i };
      return null;
    },
    updateCursor(p, ip) {
      if (this.mode !== "transform" || this.tool !== "move" || this.space) { this.stage.style.cursor = ""; return; }
      const h = this.hitTransform(p);
      let c = "";
      if (h) {
        const rot = this.xfMode === "rotate";
        if (h.kind === "corner") c = rot ? ROTATE_CURSOR : (h.idx % 2 === 0 ? "nwse-resize" : "nesw-resize");
        else if (h.kind === "side") c = rot ? ROTATE_CURSOR : (h.idx % 2 === 0 ? "ns-resize" : "ew-resize");
        else if (h.kind === "rotate") c = ROTATE_CURSOR;
        else if (h.kind === "inside") c = rot ? ROTATE_CURSOR : "move";
        else if (h.kind === "pivot") c = "crosshair";
        else if (h.kind === "warp") c = "pointer";
      }
      this.stage.style.cursor = c;
    },
    startTransformDrag(e, p, ip) {
      const hit = this.hitTransform(p);
      if (!hit) return;
      const mode = this.xfMode, ctrl = e.ctrlKey || e.metaKey;
      let op = hit.kind;
      if (hit.kind === "corner") {
        if (mode === "free") op = ctrl && e.altKey && e.shiftKey ? "perspective" : ctrl ? "distort" : "scale";
        else if (mode === "rotate") op = "rotate";
        else if (mode === "skew" || mode === "distort") op = "distort";
        else if (mode === "perspective") op = "perspective";
        else op = "scale";
      } else if (hit.kind === "side") {
        if (mode === "free") op = ctrl ? "skew" : "scale";
        else if (mode === "rotate") op = "rotate";
        else if (mode === "skew") op = "skew";
        else if (mode === "distort") op = "distortSide";
        else op = "scale";
      } else if (hit.kind === "inside") {
        op = mode === "rotate" ? "rotate" : "move";
      }
      this.drag = {
        type: "xf", id: e.pointerId, op, hitKind: hit.kind, idx: hit.idx, startP: p, startIp: ip,
        state0: this.xf.clone(), H0: this.xf.H(), Hinv0: this.xf.Hinv(),
      };
    },
    moveTransformDrag(e, p, ip) {
      const d = this.drag, xf = this.xf;
      xf.assign(d.state0);
      const m = m3Pt(d.Hinv0, ip[0], ip[1]);                     // pointer in unit space of the start state
      const dxy = [ip[0] - d.startIp[0], ip[1] - d.startIp[1]];
      const shift = e.shiftKey, alt = e.altKey;
      switch (d.op) {
        case "move": {
          let [tx, ty] = dxy;
          if (shift) { if (Math.abs(tx) > Math.abs(ty)) ty = 0; else tx = 0; }
          xf.applyDest(m3Translate(tx, ty));
          break;
        }
        case "pivot": xf.pivot = [m[0], m[1]]; break;
        case "rotate": {
          const c = d.state0.pivotDest();
          let th = Math.atan2(ip[1] - c[1], ip[0] - c[0]) - Math.atan2(d.startIp[1] - c[1], d.startIp[0] - c[0]);
          if (shift) th = Math.round(th / (Math.PI / 12)) * (Math.PI / 12);
          xf.applyDest(m3About(m3Rotate(th), c[0], c[1]));
          break;
        }
        case "scale": {
          const side = d.hitKind === "side";
          const h = side ? UNIT_SIDES[d.idx] : UNIT_CORNERS[d.idx];
          const A = alt ? [0.5, 0.5] : (side ? UNIT_SIDES[(d.idx + 2) % 4] : UNIT_CORNERS[(d.idx + 2) % 4]);
          const hx = h[0] - A[0], hy = h[1] - A[1];
          let sx = 1, sy = 1;
          if (side) { if (Math.abs(hx) > 1e-9) sx = (m[0] - A[0]) / hx; else sy = (m[1] - A[1]) / hy; }
          else if (this.proportional !== shift) { const s = ((m[0] - A[0]) * hx + (m[1] - A[1]) * hy) / (hx*hx + hy*hy); sx = sy = s; }
          else { sx = (m[0] - A[0]) / hx; sy = (m[1] - A[1]) / hy; }
          if (Math.abs(sx) < 1e-3) sx = sx < 0 ? -1e-3 : 1e-3;
          if (Math.abs(sy) < 1e-3) sy = sy < 0 ? -1e-3 : 1e-3;
          xf.applySrc([sx, 0, A[0] - sx*A[0], 0, sy, A[1] - sy*A[1], 0, 0, 1]);
          break;
        }
        case "skew": {
          const h = UNIT_SIDES[d.idx], A = UNIT_SIDES[(d.idx + 2) % 4];
          if (d.idx === 1 || d.idx === 3) { const kk = (m[1] - h[1]) / (h[0] - A[0]); xf.applySrc([1, 0, 0, kk, 1, -kk*A[0], 0, 0, 1]); }
          else { const kk = (m[0] - h[0]) / (h[1] - A[1]); xf.applySrc([1, kk, -kk*A[1], 0, 1, 0, 0, 0, 1]); }
          break;
        }
        case "distort": {
          const nc = d.state0.corners.map(c => [c[0], c[1]]);
          nc[d.idx] = [nc[d.idx][0] + dxy[0], nc[d.idx][1] + dxy[1]];
          xf.setCorners(nc);
          break;
        }
        case "distortSide": {
          const nc = d.state0.corners.map(c => [c[0], c[1]]);
          for (const i of [d.idx, (d.idx + 1) % 4]) nc[i] = [nc[i][0] + dxy[0], nc[i][1] + dxy[1]];
          xf.setCorners(nc);
          break;
        }
        case "perspective": {
          const uc = UNIT_CORNERS.map(c => [c[0], c[1]]);
          const h = UNIT_CORNERS[d.idx], du = m[0] - h[0], dv = m[1] - h[1];
          const hn = UNIT_CORNERS.findIndex(c => c[1] === h[1] && c[0] !== h[0]);
          const vn = UNIT_CORNERS.findIndex(c => c[0] === h[0] && c[1] !== h[1]);
          uc[d.idx] = [h[0] + du, h[1] + dv];
          uc[hn][0] -= du; uc[vn][1] -= dv;
          xf.setCorners(uc.map(c => m3Pt(d.H0, c[0], c[1])));
          break;
        }
        case "warp": {
          const w = xf.warp, w0 = d.state0.warp;
          const mv = (i, f) => { w[i*2] = w0[i*2] + dxy[0] * f; w[i*2 + 1] = w0[i*2 + 1] + dxy[1] * f; };
          if (TransformState.isWarpCorner(d.idx)) {
            mv(d.idx, 1);
            for (const h of WARP_CORNER_HANDLES[d.idx]) mv(h, 1);   // corner drags its edge tangents along
          } else {
            // scale the control-point move so the crossing itself follows the pointer exactly
            mv(d.idx, 1 / TransformState.warpWeight(d.idx));
          }
          xf.preset = "custom";
          break;
        }
      }
      this.syncTransformReadout();
    },
    endTransformDrag(d) {
      const before = d.state0, after = this.xf.clone();
      if (JSON.stringify(before.corners) === JSON.stringify(after.corners) && JSON.stringify(before.pivot) === JSON.stringify(after.pivot) &&
          String(before.warp) === String(after.warp)) return;
      this.pushXfHistory(before);
    },
    pushXfHistory(before) {
      const entry = { after: this.xf.clone() };
      entry.undo = () => { this.xf.assign(before); this.afterXfChange(); };
      entry.redo = () => { this.xf.assign(entry.after); this.afterXfChange(); };
      this.pushHistory(entry);
      this.afterXfChange();
      return entry;
    },
    afterXfChange() {
      if (this.xf.warp && this.xfMode !== "warp") { this.xfMode = "warp"; this.selMode.value = "warp"; }
      if (!this.xf.warp && this.xfMode === "warp") { this.xfMode = "free"; this.selMode.value = "free"; }
      this.syncTransformReadout(); this.requestRender();
    },
    cancelDrag() {
      const d = this.drag; if (!d) return;
      this.drag = null; this.stage.classList.remove("panning");
      if (d.type === "xf") { this.xf.assign(d.state0); this.syncTransformReadout(); }
      else if (d.type === "stroke") { cancelAnimationFrame(this._raf2); this.stroke = null; if (this.strokeSnap) { this.field.restore(this.strokeSnap); this.strokeSnap = null; this.markRows(this.field.fullRect()); } }
      else if (d.type === "marquee") { this.sel = d.before; this.syncTransformReadout(); }
      this.requestRender();
    },
    endMarquee(d) {
      let sel = this.sel;
      if (sel && (sel.w < 2 || sel.h < 2)) sel = null;
      this.setSelection(sel, d.before);
    },
    setSelection(sel, before = this.sel) {
      if (this.xf && !this.xf.isIdentity()) this.commitLive();
      const b0 = before ? { ...before } : null, xf0 = this.xf.clone();
      this.sel = sel ? { ...sel } : null;
      this.xf = new TransformState(sel || { x: 0, y: 0, w: this.W, h: this.H });
      const s1 = this.sel ? { ...this.sel } : null, xf1 = this.xf.clone();
      if (!sameRect(b0, this.sel)) {
        this.pushHistory({
          undo: () => { this.sel = b0 ? { ...b0 } : null; this.xf.assign(xf0); this.afterXfChange(); },
          redo: () => { this.sel = s1 ? { ...s1 } : null; this.xf.assign(xf1); this.afterXfChange(); },
        });
      }
      this.afterXfChange();
    },
    xfOp(name) {
      const xf = this.xf, before = xf.clone();
      const pv = xf.pivotDest();
      if (name === "flipH") xf.applySrc([-1, 0, 1, 0, 1, 0, 0, 0, 1]);
      else if (name === "flipV") xf.applySrc([1, 0, 0, 0, -1, 1, 0, 0, 1]);
      else if (name === "rot90cw") xf.applyDest(m3About(m3Rotate(Math.PI / 2), pv[0], pv[1]));
      else if (name === "rot90ccw") xf.applyDest(m3About(m3Rotate(-Math.PI / 2), pv[0], pv[1]));
      else if (name === "rot180") xf.applyDest(m3About(m3Rotate(Math.PI), pv[0], pv[1]));
      else if (name === "reset") { const n = new TransformState(xf.src); xf.assign(n); }
      this.pushXfHistory(before);
    },
    xfSet(key, v) {
      const xf = this.xf, before = xf.clone(), r = xf.readout();
      if (key === "x") xf.applyDest(m3Translate(v - r.x, 0));
      else if (key === "y") xf.applyDest(m3Translate(0, v - r.y));
      else if (key === "w" || key === "h") {
        let sx = key === "w" ? v / r.w : 1, sy = key === "h" ? v / r.h : 1;
        if (this.proportional) { if (key === "w") sy = sx; else sx = sy; }
        if (!isFinite(sx) || !isFinite(sy) || Math.abs(sx) < 1e-3 || Math.abs(sy) < 1e-3) return;
        const [px, py] = xf.pivot;
        xf.applySrc([sx, 0, px - sx*px, 0, sy, py - sy*py, 0, 0, 1]);
      } else if (key === "angle") {
        const th = (v - r.angle) * Math.PI / 180, pv = xf.pivotDest();
        xf.applyDest(m3About(m3Rotate(th), pv[0], pv[1]));
      }
      this.pushXfHistory(before);
    },
    setWarpPreset(name) {
      const before = this.xf.clone();
      this.xf.applyPreset(name, this.sBend.inp.valueAsNumber);
      this.pushXfHistory(before);
    },
    setWarpBend(v) {
      if (!this.xf.warp || this.xf.preset === "custom") return;
      if (!this._bendBefore) this._bendBefore = this.xf.clone();
      this.xf.applyPreset(this.xf.preset, v);
      this.syncTransformReadout(); this.requestRender();
    },
    nudge(dx, dy) {
      const now = performance.now();
      if (this._nudge && now - this._nudge.t < 900) {
        this.xf.applyDest(m3Translate(dx, dy));
        this._nudge.entry.after = this.xf.clone(); this._nudge.t = now;
        this.afterXfChange();
      } else {
        const before = this.xf.clone();
        this.xf.applyDest(m3Translate(dx, dy));
        this._nudge = { t: now, entry: this.pushXfHistory(before) };
      }
    },

    // ---------- keyboard (window capture: the host page never sees keys while the tool is open)
    onKeyDown(e) {
      if (this.closed) return;
      e.stopPropagation();
      const tg = e.target;
      const inField = tg instanceof Node && this.root.contains(tg) && /^(INPUT|SELECT|TEXTAREA)$/.test(tg.tagName);
      if (inField) {
        if (e.key === "Enter" || e.key === "Escape") { tg.blur(); this.root.focus(); e.preventDefault(); }
        return;
      }
      if (!this.ready) { if (e.key === "Escape") this.cancel(); return; }
      const k = e.key, ctrl = e.ctrlKey || e.metaKey;
      const done = () => e.preventDefault();
      if (k === "Escape") { if (this.closeBrushPop()) return done(); if (this.drag) this.cancelDrag(); else this.cancel(); return done(); }
      if (ctrl && (k === "z" || k === "Z")) { e.shiftKey ? this.redo() : this.undo(); return done(); }
      if (ctrl && (k === "y" || k === "Y")) { this.redo(); return done(); }
      if (k === "Enter") { if (ctrl) this.save(); else if (this.mode === "transform") this.commitLive(true); return done(); }
      if (ctrl && k === "0") { this.fit(); return done(); }
      if (ctrl && k === "1") { this.zoomTo(1); return done(); }
      if (ctrl && (k === "s" || k === "S")) { this.save(); return done(); }
      if (ctrl && /^[adAD]$/.test(k)) { if (this.mode === "transform") this.setSelection(null); return done(); }
      if (ctrl && (k === "t" || k === "T")) { this.setMode(this.mode === "liquify" ? "transform" : "liquify"); return done(); }
      if (k === "+" || k === "=") { this.zoomBy(1.25); return done(); }
      if (k === "-" || k === "_") { this.zoomBy(1 / 1.25); return done(); }
      if (k === "[" || k === "]") {
        const dir = k === "]" ? 1 : -1;
        if (e.shiftKey) this.brush.pressure = clamp(this.brush.pressure + dir * 5, 1, 100);
        else this.brush.size = clamp(Math.round(this.brush.size * (dir > 0 ? 1.15 : 1 / 1.15) + dir), 5, 1000);
        this.syncBrushControls();
        this.requestRender(); return done();
      }
      if (k === "\\") { this.toggleOriginal(); return done(); }
      if (k === " ") { if (!this.space) { this.space = true; this.syncPanels(); } return done(); }
      if (k === "Alt") { this.alt = true; return done(); }
      if (k.startsWith("Arrow") && this.mode === "transform" && this.tool === "move" && !ctrl) {
        const s = e.shiftKey ? 10 : 1;
        this.nudge(k === "ArrowLeft" ? -s : k === "ArrowRight" ? s : 0, k === "ArrowUp" ? -s : k === "ArrowDown" ? s : 0);
        return done();
      }
      if (!ctrl && !e.altKey && k.length === 1) {
        const up = k.toUpperCase();
        const list = (this.mode === "liquify" ? LIQUIFY_TOOLS : TRANSFORM_TOOLS).concat("hand");
        const tool = list.find(n => KEYS[n] === up);
        if (tool) { this.setTool(tool); done(); }
      }
    },
    onKeyUp(e) {
      if (this.closed) return;
      e.stopPropagation();
      if (e.key === " ") { this.space = false; this.syncPanels(); }
      if (e.key === "Alt") { this.alt = false; e.preventDefault(); }
    },
  });

  // ---------------------------------------------------------------- Editor: rendering, history, commit, export
  Object.assign(Editor.prototype, {
    requestRender() {
      if (this._raf || !this.ready || this.closed) return;
      this._raf = requestAnimationFrame(() => { this._raf = 0; if (!this.closed) this.draw(); });
    },
    flushField() {
      if (!this.dirtyRows) return;
      const [j0, j1] = this.dirtyRows, nx = this.field.nx;
      this.field.fillMesh(this.lmesh, j0, j1);
      this.lmesh.upload("uv", j0 * nx, (j1 + 1) * nx);
      this.lmesh.upload("mask", j0 * nx, (j1 + 1) * nx);
      this.dirtyRows = null;
    },
    draw() {
      const r = this.r, v = this.view, dpr = this.dpr, cw = this.gl.width, ch = this.gl.height;
      if (!cw || !ch) return;
      this.flushField();
      r.begin(null, cw, ch);
      const view = r.viewScreen(v.ox * dpr, v.oy * dpr, v.zoom * dpr, cw, ch);
      r.scissor(v.ox * dpr, v.oy * dpr, this.W * v.zoom * dpr, this.H * v.zoom * dpr, ch);
      r.draw(r.quad, null, view, { checker: true, cell: Math.max(2, 10 / v.zoom) });
      if (this.vo.original) r.draw(r.quad, this.origTex, view);
      else if (this.mode === "liquify") r.draw(this.lmesh, this.base.tex, view, { showMesh: this.vo.showMesh, meshN: MESH_N[this.vo.meshSize], showMask: this.vo.showMask });
      else this.drawTransform(view, this.base.tex, this.xf, this.sel, this.hole);
      r.noScissor();
      this.drawOverlay();
    },
    // base image + transformed (selection) quad. Used for the live preview, baking and export.
    drawTransform(view, tex, xf, sel, hole) {
      const r = this.r;
      if (xf.isIdentity()) { r.draw(r.quad, tex, view); return; }
      if (sel) {
        const h = hole === "transparent" ? [sel.x / this.W, sel.y / this.H, (sel.x + sel.w) / this.W, (sel.y + sel.h) / this.H] : null;
        r.draw(r.quad, tex, view, { hole: h });
      }
      this.fillTransformMesh(xf);
      r.draw(this.xmesh, tex, view);
    },
    fillTransformMesh(xf) {
      const N = this.XN, m = this.xmesh, H = xf.H(), s = xf.src, W = this.W, Hh = this.H;
      for (let j = 0; j < N; j++) {
        const v = j / (N - 1);
        for (let i = 0; i < N; i++) {
          const u = i / (N - 1), k = j * N + i;
          if (xf.warp) { const p = xf.warpAt(u, v); m.pos[k*3] = p[0]; m.pos[k*3 + 1] = p[1]; m.pos[k*3 + 2] = 1; }
          else { const p = m3PtH(H, u, v); m.pos[k*3] = p[0]; m.pos[k*3 + 1] = p[1]; m.pos[k*3 + 2] = p[2]; }
          m.uv[k*2] = (s.x + u * s.w) / W; m.uv[k*2 + 1] = (s.y + v * s.h) / Hh;
        }
      }
      m.upload("pos"); m.upload("uv");
    },
    drawOverlay() {
      const ctx = this.ov.getContext("2d"), dpr = this.dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, this.sw, this.sh);
      const S = (x, y) => this.toScreen(x, y);
      const [x0, y0] = S(0, 0), [x1, y1] = S(this.W, this.H);
      ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(x0) + .5, Math.round(y0) + .5, Math.round(x1 - x0), Math.round(y1 - y0));
      const stroke2 = (path) => {           // two-tone stroke for visibility on any background
        ctx.lineWidth = 3; ctx.strokeStyle = "rgba(0,0,0,.55)"; path(); ctx.stroke();
        ctx.lineWidth = 1; ctx.strokeStyle = "#fff"; path(); ctx.stroke();
      };
      if (this.mode === "liquify") {
        if (this.pointer && this.tool !== "hand" && !this.space && !this.vo.original) {
          const [px, py] = this.pointer, rr = Math.max(2, this.brush.size / 2 * this.view.zoom);
          stroke2(() => { ctx.beginPath(); ctx.arc(px, py, rr, 0, Math.PI * 2); });
          ctx.fillStyle = "#fff"; ctx.fillRect(px - 1, py - 1, 2, 2);
        }
        return;
      }
      // selection (marching-ants look, static)
      if (this.sel) {
        const [sx, sy] = S(this.sel.x, this.sel.y), [ex, ey] = S(this.sel.x + this.sel.w, this.sel.y + this.sel.h);
        ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#000"; ctx.strokeRect(Math.round(sx) + .5, Math.round(sy) + .5, Math.round(ex - sx), Math.round(ey - sy));
        ctx.lineDashOffset = 4; ctx.strokeStyle = "#fff"; ctx.strokeRect(Math.round(sx) + .5, Math.round(sy) + .5, Math.round(ex - sx), Math.round(ey - sy));
        ctx.setLineDash([]); ctx.lineDashOffset = 0;
      }
      if (this.tool !== "move" || this.vo.original) return;
      const xf = this.xf;
      const handle = (p, square = true, r = 4) => {
        ctx.fillStyle = "#fff"; ctx.strokeStyle = "rgba(0,0,0,.7)"; ctx.lineWidth = 1;
        if (square) { ctx.fillRect(p[0] - r, p[1] - r, r * 2, r * 2); ctx.strokeRect(p[0] - r + .5, p[1] - r + .5, r * 2 - 1, r * 2 - 1); }
        else { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      };
      if (xf.warp && this.xfMode === "warp") {
        ctx.strokeStyle = "rgba(79,140,255,.95)"; ctx.lineWidth = 1;
        for (const t of [0, 1 / 3, 2 / 3, 1]) {
          for (const along of ["u", "v"]) {
            ctx.beginPath();
            for (let i = 0; i <= 24; i++) {
              const p = along === "u" ? xf.warpAt(i / 24, t) : xf.warpAt(t, i / 24), q = S(p[0], p[1]);
              if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]);
            }
            ctx.stroke();
          }
        }
        for (let k = 0; k < 16; k++) {
          const corner = TransformState.isWarpCorner(k);
          handle(S(...xf.warpHandle(k)), corner, corner ? 5 : 4);
        }
      } else {
        const cs = xf.corners.map(c => S(c[0], c[1]));
        stroke2(() => { ctx.beginPath(); ctx.moveTo(cs[0][0], cs[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(cs[i][0], cs[i][1]); ctx.closePath(); });
        for (let i = 0; i < 4; i++) { const a = cs[i], b = cs[(i + 1) % 4]; handle([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]); }
        for (const c of cs) handle(c);
      }
      const pv = S(...xf.pivotDest());
      stroke2(() => { ctx.beginPath(); ctx.arc(pv[0], pv[1], 5, 0, Math.PI * 2); ctx.moveTo(pv[0] - 9, pv[1]); ctx.lineTo(pv[0] + 9, pv[1]); ctx.moveTo(pv[0], pv[1] - 9); ctx.lineTo(pv[0], pv[1] + 9); });
    },

    // ---------- history
    pushHistory(entry) {
      this.undoStack.push(entry);
      if (this.undoStack.length > 60) this.undoStack.shift();
      this.redoStack.length = 0;
      this._nudge = null;
      this.syncHistoryButtons();
    },
    undo() {
      this.endDrag();
      const e = this.undoStack.pop(); if (!e) return;
      e.undo(); this.redoStack.push(e); this._nudge = null;
      this.syncHistoryButtons(); this.setStatus(); this.requestRender();
    },
    redo() {
      this.endDrag();
      const e = this.redoStack.pop(); if (!e) return;
      e.redo(); this.undoStack.push(e);
      this.syncHistoryButtons(); this.setStatus(); this.requestRender();
    },
    switchMode(m) {
      if (this.mode === m) return;
      this.lastTool[this.mode] = this.tool;
      this.mode = m;
      this.tool = this.lastTool[m] || (m === "liquify" ? "warp" : "move");
      this.buildTools(); this.syncPanels();
    },
    // bake the live edit of the current mode into the committed stack (undoable)
    commitLive() {
      this.endDrag();
      const full = { x: 0, y: 0, w: this.W, h: this.H };
      let entry;
      if (this.mode === "liquify") {
        const f = this.field;
        if (f.isIdentity()) return false;
        const op = { type: "liquify", dx: Float32Array.from(f.dx), dy: Float32Array.from(f.dy) };
        const apply = () => { this.ops.push(op); f.reset(); this.markRows(f.fullRect()); this.rebuildBase(); };
        apply();
        entry = {
          undo: () => { this.ops.pop(); f.dx.set(op.dx); f.dy.set(op.dy); f.touched = true; this.markRows(f.fullRect()); this.rebuildBase(); this.switchMode("liquify"); },
          redo: apply,
        };
      } else {
        if (this.xf.isIdentity()) return false;
        const op = { type: "transform", state: this.xf.clone(), sel: this.sel ? { ...this.sel } : null, hole: this.hole };
        const apply = () => { this.ops.push(op); this.sel = null; this.xf = new TransformState(full); this.rebuildBase(); this.afterXfChange(); };
        apply();
        entry = {
          undo: () => { this.ops.pop(); this.sel = op.sel ? { ...op.sel } : null; this.xf = op.state.clone(); this.hole = op.hole; this.rebuildBase(); this.switchMode("transform"); this.afterXfChange(); },
          redo: apply,
        };
      }
      this.pushHistory(entry);
      this.setStatus(); this.requestRender();
      return true;
    },
    // re-render original → every committed op, into this.base
    rebuildBase() {
      const r = this.r, W = this.W, H = this.H, view = r.viewFBO(W, H);
      let cur = this.tmp, other = this.base;
      r.begin(cur); r.draw(r.quad, this.origTex, view);
      for (const op of this.ops) {
        r.begin(other);
        if (op.type === "liquify") {
          this.field.fillMeshFrom(this.lmesh, op.dx, op.dy); this.lmesh.upload("uv");
          r.draw(this.lmesh, cur.tex, view);
          this.markRows(this.field.fullRect());          // live mesh must be refilled from the live field
        } else {
          this.drawTransform(view, cur.tex, op.state, op.sel, op.hole);
        }
        [cur, other] = [other, cur];
      }
      this.base = cur; this.tmp = other;
      this.requestRender();
    },
    dirty() {
      return this.ops.length > 0 || (this.field && !this.field.isIdentity()) || (this.xf && !this.xf.isIdentity());
    },
    resetAll() {
      if (!this.ready || !this.dirty()) return;
      if (!confirm(this.t.resetConfirm)) return;
      this.endDrag();
      this.ops = []; this.undoStack = []; this.redoStack = [];
      this.field.reset(); this.field.thawAll(); this.markRows(this.field.fullRect());
      this.sel = null; this.xf = new TransformState({ x: 0, y: 0, w: this.W, h: this.H });
      this.rebuildBase(); this.afterXfChange(); this.syncHistoryButtons(); this.setStatus();
    },

    // ---------- export
    renderResult() {
      const r = this.r, W = this.W, H = this.H, view = r.viewFBO(W, H);
      this.flushField();
      const out = r.target(W, H);
      r.begin(out);
      if (this.mode === "liquify" && !this.field.isIdentity()) r.draw(this.lmesh, this.base.tex, view);
      else if (this.mode === "transform") this.drawTransform(view, this.base.tex, this.xf, this.sel, this.hole);
      else r.draw(r.quad, this.base.tex, view);
      const px = r.readTarget(out);
      r.disposeTarget(out);
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      c.getContext("2d").putImageData(new ImageData(px, W, H), 0, 0);
      return c;
    },
    async save() {
      if (!this.ready || this.saving) return;
      this.endDrag();
      const o = this.o, t = this.t, mime = this.exportMime();
      let canvas = this.renderResult();
      if (mime === "image/jpeg") {
        const c2 = document.createElement("canvas"); c2.width = canvas.width; c2.height = canvas.height;
        const cx = c2.getContext("2d"); cx.fillStyle = this.exp.bg; cx.fillRect(0, 0, c2.width, c2.height); cx.drawImage(canvas, 0, 0);
        canvas = c2;
      }
      const q = this.exp.quality;
      const dataUrl = canvas.toDataURL(mime, q);
      const blob = await new Promise(res => canvas.toBlob(res, mime, q));
      const result = { dataUrl, blob, mime, width: canvas.width, height: canvas.height, canvas };
      if (!o.onSave) {
        const a = document.createElement("a");
        a.href = dataUrl; a.download = (o.filename || "retouche") + (mime === "image/jpeg" ? ".jpg" : mime === "image/webp" ? ".webp" : ".png");
        document.body.appendChild(a); a.click(); a.remove();
        this.close("save");
        return result;
      }
      this.saving = true; this.btnSave.disabled = true; this.btnSave.textContent = t.saving;
      try {
        await o.onSave(result);
        if (o.closeOnSave !== false) this.close("save");
      } catch (err) {
        console.error("[RetouchTool] onSave failed:", err);
        this.showMsg(String((err && err.message) || err), true);
        setTimeout(() => this.hideMsg(), 4000);
      } finally {
        this.saving = false;
        if (!this.closed) { this.btnSave.disabled = false; this.btnSave.textContent = t.save; }
      }
      return result;
    },
    cancel() {
      if (this.closed) return;
      if (this.dirty() && !confirm(this.t.unsaved)) return;
      if (this.o.onCancel) this.o.onCancel();
      this.close("cancel");
    },
    close(reason) {
      if (this.closed) return;
      this.closed = true;
      this.endDrag();
      cancelAnimationFrame(this._raf); cancelAnimationFrame(this._raf2);
      clearTimeout(this._toastT);
      this.unbindEvents();
      this.mq.removeEventListener ? this.mq.removeEventListener("change", this._onMQ) : this.mq.removeListener(this._onMQ);
      document.body.style.overflow = this._prevOverflow || "";
      document.documentElement.style.overscrollBehavior = this._prevOverscroll || "";
      if (this.meta) this.meta.remove();
      if (this.ro) this.ro.disconnect();
      if (this.r) {
        try {
          if (this.lmesh) this.lmesh.dispose();
          if (this.xmesh) this.xmesh.dispose();
          if (this.base) this.r.disposeTarget(this.base);
          if (this.tmp) this.r.disposeTarget(this.tmp);
          if (this.origTex) this.r.gl.deleteTexture(this.origTex);
          this.r.dispose();
        } catch (_) {}
      }
      this.root.remove();
      if (current === this) current = null;
      if (this.o.onClose) this.o.onClose(reason);
    },
  });

  // ---------------------------------------------------------------- public API
  let current = null;
  const RetouchTool = {
    version: VERSION,
    open(opts = {}) {
      if (!opts.src) throw new Error("RetouchTool.open: `src` is required");
      if (current) current.close("replaced");
      const ed = new Editor(opts);
      current = ed;
      ed.init();
      return ed;
    },
    close() { if (current) current.close("api"); },
    isOpen() { return !!current && !current.closed; },
    get current() { return current; },
    Editor, LiquifyField, TransformState, Renderer,
  };
  global.RetouchTool = RetouchTool;
  if (typeof module !== "undefined" && module.exports) module.exports = RetouchTool;
})(typeof window !== "undefined" ? window : globalThis);
