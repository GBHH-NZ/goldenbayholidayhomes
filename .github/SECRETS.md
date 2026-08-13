# Repository secrets and variables

Add these under **Settings → Secrets and variables → Actions** before enabling Guesty sync or production deploy.

Secrets are encrypted; Variables are fine for non-sensitive public config.

## Secrets (Actions → Secrets)

| Name | Required | Used by | Description |
|------|----------|---------|-------------|
| `GUESTY_CLIENT_ID` | When syncing | `sync-guesty` | Guesty Booking Engine OAuth client id |
| `GUESTY_CLIENT_SECRET` | When syncing | `sync-guesty` | Guesty Booking Engine OAuth client secret |

Do **not** put Guesty credentials in the repo, `.env` commits, or `NEXT_PUBLIC_*` vars — they are server/CI-only.

## Variables (Actions → Variables)

| Name | Required | Default / example | Description |
|------|----------|-------------------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Recommended | `https://www.goldenbayholidayhomes.com` | Canonical site URL for metadata, sitemap, OG |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Recommended | `G-P4LBS4D2WW` | GA4 Measurement ID, inlined into the static export. The app also falls back to this ID if the variable is unset. |
| `GUESTY_API_BASE` | Optional | `https://booking-api.guesty.com` | Guesty Booking Engine API base |
| `BASE_PATH` | Recommended for custom domain | `none` | Empty asset prefix for www/apex DNS → Pages. Set `/goldenbayholidayhomes` only for project-URL preview on `*.github.io` |

**Custom domain (current):** set `BASE_PATH=none` and `NEXT_PUBLIC_SITE_URL=https://www.goldenbayholidayhomes.com`. Deploy builds assets at the domain root so CSS/JS load on `https://www.goldenbayholidayhomes.com/`.

**Project preview only:** set `BASE_PATH=/goldenbayholidayhomes` if you need styles on `https://gbhh-nz.github.io/goldenbayholidayhomes/` (without custom domain).

## Custom domain (GitHub Pages)

`www.goldenbayholidayhomes.com` is the canonical host (this is the domain with the working GitHub Pages certificate). GitHub redirects the apex `.com` → www.

1. Repo **Settings → Pages → Source = GitHub Actions** (not “Deploy from a branch”). Workflow [deploy-pages.yml](workflows/deploy-pages.yml) builds on pushes to `main`.
2. **Custom domain** → `www.goldenbayholidayhomes.com` → Enforce HTTPS
3. DNS at your registrar (typical):
   - `www` → CNAME → `gbhh-nz.github.io`
   - Apex `@` → A records `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153`
   - Apex `@` → AAAA records `2606:50c0:8000::153` `2606:50c0:8001::153` `2606:50c0:8002::153` `2606:50c0:8003::153`
4. `public/CNAME` ships `www.goldenbayholidayhomes.com` into the static export
5. After go-live: Google Search Console → add/verify `https://www.goldenbayholidayhomes.com` → submit `https://www.goldenbayholidayhomes.com/sitemap.xml`

Do not also attach `goldenbayholidayhomes.nz` as this site’s Pages custom domain — GitHub Pages allows only one.

## How they map into the app

Workflows export:

```yaml
env:
  GUESTY_CLIENT_ID: ${{ secrets.GUESTY_CLIENT_ID }}
  GUESTY_CLIENT_SECRET: ${{ secrets.GUESTY_CLIENT_SECRET }}
  GUESTY_API_BASE: ${{ vars.GUESTY_API_BASE || 'https://booking-api.guesty.com' }}
  NEXT_PUBLIC_SITE_URL: ${{ vars.NEXT_PUBLIC_SITE_URL || 'https://www.goldenbayholidayhomes.com' }}
  NEXT_PUBLIC_GA_MEASUREMENT_ID: ${{ vars.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-P4LBS4D2WW' }}
```

Local development still uses `.env.local` (gitignored). Copy from [`.env.example`](../.env.example).

## Adding secrets (UI)

1. Open the GitHub repo → **Settings**
2. **Secrets and variables** → **Actions**
3. **New repository secret** → name exactly as above → paste value → **Add secret**
4. **Variables** tab → **New repository variable** for `NEXT_PUBLIC_SITE_URL` (and optional others)

## When you receive Guesty keys

1. Add `GUESTY_CLIENT_ID` and `GUESTY_CLIENT_SECRET` as repository secrets
2. Run **Actions → Sync Guesty catalogue → Run workflow**
3. Review the PR that updates `content/homes.json` and merge

Catalogue sync never exposes secrets to the browser; only the committed JSON is public.
