# Video Frame Extractor

動画ファイルから1秒ごとにパラパラ画像（フレーム）を切り出すWebアプリケーション。

## Features

- 動画アップロード (MP4, WebM, MOV, AVI対応、最大1分)
- 1秒間隔でのフレーム自動抽出
- 抽出フレームのプレビュー
- ZIPでの一括ダウンロード
- 非同期ジョブ処理（BullMQ）

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4 |
| Backend | Node.js 24, Express 5, TypeScript 5.9, FFmpeg |
| Database | PostgreSQL 16, Drizzle ORM |
| Queue | BullMQ, Redis |
| Storage | Local / Cloudflare R2 |

## Quick Start (Docker)

```bash
# 1. Clone and install
git clone https://github.com/your-org/video-frame-extractor.git
cd video-frame-extractor
pnpm install

# 2. Setup environment
cp .env.example .env
# Edit .env: Set LOCAL_STORAGE_PATH to absolute path

# 3. Start infrastructure
docker compose up -d postgres redis

# 4. Build and push schema
pnpm build:prepare
pnpm db:push

# 5. Start backend services
docker compose up -d backend-api backend-worker

# 6. Verify
curl http://localhost:3001/health
# {"status":"ok"}
```

## Project Structure

```
video-frame-extractor/
├── frontend/
│   ├── apps/web-app/        # React application
│   └── packages/
│       ├── api-client/      # Generated API client
│       └── ui/              # Shared UI components
├── backend/
│   ├── apps/
│   │   ├── server/          # Express API server (port 3001)
│   │   └── worker/          # BullMQ job worker
│   └── packages/
│       ├── database/        # Drizzle ORM schemas
│       ├── storage/         # R2/local storage
│       ├── video/           # FFmpeg processing
│       └── queue/           # BullMQ configuration
├── specs/                   # TypeSpec API specifications
├── Dockerfile.frontend      # Frontend production build
├── Dockerfile.api.backend   # API server Docker
├── Dockerfile.worker.backend # Worker Docker
└── docker-compose.yml       # Development environment
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev:backend:api` | Start API server (port 3001) |
| `pnpm dev:backend:worker` | Start job worker |
| `pnpm dev:frontend` | Start frontend (port 5173) |
| `pnpm build` | Build all |
| `pnpm generate` | Generate API types from TypeSpec |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm typecheck` | Type check |
| `pnpm lint` | Lint |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/videos` | Upload video |
| GET | `/api/videos` | List videos |
| POST | `/api/extract` | Start extraction |
| GET | `/api/extract/:jobId` | Get job status |
| GET | `/api/frames/download` | Download as ZIP |

## Environment Variables

See `.env.example` for all variables. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection |
| `STORAGE_TYPE` | `local` or `r2` |
| `LOCAL_STORAGE_PATH` | Absolute path for local storage |

## Docker Images

| Image | Dockerfile | Target |
|-------|------------|--------|
| Frontend | `Dockerfile.frontend` | `production` |
| Backend API | `Dockerfile.api.backend` | `production-api` |
| Backend Worker | `Dockerfile.worker.backend` | `production-worker` |

### Build Production Images

```bash
docker build -f Dockerfile.api.backend -t backend-api:latest --target production-api .
docker build -f Dockerfile.worker.backend -t backend-worker:latest --target production-worker .
docker build -f Dockerfile.frontend -t frontend:latest --target production .
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see [LICENSE](LICENSE)
