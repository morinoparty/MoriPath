# Version Control

- ブランチを切る際は main ブランチから切り、プルリクエストは必ず main ブランチに対して行うこと
- 作業を始める前に、main ブランチの最新の状態を取り込んでからブランチを切って作業すること
- また、push や PR を作成する前に確認すること
- 別の作業があったとしても、できるだけすべてのファイルをステージングの対象とすること

## Repository
- [MoriPath](https://github.com/morinoparty/MoriPath)
- [Chlorophyll](https://github.com/morinoparty/chlorophyll) (デザインシステムコンポーネントライブラリ)

## コミットメッセージ
- コミットメッセージには gitmoji を使用し、以下のような形式で記述してください。

```
<emoji> <コミットの概要>
```

主な gitmoji の例:
- ✨ (`:sparkles:`): 新機能の追加
- 🐛 (`:bug:`): バグ修正
- 📝 (`:memo:`): ドキュメントの変更
- 💄 (`:lipstick:`): UI やスタイルの変更
- ♻️ (`:recycle:`): リファクタリング
- ⚡️ (`:zap:`): パフォーマンス改善
- 🧪 (`:test_tube:`): テストの追加・改善
- 🔧 (`:wrench:`): 設定ファイルやツールの変更
- 📦 (`:package:`): 依存関係の追加・更新
- 🚀 (`:rocket:`): デプロイ関連の変更

例:
```
✨ Add claim block purchase modal
🐛 Fix session validation on route change
📦 Update @morinoparty/chlorophyll-react to 0.4.4
```

## Issueについて

- 新しい機能を追加する場合は、Issue を作成してください。
- Issue は英語で書き、適切なラベルを追加してください。
- 現状存在しないラベルについては、勝手に作成しないでください。
- どうしても必要である場合は、ユーザーに相談してください。
- **Chlorophyll への Issue 起票:**
  - Chlorophyll に存在しないコンポーネントを Ark UI + Panda CSS で実装した際、デザインシステム側にも共通コンポーネントとしてあったほうがよいと思われる場合は、[Chlorophyll リポジトリ](https://github.com/morinoparty/chlorophyll) に Issue を起票してください。

## PRについて

- PR の本文は日本語で書いて、変更内容と動作確認結果を記載してください。
- PR のタイトルもコミットメッセージと同様に gitmoji で始まる形式（例: `✨ ...`, `🐛 ...`, `🔧 ...`）にしてください。

例:
```
✨ 土地保護ブロック購入モーダルの追加
```
