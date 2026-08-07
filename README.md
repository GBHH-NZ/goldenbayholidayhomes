# Golden Bay Holiday Homes

Marketing-site rebuild of [goldenbayholidayhomes.nz](https://www.goldenbayholidayhomes.nz/) in Next.js.

Book CTAs deep-link to the Guesty booking engine. Listing photos are mirrored locally from the former Wix site until Guesty catalogue sync fills full galleries.

Static export is enabled for **GitHub Pages** hosting (`out/`).

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Ops app (staff / property management)

Separate Vite app under [`ops/`](ops/) — mock auth and seed data for now; Firebase later.

```bash
cd ops
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173/ops/](http://localhost:5173/ops/). Login: `test` / `test` (hash route `#/login`). See [ops/README.md](ops/README.md).

## GitHub secrets and variables

API credentials must live in GitHub Actions secrets — never in the repo.

Full checklist: **[.github/SECRETS.md](.github/SECRETS.md)**

| Kind | Name | Purpose |
|------|------|---------|
| Secret | `GUESTY_CLIENT_ID` | Guesty OAuth (sync workflow) |
| Secret | `GUESTY_CLIENT_SECRET` | Guesty OAuth (sync workflow) |
| Variable | `NEXT_PUBLIC_SITE_URL` | Canonical URL / SEO |
| Variable | `GUESTY_API_BASE` | Optional API host override |
| Variable | `BASE_PATH` | Unset → `/goldenbayholidayhomes` (project Pages); set `none` after www DNS cutover |

Workflows already wired:

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — lint + build (injects secrets/vars as env)
- [`.github/workflows/sync-guesty.yml`](.github/workflows/sync-guesty.yml) — sync catalogue → PR
- [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) — build `out/` → GitHub Pages

After pushing the repo: **Settings → Pages → Source = GitHub Actions**.

Preview: `https://agent5479.github.io/goldenbayholidayhomes/` (needs non-empty `BASE_PATH` so CSS loads). For www cutover, see [.github/SECRETS.md](.github/SECRETS.md) (`BASE_PATH=none` + DNS to GitHub Pages).

## Guesty catalogue sync (when keys arrive)

1. Add `GUESTY_CLIENT_ID` and `GUESTY_CLIENT_SECRET` as repository secrets
2. Either locally:

```bash
# .env.local with the same keys
npm run sync:guesty
```

   Or on GitHub: **Actions → Sync Guesty catalogue → Run workflow**

3. Merge the PR that updates `content/homes.json`

Until then, homes use Wix-scraped title/location/guests/pets with empty placeholders for API fields (`syncStatus: "seed"`).

## Content

| Path | Role |
|------|------|
| `content/homes.json` | Catalogue (seed + Guesty sync) |
| `content/pages/` | Marketing page JSON |
| `content/blog/` | MDX posts |
| `content/explore/` | Attractions |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Static export to `out/` |
| `npm run seed:homes` | Regenerate Wix seed into `homes.json` |
| `npm run scrape:wix-images` | Pull listing card photo URLs from the live Wix site into `homes.json` (pre-cutover) |
| `npm run mirror:wix-assets` | Download remote Wix CDN images into `public/images/` and rewrite content to local paths |
| `npm run sync:guesty` | Pull listings from Guesty (needs keys) |

## Contacts

- +64 20 4141 7230 · 0800 150 810
- admin@gbholidayhomes.co.nz
- Booking engine: https://goldenbayholidayhomes.guestybookings.com/en
- Owner login: https://goldenbayholidayhomes.guestyowners.com/login
