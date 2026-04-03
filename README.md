# TEFast

Monorepo scaffold with:

- `frontend`: Next.js app running on Bun
- `backend`: monolithic TypeScript service running on Bun
- `turbo`: task orchestration for monorepo workflows
- `postgres`: PostgreSQL 16
- `redis`: Redis 7
- Docker-based local deployment

## Project Structure

```text
.
├── backend
│   ├── public
│   ├── src
│   │   ├── app.ts
│   │   ├── routes
│   │   ├── schemas
│   │   └── utils
│   └── views
├── frontend
└── docker-compose.yml
```

## Local Commands

```bash
bun install

bun run dev
bun run build
bun run check
```

Run a single app when needed:

```bash
bun run dev:frontend
bun run dev:backend
```

## Docker

```bash
docker compose up --build
```

Default services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Backend health: `http://localhost:3001/health`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
