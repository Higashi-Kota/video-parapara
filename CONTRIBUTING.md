# Development Guide

## Prerequisites

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | 24.x | [nodejs.org](https://nodejs.org/) |
| pnpm | 10.13.1 | `npm install -g pnpm@10.13.1` |
| Docker | latest | [docker.com](https://www.docker.com/) |
| FFmpeg | any | `apt install ffmpeg` / `brew install ffmpeg` |

```bash
# Verify installation
node -v    # v24.x
pnpm -v    # 10.x
docker -v  # Docker version x.x
ffmpeg -version
```

---

## Development Setup

### Option 1: Docker (Recommended)

すべてのサービスをDockerで起動。環境の一貫性を保証。

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment
cp .env.example .env
# Edit .env: Set LOCAL_STORAGE_PATH to absolute path

# 3. Start infrastructure
docker compose up -d postgres dragonfly

# 4. Build packages and push schema
pnpm build:prepare
pnpm db:push

# 5. Start backend services
docker compose up -d backend-api backend-worker

# 6. Verify
curl http://localhost:3001/health
# {"status":"ok"}
```

### Option 2: Local Development

PostgreSQL/DragonflyDBはDockerで、アプリケーションはローカルで実行。

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment
cp .env.example .env
# Edit .env: Set LOCAL_STORAGE_PATH to absolute path

# 3. Start infrastructure only
docker compose up -d postgres dragonfly

# 4. Build packages and push schema
pnpm build:prepare
pnpm db:push

# 5. Create storage directory
mkdir -p storage

# 6. Start services (separate terminals)
pnpm dev:backend:api      # Terminal 1: API server
pnpm dev:backend:worker   # Terminal 2: Worker
pnpm dev:frontend         # Terminal 3: Frontend (optional)

# 7. Verify
curl http://localhost:3001/health
```

---

## Environment Variables

### .env.example (Development)

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/video_extractor

# Queue
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:5173

# Storage
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=/absolute/path/to/storage

# Frontend
VITE_API_BASE_URL=http://localhost:3001
```

### Production Environment

Render.comなどへのデプロイ時:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render default) |
| `DATABASE_URL` | Render PostgreSQL connection string |
| `REDIS_URL` | Render Redis connection string |
| `STORAGE_TYPE` | `r2` |
| `R2_ENDPOINT` | Cloudflare R2 endpoint |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret |
| `R2_BUCKET` | Bucket name |
| `CORS_ORIGIN` | Frontend URL |

---

## Testing API

```bash
# Health check
curl http://localhost:3001/health

# Upload video
curl -X POST http://localhost:3001/api/videos \
  -F "video=@fixtures/test.mp4;type=video/mp4"

# Start extraction (replace VIDEO_ID)
curl -X POST http://localhost:3001/api/extract \
  -H "Content-Type: application/json" \
  -d '{"videoId": "VIDEO_ID"}'

# Check job status (replace JOB_ID)
curl http://localhost:3001/api/extract/JOB_ID

# Download frames as ZIP
curl -o frames.zip "http://localhost:3001/api/frames/download?jobId=JOB_ID"
```

---

## Commands Reference

### Development

| Command | Description |
|---------|-------------|
| `pnpm dev:frontend` | Start frontend dev server (port 5173) |
| `pnpm dev:backend:api` | Start backend API server (port 3001) |
| `pnpm dev:backend:worker` | Start background worker |

### Build

| Command | Description |
|---------|-------------|
| `pnpm build:prepare` | Generate types + build packages |
| `pnpm build` | Build all apps |
| `pnpm build:frontend` | Build frontend only |
| `pnpm build:backend` | Build backend only |

### Database

| Command | Description |
|---------|-------------|
| `pnpm db:push` | Push schema to database |
| `pnpm db:generate` | Generate migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Drizzle Studio |

### Quality

| Command | Description |
|---------|-------------|
| `pnpm typecheck` | Run type checking |
| `pnpm lint` | Run linter |
| `pnpm lint:fix` | Fix lint issues |

### Clean

| Command | Description |
|---------|-------------|
| `pnpm clean:build` | Remove build artifacts |
| `pnpm clean:all` | Full clean (node_modules + build) |

---

## Docker Commands

### Build Images

```bash
# Build all
docker compose build

# Build specific service
docker compose build backend-api
docker compose build backend-worker

# Build production images
docker build -f Dockerfile.api.backend -t backend-api:prod --target production-api .
docker build -f Dockerfile.worker.backend -t backend-worker:prod --target production-worker .
```

### Service Management

```bash
# Start all services
docker compose up -d

# Start specific services
docker compose up -d postgres dragonfly
docker compose up -d backend-api backend-worker

# View logs
docker compose logs -f backend-api
docker compose logs -f backend-worker

# Stop services
docker compose down

# Full cleanup (including volumes)
docker compose down -v
```

---

## Troubleshooting

### DATABASE_URL environment variable is required

```bash
cp .env.example .env
# Ensure DATABASE_URL is set
```

### Database Connection Refused

```bash
docker compose up -d postgres
docker compose exec postgres pg_isready -U postgres
```

### BullMQ Lua Script Error

DragonflyDBとBullMQの互換性問題。`docker-compose.yml`に以下が必要:

```yaml
dragonfly:
  command: dragonfly --default_lua_flags=allow-undeclared-keys
```

### FFmpeg Not Found

```bash
# System ffmpeg check
which ffmpeg
ffmpeg -version

# Install (Ubuntu)
sudo apt install ffmpeg

# Install (macOS)
brew install ffmpeg
```

### Storage Path Issues

`LOCAL_STORAGE_PATH`は**絶対パス**を使用:

```env
# NG
LOCAL_STORAGE_PATH=./storage

# OK
LOCAL_STORAGE_PATH=/home/user/project/storage
```

### Permission Denied (Docker)

Development modeでは`USER appuser`を使用しないため、volume mount時の権限問題は解消。

### Build Errors

```bash
pnpm clean:all
pnpm install
pnpm build:prepare
```

---

## Full Cleanup

```bash
# Stop processes
pkill -f "tsx" 2>/dev/null || true

# Stop Docker containers and remove volumes
docker compose down -v

# Remove build artifacts and dependencies
pnpm clean:all

# Remove local data
rm -rf storage/ .env
```
