# Everything App Starter

[![License](https://img.shields.io/github/license/RafiulM/everything-app-starter)](https://github.com/RafiulM/everything-app-starter) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Drizzle](https://img.shields.io/badge/ORM-Drizzle-00A99D) ![Docker](https://img.shields.io/badge/Docker-ready-2496ED) [![CI](https://img.shields.io/badge/CI-pending-lightgrey)](#)

A modern full‑stack starter built on Next.js 15 (App Router) with authentication, PostgreSQL via Drizzle ORM, Tailwind CSS v4, and a polished UI kit (shadcn/ui). It includes Docker support, ready‑to‑use database scripts, and a clean structure that’s friendly for both humans and AI coding agents.


## Table of Contents
- Project Overview
- Key Features
- Tech Stack
- Getting Started
- Environment Variables
- Database & Migrations
- Available Scripts
- Project Structure
- Docker (Dev & Prod)
- Deployment
- Additional Docs
- Contributing


## Project Overview
This template accelerates building authenticated, data‑driven Next.js apps. It ships with Better Auth for session management, Drizzle ORM for type‑safe SQL, and a curated set of shadcn/ui components with dark mode.


## Key Features
- Authentication with Better Auth (email/password)
- PostgreSQL + Drizzle ORM with migrations
- Tailwind CSS v4 and shadcn/ui (New York style)
- Dark mode via next‑themes
- App Router with Turbopack
- First‑class Docker support (dev and prod)
- Opinionated structure and scripts


## Tech Stack
- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Auth: Better Auth
- Database: PostgreSQL + Drizzle ORM
- Styling: Tailwind CSS v4
- UI: shadcn/ui + Lucide icons


## Getting Started

### Prerequisites
- Node.js 18+
- Docker + Docker Compose (for database and optional app container)

### 1) Install
```bash
npm install
```

### 2) Configure environment
Copy `.env.example` to `.env` and adjust as needed:
```bash
cp .env.example .env
```
The default values work with the provided Docker setup.

### 3) Run the app
```bash
# Start Postgres for local dev (port 5433)
npm run db:dev

# In a separate terminal, start Next.js
npm run dev
```
Open http://localhost:3000


## Environment Variables
These are the important variables (see `.env.example` for defaults):
```env
# Database (defaults for Docker dev DB on 5433)
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/postgres
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Authentication
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```


## Database & Migrations
Use Drizzle Kit for schema management.

- Start Postgres in Docker (dev): `npm run db:dev`
- Push schema to the DB: `npm run db:push`
- Generate migrations: `npm run db:generate`
- Open Drizzle Studio: `npm run db:studio`
- Reset DB (dangerous): `npm run db:reset`

Production Postgres runs on port 5432 via `postgres` service; dev DB runs on 5433 via `postgres-dev` profile.


## Available Scripts
- `npm run dev` – Start Next.js with Turbopack
- `npm run build` – Build app
- `npm start` – Start production server
- `npm run lint` – Run ESLint

Database
- `npm run db:up` – Start Postgres (5432)
- `npm run db:down` – Stop Postgres
- `npm run db:dev` – Start dev Postgres (5433)
- `npm run db:dev-down` – Stop dev Postgres
- `npm run db:push` – Apply schema to DB
- `npm run db:generate` – Generate migration files
- `npm run db:studio` – Drizzle Studio
- `npm run db:reset` – Drop and recreate tables

Docker
- `npm run docker:build` – Build application image
- `npm run docker:up` – Start app + Postgres
- `npm run docker:down` – Stop all containers
- `npm run docker:logs` – Tail containers logs


## Project Structure
```
app/                  # Next.js app router (pages, layouts)
components/           # Reusable UI components (shadcn/ui + custom)
db/                   # Drizzle ORM configuration and schemas
docker/               # Docker assets (e.g., Postgres init SQL)
documentation/        # Project docs and generated guides
drizzle/              # Generated migration artifacts
hooks/                # Custom React hooks
lib/                  # Auth, utilities, etc.
public/               # Static assets
```

Notable files:
- `drizzle.config.ts` – Drizzle configuration
- `docker-compose.yaml` – Services for app and databases
- `.env.example` – Environment template


## Docker (Dev & Prod)
The `docker-compose.yaml` defines:
- `postgres` – Production‑like DB on 5432
- `postgres-dev` – Dev DB on 5433 (profile: `dev`)
- `app` – Next.js app container on 3000

Quick dev flow:
```bash
npm run db:dev      # start Postgres on 5433
npm run dev         # run app locally
```

Full stack in containers:
```bash
npm run docker:up
npm run docker:logs
npm run docker:down
```


## Deployment

### Option 1: Docker Compose (VPS/Server)
1) Copy `.env.example` to `.env` and set production values.
2) Run `npm run docker:up` to launch `app` and `postgres`.

### Option 2: Vercel + Managed DB
1) Deploy the Next.js app to Vercel.
2) Add environment variables in Vercel.
3) Run Drizzle migrations against your managed Postgres: `npm run db:push`.

Production tips:
- Use strong secrets and HTTPS.
- Prefer managed Postgres (RDS/Cloud SQL/etc.).
- Consider Next.js `output: "standalone"` for smaller images.


## Additional Docs
- `documentation/tech_stack_document.md`
- `documentation/project_requirements_document.md`
- `documentation/frontend_guidelines_document.md`
- `documentation/backend_structure_document.md`
- `documentation/security_guideline_document.md`
- `documentation/app_flow_document.md` and `documentation/app_flowchart.md`


## Contributing
Contributions welcome! Please open an issue or pull request on GitHub.
