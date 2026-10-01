# コーディングプラクティス

## 実装手順

1. **型設計**
   - まず型 (interface / type) を定義 (`app/src/types/` またはルート配下の `-types/`)

2. **純粋関数から実装**
   - 外部依存のない関数やヘルパーを先に実装 (`-functions/` など)

## プラクティス

- 小さく始めて段階的に拡張
- 過度な抽象化を避ける
- コードよりも型を重視
- 複雑さに応じてアプローチを調整

## コードスタイル（共通）

- 常に既存コードの設計や記法を参考にしてください。
- 書籍「リーダブルコード」のようなベストプラクティスを常に適用してください。
- コードの意図・背景などのコメントを各行に日本語で積極的に入れてください。
- ファイルの命名規則には kebab-case を使用してください。
- コードを書いた後は、Biome のチェック (`pnpm check`) およびビルドが通ることを確認してください。
- 作業後に勝手に開発サーバーの起動 (`pnpm dev` 等) やデプロイ (`pnpm deploy`) は行わないでください。

## フロントエンド (`app/src/`, `storybook/`, TypeScript / React)

- 関数コンポーネントと Hooks を使用してください（クラスコンポーネントは使用しない）。
- サーバー状態管理には TanStack Query (`useQuery` / `useMutation`) を使用してください。グローバルな props バケツリレーは避けてください。
- UI コンポーネントは Chlorophyll (`@morinoparty/chlorophyll-react`) および Ark UI プリミティブをベースに構築してください。
- Chlorophyll に該当コンポーネントが存在しない場合は、Ark UI + Panda CSS で実装してください。また、Chlorophyll 側にもあったほうがよい汎用的なコンポーネントの場合は、[Chlorophyll](https://github.com/morinoparty/chlorophyll) に Issue を立ててください。
- スタイリングは Panda CSS を使用し、スロットレシピには `sva()`、単一コンポーネントのレシピには `cva()` または `css()` を使用してください。
- 色やスペースなどの値は直接ハードコードせず、Morino Party のカラートークン（Chlorophyll / BaseToken）を活用してください。
- アイコンは `lucide-react` を使用してください。
- 1コンポーネントにつき1ディレクトリまたは1ファイルとし、コンポーネント名とファイル名を一致させてください。

## サーバー処理 / API (`app/src/routes/**/-api/`, `app/src/lib/server-functions/`)

- TanStack Start の Server Functions (`createServerFn()`) を活用してクライアント・サーバー間の安全な通信を実装してください。
- ユーザーセッションの確認や認証保護には `authMiddleware` や Better Auth API を使用してください。
- 入力値の検証には Zod を使用してください。

## ビルド・確認コマンド

- 依存関係のインストール: `pnpm install`
- Web アプリの開発起動: `pnpm dev`
- Storybook の開発起動: `pnpm dev:storybook`
- 両方を同時起動: `pnpm dev:all`
- Biome チェック & 自動修正: `pnpm check`
- 全体ビルド (Storybook + Web アプリ): `pnpm build`
- Storybook 単体ビルド: `pnpm build:storybook`
- Web アプリのローカルプレビュー: `cd app && pnpm preview`
- Cloudflare 型定義生成: `pnpm cf-typegen`