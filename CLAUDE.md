# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Survivor-tipy-2026** is a Progressive Web App (PWA) for managing betting predictions for the Czech TV show *Survivor 2026*. The entire application lives in a single HTML file (`index.html`, ~1612 lines) with embedded CSS and JavaScript — no build tools, no dependencies, no framework.

**Language:** Czech (all UI text is in Czech; use UTF-8 and diacritical marks correctly)

There is no `package.json`, no build step, and no test runner. Deployment is simply hosting `index.html` as a static file. There are no build commands.

## Technology Stack

| Layer | Technology |
|---|---|
| Markup / Styling / Logic | HTML5, CSS3, Vanilla ES6+ JavaScript |
| Auth & Database | Firebase v10.12.0 (Auth + Firestore) |
| Email | EmailJS v4 |
| Fonts | Google Fonts (Bebas Neue, Barlow Condensed, Barlow) |
| Offline / PWA | Service Worker + Web App Manifest (generated inline) |

## Key Constants and Configuration

Defined near the top of the `<script>` block (~line 422):

| Constant | Value | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | `survivor2026admin` | Admin panel access |
| `WINNER_DEADLINE` | Feb 23 2026 20:00 | Deadline for basic winner pick |
| `BONUS_OPEN_DATE` | Feb 27 2026 00:00 | Date bonus betting unlocks |

**Firebase project:** `survivor-tipy` (config embedded in JS at line 413).

## Application Features

### Three Betting Categories

1. **Základní (Basic) — 100 Kč entry**
   - Predict the single season winner
   - Editable until `WINNER_DEADLINE`

2. **Týdenní (Weekly) — free**
   - Pick 2 contestants each week (one per tribe) to be eliminated
   - Admin creates/opens/closes each round and enters results
   - 1 point per correct guess, max 2 per week

3. **Bonus — 1000 Kč entry**
   - Rank 5 contestants who go furthest (`bonusFar`) and 5 eliminated first (`bonusOut`)
   - Scoring: exact position = 20 pts; correct contestant, wrong position = 10 pts
   - Unlocks on `BONUS_OPEN_DATE`

### Admin Panel

Password-protected. Admin actions:
- Mark contestants as eliminated (sets elimination order)
- Create weekly rounds with tribe names, nominees, and deadline
- Enter weekly elimination results (stored as `results[]` array per week)
- Toggle bonus betting open/closed

### Contestants

24 total, split into two tribes. Each entry has `id`, `name`, `desc`, `emoji`, and `tribe` fields:
- **Tribe `hrdinove` (Hrdinové):** Trabo, Vendy, Doki, Ondřej, Tereza, Nela, Matěj, Bára, Jura, Sára, Lukáš, Bety
- **Tribe `padousi` (Padouši):** Adam, Žofie, Johana, Ján, Simona, Eva, Iki, Viviane, Leoš, Otakar, Stanislav, Denisa

Helper functions: `getAllC()` returns all 24, `findById(id)` looks up a single contestant.

## Firestore Data Model

```
picks/{userId}
  nick: string
  winner: contestantId
  bonusFar: [id, id, id, id, id]
  bonusOut: [id, id, id, id, id]
  weekly: { [weekId]: { pick1: id, pick2: id } }
  updatedAt: timestamp

game/state
  eliminated: [{ id, order }]
  weeks: [{ id, name, tribe1, tribe2, nominees1[], nominees2[], deadline, results[], closed, open }]
  bonusOpen: boolean
```

## JavaScript Architecture

### Global State (~line 469)

```js
let currentUser = null;  // Firebase Auth user
let isAdmin = false;
let myData = {};         // current user's picks doc
let gameState = {};      // game/state doc (eliminated, weeks, bonusOpen)
let allPicks = {};       // all users' picks (for leaderboard)
let unsubPicks = null;   // Firestore onSnapshot unsubscribe fn
let unsubGame = null;
```

Picker UI state: `pickerMode` (`'winner'|'weekly'|'bonus-far'|'bonus-out'`), `pickerSlot`, `pickerSelected`.

### Key Helpers (~line 485)

```js
const $ = id => document.getElementById(id);  // shorthand used everywhere
const fakeEmail = n => /* normalizes nickname */ + '@survivor.vsazky';
```

Auth uses Firebase email/password with fake email addresses derived from nicknames — users never see or enter an email address.

### Data Flow

- Firestore `onSnapshot` on `picks/` and `game/state` drives all UI re-renders
- `initApp()` sets up listeners after login; `calcScore(data)` (~line 1188) computes per-user scoring
- `renderLeaderboard()` (~line 1262) ranks all users by score

### Conventions

- **No framework** — plain DOM manipulation with `querySelector` / `querySelectorAll`
- **No modules** — all code in a single inline `<script type="module">` tag
- **Naming:** camelCase for variables/functions; kebab-case for CSS classes and HTML IDs
- **Class prefixes:** `btn-`, `tribe-`, `week-`, `admin-`, `pick-`
- **localStorage** used only for PWA install-banner dismissal; all game state lives in Firestore
- **No transactions** — Firestore writes are not atomic; avoid concurrent admin operations

## CSS Design System

### Color Variables

```css
--sand:   #e8d5a3   /* light tan — primary background */
--dark:   #1a1209   /* dark brown — text */
--jungle: #2d4a1e   /* dark green — accents */
--fire:   #e85d04   /* orange — CTAs */
--gold:   #f4a522   /* bright gold — highlights */
--water:  #1a6fa8   /* blue */
--cream:  #fdf6e3   /* off-white — cards */
--muted:  #8a7a5a   /* gray-brown — secondary text */
--green:  #4a9e3a
--red:    #c0392b
```

### Layout Patterns

- CSS Grid with `auto-fill` + `minmax` for responsive card layouts
- Mobile breakpoint at `max-width: 600px`
- Safe-area insets (`env(safe-area-inset-*)`) for notched devices
- Glassmorphism via `backdrop-filter: blur()`

## Common Tasks

### Add or rename a contestant

Search for the `CONTESTANTS` object (~line 433) and update `id`, `name`, `desc`, `emoji`, and `tribe`. IDs are Firestore keys — changing an existing ID orphans stored picks.

### Change a deadline

Update `WINNER_DEADLINE` or `BONUS_OPEN_DATE` (~line 423). Both are `Date` objects; deadlines are in local Czech time.

### Adjust scoring

See `calcScore()` (~line 1188). Weekly hits and bonus position scoring are both computed there.

### Single file orientation

Use the `/* ═══ SECTION ═══ */` comment banners to navigate between logical sections (AUTH, STATE, HELPERS, SCORING, LEADERBOARD, etc.).
