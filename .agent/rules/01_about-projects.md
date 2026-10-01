## このアプリケーションの概要

「MoriPath」は、Minecraft サーバーネットワーク「Morino Party（森のパーティ）」の公式 Web ポータルおよびプレイヤーダッシュボードです。
プレイヤーのステータス閲覧、MineAuth を利用した安全な Minecraft 認証、経済（Vault）および土地保護（Claim）の管理、サーバー全体のリアルタイム稼働状況の確認などを提供します。

## 主な機能

- **プレイヤーダッシュボード**: プレイヤープロファイル、統計情報、ゲーム内ステータスの閲覧
- **Minecraft 認証**: MineAuth (OAuth2 / OpenID Connect) による安全な認証とセッション管理
- **経済・保護**: Vault 残高の確認、土地保護境界の確認、Web からの保護ブロック購入
- **サーバー稼働状況**: ネットワーク全体のオンラインプレイヤー数やアクティブサーバー状態の監視
- **Storybook 同梱**: `/storybook` 配下に同梱された UI コンポーネントカタログ
- **Edge レンダリング**: Cloudflare Workers 上での高速な SSR とエッジ実行

## 主な技術スタック

### Web アプリケーション本体 (`app/`)

- **TanStack Start / TanStack Router** — SSR およびファイルベースルーティングを備えたフルスタック React フレームワーク
- **React 19 / TypeScript 5.9** — フロントエンド UI と型安全な実装
- **Cloudflare Workers (`cf` CLI / workerd)** — エッジサーバーレスランタイム
- **Vite 7** — 高速なフロントエンドビルドツール
- **TanStack Query** — 非同期データフェッチおよびサーバー状態管理
- **Chlorophyll (`@morinoparty/chlorophyll-react`)** — Morino Party 公式デザインシステムコンポーネントライブラリ
- **Ark UI / Panda CSS** — ヘッドレス UI プリミティブおよびゼロランタイム CSS-in-JS
- **Better Auth** — MineAuth OIDC プロバイダと統合された認証フレームワーク
- **Biome** — 高速な Linter & Formatter

### コンポーネントカタログ (`storybook/`)

- **Storybook 10** — UI コンポーネントカタログとアクセシビリティ確認 (`@moripath/storybook`)
- **Chlorophyll / Panda CSS / Ark UI** — アプリ本体と共通のデザインシステムを活用

### インフラ・CI

- **Cloudflare Workers** — `cf deploy` による高速エッジデプロイ
- **GitHub Actions** — `main` ブランチへの push による自動デプロイ、PR プレビュー環境の自動構築
- **pnpm ワークスペース** — `app` と `storybook` の 2 パッケージ構成