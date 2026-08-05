# Golden Bay Holiday Homes

Marketing-site rebuild of [goldenbayholidayhomes.nz](https://www.goldenbayholidayhomes.nz/) in Next.js.

Book CTAs deep-link to the Guesty booking engine. Listing photos, descriptions, amenities, and Guesty IDs are **placeholders** until you run catalogue sync with API keys.

Static export is enabled for **GitHub Pages** hosting (`out/`).

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## GitHub secrets and variables

API credentials must live in GitHub Actions secrets — never in the repo.

Full checklist: **[.github/SECRETS.md](.github/SECRETS.md)**

| Kind | Name | Purpose |
|------|------|---------|
| Secret | `GUESTY_CLIENT_ID` | Guesty OAuth (sync workflow) |
| Secret | `GUESTY_CLIENT_SECRET` | Guesty OAuth (sync workflow) |
| Variable | `NEXT_PUBLIC_SITE_URL` | Canonical URL / SEO |
| Variable | `GUESTY_API_BASE` | Optional API host override |
| Variable | `BASE_PATH` | Only if using `username.github.io/repo` |

Workflows already wired:

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — lint + build (injects secrets/vars as env)
- [`.github/workflows/sync-guesty.yml`](.github/workflows/sync-guesty.yml) — sync catalogue → PR
- [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) — build `out/` → GitHub Pages

After pushing the repo: **Settings → Pages → Source = GitHub Actions**.

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
| `npm run scrape:wix-images` | Temporarily pull listing card photos from the live Wix site into `homes.json` |
| `npm run sync:guesty` | Pull listings from Guesty (needs keys) |

## Contacts

- +64 20 4141 7230 · 0800 150 810
- admin@gbholidayhomes.co.nz
- Booking engine: https://goldenbayholidayhomes.guestybookings.com/en
- Owner login: https://goldenbayholidayhomes.guestyowners.com/login
