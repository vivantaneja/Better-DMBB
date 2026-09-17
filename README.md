# Men's Basketball Dublin

An **independent, unofficial** website presenting Dublin men's basketball
fixtures, competitions and tables in a format that reads well on a phone.

> This project is not affiliated with, endorsed by, or connected to the Dublin
> Men's Basketball Board (DMBB). The official site is <https://dmbb.ie>.

## Before you deploy this publicly

Read [`docs/data-permission.md`](docs/data-permission.md) first. Short version:

- `dmbb.ie/robots.txt` says `User-agent: * / Disallow: /`.
- Live scraping is therefore **off by default** and must stay off until the
  board gives written permission.
- Send the draft in [`docs/permission-email.md`](docs/permission-email.md) and
  keep the reply.
- Set `NEXT_PUBLIC_CONTACT_EMAIL` so takedown requests reach a human. The About
  page shows a visible warning until you do.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Zod for payload validation, Cheerio for parsing (only when sync is enabled)

## Data modes

| Mode | `DMBB_LIVE_SYNC` | Behaviour |
| --- | --- | --- |
| `snapshot` (default) | unset / `false` | Serves `src/lib/data/snapshot.json`. No network calls. |
| `live` | `true` | Additionally refreshes from dmbb.ie in the background, bounded to 4 concurrent requests with an identifying user-agent. Never blocks a page render. |

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Commands

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — lint
- `npm run prisma:generate` — generate Prisma client

## Routes

| Route | Notes |
| --- | --- |
| `/` | Upcoming fixtures and recent results |
| `/fixtures-results` | Full schedule |
| `/competitions` | Leagues / Cups / Shields tabs |
| `/competitions/[id]` | Table or bracket, plus fixtures |
| `/news` | Empty unless news is published |
| `/about` | Unofficial-status disclaimer and takedown route |
| `/terms`, `/privacy` | Legal pages |
| `/api/health` | Data mode and record counts |

## Things deliberately not done

- **No invented data.** An earlier version shipped a hardcoded fallback result
  ("Rathmines BC 78–94 Eanna BC") that displayed as a real score whenever the
  scrape returned nothing. Every gap is now an honest empty state.
- **No DMBB logo or crest.** The mark in `public/` is original.
- **No "official" framing** in titles, metadata or copy.
