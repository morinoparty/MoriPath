# 推奨される書き方

## 状態管理 (TanStack Query / TanStack Router)

- サーバー状態は TanStack Query (`useQuery` / `useMutation`) で管理してください。
- 画面遷移や URL 状態は TanStack Router (`useNavigate`, `useSearch`, `useParams`) を活用してください。
- ローカルな UI 状態は `useState` や Ark UI の内部ステートマシンで十分な場合は無理にグローバル化しないでください。

## スタイリング (Panda CSS & Chlorophyll)

- スタイルの記述には Panda CSS を使用してください。
- 複数パーツを持つコンポーネントにはスロットレシピ (`sva`)、単一コンポーネントのバリアントにはレシピ (`cva`) を使用してください。
- カラーやスペーシングは直接指定せず、Chlorophyll および Morino Party BaseToken の semantic token を使用してください。
- Figma 等のデザインを参照する場合でも、カラーコードを直書きせず既存のトークン（例: `colorPalette.bg`, `var(--chakra-colors-...)`）へのマッピングを優先してください。

## コンポーネント設計 (Compound Component & Ark UI)

- コンポーネントは Compound Component パターンに従って柔軟かつ再利用可能に設計してください。
- アクセシビリティを確保するため、Ark UI のヘッドレスプリミティブと Chlorophyll のデザインシステムを活用してください。
- 新しいコンポーネントを作成した際は、`storybook/stories/` に対応する `*.stories.tsx` を追加し、Storybook 上で表示・動作確認できるようにしてください。

## サーバー処理 / セキュリティ

- クライアント・サーバー間のデータやり取りには TanStack Start の Server Functions (`createServerFn()`) を使用してください。
- 認証が必要な処理には `authMiddleware` や Better Auth のセッション検証を必ず適用してください。
- 入力値の検証には Zod スキーマを使用し、型安全性とバリデーションを両立してください。

## コード品質 & Biome

- コミット前に必ず `pnpm check` を実行し、Linter / Formatter のチェックをパスさせてください。
- 未使用の import や変数、曖昧な `any` 型を放置しないでください。
