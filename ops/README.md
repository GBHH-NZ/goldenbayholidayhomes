# GBHH Ops

Staff & property operations app for Golden Bay Holiday Homes (cleaners, maintenance, turnovers).

Separate Vite + React SPA from the marketing site. Uses a **mock backend** by default so UI and features can be built before Firebase is connected.

## Quick start

```bash
cd ops
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173/ops/](http://localhost:5173/ops/).

Staff login URL: [http://localhost:5173/ops/#/login](http://localhost:5173/ops/#/login)

> **Note:** Routing uses hash URLs (`#/login`, `#/dashboard`, …) so deep links work on GitHub Pages (no server-side SPA fallback).

| Username | Password | Role / job |
|----------|----------|------------|
| `test` | `test` | Manager |
| `sarah` | `sarah` | Staff · Cleaner |
| `mike` | `mike` | Staff · Maintenance |
| `ana` | `ana` | Staff · Cleaner |

Seed data includes Golden Bay–style properties, schedules, work logs, task templates (with ETA rules), team, and checklists.

## Architecture

- **UI** → `AuthContext` / `TenantDataContext`
- **Adapters** → `MockAuthAdapter` + `MockDataAdapter` (default) or Firebase stubs
- Switch with `VITE_DATA_BACKEND=mock|firebase`

Tenant path shape (Firebase RTDB-compatible):

```
tenants/{tenantId}/properties|workLogs|scheduledTasks|taskTemplates|employees|visits|taskGroups|checklists
```

Offline writes go through IndexedDB optimistic cache + a pending queue (`syncManager`), flushed via the active `DataAdapter`.

## Firebase later

1. Create a Firebase project (Auth + Realtime Database).
2. Add GitHub Actions secrets / local `.env` from `.env.example` (`VITE_FIREBASE_*`).
3. Set `VITE_DATA_BACKEND=firebase`.
4. Implement real logic in:
   - [`src/adapters/auth/FirebaseAuthAdapter.ts`](src/adapters/auth/FirebaseAuthAdapter.ts)
   - [`src/adapters/data/FirebaseDataAdapter.ts`](src/adapters/data/FirebaseDataAdapter.ts)
5. Add 2FA and Apps Script (`VITE_APPS_SCRIPT_URL`) when ready.

Do **not** commit Firebase secrets.

## Staged backlog

Visible as **Coming soon** on the manager Overview (not built yet). Each item needs secrets / external services before wiring.

| Feature | Intention | Dependencies |
|---------|-----------|--------------|
| **Booking turnovers** | Auto-create schedules from Guesty check-out / check-in windows | Guesty API credentials; property ID mapping; Firebase Auth + RTDB (or mock→live adapter) |
| **Reminders** | Email / SMS / push for overdue & due-today | Apps Script web app URL (`VITE_APPS_SCRIPT_URL`); contact fields on employees; optional FCM later |
| **Calendars** | Sync staff + property calendars | Google Calendar OAuth or Apps Script; per-staff calendar IDs; property calendar mapping |

Until then, managers assign turnovers manually on Schedule, and staff complete on **My day** with optional note / flag / mock photo.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 5173, base `/ops/`) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Reference

Baseline patterns came from `../demosuite/` (CareMarshall). This app uses holiday-homes domain naming and a proper adapter layer for Firebase.
