# デプロイメントガイド

このドキュメントでは、AI Presentation Generatorをデプロイする方法を説明します。

## 📋 目次

1. [Vercelへのデプロイ（推奨）](#vercelへのデプロイ推奨)
2. [Dockerデプロイ](#dockerデプロイ)
3. [セルフホスティング](#セルフホスティング)
4. [環境変数の設定](#環境変数の設定)

---

## Vercelへのデプロイ（推奨）

Vercelは、Next.jsアプリケーションに最適化されたホスティングプラットフォームです。

### ステップ1: Vercelアカウント作成

1. [Vercel](https://vercel.com/) にアクセス
2. GitHubアカウントでサインアップ

### ステップ2: プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリ `slide_generator` を選択
3. 「Import」をクリック

### ステップ3: 環境変数の設定

「Environment Variables」セクションで以下を設定:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-... (オプション)
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/... (オプション)
```

### ステップ4: デプロイ

1. 「Deploy」をクリック
2. 数分でデプロイが完了します
3. 提供されたURLでアプリにアクセス可能

### カスタムドメインの設定

1. Vercelダッシュボードで「Settings」→「Domains」
2. カスタムドメインを追加
3. DNS設定を更新（Vercelが指示を表示）

---

## Dockerデプロイ

Dockerを使用してコンテナ化されたアプリをデプロイできます。

### Dockerfile

プロジェクトルートに `Dockerfile` を作成:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Composeの設定

`docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GOOGLE_APPS_SCRIPT_URL=${GOOGLE_APPS_SCRIPT_URL}
    restart: unless-stopped
```

### デプロイコマンド

```bash
# イメージをビルド
docker-compose build

# コンテナを起動
docker-compose up -d

# ログを確認
docker-compose logs -f
```

---

## セルフホスティング

VPSやオンプレミスサーバーでホスティングする場合。

### 前提条件

- Node.js 18以上
- PM2（プロセス管理）
- Nginx（リバースプロキシ）

### ステップ1: アプリケーションのセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/Meguroman1978/slide_generator.git
cd slide_generator

# 依存関係をインストール
npm ci

# ビルド
npm run build
```

### ステップ2: PM2でプロセス管理

```bash
# PM2をグローバルインストール
npm install -g pm2

# アプリケーションを起動
pm2 start npm --name "presentation-generator" -- start

# 起動時に自動起動
pm2 startup
pm2 save
```

### ステップ3: Nginxリバースプロキシ

`/etc/nginx/sites-available/presentation-generator`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

有効化:

```bash
sudo ln -s /etc/nginx/sites-available/presentation-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### ステップ4: SSL証明書（Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 環境変数の設定

### 必須の環境変数

```env
# OpenAI API（必須）
OPENAI_API_KEY=sk-proj-...

# Next.js設定
NODE_ENV=production
```

### オプションの環境変数

```env
# Anthropic API（代替AIプロバイダー）
ANTHROPIC_API_KEY=sk-ant-...

# Google Apps Script（Google Slides生成）
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/...

# カスタムAPI URL
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api
```

### 環境変数の管理

#### Vercel

Vercelダッシュボード → Settings → Environment Variables

#### Docker

`.env` ファイルまたは `docker-compose.yml` で設定

#### セルフホスティング

```bash
# PM2 ecosystem設定
pm2 ecosystem

# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'presentation-generator',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      OPENAI_API_KEY: 'sk-...',
    }
  }]
}
```

---

## パフォーマンス最適化

### 1. キャッシング

Next.jsは自動的に静的リソースをキャッシュします。

### 2. CDN設定

Vercelは自動的にCDNを提供します。

セルフホスティングの場合、Cloudflareなどを検討。

### 3. 画像最適化

Next.js Image コンポーネントを使用（既に実装済み）。

### 4. API レート制限

OpenAI APIの使用量を監視し、必要に応じてレート制限を実装。

---

## モニタリングとログ

### Vercel

- 自動的にログとアナリティクスを提供
- ダッシュボードで確認可能

### PM2

```bash
# ログを確認
pm2 logs presentation-generator

# モニタリング
pm2 monit

# リアルタイムダッシュボード
pm2 plus
```

### エラー追跡

Sentry などのエラー追跡サービスの統合を推奨。

---

## トラブルシューティング

### ビルドエラー

```bash
# キャッシュをクリア
rm -rf .next node_modules
npm install
npm run build
```

### APIエラー

1. 環境変数が正しく設定されているか確認
2. APIキーが有効か確認
3. ログでエラーメッセージを確認

### パフォーマンス問題

1. Node.jsのバージョンを確認（18以上）
2. メモリ使用量を監視
3. データベース接続（将来的に追加の場合）

---

## セキュリティのベストプラクティス

1. **HTTPS必須**: 本番環境では必ずHTTPSを使用
2. **環境変数の保護**: `.env` ファイルをGitにコミットしない
3. **CORS設定**: 必要なオリジンのみ許可
4. **レート制限**: API エンドポイントにレート制限を実装
5. **定期的な更新**: 依存関係を定期的に更新

---

## バックアップとリストア

### データベース（将来的に追加の場合）

```bash
# バックアップ
pg_dump database_name > backup.sql

# リストア
psql database_name < backup.sql
```

### 設定ファイル

重要な設定ファイルは定期的にバックアップ。

---

## スケーリング

### 垂直スケーリング

- サーバーのリソース（CPU、メモリ）を増強

### 水平スケーリング

- 複数のインスタンスをロードバランサーで分散
- Vercelは自動的にスケーリング

---

## サポート

デプロイに関する問題は、[GitHub Issues](https://github.com/Meguroman1978/slide_generator/issues) でお知らせください。

---

最終更新: 2024年11月
