# Survivor Tipy 2026

Tipovací soutěž pro česko-slovenský Survivor 2026 — Progressive Web App (PWA) postavená na jediném HTML souboru.

## O projektu

Aplikace umožňuje skupině přátel tipovat výsledky reality show *Survivor Česko & Slovensko V 2026*. Soutěžící se registrují přezdívkou, tipují vítěze, týdenní vyřazené a bonusové pořadí. Výsledky a skóre jsou sdíleny v reálném čase přes Firebase Firestore.

## Funkce

### Tři kategorie tipů

| Kategorie | Vklad | Popis |
|---|---|---|
| **Základní** | 100 Kč | Tip na celkového vítěze sezóny (uzávěrka 23. 2. 2026) |
| **Týdenní** | zdarma | Každý týden 2 tipy na vyřazené (1 bod za správný tip) |
| **Bonus** | 1 000 Kč | Pořadí 5 nejdéle hrajících a 5 nejdříve vyřazených (10–20 bodů za tip) |

### Administrace

Správce s heslem může:
- Označovat vyřazené soutěžící
- Vytvářet a uzavírat týdenní kola
- Zadávat výsledky kol
- Otevírat/zavírat bonusové sázení

## Technologie

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+) — bez frameworků, bez build kroků
- **Backend:** Firebase v10 (Authentication + Firestore)
- **Email:** EmailJS v4
- **PWA:** Service Worker + Web App Manifest (inline)
- **Fonty:** Google Fonts (Bebas Neue, Barlow Condensed, Barlow)

## Nasazení

Aplikace je jediný soubor `index.html` — stačí ho hostovat jako statický soubor (GitHub Pages, Netlify, Firebase Hosting, …).

```
index.html   ← celá aplikace (HTML + CSS + JS)
```

Žádný `npm install`, žádný build, žádné závislosti.

## Soutěžící

**24 hráčů** rozdělených do dvou kmenů:

| Hrdinové | Padouši |
|---|---|
| Trabo, Vendy, Doki, Ondřej, Tereza, Nela, Matěj, Bára, Jura, Sára, Lukáš, Bety | Adam, Žofie, Johana, Ján, Simona, Eva, Iki, Viviane, Leoš, Otakar, Stanislav, Denisa |

## Datový model (Firestore)

```
picks/{userId}        ← tipy každého hráče
game/state            ← stav hry (vyřazení, kola, bonus)
```

## Vývoj

Veškerý kód je v `index.html`. Navigace po souboru pomocí komentářových bannerů:

```
/* ═══ SECTION ═══ */
```

Klíčové sekce: AUTH → STATE → HELPERS → SCORING → LEADERBOARD

### Konstanty

```js
ADMIN_PASSWORD  = 'survivor2026admin'
WINNER_DEADLINE = 23. 2. 2026 20:00
BONUS_OPEN_DATE = 27. 2. 2026 00:00
```

### Skórování

Logika výpočtu skóre je v `calcScore()` (~řádek 1178):
- Týdenní: 1 bod za každý správný tip
- Bonus (přesná pozice): 20 bodů; správný hráč, špatná pozice: 10 bodů
