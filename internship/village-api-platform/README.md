# CapStone

> India's most complete geographic data API — 600,000+ villages, 766 districts, and 36 states & UTs with sub-100ms cached responses.

---

## Live Deployment

| Service | URL | Status |
|---|---|---|
| **Frontend App** | https://frontend-virid-ten-21.vercel.app | ![live](https://img.shields.io/badge/status-live-brightgreen) |
| **Backend API** | https://backend-theta-two-68.vercel.app | ![live](https://img.shields.io/badge/status-live-brightgreen) |
| **Health Check** | https://backend-theta-two-68.vercel.app/health | ![live](https://img.shields.io/badge/status-live-brightgreen) |
| **Readiness Check** | https://backend-theta-two-68.vercel.app/ready | ![live](https://img.shields.io/badge/status-live-brightgreen) |
| **API Root** | https://backend-theta-two-68.vercel.app/ | ![live](https://img.shields.io/badge/status-live-brightgreen) |

---

## Demo Credentials

### Admin Account

| Field | Value |
|---|---|
| **Login URL** | https://frontend-virid-ten-21.vercel.app/login |
| **Email** | `admin@villageapi.in` |
| **Password** | `Admin@123456` |
| **Role** | `ADMIN` |
| **Plan** | `PRO` — full system access |

Admin access includes: user management, all API keys, request logs, system analytics, cache flush.

### Client Account (sign up free)

| Field | Value |
|---|---|
| **Register URL** | https://frontend-virid-ten-21.vercel.app/register |
| **Plan** | `FREE` — 1,000 API calls/day |
| **Upgrade** | Available via dashboard |

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [API Reference](#api-reference)
6. [Frontend Pages](#frontend-pages)
7. [Authentication Flow](#authentication-flow)
8. [ETL Pipeline](#etl-pipeline)
9. [Environment Variables](#environment-variables)
10. [Local Development](#local-development)
11. [Deployment](#deployment)

---

## Overview

The Village API Platform provides structured, hierarchical access to India's complete geographic dataset sourced from the 2011 Census. It is designed for B2B clients (developers, companies) who need reliable village-level data for applications such as logistics, fintech, agritech, and government services.

**Key capabilities:**
- Hierarchical geography browsing: Country → State → District → Sub-District → Village
- Full-text village search with `pg_trgm` trigram indexing
- Autocomplete endpoint for search-as-you-type UIs
- API key + secret authentication with per-key rate limiting
- Redis-backed caching (Upstash) for sub-100ms responses
- Role-based access: `ADMIN` and `CLIENT`
- Usage analytics per API key and per user
- Admin dashboard to manage users, keys, logs, and cache

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                                  │
│                    https://frontend-virid-ten-21.vercel.app                  │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │  HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE NETWORK (CDN)                            │
│                      Static Assets  +  SPA Rewrite Rule                      │
│                     (React build served from /dist)                           │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │  API calls via VITE_API_URL
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       VERCEL SERVERLESS FUNCTIONS                             │
│               https://backend-theta-two-68.vercel.app                        │
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐  │
│   │                      Express.js Application                           │  │
│   │                                                                       │  │
│   │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌─────────────┐ │  │
│   │  │  Auth        │  │  Geography   │  │   Search   │  │   Admin     │ │  │
│   │  │  Routes      │  │  Routes      │  │   Routes   │  │   Routes    │ │  │
│   │  │  /api/auth   │  │  /api/v1     │  │ /api/v1/   │  │ /api/admin  │ │  │
│   │  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  └──────┬──────┘ │  │
│   │         │                 │                 │                │        │  │
│   │         └─────────────────┴─────────────────┴────────────────┘        │  │
│   │                                    │                                   │  │
│   │                    ┌───────────────▼──────────────┐                   │  │
│   │                    │     Middleware Pipeline        │                  │  │
│   │                    │  Helmet → CORS → Rate Limit   │                  │  │
│   │                    │  → API Key Auth → Validate    │                  │  │
│   │                    └───────────────┬───────────────┘                  │  │
│   │                                    │                                   │  │
│   │              ┌─────────────────────┴─────────────────────┐            │  │
│   │              │                                           │            │  │
│   │   ┌──────────▼──────────┐                   ┌───────────▼─────────┐  │  │
│   │   │   Prisma ORM Client │                   │   Cache Service     │  │  │
│   │   │   (PostgreSQL)      │                   │   (Upstash Redis)   │  │  │
│   │   └──────────┬──────────┘                   └───────────┬─────────┘  │  │
│   └──────────────┼──────────────────────────────────────────┼────────────┘  │
└──────────────────┼──────────────────────────────────────────┼───────────────┘
                   │                                          │
                   ▼                                          ▼
  ┌─────────────────────────────┐           ┌─────────────────────────────────┐
  │       NeonDB (PostgreSQL)    │           │       Upstash (Redis)            │
  │  ap-southeast-1 (Singapore) │           │     REST API  ·  Global Edge     │
  │                              │           │                                  │
  │  Tables:                     │           │  Cache Keys:                     │
  │  • countries                 │           │  • states:{page}                 │
  │  • states (36)               │           │  • districts:{state}:{page}      │
  │  • districts (766)           │           │  • villages:{subDistrict}:{page} │
  │  • sub_districts             │           │  • search:{query}                │
  │  • villages (600K+)          │           │  • apikey:{key}  (24h TTL)       │
  │  • users                     │           │  • ratelimit:{key}:{date}        │
  │  • api_keys                  │           │                                  │
  │  • api_logs                  │           └─────────────────────────────────┘
  │  • user_state_access         │
  └─────────────────────────────┘
```

### Request Flow — Geography API Call

```
Browser / Client App
        │
        │  GET /api/v1/states
        │  Headers: X-API-Key: vaip_xxx
        │           X-API-Secret: sec_xxx
        ▼
  Vercel Serverless
        │
        ├─► API Key Middleware
        │        │
        │        ├─► Redis cache hit? ──YES──► return cached keyData
        │        │                                    │
        │        └─► NO → Prisma DB lookup            │
        │                  validate key/secret        │
        │                  write to Redis             │
        │                                             │
        ├─► Rate Limit Check (Redis counter)          │
        │        daily_usage < daily_limit? ──────────┘
        │
        ├─► Geography Controller
        │        │
        │        ├─► Redis cache hit? ──YES──► 200 JSON (cache hit)
        │        │
        │        └─► NO → Prisma query PostgreSQL
        │                  write result to Redis
        │                  200 JSON (cache miss)
        │
        └─► Request logged to api_logs table
```

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4 |
| ORM | Prisma 5 |
| Database | PostgreSQL (NeonDB — serverless) |
| Cache | Upstash Redis (REST API) |
| Auth | JWT (access 15m + refresh 7d) + bcrypt |
| Validation | express-validator |
| Logging | Winston + daily rotate |
| Security | Helmet, CORS, express-rate-limit |
| Deployment | Vercel Serverless Functions |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build | Vite 5 |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| HTTP | Axios |
| Charts | Recharts |
| Deployment | Vercel CDN (static) |

### ETL Pipeline
| Layer | Technology |
|---|---|
| Language | Python 3.12 |
| Data parsing | pandas + openpyxl |
| DB writer | psycopg2-binary |
| Source data | All-India Villages Master List (2011 Census, Excel) |

---

## Project Structure

```
village-api-platform/
│
├── backend/                        # Express.js API server
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema (all models)
│   │   ├── seed.js                 # Seed admin user + country
│   │   └── createIndexes.js        # pg_trgm + performance indexes
│   ├── src/
│   │   ├── app.js                  # Express app entry point
│   │   ├── config/
│   │   │   ├── database.js         # Prisma client singleton
│   │   │   ├── env.js              # Validated env vars
│   │   │   └── redis.js            # Upstash Redis client
│   │   ├── controllers/            # Request handlers
│   │   ├── middleware/             # Auth, rate limit, CORS, logger
│   │   ├── repositories/           # DB query layer
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── b2b.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── v1/
│   │   │       ├── geography.routes.js
│   │   │       └── search.routes.js
│   │   ├── services/               # Business logic layer
│   │   ├── utils/                  # Helpers (errors, response, crypto)
│   │   └── validators/             # express-validator rule sets
│   ├── .env.example
│   └── vercel.json
│
├── frontend/                       # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx                 # Routes + auth guards
│   │   ├── pages/
│   │   │   ├── auth/               # Login, Register
│   │   │   ├── b2b/                # Dashboard, ApiKeys, Analytics, Explorer
│   │   │   └── admin/              # Dashboard, Users, ApiKeys, Logs
│   │   ├── components/
│   │   │   ├── layout/             # Layout, Sidebar
│   │   │   ├── ui/                 # Button, Card, Input, Modal, Toast, Table
│   │   │   └── charts/             # UsageChart (Recharts)
│   │   ├── services/api.js         # Axios instance + all API calls
│   │   ├── store/authStore.js      # Zustand auth state
│   │   ├── hooks/useApi.js         # Data fetching hook
│   │   └── index.css               # Tailwind + custom utilities
│   ├── vercel.json                 # SPA rewrite rule
│   └── vite.config.js
│
└── etl/                            # Python data pipeline
    ├── pipeline.py                 # Main orchestrator
    ├── loaders.py                  # PostgreSQL batch writer
    ├── transformers.py             # Excel → structured rows
    ├── validators.py               # Data quality checks
    ├── config.py                   # DB connection + settings
    └── requirements.txt
```

---

## API Reference

**Base URL:** `https://backend-theta-two-68.vercel.app`

### System Endpoints (no auth)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API info + available endpoints |
| `GET` | `/health` | Liveness check — returns `{"status":"healthy"}` |
| `GET` | `/ready` | Readiness check — verifies DB connection |

**Health response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-05-15T08:40:54.266Z",
  "version": "1.0.0",
  "environment": "production"
}
```

---

### Auth Endpoints — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register new client account |
| `POST` | `/api/auth/login` | None | Login, returns JWT pair |
| `POST` | `/api/auth/refresh` | Refresh token | Rotate access token |
| `POST` | `/api/auth/logout` | Bearer JWT | Invalidate session |
| `GET` | `/api/auth/profile` | Bearer JWT | Get own profile |
| `PUT` | `/api/auth/profile` | Bearer JWT | Update name / company |
| `PUT` | `/api/auth/change-password` | Bearer JWT | Change password |

**Rate limits:** 20 requests / 15 min (auth), 10 requests / 15 min (login)

**Login request:**
```json
POST /api/auth/login
{
  "email": "user@company.com",
  "password": "YourPassword123!"
}
```

**Login response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "Ravi", "email": "...", "role": "CLIENT", "planType": "FREE" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### Geography Endpoints — `/api/v1`

> All geography routes require `X-API-Key` and `X-API-Secret` headers.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/states` | List all states & UTs |
| `GET` | `/api/v1/states/:stateCode/districts` | Districts of a state |
| `GET` | `/api/v1/states/:stateCode/districts/:districtCode/subdistricts` | Sub-districts of a district |
| `GET` | `/api/v1/states/:stateCode/districts/:districtCode/subdistricts/:subDistrictCode/villages` | Villages of a sub-district |

**Query params (all list endpoints):**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Results per page (max 100) |

**Example request:**
```bash
curl https://backend-theta-two-68.vercel.app/api/v1/states \
  -H "X-API-Key: vaip_your_key" \
  -H "X-API-Secret: sec_your_secret"
```

**Example response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "code": "AP", "name": "Andhra Pradesh" },
    { "id": 2, "code": "AR", "name": "Arunachal Pradesh" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 36,
    "totalPages": 2
  }
}
```

---

### Search Endpoints — `/api/v1/search`

> Requires `X-API-Key` and `X-API-Secret` headers.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/search/villages` | Full-text village search across India |
| `GET` | `/api/v1/search/autocomplete` | Prefix-match for search-as-you-type |

**Search params:**

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string | Yes | Search query (min 2 chars) |
| `state` | string | No | Filter by state code |
| `district` | string | No | Filter by district code |
| `page` | integer | No | Page number |
| `limit` | integer | No | Results per page |

**Example:**
```bash
curl "https://backend-theta-two-68.vercel.app/api/v1/search/villages?q=krishna&state=AP" \
  -H "X-API-Key: vaip_your_key" \
  -H "X-API-Secret: sec_your_secret"
```

---

### B2B Client Endpoints — `/api/b2b`

> Requires Bearer JWT in `Authorization` header. Role: `CLIENT`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/b2b/dashboard` | Usage stats, active keys, today's calls |
| `GET` | `/api/b2b/analytics` | Historical usage data per day |
| `POST` | `/api/b2b/api-keys` | Create a new API key + secret |
| `GET` | `/api/b2b/api-keys` | List own API keys |
| `DELETE` | `/api/b2b/api-keys/:id` | Revoke an API key |
| `PUT` | `/api/b2b/plan` | Upgrade subscription plan |

---

### Admin Endpoints — `/api/admin`

> Requires Bearer JWT. Role: `ADMIN` only.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/users` | List all users (paginated) |
| `GET` | `/api/admin/users/:id` | Get user detail |
| `PUT` | `/api/admin/users/:id` | Update user role / plan / status |
| `GET` | `/api/admin/api-keys` | List all API keys in system |
| `POST` | `/api/admin/users/:userId/api-keys` | Create key on behalf of user |
| `GET` | `/api/admin/stats` | System-wide stats |
| `GET` | `/api/admin/analytics/daily` | Daily request volume |
| `GET` | `/api/admin/analytics/endpoints` | Top-hit endpoints |
| `GET` | `/api/admin/logs` | Full API request log |
| `POST` | `/api/admin/cache/flush` | Flush geography cache in Redis |

---

### Rate Limits & Plans

| Plan | Daily Limit | Use Case |
|---|---|---|
| `FREE` | 1,000 req/day | Development & testing |
| `PREMIUM` | 10,000 req/day | Small production apps |
| `PRO` | 100,000 req/day | Mid-scale platforms |
| `UNLIMITED` | Unlimited | Enterprise |

Rate limit enforcement uses a Redis counter keyed by `ratelimit:{apiKeyId}:{YYYY-MM-DD}`, resetting at midnight UTC.

---

## Frontend Pages

| Route | Component | Access | Description |
|---|---|---|---|
| `/login` | `Login.jsx` | Public | Sign-in with email + password |
| `/register` | `Register.jsx` | Public | Create free account |
| `/dashboard` | `B2BDashboard.jsx` | Client | Usage overview, quick stats |
| `/dashboard/api-keys` | `ApiKeys.jsx` | Client | Create & revoke API keys |
| `/dashboard/analytics` | `Analytics.jsx` | Client | Usage charts (Recharts) |
| `/dashboard/explorer` | `Explorer.jsx` | Client | Interactive API playground |
| `/admin` | `AdminDashboard.jsx` | Admin | System stats overview |
| `/admin/users` | `AdminUsers.jsx` | Admin | Manage users & plans |
| `/admin/api-keys` | `AdminApiKeys.jsx` | Admin | Manage all API keys |
| `/admin/logs` | `AdminApiLogs.jsx` | Admin | Live API request log |

---

## Authentication Flow

```
┌──────────┐          ┌──────────────┐          ┌──────────────────┐
│  Browser │          │  Backend API │          │   PostgreSQL DB  │
└────┬─────┘          └──────┬───────┘          └────────┬─────────┘
     │                       │                           │
     │  POST /api/auth/login │                           │
     │──────────────────────►│                           │
     │                       │  SELECT user WHERE email  │
     │                       │──────────────────────────►│
     │                       │◄──────────────────────────│
     │                       │  bcrypt.compare(password) │
     │                       │  sign accessToken  (15m)  │
     │                       │  sign refreshToken (7d)   │
     │◄──────────────────────│                           │
     │  { accessToken,       │                           │
     │    refreshToken }     │                           │
     │                       │                           │
     │  GET /api/b2b/...     │                           │
     │  Authorization: Bearer {accessToken}              │
     │──────────────────────►│                           │
     │                       │  jwt.verify(token)        │
     │◄──────────────────────│                           │
     │  200 data             │                           │
     │                       │                           │
     │  (access token expires after 15 minutes)          │
     │                       │                           │
     │  POST /api/auth/refresh                           │
     │  { refreshToken }     │                           │
     │──────────────────────►│                           │
     │                       │  verify refresh token     │
     │                       │  issue new access token   │
     │◄──────────────────────│                           │
     │  { accessToken }      │                           │
```

---

## ETL Pipeline

The ETL pipeline loads the All-India Villages Master List (2011 Census, Excel format) into PostgreSQL.

```
Excel Files (.xls / .ods)
  per state, e.g. Rdir_2011_28_ANDHRA_PRADESH.xls
          │
          ▼
  transformers.py
  ─────────────
  • Read each sheet with pandas
  • Extract state / district / sub-district / village columns
  • Normalize names (strip whitespace, title-case)
  • Assign hierarchy codes
          │
          ▼
  validators.py
  ─────────────
  • Check for missing required fields
  • Deduplicate village codes within sub-district
  • Log errors to etl_errors.csv
          │
          ▼
  loaders.py
  ──────────
  • Upsert states, districts, sub-districts, villages
  • Batch inserts (1000 rows/batch) via psycopg2
  • Skips existing records (ON CONFLICT DO NOTHING)
          │
          ▼
  NeonDB PostgreSQL
  (600K+ village rows)
```

**Run the pipeline:**
```bash
cd etl
pip install -r requirements.txt
cp ../backend/.env.example .env   # add DATABASE_URL
python pipeline.py
```

---

## Environment Variables

### Backend

Copy `backend/.env.example` to `backend/.env` and fill in values.

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `production` or `development` |
| `DATABASE_URL` | Yes | NeonDB PostgreSQL connection string |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis REST token |
| `JWT_ACCESS_SECRET` | Yes | Secret for access tokens (64+ chars) |
| `JWT_REFRESH_SECRET` | Yes | Secret for refresh tokens (64+ chars) |
| `JWT_ACCESS_EXPIRES_IN` | Yes | e.g. `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Yes | e.g. `7d` |
| `BCRYPT_ROUNDS` | Yes | Password hashing rounds (12 recommended) |
| `CORS_ORIGIN` | Yes | Frontend URL (e.g. `https://frontend-virid-ten-21.vercel.app`) |
| `API_VERSION` | Yes | `v1` |
| `FREE_DAILY_LIMIT` | No | Default `1000` |
| `PREMIUM_DAILY_LIMIT` | No | Default `10000` |
| `PRO_DAILY_LIMIT` | No | Default `100000` |
| `UNLIMITED_DAILY_LIMIT` | No | Default `999999999` |
| `CACHE_TTL_STATES` | No | Seconds, default `3600` |
| `CACHE_TTL_DISTRICTS` | No | Seconds, default `3600` |
| `CACHE_TTL_SUBDISTRICTS` | No | Seconds, default `1800` |
| `CACHE_TTL_VILLAGES` | No | Seconds, default `900` |
| `CACHE_TTL_SEARCH` | No | Seconds, default `300` |
| `CACHE_TTL_AUTOCOMPLETE` | No | Seconds, default `300` |
| `CACHE_TTL_APIKEY` | No | Seconds, default `86400` |

**Generate JWT secrets:**
```bash
openssl rand -base64 64
```

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL, e.g. `https://backend-theta-two-68.vercel.app/api` |

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.12+ (for ETL only)
- A PostgreSQL database (NeonDB free tier works)
- An Upstash Redis instance (free tier works)

### Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DB, Redis, JWT values

# Push schema to database
npx prisma db push

# Create performance indexes
node prisma/createIndexes.js

# Seed admin user and country
node prisma/seed.js

# Start dev server (port 4000)
npm run dev
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "VITE_API_URL=http://localhost:4000/api" > .env.local

# Start dev server (port 5173, proxies /api → 4000)
npm run dev
```

Open `http://localhost:5173` in your browser.

**Demo credentials:**
```
Email:    admin@villageapi.in
Password: Admin@123456
```

---

## Deployment

Both services are deployed on Vercel. Deployments are manual via Vercel CLI.

### Redeploy backend
```bash
cd backend
npx vercel --prod
```

### Redeploy frontend
```bash
cd frontend
npx vercel --prod
```

### Set / update environment variables
```bash
# Add a variable
npx vercel env add DATABASE_URL production

# Remove a variable
npx vercel env rm DATABASE_URL production

# List all variables
npx vercel env ls
```

### One-time database setup (after first deploy)
```bash
cd backend
npx prisma db push          # create tables
node prisma/createIndexes.js # trigram + perf indexes
node prisma/seed.js          # admin user
```

---

## Database Schema

```
countries ──< states ──< districts ──< sub_districts ──< villages
                │
                └──< user_state_access >── users ──< api_keys ──< api_logs
```

| Table | Rows (approx) | Key columns |
|---|---|---|
| `countries` | 1 | `code`, `name` |
| `states` | 36 | `code`, `name`, `countryId` |
| `districts` | 766 | `code`, `name`, `stateId` |
| `sub_districts` | ~6,000 | `code`, `name`, `districtId` |
| `villages` | ~600,000 | `code`, `name`, `subDistrictId` |
| `users` | — | `email`, `role`, `planType` |
| `api_keys` | — | `key`, `secretHash`, `dailyLimit` |
| `api_logs` | — | `endpoint`, `statusCode`, `responseTime`, `cacheHit` |

---

## License

MIT — see `LICENSE` for details.
