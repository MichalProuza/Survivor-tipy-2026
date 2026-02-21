# CLAUDE.md — Survivor-tipy-2026

This file provides guidance for AI assistants working on this repository.

## Project Overview

**Survivor-tipy-2026** is a Progressive Web App (PWA) for managing betting predictions for the Czech TV show *Survivor 2026*. The entire application lives in a single HTML file (`index.html`) with embedded CSS and JavaScript — no build tools, no dependencies, no framework.

**Language:** Czech (all UI text is in Czech; use UTF-8 and diacritical marks correctly)

## Repository Structure

```
Survivor-tipy-2026/
├── index.html    # Complete application (HTML + CSS + JS, ~1600 lines)
└── CLAUDE.md     # This file
```

There is no `package.json`, no build step, and no test runner. Deployment is simply hosting `index.html` as a static file.

## Technology Stack

| Layer | Technology |
|---|---|
| Markup / Styling / Logic | HTML5, CSS3, Vanilla ES6+ JavaScript |
| Auth & Database | Firebase v10.12.0 (Auth + Firestore) |
| Email | EmailJS v4 |
| Fonts | Google Fonts (Bebas Neue, Barlow Condensed, Barlow) |
| Offline / PWA | Service Worker + Web App Manifest (generated inline) |

## Key Constants and Configuration

These values are defined near the top of the `<script>` block in `index.html`:

| Constant | Value | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | `survivor2026admin` | Admin panel access |
| `WINNER_DEADLINE` | Feb 20 2026 23:59 | Deadline for basic winner pick |
| `BONUS_OPEN_DATE` | Feb 27 2026 00:00 | Date bonus betting unlocks |

**Firebase project:** `survivor-tipy` (config embedded in JS around line 412).

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
   - Rank 5 contestants who go furthest (bonusFar) and 5 eliminated first (bonusOut)
   - Scoring: exact position = 20 pts; correct contestant, wrong position = 10 pts
   - Unlocks on `BONUS_OPEN_DATE`

### Admin Panel

Password-protected (`survivor2026admin`). Admin actions:
- Mark contestants as eliminated (sets elimination order)
- Create weekly rounds with tribe names, nominees, and deadline
- Enter weekly elimination results
- Toggle bonus betting open/closed

### Contestants

24 total across two categories:
- **Celebs (7):** Trabo, Adam, Vendy, Doki, Ondřej, Žofie, Johana
- **Civilians (17):** Tereza, Nela, Matěj, Bára, Jura, Ján, Simona, Eva, Sára, Lukáš, Bety, Iki, Viviane, Leoš, Otakar, Stanislav, Denisa

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
  weeks: [{ id, name, tribe1, tribe2, nominees1[], nominees2[], deadline, result1, result2, open }]
  bonusOpen: boolean
```

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

## JavaScript Conventions

- **No framework** — plain DOM manipulation with `querySelector` / `querySelectorAll`
- **No modules** — all code in a single inline `<script>` tag
- **Real-time data** — Firestore `onSnapshot` listeners re-render on every change
- **Naming:** camelCase for variables/functions; kebab-case for CSS classes and HTML IDs
- **Class prefixes:** `btn-`, `tribe-`, `week-`, `admin-`, `pick-`
- **State storage:** `localStorage` used only for PWA install-banner dismissal; all game state lives in Firestore
- **Auth:** Firebase Auth (email/password); nickname stored in Firestore, not in the auth profile

## Development Workflow

### Making Changes

1. Edit `index.html` directly — there is no compile or transpile step.
2. Open `index.html` in a browser (or via a local server) to test immediately.
3. Firebase credentials are embedded; the live Firebase project is used even in local development.

### No Build Commands

There are no `npm`, `yarn`, `make`, or other build commands. The file is served as-is.

### Testing

There is no automated test suite. Verify changes manually in a browser. Test:
- User registration and login flow
- Each betting tab (Základní, Týdenní, Bonus)
- Admin panel actions (mark eliminated, create week, set results)
- Responsive layout at mobile widths
- PWA install banner behavior

## Common Tasks

### Add or rename a contestant

Search for the `contestants` array (near line 432) and update the `id`, `name`, and `type` fields. IDs are used as Firestore keys, so changing an existing ID will orphan stored picks.

### Change a deadline

Update `WINNER_DEADLINE` or `BONUS_OPEN_DATE` constants. Both are `Date` objects constructed inline.

### Add a new weekly round

Done at runtime via the Admin Panel. No code change required.

### Adjust scoring

See the leaderboard calculation block around lines 1182–1251. Weekly hits and bonus position scoring are both computed there.

### Update Firebase config

Replace the `firebaseConfig` object (~line 412) with new credentials. Never commit production credentials to a public repository.

## Important Warnings

- **Sensitive data in source:** The Firebase API key and admin password are hardcoded in `index.html`. For a public repo, move secrets to environment variables or a server-side layer.
- **Single file:** All HTML, CSS, and JS are in one file. Keep related sections together and use the existing comment delimiters to orient yourself.
- **Czech text:** UI strings must use correct Czech diacritics. Double-check any auto-generated text.
- **Date arithmetic:** Deadlines are in local time (Czech timezone expected). Be careful when comparing `Date` objects.
- **No transactions:** Firestore writes are not atomic. Avoid concurrent admin operations that could leave state inconsistent.
