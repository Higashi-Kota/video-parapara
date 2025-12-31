# Video Frame Extractor - 要件定義・機能定義

## 1. 概要

### 1.1 プロジェクト概要
動画ファイルから一定間隔（デフォルト1秒）でフレーム画像を抽出し、パラパラ漫画のような連続画像として出力するWebアプリケーション。

### 1.2 ターゲットユーザー
- 動画編集者
- コンテンツクリエイター
- 教育関係者（動画を静止画教材に変換）
- アニメーション作成者

## 2. 機能要件

### 2.1 動画アップロード機能 (F-001)

| ID | 機能 | 優先度 |
|----|------|--------|
| F-001-01 | ドラッグ&ドロップでの動画アップロード | 高 |
| F-001-02 | ファイル選択ダイアログからのアップロード | 高 |
| F-001-03 | 対応フォーマット: MP4, WebM, MOV, AVI | 高 |
| F-001-04 | アップロード進捗表示 | 中 |
| F-001-05 | ファイルサイズ制限（設定可能） | 中 |
| F-001-06 | 動画メタデータの表示（解像度、時間、FPS） | 中 |

### 2.2 フレーム抽出機能 (F-002)

| ID | 機能 | 優先度 |
|----|------|--------|
| F-002-01 | 1秒間隔でのフレーム抽出 | 高 |
| F-002-02 | 抽出間隔のカスタマイズ（0.5秒〜10秒） | 中 |
| F-002-03 | 出力フォーマット選択（PNG, JPEG, WebP） | 中 |
| F-002-04 | 画質設定（JPEG: 1-100） | 低 |
| F-002-05 | 出力解像度の指定（オリジナル/リサイズ） | 低 |
| F-002-06 | 抽出範囲の指定（開始〜終了時間） | 低 |

### 2.3 プレビュー機能 (F-003)

| ID | 機能 | 優先度 |
|----|------|--------|
| F-003-01 | 抽出したフレームのサムネイル一覧表示 | 高 |
| F-003-02 | フレームの拡大表示 | 中 |
| F-003-03 | フレームのタイムスタンプ表示 | 中 |
| F-003-04 | パラパラ漫画風プレビュー再生 | 低 |

### 2.4 ダウンロード機能 (F-004)

| ID | 機能 | 優先度 |
|----|------|--------|
| F-004-01 | 全フレームをZIPでダウンロード | 高 |
| F-004-02 | 個別フレームのダウンロード | 中 |
| F-004-03 | 選択したフレームのみダウンロード | 低 |
| F-004-04 | ファイル名のカスタマイズ | 低 |

### 2.5 ジョブ管理機能 (F-005)

| ID | 機能 | 優先度 |
|----|------|--------|
| F-005-01 | 抽出ジョブの進捗表示 | 高 |
| F-005-02 | ジョブのキャンセル | 中 |
| F-005-03 | 複数動画の同時処理（キュー管理） | 低 |
| F-005-04 | ジョブ履歴の保存 | 低 |

## 3. 非機能要件

### 3.1 パフォーマンス
- 動画アップロード: 100MB未満のファイルで30秒以内
- フレーム抽出: 1分の動画で60フレーム抽出を10秒以内
- UI応答時間: 100ms以内

### 3.2 セキュリティ
- アップロードファイルの検証（MIMEタイプ、拡張子）
- 一時ファイルの自動削除（24時間後）
- CORS設定による適切なオリジン制限

### 3.3 ブラウザ対応
- Chrome (最新2バージョン)
- Firefox (最新2バージョン)
- Safari (最新2バージョン)
- Edge (最新2バージョン)

### 3.4 アクセシビリティ
- WCAG 2.1 AA準拠
- キーボードナビゲーション対応
- スクリーンリーダー対応

## 4. 技術要件

### 4.1 フロントエンド
- React 19
- TypeScript 5.9 (strict mode)
- Vite 7
- Tailwind CSS 4
- Biome 2 (linter/formatter)

### 4.2 バックエンド
- Node.js 24
- Express 5
- TypeScript 5.9
- FFmpeg (動画処理)

### 4.3 API仕様
- TypeSpec で定義
- OpenAPI 3.0 形式で出力
- RESTful API設計

### 4.4 インフラ
- Docker対応
- GitHub Actions CI/CD
- Render.com デプロイ対応

## 5. 画面一覧

| ID | 画面名 | 説明 |
|----|--------|------|
| S-001 | トップページ | 動画アップロードエリア |
| S-002 | 抽出設定画面 | 抽出オプションの設定 |
| S-003 | 進捗画面 | 抽出ジョブの進捗表示 |
| S-004 | 結果画面 | 抽出結果のプレビューとダウンロード |

## 6. API一覧

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | /api/videos | 動画アップロード |
| GET | /api/videos | 動画一覧取得 |
| GET | /api/videos/:id | 動画情報取得 |
| DELETE | /api/videos/:id | 動画削除 |
| POST | /api/extract | フレーム抽出開始 |
| GET | /api/extract/:jobId | ジョブ状態取得 |
| DELETE | /api/extract/:jobId | ジョブキャンセル |
| GET | /api/frames | フレーム一覧取得 |
| GET | /api/frames/download | ZIPダウンロード |

## 7. データモデル

### 7.1 Video
```typescript
interface Video {
  id: string
  filename: string
  mimeType: string
  size: number
  duration: number
  width: number
  height: number
  frameRate: number
  uploadedAt: string
}
```

### 7.2 Frame
```typescript
interface Frame {
  frameNumber: number
  timestamp: number
  url: string
  width: number
  height: number
  format: 'png' | 'jpeg' | 'webp'
}
```

### 7.3 ExtractionJob
```typescript
interface ExtractionJob {
  id: string
  videoId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  options: ExtractionOptions
  totalFrames?: number
  extractedFrames?: number
  frames?: Frame[]
  error?: string
  createdAt: string
  completedAt?: string
}
```

## 8. 今後の拡張予定

- [ ] ブラウザ側でのフレーム抽出（WebCodecs API）
- [ ] バッチ処理（複数動画の一括処理）
- [ ] クラウドストレージ連携（S3, R2）
- [ ] ユーザー認証・履歴管理
