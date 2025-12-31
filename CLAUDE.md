# Video Frame Extractor Development Guide

動画ファイルから1秒ごとにパラパラ画像を切り出すWebアプリケーション。

## Tech Stack

**Frontend**: React 19 / Vite 7 / TypeScript 5.9 (strict) / Tailwind CSS 4 / Biome 2 / ts-pattern 5 / Lucide React

**Backend**: Node.js 24 / Express 5 / TypeScript 5.9 / Drizzle ORM / BullMQ / FFmpeg

**Infrastructure**: PostgreSQL 16 / DragonflyDB (Redis互換) / Cloudflare R2 (本番) / Docker

## Project Structure

```
video-frame-extractor/
├── frontend/
│   ├── apps/web-app/        # Main React application
│   └── packages/
│       ├── api-client/      # Generated API client (Orval)
│       └── ui/              # Shared UI components
├── backend/
│   ├── apps/
│   │   ├── server/          # Express API server
│   │   └── worker/          # BullMQ job worker
│   └── packages/
│       ├── database/        # Drizzle ORM schemas
│       ├── storage/         # R2/local storage abstraction
│       ├── video/           # FFmpeg processing
│       ├── queue/           # BullMQ job queue
│       └── generated/       # Generated backend types
├── specs/                   # TypeSpec API specifications
└── docker-compose.yml       # Development environment
```

## Docker Files

| File | Purpose | Targets |
|------|---------|---------|
| `Dockerfile.frontend` | Frontend build | `production` |
| `Dockerfile.api.backend` | API server | `development-api`, `production-api` |
| `Dockerfile.worker.backend` | Job worker | `development-worker`, `production-worker` |

## Commands

```bash
# Setup
pnpm install                # Install dependencies
pnpm build:prepare          # Generate types + build packages

# Development (Docker - Recommended)
docker compose up -d postgres dragonfly  # Start infrastructure
pnpm db:push                             # Push schema
docker compose up -d backend-api backend-worker  # Start backend

# Development (Local)
pnpm dev:backend:api        # Start API server (port 3001)
pnpm dev:backend:worker     # Start job worker
pnpm dev:frontend           # Start frontend (port 5173)

# Database
pnpm db:push                # Push schema to database
pnpm db:generate            # Generate migrations
pnpm db:migrate             # Run migrations
pnpm db:studio              # Open Drizzle Studio

# Validation
pnpm typecheck              # Type check (must be 0 errors)
pnpm lint                   # Lint (must be 0 warnings)
pnpm lint:fix               # Fix lint issues

# Build
pnpm build                  # Build all
pnpm build:frontend         # Build frontend only
pnpm build:backend          # Build backend only

# Code Generation
pnpm generate               # Generate API types from TypeSpec
```

## Environment Variables

### Backend (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgres://user:pass@localhost:5432/video_extractor` |
| `REDIS_URL` | Redis/DragonflyDB connection | `redis://localhost:6379` |
| `STORAGE_TYPE` | Storage backend | `local` or `r2` |
| `LOCAL_STORAGE_PATH` | Local storage path (absolute) | `/path/to/storage` |

### Backend (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

### R2 Storage (Production)

| Variable | Description |
|----------|-------------|
| `R2_ENDPOINT` | R2 endpoint URL |
| `R2_ACCESS_KEY_ID` | Access key |
| `R2_SECRET_ACCESS_KEY` | Secret key |
| `R2_BUCKET` | Bucket name |

### Frontend (Build-time)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/videos` | List all videos |
| POST | `/api/videos` | Upload video (max 1 min) |
| GET | `/api/videos/:id` | Get video info |
| DELETE | `/api/videos/:id` | Delete video |
| POST | `/api/extract` | Start extraction job |
| GET | `/api/extract/:jobId` | Get job status |
| DELETE | `/api/extract/:jobId` | Cancel job |
| GET | `/api/frames` | List extracted frames |
| GET | `/api/frames/download` | Download as ZIP |

## Known Issues

| Issue | Solution |
|-------|----------|
| DragonflyDB + BullMQ compatibility | `--default_lua_flags=allow-undeclared-keys` |
| ESM dotenv load order | Use `env.ts` with top-level import |
| ffmpeg-static binary missing | Falls back to system ffmpeg |
| Relative storage path issues | Use absolute path for `LOCAL_STORAGE_PATH` |
