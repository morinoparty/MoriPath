# Version Control

- ブランチを切る際は main ブランチから切り、プルリクエストは必ず main ブランチに対して行うこと
- 作業を始める前に、main ブランチの最新の状態を取り込んでからブランチを切って作業すること
- また、push や PR を作成する前に確認すること
- 別の作業があったとしても、できるだけすべてのファイルをステージングの対象とすること

## Repository
- [MoriPath](https://github.com/morinoparty/MoriPath)

## コミットメッセージ
- コミットメッセージは Conventional Commits の形式に従い、プレフィックスを付けて記述してください。

```
<type>: <subject>
```

主な type:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントの変更
- `style`: コードの動作に影響しないフォーマット等の変更
- `refactor`: リファクタリング
- `perf`: パフォーマンス改善
- `test`: テストの追加・修正
- `chore`: ビルドツールや補助ツールの変更、依存関係の更新

例:
```
feat: MineAuth に要求する scope に plugin を追加
fix: secrets アップロードを deploy 後に移動しデプロイ失敗を解消
chore: @morinoparty/chlorophyll-react を 0.4.4 に更新
```

## Issueについて

- 新しい機能を追加する場合は、Issue を作成してください。
- Issue は英語で書き、適切なラベルを追加してください。
- 現状存在しないラベルについては、勝手に作成しないでください。
- どうしても必要である場合は、ユーザーに相談してください。

## PRについて

- PR の本文は日本語で書いて、変更内容と動作確認結果を記載してください。
- PR のタイトルも Conventional Commits の形式（例: `feat: ...`, `fix: ...`）にしてください。
