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
| `NEXT_PUBLIC_SITE_URL` | Recommended | `https://gbhh-nz.github.io/goldenbayholidayhomes` (pre-cutover) or `https://www.goldenbayholidayhomes.nz` | Canonical site URL for metadata, sitemap, OG |
| `GUESTY_API_BASE` | Optional | `https://booking-api.guesty.com` | Guesty Booking Engine API base |
| `BASE_PATH` | Optional | *(unset → `/goldenbayholidayhomes`)* | Asset prefix for project Pages. Set to `none` when www DNS points at GitHub Pages (root) |

**Pre-cutover (current):** leave `BASE_PATH` unset. Deploy uses `/goldenbayholidayhomes` so CSS/JS load on `https://gbhh-nz.github.io/goldenbayholidayhomes/`.

**Custom-domain cutover:** set `BASE_PATH=none`, set `NEXT_PUBLIC_SITE_URL=https://www.goldenbayholidayhomes.nz`, point DNS at GitHub Pages, then redeploy.

## Custom domain (GitHub Pages)

1. Repo **Settings → Pages → Custom domain** → `www.goldenbayholidayhomes.nz` → Enforce HTTPS
2. DNS at your registrar (typical):
   - `www` → CNAME → `gbhh-nz.github.io`
   - Apex `@` → A records for GitHub Pages (or ALIAS/ANAME to `www` if supported)
3. `public/CNAME` ships `www.goldenbayholidayhomes.nz` into the static export
4. After go-live: Google Search Console → add/verify `https://www.goldenbayholidayhomes.nz` → submit `https://www.goldenbayholidayhomes.nz/sitemap.xml`

## How they map into the app

Workflows export:

```yaml
env:
  GUESTY_CLIENT_ID: ${{ secrets.GUESTY_CLIENT_ID }}
  GUESTY_CLIENT_SECRET: ${{ secrets.GUESTY_CLIENT_SECRET }}
  GUESTY_API_BASE: ${{ vars.GUESTY_API_BASE || 'https://booking-api.guesty.com' }}
  NEXT_PUBLIC_SITE_URL: ${{ vars.NEXT_PUBLIC_SITE_URL || 'https://www.goldenbayholidayhomes.nz' }}
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
