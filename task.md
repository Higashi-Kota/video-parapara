# タスク一覧: 動画フレーム抽出アプリケーション

## 現在の実装状況サマリー

| コンポーネント | 状態 | 完成度 |
|---------------|------|--------|
| Backend API Routes | ✅ 実装済み | 100% |
| Worker System | ✅ 実装済み | 100% |
| Database Schema | ✅ 実装済み | 100% |
| Storage (Local + R2) | ✅ 実装済み | 100% |
| Video Processing | ✅ 実装済み | 100% |
| Queue System | ✅ 実装済み | 100% |
| API自動生成 (Orval/openapi-typescript) | ✅ 実装済み | 100% |
| Frontend UI | ✅ 実装済み | 100% |
| Docker本番構成 | ✅ 実装済み | 100% |

---

## Phase 1: バックエンド動作確認 ✅ 完了

- [x] Docker Compose起動 (PostgreSQL + Redis)
- [x] DBスキーマ反映
- [x] APIサーバー起動・動作確認
- [x] ワーカー起動・ジョブ処理確認
- [x] フレーム抽出・ZIPダウンロード確認

---

## Phase 2: Frontend実装

### 2.1 API Client自動生成 ✅ 完了
**構成**:
- TypeSpec → OpenAPI (`pnpm generate:spec`)
- OpenAPI → Frontend hooks (`pnpm generate:api` / Orval + React Query)
- OpenAPI → Backend types (`pnpm generate:backend` / openapi-typescript + Zod)

**生成コマンド**: `pnpm generate`

**生成されるファイル**:
- `frontend/packages/api-client/src/generated/` - React Query hooks + 型定義
- `backend/packages/generated/src/` - API型定義 + Zodスキーマ

### 2.2 UIコンポーネント ✅ 完了
**対象**: `frontend/packages/ui/src/`

- [x] Card コンポーネント
- [x] Progress コンポーネント
- [x] Spinner/Loading コンポーネント
- [x] DropZone コンポーネント

### 2.3 ページ実装 ✅ 完了
**対象**: `frontend/apps/web-app/src/`

- [x] ホームページ (動画アップロード + 一覧)
- [x] フレーム抽出・進捗表示
- [x] フレームギャラリー
- [x] ZIPダウンロード

---

## Phase 3: Docker + Renderデプロイ

### 3.1 Dockerコンテナ化 ✅ 完了
- [x] `Dockerfile.frontend` 本番ビルド確認
- [x] `Dockerfile.api.backend` API用本番ビルド確認
- [x] `Dockerfile.worker.backend` Worker用本番ビルド確認
- [x] `docker-compose.yml` 更新 (開発環境)

### 3.2 Render設定
- [ ] `render.yaml` 作成
  - [ ] Frontend (Static Site or Web Service)
  - [ ] Backend API (Web Service)
  - [ ] Backend Worker (Background Worker)
  - [ ] PostgreSQL (Render Postgres)
  - [ ] Redis (Render Redis)
- [ ] 環境変数設定
- [ ] ヘルスチェック設定

### 3.3 デプロイ確認
- [ ] Renderへデプロイ
- [ ] 本番環境で動作確認

---

## 優先度

| 優先度 | タスク | 状態 |
|--------|--------|------|
| ~~P0~~ | バックエンド動作確認 | ✅ 完了 |
| ~~P0~~ | Frontend API Client自動生成 | ✅ 完了 |
| ~~P0~~ | Frontend UI | ✅ 完了 |
| ~~P1~~ | Docker本番構成 | ✅ 完了 |
| **P1** | Renderデプロイ | 未着手 |

---

## 解決済みの問題

| 問題 | 修正 |
|------|------|
| ESM dotenv 読み込み順序 | `env.ts` に分離 |
| ffmpeg-static バイナリ不在 | システム ffmpeg へフォールバック |
| moduleResolution 不一致 | `NodeNext` に変更 |
| 相対パスストレージ | 絶対パス使用 |
| Orval生成コード + strict TS | api-client tsconfig で strict: false |
| Biome lint生成コード | biome.json で generated/** を除外 |
