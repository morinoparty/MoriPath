# ディレクトリ配置規則

## ワークスペース構成

プロジェクトは pnpm ワークスペースで、`app` と `storybook` の 2 パッケージから構成されます。

- `vite.config.ts` (ルート) — Vite+ の整形 (`fmt`)・lint (`lint`)・タスク (`run`、Storybook ビルドのキャッシュ) の設定
- `pnpm-workspace.yaml` — ワークスペース定義と、Vite+ のバージョンを一元管理する `catalog`

## `app/` — Web アプリケーション本体

- `app/src/` — アプリケーションのソースコード
  - `components/` — 全体で利用する共通コンポーネント（フラットにディレクトリを作成し、`index.tsx` を配置）
    - `ui/` — 汎用 UI プリミティブ（Provider, Palette, ColorMode など）
  - `routes/` — TanStack Start のファイルベースルーティング
    - `__root.tsx` — ルートレイアウト・メタ情報
    - 各ルート配下のサブディレクトリ規則:
      - `-components/`: ルート固有の UI コンポーネント
      - `-api/`: ルート内で使用する API 通信・Server Functions
      - `-types/`: ルート固有の型定義
      - `-functions/`: ルート固有の純粋関数・ユーティリティ
  - `lib/` — 認証設定 (`auth.ts`, `auth-middleware.ts`)、共通 Server Functions (`server-functions/`)、プレイヤーヘルパーなど
  - `types/` — アプリケーション全体の共有型定義
  - `style/` — グローバル CSS (`app.css`)
- `app/cloudflare.config.ts` — Cloudflare Workers 設定 (`cf` CLI)
- `app/panda.config.ts` — Panda CSS 設定

## `storybook/` — Storybook コンポーネントカタログ

- `storybook/.storybook/` — Storybook の設定・アドオン・シム
- `storybook/stories/` — Storybook のストーリーファイル
  - `components/` — 共通コンポーネントのストーリー
  - `routes/` — 各画面・ルートコンポーネントのストーリー
- `storybook/panda.config.ts` — Storybook 用 Panda CSS 設定

## `.github/`

- `workflows/` — GitHub Actions ワークフロー
  - `deploy.yml` — PR・`main` への push・手動実行でのチェックとビルド。`main` への push で本番デプロイ、PR では preview 用の Worker Version を upload して URL をコメント
