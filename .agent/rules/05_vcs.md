# Version Control

- push や PR を作成する前に確認すること
- 別の作業があったとしても、できるだけすべてのファイルをステージングの対象とすること

## Repository
- [MoriPath](https://github.com/morinoparty/MoriPath)
- [Chlorophyll](https://github.com/morinoparty/chlorophyll) (デザインシステムコンポーネントライブラリ)

## コミットメッセージ

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
📦 Update @morinoparty/chlorophyll-react to 0.4.4
```

## Issueについて

- **Chlorophyll への Issue 起票:**
  - Chlorophyll に存在しないコンポーネントを Ark UI + Panda CSS で実装した際、デザインシステム側にも共通コンポーネントとしてあったほうがよいと思われる場合は、[Chlorophyll リポジトリ](https://github.com/morinoparty/chlorophyll) に Issue を起票してください。

## PRについて

- PR の本文は日本語で書いて、変更内容と動作確認結果を記載してください。

PR タイトルの例:
```
✨ 土地保護ブロック購入モーダルの追加
```
