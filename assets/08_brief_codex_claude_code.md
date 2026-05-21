# Étape 8 — Brief final pour Codex / Claude Code

## Objectif

Ce document est un brief prêt à utiliser avec Codex, Claude Code, ou une autre IA de développement.

Il doit permettre de construire l’app **étape par étape**, sans demander à l’IA de tout créer en une seule fois.

L’objectif est de guider un développement collaboratif :

```text
Human defines priorities
AI builds one phase at a time
Human reviews
AI adjusts
Next phase starts only after validation
```

---

# Prompt principal à coller dans Codex / Claude Code

```text
You are helping build a web app for a miniature production team.

The app is called a Visual Release Review App.

It replaces a heavy Photoshop release board used to review monthly miniature releases.

The app is not a project management system.
It is not a task tracker.
It is not a dashboard for analytics or reporting.

The purpose of the app is to show the current visual state of a release, organized by tier, so the Art Director and Technical Supervisor can review the release visually.

The app must support a simple daily update workflow handled by one or two updaters.

Artists/sculptors are not expected to maintain the app. They continue to post their images in a conversation thread. The updater collects those images and updates the app.

Loom and the conversation thread remain the source of truth for feedback and decisions. The app is only the visual current-state board.

Build this app step by step. Do not implement everything at once.

At each phase:
1. Explain what you are about to build.
2. Ask for confirmation if there is ambiguity.
3. Implement only that phase.
4. Summarize what changed.
5. Stop and wait for review before continuing.

Prioritize:
1. Visual review experience
2. Fast daily update
3. Clear latest visible version
4. Simple status colors
5. Template-based monthly setup
6. Lightweight archive

Do not add management features unless explicitly requested.
Do not add task dependencies, analytics, reporting, notifications, or complex comments in the MVP.
```

---

# Product summary

## What the app does

```text
The app shows a monthly release board.

The board is organized by tiers.

Each tier contains model cards.

Each model card shows:
- main image
- optional detail images
- model name
- artist
- due date
- status color
- optional Loom link
- optional thread link
- optional short note
```

## Core principle

```text
Main board = current visual state
Archive = previous versions
Thread + Loom = feedback source of truth
```

---

# User roles

## Art Director

Uses the app to:

- open the current release;
- scan the full board;
- review by tier;
- click a model card;
- view the model in large focus mode;
- inspect detail images;
- give feedback in Loom or the conversation thread.

The Art Director should not need to administer the app.

---

## Technical Supervisor

Uses the app to:

- inspect the current state of models;
- review technical aspects;
- open focus views;
- use Loom/thread links;
- participate in reviews.

---

## Assistant / Updater

Uses the app to:

- create a release from a template;
- open the current release board;
- find model cards;
- replace main images;
- add detail images;
- change status color;
- add optional Loom/thread links;
- archive previous versions;
- prepare the board for daily review.

---

## Sculptors / Artists

They do not maintain the app.

They continue to:

- sculpt models;
- post screenshots/images in the conversation thread;
- receive feedback from Loom/thread.

---

# Data model

## Release

Fields:

```text
id
name
month
year
type: monthly_release | update_board
tiers[]
created_at
updated_at
```

---

## Tier

Fields:

```text
id
release_id
name
order
cards[]
```

---

## SKU / Group

Optional, depending on implementation.

Fields:

```text
id
tier_id
name
order
cards[]
```

A SKU / Group may contain one or more model cards.

---

## Model Card

Fields:

```text
id
tier_id
sku_id optional
name
artist
due_date
status
main_image
detail_images[]
loom_link optional
thread_link optional
short_note optional
archive[]
created_at
updated_at
```

---

## Image

Fields:

```text
id
card_id
type: main | detail | archive
url
filename
uploaded_at
uploaded_by
note optional
```

---

## Status

Recommended statuses:

```text
sketch
sculpt_wip
review
approved
finished
```

Recommended visual colors:

```text
sketch      = gray
sculpt_wip  = blue
review      = orange
approved    = green
finished    = green or dark green
```

---

## Archive Item

Fields:

```text
id
card_id
image_url
status_at_time
note optional
created_at
```

---

# Required screens

## 1. Release Dashboard

Purpose:

```text
Choose or create a release.
```

Should show:

- current releases;
- update boards;
- templates;
- button to create new release;
- button to create from template.

Priority:

```text
MVP useful, but simple.
```

---

## 2. Monthly Release Board

Purpose:

```text
Main visual review board.
```

Should show:

- release name;
- tiers;
- model cards;
- card status color;
- main image;
- optional detail thumbnails.

Priority:

```text
MVP essential.
```

---

## 3. Model Focus View

Purpose:

```text
Large review view for one model.
```

Should show:

- large main image;
- detail images;
- model name;
- artist;
- due date;
- status;
- Loom link;
- thread link;
- short note;
- archive link if available.

Priority:

```text
MVP essential.
```

---

## 4. Update / Upload Panel

Purpose:

```text
Fast daily update workflow.
```

Should allow:

- replace main image;
- add/replace detail images;
- change status;
- edit artist;
- edit due date;
- edit Loom/thread links;
- edit short note;
- save.

Priority:

```text
MVP essential.
```

---

## 5. Template Management

Purpose:

```text
Create new releases from recurring structures.
```

Should allow:

- create template;
- duplicate template;
- create release from template;
- maintain tiers and cards.

Priority:

```text
Important after the core board works.
```

---

## 6. Archive / Version View

Purpose:

```text
View previous images without cluttering the main board.
```

Should show:

- previous images;
- upload date;
- status at time;
- optional note;
- restore option if needed.

Priority:

```text
Useful after image replacement works.
```

---

# MVP build phases

## Phase 1 — Project setup

Goal:

```text
Create the basic app structure.
```

Build:

- app shell;
- routing;
- basic layout;
- seed data;
- no backend if not necessary yet.

Stop after this phase for review.

---

## Phase 2 — Static Release Board

Goal:

```text
Show a visual board with tiers and cards.
```

Build:

- one sample release;
- Tier 1 / Tier 2 / Tier 3;
- model cards;
- status colors;
- placeholder images.

Do not add upload yet.

Stop after this phase for review.

---

## Phase 3 — Model Focus View

Goal:

```text
Click a card and review it in large format.
```

Build:

- click card;
- open focus modal/page;
- large main image;
- detail images;
- metadata;
- close/back to board.

Stop after this phase for review.

---

## Phase 4 — Edit / Update Card

Goal:

```text
Updater can modify a card.
```

Build:

- edit panel;
- change name;
- change artist;
- change due date;
- change status;
- update links;
- update short note.

Stop after this phase for review.

---

## Phase 5 — Image Upload / Replace

Goal:

```text
Updater can replace images.
```

Build:

- replace main image;
- add detail images;
- preview uploaded image;
- save changes.

If backend/storage is not ready, use local mock first.

Stop after this phase for review.

---

## Phase 6 — Archive Previous Versions

Goal:

```text
Previous main image is preserved when replaced.
```

Build:

- automatic archive on replacement;
- archive view;
- previous image list;
- optional restore.

Stop after this phase for review.

---

## Phase 7 — Release Templates

Goal:

```text
Create a new release from a template.
```

Build:

- template structure;
- duplicate template into new release;
- release name/month;
- empty cards ready for images.

Stop after this phase for review.

---

## Phase 8 — Polish Review Experience

Goal:

```text
Make the app feel excellent for the Art Director.
```

Improve:

- visual layout;
- zoom/focus experience;
- tier navigation;
- status legend;
- responsive design;
- keyboard shortcuts if useful.

Stop after this phase for review.

---

## Phase 9 — Optional features

Only after approval of MVP.

Possible features:

- search by model name;
- filter by status;
- jump to tier;
- before/after view for update boards;
- export board as image/PDF;
- simple permissions;
- deployment.

---

# Development rules for the AI

Use these rules while building:

```text
1. Do not build the whole app in one response.
2. Work one phase at a time.
3. Ask before adding complexity.
4. Prioritize the board over dashboards.
5. Prioritize visual clarity over data density.
6. Keep the updater workflow fast.
7. Do not force artists to use the app.
8. Do not replace Loom/thread feedback.
9. Avoid management features in the MVP.
10. Keep the app simple enough to be used daily.
```

---

# Acceptance criteria for MVP

The MVP is successful if:

```text
1. A release can be opened.
2. The release is shown visually by tier.
3. Each model has a visible card.
4. Each card shows a status color.
5. Clicking a card opens a large model view.
6. The updater can replace the main image.
7. The updater can add detail images.
8. The updater can change the status.
9. The visible board always shows the latest version.
10. The Art Director can review without using admin features.
```

---

# Explicit non-goals

The MVP should not include:

```text
project management
task dependencies
complex assignments
analytics
reporting
notifications
internal messaging
complex comments
approval workflow engine
time tracking
```

---

# Final instruction for Codex / Claude Code

```text
Start with Phase 1 only.

Before coding, restate your understanding of the app in 10 bullet points.

Then propose the technical stack and project structure.

Wait for approval before implementing.
```
