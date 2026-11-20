[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/azizfai/gta6-trophy-guide-01-v3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/azizfai/gta6-trophy-guide-01-v3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI, all 55 PS5 trophies

An unofficial, offline fan guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze. Every trophy is shown with its official name, description and grade, a guide written in our own words that cites its sources, a roadmap to the platinum, and a checklist tracker that saves in your browser.

Referral code: `p5tm223q`

## What it does

- **Tracker** — tick trophies off as you earn them; progress saves in localStorage, and you can export it to a `.json` file and import it back. Filters by kind (story, side quests, collectibles, activities, secrets), by grade, by missable-only and earned-only, plus a search box.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap** — four stages in order: story → heists & duo work → open-world grind → cleanup & 100%. Built from the official trophy descriptions.
- **Missable flag** — exactly one trophy can be missed: **Positive Mental Attitude** needs all 18 meditation spots, and one spot is in Chapter 1 and vanishes when Chapter 1 ends. Do it first.
- **Cited guides** — every trophy's guide names its sources beside it (Exophase for the official list, PSNProfiles for PSN-tracked counts, PowerPyx and GTA Zone for methods). Five methods are marked **UNCONFIRMED** where no published guide has yet pinned the method down, instead of inventing one.

## How to run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. The app is static files under `app/` with no build step and makes no network requests, so it works with the network off.

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the guide and tracker
- `app/data/trophies.json` — all 55 trophies with official name, description, grade, kind, roadmap stage, missable flag and cited guide
- `main.ts` — entrypoint: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` (it clears only the output directory's contents, never the directory itself)
- `serve.ts` — tiny static server for local use
- `screenshots/` — 4 real renders of the app
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## Sources

- Exophase — GTA VI trophy list (official names, descriptions, grades)
- PSNProfiles — GTA VI trophy list (PSN-tracked counts)
- PowerPyx — GTA 6 Trophy Guide & Roadmap
- GTA Zone — GTA 6 trophy list

Unofficial fan guide. Not affiliated with, endorsed by or connected to Rockstar Games, Take-Two Interactive, Sony or PlayStation. No Rockstar artwork, logos or game screenshots are used. All guide text is written for this guide; sources are cited, never copied.
