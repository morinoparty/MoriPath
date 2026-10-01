# ディレクトリ配置規則

## ワークスペース構成

プロジェクトは pnpm ワークスペースで、`app` と `storybook` の 2 パッケージから構成されます。

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
- `app/wrangler.jsonc` — Cloudflare Workers 設定
- `app/panda.config.ts` — Panda CSS 設定

## `storybook/` — Storybook コンポーネントカタログ

- `storybook/.storybook/` — Storybook の設定・アドオン・シム
- `storybook/stories/` — Storybook のストーリーファイル
  - `components/` — 共通コンポーネントのストーリー
  - `routes/` — 各画面・ルートコンポーネントのストーリー
- `storybook/panda.config.ts` — Storybook 用 Panda CSS 設定

## `.github/`

- `workflows/` — GitHub Actions ワークフロー
  - `deploy-app.yml` — `main` ブランチ push 時の本番デプロイ
  - `preview.yml` — PR 作成・更新時のプレビュー環境デプロイ
