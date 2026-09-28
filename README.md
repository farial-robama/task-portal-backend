# Taskboard API

REST API for **Taskboard**, a project and task management portal. Built with Node.js, Express, TypeScript and SQLite.

- **Live API:** https://task-portal-backend-aarf.onrender.com/api/health
- **Live app:** https://task-portal-frontend-tau.vercel.app
- **Frontend repository:** https://github.com/YOUR-USERNAME/task-portal-frontend

> **About the live demo:** the API runs on a free hosting tier. It sleeps after about 15 minutes idle, so the first request can take around a minute. Its filesystem is also reset on restart, so the database is recreated and re-seeded with a few sample tasks. For persistent data, run it locally or with Docker (see below).

## Tech stack

- Node.js 18+, Express 4, TypeScript
- SQLite via `better-sqlite3` (file-based, no separate database server)
- Zod for request validation
- Plain SQL migrations

## Project structure

```
backend/
├── migrations/
│   └── 001_create_tasks_table.sql   # database schema
├── src/
│   ├── controllers/                 # request handlers
│   ├── db/                          # connection, migration runner, demo seed
│   ├── middleware/                  # centralized error handling
│   ├── routes/                      # Express routers
│   ├── validators/                  # Zod schemas
│   ├── types.ts
│   └── index.ts                     # app entry point
├── .env.example
├── Dockerfile
└── package.json
```

## Getting started

### Prerequisites

- Node.js 18 or newer and npm
- `better-sqlite3` compiles a small native addon during `npm install`. If the install fails, you are usually missing build tools:
  - **Windows:** install the "Desktop development with C++" workload from the Visual Studio Build Tools
  - **macOS:** run `xcode-select --install`
  - **Linux:** install `python3`, `make` and `g++`

### Run locally

```bash
git clone https://github.com/YOUR-USERNAME/task-portal-backend.git
cd task-portal-backend
cp .env.example .env
npm install
npm run dev
```

The API starts at **http://localhost:4000**. On first run it creates `data/tasks.db` and applies the SQL migration automatically, so no manual database setup is needed.

Check it works: open http://localhost:4000/api/health. You should see `{"status":"ok", ...}`.

Then start the frontend: https://github.com/farial-robama/task-portal-frontend

### Production build

```bash
npm run build
npm start
```

### Run with Docker

```bash
docker build -t taskboard-api .
docker run -p 4000:4000 \
  -v taskboard-data:/app/data \
  -e CORS_ORIGIN=http://localhost:3000 \
  taskboard-api
```

The named volume `taskboard-data` keeps the SQLite file between container restarts.

## Environment variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Port the API listens on |
| `DATABASE_FILE` | `./data/tasks.db` | Path to the SQLite file (created automatically) |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin(s), comma-separated. Use the exact origin with no trailing slash |
| `SEED_DEMO_DATA` | `false` | When `true`, inserts sample tasks if the table is empty |

## Database

Each task has these fields:

| Field | Type | Notes |
|---|---|---|
| `id` | integer | Auto-increment primary key |
| `title` | text | Required, up to 120 characters |
| `description` | text | Optional, up to 2000 characters |
| `priority` | text | `Low`, `Medium` or `High` |
| `status` | text | `Pending`, `In Progress` or `Completed` |
| `created_at` | timestamp | Set on insert |
| `updated_at` | timestamp | Set on insert and on every update |

The schema is in [`migrations/001_create_tasks_table.sql`](migrations/001_create_tasks_table.sql). `CHECK` constraints enforce the priority and status values at the database level, and indexes cover status, priority and creation date. Migrations run automatically on startup and are safe to re-run.

## API reference

Base path: `/api`

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/health` | none | Health check |
| GET | `/tasks` | none | List tasks, newest first. Optional query params: `status`, `priority`, `search` |
| GET | `/tasks/:id` | none | Get one task |
| POST | `/tasks` | `{ title, description?, priority, status? }` | Create a task (201) |
| PUT | `/tasks/:id` | any subset of `{ title, description, priority, status }` | Update a task |
| PATCH | `/tasks/:id/status` | `{ status }` | Change status only |
| DELETE | `/tasks/:id` | none | Delete a task (204) |

Successful responses look like `{ "data": ... }`.

Errors look like `{ "error": "message" }`. Validation errors return status 400 with a `details` array of `{ field, message }`. A missing task returns 404.

### Example

```bash
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Set up CI","description":"Add GitHub Actions","priority":"High"}'
```

## Design notes

- **Validation:** all input is validated with Zod before it reaches the database. The database `CHECK` constraints act as a second safety net.
- **Error handling:** controllers are wrapped so any thrown error reaches one central handler, which returns consistent JSON errors and never leaks stack traces.
- **SQL safety:** every query uses prepared statements with bound parameters.
- **SQLite choice:** it keeps setup to a single command for reviewers. Moving to PostgreSQL would mean changing only `src/db` and the queries in the controller.

## AI usage disclosure

This project was developed with Claude (Anthropic) used as a supporting development assistant. AI was used to help understand the assignment requirements, plan the project structure, troubleshoot errors and build issues, and improve documentation.

The project was not entirely created by AI. I made the implementation decisions, reviewed and understood the suggested solutions, tested the application, fixed issues, handled deployment and configuration, and made the final design and code adjustments myself.

