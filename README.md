# AVISHU

Fashion franchise management system. Full-stack TypeScript monorepo: React + Vite frontend, Express backend, Drizzle ORM + PostgreSQL, role-based routing (client / franchise / production), JWT authentication.

---

## Project structure

```
/
├── artifacts/
│   ├── avishu/              # Frontend — React 19, Vite 7, Tailwind CSS v4
│   │   ├── src/
│   │   │   ├── pages/       # Role-specific pages
│   │   │   │   ├── client/
│   │   │   │   ├── franchise/
│   │   │   │   └── production/
│   │   │   ├── components/  # UI components and layouts
│   │   │   ├── contexts/    # LanguageContext (ru / kz / en)
│   │   │   └── lib/         # auth-token, utils
│   │   └── vite.config.ts
│   └── api-server/          # Backend — Express, TypeScript, esbuild
│       ├── src/
│       │   ├── routes/      # auth, products, orders, plans
│       │   └── lib/         # requireAuth middleware, logger
│       └── .env.example
└── lib/
    ├── db/                  # Drizzle ORM — schema and migrations
    ├── api-spec/            # OpenAPI specification
    ├── api-zod/             # Zod validation schemas
    └── api-client-react/    # React Query hooks (generated)
```

---

## Requirements

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **PostgreSQL** (local or remote)

```bash
# Install pnpm globally if not already installed
npm install -g pnpm
```

---

## Installation

```bash
# From the repository root — installs all workspace packages
pnpm install
```

> **Windows note**: `pnpm install` now correctly installs native binaries for
> rollup, lightningcss, esbuild, and @tailwindcss/oxide. If you had a previous
> install that missed them, delete `node_modules` (root and all packages) and
> re-run `pnpm install`.

---

## Environment variables

### Backend (`artifacts/api-server`)

Copy `.env.example` to `.env` and fill in your values:

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
```

```env
# Required — PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/avishu

# Optional — JWT / session secret (defaults to "avishu-dev-secret" if omitted)
SESSION_SECRET=change-me-to-a-long-random-string

# Optional — API server port (defaults to 8080 if omitted)
PORT=8080
```

The server loads `.env` automatically on startup via dotenv.

### Frontend (`artifacts/avishu`)

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Vite dev server port | `5173` |
| `BASE_PATH` | App base path | `/` |
| `VITE_API_URL` | Backend URL for the dev proxy | `http://localhost:8080` |

For local development the defaults are fine — no `.env` needed for the frontend.

---

## Running locally

Start each service in a **separate terminal**.

### 1. Backend

```bash
cd artifacts/api-server
pnpm dev
```

Works on Linux, macOS, and **Windows** (uses `cross-env` internally).
Server starts on `http://localhost:8080`.

### 2. Frontend

```bash
cd artifacts/avishu
pnpm dev
```

App opens at `http://localhost:5173`.
All `/api/*` requests are automatically proxied to `http://localhost:8080` — no CORS or cross-port issues.

---

## Database setup

Run migrations before first start:

```bash
cd lib/db
pnpm push
```

---

## Production build

```bash
# Build everything from the root
pnpm build
```

Individual builds:

```bash
# Backend
cd artifacts/api-server && pnpm build

# Frontend
cd artifacts/avishu && pnpm build
```

Frontend output: `artifacts/avishu/dist/public/`
Backend output: `artifacts/api-server/dist/index.mjs`

---

## User roles

| Role | Default route | Access |
|---|---|---|
| **client** | `/client` | Product catalogue, place and track orders |
| **franchise** | `/franchise` | Manage products, set sales plans |
| **production** | `/production` | Order board, update statuses |

Role is set at registration and encoded in the JWT token. Switching roles requires a new account.

**Demo credentials** (available on the login page):

| Email | Password | Role |
|---|---|---|
| `client@avishu.com` | `client123` | client |
| `franchise@avishu.com` | `franchise123` | franchise |
| `production@avishu.com` | `production123` | production |

---

## Language

The UI supports **Русский**, **Қазақша**, and **English**. The switcher is in the header on every page. Selection is saved to `localStorage`.

---

## Windows — common issues

### Blank screen after login

**Cause**: Vite dev server was not proxying `/api` requests to the backend, so
all API calls returned an HTML page instead of JSON, causing React Query to see
an error and reset the user to `null`.

**Fixed**: `vite.config.ts` now configures a dev-server proxy (`server.proxy`)
that forwards every `/api/*` request to `http://localhost:8080` when running
outside Replit. No changes needed on your end — just run `pnpm dev`.

### `export: command not found` when starting the backend

**Cause**: The original `dev` script used `export NODE_ENV=...` which is a
POSIX shell built-in not available in Windows CMD or PowerShell.

**Fixed**: The script now uses `cross-env NODE_ENV=development pnpm run build && pnpm run start`, which works on all platforms.

### `Cannot find module '../lightningcss.win32-x64-msvc.node'`

**Cause**: `pnpm-workspace.yaml` had overrides that explicitly blocked Windows-
native packages (`lightningcss-win32-x64-msvc`, `@rollup/rollup-win32-x64-msvc`,
`@esbuild/win32-x64`, `@tailwindcss/oxide-win32-x64-msvc`).

**Fixed**: Those overrides have been removed. Run `pnpm install` to get the
correct native binaries for your platform.

### `DATABASE_URL must be set`

Create `artifacts/api-server/.env` (see [Environment variables](#environment-variables) above).

---

## Clean GitHub handoff

The repository is ready to clone and run. Checklist before pushing:

1. **Do not commit secrets** — `.env` files are in `.gitignore` by default.
   Commit only `.env.example`.
2. **Lockfile** — commit `pnpm-lock.yaml` so teammates get identical versions.
3. **Node version** — add a `.nvmrc` or `engines` field if you want to enforce
   Node ≥ 20.
4. **Database** — provide a PostgreSQL instance URL and run `pnpm push` from
   `lib/db/` after clone.
5. **Environment** — copy `.env.example` → `.env` in `artifacts/api-server/`
   and fill in values.
6. **Start** — run `pnpm install` then start both services as described above.
